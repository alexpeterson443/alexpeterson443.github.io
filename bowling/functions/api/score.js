import { loadDays, saveDays, loadScores, saveScores, buildState } from "../_lib/store.js";
import { todayIn } from "../_lib/streak.js";
import { isValidScore } from "../_lib/scores.js";

// POST /api/score {score?, date?}     -> log a game (also verifies that day);
//                                        score null or missing = score unknown
// DELETE /api/score {date, index}     -> remove one game
export async function onRequestPost({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const body = await request.json().catch(() => ({}));
  const score = body.score === null || body.score === undefined || body.score === "" ? null : Number(body.score);
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : today;

  if (!isValidScore(score)) {
    return Response.json({ error: "score must be a whole number from 0 to 300" }, { status: 400 });
  }
  if (date < env.START_DATE || date > today) {
    return Response.json({ error: "date must be between the start date and today" }, { status: 400 });
  }

  const scores = await loadScores(env);
  (scores[date] ||= []).push(score);
  await saveScores(env, scores);

  // A logged game is proof you bowled that day.
  const days = await saveDays(env, [...(await loadDays(env)), date]);
  return Response.json(buildState(env, days, scores));
}

export async function onRequestDelete({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const scores = await loadScores(env);
  const list = scores[body.date];
  if (!list || !Number.isInteger(body.index) || body.index < 0 || body.index >= list.length) {
    return Response.json({ error: "no such game" }, { status: 400 });
  }
  list.splice(body.index, 1);
  await saveScores(env, scores);
  return Response.json(buildState(env, await loadDays(env), scores));
}
