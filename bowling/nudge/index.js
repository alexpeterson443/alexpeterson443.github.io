// The evening nudge, on Cloudflare's own timer.
//
// Pages Functions cannot be put on a schedule, so this is a separate Worker
// bound to the same KV namespace the site uses. The thinking lives in
// _lib/nudge-run.js, which /api/nudge also calls, so whichever timer is in use
// they cannot drift apart.
//
// It runs every quarter hour and almost always decides to do nothing: the
// clock is checked before any KV read, so the ~88 ticks a day that fall
// outside the window cost one pure function call and return.

import { runNudge } from "../functions/_lib/nudge-run.js";
import { keyMatches } from "../functions/_lib/auth.js";

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runNudge(env, event.scheduledTime));
  },

  /**
   * A dry run, for seeing tonight's reasoning without waiting for the evening.
   * Gated by the same access key as the site, because `?send=1` really does
   * push. Nothing here is reachable without it.
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") ?? request.headers.get("X-Access-Key");
    if (!(await keyMatches(env, key))) return new Response("Not found", { status: 404 });
    const out = await runNudge(env, Date.now(), { force: url.searchParams.get("send") === "1" });
    return Response.json(out, { headers: { "Cache-Control": "private, no-store" } });
  },
};
