import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreStats, isValidScore, dayList } from "../functions/_lib/scores.js";

test("score stats: high, average, games, newest first", () => {
  const s = scoreStats({ "2026-09-04": [159, 158, 112], "2026-09-02": [130] });
  assert.equal(s.games, 4);
  assert.equal(s.high, 159);
  assert.equal(s.highDate, "2026-09-04");
  assert.equal(s.average, 140);
  assert.deepEqual(s.days.map((d) => d.date), ["2026-09-04", "2026-09-02"]);
});

test("legacy unscored games still count as games but not in high or average", () => {
  const s = scoreStats({ "2026-09-04": [159, 158, 112], "2026-08-28": [null, null, null] });
  assert.equal(s.games, 6);
  assert.equal(s.scored, 3);
  assert.equal(s.high, 159);
  assert.equal(s.average, 143);
});

test("empty scores", () => {
  const s = scoreStats({});
  assert.deepEqual(s, { games: 0, scored: 0, high: null, highDate: null, average: null, days: [] });
});

test("score validation", () => {
  assert.equal(isValidScore(300), true);
  assert.equal(isValidScore(0), true);
  assert.equal(isValidScore(301), false);
  assert.equal(isValidScore(150.5), false);
  assert.equal(isValidScore(NaN), false);
  assert.equal(isValidScore(null), false);
});

test("dayList is newest first with counts", () => {
  const l = dayList({ "2026-09-04": [159, 158], "2026-09-01": [null] });
  assert.deepEqual(l[0], { date: "2026-09-04", games: 2, scores: [159, 158] });
  assert.equal(l[1].games, 1);
});

test("ICS unescape handles escaped semicolons and commas", async () => {
  const { parseEvents } = await import("../functions/_lib/ics.js");
  const e = parseEvents("BEGIN:VEVENT\nUID:x\nDTSTART:20260904T190000Z\nSUMMARY:Bowl\\; then food\\, maybe\nEND:VEVENT\n")[0];
  assert.equal(e.summary, "Bowl; then food, maybe");
});
