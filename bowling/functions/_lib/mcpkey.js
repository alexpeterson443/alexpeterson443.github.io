import { hmac, timingSafeEqual } from "./auth.js";

// The key for the Claude connector (/api/mcp).
//
// A connector's URL is stored by whatever Claude client it is added to, so it
// must not carry the private link's key, which opens everything. This key opens
// POST /api/mcp and nothing else: no page, no other endpoint, no cookie.
//
// Derived from ACCESS_KEY like the read key, with its own counter in KV, so it
// can be replaced from /api/mcpkey without touching the private link or the
// read key.

const GEN_KEY = "mcp_key_gen";

/** The only path the connector key opens, and only for POST. */
export const MCP_PATH = "/api/mcp";

async function generation(env) {
  const n = Number(await env.STREAK_KV.get(GEN_KEY));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export async function mcpKeyFor(env) {
  if (!env.ACCESS_KEY) return null;
  const gen = await generation(env);
  // "mcp:" keeps it apart from the read key's and the session cookie's signatures.
  return "m" + (await hmac(env.ACCESS_KEY, `mcp:${gen}`)).slice(0, 32);
}

export async function mcpKeyMatches(env, supplied) {
  if (typeof supplied !== "string" || !supplied.startsWith("m")) return false;
  const key = await mcpKeyFor(env);
  if (!key) return false;
  const a = await hmac(env.ACCESS_KEY, supplied);
  const b = await hmac(env.ACCESS_KEY, key);
  return timingSafeEqual(a, b);
}

/** Retire the current connector key and mint the next one. */
export async function rotateMcpKey(env) {
  await env.STREAK_KV.put(GEN_KEY, String((await generation(env)) + 1));
  return mcpKeyFor(env);
}
