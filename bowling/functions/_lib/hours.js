// Opening hours for the bowling alley, as plain wall clock times in the site
// timezone. Pure functions only, so they can be unit tested with node.
//
// Override the defaults with the HOURS var: JSON mapping a three letter day to
// ["HH:MM", "HH:MM"], or null for a day the alley never opens. Anything that
// does not parse falls back to that day's default rather than failing the page.

import { zonedToUtc } from "./ics.js";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The alley stops putting games on this many minutes before the posted close,
 * so this, not the close time, is the real deadline for getting a game in.
 */
export const DEFAULT_LAST_CALL = 15;

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

/** "YYYY-MM-DD" shifted by whole days. */
function addIsoDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * 86_400_000).toISOString().slice(0, 10);
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

/** Minutes before close when the alley stops starting games. */
export function lastCallFromEnv(env) {
  const n = Number(env && env.LAST_CALL_MINUTES);
  return Number.isInteger(n) && n >= 0 && n <= 240 ? n : DEFAULT_LAST_CALL;
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
export function hoursStatus(hours, tz, today, now = new Date(), lastCall = DEFAULT_LAST_CALL) {
  const dow = dayOfWeek(today);
  const h = hours[dow];
  const [y, mo, d] = today.split("-").map(Number);
  const at = (min) => zonedToUtc({ y, mo, d, h: Math.floor(min / 60), mi: min % 60 }, tz);
  const t = now.getTime();

  const openMs = h ? at(h[0]) : null;
  const closeMs = h ? at(h[1]) : null;
  // Never earlier than opening, in case a day's window is shorter than the cut off.
  const lastCallMs = h ? Math.max(openMs, closeMs - lastCall * 60_000) : null;
  const open = h !== null && t >= openMs && t < closeMs;
  const beforeOpen = h !== null && t < openMs;

  // When the lanes next open. Usually that is a later day, since by the time
  // this matters today's session has happened; but a day can be settled before
  // the alley has even opened, and then the next opening is today. Saying
  // "tomorrow" there contradicts the opening time shown beside it.
  let next = null;
  if (beforeOpen) {
    next = { day: NAMES[dow], today: true, tomorrow: false, opens: clockLabel(h[0]), date: today, msUntil: openMs - t };
  }
  for (let step = 1; next === null && step <= 7; step++) {
    const i = (dow + step) % 7;
    const nh = hours[i];
    if (!nh) continue;
    const date = addIsoDays(today, step);
    const [ny, nmo, nd] = date.split("-").map(Number);
    const opensMs = zonedToUtc({ y: ny, mo: nmo, d: nd, h: Math.floor(nh[0] / 60), mi: nh[0] % 60 }, tz);
    next = { day: NAMES[i], today: false, tomorrow: step === 1, opens: clockLabel(nh[0]), date, msUntil: opensMs - t };
    break;
  }

  return {
    todayLabel: h ? `${clockLabel(h[0])} – ${clockLabel(h[1])}` : "Closed",
    closedToday: h === null,
    open,
    beforeOpen,
    opensAt: h ? clockLabel(h[0]) : null,
    closesAt: h ? clockLabel(h[1]) : null,
    lastCallAt: h ? clockLabel(h[1] - Math.min(lastCall, h[1] - h[0])) : null,
    lastCallMinutes: lastCall,
    lastCallPassed: h !== null && t >= lastCallMs,
    msUntilOpen: beforeOpen ? openMs - t : null,
    // Real instants, so the free window maths can work in absolute time rather
    // than re-deriving the day's boundaries from the labels.
    openMs,
    closeMs,
    lastCallMs,
    // Time left to get a game on today. Last call, not the posted close, is the
    // deadline, so the countdown points at that rather than at midnight.
    msUntilLastCall: h !== null && t < lastCallMs ? lastCallMs - t : null,
    today: dow,
    next,
    // Time until the lanes are open again for a fresh day, which is the wait
    // that matters once today is settled.
    msUntilNextOpen: next ? next.msUntil : null,
    week: weekRows(hours),
  };
}
