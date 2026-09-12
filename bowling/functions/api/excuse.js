import { loadDays, loadScores, loadExcused, saveExcused, buildState } from "../_lib/store.js";
import { todayIn, addDays, isValidIsoDate, pauseRange } from "../_lib/streak.js";

// POST   /api/excuse {reason?}                 -> pause today
// POST   /api/excuse {date, reason?}            -> pause today or yesterday
// POST   /api/excuse {from, to?, reason?}       -> pause a run of days, past or ahead
// DELETE /api/excuse {date} | {from, to?}       -> undo a day or a run
//
// A day paused neither breaks nor extends the streak. Reasons: closed, sick,
// injured, away. A day with a scored game on it always wins over a pause, so
// marking a trip that he ends up bowling through costs him nothing.
export async function onRequestPost({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const body = await request.json().catch(() => ({}));

  // A single day still goes through the range check, so there is one path.
  const ranged = body.from !== undefined;
  if (!ranged) {
    const date = body.date === undefined ? today : body.date;
    if (!isValidIsoDate(date)) return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
    // Without dates to reason about, a bare pause is only for the day in front
    // of him: anything else is a trip, and a trip comes with a range.
    if (date !== today && date !== addDays(today, -1)) {
      return Response.json({ error: "use from and to to pause other days" }, { status: 400 });
    }
  }

  const range = pauseRange(
    ranged ? body : { from: body.date === undefined ? today : body.date, reason: body.reason },
    today,
    env.START_DATE,
  );
  if (range.error) return Response.json({ error: range.error }, { status: 400 });

  const excused = { ...(await loadExcused(env)) };
  for (const d of range.dates) excused[d] = range.reason;
  const saved = await saveExcused(env, excused);
  return Response.json(await buildState(env, await loadDays(env), await loadScores(env), saved));
}

export async function onRequestDelete({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
  const body = await request.json().catch(() => ({}));
  const from = body.from === undefined ? body.date : body.from;
  // allowBefore: a day on file from before the current start date still has to
  // be removable, which the pause path deliberately refuses to create.
  const range = pauseRange(
    { from, to: body.to, reason: "closed" },
    todayIn(tz),
    env.START_DATE,
    { allowBefore: true },
  );
  if (range.error) return Response.json({ error: range.error }, { status: 400 });

  const excused = { ...(await loadExcused(env)) };
  for (const d of range.dates) delete excused[d];
  const saved = await saveExcused(env, excused);
  return Response.json(await buildState(env, await loadDays(env), await loadScores(env), saved));
}
