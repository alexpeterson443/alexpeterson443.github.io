import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeStats, dateRange, todayIn, msUntilMidnight, addDays,
  pauseRange, groupRuns, EXCUSE_REASONS, MAX_PAUSE_DAYS,
} from "../functions/_lib/streak.js";

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

test("excused days pause the streak without counting", () => {
  // Bowled Aug 28..Sep 3, alley closed Sep 4, bowled Sep 5.
  const s = computeStats([...seed, "2026-09-05"], "2026-09-05", START, ["2026-09-04"]);
  assert.equal(s.current, 8);
  assert.equal(s.longest, 8);
  assert.equal(s.total, 8);
  assert.deepEqual(s.missed, []);
  assert.deepEqual(s.excused, ["2026-09-04"]);
});

test("today excused keeps the streak alive and not at risk", () => {
  const s = computeStats(seed, "2026-09-04", START, ["2026-09-04"]);
  assert.equal(s.current, 7);
  assert.equal(s.excusedToday, true);
  assert.equal(s.atRisk, false);
  assert.equal(s.verifiedToday, false);
});

test("excuse reasons are kept per day and default to closed", () => {
  const s = computeStats(seed, "2026-09-06", START, { "2026-09-04": "sick", "2026-09-05": "injured", "2026-09-06": "nonsense" });
  assert.equal(s.current, 7);
  assert.equal(s.excusedToday, true);
  assert.equal(s.excuseToday, "closed");            // unknown reason falls back to closed
  assert.deepEqual(s.excuseReasons, { "2026-09-04": "sick", "2026-09-05": "injured", "2026-09-06": "closed" });
  assert.deepEqual(s.excused, ["2026-09-04", "2026-09-05", "2026-09-06"]);
  assert.deepEqual(s.missed, []);
});

test("legacy excused list still works and reads as closed", () => {
  const s = computeStats(seed, "2026-09-04", START, ["2026-09-04"]);
  assert.equal(s.excuseToday, "closed");
  assert.deepEqual(s.excuseReasons, { "2026-09-04": "closed" });
  const none = computeStats(seed, "2026-09-04", START);
  assert.equal(none.excuseToday, null);
  assert.deepEqual(none.excuseReasons, {});
});

test("a bowled day is never excused, and a real miss still breaks the streak", () => {
  const s = computeStats(seed, "2026-09-06", START, ["2026-09-03", "2026-09-05"]);
  assert.deepEqual(s.excused, ["2026-09-05"]);       // Sep 3 was bowled, so the excuse is ignored
  assert.deepEqual(s.missed, ["2026-09-04"]);        // Sep 4 was a real miss
  assert.equal(s.current, 0);
});

test("a day away pauses the streak like any other reason", () => {
  assert.deepEqual(EXCUSE_REASONS, ["closed", "sick", "injured", "away"]);
  // Home to see family: the run neither breaks the streak nor extends it.
  const stats = computeStats(
    ["2026-09-01", "2026-09-02", "2026-09-06", "2026-09-07"],
    "2026-09-07",
    "2026-09-01",
    { "2026-09-03": "away", "2026-09-04": "away", "2026-09-05": "away" },
  );
  assert.equal(stats.current, 4);
  assert.equal(stats.longest, 4);
  assert.deepEqual(stats.missed, []);
  assert.equal(stats.excuseReasons["2026-09-04"], "away");
});

test("a pause takes a range, and checks it", () => {
  const today = "2026-09-12";
  const start = "2026-08-28";
  const ok = pauseRange({ from: "2026-09-20", to: "2026-09-23", reason: "away" }, today, start);
  assert.deepEqual(ok.dates, ["2026-09-20", "2026-09-21", "2026-09-22", "2026-09-23"]);
  assert.equal(ok.reason, "away");

  // A trip booked before it happens is the point, and one day is a range of one.
  assert.deepEqual(pauseRange({ from: "2026-12-24", reason: "away" }, today, start).dates, ["2026-12-24"]);
  assert.equal(pauseRange({ from: today }, today, start).reason, "closed");

  // And the things it must refuse.
  assert.match(pauseRange({ from: "2026-09-20", to: "2026-09-19" }, today, start).error, /before from/);
  assert.match(pauseRange({ from: "2026-08-01" }, today, start).error, /nothing before 2026-08-28/);
  assert.match(pauseRange({ from: "not-a-date" }, today, start).error, /YYYY-MM-DD/);
  assert.match(pauseRange({ from: "2026-09-20", to: "nope" }, today, start).error, /to must be/);
  assert.match(pauseRange({ from: today, reason: "hungover" }, today, start).error, /reason must be one of/);
  assert.match(pauseRange({ from: "2026-09-13", to: "2027-09-13" }, today, start).error, /days ahead/);
  assert.match(
    pauseRange({ from: "2026-09-01", to: addDays("2026-09-01", MAX_PAUSE_DAYS) }, today, start).error,
    /at most 60 days/,
  );
  // Exactly the limit is allowed.
  assert.equal(
    pauseRange({ from: "2026-09-01", to: addDays("2026-09-01", MAX_PAUSE_DAYS - 1) }, today, start).dates.length,
    MAX_PAUSE_DAYS,
  );
});

test("a day away that he bowled anyway still counts as bowled", () => {
  const stats = computeStats(["2026-09-04"], "2026-09-05", "2026-09-01", { "2026-09-04": "away" });
  assert.equal(stats.days.includes("2026-09-04"), true);
  assert.equal(stats.excused.includes("2026-09-04"), false, "a scored day wins over a pause");
});

test("consecutive paused days collapse into one run", () => {
  const runs = groupRuns([
    { date: "2026-09-20", reason: "away" },
    { date: "2026-09-21", reason: "away" },
    { date: "2026-09-22", reason: "away" },
    // A different reason starts a new run even though the day is adjacent.
    { date: "2026-09-23", reason: "sick" },
    // And so does a gap.
    { date: "2026-09-25", reason: "away" },
  ]);
  assert.deepEqual(runs, [
    { from: "2026-09-20", to: "2026-09-22", reason: "away", days: 3 },
    { from: "2026-09-23", to: "2026-09-23", reason: "sick", days: 1 },
    { from: "2026-09-25", to: "2026-09-25", reason: "away", days: 1 },
  ]);
  assert.deepEqual(groupRuns([]), []);
});

test("undoing a pause is not held to the start date", () => {
  const today = "2026-09-12";
  const start = "2026-08-28";
  // Creating one before the start is refused, since there is no streak there.
  assert.match(pauseRange({ from: "2026-08-01" }, today, start).error, /nothing before/);
  // Removing one that is somehow on file must still work, whatever put it there.
  assert.deepEqual(
    pauseRange({ from: "2026-08-01" }, today, start, { allowBefore: true }).dates,
    ["2026-08-01"],
  );
});
