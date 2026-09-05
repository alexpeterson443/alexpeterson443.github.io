import { loadDays, loadScores, saveScores, buildState } from "../_lib/store.js";
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

  const scores = await loadScores(env);
  (scores[date] ||= []).push(score);
  await saveScores(env, scores);

  // A scored game is the proof that the day was bowled; nothing else is.
  return Response.json(await buildState(env, await loadDays(env), scores));
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
