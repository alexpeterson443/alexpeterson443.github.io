#!/usr/bin/env python3
"""Read-only: show where the gradebook Worker's placement lives (settings, versions, script list).

Prints no binding values, no token and no account id. Changes nothing.
"""

import json

import deploy as d


def shape(obj, depth=0):
    """Keys of a JSON object, with non-secret scalar values for placement/runtime fields."""
    if isinstance(obj, dict):
        return {k: (shape(v, depth + 1) if k != "bindings" else f"<{len(v)} bindings>") for k, v in obj.items()}
    if isinstance(obj, list):
        return [shape(v, depth + 1) for v in obj[:3]]
    return obj


def main():
    account = None
    for acct in d.call("GET", "/accounts?per_page=50"):
        scripts = d.call("GET", f"/accounts/{acct['id']}/workers/scripts")
        entry = next((s for s in scripts if s.get("id") == d.SCRIPT), None)
        if entry:
            account = acct["id"]
            print("script list entry (placement-related):", json.dumps({k: v for k, v in entry.items() if "placement" in k or k in ("modified_on", "usage_model")}))
            break
    base = f"/accounts/{account}/workers/scripts/{d.SCRIPT}"
    print("settings placement:", json.dumps(d.call("GET", f"{base}/settings").get("placement")))
    deployments = d.call("GET", f"{base}/deployments")["deployments"]
    print("active deployment:", json.dumps([(v["version_id"], v["percentage"]) for v in deployments[0]["versions"]]))
    versions = d.call("GET", f"{base}/versions?per_page=5")
    items = versions.get("items", versions) if isinstance(versions, dict) else versions
    for v in items[:4]:
        vid = v.get("id")
        detail = d.call("GET", f"{base}/versions/{vid}")
        res = detail.get("resources", {})
        print(f"version {vid} ({v.get('metadata', {}).get('created_on')}, {v.get('metadata', {}).get('source')}):")
        print("   resources:", json.dumps(shape({k: v for k, v in res.items() if k != "bindings"})))


if __name__ == "__main__":
    main()
