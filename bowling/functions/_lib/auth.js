// Cookie session: HMAC(SESSION_SECRET, expiry) so nothing is stored server side.

export const COOKIE = "bowl_session";
const SESSION_DAYS = 90;

const enc = new TextEncoder();

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(env, supplied) {
  if (!env.PASSWORD || typeof supplied !== "string") return false;
  // Compare HMACs rather than raw strings so lengths never leak.
  const secret = env.SESSION_SECRET || env.PASSWORD;
  const a = await hmac(secret, supplied);
  const b = await hmac(secret, env.PASSWORD);
  return timingSafeEqual(a, b);
}

export async function makeSessionCookie(env, request) {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const sig = await hmac(env.SESSION_SECRET || env.PASSWORD, String(exp));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86_400}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function hasValidSession(env, request) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [exp, sig] = match[1].split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmac(env.SESSION_SECRET || env.PASSWORD, exp);
  return timingSafeEqual(sig, expected);
}
