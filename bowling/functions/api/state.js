import { loadDays, loadScores, buildState, configFor, settleClosures } from "../_lib/store.js";
import { todayIn } from "../_lib/streak.js";

// GET /api/state              -> everything the app shows
// GET /api/state?analysis=1   -> plus the full analysis behind Claude's link
export async function onRequestGet({ request, env }) {
  // Everything downstream reads the config, not the bare env, so a setting he
  // changed on the settings screen is in force here too.
  const cfg = await configFor(env);
  // Closed dates that rolled past unbowled become "lanes" pauses here too, so
  // they are on file even if the timer has not run since midnight.
  await settleClosures(cfg, todayIn(cfg.TIMEZONE || "America/Chicago")).catch(() => []);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  const analysis = request ? new URL(request.url).searchParams.get("analysis") === "1" : false;
  return Response.json(await buildState(cfg, days, scores, null, { analysis }));
}
