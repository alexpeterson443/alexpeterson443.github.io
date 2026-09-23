import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";
import { readKeyFor, rotateReadKey } from "../functions/_lib/readkey.js";
import { onRequestGet as claudeGet } from "../functions/api/claude.js";
import { onRequestGet as readkeyGet } from "../functions/api/readkey.js";
import { summaryText } from "../functions/_lib/summary.js";
import { todayIn } from "../functions/_lib/streak.js";

// The read only key is what gets pasted into a chat, so what matters is what it
// cannot do: write, reach any other endpoint, or turn itself into a session.

function env(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    ACCESS_KEY: "full-secret-key",
    START_DATE: "2026-08-28",
    TIMEZONE: "America/Chicago",
    STREAK_KV: {
      // Real KV takes either get(key, "json") or get(key, { type, cacheTtl }).
      get: async (k, opts) => {
        if (!store.has(k)) return null;
        const type = typeof opts === "string" ? opts : opts && opts.type;
        return type === "json" ? JSON.parse(store.get(k)) : store.get(k);
      },
      put: async (k, v) => { store.set(k, v); },
      delete: async (k) => { store.delete(k); },
    },
  };
}

async function gate(e, path, method = "GET") {
  let reached = false;
  const res = await onRequest({
    request: new Request(`https://bowling.test${path}`, { method }),
    env: e,
    next: async () => { reached = true; return new Response("ok"); },
  });
  return { status: res.status, reached, cookie: res.headers.get("Set-Cookie"), cache: res.headers.get("Cache-Control") };
}

test("the read key opens the two reads, with no cookie", async () => {
  const e = env();
  const key = await readKeyFor(e);
  assert.match(key, /^r[0-9a-f]{32}$/);
  for (const path of ["/api/claude", "/api/state"]) {
    const r = await gate(e, `${path}?key=${key}`);
    assert.equal(r.status, 200, path);
    assert.ok(r.reached, path);
    assert.equal(r.cookie, null, `${path} must not hand out a session`);
    // A chat asking again after a new game must get the new game.
    assert.match(r.cache, /no-store/, `${path} must never be cached`);
  }
});

test("the read key cannot write or reach anything else", async () => {
  const e = env();
  const key = await readKeyFor(e);
  for (const [path, method] of [
    ["/api/score", "POST"],
    ["/api/state", "POST"],
    ["/api/claude", "DELETE"],
    ["/api/settings", "GET"],
    ["/api/readkey", "GET"],
    ["/api/readkey", "POST"],
    ["/", "GET"],
  ]) {
    const r = await gate(e, `${path}?key=${key}`, method);
    assert.equal(r.reached, false, `${method} ${path} must stay shut`);
  }
});

test("the full key still works and a new read key retires the old one", async () => {
  const e = env();
  const full = await gate(e, "/api/score?key=full-secret-key", "POST");
  assert.ok(full.reached);
  assert.ok(full.cookie);

  const old = await readKeyFor(e);
  const fresh = await rotateReadKey(e);
  assert.notEqual(old, fresh);
  assert.equal((await gate(e, `/api/claude?key=${old}`)).reached, false);
  assert.equal((await gate(e, `/api/claude?key=${fresh}`)).reached, true);
});

test("/api/readkey hands back a link that points at the summary", async () => {
  const e = env();
  const res = await readkeyGet({ request: new Request("https://bowling.test/api/readkey"), env: e });
  const json = await res.json();
  assert.equal(json.url, `https://bowling.test/api/claude?key=${await readKeyFor(e)}`);
});

test("the summary reads as text and carries the numbers", async () => {
  const today = todayIn("America/Chicago");
  const e = env({ scores: { games: { "2026-09-01": [120, 98], [today]: [131] }, ids: [] } });
  const res = await claudeGet({ env: e });
  assert.match(res.headers.get("Content-Type"), /text\/plain/);
  const text = await res.text();
  assert.match(text, /# Bowling streak/);
  assert.match(text, /High game: 131/);
  assert.match(text, /Today: bowled \(131\)/);
  assert.match(text, /2026-09-01: 120, 98/);
  assert.match(text, new RegExp(`Latest game: 131 on ${today}`));
});

test("the summary survives an empty state", () => {
  assert.match(summaryText({}), /Current streak: 0 days/);
});

test("a game logged after one read shows up in the next", async () => {
  const e = env();
  const first = await (await claudeGet({ env: e })).text();
  assert.match(first, /Games logged: 0/);
  const today = todayIn("America/Chicago");
  await e.STREAK_KV.put("scores", JSON.stringify({ games: { [today]: [150] }, ids: [] }));
  const second = await (await claudeGet({ env: e })).text();
  assert.match(second, /Games logged: 1/);
  assert.match(second, /Latest game: 150/);
});
