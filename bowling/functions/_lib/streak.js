// Pure date and streak helpers. No I/O so they can be unit tested with node.

import { zonedToUtc } from "./ics.js";

const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" for `now` in the given IANA timezone. */
export function todayIn(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Milliseconds until the next local midnight in `timeZone` (DST aware). */
export function msUntilMidnight(timeZone, now = new Date()) {
  const [y, mo, d] = addDays(todayIn(timeZone, now), 1).split("-").map(Number);
  return zonedToUtc({ y, mo, d }, timeZone) - now.getTime();
}

/** True for a real calendar date written exactly as "YYYY-MM-DD". */
export function isValidIsoDate(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && isoFromDayNumber(dayNumber(v)) === v;
}

/** Parse "YYYY-MM-DD" to a UTC day number (days since epoch). */
export function dayNumber(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** Inverse of dayNumber. */
export function isoFromDayNumber(n) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export function addDays(iso, delta) {
  return isoFromDayNumber(dayNumber(iso) + delta);
}

/** Every date from `start` to `end` inclusive. */
export function dateRange(start, end) {
  const out = [];
  for (let n = dayNumber(start); n <= dayNumber(end); n++) out.push(isoFromDayNumber(n));
  return out;
}

/**
 * Why a day was excused.
 *
 * "away" is for being off campus: home to see family, a trip, anywhere without
 * his alley. Those days are known in advance and usually come in runs, which is
 * why the pause below takes a range and accepts dates that have not happened.
 */
export const EXCUSE_REASONS = ["closed", "sick", "injured", "away"];

/** Longest run of days one pause may cover. A semester is not a pause. */
export const MAX_PAUSE_DAYS = 60;

/** How far ahead a trip can be marked. */
export const PAUSE_AHEAD_DAYS = 365;

/**
 * Consecutive dates sharing a reason, collapsed into runs.
 *
 * A four day trip is one thing he did, not four, and sending it as one run
 * keeps the payload small enough that a long pause cannot crowd out the next
 * one. Expects the entries in date order.
 */
export function groupRuns(entries) {
  const runs = [];
  for (const { date, reason } of entries) {
    const prev = runs[runs.length - 1];
    if (prev && prev.reason === reason && addDays(prev.to, 1) === date) {
      prev.to = date;
      prev.days += 1;
    } else {
      runs.push({ from: date, to: date, reason, days: 1 });
    }
  }
  return runs;
}

/**
 * Check and expand a pause into the days it covers.
 *
 * Returns `{ dates }` or `{ error }`. A single day is a range of one, so the
 * endpoint has one path rather than two. Future dates are allowed on purpose:
 * he books a trip before he takes it, and a day excused in advance does nothing
 * to the streak until it arrives.
 */
export function pauseRange({ from, to, reason }, today, start, opts = {}) {
  const r = reason === undefined ? "closed" : reason;
  if (!EXCUSE_REASONS.includes(r)) {
    return { error: `reason must be one of ${EXCUSE_REASONS.join(", ")}` };
  }
  if (!isValidIsoDate(from)) return { error: "from must be YYYY-MM-DD" };
  const last = to === undefined ? from : to;
  if (!isValidIsoDate(last)) return { error: "to must be YYYY-MM-DD" };
  if (last < from) return { error: "to must not be before from" };
  // Undoing skips this: a day already on file before the start date still has
  // to be removable, whatever put it there.
  if (!opts.allowBefore && from < start) return { error: `nothing before ${start} to pause` };
  if (last > addDays(today, PAUSE_AHEAD_DAYS)) {
    return { error: `cannot pause more than ${PAUSE_AHEAD_DAYS} days ahead` };
  }
  const dates = dateRange(from, last);
  if (dates.length > MAX_PAUSE_DAYS) {
    return { error: `a pause covers at most ${MAX_PAUSE_DAYS} days` };
  }
  return { dates, reason: r };
}

/**
 * Normalise excused input to a {date: reason} map. Accepts the legacy list of
 * dates (all treated as "closed") or a map; unknown reasons become "closed".
 */
export function excuseMap(excused) {
  const map = {};
  if (Array.isArray(excused)) {
    for (const d of excused) if (typeof d === "string") map[d] = "closed";
  } else if (excused && typeof excused === "object") {
    for (const [d, r] of Object.entries(excused)) map[d] = EXCUSE_REASONS.includes(r) ? r : "closed";
  }
  return map;
}

/**
 * Compute streak stats.
 * @param {string[]} days     verified dates ("YYYY-MM-DD"), any order, may contain dupes
 * @param {string}   today    today's date in the user's timezone
 * @param {string}   start    first day of the challenge
 * @param {string[]|Object<string,string>} excused
 *   days you genuinely could not bowl (alley closed, sick, injured), either a
 *   list of dates or a {date: reason} map. They neither break nor extend the
 *   streak; a bowled day always wins.
 */
export function computeStats(days, today, start, excused = []) {
  const set = new Set(days.filter((d) => d >= start && d <= today));
  const sorted = [...set].sort();
  const reasons = {};
  for (const [d, r] of Object.entries(excuseMap(excused))) {
    if (d >= start && d <= today && !set.has(d)) reasons[d] = r;
  }
  const paused = new Set(Object.keys(reasons));

  const verifiedToday = set.has(today);
  const excusedToday = paused.has(today);

  // Current streak: walk back from today (or yesterday if today is still
  // open), counting bowled days and stepping over excused ones.
  let current = 0;
  let cursor = verifiedToday ? today : addDays(today, -1);
  while (set.has(cursor) || paused.has(cursor)) {
    if (set.has(cursor)) current++;
    cursor = addDays(cursor, -1);
  }
  // Today excused with nothing bowled yet: the streak stays as it was.
  if (excusedToday) {
    current = 0;
    cursor = addDays(today, -1);
    while (set.has(cursor) || paused.has(cursor)) {
      if (set.has(cursor)) current++;
      cursor = addDays(cursor, -1);
    }
  }

  // Longest run anywhere in history, with excused days bridging runs.
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    let bridged = prev !== null;
    if (prev !== null) {
      for (let n = dayNumber(prev) + 1; n < dayNumber(d); n++) {
        if (!paused.has(isoFromDayNumber(n))) { bridged = false; break; }
      }
    }
    run = bridged ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  const dayOfChallenge = dayNumber(today) - dayNumber(start) + 1;
  const missed = dateRange(start, addDays(today, -1)).filter((d) => !set.has(d) && !paused.has(d));

  return {
    today,
    start,
    verifiedToday,
    excusedToday,
    excuseToday: excusedToday ? reasons[today] : null,
    current,
    longest,
    total: sorted.length,
    dayOfChallenge,
    missed,
    // Streak is at risk when it is alive but today is neither bowled nor excused.
    atRisk: !verifiedToday && !excusedToday && current > 0,
    days: sorted,
    excused: [...paused].sort(),
    excuseReasons: Object.fromEntries([...paused].sort().map((d) => [d, reasons[d]])),
  };
}
