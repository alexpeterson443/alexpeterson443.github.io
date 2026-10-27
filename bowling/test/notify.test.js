import test from "node:test";
import assert from "node:assert/strict";
import {
  headsupWindow, weeklyWindow, dueByClock, streakNotice, weeklyRecap,
  validatePrefs, cleanPrefs, isMilestone, DEFAULT_PREFS,
} from "../functions/_lib/notify.js";
import { hoursStatus, parseHours } from "../functions/_lib/hours.js";
import { runNudge } from "../functions/_lib/nudge-run.js";
import { onRequestGet as noticeGet } from "../functions/api/notice.js";
import { onRequestGet as notifyGet, onRequestPut as notifyPut } from "../functions/api/notify.js";
import { onRequest } from "../functions/_middleware.js";
import { todayIn, addDays } from "../functions/_lib/streak.js";

const TZ = "America/Chicago";
const HOURS = parseHours(null);

/** Milwaukee wall clock on a date in September (CDT, UTC-5). */
const ms = (date, hhmm) => new Date(`${date}T${hhmm}:00-05:00`).getTime();
const hoursOn = (date, hhmm, table = HOURS) => hoursStatus(table, TZ, date, new Date(ms(date, hhmm)), 15);

const WED = "2026-09-16";
const SUN = "2026-09-20";
const MON = "2026-09-21";

// ---------- when ----------

test("the heads up runs from its time until the last call window opens", () => {
  const w = headsupWindow(hoursOn(WED, "12:00"), WED, TZ);
  assert.equal(w.start, ms(WED, "16:00"));
  assert.equal(w.end, ms(WED, "18:00"));
});

test("on Sunday's early close the heads up gives way to the last call reminder", () => {
  // Last call 7:45 PM, so its window opens at 5:45 PM and the heads up stops there.
  const w = headsupWindow(hoursOn(SUN, "12:00"), SUN, TZ);
  assert.equal(w.end, ms(SUN, "17:45"));
});

test("a heads up set too late for the evening simply does not happen", () => {
  assert.equal(headsupWindow(hoursOn(WED, "12:00"), WED, TZ, "20:00"), null);
  const squeezed = headsupWindow(hoursOn(WED, "12:00"), WED, TZ, "19:00");
  assert.equal(squeezed.end - squeezed.start, 45 * 60_000);
});

test("no heads up on a day the alley never opens", () => {
  const closed = parseHours({ wed: null });
  assert.equal(headsupWindow(hoursOn(WED, "12:00", closed), WED, TZ), null);
});

test("the recap is a Monday morning thing only", () => {
  assert.equal(weeklyWindow(WED, TZ), null);
  const w = weeklyWindow(MON, TZ);
  assert.equal(w.start, ms(MON, "09:00"));
  assert.equal(w.end, ms(MON, "12:00"));
});

test("the clock check names what is due and says why the rest are not", () => {
  const at = (date, hhmm, prefs = DEFAULT_PREFS) =>
    dueByClock({ nowMs: ms(date, hhmm), today: date, tz: TZ, hours: hoursOn(date, hhmm), prefs });
  assert.deepEqual(at(WED, "16:30").due, ["headsup"]);
  assert.deepEqual(at(WED, "20:00").due, ["lastcall"]);
  assert.deepEqual(at(WED, "13:00").due, []);
  assert.deepEqual(at(MON, "09:30").due, ["weekly"]);
  const off = at(WED, "16:30", { ...DEFAULT_PREFS, headsup: false });
  assert.deepEqual(off.due, []);
  assert.equal(off.why.headsup, "turned off");
});

// ---------- what ----------

test("the heads up names the milestone one game would reach", () => {
  const hours = hoursOn(WED, "16:00");
  const n = streakNotice("headsup", { current: 59, longest: 70 }, hours);
  assert.equal(n.title, "One game from 60 days");
  assert.match(n.body, /by 9:45 PM to make it 60\./);
  assert.doesNotMatch(n.body, /longest/);
});

test("the heads up says when tonight would beat the longest run", () => {
  const n = streakNotice("headsup", { current: 40, longest: 40 }, hoursOn(WED, "16:00"));
  assert.equal(n.title, "40-day streak");
  assert.match(n.body, /beats your longest run \(40\)/);
});

test("with no streak the heads up says start one rather than counting zero", () => {
  const n = streakNotice("headsup", { current: 0, longest: 12 }, hoursOn(WED, "16:00"));
  assert.equal(n.title, "Start a streak today");
});

test("the last call reminder keeps its old wording", () => {
  const n = streakNotice("lastcall", { current: 12, longest: 12 }, hoursOn(WED, "20:00"));
  assert.equal(n.title, "12 days on the line");
  assert.match(n.body, /Last game goes on by 9:45 PM\. One game makes it 13\./);
});

test("milestones are the round ones, then every hundred past a year", () => {
  assert.equal(isMilestone(60), true);
  assert.equal(isMilestone(61), false);
  assert.equal(isMilestone(500), true);
  assert.equal(isMilestone(450), false);
});

test("the recap compares nightly averages and spots a personal best", () => {
  const scores = {
    // The week before: one night, 100 and 120, so 110.
    "2026-09-08": [100, 120],
    // Last week: two nights, averaging 120 and 130, so 125.
    "2026-09-15": [110, 130],
    "2026-09-17": [130],
  };
  const r = weeklyRecap(scores, MON, { current: 25 });
  assert.equal(r.title, "Last week: 2 nights, 3 games");
  assert.equal(r.body, "Average 125 (+15 on the week before). Best game 130, a new personal best. Streak 25 days.");
});

test("a recap of an empty week says so plainly", () => {
  const r = weeklyRecap({ "2026-09-01": [150] }, MON, { current: 0 });
  assert.equal(r.title, "Last week: no games");
  assert.match(r.body, /No streak running/);
});

test("a first week has nothing to compare against and claims no record", () => {
  const r = weeklyRecap({ "2026-09-15": [90, 110] }, MON, { current: 3 });
  assert.equal(r.body, "Average 100. Best game 110. Streak 3 days.");
});

test("prefs refuse what they should and keep the rest", () => {
  assert.deepEqual(cleanPrefs({ weekly: "yes", at: "25:00", extra: 1 }), DEFAULT_PREFS);
  const { prefs, errors } = validatePrefs({ weekly: false, at: "7pm" });
  assert.equal(prefs.weekly, false);
  assert.equal(prefs.at, "16:00");
  assert.match(errors[0], /16:00/);
  // Off the quarter hour, a time could fall between the timer's ticks.
  assert.equal(validatePrefs({ at: "17:40" }).errors.length, 1);
  assert.equal(validatePrefs({ at: "17:45" }).prefs.at, "17:45");
});

// ---------- the run ----------

function kv(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    store,
    STREAK_KV: {
      get: async (k, opts) => {
        if (!store.has(k)) return null;
        const type = typeof opts === "string" ? opts : opts && opts.type;
        return type === "json" ? JSON.parse(store.get(k)) : store.get(k);
      },
      put: async (k, v) => { store.set(k, v); },
      delete: async (k) => { store.delete(k); },
    },
  };
}

async function setup(seed = {}) {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  const { store, STREAK_KV } = kv({ checkins: [], push_subs: [{ endpoint: "https://web.push.apple.com/abc" }], ...seed });
  return {
    store,
    env: {
      START_DATE: "2026-08-28",
      TIMEZONE: TZ,
      ACCESS_KEY: "full-secret-key",
      NUDGE_TOKEN: "timer-secret",
      VAPID_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey)),
      STREAK_KV,
    },
  };
}

/** Swap fetch for a push service that records what it was sent. */
function pushService(status = 201) {
  const sent = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, topic: init.headers.Topic }); return new Response(null, { status }); };
  return { sent, restore: () => { globalThis.fetch = real; } };
}

test("an unsettled afternoon gets one heads up, and only one", async (t) => {
  const { env, store } = await setup({ scores: { "2026-09-15": [120] } });
  const svc = pushService();
  t.after(svc.restore);

  const out = await runNudge(env, ms(WED, "16:15"));
  assert.equal(out.send, true);
  assert.equal(out.notice.kind, "headsup");
  assert.equal(svc.sent.length, 1);
  assert.equal(svc.sent[0].topic, "bowl-headsup");
  assert.equal(JSON.parse(store.get("push_notice"))[0].title, out.notice.title);

  const again = await runNudge(env, ms(WED, "16:30"));
  assert.equal(again.send, false);
  assert.equal(again.kinds.headsup, "already sent today");
  assert.equal(svc.sent.length, 1);
});

test("a day with a game gets no streak reminder at all", async (t) => {
  const { env } = await setup({ scores: { [WED]: [130] } });
  const svc = pushService();
  t.after(svc.restore);
  const out = await runNudge(env, ms(WED, "20:00"));
  assert.equal(out.send, false);
  assert.equal(out.kinds.lastcall, "today already has a game or a pause");
  assert.equal(svc.sent.length, 0);
});

test("Monday morning sends the recap even when the day is settled", async (t) => {
  const { env } = await setup({ scores: { "2026-09-15": [110, 130], [MON]: [140] } });
  const svc = pushService();
  t.after(svc.restore);
  const out = await runNudge(env, ms(MON, "09:15"));
  assert.equal(out.notice.kind, "weekly");
  assert.equal(svc.sent[0].topic, "bowl-weekly");
});

test("a turned off kind is never sent", async (t) => {
  const { env } = await setup({ notify_prefs: { headsup: false } });
  const svc = pushService();
  t.after(svc.restore);
  const out = await runNudge(env, ms(WED, "16:15"));
  assert.equal(out.send, false);
  assert.equal(svc.sent.length, 0);
});

test("a failed push is retried on the next tick rather than written off", async (t) => {
  const { env, store } = await setup();
  const svc = pushService(500);
  t.after(svc.restore);
  const out = await runNudge(env, ms(WED, "16:15"));
  assert.equal(out.delivered, 0);
  assert.equal(store.has("push_sent:headsup"), false);
});

test("a retired device is dropped", async (t) => {
  const { env, store } = await setup();
  const svc = pushService(410);
  t.after(svc.restore);
  await runNudge(env, ms(WED, "16:15"));
  assert.deepEqual(JSON.parse(store.get("push_subs")), []);
});

test("a dry run reasons all the way and sends nothing", async (t) => {
  const { env, store } = await setup();
  const svc = pushService();
  t.after(svc.restore);
  const out = await runNudge(env, ms(WED, "16:15"), { dryRun: true });
  assert.equal(out.dryRun, true);
  assert.equal(out.notice.kind, "headsup");
  assert.equal(svc.sent.length, 0);
  assert.equal(store.has("push_notice"), false);
});

test("a forced test goes out at any hour and leaves no marker", async (t) => {
  const { env, store } = await setup();
  const svc = pushService();
  t.after(svc.restore);
  const out = await runNudge(env, ms(WED, "03:00"), { force: true, kind: "test" });
  assert.equal(out.delivered, 1);
  assert.equal(out.notice.title, "Notifications are working");
  assert.equal([...store.keys()].some((k) => k.startsWith("push_sent:")), false);
});

// ---------- what the phone reads ----------

test("the phone gets the notice that was just sent", async () => {
  const today = todayIn(TZ);
  const { env } = await setup({
    push_notice: [{ kind: "weekly", title: "Last week: 3 nights, 6 games", body: "Average 120.", date: today, at: Date.now() - 5000 }],
  });
  const { notices } = await (await noticeGet({ env })).json();
  assert.equal(notices.length, 1);
  assert.equal(notices[0].title, "Last week: 3 nights, 6 games");
  assert.equal(notices[0].group, "weekly");
});

test("two sends a phone was offline for each keep their own words", async (t) => {
  // Monday: the recap at 9:15, then a heads up set for 9:30.
  const { env } = await setup({ notify_prefs: { at: "09:30" }, scores: { "2026-09-15": [120] } });
  const svc = pushService();
  t.after(svc.restore);
  const RealDate = Date;
  t.after(() => { globalThis.Date = RealDate; });
  const fake = (now) => class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [now])); }
    static now() { return now; }
  };
  assert.equal((await runNudge(env, ms(MON, "09:15"))).notice.kind, "weekly");
  assert.equal((await runNudge(env, ms(MON, "09:30"))).notice.kind, "headsup");
  globalThis.Date = fake(ms(MON, "09:45"));
  const { notices } = await (await noticeGet({ env })).json();
  assert.deepEqual(notices.map((n) => n.group).sort(), ["streak", "weekly"]);
  assert.match(notices.find((n) => n.group === "weekly").title, /Last week/);
});

test("a streak reminder for a day settled since says what is true now", async () => {
  const today = todayIn(TZ);
  const { env } = await setup({
    scores: { [today]: [140] },
    push_notice: [{ kind: "lastcall", title: "5 days on the line", body: "x", date: today, at: Date.now() - 5000 }],
  });
  const { notices } = await (await noticeGet({ env })).json();
  assert.match(notices[0].body, /Today's game is in/);
});

test("with no fresh notice the phone still gets something true to show", async () => {
  const today = todayIn(TZ);
  const { env } = await setup({
    scores: { [addDays(today, -1)]: [140] },
    push_notice: [{ kind: "weekly", title: "old", body: "old", date: addDays(today, -1), at: Date.now() - 86_400_000 }],
  });
  const { notices } = await (await noticeGet({ env })).json();
  assert.equal(notices.length, 1);
  assert.notEqual(notices[0].title, "old");
  assert.ok(notices[0].title && notices[0].body);
});

test("prefs round trip through the endpoint and bad ones are refused", async () => {
  const { env } = await setup();
  assert.deepEqual(await (await notifyGet({ env })).json(), DEFAULT_PREFS);
  const put = (o) => notifyPut({ env, request: new Request("https://bowling.test/api/notify", { method: "PUT", body: JSON.stringify(o) }) });
  const ok = await (await put({ weekly: false, at: "15:30" })).json();
  assert.equal(ok.weekly, false);
  assert.equal(ok.at, "15:30");
  assert.equal((await put({ at: "nope" })).status, 400);
  assert.equal((await (await notifyGet({ env })).json()).at, "15:30");
});

// ---------- the timer's door ----------

async function gate(env, path, { method = "POST", token = null } = {}) {
  let reached = false;
  const headers = token === null ? {} : { "X-Nudge-Token": token };
  const res = await onRequest({
    request: new Request(`https://bowling.test${path}`, { method, headers }),
    env,
    next: async () => { reached = true; return new Response("{}"); },
  });
  return { status: res.status, reached, cookie: res.headers.get("Set-Cookie") };
}

test("the timer token opens a plain POST to /api/nudge and nothing else", async () => {
  const { env } = await setup();
  const ok = await gate(env, "/api/nudge", { token: "timer-secret" });
  assert.equal(ok.status, 200);
  assert.ok(ok.reached);
  assert.equal(ok.cookie, null);

  for (const [path, opts] of [
    ["/api/nudge?send=1&kind=test", { token: "timer-secret" }],
    ["/api/nudge", { token: "timer-secret", method: "GET" }],
    ["/api/state", { token: "timer-secret", method: "GET" }],
    ["/api/notice", { token: "timer-secret", method: "GET" }],
    ["/api/nudge", { token: "wrong" }],
    ["/api/nudge", { token: "" }],
  ]) {
    const r = await gate(env, path, opts);
    assert.equal(r.reached, false, `${opts.method || "POST"} ${path} with ${JSON.stringify(opts.token)}`);
    assert.equal(r.status, 401);
  }
});

test("with no token configured the door stays shut", async () => {
  const { env } = await setup();
  delete env.NUDGE_TOKEN;
  assert.equal((await gate(env, "/api/nudge", { token: "" })).reached, false);
  assert.equal((await gate(env, "/api/nudge", { token: "undefined" })).reached, false);
});
