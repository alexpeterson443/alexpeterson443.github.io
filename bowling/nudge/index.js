// The evening nudge, on a timer.
//
// Pages Functions have no cron triggers, so this is a separate Worker bound to
// the same KV namespace the site uses. It reads; it never writes anything the
// site depends on, apart from the one marker that stops it nudging twice in a
// night and the subscription list, which it prunes when a push service says a
// device is gone.
//
// It runs every quarter hour and almost always decides to do nothing, so the
// clock is checked before any KV read: on the ~88 ticks a day that fall outside
// the window it costs one pure function call and returns.

import { todayIn } from "../functions/_lib/streak.js";
import { hoursFromEnv, hoursStatus, lastCallFromEnv } from "../functions/_lib/hours.js";
import { inNudgeWindow, nudgeDecision } from "../functions/_lib/nudge.js";
import { loadScores, loadExcused, loadSubs, saveSubs } from "../functions/_lib/store.js";
import { sendPush } from "../functions/_lib/push.js";
import { keyMatches } from "../functions/_lib/auth.js";

/** The date the last nudge went out, so an evening gets one and not eight. */
const SENT_KEY = "push_sent_on";

function clock(env, nowMs) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const hours = hoursStatus(hoursFromEnv(env), tz, today, new Date(nowMs), lastCallFromEnv(env));
  return { tz, today, hours };
}

/**
 * Decide, and send if the answer is yes.
 *
 * `force` is for the dry run endpoint only: it skips the clock and the marker
 * so a push can be proved to arrive without waiting for a real evening. It
 * still refuses to send when the day is settled, because a reminder that lies
 * is worse than no reminder.
 */
export async function run(env, nowMs = Date.now(), { force = false } = {}) {
  const { today, hours } = clock(env, nowMs);

  if (!force && !inNudgeWindow(hours, nowMs)) {
    return { today, send: false, why: "outside the window", lastCall: hours.lastCallAt };
  }

  const [scores, excused] = await Promise.all([loadScores(env), loadExcused(env)]);
  const bowled = (scores[today] || []).some((n) => typeof n === "number");
  const unsettled = !bowled && !excused[today];
  const decision = nudgeDecision({ unsettled, hours, nowMs });
  const detail = { today, lastCall: hours.lastCallAt, unsettled, ...decision };

  if (!unsettled) return detail;
  if (!force && !decision.send) return detail;

  const sentOn = await env.STREAK_KV.get(SENT_KEY);
  if (!force && sentOn === today) return { ...detail, send: false, why: "already nudged tonight" };

  const subs = await loadSubs(env);
  if (!subs.length) return { ...detail, send: false, why: "no device has the reminder turned on" };

  const results = await Promise.all(
    subs.map((s) => sendPush(s, env, nowMs).catch((e) => ({ ok: false, status: 0, gone: false, error: e.message }))),
  );
  // A push service that answers 404 or 410 has retired that device for good.
  // Keeping it would mean signing and posting to a dead address every night.
  const kept = subs.filter((_, i) => !results[i].gone);
  if (kept.length !== subs.length) await saveSubs(env, kept);

  const ok = results.filter((r) => r.ok).length;
  // Only a delivered push counts as tonight's nudge; a total failure should be
  // retried on the next tick rather than written off until tomorrow.
  if (ok) await env.STREAK_KV.put(SENT_KEY, today, { expirationTtl: 172_800 });

  return { ...detail, devices: subs.length, delivered: ok, dropped: subs.length - kept.length };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env, event.scheduledTime));
  },

  /**
   * A dry run, for seeing tonight's reasoning without waiting for the evening.
   * Gated by the same access key as the site, because `?send=1` really does
   * push. Nothing here is reachable without it.
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") ?? request.headers.get("X-Access-Key");
    if (!(await keyMatches(env, key))) {
      return new Response("Not found", { status: 404 });
    }
    const out = await run(env, Date.now(), { force: url.searchParams.get("send") === "1" });
    return Response.json(out, { headers: { "Cache-Control": "private, no-store" } });
  },
};
