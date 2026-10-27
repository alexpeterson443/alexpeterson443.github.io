// The notification timer.
//
// Pages Functions cannot be put on a schedule, so this Worker knocks on the
// site's POST /api/nudge every quarter hour. The site holds the VAPID key and
// the log and does all the deciding; this holds nothing but the token that
// opens that one door, so there is a single copy of the key and the reasoning.
//
// The clock is a Durable Object alarm rather than a cron trigger: the free
// plan allows five cron triggers per account and other projects use them all.
// An alarm survives deploys and re-arms itself for the next quarter hour every
// time it fires, whatever the knock returned. It is armed once, by a POST to
// /arm with the same token; arming again is harmless.

import { DurableObject } from "cloudflare:workers";

const QUARTER = 15 * 60 * 1000;

/** The next :00, :15, :30 or :45, a few seconds in so the minute has turned. */
export const nextTick = (now) => Math.floor(now / QUARTER) * QUARTER + QUARTER + 5_000;

export class Timer extends DurableObject {
  async arm() {
    const at = (await this.ctx.storage.getAlarm()) ?? nextTick(Date.now());
    await this.ctx.storage.setAlarm(at);
    return at;
  }

  async alarm() {
    try {
      await knock(this.env);
    } finally {
      await this.ctx.storage.setAlarm(nextTick(Date.now()));
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const token = request.headers.get("X-Nudge-Token");
    if (request.method !== "POST" || url.pathname !== "/arm" || !env.NUDGE_TOKEN || token !== env.NUDGE_TOKEN) {
      return new Response("Not found", { status: 404 });
    }
    const at = await env.TIMER.get(env.TIMER.idFromName("bowling")).arm();
    return Response.json({ armed: new Date(at).toISOString() });
  },
};

async function knock(env) {
  if (!env.NUDGE_TOKEN) throw new Error("NUDGE_TOKEN is not set on the Worker");
  const res = await fetch(`${env.SITE_URL}/api/nudge`, {
    method: "POST",
    headers: { "X-Nudge-Token": env.NUDGE_TOKEN },
  });
  // The reply is the reasoning: which kinds were due and why. It lands in the
  // Worker's logs, which is where to look when a notification did not arrive.
  console.log(res.status, (await res.text()).slice(0, 600));
}
