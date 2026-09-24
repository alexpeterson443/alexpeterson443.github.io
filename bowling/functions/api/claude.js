import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { summaryText } from "../_lib/summary.js";
import { liveKv } from "../_lib/live.js";

// GET /api/claude?key=<read key> -> the streak and scores as plain text
//
// For Claude in a chat, which fetches a URL and reads it. The middleware lets
// the read only key through to this and /api/state, and nowhere else.
//
// Nothing here is cached: the middleware marks it no-store and every call reads
// afresh. The streak's records come from the D1 copy (see _lib/live.js), so a
// game logged on the phone is in the very next fetch. The rest, such as the
// layout and the calendar cache, come from KV at its 30 second floor.
export async function onRequestGet({ env: raw }) {
  const env = { ...raw, STREAK_KV: liveKv(raw.STREAK_KV, raw.LIVE_DB) };
  const cfg = await configFor(env);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  const state = await buildState(cfg, days, scores, null, { analysis: true });
  return new Response(summaryText(state), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
