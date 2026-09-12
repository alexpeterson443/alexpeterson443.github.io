import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost as excusePost, onRequestDelete as excuseDelete } from "../functions/api/excuse.js";
import { onRequestPost as scorePost, onRequestDelete as scoreDelete } from "../functions/api/score.js";
import { onRequestGet as layoutGet, onRequestPut as layoutPut, onRequestDelete as layoutDelete } from "../functions/api/layout.js";
import { onRequestGet as stateGet } from "../functions/api/state.js";
import { todayIn, addDays } from "../functions/_lib/streak.js";

// The endpoints had no coverage at all: everything under them was unit tested
// and the handlers themselves were only ever exercised by hand with curl.

/** A stand in for KV, with the same read and write surface the handlers use. */
function kv(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    env: {
      START_DATE: "2026-08-28",
      TIMEZONE: "America/Chicago",
      STREAK_KV: {
        get: async (k) => (store.has(k) ? JSON.parse(store.get(k)) : null),
        put: async (k, v) => { store.set(k, v); },
        delete: async (k) => { store.delete(k); },
      },
    },
    read: (k) => (store.has(k) ? JSON.parse(store.get(k)) : null),
  };
}

const body = (o) => new Request("https://bowling.test/api", { method: "POST", body: JSON.stringify(o) });
const raw = (text) => new Request("https://bowling.test/api", { method: "POST", body: text });
const TODAY = todayIn("America/Chicago");

async function call(handler, store, input) {
  const res = await handler({ request: input ?? body({}), env: store.env });
  return { status: res.status, json: await res.json() };
}

test("pausing today needs nothing but a reason", async () => {
  const store = kv();
  const { status, json } = await call(excusePost, store, body({ reason: "away" }));
  assert.equal(status, 200);
  assert.equal(json.excusedToday, true);
  assert.equal(json.excuseToday, "away");
  assert.equal(store.read("excused")[TODAY], "away");
});

test("pausing a run stores every day in it and reports it as one trip", async () => {
  const store = kv();
  const from = addDays(TODAY, 10);
  const to = addDays(TODAY, 13);
  const { json } = await call(excusePost, store, body({ from, to, reason: "away" }));
  assert.deepEqual(Object.keys(store.read("excused")), [from, addDays(from, 1), addDays(from, 2), to]);
  assert.deepEqual(json.upcoming, [{ from, to, reason: "away", days: 4 }]);
  // Nothing in the future touches today's streak.
  assert.equal(json.excusedToday, false);
});

test("the endpoint refuses what it should, with a message worth reading", async () => {
  const store = kv();
  for (const [input, pattern] of [
    [{ from: addDays(TODAY, 5), to: addDays(TODAY, 1) }, /before from/],
    [{ from: "2026-01-01" }, /nothing before 2026-08-28/],
    [{ from: TODAY, reason: "hungover" }, /reason must be one of/],
    [{ from: TODAY, to: addDays(TODAY, 60) }, /at most 60 days/],
    [{ from: "gibberish" }, /YYYY-MM-DD/],
    [{ date: "2026-12-25", reason: "away" }, /use from and to/],
    [{ date: "not-a-date" }, /date must be/],
  ]) {
    const { status, json } = await call(excusePost, store, body(input));
    assert.equal(status, 400, `${JSON.stringify(input)} should be refused`);
    assert.match(json.error, pattern);
  }
  assert.equal(store.read("excused"), null, "nothing was written by any of them");
});

test("undoing a run clears exactly it", async () => {
  const store = kv({
    excused: { "2026-09-01": "away", "2026-09-02": "away", "2026-09-03": "sick" },
  });
  const { json } = await call(excuseDelete, store, body({ from: "2026-09-01", to: "2026-09-02" }));
  assert.deepEqual(store.read("excused"), { "2026-09-03": "sick" });
  assert.ok(json.today);

  // The single day form the app has always sent still works.
  await call(excuseDelete, store, body({ date: "2026-09-03" }));
  assert.deepEqual(store.read("excused"), {});
});

test("a day on file from before the start date can still be removed", async () => {
  // Creating one is refused; that must not make an existing one permanent.
  const store = kv({ excused: { "2026-01-05": "away" } });
  const { status } = await call(excuseDelete, store, body({ date: "2026-01-05" }));
  assert.notEqual(status, 400);
  assert.deepEqual(store.read("excused"), {});
});

test("logging a game verifies the day and is write once per id", async () => {
  const store = kv();
  const first = await call(scorePost, store, body({ score: 118, id: "g-1" }));
  assert.equal(first.json.verifiedToday, true);
  assert.deepEqual(first.json.scoresToday, [118]);

  // The retry the outbox depends on must not log the game twice.
  const again = await call(scorePost, store, body({ score: 118, id: "g-1" }));
  assert.equal(again.json.duplicate, true);
  assert.deepEqual(again.json.scoresToday, [118]);

  // A different id is a different game, even at the same score.
  const second = await call(scorePost, store, body({ score: 118, id: "g-2" }));
  assert.deepEqual(second.json.scoresToday, [118, 118]);
  assert.deepEqual(store.read("scores").ids, ["g-1", "g-2"]);
});

test("a bad score or date is refused and stores nothing", async () => {
  const store = kv();
  for (const input of [{ score: 301 }, { score: -1 }, { score: 1.5 }, { score: "120" }, {}, { score: 100, date: "nope" }]) {
    const { status } = await call(scorePost, store, body(input));
    assert.equal(status, 400, `${JSON.stringify(input)} should be refused`);
  }
  assert.equal(store.read("scores"), null);
});

test("removing a game leaves the rest of the day alone", async () => {
  const store = kv({ scores: { games: { [TODAY]: [100, 120, 90] }, ids: ["g-1"] } });
  const { json } = await call(scoreDelete, store, body({ date: TODAY, index: 1 }));
  assert.deepEqual(json.scoresToday, [100, 90]);
  assert.deepEqual(store.read("scores").ids, ["g-1"], "deleting a game does not forget what was logged");
});

test("the layout endpoint hands back defaults, saves, and resets", async () => {
  const store = kv();
  const fresh = await call(layoutGet, store);
  assert.equal(fresh.json.custom, false);
  assert.ok(fresh.json.pinned.includes("tonight"));
  assert.ok(fresh.json.collapsed.includes("chart"));

  const saved = await call(layoutPut, store, new Request("https://bowling.test/api/layout", {
    method: "PUT",
    body: JSON.stringify({ order: ["games", "hours"], pinned: ["games"], collapsed: [] }),
  }));
  assert.equal(saved.json.custom, true, "saving an arrangement claims it");
  assert.deepEqual(saved.json.order.slice(0, 2), ["games", "hours"]);
  assert.equal(saved.json.order.length, fresh.json.order.length, "cards left out are appended, not lost");

  // Folding a card sends custom: false and must not claim the arrangement.
  const folded = await call(layoutPut, store, new Request("https://bowling.test/api/layout", {
    method: "PUT",
    body: JSON.stringify({ order: ["games"], collapsed: ["games"], custom: false }),
  }));
  assert.equal(folded.json.custom, false);

  const bad = await call(layoutPut, store, new Request("https://bowling.test/api/layout", {
    method: "PUT",
    body: JSON.stringify({ order: "games" }),
  }));
  assert.equal(bad.status, 400);

  const reset = await call(layoutDelete, store);
  assert.equal(reset.json.custom, false);
  assert.equal(store.read("layout"), null);
});

test("a body that is not JSON is refused rather than throwing", async () => {
  const store = kv();
  assert.equal((await call(excusePost, store, raw("{not json"))).json.excusedToday, true,
    "excuse falls back to pausing today, which is its documented default");
  assert.equal((await call(scorePost, store, raw("{not json"))).status, 400);
  assert.equal((await call(layoutPut, store, new Request("https://bowling.test/api/layout", {
    method: "PUT", body: "{not json",
  }))).status, 400);
});

test("the state read reports a fresh namespace without falling over", async () => {
  const store = kv();
  const { json } = await call(stateGet, store, undefined);
  assert.equal(json.today, TODAY);
  assert.equal(json.start, "2026-08-28");
  // The first week is seeded the very first time the API runs.
  assert.ok(json.total >= 7);
  assert.equal(json.calendar.configured, false, "no feed configured means no calendar claims");
  assert.equal(json.frames.enough, false, "seeded check ins carry no scores to work backwards from");
  assert.deepEqual(json.upcoming, []);
  assert.ok(json.coach.session.text);
  assert.ok(json.hours.week.length);
});
