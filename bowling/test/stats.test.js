import test from "node:test";
import assert from "node:assert/strict";
import {
  MIN_BUCKET_SESSIONS, MIN_LEAVE_ATTEMPTS, MIN_PAIN_SESSIONS, median, quantile, spearman,
  sessionsOf, sessionWeighted, perGame, recent, compareGroups, byPosition, weekdayOf,
  frameStats, spareStats, painStats, gamesToDetect, detection, analyze,
} from "../functions/_lib/stats.js";

// A game as loadDetail returns it.
const g = (date, position, score, extra = {}) => ({ date, position, score, framesAvailable: false, frames: null, lane: null, loggedAt: null, ...extra });
/** Nights from a {date: [scores]} map. */
const games = (map) => Object.entries(map).flatMap(([d, list]) => list.map((s, i) => g(d, i + 1, s)));

// ---------- session weighting ----------

test("one long night does not outweigh a week of short ones", () => {
  // Five two game nights at 100, then one eight game night at 150.
  const log = games({
    "2026-09-01": [100, 100], "2026-09-02": [100, 100], "2026-09-03": [100, 100],
    "2026-09-04": [100, 100], "2026-09-05": [100, 100],
    "2026-09-06": [150, 150, 150, 150, 150, 150, 150, 150],
  });
  const per = perGame(log);
  const weighted = sessionWeighted(sessionsOf(log));
  // Per game, the long night is 8 of 18 games and drags the mean to 122.
  assert.equal(Math.round(per.value), 122);
  // Per night, it is one night of six: (5 x 100 + 150) / 6 = 108.3.
  assert.equal(Math.round(weighted.value * 10) / 10, 108.3);
  assert.equal(weighted.sessions, 6);
  assert.equal(weighted.games, 18);
  assert.equal(weighted.frames, false);
  assert.ok(weighted.sd > 0, "the spread comes with it");
});

// ---------- median, not mean ----------

test("recent form is a median, so one wild game barely moves it", () => {
  const steady = [100, 102, 98, 101, 99, 100, 103, 97, 100, 100];
  const withOutlier = [...steady.slice(0, 9), 159];
  const a = recent(steady.map((s, i) => g("2026-09-01", i + 1, s)));
  const b = recent(withOutlier.map((s, i) => g("2026-09-01", i + 1, s)));
  // The mean jumps by almost six pins; the median does not move.
  assert.ok(b.mean - a.mean > 5.5);
  assert.equal(a.median, 100);
  assert.equal(b.median, 100);
  assert.equal(b.n, 10);
  assert.ok(b.q3 >= b.q1, "an IQR comes with it");
});

test("quantiles interpolate like a spreadsheet", () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(quantile([1, 2, 3, 4, 5], 0.25), 2);
  assert.equal(median([]), null);
});

// ---------- the threshold ----------

test("a group below the threshold produces no comparison at all", () => {
  // Wednesday four times, Saturday twice: neither may be compared.
  const log = games({
    "2026-09-02": [100], "2026-09-09": [101], "2026-09-16": [99], "2026-09-23": [100],
    "2026-09-05": [130], "2026-09-12": [131],
  });
  const res = compareGroups(sessionsOf(log), (x) => weekdayOf(x.date));
  assert.deepEqual(res.rows, []);
  assert.equal(res.min, MIN_BUCKET_SESSIONS);
});

test("one qualifying group alone is not a comparison either", () => {
  const dates = ["2026-09-02", "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30"];
  const log = [...dates.map((d) => g(d, 1, 100)), g("2026-09-05", 1, 130)];
  assert.deepEqual(compareGroups(sessionsOf(log), (x) => weekdayOf(x.date)).rows, []);
});

test("with enough sessions on both sides the comparison appears, counted in sessions", () => {
  const wed = ["2026-09-02", "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30"];
  const sat = ["2026-09-05", "2026-09-12", "2026-09-19", "2026-09-26", "2026-10-03"];
  // Two games a Wednesday: still five sessions, not ten.
  const log = [...wed.flatMap((d) => [g(d, 1, 100), g(d, 2, 104)]), ...sat.map((d) => g(d, 1, 130))];
  const rows = compareGroups(sessionsOf(log), (x) => weekdayOf(x.date)).rows;
  // Without an explicit order the groups come back alphabetically.
  assert.deepEqual(rows.map((r) => [r.key, r.sessions, r.median]), [["Saturday", 5, 130], ["Wednesday", 5, 102]]);
});

test("game of the night: thin positions vanish, and the fade is paired within nights", () => {
  // Six nights of three games, fading 10 then 20 pins; one night reaches game 4.
  const nights = {};
  for (let d = 1; d <= 6; d++) nights[`2026-09-0${d}`] = [110, 100, 90];
  nights["2026-09-07"] = [110, 100, 90, 80];
  const res = byPosition(sessionsOf(games(nights)));
  assert.deepEqual(res.rows.map((r) => r.key), ["Game 1", "Game 2", "Game 3"], "Game 4+ has one night and is not shown");
  assert.deepEqual(res.drops.map((d) => [d.key, d.median, d.sessions]), [["Game 2", -10, 7], ["Game 3", -20, 7]]);
});

// ---------- frames ----------

const fr = (b1, b2 = null, b3 = null, leave = null) => ({ b1, b2, b3, leave });
const framed = (date, position, frames, score) => g(date, position, score, { framesAvailable: true, frames });
// Nine frames of 9 then a spare of the 10 pin, a strike, and a 10th of 9/ 5.
const sample = () => [fr(9, 1, null, "10"), fr(10), fr(9, 0, null, "10"), fr(7, 2, null, "3-10"), fr(8, 2, null, "2-4"),
  fr(9, 1, null, "10"), fr(9, 0, null, "7"), fr(10), fr(6, 3), fr(9, 1, 5)];

test("frame stats come from frame backed games only, never pooled with totals", () => {
  const log = [g("2026-09-01", 1, 200), framed("2026-09-02", 1, sample(), 120)];
  const f = frameStats(log);
  assert.equal(f.games, 1);
  assert.equal(f.frames, 10);
  assert.equal(f.strikes, 2);
  assert.equal(f.attempts, 8);
  assert.equal(f.spares, 4);
  assert.equal(f.opens, 4);
  assert.equal(f.firstBall.n, 10);
  assert.equal(f.firstBall.mean, (9 + 10 + 9 + 7 + 8 + 9 + 9 + 10 + 6 + 9) / 10);
  assert.equal(f.scores.median, 120, "the 200 totals only game is not in here");
  assert.equal(frameStats([g("2026-09-01", 1, 200)]), null);
});

test("spare conversion by leave appears only once a category has enough attempts", () => {
  const one = spareStats([framed("2026-09-02", 1, sample(), 120)]);
  assert.deepEqual([one.overall.made, one.overall.attempts], [4, 8]);
  // Five single pin attempts (10, 10, 10, 7 ... ) is the bar; one game is not enough for most.
  assert.ok(one.byLeave.every((r) => r.attempts >= MIN_LEAVE_ATTEMPTS));
  const many = spareStats([1, 2, 3].map((n) => framed(`2026-09-0${n}`, 1, sample(), 120)));
  const ten = many.byLeave.find((r) => r.key === "10");
  assert.deepEqual([ten.made, ten.attempts], [6, 9]);
  assert.ok(many.byKind.some((r) => r.key === "Single pin"));
});

// ---------- pain ----------

test("pain is only correlated with enough nights, and grouped only with enough on both sides", () => {
  const nights = (n, pain, scores) => Array.from({ length: n }, (_, i) => ({ date: `x${pain}-${i}`, pain, scores, games: [] }));
  const few = painStats([...nights(3, 0, [100, 100, 100]), ...nights(3, 3, [100, 90, 80])]);
  assert.deepEqual(few.correlations, []);
  assert.deepEqual(few.groups, []);

  const enough = painStats([...nights(MIN_PAIN_SESSIONS / 2, 0, [100, 100, 100, 100]), ...nights(MIN_PAIN_SESSIONS / 2, 3, [100, 90, 80])]);
  const games = enough.correlations.find((c) => c.key === "games played");
  assert.ok(games.rho < 0, "more pain, fewer games");
  const fade = enough.groups.find((x) => x.key.startsWith("fade"));
  assert.equal(fade.low.median, 0);
  assert.equal(fade.high.median, -20);
});

// ---------- detecting a trend ----------

test("the games needed to detect a change follow the stated power calculation", () => {
  // sd 18, 10 pins: per half 2 * 2.8016^2 * 324 / 100 = 50.9 -> 51, so 102 games.
  assert.equal(gamesToDetect(18, 10), 102);
  // Halving the spread quarters it.
  assert.equal(gamesToDetect(9, 10), 26);
  assert.equal(gamesToDetect(null, 10), null);
});

test("frame data offers its own estimate only with enough frame backed games", () => {
  const log = [100, 120, 90, 130, 110].map((s, i) => g("2026-09-01", i + 1, s));
  assert.equal(detection(log, null).frames, null);
  assert.match(detection(log, null).assumption, /95% confidence with 80% power/);
  const f = { games: 5, marks: { sd: 1.5 } };
  assert.equal(detection(log, f).frames.games, gamesToDetect(1.5, 1));
});

test("the whole analysis runs on an empty log and on totals only", () => {
  const empty = analyze({ games: [], pain: {} });
  assert.equal(empty.games, 0);
  assert.equal(empty.frameStats, null);
  const totals = analyze({ games: games({ "2026-09-01": [100, 110] }), pain: {} });
  assert.equal(totals.frameGames, 0);
  assert.equal(totals.spares, null);
  assert.deepEqual(totals.weekday.rows, []);
});

test("spearman handles ties", () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.equal(Math.round(spearman([0, 0, 3, 3], [4, 4, 2, 2]) * 100) / 100, -1);
});
