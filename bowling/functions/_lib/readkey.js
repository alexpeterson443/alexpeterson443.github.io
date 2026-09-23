import { hmac, timingSafeEqual } from "./auth.js";

// A second, weaker key for handing to Claude in a chat.
//
// The private link opens everything, writes included, so it is not something to
// paste into a conversation. This key can only GET the read endpoints below: it
// sets no cookie, logs no game, pauses no day and changes no setting.
//
// It is derived from ACCESS_KEY rather than being a secret of its own, so it
// works the moment the site is deployed with nothing more to set. A counter in
// KV is folded in, and bumping it from the settings screen makes the old key
// stop working without touching the private link.

const GEN_KEY = "read_key_gen";

/** What the read key opens, and only for GET. */
export const READ_PATHS = new Set(["/api/claude", "/api/state"]);

async function generation(env) {
  const n = Number(await env.STREAK_KV.get(GEN_KEY));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export async function readKeyFor(env) {
  if (!env.ACCESS_KEY) return null;
  const gen = await generation(env);
  // "read:" keeps it from ever colliding with the session cookie's signatures.
  return "r" + (await hmac(env.ACCESS_KEY, `read:${gen}`)).slice(0, 32);
}

export async function readKeyMatches(env, supplied) {
  if (typeof supplied !== "string" || !supplied.startsWith("r")) return false;
  const key = await readKeyFor(env);
  if (!key) return false;
  const a = await hmac(env.ACCESS_KEY, supplied);
  const b = await hmac(env.ACCESS_KEY, key);
  return timingSafeEqual(a, b);
}

/** Retire the current read key and mint the next one. */
export async function rotateReadKey(env) {
  await env.STREAK_KV.put(GEN_KEY, String((await generation(env)) + 1));
  return readKeyFor(env);
}
