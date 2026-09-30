#!/usr/bin/env python3
"""One-off deploy of a page change to the live Grades Worker ("gradebook").

The Grades source on GitHub is behind what's live, so this doesn't build from
source. It takes the exact Worker that is deployed right now, swaps in the
patched page, and publishes that as a new version:

  1. Download the live Worker and refuse to go on unless its page is the one
     the patch was made and tested against.
  2. Apply the patch and check the result byte-for-byte against the tested page.
  3. Upload it as a new version (not live yet) with the same bindings. Secrets
     are kept as they are; only RELEASE_TITLE / RELEASE_NOTES change.
  4. Compare the new version's bindings and runtime settings with the live
     one; stop if anything else differs.
  5. Send all traffic to the new version, then check the live site. If a check
     fails, send traffic back to the previous version and fail the run.

Standard library only. Needs CLOUDFLARE_API_TOKEN ("Edit Cloudflare Workers").
Nothing secret is printed: binding values, the token and the account id stay
out of the log.
"""

import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

SCRIPT = "gradebook"
SITE = "https://gradebook.alexpeterson443.workers.dev"
API = "https://api.cloudflare.com/client/v4"
HERE = os.path.dirname(os.path.abspath(__file__))
PATCH = os.path.join(HERE, "swipe-hide-recent.patch")
PAGE_BEFORE = "379416db71bf722b078146ef61bb3c4cab4579b7"  # live page the patch was made against (deployed 2026-09-29 18:09 UTC, with Inbox)
PAGE_AFTER = "c211047dca2a73344c73b3ab7de97e11df2f39c7"   # the patched page that was tested
RELEASE_TITLE = "New: swipe to hide"
RELEASE_NOTES = "Swipe left on a graded assignment in Recent to hide it from the list."
SECRET_TYPES = {"secret_text", "secret_key"}

TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")


def fail(msg):
    print(f"::error::{msg}")
    sys.exit(1)


def call(method, path, body=None, headers=None, raw=False, soft=False):
    """soft=True: report an API error and return None instead of stopping the run."""
    where = path.split("/workers/")[-1].split("?")[0]
    req = urllib.request.Request(f"{API}{path}", data=body, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            data = res.read()
            if raw:
                return data, res.headers
            out = json.loads(data)
    except urllib.error.HTTPError as e:
        msg = f"{method} {where} -> HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:800]}"
        if soft:
            print(f"  {msg}")
            return None
        fail(msg)
    if not out.get("success"):
        msg = f"{method} {where} failed: {json.dumps(out.get('errors'))[:800]}"
        if soft:
            print(f"  {msg}")
            return None
        fail(msg)
    return out["result"]


def placement_of(version):
    """A version's placement as (mode, sorted targets); it lives under resources.script."""
    p = (version.get("resources", {}).get("script") or {}).get("placement") or {}
    targets = sorted((t.get("type"), t.get("hostname") or t.get("host") or t.get("region")) for t in p.get("target") or [])
    return (p.get("mode"), targets) if p else None


def download(base):
    """The live Worker's modules as multipart: /content/v2, or the older script download as a fallback."""
    tried = []
    for path in (f"{base}/content/v2", base):
        req = urllib.request.Request(f"{API}{path}", method="GET")
        req.add_header("Authorization", f"Bearer {TOKEN}")
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                ctype = res.headers.get("content-type", "")
                if "multipart/form-data" in ctype:
                    return res.read(), res.headers
                tried.append(f"{path.split('/workers/')[-1]} gave {ctype or 'no content type'}")
        except urllib.error.HTTPError as e:
            tried.append(f"{path.split('/workers/')[-1]} -> HTTP {e.code}")
    fail(f"Couldn't download the live Worker: {'; '.join(tried)}")


def get_site(path):
    req = urllib.request.Request(f"{SITE}{path}", headers={"cache-control": "no-cache", "user-agent": "grades-deploy-check"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, res.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:  # network hiccup
        return 0, str(e).encode()


def sha1(b):
    return hashlib.sha1(b).hexdigest()


def parse_multipart(body, content_type):
    boundary = None
    for piece in content_type.split(";"):
        piece = piece.strip()
        if piece.lower().startswith("boundary="):
            boundary = piece.split("=", 1)[1].strip('"')
    if not boundary:
        fail(f"No boundary in the Worker download ({content_type})")
    delim = b"--" + boundary.encode()
    parts = []
    for chunk in body.split(delim)[1:]:
        if chunk.startswith(b"--"):
            break
        chunk = chunk[2:] if chunk.startswith(b"\r\n") else chunk
        head, _, data = chunk.partition(b"\r\n\r\n")
        if data.endswith(b"\r\n"):
            data = data[:-2]
        name = None
        for line in head.decode("utf-8", "replace").split("\r\n"):
            if line.lower().startswith("content-disposition"):
                for attr in line.split(";"):
                    attr = attr.strip()
                    if attr.startswith("name="):
                        name = attr[5:].strip('"')
        if name:
            parts.append((name, data))
    return parts


def content_type_for(name, main):
    if name == main or name.endswith((".js", ".mjs")):
        return "application/javascript+module"
    if name.endswith((".html", ".txt")):
        return "text/plain"
    return "application/octet-stream"


def build_multipart(metadata, modules, main):
    boundary = uuid.uuid4().hex
    out = []
    out.append(f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n'.encode())
    out.append(json.dumps(metadata).encode() + b"\r\n")
    for name, data in modules:
        out.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{name}"\r\n'
            f"Content-Type: {content_type_for(name, main)}\r\n\r\n".encode()
        )
        out.append(data + b"\r\n")
    out.append(f"--{boundary}--\r\n".encode())
    return b"".join(out), f"multipart/form-data; boundary={boundary}"


def script_settings(base):
    """Script-level settings a version upload must leave alone. Bindings and placement are per version and
    compared version to version instead (this endpoint describes the newest upload, not what's deployed)."""
    s = call("GET", f"{base}/settings")
    return {k: s.get(k) for k in ("observability", "logpush", "tail_consumers", "compatibility_date", "compatibility_flags", "usage_model", "limits")}


def binding_shape(bindings):
    """Names and types only (values never printed)."""
    return sorted((b.get("name"), b.get("type")) for b in bindings if b.get("name") not in ("RELEASE_TITLE", "RELEASE_NOTES"))


def main():
    if not TOKEN:
        fail("CLOUDFLARE_API_TOKEN is not set for this workflow.")

    # Which account holds the gradebook Worker
    account = None
    for acct in call("GET", "/accounts?per_page=50"):
        scripts = call("GET", f"/accounts/{acct['id']}/workers/scripts")
        if any(s.get("id") == SCRIPT for s in scripts):
            account = acct["id"]
            break
    if not account:
        fail(f"No Worker named {SCRIPT} on any account this token can see.")
    base = f"/accounts/{account}/workers/scripts/{SCRIPT}"
    print(f"Found the {SCRIPT} Worker.")

    # What's live now
    deployments = call("GET", f"{base}/deployments")["deployments"]
    live = deployments[0]
    if len(live["versions"]) != 1 or live["versions"][0]["percentage"] != 100:
        fail("The live deployment is split across versions; not touching it.")
    prev_version = live["versions"][0]["version_id"]
    prev = call("GET", f"{base}/versions/{prev_version}")
    prev_bindings = prev["resources"]["bindings"]
    prev_runtime = prev["resources"].get("script_runtime", {})
    print(f"Live version: {prev_version} ({len(prev_bindings)} bindings: {', '.join(n for n, _ in binding_shape(prev_bindings))})")
    schedules_before = call("GET", f"{base}/schedules")
    settings_before = script_settings(base)
    # Placement is per version: the live one runs next to Canvas. Stop if it can't be read rather than drop it.
    live_placement = placement_of(prev)
    print(f"Live placement: {live_placement}")
    if not live_placement:
        fail("Couldn't read the live version's placement. Not deploying.")
    me_before = get_site("/api/me")

    # The live code, exactly as deployed
    body, headers = download(base)
    modules = parse_multipart(body, headers.get("content-type", ""))
    main_module = headers.get("cf-entrypoint") or "index.js"
    names = [n for n, _ in modules]
    print(f"Downloaded {len(modules)} modules; entry point {main_module}.")
    if main_module not in names:
        fail(f"Entry point {main_module} isn't among the downloaded modules: {names}")
    pages = [(i, n) for i, (n, _) in enumerate(modules) if n.endswith("page.html")]
    if len(pages) != 1:
        fail(f"Expected one page module, found {[n for _, n in pages]}")
    page_index, page_name = pages[0]
    page = modules[page_index][1]
    if sha1(page) != PAGE_BEFORE:
        fail(f"The live page has changed since the patch was made (sha1 {sha1(page)}); not deploying over it.")

    # Patch it and make sure the result is exactly the page that was tested
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(os.path.join(tmp, "src"))
        with open(os.path.join(tmp, "src", "page.html"), "wb") as f:
            f.write(page)
        subprocess.run(["git", "init", "-q"], cwd=tmp, check=True)
        subprocess.run(["git", "apply", PATCH], cwd=tmp, check=True)
        with open(os.path.join(tmp, "src", "page.html"), "rb") as f:
            patched = f.read()
    if sha1(patched) != PAGE_AFTER:
        fail(f"The patched page isn't the one that was tested (sha1 {sha1(patched)}).")
    modules[page_index] = (page_name, patched)
    print("Patched page matches the tested page byte for byte.")

    # Same bindings as live, secrets carried over untouched, new release note
    bindings = [dict(b) for b in prev_bindings if b.get("type") not in SECRET_TYPES and b.get("name") not in ("RELEASE_TITLE", "RELEASE_NOTES")]
    bindings.append({"type": "plain_text", "name": "RELEASE_TITLE", "text": RELEASE_TITLE})
    bindings.append({"type": "plain_text", "name": "RELEASE_NOTES", "text": RELEASE_NOTES})
    metadata = {
        "main_module": main_module,
        "bindings": bindings,
        "keep_bindings": sorted(SECRET_TYPES),
        "compatibility_date": prev_runtime.get("compatibility_date"),
        "compatibility_flags": prev_runtime.get("compatibility_flags") or [],
        "annotations": {"workers/message": RELEASE_TITLE},
    }
    if prev_runtime.get("usage_model"):
        metadata["usage_model"] = prev_runtime["usage_model"]
    metadata = {k: v for k, v in metadata.items() if v is not None}

    # Upload with the live placement. The upload format is wrangler's config shape; try the forms it
    # could take until the stored version's placement matches live. Uploads aren't live, so a miss costs nothing.
    raw_placement = prev["resources"]["script"]["placement"]
    hostnames = [t.get("hostname") for t in raw_placement.get("target") or [] if t.get("hostname")]
    if not hostnames:
        fail("The live placement isn't a hostname hint; not guessing its upload form.")
    forms = [{"hostname": hostnames[0]}, {"mode": raw_placement.get("mode"), "hostname": hostnames[0]}, raw_placement]
    new_version = check = None
    for form in forms:
        payload, ctype = build_multipart({**metadata, "placement": form}, modules, main_module)
        new = call("POST", f"{base}/versions", body=payload, headers={"content-type": ctype}, soft=True)
        if not new:
            continue
        detail = call("GET", f"{base}/versions/{new['id']}")
        got = placement_of(detail)
        print(f"Uploaded version {new['id']} (not live) with placement form {sorted(form)} -> {got}")
        if got == live_placement:
            new_version, check = new["id"], detail
            break
    if not new_version:
        fail("No upload kept the live placement. Nothing was deployed.")
    print(f"Using version {new_version}: placement matches live.")

    # Before switching anything: the new version must look like the old one apart from the page
    new_bindings = check["resources"]["bindings"]
    new_runtime = check["resources"].get("script_runtime", {})
    if binding_shape(new_bindings) != binding_shape(prev_bindings):
        fail(f"Bindings differ from live: before {binding_shape(prev_bindings)} after {binding_shape(new_bindings)}. Not deploying.")
    for key in ("compatibility_date", "compatibility_flags", "usage_model"):
        if (prev_runtime.get(key) or None) != (new_runtime.get(key) or None):
            fail(f"{key} differs from live ({prev_runtime.get(key)} vs {new_runtime.get(key)}). Not deploying.")
    print("New version has the same bindings, secrets, compatibility settings and placement as live.")

    def route_to(version_id, message):
        call("POST", f"{base}/deployments", headers={"content-type": "application/json"},
             body=json.dumps({"strategy": "percentage", "versions": [{"percentage": 100, "version_id": version_id}],
                              "annotations": {"workers/message": message}}).encode())

    route_to(new_version, RELEASE_TITLE)
    print("Deployed. Checking settings, then the live site...")

    # Settings first, before anything loads the page (a page load is what sends the update notice)
    problems = []
    if call("GET", f"{base}/schedules") != schedules_before:
        problems.append("cron schedules changed")
    settings_now = script_settings(base)
    if settings_now != settings_before:
        changed = [k for k in set(settings_before) | set(settings_now) if settings_before.get(k) != settings_now.get(k)]
        problems.append(f"Worker settings changed: {changed}")
    serving = call("GET", f"{base}/deployments")["deployments"][0]["versions"]
    if [v["version_id"] for v in serving] != [new_version]:
        problems.append("the deployment isn't serving the new version")
    elif placement_of(call("GET", f"{base}/versions/{new_version}")) != live_placement:
        problems.append("the deployed version's placement isn't the live one")
    if problems:
        print(f"::error::{'; '.join(problems)}. Rolling back to {prev_version}.")
        route_to(prev_version, "Rollback: settings changed")
        fail("Rolled back to the previous version.")

    ok = False
    for attempt in range(12):
        time.sleep(10)
        problems = []
        status, html = get_site(f"/?deployed={int(time.time())}")
        if status != 200:
            problems.append(f"/ answered {status}")
        elif b"data-hide-recent" not in html:
            problems.append("/ is still serving the old page")
        me_after = get_site("/api/me")
        if me_after != me_before:
            problems.append(f"/api/me changed: {me_before[0]} {me_before[1][:200]!r} -> {me_after[0]} {me_after[1][:200]!r}")
        for path in ("/sw.js", "/manifest.webmanifest", "/icon-192.png", "/apple-touch-icon.png"):
            status, _ = get_site(path)
            if status != 200:
                problems.append(f"{path} answered {status}")
        if not problems:
            ok = True
            break
        print(f"  not yet ({attempt + 1}/12): {'; '.join(problems)}")

    if call("GET", f"{base}/schedules") != schedules_before:
        ok = False
        problems.append("cron schedules changed")
    settings_after = script_settings(base)
    if settings_after != settings_before:
        ok = False
        changed = [k for k in set(settings_before) | set(settings_after) if settings_before.get(k) != settings_after.get(k)]
        problems.append(f"Worker settings changed: {changed}")
    live_now = call("GET", f"{base}/deployments")["deployments"][0]["versions"]
    if [v["version_id"] for v in live_now] != [new_version]:
        ok = False
        problems.append("the deployment isn't serving the new version")

    if not ok:
        print(f"::error::Live checks failed: {'; '.join(problems)}. Rolling back to {prev_version}.")
        route_to(prev_version, "Rollback: live checks failed")
        fail("Rolled back to the previous version.")

    # A second load, like scripts/deploy.sh, so the update notice goes out now rather than on the next cron
    time.sleep(10)
    get_site(f"/?deployed={int(time.time())}")
    print(f"Live: version {new_version} is serving the swipe-to-hide page; bindings, secrets and crons unchanged.")
    print(f"Previous version for rollback: {prev_version}")


if __name__ == "__main__":
    main()
