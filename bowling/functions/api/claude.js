import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { summaryText } from "../_lib/summary.js";

// GET /api/claude?key=<read key> -> the streak and scores as plain text
//
// For Claude in a chat, which fetches a URL and reads it. The middleware lets
// the read only key through to this and /api/state, and nowhere else.
//
// Nothing here is cached: the middleware marks it no-store and every call reads
// KV afresh. KV itself keeps a copy at each edge for 60 seconds by default, so a
// game logged on the phone could take a minute to reach a fetch served from
// another data centre. Reads here ask for the 30 second floor instead.
const FRESH = 30;

function freshKv(kv) {
  return {
    ...kv,
    get: (key, opts) => kv.get(key, typeof opts === "string" ? { type: opts, cacheTtl: FRESH } : { ...opts, cacheTtl: FRESH }),
    put: kv.put.bind(kv),
    delete: kv.delete.bind(kv),
  };
}

export async function onRequestGet({ env: raw }) {
  const env = { ...raw, STREAK_KV: freshKv(raw.STREAK_KV) };
  const cfg = await configFor(env);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  const state = await buildState(cfg, days, scores);
  return new Response(summaryText(state), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
