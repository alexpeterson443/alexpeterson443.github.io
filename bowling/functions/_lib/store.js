import { todayIn, msUntilMidnight, computeStats, dateRange, addDays } from "./streak.js";

const KEY = "checkins";

/**
 * Days verified before this site existed. Alex started bowling on the day
 * after move in (Fri 2026-08-28) and has bowled every day since, so the first
 * week is seeded as verified. Only applied when KV is completely empty.
 */
const SEED_THROUGH = "2026-09-03";

export async function loadDays(env) {
  const raw = await env.STREAK_KV.get(KEY, "json");
  if (Array.isArray(raw)) return raw;
  const seed = dateRange(env.START_DATE, SEED_THROUGH);
  await env.STREAK_KV.put(KEY, JSON.stringify(seed));
  return seed;
}

export async function saveDays(env, days) {
  const clean = [...new Set(days)].sort();
  await env.STREAK_KV.put(KEY, JSON.stringify(clean));
  return clean;
}

export function buildState(env, days) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const stats = computeStats(days, today, env.START_DATE);
  return {
    ...stats,
    timezone: tz,
    yesterday: addDays(today, -1),
    msUntilMidnight: msUntilMidnight(tz),
  };
}
