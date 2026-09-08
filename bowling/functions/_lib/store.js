import { todayIn, msUntilMidnight, computeStats, dateRange, addDays, excuseMap } from "./streak.js";
import { scoreStats } from "./scores.js";
import { progressReport } from "./progress.js";
import { bowlingSchedule } from "./calendar.js";
import { hoursFromEnv, hoursStatus, lastCallFromEnv } from "./hours.js";

const KEY = "checkins";
const SCORES_KEY = "scores";
const EXCUSED_KEY = "excused";

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

/**
 * Excused days as a {date: reason} map. Older records were a plain list of
 * dates, which loads as "closed" for every day.
 */
export async function loadExcused(env) {
  return excuseMap(await env.STREAK_KV.get(EXCUSED_KEY, "json"));
}

export async function saveExcused(env, excused) {
  const map = excuseMap(excused);
  const clean = Object.fromEntries(Object.keys(map).sort().map((d) => [d, map[d]]));
  await env.STREAK_KV.put(EXCUSED_KEY, JSON.stringify(clean));
  return clean;
}

/**
 * The score record, as {games, ids}.
 *
 * `ids` is a ledger of game ids the client has already had accepted. It is what
 * makes a retry safe: a phone that loses signal after the write lands can send
 * the same game again without logging it twice. Both live under one KV key so a
 * game and its id are written in a single operation, never half applied.
 *
 * Older records were the bare {date: [...]} map and load as a ledger with no ids.
 */
export async function loadLedger(env) {
  const raw = await env.STREAK_KV.get(SCORES_KEY, "json");
  const src = raw && typeof raw === "object" && raw.games && typeof raw.games === "object" ? raw.games : raw;
  const games = {};
  if (src && typeof src === "object") {
    for (const [d, list] of Object.entries(src)) if (Array.isArray(list)) games[d] = list;
  }
  const ids = raw && Array.isArray(raw.ids) ? raw.ids.filter((v) => typeof v === "string") : [];
  return { games, ids };
}

/** Ids kept on file. Enough to cover any realistic backlog of unsent games. */
export const MAX_IDS = 500;

export async function saveLedger(env, games, ids = []) {
  for (const d of Object.keys(games)) if (!games[d].length) delete games[d];
  const trimmed = ids.slice(-MAX_IDS);
  await env.STREAK_KV.put(SCORES_KEY, JSON.stringify({ games, ids: trimmed }));
  return { games, ids: trimmed };
}

export async function loadScores(env) {
  return (await loadLedger(env)).games;
}

/** Save games while preserving the id ledger already on file. */
export async function saveScores(env, scores) {
  const { ids } = await loadLedger(env);
  return (await saveLedger(env, scores, ids)).games;
}

export async function buildState(env, days, scores = {}, excused = null) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  if (excused === null) excused = await loadExcused(env);
  // A day counts as bowled only when it has a scored game. Check ins in
  // `days` are legacy records from before scores were required.
  const scored = Object.keys(scores).filter((d) => scores[d].some((n) => typeof n === "number"));
  const bowled = [...days, ...scored];
  const stats = computeStats(bowled, today, env.START_DATE, excused);
  const calendar = await bowlingSchedule(env).catch((e) => ({ configured: true, today: [], next: null, error: e.message }));
  return {
    ...stats,
    scores: scoreStats(scores),
    progress: progressReport(scores),
    gamesToday: (scores[today] || []).length,
    scoresToday: (scores[today] || []).filter((n) => typeof n === "number"),
    calendar,
    hours: hoursStatus(hoursFromEnv(env), tz, today, new Date(), lastCallFromEnv(env)),
    timezone: tz,
    yesterday: addDays(today, -1),
    msUntilMidnight: msUntilMidnight(tz),
  };
}
