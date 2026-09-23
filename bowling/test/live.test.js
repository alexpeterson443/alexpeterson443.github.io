import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost as scorePost } from "../functions/api/score.js";
import { onRequestGet as claudeGet } from "../functions/api/claude.js";
import { mirror } from "../functions/_lib/live.js";
import { todayIn } from "../functions/_lib/streak.js";

// Claude's link has to show a game the moment it is logged. KV cannot promise
// that from another data centre, so these stand ins make KV stale on purpose
// and check the D1 copy carries the game anyway.

/** A D1 stand in covering the three statements live.js uses. */
function d1() {
  const rows = new Map();
  const db = {
    rows,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind: (...a) => { args = a; return stmt; },
        async run() {
          if (sql.startsWith("DELETE")) rows.delete(args[0]);
          else if (sql.includes("OR IGNORE")) { if (!rows.has(args[0])) rows.set(args[0], args[1]); }
          else rows.set(args[0], args[1]);
          return { success: true };
        },
        async first() {
          return rows.has(args[0]) ? { value: rows.get(args[0]) } : null;
        },
      };
      return stmt;
    },
  };
  return db;
}

/** KV that can be frozen, so reads keep returning what it held at that moment. */
function kv() {
  const store = new Map();
  let frozen = null;
  return {
    freeze: () => { frozen = new Map(store); },
    binding: {
      get: async (k, opts) => {
        const src = frozen || store;
        if (!src.has(k)) return null;
        const type = typeof opts === "string" ? opts : opts && opts.type;
        return type === "json" ? JSON.parse(src.get(k)) : src.get(k);
      },
      put: async (k, v) => { store.set(k, v); },
      delete: async (k) => { store.delete(k); },
    },
  };
}

function env(k, db) {
  return { START_DATE: "2026-08-28", TIMEZONE: "America/Chicago", STREAK_KV: k.binding, LIVE_DB: db };
}

const post = (o) => new Request("https://bowling.test/api/score", { method: "POST", body: JSON.stringify(o) });

test("a game logged is in Claude's very next read, even with KV stale", async () => {
  const k = kv();
  const db = d1();
  const e = env(k, db);
  await scorePost({ request: post({ score: 120, id: "a" }), env: e });
  // From here KV at "another data centre" keeps answering with one game.
  k.freeze();
  await scorePost({ request: post({ score: 175, id: "b" }), env: { ...e, STREAK_KV: kvThatWrites(k, e) } });
  const text = await (await claudeGet({ env: e })).text();
  assert.match(text, /Games logged: 2/);
  assert.match(text, /Latest game: 175/);
});

// The phone's own write goes to its own edge, which is not frozen.
function kvThatWrites(k) {
  const live = new Map();
  return {
    get: async (key, opts) => {
      const v = live.has(key) ? live.get(key) : await k.binding.get(key, "text");
      if (v === null) return null;
      const type = typeof opts === "string" ? opts : opts && opts.type;
      return type === "json" ? JSON.parse(v) : v;
    },
    put: async (key, v) => { live.set(key, v); await k.binding.put(key, v); },
    delete: async (key) => { live.delete(key); await k.binding.delete(key); },
  };
}

test("records saved before the copy existed are brought across once", async () => {
  const k = kv();
  const today = todayIn("America/Chicago");
  await k.binding.put("scores", JSON.stringify({ games: { [today]: [140] }, ids: [] }));
  const db = d1();
  const text = await (await claudeGet({ env: env(k, db) })).text();
  assert.match(text, /Latest game: 140/);
  assert.ok(db.rows.has("scores"));
});

test("only the streak's records are copied, and a broken D1 never breaks a save", async () => {
  const db = d1();
  await mirror({ LIVE_DB: db }, "layout", "{}");
  assert.equal(db.rows.size, 0);
  const broken = { prepare() { throw new Error("down"); } };
  await mirror({ LIVE_DB: broken }, "scores", "{}");
  await mirror({}, "scores", "{}");
});
