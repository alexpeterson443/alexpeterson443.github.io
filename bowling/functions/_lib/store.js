import { todayIn, msUntilMidnight, computeStats, dateRange, addDays } from "./streak.js";
import { scoreStats } from "./scores.js";

const KEY = "checkins";
const SCORES_KEY = "scores";

/**
 * Days verified before this site existed. The streak began Fri 2026-08-28
 * and every day through SEED_THROUGH was bowled, so that first week is seeded
 * as verified. Only applied when KV is completely empty.
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

export async function loadScores(env) {
  const raw = await env.STREAK_KV.get(SCORES_KEY, "json");
  return raw && typeof raw === "object" ? raw : {};
}

export async function saveScores(env, scores) {
  for (const d of Object.keys(scores)) if (!scores[d].length) delete scores[d];
  await env.STREAK_KV.put(SCORES_KEY, JSON.stringify(scores));
  return scores;
}

export function buildState(env, days, scores = {}) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const stats = computeStats(days, today, env.START_DATE);
  return {
    ...stats,
    scores: scoreStats(scores),
    timezone: tz,
    yesterday: addDays(today, -1),
    msUntilMidnight: msUntilMidnight(tz),
  };
}
