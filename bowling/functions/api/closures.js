import { configFor, loadClosures, saveClosures, settleClosures } from "../_lib/store.js";
import { cleanReason } from "../_lib/closures.js";
import { todayIn, addDays, isValidIsoDate, PAUSE_AHEAD_DAYS } from "../_lib/streak.js";

// GET  /api/closures                    -> {closures: {date: reason}}   (private link only)
// POST /api/closures {date, reason}     -> set the alley closed that day
// POST /api/closures {date, reason: null} -> lift it
//
// For setting closures remotely. Besides the private link, the middleware
// accepts the X-Closures-Token header (the CLOSURES_TOKEN secret) for a plain
// POST here, the same kind of door the timer has to /api/nudge: it can set or
// lift a closure and nothing more.
//
// On a closed date no notification goes out and the alley reads as shut. Once
// the date has passed with no game it is paused for "lanes"; see
// _lib/closures.js.
export async function onRequestGet({ env }) {
  const cfg = await configFor(env);
  return Response.json({ closures: await loadClosures(cfg) });
}

export async function onRequestPost({ request, env }) {
  const cfg = await configFor(env);
  const today = todayIn(cfg.TIMEZONE || "America/Chicago");
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "expected {date, reason}" }, { status: 400 });
  }

  const { date } = body;
  if (!isValidIsoDate(date)) return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  if (cfg.START_DATE && date < cfg.START_DATE) {
    return Response.json({ error: `date is before the streak started (${cfg.START_DATE})` }, { status: 400 });
  }
  if (date > addDays(today, PAUSE_AHEAD_DAYS)) {
    return Response.json({ error: `date is more than ${PAUSE_AHEAD_DAYS} days ahead` }, { status: 400 });
  }

  // null lifts the closure. Anything else must be a reason in words.
  const lift = body.reason === null;
  const reason = lift ? null : cleanReason(body.reason);
  if (!lift && !reason) {
    return Response.json({ error: "reason must be non-empty text, or null to lift the closure" }, { status: 400 });
  }

  const closures = { ...(await loadClosures(cfg)) };
  if (lift) delete closures[date];
  else closures[date] = reason;
  const saved = await saveClosures(cfg, closures);
  // A closure set after the fact for a day already gone is settled now rather
  // than on the next timer tick.
  const settled = lift ? [] : await settleClosures(cfg, today).catch(() => []);
  return Response.json({ date, reason, closures: saved, settled });
}
