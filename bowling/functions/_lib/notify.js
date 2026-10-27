// What the notifications say, and when each one is due.
//
// Three kinds, each one he can turn off:
//
//   headsup   on a day with no game and no pause yet, timed from his calendar:
//             half an hour before a bowling session on it, otherwise when his
//             last commitment of the day ends; 4 PM when the calendar is empty
//   lastcall  two hours before the lanes stop taking games, same condition;
//             the original evening reminder (see nudge.js)
//   weekly    Monday morning: how last week went, in numbers
//
// Everything here is pure, so the timing and the wording can be tested without
// a clock, a network or a KV namespace. nudge-run.js does the reading and the
// sending.

import { addDays } from "./streak.js";
import { dayOfWeek } from "./hours.js";
import { zonedToUtc } from "./ics.js";
import { LEAD_MS, inNudgeWindow } from "./nudge.js";
import { freeWindows } from "./window.js";

export const KINDS = ["headsup", "lastcall", "weekly"];

/** What a fresh install gets: everything on, the heads up at 4 PM. */
export const DEFAULT_PREFS = { headsup: true, lastcall: true, weekly: true, at: "16:00" };

/** How long after its start time a heads up may still go out. */
export const HEADSUP_SPAN_MS = 2 * 60 * 60 * 1000;

/** Monday, 9 AM to noon. A recap at 2 PM is old news. */
export const WEEKLY_AT_MIN = 9 * 60;
export const WEEKLY_SPAN_MS = 3 * 60 * 60 * 1000;

/** Streak lengths worth naming. Past a year, every hundred. */
export const MILESTONES = [7, 14, 21, 30, 50, 60, 75, 100, 150, 200, 250, 300, 365];

export function isMilestone(n) {
  return MILESTONES.includes(n) || (n > 365 && n % 100 === 0);
}

// Quarter hours only: the timer ticks on :00, :15, :30 and :45, and a time
// between ticks could open a window short enough to fall between two of them.
const isClock = (v) => typeof v === "string" && /^([01]\d|2[0-3]):(00|15|30|45)$/.test(v);
const minutesOf = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

/**
 * Stored prefs laid over the defaults. Anything unrecognised is dropped, so a
 * bad write can turn a notification off at worst, never break the run.
 */
export function cleanPrefs(raw) {
  const out = { ...DEFAULT_PREFS };
  if (!raw || typeof raw !== "object") return out;
  for (const k of KINDS) if (typeof raw[k] === "boolean") out[k] = raw[k];
  if (isClock(raw.at)) out.at = raw.at;
  return out;
}

/** A partial update from the client: `{ prefs, errors }`. */
export function validatePrefs(input, current = DEFAULT_PREFS) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { prefs: cleanPrefs(current), errors: ["expected an object"] };
  }
  const next = cleanPrefs(current);
  for (const k of KINDS) {
    if (!Object.prototype.hasOwnProperty.call(input, k)) continue;
    if (typeof input[k] !== "boolean") errors.push(`${k} must be true or false`);
    else next[k] = input[k];
  }
  if (Object.prototype.hasOwnProperty.call(input, "at")) {
    if (!isClock(input.at)) errors.push("the heads up time must be on the quarter hour, like 16:00 or 16:15");
    else next.at = input.at;
  }
  return { prefs: next, errors };
}

/** A wall clock time on a local date, as an instant. */
function localMs(date, minutes, tz) {
  const [y, mo, d] = date.split("-").map(Number);
  return zonedToUtc({ y, mo, d, h: Math.floor(minutes / 60), mi: minutes % 60 }, tz);
}

/** How long before a bowling session on the calendar the heads up goes out. */
export const BOWL_LEAD_MS = 30 * 60 * 1000;

/** The timer ticks every quarter hour; a shorter window could fall between two. */
const MIN_SPAN_MS = 15 * 60 * 1000;

/**
 * When today's heads up may go out, and why then; null when it cannot.
 *
 * Automatic, from his calendar:
 *   - a bowling session on it: half an hour before it starts
 *   - other commitments: the moment the last one before the evening ends, so
 *     it lands when he is actually free; booked until late, the start of the
 *     longest free stretch earlier on
 *   - nothing on it, or no feed: the fallback time (4 PM)
 *
 * It always ends where the last call reminder's window begins, so the two
 * never compete for the same evening. A plan computed from the whole day
 * rather than from now, so it is the same plan on every tick.
 */
export function headsupPlan({ hours, today, tz, at = DEFAULT_PREFS.at, calendar = null }) {
  if (!hours || hours.closedToday || typeof hours.lastCallMs !== "number") return null;
  const cutoff = hours.lastCallMs - LEAD_MS;
  const plan = (start, reason, extra = {}) => {
    const end = Math.min(start + HEADSUP_SPAN_MS, cutoff, extra.session ? extra.session.start : Infinity, extra.freeUntil ?? Infinity);
    return end - start >= MIN_SPAN_MS ? { start, end, reason, ...extra } : null;
  };

  const cal = calendar && calendar.configured && !calendar.error ? calendar : null;
  if (cal) {
    const session = (cal.today || []).filter((t) => !t.allDay && typeof t.start === "number")
      .sort((a, b) => a.start - b.start)[0];
    if (session) return plan(session.start - BOWL_LEAD_MS, "session", { session: { start: session.start, summary: session.summary || null } });

    const busy = (cal.busy || []).filter((b) => typeof b.start === "number" && b.start < cutoff && b.end > hours.openMs);
    if (busy.length) {
      const lastEnd = Math.max(...busy.map((b) => b.end));
      const wins = freeWindows(busy, hours, hours.openMs).filter((w) => w.start < cutoff);
      const after = wins.find((w) => w.start >= lastEnd);
      if (after) return plan(after.start, "free", { freeUntil: after.end });
      const longest = wins.slice().sort((a, b) => b.minutes - a.minutes)[0];
      // Booked solid until the evening: the last call reminder has it.
      return longest ? plan(longest.start, "gap", { freeUntil: longest.end, before: longest.before || null }) : null;
    }
  }
  return plan(localMs(today, minutesOf(at), tz), "default");
}

/** The old fixed time window, kept for callers that have no calendar. */
export function headsupWindow(hours, today, tz, at = DEFAULT_PREFS.at) {
  return headsupPlan({ hours, today, tz, at });
}

/** Monday morning, whatever the alley is doing. */
export function weeklyWindow(today, tz) {
  if (dayOfWeek(today) !== 1) return null;
  const start = localMs(today, WEEKLY_AT_MIN, tz);
  return { start, end: start + WEEKLY_SPAN_MS };
}

const inside = (w, nowMs) => !!w && nowMs >= w.start && nowMs < w.end;

/**
 * Which kinds the clock and his prefs allow right now, with a reason for each.
 * Nothing here reads the log, so the tick that falls outside every window
 * costs no more than this.
 */
export function dueByClock({ nowMs, today, tz, hours, prefs, calendar = null }) {
  const p = cleanPrefs(prefs);
  const why = {};
  const due = [];
  const check = (kind, ok, no) => {
    if (!p[kind]) why[kind] = "turned off";
    else if (ok) { due.push(kind); why[kind] = "due"; }
    else why[kind] = no;
  };
  // Most urgent first: if two were ever due on one tick, the deadline wins.
  check("lastcall", inNudgeWindow(hours, nowMs), "outside its window");
  const hw = headsupPlan({ hours, today, tz, at: p.at, calendar });
  check("headsup", inside(hw, nowMs), hw ? "outside its window" : "no window today");
  check("weekly", inside(weeklyWindow(today, tz), nowMs), "only on Monday morning");
  return { due, why, plan: hw };
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The words for a day with nothing logged yet. `streak` is computeStats'
 * output; `hours` is hoursStatus'; `plan` is headsupPlan's, which says what
 * the calendar made of the day; `clock` formats an instant as "3:15 PM".
 */
export function streakNotice(kind, streak, hours, plan = null, clock = null) {
  const n = Number(streak.current) || 0;
  const next = n + 1;
  const by = hours && hours.lastCallAt ? ` by ${hours.lastCallAt}` : "";
  const record = n > 0 && next > (Number(streak.longest) || 0) ? ` That beats your longest run (${streak.longest}).` : "";

  if (kind === "lastcall") {
    return {
      kind,
      title: n > 0 ? `${plural(n, "day")} on the line` : "No game logged today",
      body: `Nothing logged yet. Last game goes on${by}.${n > 0 ? ` One game makes it ${next}.` : ""}`,
    };
  }

  const stakes = n > 0 ? `One game makes it ${next}.${record}` : "One game starts a streak.";
  const at = (ms) => (clock ? clock(ms) : null);
  if (plan && plan.reason === "session" && at(plan.session.start)) {
    return { kind, title: `Bowling at ${at(plan.session.start)}`, body: `On your calendar. ${stakes}` };
  }
  if (plan && (plan.reason === "free" || plan.reason === "gap") && at(plan.freeUntil)) {
    const until = plan.freeUntil >= hours.lastCallMs ? `until last call at ${hours.lastCallAt}` : `until ${at(plan.freeUntil)}`;
    return {
      kind,
      title: n > 0 && isMilestone(next) ? `Free now, one game from ${next} days` : "You're free now",
      body: `Nothing on your calendar ${until}. ${stakes}`,
    };
  }
  if (n === 0) {
    return { kind, title: "Start a streak today", body: `No game yet. The lanes take games until ${(hours && hours.lastCallAt) || "close"}.` };
  }
  return {
    kind,
    title: isMilestone(next) ? `One game from ${next} days` : `${n}-day streak`,
    body: `No game yet today. Bowl one${by} to make it ${next}.${record}`,
  };
}

/** Mean of nightly means: an eight game night counts once, as in stats.js. */
function nightAverage(scores, dates) {
  const nights = dates
    .map((d) => (scores[d] || []).filter((v) => typeof v === "number"))
    .filter((g) => g.length)
    .map((g) => g.reduce((a, b) => a + b, 0) / g.length);
  return nights.length ? nights.reduce((a, b) => a + b, 0) / nights.length : null;
}

/**
 * Last Monday to Sunday, against the week before it. `today` is the Monday
 * the recap goes out. Plain numbers; a week is too short for a trend and the
 * card in the app already refuses to call one.
 */
export function weeklyRecap(scores, today, streak) {
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 7));
  const before = Array.from({ length: 7 }, (_, i) => addDays(today, i - 14));
  const games = week.flatMap((d) => (scores[d] || []).filter((v) => typeof v === "number"));
  const nights = week.filter((d) => (scores[d] || []).some((v) => typeof v === "number")).length;
  const n = Number(streak.current) || 0;
  const streakLine = n > 0 ? `Streak ${plural(n, "day")}.` : "No streak running.";

  if (!games.length) {
    return { kind: "weekly", title: "Last week: no games", body: `Nothing logged Monday to Sunday. ${streakLine}` };
  }

  const avg = nightAverage(scores, week);
  const prev = nightAverage(scores, before);
  const diff = prev === null ? null : Math.round(avg) - Math.round(prev);
  const vs = diff === null ? "" : diff === 0 ? " (same as the week before)" : ` (${diff > 0 ? "+" : "−"}${Math.abs(diff)} on the week before)`;

  const best = Math.max(...games);
  const earlier = Object.keys(scores)
    .filter((d) => d < week[0])
    .flatMap((d) => scores[d].filter((v) => typeof v === "number"));
  const record = earlier.length && best > Math.max(...earlier) ? ", a new personal best" : "";

  return {
    kind: "weekly",
    title: `Last week: ${plural(nights, "night")}, ${plural(games.length, "game")}`,
    body: `Average ${Math.round(avg)}${vs}. Best game ${best}${record}. ${streakLine}`,
  };
}
