// Deciding whether anything is worth a notification right now, and sending it.
//
// The timer is the Worker in nudge/, on Cloudflare's own cron. It does not
// sign pushes itself: it knocks on POST /api/nudge every quarter hour with a
// token, and this runs inside the Pages project, which holds the VAPID key.
// One copy of the key, one copy of the reasoning.
//
// It reads the log; the only things it writes are the notice the service
// worker will display, the markers that stop a kind going out twice, and the
// subscription list, which it prunes when a push service says a device is gone.

import { todayIn, computeStats } from "./streak.js";
import { hoursFromEnv, hoursStatus, lastCallFromEnv } from "./hours.js";
import { dueByClock, streakNotice, weeklyRecap, KINDS } from "./notify.js";
import { loadDays, loadScores, loadExcused, loadSubs, saveSubs, configFor, loadPrefs, saveNotice } from "./store.js";
import { sendPush } from "./push.js";

/** The date each kind last went out, so an evening gets one and not eight. */
const sentKey = (kind) => `push_sent:${kind}`;

const STREAK_KINDS = new Set(["headsup", "lastcall"]);

function clock(env, nowMs) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz, new Date(nowMs));
  const hours = hoursStatus(hoursFromEnv(env), tz, today, new Date(nowMs), lastCallFromEnv(env));
  return { tz, today, hours };
}

/** The streak as the app computes it: legacy check ins plus any scored day. */
export async function streakNow(env, today) {
  const [days, scores, excused] = await Promise.all([loadDays(env), loadScores(env), loadExcused(env)]);
  const scored = Object.keys(scores).filter((d) => scores[d].some((n) => typeof n === "number"));
  const streak = computeStats([...days, ...scored], today, env.START_DATE, excused);
  return { streak, scores, unsettled: !streak.verifiedToday && !streak.excusedToday };
}

/** The words for one kind, given the log as it stands. */
export function compose(kind, { streak, scores, hours, today }) {
  if (kind === "weekly") return weeklyRecap(scores, today, streak);
  if (STREAK_KINDS.has(kind)) return streakNotice(kind, streak, hours);
  // "test": proves a device is reachable, and says something true while at it.
  const n = Number(streak.current) || 0;
  return {
    kind: "test",
    title: "Notifications are working",
    body: n > 0 ? `Streak ${n} day${n === 1 ? "" : "s"}. This is what a reminder will look like.` : "This is what a reminder will look like.",
  };
}

/**
 * Decide, and send if the answer is yes.
 *
 * `force` with a `kind` skips the clock, his prefs and the sent markers so a
 * push can be proved to arrive without waiting for the right hour. A streak
 * reminder still refuses a day that is already settled, because a reminder
 * that lies is worse than no reminder. `dryRun` runs everything except the
 * send.
 */
export async function runNudge(rawEnv, nowMs = Date.now(), { force = false, kind = null, dryRun = false } = {}) {
  // His saved settings decide the timezone and the alley's hours, so this has
  // to read them too or it will be reasoning about a different evening than
  // the app is showing him.
  const env = await configFor(rawEnv);
  const { tz, today, hours } = clock(env, nowMs);
  const prefs = await loadPrefs(env);
  const byClock = dueByClock({ nowMs, today, tz, hours, prefs });
  const detail = { today, lastCall: hours.lastCallAt, prefs, kinds: byClock.why };

  if (force && kind !== "test" && !KINDS.includes(kind)) {
    return { ...detail, send: false, why: `unknown kind; use test, ${KINDS.join(", ")}` };
  }
  const wanted = force ? [kind] : byClock.due;
  if (!wanted.length) return { ...detail, send: false, why: "nothing is due" };

  const { streak, scores, unsettled } = await streakNow(env, today);
  detail.unsettled = unsettled;

  let notice = null;
  for (const k of wanted) {
    if (STREAK_KINDS.has(k) && !unsettled) { detail.kinds[k] = "today already has a game or a pause"; continue; }
    if (!force && (await env.STREAK_KV.get(sentKey(k), "json")) === today) { detail.kinds[k] = "already sent today"; continue; }
    notice = compose(k, { streak, scores, hours, today });
    break;
  }
  if (!notice) return { ...detail, send: false, why: "nothing left to say" };

  const subs = await loadSubs(env);
  if (!subs.length) return { ...detail, send: false, notice, why: "no device has notifications turned on" };
  // A dry run stops here, having done everything except the one thing that
  // cannot be taken back.
  if (dryRun) return { ...detail, send: false, dryRun: true, notice, devices: subs.length };

  // Written before the push, so the service worker finds it when it wakes.
  await saveNotice(env, { ...notice, date: today, at: nowMs });
  const results = await Promise.all(
    subs.map((s) => sendPush(s, env, nowMs, `bowl-${notice.kind}`).catch((e) => ({ ok: false, status: 0, gone: false, error: e.message }))),
  );
  // A push service that answers 404 or 410 has retired that device for good.
  // Keeping it would mean signing and posting to a dead address every night.
  const kept = subs.filter((_, i) => !results[i].gone);
  if (kept.length !== subs.length) await saveSubs(env, kept);

  const ok = results.filter((r) => r.ok).length;
  // Only a delivered push counts; a total failure is retried on the next tick
  // rather than written off until tomorrow.
  if (ok && notice.kind !== "test") {
    await env.STREAK_KV.put(sentKey(notice.kind), JSON.stringify(today), { expirationTtl: 8 * 86_400 });
  }
  return {
    ...detail,
    send: ok > 0,
    notice,
    devices: subs.length,
    delivered: ok,
    dropped: subs.length - kept.length,
    statuses: results.map((r) => r.status),
  };
}
