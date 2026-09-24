import test from "node:test";
import assert from "node:assert/strict";
import { d1, kv } from "./helpers/d1.js";
import { onRequestGet as claudeGet } from "../functions/api/claude.js";
import { syncDate, setPain, checkFrames } from "../functions/_lib/games.js";
import { summaryText as legacySummary } from "./fixtures/summary-v1.js";
import { summaryText, MAX_CHARS, GAMES_DAYS } from "../functions/_lib/summary.js";
import { loadDays, loadScores, buildState, configFor } from "../functions/_lib/store.js";
import { todayIn, addDays } from "../functions/_lib/streak.js";
import { MIN_BUCKET_SESSIONS } from "../functions/_lib/stats.js";

const TODAY = todayIn("America/Chicago");
const NOW = new Date("2026-09-23T23:00:00Z");

function env(seed = {}) {
  return { START_DATE: "2026-08-28", TIMEZONE: "America/Chicago", STREAK_KV: kv(seed), LIVE_DB: d1() };
}
async function stateOf(e) {
  const cfg = await configFor(e);
  return buildState(cfg, await loadDays(cfg), await loadScores(cfg));
}
const section = (text, title) => {
  const lines = text.split("\n");
  const at = lines.indexOf(`## ${title}`);
  if (at === -1) return null;
  const end = lines.findIndex((l, i) => i > at && l === "");
  return lines.slice(at, end).join("\n");
};
const streakBlock = (text) => text.slice(0, text.indexOf("\n## Scores"));

// ---------- the streak does not move ----------

test("the header and Streak section match the frozen version byte for byte", async () => {
  const scores = { games: { "2026-09-01": [100, 110], [TODAY]: [120] }, ids: [] };
  const variants = [
    { scores },
    { scores, excused: { "2026-09-05": "sick", "2026-09-06": "lanes", [addDays(TODAY, 3)]: "away", [addDays(TODAY, 4)]: "away" } },
    {},
    { scores: { games: { "2026-09-01": [100] }, ids: [] }, excused: { [TODAY]: "injured" } },
  ];
  for (const seed of variants) {
    const state = await stateOf(env(seed));
    const now = summaryText(state, NOW);
    const then = legacySummary(state, NOW);
    assert.equal(streakBlock(now), streakBlock(then));
    assert.match(streakBlock(now), /## Streak/);
  }
});

// ---------- every stat carries n and its source ----------

test("every stat line carries its sample size and whether it is frames or totals", async () => {
  const e = env();
  // Twelve nights, three games each, some by frame, pain on all of them.
  const nine = checkFrames([...Array(9).fill({ b1: 9, b2: 0, leave: "10" }), { b1: 9, b2: 0 }]).frames;
  const games = {};
  for (let i = 0; i < 12; i++) {
    const d = addDays("2026-09-01", i);
    games[d] = [90, 100, 90];
    await syncDate(e.LIVE_DB, d, [90]);
    await syncDate(e.LIVE_DB, d, [90, 100]);
    await syncDate(e.LIVE_DB, d, [90, 100, 90], { id: `f${i}`, frames: nine });
    await setPain(e.LIVE_DB, d, i % 4);
  }
  await e.STREAK_KV.put("scores", JSON.stringify({ games, ids: [] }));
  const text = await (await claudeGet({ env: e })).text();

  const statSections = ["Scores", "Frame stats", "Spare conversion", "Score by game position", "Pain correlation"];
  // Status lines (nothing to report yet) and the stated assumption are not stats.
  const notStats = /^- (No |Assumes |Nights with pain recorded|Correlations start|Games logged)/;
  let checked = 0;
  for (const title of statSections) {
    const body = section(text, title);
    assert.ok(body, `${title} section is present`);
    for (const line of body.split("\n").filter((l) => l.startsWith("- "))) {
      if (notStats.test(line)) continue;
      assert.match(line, /n=\d+/, `no sample size: ${line}`);
      assert.match(line, /\[(totals|frames)\]$/, `no source tag: ${line}`);
      checked++;
    }
  }
  assert.ok(checked >= 15, `only ${checked} stat lines checked`);
  // The frame numbers come from the frame games alone: all 90s, never the 100s.
  assert.match(section(text, "Frame stats"), /Score in these games: median 90, IQR 90–90 \(n=12 games\) \[frames\]/);
  // Ten 9-0 frames a game, twelve games: 120 attempts, none made.
  assert.match(section(text, "Spare conversion"), /Overall: 0% converted \(0 made; n=120 attempts in 12 games\) \[frames\]/);
  assert.match(section(text, "Pain correlation"), /Nights with pain recorded: 12/);
});

// ---------- thin groups print nothing ----------

test("a group below the session threshold produces no line at all", async () => {
  // Two Wednesdays and two Saturdays, and four nights in all: under the old
  // output this printed a Wednesday vs Saturday line.
  const games = {
    "2026-09-02": [100, 95], "2026-09-09": [98, 97],
    "2026-09-05": [130, 128], "2026-09-12": [131, 129],
  };
  const e = env({ scores: { games, ids: [] } });
  const text = await (await claudeGet({ env: e })).text();
  assert.doesNotMatch(text, /Wednesday|Saturday/);
  assert.equal(section(text, "Comparisons"), null);
  // Four nights is under MIN_BUCKET_SESSIONS, so no game position either.
  assert.ok(MIN_BUCKET_SESSIONS > 4);
  assert.doesNotMatch(section(text, "Score by game position"), /Game 1:|Game 2:/);
});

test("once every group clears the threshold, the comparison lines appear", async () => {
  const games = {};
  for (let w = 0; w < MIN_BUCKET_SESSIONS; w++) {
    games[addDays("2026-09-02", 7 * w)] = [100];   // Wednesdays
    games[addDays("2026-09-05", 7 * w)] = [130];   // Saturdays
  }
  const text = await (await claudeGet({ env: env({ scores: { games, ids: [] } }) })).text();
  assert.match(section(text, "Comparisons"), /Weekday Wednesday: median 100.*\(n=5 sessions\) \[totals\]/);
  assert.match(section(text, "Comparisons"), /Weekday Saturday: median 130.*\(n=5 sessions\) \[totals\]/);
});

// ---------- size ----------

test("a long, busy log stays under the size limit and trims the games list first", async () => {
  const e = env();
  const games = {};
  const excused = {};
  for (let i = 0; i < 60; i++) {
    const d = addDays("2026-07-01", i);
    games[d] = [95 + (i % 20), 120 + (i % 7), 88 + (i % 13), 101, 140 - (i % 9), 99];
    if (i % 9 === 0) excused[addDays("2026-08-30", i % 20)] = "sick";
  }
  await e.STREAK_KV.put("scores", JSON.stringify({ games, ids: [] }));
  await e.STREAK_KV.put("excused", JSON.stringify(excused));
  const text = await (await claudeGet({ env: e })).text();
  assert.ok(text.length <= MAX_CHARS, `${text.length} characters`);
  const listed = (section(text, text.match(/## (Games by day[^\n]*)/)[1]) || "").split("\n").filter((l) => l.startsWith("- "));
  assert.ok(listed.length <= GAMES_DAYS && listed.length >= 3);
  assert.match(text, /## Streak/);
});

test("a state with no analysis still reads, as totals", () => {
  const text = summaryText({ today: TODAY, start: "2026-08-28", scores: { games: 2, average: 105, high: 110, days: [] } }, NOW);
  assert.match(text, /Average per game: 105 \(n=2 games\) \[totals\]/);
});
