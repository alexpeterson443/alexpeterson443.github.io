import { runNudge } from "../_lib/nudge-run.js";

// GET  /api/nudge                  -> what would go out right now, sending nothing
// POST /api/nudge                  -> the same decision, and the push if it says yes
// POST /api/nudge?send=1&kind=test -> send one kind regardless of the clock, for
//                                     proving a device is actually reachable
//                                     (kind: test, headsup, lastcall, weekly)
//
// The POST is the timer hook. The Worker in nudge/ calls it every quarter hour
// with the X-Nudge-Token header, which the middleware accepts for this one
// route and method and nothing else.
export async function onRequestGet({ env }) {
  return Response.json(await runNudge(env, Date.now(), { dryRun: true }));
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const force = url.searchParams.get("send") === "1";
  const kind = url.searchParams.get("kind") || (force ? "test" : null);
  return Response.json(await runNudge(env, Date.now(), { force, kind }));
}
