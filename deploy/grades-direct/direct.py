#!/usr/bin/env python3
"""Take the Netlify relay out of the live Grades Worker ("gradebook") if Cloudflare can reach Canvas again.

The relay (grades-canvas-relay.netlify.app) ran out of Netlify's free monthly usage and answers every request
with 503 "Usage exceeded", so Grades can't load anything from Canvas. The relay only exists because UWM used to
answer 406 to every request from Cloudflare. This script:

  1. Probes: uploads a throwaway Worker (grades-canvas-probe) with the same placement as Grades, has it call
     UWM's Canvas without a token, and reads the status codes. 401 = Canvas is reachable; 406 = still blocked.
     The probe Worker is deleted afterwards either way. (Oct 13 2026: 401 with a browser User-Agent, 403 without.)
  2. Only if Canvas answered 401 to a request with a browser User-Agent: uploads the exact live Worker again with
     the CANVAS_RELAY binding removed and that User-Agent added to the direct Canvas fetch, nothing else changed
     (same other modules, bindings, secrets, placement, release title, so no "App updated" notification goes
     out), sends all traffic to it, checks the live site and settings, and rolls back if anything is off.

Standard library only. Needs CLOUDFLARE_API_TOKEN ("Edit Cloudflare Workers"). Binding values, the token and the
account id stay out of the log.
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import uuid

SCRIPT = "gradebook"
PROBE = "grades-canvas-probe"
SITE = "https://gradebook.alexpeterson443.workers.dev"
API = "https://api.cloudflare.com/client/v4"
DROP = "CANVAS_RELAY"
SECRET_TYPES = {"secret_text", "secret_key"}
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
# The direct Canvas fetch in the live entry module: Bearer token then accept, with no User-Agent (the relay fetch
# has x-relay-secret in between, so it doesn't match). Instructure now answers 403 to requests without one.
DIRECT_FETCH = re.compile(rb'(headers:\s*\{\s*authorization:\s*`Bearer \$\{env\.CANVAS_TOKEN\}`,\s*accept:\s*"application/json")(,?)((?:\s*//[^\n]*)*\s*\})')
UA_MARKER = b'"user-agent": "' + BROWSER_UA.encode() + b'"'
TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
PROBE_ONLY = os.environ.get("PROBE_ONLY") == "1"

PROBE_JS = r"""
const CANVAS = "https://uwmil.instructure.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
export default {
  async fetch(request) {
    const tests = {
      api_no_ua: [`${CANVAS}/api/v1/users/self/profile`, { accept: "application/json" }],
      api_browser_ua: [`${CANVAS}/api/v1/users/self/profile`, { accept: "application/json", "user-agent": UA }],
      login_no_ua: [`${CANVAS}/login/canvas`, {}],
    };
    const out = { colo: request.cf?.colo || null };
    for (const [name, [url, headers]] of Object.entries(tests)) {
      try {
        const res = await fetch(url, { headers, redirect: "manual" });
        out[name] = res.status;
      } catch (err) {
        out[name] = String(err).slice(0, 120);
      }
    }
    return Response.json(out, { headers: { "cache-control": "no-store" } });
  },
};
"""


def fail(msg):
    print(f"::error::{msg}")
    sys.exit(1)


def call(method, path, body=None, headers=None, soft=False):
    where = path.split("/workers/")[-1].split("?")[0]
    req = urllib.request.Request(f"{API}{path}", data=body, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            out = json.loads(res.read())
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


def get_url(url):
    req = urllib.request.Request(url, headers={"cache-control": "no-cache", "user-agent": "grades-deploy-check"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, res.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 0, str(e).encode()


def placement_of(version):
    p = (version.get("resources", {}).get("script") or {}).get("placement") or {}
    targets = sorted((t.get("type"), t.get("hostname") or t.get("host") or t.get("region")) for t in p.get("target") or [])
    return (p.get("mode"), targets) if p else None


def download(base):
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


def parse_multipart(body, content_type):
    boundary = None
    for piece in content_type.split(";"):
        piece = piece.strip()
        if piece.lower().startswith("boundary="):
            boundary = piece.split("=", 1)[1].strip('"')
    if not boundary:
        fail(f"No boundary in the Worker download ({content_type})")
    parts = []
    for chunk in body.split(b"--" + boundary.encode())[1:]:
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
    out = [f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n'.encode(),
           json.dumps(metadata).encode() + b"\r\n"]
    for name, data in modules:
        out.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{name}"\r\n'
                   f"Content-Type: {content_type_for(name, main)}\r\n\r\n".encode())
        out.append(data + b"\r\n")
    out.append(f"--{boundary}--\r\n".encode())
    return b"".join(out), f"multipart/form-data; boundary={boundary}"


def script_settings(base):
    s = call("GET", f"{base}/settings")
    return {k: s.get(k) for k in ("observability", "logpush", "tail_consumers", "compatibility_date", "compatibility_flags", "usage_model", "limits")}


def binding_shape(bindings):
    return sorted((b.get("name"), b.get("type")) for b in bindings)


def find_account():
    for acct in call("GET", "/accounts?per_page=50"):
        scripts = call("GET", f"/accounts/{acct['id']}/workers/scripts")
        if any(s.get("id") == SCRIPT for s in scripts):
            return acct["id"]
    fail(f"No Worker named {SCRIPT} on any account this token can see.")


def probe(account, placement_forms):
    """Status codes UWM's Canvas gives a Cloudflare Worker placed like Grades."""
    base = f"/accounts/{account}/workers/scripts/{PROBE}"
    modules = [("probe.js", PROBE_JS.encode())]
    uploaded = False
    for form in placement_forms + [None]:
        meta = {"main_module": "probe.js", "compatibility_date": "2026-09-01"}
        if form:
            meta["placement"] = form
        payload, ctype = build_multipart(meta, modules, "probe.js")
        if call("PUT", base, body=payload, headers={"content-type": ctype}, soft=True) is not None:
            print(f"Probe Worker uploaded with placement {form}.")
            uploaded = True
            break
    if not uploaded:
        fail("Couldn't upload the probe Worker.")
    try:
        call("POST", f"{base}/subdomain", body=json.dumps({"enabled": True, "previews_enabled": False}).encode(),
             headers={"content-type": "application/json"})
        sub = call("GET", f"/accounts/{account}/workers/subdomain")["subdomain"]
        url = f"https://{PROBE}.{sub}.workers.dev/"
        results = []
        for attempt in range(18):
            time.sleep(10)
            status, body = get_url(url)
            if status != 200:
                print(f"  probe not answering yet ({attempt + 1}/18): {status}")
                continue
            try:
                results.append(json.loads(body))
            except ValueError:
                print(f"  probe gave non-JSON: {body[:200]!r}")
                continue
            print(f"  probe run {len(results)}: {json.dumps(results[-1])}")
            if len(results) >= 3:
                break
        return results
    finally:
        call("DELETE", f"{base}?force=true", soft=True)
        print("Probe Worker deleted.")


def main():
    if not TOKEN:
        fail("CLOUDFLARE_API_TOKEN is not set for this workflow.")
    account = find_account()
    base = f"/accounts/{account}/workers/scripts/{SCRIPT}"
    print(f"Found the {SCRIPT} Worker.")

    deployments = call("GET", f"{base}/deployments")["deployments"]
    live = deployments[0]
    if len(live["versions"]) != 1 or live["versions"][0]["percentage"] != 100:
        fail("The live deployment is split across versions; not touching it.")
    prev_version = live["versions"][0]["version_id"]
    prev = call("GET", f"{base}/versions/{prev_version}")
    prev_bindings = prev["resources"]["bindings"]
    prev_runtime = prev["resources"].get("script_runtime", {})
    live_placement = placement_of(prev)
    raw_placement = (prev["resources"].get("script") or {}).get("placement") or {}
    hostnames = [t.get("hostname") for t in raw_placement.get("target") or [] if t.get("hostname")]
    forms = [{"hostname": hostnames[0]}, {"mode": raw_placement.get("mode"), "hostname": hostnames[0]}, raw_placement] if hostnames else []
    print(f"Live version: {prev_version}; placement {live_placement}; bindings: {', '.join(n for n, _ in binding_shape(prev_bindings))}")

    # 1. Can a Cloudflare Worker reach UWM's Canvas now?
    results = probe(account, forms)
    if not results:
        fail("The probe Worker never answered; nothing changed.")
    direct_ok = all(r.get("api_browser_ua") == 401 for r in results)
    print(f"Canvas from Cloudflare with a browser User-Agent: {'reachable (401)' if direct_ok else 'blocked or failing'}")
    if not direct_ok:
        fail(f"UWM's Canvas still doesn't answer Cloudflare normally ({[r.get('api_browser_ua') for r in results]}); left Grades as it is.")
    if not any(b.get("name") == DROP for b in prev_bindings):
        print(f"The live Worker has no {DROP} binding; it already calls Canvas directly. Nothing to change.")
        return
    if PROBE_ONLY:
        print("PROBE_ONLY=1: not changing Grades.")
        return

    # 2. Same Worker, minus the relay setting
    listed = call("GET", f"{base}/versions")
    listed = listed.get("items", []) if isinstance(listed, dict) else listed
    listed.sort(key=lambda v: (v.get("number") or 0, (v.get("metadata") or {}).get("created_on") or ""), reverse=True)
    if not listed or listed[0].get("id") != prev_version:
        fail(f"The newest upload isn't the deployed version {prev_version}; not deploying.")
    body, headers = download(base)
    modules = parse_multipart(body, headers.get("content-type", ""))
    main_module = headers.get("cf-entrypoint") or "index.js"
    if main_module not in [n for n, _ in modules]:
        fail(f"Entry point {main_module} isn't among the downloaded modules.")
    print(f"Downloaded the live Worker: {len(modules)} modules, entry point {main_module}.")
    entry_index = [n for n, _ in modules].index(main_module)
    entry = modules[entry_index][1]
    if UA_MARKER in entry:
        print("The direct Canvas fetch already sends the User-Agent.")
    else:
        matches = DIRECT_FETCH.findall(entry)
        if len(matches) != 1:
            at = entry.find(b"CANVAS_TOKEN}`")
            fail(f"Expected one direct Canvas fetch in {main_module}, found {len(matches)}; not deploying. Near the token: {entry[max(0, at - 200):at + 300]!r}")
        entry = DIRECT_FETCH.sub(lambda m: m.group(1) + b", " + UA_MARKER + m.group(3), entry)
        if len(DIRECT_FETCH.findall(entry)) != 0 or entry.count(UA_MARKER) != 1:
            fail("Adding the User-Agent didn't come out as expected; not deploying.")
        modules[entry_index] = (main_module, entry)
        print("Added a browser User-Agent to the direct Canvas fetch.")

    bindings = [dict(b) for b in prev_bindings if b.get("type") not in SECRET_TYPES and b.get("name") != DROP]
    metadata = {
        "main_module": main_module,
        "bindings": bindings,
        "keep_bindings": sorted(SECRET_TYPES),
        "compatibility_date": prev_runtime.get("compatibility_date"),
        "compatibility_flags": prev_runtime.get("compatibility_flags") or [],
        "annotations": {"workers/message": "Call Canvas directly (Netlify relay out of usage)"},
    }
    if prev_runtime.get("usage_model"):
        metadata["usage_model"] = prev_runtime["usage_model"]
    metadata = {k: v for k, v in metadata.items() if v is not None}

    schedules_before = call("GET", f"{base}/schedules")
    settings_before = script_settings(base)
    new_version = check = None
    for form in forms or [None]:
        meta = {**metadata, "placement": form} if form else metadata
        payload, ctype = build_multipart(meta, modules, main_module)
        new = call("POST", f"{base}/versions", body=payload, headers={"content-type": ctype}, soft=True)
        if not new:
            continue
        detail = call("GET", f"{base}/versions/{new['id']}")
        got = placement_of(detail)
        print(f"Uploaded version {new['id']} (not live) -> placement {got}")
        if got == live_placement:
            new_version, check = new["id"], detail
            break
    if not new_version:
        fail("No upload kept the live placement. Nothing was deployed.")

    expected = [s for s in binding_shape(prev_bindings) if s[0] != DROP]
    if binding_shape(check["resources"]["bindings"]) != expected:
        fail(f"Bindings aren't live minus {DROP}: {binding_shape(check['resources']['bindings'])}. Not deploying.")
    new_runtime = check["resources"].get("script_runtime", {})
    for key in ("compatibility_date", "compatibility_flags", "usage_model"):
        if (prev_runtime.get(key) or None) != (new_runtime.get(key) or None):
            fail(f"{key} differs from live. Not deploying.")
    print(f"New version matches live except {DROP} is gone.")

    def route_to(version_id, message):
        call("POST", f"{base}/deployments", headers={"content-type": "application/json"},
             body=json.dumps({"strategy": "percentage", "versions": [{"percentage": 100, "version_id": version_id}],
                              "annotations": {"workers/message": message}}).encode())

    me_before = get_url(f"{SITE}/api/me")
    route_to(new_version, "Call Canvas directly (Netlify relay out of usage)")
    print("Deployed. Checking...")

    problems = []
    for attempt in range(9):
        time.sleep(10)
        problems = []
        if call("GET", f"{base}/schedules") != schedules_before:
            problems.append("cron schedules changed")
        settings_now = script_settings(base)
        if settings_now != settings_before:
            problems.append(f"Worker settings changed: {[k for k in settings_before if settings_before[k] != settings_now.get(k)]}")
        if [v["version_id"] for v in call("GET", f"{base}/deployments")["deployments"][0]["versions"]] != [new_version]:
            problems.append("the deployment isn't serving the new version")
        status, _ = get_url(f"{SITE}/?deployed={int(time.time())}")
        if status != 200:
            problems.append(f"/ answered {status}")
        me_after = get_url(f"{SITE}/api/me")
        if me_after[0] != me_before[0]:
            problems.append(f"/api/me changed: {me_before[0]} -> {me_after[0]}")
        for path in ("/sw.js", "/manifest.webmanifest"):
            if get_url(f"{SITE}{path}")[0] != 200:
                problems.append(f"{path} failed")
        if not problems:
            break
        print(f"  not yet ({attempt + 1}/9): {'; '.join(problems)}")
    if problems:
        print(f"::error::{'; '.join(problems)}. Rolling back to {prev_version}.")
        route_to(prev_version, "Rollback: live checks failed")
        fail("Rolled back to the previous version.")
    print(f"Live: version {new_version} calls Canvas directly. Previous version for rollback: {prev_version}")


if __name__ == "__main__":
    main()
