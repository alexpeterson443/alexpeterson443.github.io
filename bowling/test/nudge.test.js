import test from "node:test";
import assert from "node:assert/strict";
import { inNudgeWindow, nudgeDecision, LEAD_MS } from "../functions/_lib/nudge.js";
import { hoursStatus, parseHours } from "../functions/_lib/hours.js";
import { isSubscription, vapidHeader } from "../functions/_lib/push.js";

const TZ = "America/Chicago";
const HOURS = parseHours(null);

/** The alley's state on `date` at a given wall clock time in Milwaukee. */
function at(date, hhmm) {
  const now = new Date(`${date}T${hhmm}:00-05:00`);
  return { now: now.getTime(), hours: hoursStatus(HOURS, TZ, date, now, 15) };
}

// A Wednesday: open 10:00 to 22:00, so last call is 21:45 and the window runs
// from 19:45.
const DAY = "2026-09-16";

test("the window opens exactly two hours before last call", () => {
  const { hours } = at(DAY, "12:00");
  assert.equal(hours.lastCallAt, "9:45 PM");
  const open = hours.lastCallMs - LEAD_MS;
  assert.equal(inNudgeWindow(hours, open - 1), false);
  assert.equal(inNudgeWindow(hours, open), true);
  assert.equal(inNudgeWindow(hours, hours.lastCallMs - 1), true);
});

test("the window shuts at last call, not at midnight", () => {
  const { hours } = at(DAY, "12:00");
  assert.equal(inNudgeWindow(hours, hours.lastCallMs), false);
  assert.equal(inNudgeWindow(hours, hours.lastCallMs + 3_600_000), false);
});

test("a settled day is never nudged, however late it is", () => {
  const { now, hours } = at(DAY, "20:30");
  assert.equal(inNudgeWindow(hours, now), true);
  assert.equal(nudgeDecision({ unsettled: false, hours, nowMs: now }).send, false);
  assert.equal(nudgeDecision({ unsettled: true, hours, nowMs: now }).send, true);
});

test("an afternoon is too early to be warned about the evening", () => {
  const { now, hours } = at(DAY, "15:00");
  const d = nudgeDecision({ unsettled: true, hours, nowMs: now });
  assert.equal(d.send, false);
  assert.match(d.why, /too early/);
});

test("Sunday's earlier close moves the reminder with it", () => {
  // Sunday noon to 8pm: last call 7:45pm, so the window opens at 5:45pm.
  const sunday = at("2026-09-20", "18:00");
  assert.equal(sunday.hours.lastCallAt, "7:45 PM");
  assert.equal(inNudgeWindow(sunday.hours, sunday.now), true);
  // The same clock time on the Wednesday is still an hour and three quarters early.
  const wed = at(DAY, "18:00");
  assert.equal(inNudgeWindow(wed.hours, wed.now), false);
});

test("a day the alley never opens has no deadline to warn about", () => {
  const closed = parseHours({ wed: null });
  const now = new Date(`${DAY}T20:00:00-05:00`);
  const hours = hoursStatus(closed, TZ, DAY, now, 15);
  assert.equal(hours.closedToday, true);
  assert.equal(inNudgeWindow(hours, now.getTime()), false);
  assert.match(nudgeDecision({ unsettled: true, hours, nowMs: now.getTime() }).why, /closed/);
});

test("only an https endpoint counts as a subscription", () => {
  assert.equal(isSubscription({ endpoint: "https://fcm.googleapis.com/fcm/send/abc" }), true);
  assert.equal(isSubscription({ endpoint: "http://fcm.googleapis.com/fcm/send/abc" }), false);
  assert.equal(isSubscription({ endpoint: "https://" }), false);
  assert.equal(isSubscription({ endpoint: `https://x.test/${"a".repeat(1000)}` }), false);
  assert.equal(isSubscription({}), false);
  assert.equal(isSubscription(null), false);
});

test("the VAPID header is a signature the push service can actually check", async () => {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const now = Date.UTC(2026, 8, 16, 1, 45);

  const header = await vapidHeader("https://fcm.googleapis.com/fcm/send/abc", jwk, "mailto:nobody@example.com", now);
  const [, t, k] = header.match(/^vapid t=([^,]+), k=(.+)$/);

  const [h, b, sig] = t.split(".");
  const un = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  assert.deepEqual(JSON.parse(new TextDecoder().decode(un(h))), { typ: "JWT", alg: "ES256" });

  const claims = JSON.parse(new TextDecoder().decode(un(b)));
  // The audience is the push service's origin, never our own, and never the
  // full endpoint with its device specific path.
  assert.equal(claims.aud, "https://fcm.googleapis.com");
  assert.equal(claims.sub, "mailto:nobody@example.com");
  assert.equal(claims.exp, Math.floor(now / 1000) + 12 * 60 * 60);

  // The k= parameter must be the uncompressed public point for this key, or
  // the signature checks against the wrong key and every push is rejected.
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  assert.deepEqual([...un(k)], [...raw]);

  const ok = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    pair.publicKey,
    un(sig),
    new TextEncoder().encode(`${h}.${b}`),
  );
  assert.equal(ok, true);
});
