// Days the alley itself is shut: a holiday, a private event, a broken machine.
//
// Kept apart from `excused`, which is what he says about his own days. A
// closure is a fact about the lanes, set ahead of time (often remotely, see
// /api/closures), stored as {date: reason} in the `closures` record that lives
// in the D1 `live` table alongside `excused`.
//
// On a closed date the app treats the lanes as shut: no push of any kind goes
// out and the alley reads as closed. Once the date is behind him with no game
// logged, it is written into `excused` with the reason "lanes", so it pauses
// the streak rather than showing up as a miss. The streak math itself is not
// touched; it only ever sees an ordinary excused day.
//
// Pure functions only.

import { isValidIsoDate } from "./streak.js";

/** The excuse reason a closed date becomes once it has passed. */
export const CLOSURE_EXCUSE = "lanes";

/** Longest reason kept; it is a note, not a document. */
export const MAX_REASON = 80;

/** A reason as stored: trimmed text, or null when there is nothing usable. */
export function cleanReason(v) {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, MAX_REASON);
  return s || null;
}

/**
 * The record as {date: reason}, sorted, with anything unusable dropped. A
 * plain list of dates loads as "closed" for every day, as `excused` once did.
 */
export function cleanClosures(raw) {
  const out = {};
  if (Array.isArray(raw)) {
    for (const d of raw) if (isValidIsoDate(d)) out[d] = "closed";
  } else if (raw && typeof raw === "object") {
    for (const [d, r] of Object.entries(raw)) {
      const reason = cleanReason(r);
      if (isValidIsoDate(d) && reason) out[d] = reason;
    }
  }
  return Object.fromEntries(Object.keys(out).sort().map((d) => [d, out[d]]));
}

/** The reason the lanes are closed on `date`, or null. */
export function closureOn(closures, date) {
  return closures && Object.hasOwn(closures, date) ? closures[date] : null;
}

/**
 * `excused` with every closed date that has rolled past unbowled filled in as
 * "lanes". Returns `{ excused, added }`; `excused` is a new object and `added`
 * lists the dates that were not there before.
 *
 * Only dates strictly before `today`: today's closure may still be lifted, and
 * a day that is not over is not yet a miss. A day he bowled, or one he already
 * paused for some other reason, is left exactly as it is.
 */
export function closureExcuses(closures, excused, bowled, today, start = null) {
  const out = { ...(excused || {}) };
  const added = [];
  const played = bowled instanceof Set ? bowled : new Set(bowled || []);
  for (const d of Object.keys(closures || {})) {
    if (d >= today) continue;
    if (start && d < start) continue;
    if (played.has(d) || Object.hasOwn(out, d)) continue;
    out[d] = CLOSURE_EXCUSE;
    added.push(d);
  }
  return { excused: out, added: added.sort() };
}
