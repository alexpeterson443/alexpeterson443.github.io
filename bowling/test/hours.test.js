import test from "node:test";
import assert from "node:assert/strict";
import { parseHours, hoursStatus, weekRows, clockLabel, dayOfWeek, lastCallFromEnv, DEFAULT_HOURS, DEFAULT_LAST_CALL } from "../functions/_lib/hours.js";

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
  // Last call is still the day's real deadline, even before the doors open.
  assert.equal(before.msUntilLastCall, 12.75 * 60 * 60 * 1000);

  const during = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T02:00:00Z")); // 9:00 PM
  assert.equal(during.open, true);
  assert.equal(during.closesAt, "10:00 PM");
  assert.equal(during.lastCallAt, "9:45 PM");
  assert.equal(during.lastCallPassed, false);
  assert.equal(during.msUntilLastCall, 45 * 60 * 1000);

  const after = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T04:00:00Z")); // 11:00 PM
  assert.equal(after.open, false);
  assert.equal(after.beforeOpen, false);
  assert.equal(after.msUntilLastCall, null);
  assert.equal(after.next.day, "Tue");
  assert.equal(after.next.opens, "10:00 AM");
  assert.equal(after.next.date, "2026-09-08");
  assert.equal(after.msUntilNextOpen, 11 * 60 * 60 * 1000);   // 11 PM Mon to 10 AM Tue
});

test("the next opening is the wait once today is settled", () => {
  // Sun 7:54 PM, the alley shuts at 8 and reopens Mon at 10 AM: 14h 6m away.
  const s = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-07T00:54:00Z"));
  assert.equal(s.next.day, "Mon");
  assert.equal(s.next.tomorrow, true);
  assert.equal(s.next.opens, "10:00 AM");
  assert.equal(s.next.date, "2026-09-07");
  assert.equal(s.msUntilNextOpen, (14 * 60 + 6) * 60 * 1000);

  // Still open earlier in the day: the next opening is tomorrow's, not today's.
  const midday = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-06T18:00:00Z")); // 1 PM Sun
  assert.equal(midday.open, true);
  assert.equal(midday.next.date, "2026-09-07");
  assert.equal(midday.msUntilNextOpen, 21 * 60 * 60 * 1000);  // 1 PM Sun to 10 AM Mon
});

test("the next opening skips days the alley never opens", () => {
  const h = parseHours({ ...DEFAULT_HOURS, mon: null, tue: null });
  // Sun 7:54 PM with Mon and Tue shut: the next opening is Wed at 10 AM.
  const s = hoursStatus(h, TZ, "2026-09-06", new Date("2026-09-07T00:54:00Z"));
  assert.equal(s.next.day, "Wed");
  assert.equal(s.next.tomorrow, false);
  assert.equal(s.next.date, "2026-09-09");
  assert.equal(s.msUntilNextOpen, (2 * 24 * 60 + 14 * 60 + 6) * 60 * 1000);
});

test("the next opening crosses a DST change correctly", () => {
  // Sat 2026-10-31 11 PM CDT to Sun 2026-11-01 12 PM CST reads as 13 hours on a
  // wall clock, but the clocks go back overnight so it is 14 real hours.
  const s = hoursStatus(HOURS, TZ, "2026-10-31", new Date("2026-11-01T04:00:00Z"));
  assert.equal(s.next.date, "2026-11-01");
  assert.equal(s.next.opens, "12:00 PM");
  assert.equal(s.msUntilNextOpen, 14 * 60 * 60 * 1000);
});

test("the last 15 minutes are too late to start a game", () => {
  // 9:50 PM Mon: the alley is open but has stopped putting games on.
  const s = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T02:50:00Z"));
  assert.equal(s.open, true);
  assert.equal(s.lastCallPassed, true);
  assert.equal(s.msUntilLastCall, null);
  assert.equal(s.lastCallAt, "9:45 PM");
  assert.equal(s.closesAt, "10:00 PM");
  assert.equal(s.todayLabel, "10:00 AM – 10:00 PM");   // posted hours are unchanged

  // A minute before the cut off it is still on.
  const just = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T02:44:00Z"));
  assert.equal(just.lastCallPassed, false);
  assert.equal(just.msUntilLastCall, 60 * 1000);
});

test("the cut off is configurable and clamped, and never precedes opening", () => {
  assert.equal(lastCallFromEnv({}), DEFAULT_LAST_CALL);
  assert.equal(lastCallFromEnv({ LAST_CALL_MINUTES: "30" }), 30);
  assert.equal(lastCallFromEnv({ LAST_CALL_MINUTES: "0" }), 0);
  assert.equal(lastCallFromEnv({ LAST_CALL_MINUTES: "banana" }), DEFAULT_LAST_CALL);
  assert.equal(lastCallFromEnv({ LAST_CALL_MINUTES: "-5" }), DEFAULT_LAST_CALL);
  assert.equal(lastCallFromEnv({ LAST_CALL_MINUTES: "999" }), DEFAULT_LAST_CALL);

  const s = hoursStatus(HOURS, TZ, "2026-09-07", new Date("2026-09-08T02:00:00Z"), 30);
  assert.equal(s.lastCallAt, "9:30 PM");
  assert.equal(s.msUntilLastCall, 30 * 60 * 1000);

  // A cut off longer than the day's window falls back to opening time.
  const tiny = parseHours({ ...DEFAULT_HOURS, mon: ["10:00", "10:10"] });
  const t = hoursStatus(tiny, TZ, "2026-09-07", new Date("2026-09-07T15:05:00Z")); // 10:05 AM
  assert.equal(t.lastCallAt, "10:00 AM");
  assert.equal(t.lastCallPassed, true);
  assert.equal(t.msUntilLastCall, null);

  // Inside a longer window the cut off lands normally, before opening is reached.
  const short = parseHours({ ...DEFAULT_HOURS, mon: ["10:00", "10:20"] });
  const u = hoursStatus(short, TZ, "2026-09-07", new Date("2026-09-07T15:00:00Z")); // 10:00 AM
  assert.equal(u.lastCallAt, "10:05 AM");
  assert.equal(u.msUntilLastCall, 5 * 60 * 1000);
});

test("Sunday closes at 8pm", () => {
  const s = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-07T00:30:00Z")); // 7:30 PM Sun
  assert.equal(s.open, true);
  assert.equal(s.closesAt, "8:00 PM");
  assert.equal(s.lastCallAt, "7:45 PM");
  assert.equal(s.msUntilLastCall, 15 * 60 * 1000);
  assert.equal(s.todayLabel, "12:00 PM – 8:00 PM");

  const shut = hoursStatus(HOURS, TZ, "2026-09-06", new Date("2026-09-07T01:30:00Z")); // 8:30 PM Sun
  assert.equal(shut.open, false);
  assert.equal(shut.next.day, "Mon");
  assert.equal(shut.next.opens, "10:00 AM");
  assert.equal(shut.msUntilNextOpen, 13.5 * 60 * 60 * 1000);
});

test("hours are resolved through the timezone, so DST does not shift them", () => {
  // Sun 2026-11-01 is the fall back day: Chicago is UTC-5 before 2am, UTC-6 after.
  const s = hoursStatus(HOURS, TZ, "2026-11-01", new Date("2026-11-01T18:30:00Z")); // 12:30 PM CST
  assert.equal(s.open, true);
  assert.equal(s.closesAt, "8:00 PM");
  assert.equal(s.msUntilLastCall, 7.25 * 60 * 60 * 1000);
});

test("a day can be marked closed, and junk falls back to the default", () => {
  const h = parseHours({ ...DEFAULT_HOURS, mon: null, tue: ["nope", "22:00"], wed: ["22:00", "10:00"] });
  assert.equal(h[1], null);
  assert.deepEqual(h[2], [600, 1320]);       // unparsable open time
  assert.deepEqual(h[3], [600, 1320]);       // close before open
  const s = hoursStatus(h, TZ, "2026-09-07", new Date("2026-09-07T18:00:00Z"));
  assert.equal(s.closedToday, true);
  assert.equal(s.todayLabel, "Closed");
  assert.equal(s.next.day, "Tue");
  assert.equal(s.next.tomorrow, true);
  assert.equal(s.next.opens, "10:00 AM");
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
