import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEvents, expandOccurrences, zonedToUtc } from "../functions/_lib/ics.js";

const TZ = "America/Chicago";
const day = (iso) => Date.parse(iso + "T00:00:00Z");

const FEED = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:one
DTSTART;TZID=America/Chicago:20260904T190000
DTEND;TZID=America/Chicago:20260904T210000
SUMMARY:Bowling with Fernando
LOCATION:Bay View Bowl
END:VEVENT
BEGIN:VEVENT
UID:weekly
DTSTART;TZID=America/Chicago:20260901T180000
DURATION:PT1H30M
RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20261231T000000Z
EXDATE;TZID=America/Chicago:20260908T180000
SUMMARY:League bowling
END:VEVENT
BEGIN:VEVENT
UID:weekly
RECURRENCE-ID;TZID=America/Chicago:20260910T180000
DTSTART;TZID=America/Chicago:20260910T200000
DTEND;TZID=America/Chicago:20260910T213000
SUMMARY:League bowling (moved)
END:VEVENT
BEGIN:VEVENT
UID:allday
DTSTART;VALUE=DATE:20260906
DTEND;VALUE=DATE:20260907
SUMMARY:Bowl day
END:VEVENT
BEGIN:VEVENT
UID:daily
DTSTART:20260901T230000Z
DTEND:20260902T000000Z
RRULE:FREQ=DAILY;COUNT=3
SUMMARY:Practice bowl
END:VEVENT
BEGIN:VEVENT
UID:other
DTSTART;TZID=America/Chicago:20260904T100000
DTEND;TZID=America/Chicago:20260904T110000
SUMMARY:Therapy
END:VEVENT
END:VCALENDAR
`;

test("zonedToUtc handles CDT", () => {
  // 7pm Chicago on Sep 4 2026 (CDT, UTC-5) is 00:00Z Sep 5
  assert.equal(zonedToUtc({ y: 2026, mo: 9, d: 4, h: 19 }, TZ), Date.parse("2026-09-05T00:00:00Z"));
});

test("parses timed, all day, recurring and override events", () => {
  const events = parseEvents(FEED, TZ);
  assert.equal(events.length, 6);
  const one = events.find((e) => e.uid === "one");
  assert.equal(one.summary, "Bowling with Fernando");
  assert.equal(one.location, "Bay View Bowl");
  assert.equal(one.start.utc, Date.parse("2026-09-05T00:00:00Z"));
});

test("expands weekly rule with BYDAY, EXDATE and RECURRENCE-ID override", () => {
  const occ = expandOccurrences(parseEvents(FEED, TZ), day("2026-09-01"), day("2026-09-15"));
  const league = occ.filter((o) => o.uid === "weekly").map((o) => [new Date(o.start).toISOString(), o.summary]);
  assert.deepEqual(league, [
    ["2026-09-01T23:00:00.000Z", "League bowling"],           // Tue Sep 1 6pm
    ["2026-09-03T23:00:00.000Z", "League bowling"],           // Thu Sep 3
    // Tue Sep 8 excluded by EXDATE
    ["2026-09-11T01:00:00.000Z", "League bowling (moved)"],   // Thu Sep 10 moved to 8pm
  ]);
});

test("daily COUNT rule and all day event", () => {
  const occ = expandOccurrences(parseEvents(FEED, TZ), day("2026-08-30"), day("2026-09-30"));
  assert.equal(occ.filter((o) => o.uid === "daily").length, 3);
  const allday = occ.find((o) => o.uid === "allday");
  assert.equal(allday.allDay, true);
  assert.equal(allday.end - allday.start, 86_400_000);
});

test("window filtering excludes events outside the range", () => {
  const occ = expandOccurrences(parseEvents(FEED, TZ), day("2026-10-01"), day("2026-10-08"));
  assert.deepEqual([...new Set(occ.map((o) => o.uid))], ["weekly"]);
});

test("weekly BYDAY with days earlier than DTSTART's weekday are not dropped at the window edge", () => {
  // DTSTART Wed Sep 2, rule MO,WE,FR, window Sep 1..Sep 5 must give Wed 2 and Fri 4.
  const feed = "BEGIN:VEVENT\nUID:w\nDTSTART;TZID=America/Chicago:20260902T180000\nDTEND;TZID=America/Chicago:20260902T190000\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR\nSUMMARY:Bowling\nEND:VEVENT\n";
  const occ = expandOccurrences(parseEvents(feed, TZ), day("2026-09-01"), day("2026-09-06"));
  assert.deepEqual(occ.map((o) => new Date(o.start).toISOString().slice(0, 10)), ["2026-09-02", "2026-09-04"]);
});

test("INTERVAL=2 weekly rules follow Monday based weeks", () => {
  const feed = "BEGIN:VEVENT\nUID:w2\nDTSTART;TZID=America/Chicago:20260902T180000\nDTEND;TZID=America/Chicago:20260902T190000\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR\nSUMMARY:Bowling\nEND:VEVENT\n";
  const occ = expandOccurrences(parseEvents(feed, TZ), day("2026-09-01"), day("2026-10-01"));
  assert.deepEqual(occ.map((o) => new Date(o.start).toISOString().slice(0, 10)),
    ["2026-09-02", "2026-09-04", "2026-09-14", "2026-09-16", "2026-09-18", "2026-09-28", "2026-09-30"]);
});

test("all day events fall on the local day, not the UTC day", () => {
  const feed = "BEGIN:VEVENT\nUID:ad\nDTSTART;VALUE=DATE:20260906\nDTEND;VALUE=DATE:20260907\nSUMMARY:Bowl day\nEND:VEVENT\n";
  const [o] = expandOccurrences(parseEvents(feed, TZ), day("2026-09-01"), day("2026-09-10"));
  assert.equal(new Date(o.start).toLocaleDateString("en-CA", { timeZone: TZ }), "2026-09-06");
  assert.equal(o.start, zonedToUtc({ y: 2026, mo: 9, d: 6 }, TZ));
});

test("unknown or quoted TZIDs fall back instead of throwing", () => {
  const feed = "BEGIN:VEVENT\nUID:q\nDTSTART;TZID=\"America/Chicago\":20260904T190000\nSUMMARY:Bowling\nEND:VEVENT\nBEGIN:VEVENT\nUID:win\nDTSTART;TZID=Central Standard Time:20260904T190000\nSUMMARY:Bowling\nEND:VEVENT\n";
  const ev = parseEvents(feed, TZ);
  assert.equal(ev[0].start.utc, Date.parse("2026-09-05T00:00:00Z"));
  assert.equal(ev[1].start.utc, Date.parse("2026-09-05T00:00:00Z"));
});

test("daily rule since 2020 still yields occurrences today, and DAILY BYDAY filters weekdays", () => {
  const feed = "BEGIN:VEVENT\nUID:d\nDTSTART;TZID=America/Chicago:20200101T070000\nDTEND;TZID=America/Chicago:20200101T080000\nRRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR\nSUMMARY:Bowling\nEND:VEVENT\n";
  const occ = expandOccurrences(parseEvents(feed, TZ), day("2026-09-01"), day("2026-09-08"));
  assert.deepEqual(occ.map((o) => new Date(o.start).toLocaleDateString("en-US", { weekday: "short", timeZone: TZ })), ["Tue", "Wed", "Thu", "Fri", "Mon"]);
});
