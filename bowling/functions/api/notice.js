import { configFor, loadNotices } from "../_lib/store.js";
import { streakNow, compose } from "../_lib/nudge-run.js";
import { todayIn } from "../_lib/streak.js";
import { hoursFromEnv, hoursStatus, lastCallFromEnv } from "../_lib/hours.js";

// GET /api/notice -> {notices: [{kind, group, title, body}, ...]}
//
// Pushes carry no payload, so the service worker wakes up knowing only that
// something was sent, and asks here what. It gets every notice sent lately,
// one per group, because a phone that was offline through two sends receives
// both pushes at once and cannot tell which is which; the group is the
// notification tag, so showing them all twice just replaces them in place.
// The list is never empty: iOS revokes a web app's push permission when a
// push shows nothing.

/** How old a stored notice can be and still be one being delivered. */
const FRESH_MS = 2 * 60 * 60 * 1000;

/** The afternoon check and the last call reminder share a slot on the lock screen. */
const groupOf = (kind) => (kind === "headsup" || kind === "lastcall" ? "streak" : kind);

export async function onRequestGet({ env }) {
  const cfg = await configFor(env);
  const tz = cfg.TIMEZONE || "America/Chicago";
  const now = Date.now();
  const today = todayIn(tz);
  const [stored, { streak, scores, unsettled }] = await Promise.all([loadNotices(cfg), streakNow(cfg, today)]);
  const hours = hoursStatus(hoursFromEnv(cfg), tz, today, new Date(now), lastCallFromEnv(cfg));
  const n = Number(streak.current) || 0;

  const seen = new Set();
  const notices = [];
  for (const s of stored) {
    if (s.date !== today || !(now - s.at < FRESH_MS)) continue;
    const group = groupOf(s.kind);
    if (seen.has(group)) continue;
    seen.add(group);
    // A streak reminder for a day he has settled since it was sent. Say what
    // is true now rather than warning about a day that is already safe.
    if (group === "streak" && !unsettled) {
      notices.push({
        kind: s.kind, group,
        title: `${n}-day streak`,
        body: streak.verifiedToday ? "Today's game is in." : "Today is paused, so the streak is safe.",
      });
    } else {
      notices.push({ kind: s.kind, group, title: s.title, body: s.body });
    }
  }

  // Nothing stored that matches: a late push, or a notice that has not
  // reached this data centre yet. The streak's state is still worth showing.
  if (!notices.length) {
    const fallback = unsettled
      ? compose("headsup", { streak, scores, hours, today })
      : { kind: "status", title: `${n}-day streak`, body: streak.verifiedToday ? "Today's game is in." : "Today is paused." };
    notices.push({ kind: fallback.kind, group: groupOf(fallback.kind) === "status" ? "streak" : groupOf(fallback.kind), title: fallback.title, body: fallback.body });
  }
  return Response.json({ notices });
}
