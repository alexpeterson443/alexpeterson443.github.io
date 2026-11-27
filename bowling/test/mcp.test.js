import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost as mcp, TOOLS } from "../functions/api/mcp.js";
import { todayIn, addDays } from "../functions/_lib/streak.js";

// The Claude connector: the JSON-RPC surface, and that every tool lands in
// the same store the app reads.

function kv(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    START_DATE: "2026-08-28",
    TIMEZONE: "America/Chicago",
    STREAK_KV: {
      get: async (k, opts) => {
        if (!store.has(k)) return null;
        const type = typeof opts === "string" ? opts : opts && opts.type;
        return type === "json" ? JSON.parse(store.get(k)) : store.get(k);
      },
      put: async (k, v) => { store.set(k, v); },
      delete: async (k) => { store.delete(k); },
      list: async () => ({ keys: [] }),
    },
  };
}

const TODAY = todayIn("America/Chicago");
let nextId = 1;
async function send(env, method, params) {
  const id = nextId++;
  const req = new Request("https://bowling.test/api/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const res = await mcp({ request: req, env });
  return res.json();
}
const call = async (env, name, args) => (await send(env, "tools/call", { name, arguments: args })).result;
const games = async (env) => JSON.parse((await call(env, "get_games", {})).content[0].text);

test("initialize answers with tools and the client's protocol version", async () => {
  const r = await send(kv(), "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.equal(r.result.protocolVersion, "2025-03-26");
  assert.ok(r.result.capabilities.tools);
  assert.equal(r.result.serverInfo.name, "bowling-streak");
});

test("notifications get an empty 202", async () => {
  const req = new Request("https://bowling.test/api/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
  const res = await mcp({ request: req, env: kv() });
  assert.equal(res.status, 202);
});

test("tools/list names every tool", async () => {
  const r = await send(kv(), "tools/list", {});
  assert.deepEqual(r.result.tools.map((t) => t.name), TOOLS.map((t) => t.name));
});

test("log, read back, delete", async () => {
  const env = kv();
  const logged = await call(env, "log_game", { score: 187 });
  assert.equal(logged.isError, false);
  assert.match(logged.content[0].text, /Logged 187/);
  let g = await games(env);
  assert.deepEqual(g.games.at(-1), { date: TODAY, scores: [187] });
  assert.equal(g.current, 1);
  const del = await call(env, "delete_game", { date: TODAY, index: 0 });
  assert.equal(del.isError, false);
  g = await games(env);
  assert.deepEqual(g.games.find((x) => x.date === TODAY)?.scores ?? [], []);
});

test("bad input comes back as a tool error, not a crash", async () => {
  const env = kv();
  const r = await call(env, "log_game", { score: 301 });
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /0 to 300/);
  const d = await call(env, "delete_game", { date: TODAY, index: 5 });
  assert.equal(d.isError, true);
});

test("frames must add up to the score", async () => {
  const env = kv();
  const frames = Array.from({ length: 10 }, () => ({ b1: 9, b2: 0 }));
  assert.equal((await call(env, "log_game", { score: 90, frames })).isError, false);
  assert.equal((await call(env, "log_game", { score: 95, frames })).isError, true);
});

test("pause and unpause a future trip", async () => {
  const env = kv();
  const from = addDays(TODAY, 3), to = addDays(TODAY, 5);
  assert.equal((await call(env, "pause_days", { from, to, reason: "away" })).isError, false);
  let g = await games(env);
  assert.deepEqual(g.upcoming, [{ from, to, reason: "away" }]);
  assert.equal((await call(env, "unpause_days", { from, to })).isError, false);
  g = await games(env);
  assert.deepEqual(g.upcoming, []);
});

test("get_streak returns the plain text summary", async () => {
  const r = await call(kv(), "get_streak", {});
  assert.equal(r.isError, false);
  assert.ok(r.content[0].text.length > 20);
});

test("unknown tools and methods are JSON-RPC errors", async () => {
  assert.equal((await send(kv(), "tools/call", { name: "nope", arguments: {} })).error.code, -32602);
  assert.equal((await send(kv(), "resources/list", {})).error.code, -32601);
});
