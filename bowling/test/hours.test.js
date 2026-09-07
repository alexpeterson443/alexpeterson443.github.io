import test from "node:test";
import assert from "node:assert/strict";
import { parseHours, hoursStatus, weekRows, clockLabel, dayOfWeek, DEFAULT_HOURS } from "../functions/_lib/hours.js";

const TZ = "America/Chicago";
const HOURS = parseHours(DEFAULT_HOURS);

test("the default hours are Mon-Fri 10-10, Sat 12-10, Sun 12-8", () => {
  assert.deepEqual(HOURS[1], [600, 1320]);   // Mon 10:00 to 22:00
  assert.deepEqual(HOURS[5], [600, 1320]);   // Fri
  assert.deepEqual(HOURS[6], [720, 1320]);   // Sat 12:00 to 22:00
  assert.deepEqual(HOURS[0], [720, 1200]);   // Sun 12:00 to 20:00
});

test("clock labels read as wall clock times", () => {
  assert.equal(clockLabel(600), "10:00 AM");
  assert.equal(clockLabel(720), "12:00 PM");
  assert.equal(clockLabel(1200), "8:00 PM");
  assert.equal(clockLabel(1320), "10:00 PM");
});

test("the week groups equal days and starts on Monday", () => {
  assert.deepEqual(weekRows(HOURS), [
    { label: "Mon – Fri", hours: "10:00 AM – 10:00 PM", days: [1, 2, 3, 4, 5] },
    { label: "Sat", hours: "12:00 PM – 10:00 PM", days: [6] },
    { label: "Sun", hours: "12:00 PM – 8:00 PM", days: [0] },
  ]);
});

test("open, before open, and after close on a weekday", () => {
  // Mon 2026-09-07 in Chicago is UTC-5.
  const before = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-07T14:00:00Z")); // 9:00 AM
  assert.equal(before.beforeOpen, true);
  assert.equal(before.open, false);
  assert.equal(before.msUntilOpen, 60 * 60 * 1000);
  assert.equal(before.opensAt, "10:00 AM");
  // Closing is still the day's real deadline, even before the doors open.
  assert.equal(before.msUntilClose, 13 * 60 * 60 * 1000);

  const during = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T02:00:00Z")); // 9:00 PM
  assert.equal(during.open, true);
  assert.equal(during.msUntilClose, 60 * 60 * 1000);
  assert.equal(during.closesAt, "10:00 PM");

  const after = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T04:00:00Z")); // 11:00 PM
  assert.equal(after.open, false);
  assert.equal(after.beforeOpen, false);
  assert.equal(after.msUntilClose, null);
  assert.deepEqual(after.next, { day: "Tue", tomorrow: true, opens: "10:00 AM" });
});

test("Sunday closes at 8pm", () => {
  const s = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-07T00:30:00Z")); // 7:30 PM Sun
  assert.equal(s.open, true);
  assert.equal(s.closesAt, "8:00 PM");
  assert.equal(s.msUntilClose, 30 * 60 * 1000);
  assert.equal(s.todayLabel, "12:00 PM – 8:00 PM");

  const shut = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-07T01:30:00Z")); // 8:30 PM Sun
  assert.equal(shut.open, false);
  assert.deepEqual(shut.next, { day: "Mon", tomorrow: true, opens: "10:00 AM" });
});

test("hours are resolved through the timezone, so DST does not shift them", () => {
  // Sun 2026-11-01 is the fall back day: Chicago is UTC-5 before 2am, UTC-6 after.
  const s = hoursStatus(HOURS, TZ, "2026-11-01", new Date("2026-11-01T18:30:00Z")); // 12:30 PM CST
  assert.equal(s.open, true);
  assert.equal(s.closesAt, "8:00 PM");
  assert.equal(s.msUntilClose, 7.5 * 60 * 60 * 1000);
});

test("a day can be marked closed, and junk falls back to the default", () => {
  const h = parseHours({ ...DEFAULT_HOURS, mon: null, tue: ["nope", "22:00"], wed: ["22:00", "10:00"] });
  assert.equal(h[1], null);
  assert.deepEqual(h[2], [600, 1320]);       // unparsable open time
  assert.deepEqual(h[3], [600, 1320]);       // close before open
  const s = hoursStatus(h, TZ, "2026-09-07", new Date("2026-09-07T18:00:00Z"));
  assert.equal(s.closedToday, true);
  assert.equal(s.todayLabel, "Closed");
  assert.deepEqual(s.next, { day: "Tue", tomorrow: true, opens: "10:00 AM" });
});

test("hours parse from a JSON string, and bad JSON keeps the defaults", () => {
  const h = parseHours('{"sat":["09:00","23:00"]}');
  assert.deepEqual(h[6], [540, 1380]);
  assert.deepEqual(h[1], [600, 1320]);       // days left out keep their default
  assert.deepEqual(parseHours("not json"), HOURS);
  assert.deepEqual(parseHours(undefined), HOURS);
});

test("day of week matches the calendar", () => {
  assert.equal(dayOfWeek("2026-09-06"), 0);  // Sunday
  assert.equal(dayOfWeek("2026-09-07"), 1);  // Monday
  assert.equal(dayOfWeek("2026-08-28"), 5);  // Friday, the streak start
});
