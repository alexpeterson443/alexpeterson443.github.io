import { loadDays, loadScores, saveScores, loadLedger, saveLedger, buildState, configFor } from "../_lib/store.js";
import { todayIn, isValidIsoDate } from "../_lib/streak.js";
import { isValidScore } from "../_lib/scores.js";
import { checkFrames, validLane, syncDate, removeGame } from "../_lib/games.js";

// POST /api/score {score, date?, id?, frames?, lane?}
//                                     -> log a game; a real score is what
//                                        verifies that day as bowled. Frames
//                                        are optional and must add up to score.
// DELETE /api/score {date, index}     -> remove one game
//
// The total goes to KV exactly as it always has; the streak reads nothing
// else. Frames, lane and the logged time go to D1 afterwards and never fail
// the request (see _lib/games.js).
export async function onRequestPost({ request, env }) {
  const cfg = await configFor(env);
  const tz = cfg.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const body = await request.json().catch(() => ({}));
  const score = body.score;
  const date = body.date === undefined ? today : body.date;

  if (!isValidIsoDate(date)) {
    return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  if (typeof score !== "number") {
    return Response.json({ error: "a score is required to log a game" }, { status: 400 });
  }
  if (!isValidScore(score)) {
    return Response.json({ error: "score must be a whole number from 0 to 300" }, { status: 400 });
  }
  if (date < cfg.START_DATE || date > today) {
    return Response.json({ error: "date must be between the start date and today" }, { status: 400 });
  }
  let frames = null;
  if (body.frames !== undefined && body.frames !== null) {
    const checked = checkFrames(body.frames);
    if (checked.error) return Response.json({ error: checked.error }, { status: 400 });
    if (checked.score !== score) {
      return Response.json({ error: `those frames add up to ${checked.score}, not ${score}` }, { status: 400 });
    }
    frames = checked.frames;
  }
  if (!validLane(body.lane)) return Response.json({ error: "lane must be a whole number from 1 to 99" }, { status: 400 });
  const lane = body.lane ?? null;

  // An id makes the write idempotent. A phone that loses signal after the write
  // lands retries the same game; without this that retry would log it twice.
  const id = typeof body.id === "string" && body.id.length > 0 && body.id.length <= 64 ? body.id : null;

  let ledger = await loadLedger(cfg);
  if (id && ledger.ids.includes(id)) {
    // Already recorded. Report success so the client can clear it from its queue.
    return Response.json({ ...(await buildState(cfg, await loadDays(cfg), ledger.games)), duplicate: true });
  }

  (ledger.games[date] ||= []).push(score);
  const ids = id ? [...ledger.ids, id] : ledger.ids;
  await saveLedger(cfg, ledger.games, ids);

  // KV has no compare and set, so a write that raced another one can be lost.
  // Read back and, if this game is missing, apply it again to the current record.
  const after = await loadLedger(cfg);
  const landed = id
    ? after.ids.includes(id)
    : (after.games[date] || []).length >= (ledger.games[date] || []).length;
  if (!landed) {
    (after.games[date] ||= []).push(score);
    ledger = await saveLedger(cfg, after.games, id ? [...after.ids, id] : after.ids);
  } else {
    ledger = after;
  }

  if (cfg.LIVE_DB) {
    const list = ledger.games[date] || [];
    await syncDate(cfg.LIVE_DB, date, list, {
      id: id || `g:${date}:${Date.now().toString(36)}`, lane, loggedAt: Date.now(), frames,
    }).catch(() => {});
  }

  // A scored game is the proof that the day was bowled; nothing else is.
  return Response.json(await buildState(cfg, await loadDays(cfg), ledger.games));
}

export async function onRequestDelete({ request, env }) {
  const cfg = await configFor(env);
  const body = await request.json().catch(() => ({}));
  const scores = await loadScores(cfg);
  const list = isValidIsoDate(body.date) && Object.hasOwn(scores, body.date) ? scores[body.date] : null;
  if (!list || !Number.isInteger(body.index) || body.index < 0 || body.index >= list.length) {
    return Response.json({ error: "no such game" }, { status: 400 });
  }
  const [removed] = list.splice(body.index, 1);
  await saveScores(cfg, scores);
  if (cfg.LIVE_DB) await removeGame(cfg.LIVE_DB, body.date, body.index, scores[body.date] || [], removed).catch(() => {});
  return Response.json(await buildState(cfg, await loadDays(cfg), scores));
}
