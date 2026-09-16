// Web push, the small half of it.
//
// A push can carry an encrypted payload, and that costs a whole ECDH and AES
// GCM dance per message (RFC 8291). This app never needs it: there is exactly
// one thing worth saying at 7:45pm, and the service worker can fetch the rest
// from the API it is already allowed to read. So these are bodyless pushes,
// which need only the VAPID signature, and that WebCrypto does natively.
//
// The private key lives in the VAPID_PRIVATE_JWK secret. The public half is
// also compiled into the client as a raw P-256 point, because that is the shape
// pushManager.subscribe wants for applicationServerKey.

const encoder = new TextEncoder();

function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const b64urlJson = (obj) => b64url(encoder.encode(JSON.stringify(obj)));

/** True when a subscription looks like something the push service will accept. */
export function isSubscription(sub) {
  if (!sub || typeof sub !== "object") return false;
  if (typeof sub.endpoint !== "string") return false;
  if (!/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return false;
  try {
    new URL(sub.endpoint);
  } catch {
    return false;
  }
  return true;
}

/**
 * A VAPID Authorization header for one push endpoint.
 *
 * The audience is the origin of the push service, not our own, and the token is
 * only good for twelve hours, so it is minted per send rather than cached.
 */
export async function vapidHeader(endpoint, privateJwk, subject, now = Date.now()) {
  const jwk = typeof privateJwk === "string" ? JSON.parse(privateJwk) : privateJwk;
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, d: jwk.d, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const header = b64urlJson({ typ: "JWT", alg: "ES256" });
  const body = b64urlJson({
    aud: new URL(endpoint).origin,
    exp: Math.floor(now / 1000) + 12 * 60 * 60,
    sub: subject,
  });
  const signed = `${header}.${body}`;
  // ECDSA over P-256 hands back r||s, which is exactly the JWS ES256 signature.
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(signed));

  // The public half travels with the token so the push service can check it.
  const pub = b64url(new Uint8Array([
    4,
    ...Array.from(atob(jwk.x.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
    ...Array.from(atob(jwk.y.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
  ]));

  return `vapid t=${signed}.${b64url(sig)}, k=${pub}`;
}

/**
 * Send one bodyless push.
 *
 * Returns `{ ok, status, gone }`. `gone` means the push service has retired the
 * subscription (404 or 410); the caller should forget it rather than retry it
 * every evening forever.
 */
export async function sendPush(sub, env, now = Date.now()) {
  const auth = await vapidHeader(sub.endpoint, env.VAPID_PRIVATE_JWK, env.VAPID_SUBJECT || "mailto:nobody@example.com", now);
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: auth,
      TTL: "3600",
      // Bodyless, so the push service is told not to expect content.
      "Content-Length": "0",
      Urgency: "high",
      // One pending nudge at a time: a later one replaces an undelivered
      // earlier one rather than stacking on the lock screen.
      Topic: "bowl",
    },
  });
  return { ok: res.ok, status: res.status, gone: res.status === 404 || res.status === 410 };
}
