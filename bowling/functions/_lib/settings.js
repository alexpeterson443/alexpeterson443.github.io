// The settings he can change without a deploy.
//
// Everything here was originally a var in wrangler.toml, which meant that
// moving the alley's closing time by half an hour needed a laptop and a
// terminal. The stored values live in one KV record and are laid over the
// deploy time config, so anything he has never touched still comes from
// wrangler.toml and keeps working exactly as before.
//
// The keys in the record are the env names, so overlaying is a spread. The
// client speaks camelCase; the mapping between them is FIELDS.

import { isValidIsoDate } from "./streak.js";
import { parseHours, DEFAULT_HOURS, DEFAULT_LAST_CALL } from "./hours.js";

/** Client name to env name. Nothing outside this list can be set. */
export const FIELDS = {
  startDate: "START_DATE",
  timezone: "TIMEZONE",
  hours: "HOURS",
  lastCallMinutes: "LAST_CALL_MINUTES",
  calendarIcsUrl: "CALENDAR_ICS_URL",
  calendarKeyword: "CALENDAR_KEYWORD",
};

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** True when the runtime recognises the zone. Anything else would silently
 *  move every day boundary to UTC, which is not a failure worth being quiet
 *  about. */
export function isValidTimezone(tz) {
  if (typeof tz !== "string" || !tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const isClock = (v) => typeof v === "string" && /^([01]?\d|2[0-3]):[0-5]\d$/.test(v);

/**
 * An hours table from the client: {mon: ["10:00", "22:00"], tue: null, ...}.
 * Days left out keep whatever the table already had.
 */
function checkHours(raw, errors) {
  if (raw === null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    errors.push("hours must be a table of days");
    return undefined;
  }
  const out = {};
  for (const day of DAYS) {
    if (!Object.hasOwn(raw, day)) continue;
    const v = raw[day];
    if (v === null) { out[day] = null; continue; }
    if (!Array.isArray(v) || v.length !== 2 || !isClock(v[0]) || !isClock(v[1])) {
      errors.push(`${day} must be two times like "10:00" and "22:00", or null for closed`);
      continue;
    }
    const [open, close] = v;
    const mins = (t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
    if (mins(close) <= mins(open)) {
      errors.push(`${day} closes before it opens`);
      continue;
    }
    out[day] = [open, close];
  }
  return out;
}

/**
 * Check a partial settings object from the client.
 *
 * Returns `{ clean, errors }` with `clean` keyed by env name. A field left out
 * is left alone; a field set to null is cleared back to the deploy time value.
 * `today` is passed in rather than read from a clock so this stays pure.
 */
export function validateSettings(input, today) {
  const errors = [];
  const clean = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { clean, errors: ["expected an object of settings"] };
  }

  for (const [name, key] of Object.entries(FIELDS)) {
    if (!Object.hasOwn(input, name)) continue;
    const v = input[name];
    // Explicit null means "stop overriding this", which is not the same as
    // setting it to empty.
    if (v === null && name !== "hours") { clean[key] = null; continue; }

    switch (name) {
      case "startDate":
        if (!isValidIsoDate(v)) errors.push("start date must be YYYY-MM-DD");
        else if (today && v > today) errors.push("the streak cannot start in the future");
        else clean[key] = v;
        break;
      case "timezone":
        if (!isValidTimezone(v)) errors.push(`${v} is not a timezone this runtime knows`);
        else clean[key] = v;
        break;
      case "hours": {
        const h = checkHours(v, errors);
        if (h !== undefined) clean[key] = h;
        break;
      }
      case "lastCallMinutes": {
        const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
        if (!Number.isInteger(n) || n < 0 || n > 240) errors.push("last call must be a whole number of minutes from 0 to 240");
        else clean[key] = String(n);
        break;
      }
      case "calendarIcsUrl": {
        if (typeof v !== "string") { errors.push("the calendar feed must be a URL"); break; }
        const s = v.trim();
        if (s === "") { clean[key] = null; break; }
        if (s.length > 2000 || !/^(https?|webcal):\/\//i.test(s)) {
          errors.push("the calendar feed must be an http, https or webcal URL");
          break;
        }
        clean[key] = s;
        break;
      }
      case "calendarKeyword": {
        if (typeof v !== "string") { errors.push("the keyword must be a word"); break; }
        const s = v.trim();
        if (s.length < 1 || s.length > 40) errors.push("the keyword must be 1 to 40 characters");
        else clean[key] = s;
        break;
      }
    }
  }
  return { clean, errors };
}

/** Drop the cleared fields, so a stored record only holds real overrides. */
export function applySettings(saved, patch) {
  const out = { ...saved };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete out[k];
    else out[k] = v;
  }
  return out;
}

/**
 * A full seven day table with his changes laid over it.
 *
 * An hours patch names only the days he touched, but a stored table is read
 * whole and missing days fall back to the built in defaults rather than to the
 * deploy config. Filling the table in here is what stops editing Friday from
 * quietly resetting Monday.
 */
export function mergeHours(current, patch) {
  const out = {};
  for (const day of DAYS) out[day] = Object.hasOwn(patch, day) ? patch[day] : current[day];
  return out;
}

/**
 * Drop anything that matches the deploy config.
 *
 * Without this the record fills up with values identical to wrangler.toml,
 * the screen claims he has changed five things when he changed two, and a
 * later deploy that moves one of them would be overridden by a copy of its
 * own old value.
 */
export function pruneDefaults(env, record) {
  const { deploy } = settingsView(env, {});
  const same = {
    START_DATE: (v) => v === deploy.startDate,
    TIMEZONE: (v) => v === deploy.timezone,
    CALENDAR_KEYWORD: (v) => v === deploy.calendarKeyword,
    LAST_CALL_MINUTES: (v) => Number(v) === deploy.lastCallMinutes,
    HOURS: (v) => JSON.stringify(settingsView(env, { HOURS: v }).effective.hours) === JSON.stringify(deploy.hours),
    CALENDAR_ICS_URL: () => false,
  };
  const out = {};
  for (const [k, v] of Object.entries(cleanRecord(record))) {
    if (!same[k] || !same[k](v)) out[k] = v;
  }
  return out;
}

/** Only the keys that are ours, so nothing else can be written into the record. */
export function cleanRecord(raw) {
  const allowed = new Set(Object.values(FIELDS));
  const out = {};
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) if (allowed.has(k) && v !== null) out[k] = v;
  }
  return out;
}

/** The deploy time config with his saved values laid over it. */
export function mergeEnv(env, saved) {
  return { ...env, ...cleanRecord(saved) };
}

/**
 * A feed URL is a credential for his calendar, so it is never read back whole.
 *
 * Only the host comes back. The tail would be the tempting thing to show, but
 * a Google feed ends "/basic.ics" whatever the account, so it identifies
 * nothing while carrying token characters; the host at least says which
 * calendar service is on the other end.
 */
function feedView(value, source) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return { configured: false, source: "none", host: "" };
  let host = "";
  try { host = new URL(s.replace(/^webcal:/i, "https:")).hostname; } catch { host = ""; }
  return { configured: true, source, host };
}

/**
 * What the settings screen renders: the values in force, where each came from,
 * and what they would fall back to.
 */
export function settingsView(env, saved) {
  const record = cleanRecord(saved);
  const merged = mergeEnv(env, record);
  const table = (src) => {
    const h = parseHours(src);
    const out = {};
    for (let i = 0; i < 7; i++) {
      out[DAYS[i]] = h[i] === null ? null : [pad(h[i][0]), pad(h[i][1])];
    }
    return out;
  };
  return {
    effective: {
      startDate: merged.START_DATE || "",
      timezone: merged.TIMEZONE || "America/Chicago",
      hours: table(merged.HOURS),
      lastCallMinutes: lastCall(merged.LAST_CALL_MINUTES),
      calendarKeyword: merged.CALENDAR_KEYWORD || "bowl",
      calendar: feedView(merged.CALENDAR_ICS_URL, record.CALENDAR_ICS_URL ? "saved" : "deploy"),
    },
    deploy: {
      startDate: env.START_DATE || "",
      timezone: env.TIMEZONE || "America/Chicago",
      hours: table(env.HOURS),
      lastCallMinutes: lastCall(env.LAST_CALL_MINUTES),
      calendarKeyword: env.CALENDAR_KEYWORD || "bowl",
      calendar: feedView(env.CALENDAR_ICS_URL, "deploy"),
    },
    // Which fields he has changed, so the screen can offer to put them back.
    overridden: Object.keys(record)
      .map((k) => Object.keys(FIELDS).find((n) => FIELDS[n] === k))
      .filter(Boolean)
      .sort(),
  };
}

function pad(min) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function lastCall(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 240 ? n : DEFAULT_LAST_CALL;
}

export { DEFAULT_HOURS, DAYS };
