import test from "node:test";
import assert from "node:assert/strict";
import "../public/frames-core.js";
import { d1, kv } from "./helpers/d1.js";
import { syncDate, removeGame, putFrames, setPain, loadDetail, checkFrames } from "../functions/_lib/games.js";
import { onRequestPost as scorePost, onRequestDelete as scoreDelete } from "../functions/api/score.js";
import { onRequestPut as framesPut } from "../functions/api/frames.js";
import { onRequestPut as sessionPut } from "../functions/api/session.js";
import { todayIn } from "../functions/_lib/streak.js";

const F = globalThis.BowlFrames;
const TODAY = todayIn("America/Chicago");

// Frame helpers: a game written the way a scoresheet reads.
const fr = (b1, b2 = null, b3 = null, leave = null) => ({ b1, b2, b3, leave });
const repeat = (f, n = 9) => Array.from({ length: n }, () => ({ ...f }));
const perfect = () => [...repeat(fr(10)), fr(10, 10, 10)];
const allNines = () => [...repeat(fr(9, 0, null, "10")), fr(9, 0)];
const allSpares = () => [...repeat(fr(5, 5)), fr(5, 5, 5)];

// ---------- scoring ----------

test("the scorer gets the classic games right", () => {
  assert.equal(F.scoreGame(perfect()).score, 300);
  assert.equal(F.scoreGame(allNines()).score, 90);
  assert.equal(F.scoreGame(allSpares()).score, 150);
  assert.equal(F.scoreGame([...repeat(fr(0, 0)), fr(0, 0)]).score, 0);
  // Strike, spare, open: 20 + 13 + 3 ...
  const g = [fr(10), fr(7, 3), fr(3, 0), ...repeat(fr(0, 0), 6), fr(0, 0)];
  assert.deepEqual(F.running(g).slice(0, 3), [20, 33, 36]);
  assert.equal(F.scoreGame(g).score, 36);
});

test("a game in progress shows a running score only where it is known", () => {
  const partial = [fr(10), fr(7, 3), fr(4)];
  // The strike needs two more balls (7, 3): known. The spare needs one (4): known.
  assert.deepEqual(F.running(partial).slice(0, 3), [20, 34, null]);
  // A strike still waiting on its bonus stays blank, and so does everything after.
  assert.deepEqual(F.running([fr(10), fr(10)]).slice(0, 2), [null, null]);
});

test("illegal frames are refused with the frame named", () => {
  for (const [frames, pattern] of [
    [[...repeat(fr(6, 5)), fr(0, 0)], /frame 1: second ball can take at most 4/],
    [[...repeat(fr(10, 0)), fr(0, 0)], /frame 1: a strike ends the frame/],
    [[...repeat(fr(0, 0)), fr(3, 4, 2)], /frame 10: a third ball needs a strike or spare/],
    [[...repeat(fr(0, 0)), fr(10, 10)], /frame 10: third ball missing/],
    [[...repeat(fr(0, 0)), fr(10, 6, 5)], /frame 10: third ball can take at most 4/],
    [[...repeat(fr(0, 0), 8)], /exactly 10 frames/],
    [[fr(8, 1, null, "7"), ...repeat(fr(0, 0), 8), fr(0, 0)], /leave has 1 pins but 2 were standing/],
    [[fr(10, null, null, "7"), ...repeat(fr(0, 0), 8), fr(0, 0)], /a strike leaves nothing/],
    [[fr(9, 0, null, "11"), ...repeat(fr(0, 0), 8), fr(0, 0)], /leave must be pin numbers/],
  ]) {
    assert.match(F.scoreGame(frames).error || "", pattern);
  }
});

test("leaves are normalised to pin order", () => {
  const { frames } = checkFrames([fr(8, 2, null, "10-3"), ...repeat(fr(0, 0), 8), fr(0, 0)]);
  assert.equal(frames[0].leave, "3-10");
});

// ---------- the migration ----------

test("strike, spare and open are generated from the pins", async () => {
  const db = d1();
  await db.prepare("INSERT INTO games (id, date, position, score) VALUES ('g', '2026-09-01', 1, 30)").run();
  for (const [n, b1, b2] of [[1, 10, null], [2, 6, 4], [3, 6, 2]]) {
    await db.prepare("INSERT INTO frames (game_id, frame_number, ball1_pins, ball2_pins) VALUES ('g', ?, ?, ?)").bind(n, b1, b2).run();
  }
  const rows = db.raw.prepare("SELECT frame_number, is_strike, is_spare, is_open FROM frames ORDER BY frame_number").all();
  assert.deepEqual(rows.map((r) => [r.is_strike, r.is_spare, r.is_open]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
});

test("the migration can run twice", () => {
  const db = d1();
  // Applying it again over a live database is the rollout path; it must be harmless.
  assert.doesNotThrow(() => db.raw.exec(require_migration()));
});

import { readFileSync } from "node:fs";
function require_migration() {
  return readFileSync(new URL("../migrations/0001_games_frames.sql", import.meta.url), "utf8");
}

// ---------- keeping D1 in step with KV ----------

test("a night logged before D1 existed is brought across as totals only", async () => {
  const db = d1();
  const res = await syncDate(db, "2026-09-01", [101, 95, 120]);
  assert.deepEqual(res, { kept: 0, removed: 0, added: 3 });
  const rows = db.raw.prepare("SELECT position, score, lane, logged_at FROM games ORDER BY position").all();
  assert.deepEqual(rows.map((r) => [r.position, r.score, r.lane, r.logged_at]), [[1, 101, null, null], [2, 95, null, null], [3, 120, null, null]]);
  // Nothing to do the second time.
  assert.deepEqual(await syncDate(db, "2026-09-01", [101, 95, 120]), { kept: 3, removed: 0, added: 0 });
  assert.equal(db.raw.prepare("SELECT count(*) AS n FROM frames").get().n, 0);
});

test("rows that disagree with KV are rebuilt from KV", async () => {
  const db = d1();
  await syncDate(db, "2026-09-01", [101, 95]);
  // KV says the second game was 96: D1's 95 is wrong and is replaced.
  const res = await syncDate(db, "2026-09-01", [101, 96, 110]);
  assert.deepEqual(res, { kept: 1, removed: 1, added: 2 });
  const scores = db.raw.prepare("SELECT score FROM games WHERE date = '2026-09-01' ORDER BY position").all().map((r) => r.score);
  assert.deepEqual(scores, [101, 96, 110]);
});

test("deleting a game closes the gap and keeps the others' frames", async () => {
  const db = d1();
  await syncDate(db, "2026-09-01", [90, 150]);
  await syncDate(db, "2026-09-01", [90, 150, 300], { id: "p", frames: checkFrames(perfect()).frames });
  await removeGame(db, "2026-09-01", 1, [90, 300]);
  const rows = db.raw.prepare("SELECT id, position, score FROM games WHERE date = '2026-09-01' ORDER BY position").all();
  assert.deepEqual(rows.map((r) => [r.position, r.score]), [[1, 90], [2, 300]]);
  assert.equal(rows[1].id, "p");
  assert.equal(db.raw.prepare("SELECT count(*) AS n FROM frames WHERE game_id = 'p'").get().n, 10);
});

// ---------- the endpoints ----------

function env(seed = {}) {
  return { START_DATE: "2026-08-28", TIMEZONE: "America/Chicago", STREAK_KV: kv(seed), LIVE_DB: d1() };
}
const req = (method, body) => new Request("https://bowling.test/api", { method, body: JSON.stringify(body) });

test("a game logged by frame keeps its frames, lane and time; the total goes to KV as before", async () => {
  const e = env();
  const res = await scorePost({ request: req("POST", { score: 90, id: "g-1", lane: 12, frames: allNines() }), env: e });
  assert.equal(res.status, 200);
  const kvRecord = JSON.parse(e.STREAK_KV.store.get("scores"));
  assert.deepEqual(kvRecord.games[TODAY], [90]);
  const g = e.LIVE_DB.raw.prepare("SELECT * FROM games").get();
  assert.equal(g.id, "g-1");
  assert.equal(g.lane, 12);
  assert.ok(g.logged_at > 0);
  assert.equal(e.LIVE_DB.raw.prepare("SELECT count(*) AS n FROM frames").get().n, 10);
});

test("frames that do not add up to the score are refused and nothing is logged", async () => {
  const e = env();
  const res = await scorePost({ request: req("POST", { score: 91, frames: allNines() }), env: e });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /add up to 90, not 91/);
  assert.equal(e.STREAK_KV.store.has("scores"), false);
});

test("a bad lane is refused", async () => {
  const res = await scorePost({ request: req("POST", { score: 90, lane: 0 }), env: env() });
  assert.equal(res.status, 400);
});

test("a totals only game still works exactly as before, with no D1 at all", async () => {
  const e = { ...env(), LIVE_DB: undefined };
  const res = await scorePost({ request: req("POST", { score: 120 }), env: e });
  assert.equal(res.status, 200);
  assert.deepEqual(JSON.parse(e.STREAK_KV.store.get("scores")).games[TODAY], [120]);
});

test("frames can be added to a game logged as a total, but only if they match it", async () => {
  const e = env({ scores: { games: { "2026-09-01": [101, 90] }, ids: [] } });
  const wrong = await framesPut({ request: req("PUT", { date: "2026-09-01", index: 0, frames: allNines() }), env: e });
  assert.equal(wrong.status, 400);
  assert.match((await wrong.json()).error, /add up to 90, but this game was logged as 101/);
  const right = await framesPut({ request: req("PUT", { date: "2026-09-01", index: 1, frames: allNines(), lane: 7 }), env: e });
  assert.equal(right.status, 200);
  const detail = await loadDetail(e, { "2026-09-01": [101, 90] });
  assert.deepEqual(detail.games.map((g) => g.framesAvailable), [false, true]);
  assert.equal(detail.games[1].lane, 7);
});

test("deleting through the API removes the D1 row too", async () => {
  const e = env();
  await scorePost({ request: req("POST", { score: 90, id: "a", frames: allNines() }), env: e });
  await scorePost({ request: req("POST", { score: 150, id: "b", frames: allSpares() }), env: e });
  await scoreDelete({ request: req("DELETE", { date: TODAY, index: 0 }), env: e });
  const rows = e.LIVE_DB.raw.prepare("SELECT id, position FROM games").all().map((r) => ({ ...r }));
  assert.deepEqual(rows, [{ id: "b", position: 1 }]);
});

test("pain is stored per night and validated", async () => {
  const e = env();
  assert.equal((await sessionPut({ request: req("PUT", { pain: 4 }), env: e })).status, 400);
  assert.equal((await sessionPut({ request: req("PUT", { pain: 2 }), env: e })).status, 200);
  assert.equal((await sessionPut({ request: req("PUT", { pain: 1 }), env: e })).status, 200);
  const detail = await loadDetail(e, {});
  assert.deepEqual(detail.pain, { [TODAY]: 1 });
  await setPain(e.LIVE_DB, TODAY, null);
  assert.deepEqual((await loadDetail(e, {})).pain, {});
});

// ---------- reading it back ----------

test("frames are never attached to a game whose total disagrees with KV", async () => {
  const db = d1();
  await syncDate(db, "2026-09-01", [90], { id: "x", frames: checkFrames(allNines()).frames });
  // KV now says that game was 91 (edited elsewhere); D1 has not caught up.
  const detail = await loadDetail({ LIVE_DB: db }, { "2026-09-01": [91] });
  assert.equal(detail.games[0].framesAvailable, false);
  assert.equal(detail.games[0].frames, null);
  assert.equal(detail.games[0].score, 91);
});

test("without the tables, or without D1, every game is still there as a total", async () => {
  const scores = { "2026-09-01": [101, 95] };
  for (const e of [{}, { LIVE_DB: d1({ migrate: false }) }]) {
    const detail = await loadDetail(e, scores);
    assert.equal(detail.source, "kv");
    assert.deepEqual(detail.games.map((g) => [g.position, g.score, g.framesAvailable]), [[1, 101, false], [2, 95, false]]);
  }
});
