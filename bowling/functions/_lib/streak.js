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

/** Why a day was excused. */
export const EXCUSE_REASONS = ["closed", "sick", "injured"];

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
