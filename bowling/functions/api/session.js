import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { todayIn, isValidIsoDate } from "../_lib/streak.js";
import { setPain, validPain } from "../_lib/games.js";

// PUT /api/session {date?, pain} -> how the leg felt that night, 0 to 3, or
//                                   null to clear it
//
// Entered at the end of a night. It is optional and never touches the streak.
export async function onRequestPut({ request, env }) {
  const cfg = await configFor(env);
  if (!cfg.LIVE_DB) return Response.json({ error: "session storage is not set up" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const today = todayIn(cfg.TIMEZONE || "America/Chicago");
  const date = body.date === undefined ? today : body.date;
  if (!isValidIsoDate(date) || date < cfg.START_DATE || date > today) {
    return Response.json({ error: "date must be between the start date and today" }, { status: 400 });
  }
  if (body.pain === undefined || !validPain(body.pain)) {
    return Response.json({ error: "pain must be 0, 1, 2 or 3, or null to clear it" }, { status: 400 });
  }
  await setPain(cfg.LIVE_DB, date, body.pain);
  const scores = await loadScores(cfg);
  return Response.json(await buildState(cfg, await loadDays(cfg), scores));
}
