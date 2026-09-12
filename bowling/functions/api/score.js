import { loadDays, loadScores, saveScores, loadLedger, saveLedger, buildState } from "../_lib/store.js";
import { todayIn, isValidIsoDate } from "../_lib/streak.js";
import { isValidScore } from "../_lib/scores.js";

// POST /api/score {score, date?}      -> log a game; a real score is what
//                                        verifies that day as bowled
// DELETE /api/score {date, index}     -> remove one game
export async function onRequestPost({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
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
  if (date < env.START_DATE || date > today) {
    return Response.json({ error: "date must be between the start date and today" }, { status: 400 });
  }

  // An id makes the write idempotent. A phone that loses signal after the write
  // lands retries the same game; without this that retry would log it twice.
  const id = typeof body.id === "string" && body.id.length > 0 && body.id.length <= 64 ? body.id : null;

  let ledger = await loadLedger(env);
  if (id && ledger.ids.includes(id)) {
    // Already recorded. Report success so the client can clear it from its queue.
    return Response.json({ ...(await buildState(env, await loadDays(env), ledger.games)), duplicate: true });
  }

  (ledger.games[date] ||= []).push(score);
  const ids = id ? [...ledger.ids, id] : ledger.ids;
  await saveLedger(env, ledger.games, ids);

  // KV has no compare and set, so a write that raced another one can be lost.
  // Read back and, if this game is missing, apply it again to the current record.
  const after = await loadLedger(env);
  const landed = id
    ? after.ids.includes(id)
    : (after.games[date] || []).length >= (ledger.games[date] || []).length;
  if (!landed) {
    (after.games[date] ||= []).push(score);
    ledger = await saveLedger(env, after.games, id ? [...after.ids, id] : after.ids);
  } else {
    ledger = after;
  }

  // A scored game is the proof that the day was bowled; nothing else is.
  return Response.json(await buildState(env, await loadDays(env), ledger.games));
}

export async function onRequestDelete({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const scores = await loadScores(env);
  const list = isValidIsoDate(body.date) && Object.hasOwn(scores, body.date) ? scores[body.date] : null;
  if (!list || !Number.isInteger(body.index) || body.index < 0 || body.index >= list.length) {
    return Response.json({ error: "no such game" }, { status: 400 });
  }
  list.splice(body.index, 1);
  await saveScores(env, scores);
  return Response.json(await buildState(env, await loadDays(env), scores));
}
