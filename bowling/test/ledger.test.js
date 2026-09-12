import test from "node:test";
import assert from "node:assert/strict";
import { loadLedger, saveLedger, loadScores, saveScores, MAX_IDS } from "../functions/_lib/store.js";

/** A stand in for KV that records what was written. */
function kv(initial = null) {
  let value = initial === null ? null : JSON.stringify(initial);
  return {
    env: {
      STREAK_KV: {
        get: async () => (value === null ? null : JSON.parse(value)),
        put: async (_k, v) => { value = v; },
      },
    },
    raw: () => (value === null ? null : JSON.parse(value)),
  };
}

test("a legacy record of bare dates loads as a ledger with no ids", async () => {
  const store = kv({ "2026-09-04": [159, 115], "2026-09-05": [77] });
  const ledger = await loadLedger(store.env);
  assert.deepEqual(ledger.games, { "2026-09-04": [159, 115], "2026-09-05": [77] });
  assert.deepEqual(ledger.ids, []);
});

test("the new shape round trips games and ids", async () => {
  const store = kv();
  await saveLedger(store.env, { "2026-09-07": [98] }, ["g-1"]);
  const ledger = await loadLedger(store.env);
  assert.deepEqual(ledger.games, { "2026-09-07": [98] });
  assert.deepEqual(ledger.ids, ["g-1"]);
  assert.deepEqual(store.raw(), { games: { "2026-09-07": [98] }, ids: ["g-1"] });
});

test("junk in the record is ignored rather than crashing the page", async () => {
  const store = kv({ games: { "2026-09-07": [98], bad: "nope" }, ids: ["ok", 5, null] });
  const ledger = await loadLedger(store.env);
  assert.deepEqual(ledger.games, { "2026-09-07": [98] });
  assert.deepEqual(ledger.ids, ["ok"]);
  assert.deepEqual((await loadLedger(kv(null).env)).games, {});
});

test("empty days are dropped and the id list is capped", async () => {
  const store = kv();
  const many = Array.from({ length: MAX_IDS + 40 }, (_, i) => `g-${i}`);
  const saved = await saveLedger(store.env, { "2026-09-07": [98], "2026-09-06": [] }, many);
  assert.deepEqual(Object.keys(saved.games), ["2026-09-07"]);
  assert.equal(saved.ids.length, MAX_IDS);
  // The cap keeps the newest ids, since those are the ones a client may retry.
  assert.equal(saved.ids[saved.ids.length - 1], `g-${MAX_IDS + 39}`);
  assert.equal(saved.ids[0], "g-40");
});

test("saveScores preserves the ids already on file", async () => {
  const store = kv();
  await saveLedger(store.env, { "2026-09-07": [98] }, ["g-1", "g-2"]);
  await saveScores(store.env, { "2026-09-07": [98, 120] });
  const ledger = await loadLedger(store.env);
  assert.deepEqual(ledger.games, { "2026-09-07": [98, 120] });
  assert.deepEqual(ledger.ids, ["g-1", "g-2"], "deleting a game must not forget what was logged");
  assert.deepEqual(await loadScores(store.env), { "2026-09-07": [98, 120] });
});
