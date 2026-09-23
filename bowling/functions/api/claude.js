import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { summaryText } from "../_lib/summary.js";

// GET /api/claude?key=<read key> -> the streak and scores as plain text
//
// For Claude in a chat, which fetches a URL and reads it. The middleware lets
// the read only key through to this and /api/state, and nowhere else.
export async function onRequestGet({ env }) {
  const cfg = await configFor(env);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  const state = await buildState(cfg, days, scores);
  return new Response(summaryText(state), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
