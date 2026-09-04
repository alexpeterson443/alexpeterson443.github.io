import { parseEvents, expandOccurrences } from "./ics.js";
import { todayIn, dayNumber, addDays } from "./streak.js";

const CACHE_KEY = "ics_cache";
const CACHE_TTL_MS = 10 * 60_000;

function feedUrl(env) {
  const u = (env.CALENDAR_ICS_URL || "").trim();
  if (!u) return null;
  return u.replace(/^webcal:\/\//i, "https://");
}

async function fetchFeed(env) {
  const url = feedUrl(env);
  const cached = await env.STREAK_KV.get(CACHE_KEY, "json");
  if (cached && cached.url === url && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "bowling-streak/1.0" } });
    if (!res.ok) throw new Error(`calendar feed returned ${res.status}`);
    const text = await res.text();
    const fresh = { url, fetchedAt: Date.now(), text };
    await env.STREAK_KV.put(CACHE_KEY, JSON.stringify(fresh), { expirationTtl: 86_400 });
    return fresh;
  } catch (err) {
    if (cached && cached.url === url) return { ...cached, stale: true, error: err.message };
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

  const keyword = (env.CALENDAR_KEYWORD || "bowl").toLowerCase();
  const today = todayIn(tz);
  const now = Date.now();
  let feed;
  try {
    feed = await fetchFeed(env);
  } catch (err) {
    return { configured: true, today: [], next: null, error: err.message };
  }

  const fromMs = dayNumber(addDays(today, -1)) * 86_400_000;
  const toMs = dayNumber(addDays(today, 21)) * 86_400_000;
  const events = parseEvents(feed.text, tz);
  const matches = expandOccurrences(events, fromMs, toMs).filter((o) =>
    `${o.summary}\n${o.description}\n${o.location}`.toLowerCase().includes(keyword),
  );

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

  const todays = matches.filter((o) => dateIn(o.start, tz) === today).map(describe);
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
