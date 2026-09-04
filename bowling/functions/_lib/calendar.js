import { parseEvents, expandOccurrences } from "./ics.js";
import { todayIn, dayNumber, addDays } from "./streak.js";

const CACHE_KEY = "cal_cache";
const CACHE_TTL_MS = 10 * 60_000;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_FEED_BYTES = 2_000_000;

function feedUrl(env) {
  const u = (env.CALENDAR_ICS_URL || "").trim();
  if (!u) return null;
  return u.replace(/^webcal:\/\//i, "https://");
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function downloadFeed(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "bowling-streak/1.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`calendar feed returned ${res.status}`);
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > MAX_FEED_BYTES) throw new Error("calendar feed too large");
  const text = await res.text();
  if (text.length > MAX_FEED_BYTES) throw new Error("calendar feed too large");
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("calendar link did not return a calendar");
  return text;
}

/**
 * Matching occurrences for the window, cached in KV for 10 minutes. Only the
 * matched sessions are stored, never the raw feed or the feed URL.
 */
async function cachedOccurrences(env, url, keyword, fromMs, toMs, tz) {
  const urlHash = (await sha256(url)).slice(0, 16);
  const cached = await env.STREAK_KV.get(CACHE_KEY, "json");
  const usable = cached && cached.urlHash === urlHash && cached.keyword === keyword && cached.fromMs === fromMs;
  if (usable && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
  try {
    const text = await downloadFeed(url);
    const events = parseEvents(text, tz);
    const occurrences = expandOccurrences(events, fromMs, toMs)
      .filter((o) => `${o.summary}\n${o.location}`.toLowerCase().includes(keyword))
      .map((o) => ({ summary: o.summary, location: o.location, start: o.start, end: o.end, allDay: o.allDay }));
    const fresh = { urlHash, keyword, fromMs, fetchedAt: Date.now(), occurrences };
    await env.STREAK_KV.put(CACHE_KEY, JSON.stringify(fresh), { expirationTtl: 86_400 });
    return fresh;
  } catch (err) {
    if (usable) return { ...cached, stale: true, error: err.message };
    throw err;
  }
}

function fmtTime(ms, tz) {
  return new Date(ms).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
}

function dateIn(ms, tz) {
  return todayIn(tz, new Date(ms));
}

/**
 * Bowling sessions from the calendar: today's, and the next upcoming one.
 * Returns { configured, today: [...], next, matched, fetchedAt, error? }.
 */
export async function bowlingSchedule(env) {
  const tz = env.TIMEZONE || "America/Chicago";
  if (!feedUrl(env)) return { configured: false, today: [], next: null };

  // Title or location only: notes on other events often mention bowling.
  const keyword = (env.CALENDAR_KEYWORD || "bowl").toLowerCase();
  const today = todayIn(tz);
  const now = Date.now();
  const fromMs = dayNumber(addDays(today, -1)) * 86_400_000;
  const toMs = dayNumber(addDays(today, 21)) * 86_400_000;

  let feed;
  try {
    feed = await cachedOccurrences(env, feedUrl(env), keyword, fromMs, toMs, tz);
  } catch (err) {
    return { configured: true, today: [], next: null, error: err.message };
  }
  const matches = feed.occurrences;

  const describe = (o) => ({
    summary: o.summary,
    location: o.location,
    date: dateIn(o.start, tz),
    allDay: o.allDay,
    start: o.start,
    end: o.end,
    time: o.allDay ? "All day" : `${fmtTime(o.start, tz)} to ${fmtTime(o.end, tz)}`,
    ended: o.end <= now,
    inProgress: o.start <= now && o.end > now,
  });

  const rank = (t) => (t.inProgress ? 0 : !t.ended ? 1 : 2);
  const todays = matches
    .filter((o) => dateIn(o.start, tz) === today)
    .map(describe)
    .sort((a, b) => rank(a) - rank(b) || a.start - b.start);
  const next = matches.filter((o) => o.start > now && dateIn(o.start, tz) !== today).map(describe)[0] || null;

  return {
    configured: true,
    today: todays,
    next,
    matched: matches.length,
    fetchedAt: feed.fetchedAt,
    stale: !!feed.stale,
    error: feed.error,
  };
}
