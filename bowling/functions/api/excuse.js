import { loadDays, loadScores, loadExcused, saveExcused, buildState } from "../_lib/store.js";
import { todayIn, addDays, isValidIsoDate, EXCUSE_REASONS } from "../_lib/streak.js";

// POST /api/excuse {date?, reason?} -> you genuinely couldn't bowl that day
//   reason: "closed" (default), "sick" or "injured"; date: today or yesterday
// DELETE /api/excuse {date}         -> undo
export async function onRequestPost({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const body = await request.json().catch(() => ({}));
  const date = body.date === undefined ? today : body.date;
  const reason = body.reason === undefined ? "closed" : body.reason;

  if (!isValidIsoDate(date)) return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  if (date !== today && date !== addDays(today, -1)) {
    return Response.json({ error: "can only excuse today or yesterday" }, { status: 400 });
  }
  if (!EXCUSE_REASONS.includes(reason)) {
    return Response.json({ error: `reason must be one of ${EXCUSE_REASONS.join(", ")}` }, { status: 400 });
  }

  const excused = await saveExcused(env, { ...(await loadExcused(env)), [date]: reason });
  return Response.json(await buildState(env, await loadDays(env), await loadScores(env), excused));
}

export async function onRequestDelete({ request, env }) {
  const body = await request.json().catch(() => ({}));
  if (!isValidIsoDate(body.date)) return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  const excused = { ...(await loadExcused(env)) };
  delete excused[body.date];
  return Response.json(await buildState(env, await loadDays(env), await loadScores(env), await saveExcused(env, excused)));
}
