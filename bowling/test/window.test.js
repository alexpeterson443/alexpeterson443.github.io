import test from "node:test";
import assert from "node:assert/strict";
import {
  freeWindows, bestWindow, planWindow, windowSentence, windowShort, MIN_WINDOW_MINUTES,
} from "../functions/_lib/window.js";

/** Mon 2026-09-14, worked in plain UTC so the arithmetic is readable. */
const T = (h, m = 0) => Date.UTC(2026, 8, 14, h, m);
const HOURS = { closedToday: false, openMs: T(10), closeMs: T(22), lastCallMs: T(21, 45) };
const clock = (ms) => new Date(ms).toISOString().slice(11, 16);

const CLASSES = [
  { start: T(11), end: T(12), summary: "CHEM 100" },
  { start: T(12), end: T(13), summary: "ENGLISH 101" },
  { start: T(16), end: T(17), summary: "Work" },
];

test("a closed day and missing hours offer nothing", () => {
  assert.deepEqual(freeWindows(CLASSES, { closedToday: true }, T(9)), []);
  assert.deepEqual(freeWindows(CLASSES, null, T(9)), []);
  assert.deepEqual(freeWindows(CLASSES, { closedToday: false }, T(9)), []);
});

test("the day is split around his commitments", () => {
  const w = freeWindows(CLASSES, HOURS, T(9));
  assert.deepEqual(w.map((x) => [clock(x.start), clock(x.end), x.minutes, x.before]), [
    ["10:00", "11:00", 60, "CHEM 100"],
    // Two classes back to back read as one block, not two.
    ["13:00", "16:00", 180, "Work"],
    ["17:00", "21:45", 285, null],
  ]);
});

test("windows start at now, never in the past", () => {
  const w = freeWindows(CLASSES, HOURS, T(14));
  assert.deepEqual(w.map((x) => clock(x.start)), ["14:00", "17:00"]);
  // Before opening, the window starts when the lanes do rather than now.
  assert.equal(clock(freeWindows(CLASSES, HOURS, T(6))[0].start), "10:00");
});

test("the deadline is last call, not closing time", () => {
  // 21:00 leaves exactly the minimum, so it still counts; ten minutes later
  // there is no longer a window worth the walk.
  assert.deepEqual(freeWindows([], HOURS, T(21)).map((x) => clock(x.end)), ["21:45"]);
  assert.deepEqual(freeWindows([], HOURS, T(21, 10)), []);
  const w = freeWindows([], HOURS, T(20));
  assert.equal(clock(w[0].end), "21:45");
  assert.deepEqual(freeWindows([], HOURS, T(22)), []);
});

test("a gap too short to bother with is not offered", () => {
  const tight = [{ start: T(10, 30), end: T(11), summary: "Advising" }];
  assert.deepEqual(freeWindows(tight, HOURS, T(10)).map((x) => clock(x.start)), ["11:00"],
    `a ${MIN_WINDOW_MINUTES - 15} minute gap is not a bowling window`);

  // Exactly the minimum counts.
  const exact = [{ start: T(10) + MIN_WINDOW_MINUTES * 60_000, end: T(20), summary: "Lab" }];
  assert.equal(freeWindows(exact, HOURS, T(10)).length, 2);
});

test("junk in the calendar is ignored rather than throwing", () => {
  const junk = [null, {}, { start: T(11) }, { start: T(12), end: T(11) }, { start: T(11), end: T(12) }];
  const w = freeWindows(junk, HOURS, T(9));
  assert.deepEqual(w.map((x) => clock(x.start)), ["10:00", "12:00"]);
  assert.equal(w[0].before, null, "an event with no title still blocks the time");
  assert.deepEqual(freeWindows("nonsense", HOURS, T(9)).map((x) => clock(x.start)), ["10:00"]);
});

test("the window he is standing in wins over the next one", () => {
  const w = freeWindows(CLASSES, HOURS, T(14));
  const now = bestWindow(w, T(14));
  assert.equal(clock(now.start), "14:00");
  assert.equal(now.open, true);

  const later = bestWindow(freeWindows(CLASSES, HOURS, T(9)), T(9));
  assert.equal(clock(later.start), "10:00");
  assert.equal(later.open, false, "before opening he is not in the window yet");
  assert.equal(bestWindow([], T(9)), null);
});

test("the sentence reads as a nudge when he is free now and a plan when he is not", () => {
  const open = bestWindow(freeWindows(CLASSES, HOURS, T(14)), T(14));
  assert.equal(windowSentence(open, clock),
    "You are free until 16:00 before Work. That is 2h to get a game in.");

  const plan = bestWindow(freeWindows(CLASSES, HOURS, T(9)), T(9));
  assert.equal(windowSentence(plan, clock),
    "Your window today is 10:00 to 11:00, before CHEM 100. 1h free with the lanes open.");

  // A trailing window has nothing after it to name.
  const evening = bestWindow(freeWindows(CLASSES, HOURS, T(18)), T(18));
  assert.equal(windowSentence(evening, clock),
    "You are free until 21:45. That is 3h 45m to get a game in.");

  assert.equal(windowSentence(null, clock), null);
});

test("the short form fits the one line above the fold", () => {
  const open = bestWindow(freeWindows(CLASSES, HOURS, T(14)), T(14));
  assert.equal(windowShort(open, clock), "Free until 16:00 · 2h left");

  const plan = bestWindow(freeWindows(CLASSES, HOURS, T(9)), T(9));
  assert.equal(windowShort(plan, clock), "Free 10:00 to 11:00 · 1h");

  const odd = bestWindow(freeWindows(CLASSES, HOURS, T(18)), T(18));
  assert.equal(windowShort(odd, clock), "Free until 21:45 · 3h 45m left");

  // Under an hour reads in minutes rather than "0h 50m".
  assert.equal(windowShort({ minutes: 50, start: T(10), end: T(10, 50), open: false }, clock),
    "Free 10:00 to 10:50 · 50m");
  assert.equal(windowShort(null, clock), null);
});

test("an empty calendar gets no window rather than the alley hours read back", () => {
  // With nothing on today, "free until last call" only repeats the opening
  // hours the countdown already shows.
  assert.equal(planWindow([], HOURS, T(14)), null);
  assert.equal(planWindow(null, HOURS, T(14)), null);

  // Commitments that miss the bowlable part of the day do not constrain it,
  // and neither does one that has already finished: treating a morning class as
  // a constraint at 2pm would unlock a window equal to the remaining hours.
  assert.equal(planWindow([{ start: T(6), end: T(8), summary: "Gym" }], HOURS, T(14)), null);
  assert.equal(planWindow([{ start: T(22, 30), end: T(23), summary: "Call" }], HOURS, T(14)), null);
  assert.equal(planWindow([{ start: T(11), end: T(12), summary: "CHEM 100" }], HOURS, T(14)), null);
  // The same class does constrain the day while it is still ahead of him.
  assert.equal(clock(planWindow([{ start: T(11), end: T(12), summary: "CHEM 100" }], HOURS, T(10)).end), "11:00");

  // One real class is enough to make the gaps meaningful.
  const w = planWindow(CLASSES, HOURS, T(14));
  assert.equal(clock(w.start), "14:00");
  assert.equal(w.open, true);
  assert.equal(w.before, "Work");

  assert.equal(planWindow(CLASSES, { closedToday: true }, T(14)), null);
  assert.equal(planWindow(CLASSES, null, T(14)), null);
});
