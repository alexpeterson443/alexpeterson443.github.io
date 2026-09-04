import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStats, dateRange, todayIn, msUntilMidnight, addDays } from "../functions/_lib/streak.js";

const START = "2026-08-28";
const seed = dateRange(START, "2026-09-03");

test("seeded week counts as a 7 day streak that is at risk today", () => {
  const s = computeStats(seed, "2026-09-04", START);
  assert.equal(s.current, 7);
  assert.equal(s.longest, 7);
  assert.equal(s.total, 7);
  assert.equal(s.dayOfChallenge, 8);
  assert.equal(s.verifiedToday, false);
  assert.equal(s.atRisk, true);
  assert.deepEqual(s.missed, []);
});

test("verifying today extends the streak to 8", () => {
  const s = computeStats([...seed, "2026-09-04"], "2026-09-04", START);
  assert.equal(s.current, 8);
  assert.equal(s.verifiedToday, true);
  assert.equal(s.atRisk, false);
});

test("missing a day breaks the streak", () => {
  // bowled through Sep 3, skipped Sep 4, now it is Sep 5
  const s = computeStats(seed, "2026-09-05", START);
  assert.equal(s.current, 0);
  assert.equal(s.longest, 7);
  assert.deepEqual(s.missed, ["2026-09-04"]);
  assert.equal(s.atRisk, false);
});

test("a new streak after a gap starts from 1 and longest is remembered", () => {
  const s = computeStats([...seed, "2026-09-05"], "2026-09-05", START);
  assert.equal(s.current, 1);
  assert.equal(s.longest, 7);
});

test("dates outside the challenge window and duplicates are ignored", () => {
  const s = computeStats([...seed, "2026-09-03", "2026-08-01", "2030-01-01"], "2026-09-04", START);
  assert.equal(s.total, 7);
});

test("addDays crosses month boundaries", () => {
  assert.equal(addDays("2026-08-31", 1), "2026-09-01");
  assert.equal(addDays("2026-09-01", -1), "2026-08-31");
});

test("todayIn respects the timezone", () => {
  // 03:30 UTC on Sep 5 is still Sep 4 in Chicago (UTC-5 during CDT)
  const now = new Date("2026-09-05T03:30:00Z");
  assert.equal(todayIn("America/Chicago", now), "2026-09-04");
  assert.equal(todayIn("UTC", now), "2026-09-05");
});

test("msUntilMidnight counts down to Central midnight", () => {
  const now = new Date("2026-09-05T03:30:00Z"); // 22:30 CDT
  const ms = msUntilMidnight("America/Chicago", now);
  assert.equal(ms, 90 * 60 * 1000);
});

test("msUntilMidnight is DST aware", () => {
  // Fall back: Nov 1 2026 00:30 CDT, the day is 25 hours long.
  assert.equal(msUntilMidnight("America/Chicago", new Date("2026-11-01T05:30:00Z")), 24.5 * 3600_000);
  // Spring forward: Mar 14 2027 00:30 CST, the day is 23 hours long.
  assert.equal(msUntilMidnight("America/Chicago", new Date("2027-03-14T06:30:00Z")), 22.5 * 3600_000);
});
