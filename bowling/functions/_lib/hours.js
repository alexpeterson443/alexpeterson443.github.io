// Opening hours for the bowling alley, as plain wall clock times in the site
// timezone. Pure functions only, so they can be unit tested with node.
//
// Override the defaults with the HOURS var: JSON mapping a three letter day to
// ["HH:MM", "HH:MM"], or null for a day the alley never opens. Anything that
// does not parse falls back to that day's default rather than failing the page.

import { zonedToUtc } from "./ics.js";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Mon to Fri 10am to 10pm, Sat noon to 10pm, Sun noon to 8pm. */
export const DEFAULT_HOURS = {
  sun: ["12:00", "20:00"],
  mon: ["10:00", "22:00"],
  tue: ["10:00", "22:00"],
  wed: ["10:00", "22:00"],
  thu: ["10:00", "22:00"],
  fri: ["10:00", "22:00"],
  sat: ["12:00", "22:00"],
};

/** "HH:MM" to minutes past local midnight, or null when unusable. */
function toMinutes(v) {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 24 || mi > 59) return null;
  return h * 60 + mi;
}

/** Minutes past midnight to a clock label like "10:00 PM". */
export function clockLabel(min) {
  const h24 = Math.floor(min / 60) % 24;
  const mi = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(mi).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/** Weekday index (0 = Sunday) for a "YYYY-MM-DD" date. */
export function dayOfWeek(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Normalise an hours table to { 0..6: [openMinutes, closeMinutes] | null }. */
export function parseHours(raw) {
  let src = raw;
  if (typeof src === "string") {
    try { src = JSON.parse(src); } catch { src = null; }
  }
  if (!src || typeof src !== "object") src = DEFAULT_HOURS;
  const out = {};
  for (let i = 0; i < 7; i++) {
    const entry = Object.hasOwn(src, DAYS[i]) ? src[DAYS[i]] : undefined;
    if (entry === null) { out[i] = null; continue; }
    const open = Array.isArray(entry) ? toMinutes(entry[0]) : null;
    const close = Array.isArray(entry) ? toMinutes(entry[1]) : null;
    if (open !== null && close !== null && close > open) out[i] = [open, close];
    else out[i] = [toMinutes(DEFAULT_HOURS[DAYS[i]][0]), toMinutes(DEFAULT_HOURS[DAYS[i]][1])];
  }
  return out;
}

export function hoursFromEnv(env) {
  return parseHours(env && env.HOURS);
}

/**
 * The week as display rows, Monday first, with runs of identical days merged
 * so the table reads "Mon – Fri  10:00 AM – 10:00 PM".
 */
export function weekRows(hours) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const runs = [];
  for (const i of order) {
    const h = hours[i];
    const key = h ? `${h[0]}-${h[1]}` : "closed";
    const last = runs[runs.length - 1];
    if (last && last.key === key) last.days.push(i);
    else runs.push({ key, days: [i], hours: h ? `${clockLabel(h[0])} – ${clockLabel(h[1])}` : "Closed" });
  }
  return runs.map((r) => ({
    label: r.days.length > 1 ? `${NAMES[r.days[0]]} – ${NAMES[r.days.at(-1)]}` : NAMES[r.days[0]],
    hours: r.hours,
    days: r.days,
  }));
}

/**
 * Where `now` sits against the alley's hours on `today`.
 * Times are resolved through the timezone, so DST is handled.
 */
export function hoursStatus(hours, tz, today, now = new Date()) {
  const dow = dayOfWeek(today);
  const h = hours[dow];
  const [y, mo, d] = today.split("-").map(Number);
  const at = (min) => zonedToUtc({ y, mo, d, h: Math.floor(min / 60), mi: min % 60 }, tz);
  const t = now.getTime();

  const openMs = h ? at(h[0]) : null;
  const closeMs = h ? at(h[1]) : null;
  const open = h !== null && t >= openMs && t < closeMs;
  const beforeOpen = h !== null && t < openMs;

  // The next day the alley opens, for the line shown once it has shut.
  let next = null;
  for (let step = 1; step <= 7; step++) {
    const i = (dow + step) % 7;
    if (hours[i]) {
      next = { day: NAMES[i], tomorrow: step === 1, opens: clockLabel(hours[i][0]) };
      break;
    }
  }

  return {
    todayLabel: h ? `${clockLabel(h[0])} – ${clockLabel(h[1])}` : "Closed",
    closedToday: h === null,
    open,
    beforeOpen,
    opensAt: h ? clockLabel(h[0]) : null,
    closesAt: h ? clockLabel(h[1]) : null,
    msUntilOpen: beforeOpen ? openMs - t : null,
    // Time left to bowl today: set whenever closing is still ahead, so the
    // countdown points at the alley shutting rather than at midnight.
    msUntilClose: h !== null && t < closeMs ? closeMs - t : null,
    today: dow,
    next,
    week: weekRows(hours),
  };
}
