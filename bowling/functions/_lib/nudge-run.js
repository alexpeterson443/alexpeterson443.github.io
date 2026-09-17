// Deciding whether tonight is worth a notification, and sending it if it is.
//
// This lives in _lib rather than in the Worker because there are two things
// that can be on the other end of a timer. The Worker in nudge/ is the right
// one: Cloudflare's own cron, no third party, no extra hop. /api/nudge exists
// because deploying that Worker needs an API token with Workers permissions,
// and until there is one, any scheduler that can make an authenticated request
// every quarter hour will do. Both call this, so the two can never drift into
// disagreeing about what tonight looks like.
//
// It reads; the only things it writes are the marker that stops it nudging
// twice in a night and the subscription list, which it prunes when a push
// service says a device is gone.

import { todayIn } from "./streak.js";
import { hoursFromEnv, hoursStatus, lastCallFromEnv } from "./hours.js";
import { inNudgeWindow, nudgeDecision } from "./nudge.js";
import { loadScores, loadExcused, loadSubs, saveSubs, configFor } from "./store.js";
import { sendPush } from "./push.js";

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
 * `force` skips the clock and the marker so a push can be proved to arrive
 * without waiting for a real evening. It still refuses to send when the day is
 * settled, because a reminder that lies is worse than no reminder. `dryRun`
 * runs the whole decision and sends nothing.
 */
export async function runNudge(rawEnv, nowMs = Date.now(), { force = false, dryRun = false } = {}) {
  // His saved settings decide the timezone and the alley's hours, so the
  // Worker has to read them too or it will be reasoning about a different
  // evening than the app is showing him.
  const env = await configFor(rawEnv);
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
  // A dry run stops here, having done everything except the one thing that
  // cannot be taken back.
  if (dryRun) return { ...detail, dryRun: true, devices: subs.length };

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
