import test from "node:test";
import assert from "node:assert/strict";
import { validateSettings, applySettings, cleanRecord, mergeEnv, settingsView, isValidTimezone } from "../functions/_lib/settings.js";
import { parseHours, hoursStatus } from "../functions/_lib/hours.js";

const ENV = {
  START_DATE: "2026-08-28",
  TIMEZONE: "America/Chicago",
  LAST_CALL_MINUTES: "15",
  STREAK_KV: { get: async () => null },
};
const TODAY = "2026-09-17";

test("a setting he never touched still comes from the deploy config", () => {
  const view = settingsView(ENV, {});
  assert.equal(view.effective.startDate, "2026-08-28");
  assert.equal(view.effective.lastCallMinutes, 15);
  assert.deepEqual(view.effective.hours.mon, ["10:00", "22:00"]);
  assert.deepEqual(view.effective.hours.sun, ["12:00", "20:00"]);
  assert.deepEqual(view.overridden, []);
});

test("what he saves wins, and the deploy value is still reported beside it", () => {
  const saved = { LAST_CALL_MINUTES: "30", HOURS: { sun: null } };
  const view = settingsView(ENV, saved);
  assert.equal(view.effective.lastCallMinutes, 30);
  assert.equal(view.effective.hours.sun, null);
  assert.equal(view.deploy.lastCallMinutes, 15);
  assert.deepEqual(view.deploy.hours.sun, ["12:00", "20:00"]);
  assert.deepEqual(view.overridden, ["hours", "lastCallMinutes"]);
});

test("the merged config is what the hours maths actually reads", () => {
  const cfg = mergeEnv(ENV, { HOURS: { wed: ["10:00", "18:00"] }, LAST_CALL_MINUTES: "30" });
  const now = new Date("2026-09-16T16:00:00-05:00");
  const h = hoursStatus(parseHours(cfg.HOURS), cfg.TIMEZONE, "2026-09-16", now, Number(cfg.LAST_CALL_MINUTES));
  // 6pm close, 30 minutes back: the deadline moves from 9:45 PM to 5:30 PM.
  assert.equal(h.lastCallAt, "5:30 PM");
});

test("a day left out of the table keeps whatever it had", () => {
  const { clean, errors } = validateSettings({ hours: { fri: ["09:00", "23:00"] } }, TODAY);
  assert.deepEqual(errors, []);
  assert.deepEqual(clean.HOURS, { fri: ["09:00", "23:00"] });
  const view = settingsView(ENV, clean);
  assert.deepEqual(view.effective.hours.fri, ["09:00", "23:00"]);
  assert.deepEqual(view.effective.hours.mon, ["10:00", "22:00"]);
});

test("nothing that would quietly move every day boundary gets through", () => {
  const cases = [
    [{ timezone: "Mars/Olympus" }, /not a timezone/],
    [{ timezone: "" }, /not a timezone/],
    [{ startDate: "28-08-2026" }, /YYYY-MM-DD/],
    [{ startDate: "2027-01-01" }, /cannot start in the future/],
    [{ lastCallMinutes: 241 }, /0 to 240/],
    [{ lastCallMinutes: 12.5 }, /0 to 240/],
    [{ hours: { mon: ["22:00", "10:00"] } }, /closes before it opens/],
    [{ hours: { mon: ["25:00", "26:00"] } }, /two times/],
    [{ hours: [] }, /table of days/],
    [{ calendarIcsUrl: "javascript:alert(1)" }, /http, https or webcal/],
    [{ calendarKeyword: "" }, /1 to 40/],
  ];
  for (const [input, pattern] of cases) {
    const { errors } = validateSettings(input, TODAY);
    assert.equal(errors.length > 0, true, `${JSON.stringify(input)} should have been refused`);
    assert.match(errors[0], pattern);
  }
});

test("a number that arrived as a string is still a number", () => {
  assert.equal(validateSettings({ lastCallMinutes: "0" }, TODAY).clean.LAST_CALL_MINUTES, "0");
  assert.equal(validateSettings({ lastCallMinutes: 240 }, TODAY).clean.LAST_CALL_MINUTES, "240");
});

test("nothing outside the known fields can be written into the record", () => {
  const { clean } = validateSettings({ ACCESS_KEY: "hunter2", accessKey: "hunter2", timezone: "UTC" }, TODAY);
  assert.deepEqual(clean, { TIMEZONE: "UTC" });
  assert.deepEqual(cleanRecord({ TIMEZONE: "UTC", ACCESS_KEY: "hunter2", VAPID_PRIVATE_JWK: "x" }), { TIMEZONE: "UTC" });
});

test("null puts one setting back without disturbing the others", () => {
  const saved = { TIMEZONE: "UTC", LAST_CALL_MINUTES: "30" };
  const { clean } = validateSettings({ timezone: null }, TODAY);
  assert.deepEqual(applySettings(saved, clean), { LAST_CALL_MINUTES: "30" });
});

test("an empty feed clears it rather than storing an empty string", () => {
  const { clean, errors } = validateSettings({ calendarIcsUrl: "   " }, TODAY);
  assert.deepEqual(errors, []);
  assert.equal(clean.CALENDAR_ICS_URL, null);
  assert.deepEqual(applySettings({ CALENDAR_ICS_URL: "https://cal.test/x.ics" }, clean), {});
});

test("the feed is never read back whole, only enough to recognise it", () => {
  const url = "https://calendar.google.com/calendar/ical/secret-token-abc123/basic.ics";
  const view = settingsView({ ...ENV, CALENDAR_ICS_URL: url }, {});
  assert.equal(view.effective.calendar.configured, true);
  assert.equal(view.effective.calendar.host, "calendar.google.com");
  const whole = JSON.stringify(view);
  assert.equal(whole.includes("secret-token-abc123"), false);
  assert.equal(whole.includes(url), false);
});

test("timezones are checked against the runtime, not a list someone wrote down", () => {
  assert.equal(isValidTimezone("America/Chicago"), true);
  assert.equal(isValidTimezone("UTC"), true);
  assert.equal(isValidTimezone("Not/AZone"), false);
  assert.equal(isValidTimezone(null), false);
});
