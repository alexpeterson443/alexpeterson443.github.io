import { loadDays, saveDays, buildState } from "../_lib/store.js";
import { todayIn, addDays } from "../_lib/streak.js";

// POST /api/checkin            -> verify today
// POST /api/checkin {date}     -> verify today or yesterday (grace for late entry)
// DELETE /api/checkin {date}   -> undo a verification
export async function onRequestPost({ request, env }) {
  const tz = env.TIMEZONE || "America/Chicago";
  const today = todayIn(tz);
  const body = await request.json().catch(() => ({}));
  const date = body.date || today;

  // You can only vouch for today, or for yesterday if you forgot to tap.
  if (date !== today && date !== addDays(today, -1)) {
    return Response.json({ error: "can only verify today or yesterday" }, { status: 400 });
  }

  const days = await saveDays(env, [...(await loadDays(env)), date]);
  return Response.json(buildState(env, days));
}

export async function onRequestDelete({ request, env }) {
  const body = await request.json().catch(() => ({}));
  if (!body.date) return Response.json({ error: "date required" }, { status: 400 });
  const days = await saveDays(env, (await loadDays(env)).filter((d) => d !== body.date));
  return Response.json(buildState(env, days));
}
