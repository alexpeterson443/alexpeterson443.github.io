import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { isValidIsoDate } from "../_lib/streak.js";
import { putFrames, validLane } from "../_lib/games.js";

// PUT /api/frames {date, index, frames, lane?} -> frames for a game already
//                                                logged as a total
//
// The frames must add up to the total on file. The total is what the streak
// and every older figure were built on, so frames that disagree are refused
// rather than silently rewriting a game.
export async function onRequestPut({ request, env }) {
  const cfg = await configFor(env);
  if (!cfg.LIVE_DB) return Response.json({ error: "frame storage is not set up" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const scores = await loadScores(cfg);
  const list = isValidIsoDate(body.date) && Object.hasOwn(scores, body.date) ? scores[body.date] : null;
  if (!list || !Number.isInteger(body.index) || body.index < 0 || body.index >= list.length) {
    return Response.json({ error: "no such game" }, { status: 400 });
  }
  if (!validLane(body.lane)) return Response.json({ error: "lane must be a whole number from 1 to 99" }, { status: 400 });
  const res = await putFrames(cfg.LIVE_DB, body.date, list, body.index, body.frames, body.lane);
  if (res.error) return Response.json({ error: res.error }, { status: 400 });
  return Response.json(await buildState(cfg, await loadDays(cfg), scores));
}
