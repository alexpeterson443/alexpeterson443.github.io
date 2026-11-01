import test from "node:test";
import assert from "node:assert/strict";
import { cleanClosures, closureExcuses, closureOn } from "../functions/_lib/closures.js";
import { hoursStatus, parseHours, hoursRecord } from "../functions/_lib/hours.js";
import { runNudge } from "../functions/_lib/nudge-run.js";
import { configFor, loadDays, loadScores, buildState } from "../functions/_lib/store.js";
import { onRequestGet as claudeGet } from "../functions/api/claude.js";
import { onRequestGet as stateGet } from "../functions/api/state.js";
import { onRequestPost as closuresPost, onRequestGet as closuresGet } from "../functions/api/closures.js";
import { onRequestPut as settingsPut } from "../functions/api/settings.js";
import { onRequest } from "../functions/_middleware.js";
import { todayIn, addDays } from "../functions/_lib/streak.js";

const TZ = "America/Chicago";
const ms = (date, hhmm) => new Date(`${date}T${hhmm}:00-05:00`).getTime();
const WED = "2026-09-16";
const THU = "2026-09-17";
const MON = "2026-09-21";
const TODAY = todayIn(TZ);

/** The `live` table: key -> value text, covering the statements live.js uses. */
function liveDb(seed = {}) {
  const rows = new Map(Object.entries(seed).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
  return {
    rows,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind: (...a) => { args = a; return stmt; },
        async run() {
          if (sql.startsWith("DELETE")) rows.delete(args[0]);
          else if (sql.includes("OR IGNORE")) { if (!rows.has(args[0])) rows.set(args[0], args[1]); }
          else rows.set(args[0], args[1]);
          return { success: true };
        },
        async first() {
          if (!/FROM live/.test(sql)) throw new Error("no such table");
          return rows.has(args[0]) ? { value: rows.get(args[0]) } : null;
        },
        async all() { throw new Error("no such table"); },
      };
      return stmt;
    },
    async batch() { throw new Error("no such table"); },
  };
}

function kv(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
  return {
    store,
    get: async (k, opts) => {
      if (!store.has(k)) return null;
      const type = typeof opts === "string" ? opts : opts && opts.type;
      return type === "json" ? JSON.parse(store.get(k)) : store.get(k);
    },
    put: async (k, v) => { store.set(k, v); },
    delete: async (k) => { store.delete(k); },
  };
}

async function setup({ kvSeed = {}, live = {} } = {}) {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  const STREAK_KV = kv({ checkins: [], push_subs: [{ endpoint: "https://web.push.apple.com/abc" }], ...kvSeed });
  const LIVE_DB = liveDb(live);
  return {
    STREAK_KV, LIVE_DB,
    env: {
      START_DATE: "2026-08-28",
      TIMEZONE: TZ,
      ACCESS_KEY: "full-secret-key",
      NUDGE_TOKEN: "timer-secret",
      CLOSURES_TOKEN: "closures-secret",
      VAPID_PRIVATE_JWK: JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey)),
      STREAK_KV,
      LIVE_DB,
    },
  };
}

function pushService() {
  const sent = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, topic: init.headers.Topic }); return new Response(null, { status: 201 }); };
  return { sent, restore: () => { globalThis.fetch = real; } };
}

// ---------- the record ----------

test("closures load as a sorted {date: reason} map and drop anything unusable", () => {
  assert.deepEqual(
    cleanClosures({ "2026-10-31": " closed ", "2026-10-30": "holiday", "nope": "x", "2026-02-30": "y", "2026-11-01": "", "2026-11-02": 5 }),
    { "2026-10-30": "holiday", "2026-10-31": "closed" },
  );
  assert.deepEqual(cleanClosures(["2026-10-30"]), { "2026-10-30": "closed" });
  assert.deepEqual(cleanClosures(null), {});
  assert.equal(closureOn({ [WED]: "holiday" }, WED), "holiday");
  assert.equal(closureOn({ [WED]: "holiday" }, THU), null);
});

test("a closed date that rolled past unbowled becomes a lanes pause, and nothing else does", () => {
  const closures = { "2026-09-10": "holiday", "2026-09-11": "event", "2026-09-12": "repair", [WED]: "today", [THU]: "ahead", "2026-08-01": "before start" };
  const excused = { "2026-09-12": "sick" };
  const { excused: out, added } = closureExcuses(closures, excused, new Set(["2026-09-11"]), WED, "2026-08-28");
  assert.deepEqual(added, ["2026-09-10"]);
  assert.equal(out["2026-09-10"], "lanes");
  assert.equal(out["2026-09-11"], undefined, "a day he bowled stays bowled");
  assert.equal(out["2026-09-12"], "sick", "an existing pause keeps its reason");
  assert.equal(out[WED], undefined, "today is not over");
  assert.equal(out[THU], undefined);
  assert.equal(out["2026-08-01"], undefined);
  assert.deepEqual(excused, { "2026-09-12": "sick" }, "the input is not mutated");
});

// ---------- hours ----------

test("a closure today reads as shut, with its reason, and the next opening skips closed days", () => {
  const h = hoursStatus(parseHours(null), TZ, WED, new Date(ms(WED, "12:00")), 15, { [WED]: "holiday", [THU]: "holiday" });
  assert.equal(h.closedToday, true);
  assert.equal(h.closure, "holiday");
  assert.equal(h.todayLabel, "Closed");
  assert.equal(h.lastCallMs, null);
  assert.equal(h.open, false);
  assert.equal(h.next.date, "2026-09-18");
  assert.equal(h.next.tomorrow, false);

  const open = hoursStatus(parseHours(null), TZ, WED, new Date(ms(WED, "12:00")), 15, { [THU]: "holiday" });
  assert.equal(open.closure, null);
  assert.equal(open.open, true);
});

test("a last call written into the hours is used as given", () => {
  const table = parseHours({ wed: ["10:00", "22:00", "21:00"] });
  assert.deepEqual(table[3], [600, 1320, 1260]);
  const h = hoursStatus(table, TZ, WED, new Date(ms(WED, "12:00")), 15);
  assert.equal(h.lastCallAt, "9:00 PM");
  assert.equal(h.lastCallMs, ms(WED, "21:00"));
  assert.equal(h.lastCallMinutes, 60);
  // One outside opening hours is not trusted.
  assert.deepEqual(parseHours({ wed: ["10:00", "22:00", "23:00"] })[3], [600, 1320]);
});

test("the stored hours record spells out every day's last call", () => {
  const rec = hoursRecord({ LAST_CALL_MINUTES: "15" });
  assert.deepEqual(rec.mon, ["10:00", "22:00", "21:45"]);
  assert.deepEqual(rec.sun, ["12:00", "20:00", "19:45"]);
  const closedSun = hoursRecord({ HOURS: JSON.stringify({ sun: null }), LAST_CALL_MINUTES: "30" });
  assert.equal(closedSun.sun, null);
  assert.deepEqual(closedSun.sat, ["12:00", "22:00", "21:30"]);
  // Read back, it gives the same deadlines it was written from.
  const h = hoursStatus(parseHours(rec), TZ, WED, new Date(ms(WED, "12:00")), 999);
  assert.equal(h.lastCallAt, "9:45 PM");
});

test("the live hours record is seeded once and last call is read from it", async () => {
  const { env, LIVE_DB } = await setup();
  await configFor(env);
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("hours")).wed, ["10:00", "22:00", "21:45"]);

  const rec = JSON.parse(LIVE_DB.rows.get("hours"));
  rec[["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(`${TODAY}T12:00:00Z`).getUTCDay()]] = ["09:00", "23:00", "21:00"];
  LIVE_DB.rows.set("hours", JSON.stringify(rec));
  const cfg = await configFor(env);
  const state = await buildState(cfg, await loadDays(cfg), await loadScores(cfg));
  assert.equal(state.hours.lastCallAt, "9:00 PM");
  assert.equal(state.hours.todayLabel, "9:00 AM – 11:00 PM");
});

test("changing hours or last call on the settings screen rewrites the live hours record", async () => {
  const { env, LIVE_DB } = await setup();
  await configFor(env);
  const put = (body) => settingsPut({ request: new Request("https://bowling.test/api/settings", { method: "PUT", body: JSON.stringify(body) }), env });
  assert.equal((await put({ lastCallMinutes: 30 })).status, 200);
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("hours")).wed, ["10:00", "22:00", "21:30"]);
  assert.equal((await put({ hours: { wed: ["11:00", "21:00"] } })).status, 200);
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("hours")).wed, ["11:00", "21:00", "20:30"]);
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("hours")).thu, ["10:00", "22:00", "21:30"]);
});

// ---------- notifications ----------

test("on a closed date no notification of any kind goes out", async (t) => {
  const { env } = await setup({ live: { closures: { [WED]: "holiday", [MON]: "holiday" } } });
  const svc = pushService();
  t.after(svc.restore);

  for (const hhmm of ["16:15", "20:00"]) {
    const out = await runNudge(env, ms(WED, hhmm));
    assert.equal(out.send, false);
    assert.equal(out.closure, "holiday");
    assert.match(out.why, /closed today/);
  }
  for (const kind of ["test", "headsup", "lastcall", "weekly"]) {
    const out = await runNudge(env, ms(WED, "20:00"), { force: true, kind });
    assert.equal(out.send, false, kind);
  }
  // The Monday recap too, which otherwise ignores the alley entirely.
  assert.equal((await runNudge(env, ms(MON, "10:00"))).send, false);
  assert.equal(svc.sent.length, 0);

  // The next day is an ordinary day again.
  const thu = await runNudge(env, ms(THU, "20:00"));
  assert.equal(thu.send, true);
  assert.equal(thu.notice.kind, "lastcall");
});

test("the timer writes a passed, unbowled closure into excused as lanes", async () => {
  const { env, STREAK_KV, LIVE_DB } = await setup({
    kvSeed: { scores: { "2026-09-14": [120] }, excused: { "2026-09-13": "away" } },
    live: { closures: { "2026-09-13": "holiday", "2026-09-14": "event", "2026-09-15": "repair", [WED]: "holiday" } },
  });
  // A dry run reasons about it but writes nothing.
  const dry = await runNudge(env, ms(WED, "12:00"), { dryRun: true });
  assert.deepEqual(dry.settled, []);
  assert.equal(JSON.parse(STREAK_KV.store.get("excused"))["2026-09-15"], undefined);

  const out = await runNudge(env, ms(WED, "12:00"));
  assert.deepEqual(out.settled, ["2026-09-15"]);
  const excused = JSON.parse(LIVE_DB.rows.get("excused"));
  assert.equal(excused["2026-09-15"], "lanes");
  assert.equal(excused["2026-09-13"], "away");
  assert.equal(excused["2026-09-14"], undefined);
  assert.equal(excused[WED], undefined, "today is still open");

  // Idempotent.
  assert.deepEqual((await runNudge(env, ms(WED, "12:15"))).settled, []);
});

// ---------- the app and Claude's link ----------

test("a passed closure is not a missed day, even before anything is written", async () => {
  const past = addDays(TODAY, -1);
  const { env, STREAK_KV } = await setup({
    kvSeed: { scores: { [addDays(TODAY, -2)]: [120] } },
    live: { closures: { [past]: "holiday" } },
  });
  const cfg = await configFor(env);
  const state = await buildState(cfg, await loadDays(cfg), await loadScores(cfg));
  assert.ok(!state.missed.includes(past));
  assert.equal(STREAK_KV.store.get("excused"), undefined, "buildState itself writes nothing");

  const res = await stateGet({ request: new Request("https://bowling.test/api/state"), env });
  assert.equal(res.status, 200);
  assert.equal(JSON.parse(STREAK_KV.store.get("excused"))[past], "lanes");
});

test("Claude's link says the alley is closed today instead of hours and a window", async () => {
  const { env } = await setup({ live: { closures: { [TODAY]: "Homecoming event" } } });
  const text = await (await claudeGet({ env })).text();
  const lines = text.split("\n");
  const at = lines.indexOf("## Alley today");
  assert.ok(at > -1);
  const section = lines.slice(at, lines.indexOf("", at)).join("\n");
  assert.match(section, /Closed today: Homecoming event/);
  assert.doesNotMatch(section, /Hours:|window|Open now|Opens at|last game/i);
});

test("Claude's link prints hours as before on an ordinary day", async () => {
  const { env } = await setup({ live: { closures: { [addDays(TODAY, 1)]: "holiday" } } });
  const text = await (await claudeGet({ env })).text();
  assert.match(text, /## Alley today\n- Hours: /);
});

// ---------- POST /api/closures ----------

const post = (env, body) => closuresPost({ request: new Request("https://bowling.test/api/closures", { method: "POST", body: JSON.stringify(body) }), env });

test("POST /api/closures sets, lifts and validates a closure", async () => {
  const { env, LIVE_DB, STREAK_KV } = await setup();
  const ahead = addDays(TODAY, 3);
  const res = await post(env, { date: ahead, reason: "Thanksgiving" });
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).closures, { [ahead]: "Thanksgiving" });
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("closures")), { [ahead]: "Thanksgiving" });
  assert.deepEqual(JSON.parse(STREAK_KV.store.get("closures")), { [ahead]: "Thanksgiving" });
  assert.deepEqual((await (await closuresGet({ env })).json()).closures, { [ahead]: "Thanksgiving" });

  assert.equal((await post(env, { date: ahead, reason: null })).status, 200);
  assert.deepEqual(JSON.parse(LIVE_DB.rows.get("closures")), {});

  for (const bad of [
    { date: "2026-13-01", reason: "x" },
    { date: ahead },
    { date: ahead, reason: "  " },
    { date: "2026-01-01", reason: "before the start" },
    { date: addDays(TODAY, 400), reason: "too far" },
  ]) {
    assert.equal((await post(env, bad)).status, 400, JSON.stringify(bad));
  }
});

test("a closure set for a day already gone is settled at once", async () => {
  const past = addDays(TODAY, -1);
  const { env, LIVE_DB } = await setup();
  const out = await (await post(env, { date: past, reason: "power cut" })).json();
  assert.deepEqual(out.settled, [past]);
  assert.equal(JSON.parse(LIVE_DB.rows.get("excused"))[past], "lanes");
});

async function gate(env, path, { method = "POST", token = null } = {}) {
  let reached = false;
  const headers = token === null ? {} : { "X-Closures-Token": token };
  const res = await onRequest({
    request: new Request(`https://bowling.test${path}`, { method, headers }),
    env,
    next: async () => { reached = true; return new Response("{}"); },
  });
  return { status: res.status, reached, cookie: res.headers.get("Set-Cookie") };
}

test("the closures token opens a plain POST to /api/closures and nothing else", async () => {
  const { env } = await setup();
  const ok = await gate(env, "/api/closures", { token: "closures-secret" });
  assert.equal(ok.status, 200);
  assert.ok(ok.reached);
  assert.equal(ok.cookie, null);

  for (const [path, opts] of [
    ["/api/closures?x=1", { token: "closures-secret" }],
    ["/api/closures", { token: "closures-secret", method: "GET" }],
    ["/api/nudge", { token: "closures-secret" }],
    ["/api/state", { token: "closures-secret", method: "GET" }],
    ["/api/closures", { token: "timer-secret" }],
    ["/api/closures", { token: "wrong" }],
    ["/api/closures", { token: "" }],
  ]) {
    const r = await gate(env, path, opts);
    assert.equal(r.reached, false, `${opts.method || "POST"} ${path} with ${JSON.stringify(opts.token)}`);
    assert.equal(r.status, 401);
  }

  delete env.CLOSURES_TOKEN;
  assert.equal((await gate(env, "/api/closures", { token: "" })).reached, false);
  assert.equal((await gate(env, "/api/closures", { token: "undefined" })).reached, false);
});
