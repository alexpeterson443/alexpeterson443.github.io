// A D1 binding over node:sqlite, so the tests run the real migration and real
// SQL rather than a stand in that only knows the statements it was written for.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

const MIGRATION = new URL("../../migrations/0001_games_frames.sql", import.meta.url);

export function d1({ migrate = true } = {}) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  if (migrate) db.exec(readFileSync(MIGRATION, "utf8"));
  // D1 hands back ordinary objects; node:sqlite's have no prototype.
  const plain = (r) => (r ? { ...r } : r);
  const statement = (sql, args = []) => ({
    bind: (...a) => statement(sql, a),
    async run() { db.prepare(sql).run(...args); return { success: true }; },
    async all() { return { results: db.prepare(sql).all(...args).map(plain) }; },
    async first() { return plain(db.prepare(sql).get(...args)) ?? null; },
    _exec() { return /^\s*select/i.test(sql) ? { results: db.prepare(sql).all(...args).map(plain) } : (db.prepare(sql).run(...args), { results: [] }); },
  });
  return {
    raw: db,
    prepare: (sql) => statement(sql),
    // D1 runs a batch as one transaction; so does this.
    async batch(list) {
      db.exec("BEGIN");
      try {
        const out = list.map((s) => s._exec());
        db.exec("COMMIT");
        return out;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
}

/** A KV binding over a Map, accepting both get(key, "json") and get(key, {type}). */
export function kv(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
  return {
    store,
    get: async (k, opts) => {
      if (!store.has(k)) return null;
      const type = typeof opts === "string" ? opts : opts && opts.type;
      return type === "json" ? JSON.parse(store.get(k)) : store.get(k);
    },
    put: async (k, v) => { store.set(k, v); },
    delete: async (k) => { store.delete(k); },
  };
}
