import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";
import { mcpKeyFor, rotateMcpKey } from "../functions/_lib/mcpkey.js";
import { readKeyFor } from "../functions/_lib/readkey.js";
import { makeSessionCookie } from "../functions/_lib/auth.js";

// The connector key lives in a Claude client's settings, so what matters is
// what it cannot do, and that keyed API calls never leave a cookie behind.

function env() {
  const store = new Map();
  return {
    ACCESS_KEY: "full-secret-key",
    START_DATE: "2026-08-28",
    TIMEZONE: "America/Chicago",
    STREAK_KV: {
      get: async (k) => (store.has(k) ? store.get(k) : null),
      put: async (k, v) => { store.set(k, v); },
      delete: async (k) => { store.delete(k); },
    },
  };
}

async function gate(e, path, { method = "GET", headers = {} } = {}) {
  let reached = false;
  const res = await onRequest({
    request: new Request(`https://bowling.test${path}`, { method, headers }),
    env: e,
    next: async () => { reached = true; return new Response("ok"); },
  });
  return { status: res.status, reached, cookie: res.headers.get("Set-Cookie") };
}

test("the connector key opens POST /api/mcp and nothing else", async () => {
  const e = env();
  const k = await mcpKeyFor(e);
  assert.ok(k.startsWith("m"));
  const ok = await gate(e, `/api/mcp?key=${k}`, { method: "POST" });
  assert.equal(ok.reached, true);
  assert.equal(ok.cookie, null);
  for (const path of ["/", "/api/state", "/api/score", "/api/claude", "/api/mcpkey"]) {
    for (const method of ["GET", "POST"]) {
      const r = await gate(e, `${path}?key=${k}`, { method });
      assert.equal(r.reached, false, `${method} ${path}`);
      assert.equal(r.cookie, null);
    }
  }
});

test("the connector takes the key in a header too, and the full key still works", async () => {
  const e = env();
  const k = await mcpKeyFor(e);
  assert.equal((await gate(e, "/api/mcp", { method: "POST", headers: { "X-Access-Key": k } })).reached, true);
  const full = await gate(e, "/api/mcp", { method: "POST", headers: { "X-Access-Key": "full-secret-key" } });
  assert.equal(full.reached, true);
  assert.equal(full.cookie, null);
});

test("the connector ignores the session cookie and the read key", async () => {
  const e = env();
  const cookie = (await makeSessionCookie(e, new Request("https://bowling.test/"))).split(";")[0];
  const viaCookie = await gate(e, "/api/mcp", { method: "POST", headers: { Cookie: cookie } });
  assert.equal(viaCookie.reached, false);
  assert.equal(viaCookie.status, 401);
  const read = await readKeyFor(e);
  assert.equal((await gate(e, `/api/mcp?key=${read}`, { method: "POST" })).reached, false);
  assert.equal((await gate(e, "/api/mcp", { method: "POST" })).status, 401);
});

test("rotating the connector key retires the old one", async () => {
  const e = env();
  const old = await mcpKeyFor(e);
  const next = await rotateMcpKey(e);
  assert.notEqual(old, next);
  assert.equal((await gate(e, `/api/mcp?key=${old}`, { method: "POST" })).reached, false);
  assert.equal((await gate(e, `/api/mcp?key=${next}`, { method: "POST" })).reached, true);
});

test("only the private link in a browser gets a cookie; header calls don't", async () => {
  const e = env();
  const link = await gate(e, "/?key=full-secret-key");
  assert.equal(link.reached, true);
  assert.match(link.cookie || "", /bowl_session=/);
  const app = await gate(e, "/api/state", { headers: { "X-Access-Key": "full-secret-key" } });
  assert.equal(app.reached, true);
  assert.equal(app.cookie, null);
});
