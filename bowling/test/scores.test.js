import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreStats, isValidScore, gameList } from "../functions/_lib/scores.js";

test("score stats: high, average, games, newest first", () => {
  const s = scoreStats({ "2026-09-04": [159, 158, 112], "2026-09-02": [130] });
  assert.equal(s.games, 4);
  assert.equal(s.high, 159);
  assert.equal(s.highDate, "2026-09-04");
  assert.equal(s.average, 140);
  assert.deepEqual(s.list.map((g) => g.score), [159, 158, 112, 130]);
});

test("empty scores", () => {
  const s = scoreStats({});
  assert.deepEqual(s, { games: 0, high: null, highDate: null, average: null, list: [] });
});

test("score validation", () => {
  assert.equal(isValidScore(300), true);
  assert.equal(isValidScore(0), true);
  assert.equal(isValidScore(301), false);
  assert.equal(isValidScore(150.5), false);
  assert.equal(isValidScore(NaN), false);
});

test("gameList keeps index for deletion", () => {
  const l = gameList({ "2026-09-04": [159, 158] });
  assert.deepEqual(l[1], { date: "2026-09-04", index: 1, score: 158 });
});
