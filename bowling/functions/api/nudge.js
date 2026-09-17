import { runNudge } from "../_lib/nudge-run.js";

// GET  /api/nudge          -> tonight's reasoning, without sending anything
// POST /api/nudge          -> the same decision, and the push if it says yes
// POST /api/nudge?send=1   -> send regardless of the clock, for proving a
//                             device is actually reachable
//
// This is the evening reminder's timer hook. The right home for it is the
// Worker in nudge/, on Cloudflare's own cron; this exists because deploying
// that Worker needs an API token with Workers permissions, and any scheduler
// that can make one authenticated request every quarter hour is enough to get
// the reminder working in the meantime. Both call the same code.
//
// The middleware gates it like everything else under /api/, so a caller needs
// the access key. That is deliberate: without it, anyone who found the URL
// could burn the day's KV reads and take the app down with it.
export async function onRequestGet({ env }) {
  return Response.json(await runNudge(env, Date.now(), { dryRun: true }));
}

export async function onRequestPost({ request, env }) {
  const force = new URL(request.url).searchParams.get("send") === "1";
  return Response.json(await runNudge(env, Date.now(), { force }));
}
