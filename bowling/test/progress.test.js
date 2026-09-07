import test from "node:test";
import assert from "node:assert/strict";
import {
  gameSeries, spread, rollingAverage, trend, gamesPerWeek, bySessionPosition,
  bestSession, verdict, progressReport, MIN_TREND_GAMES, SERIES_GAMES,
} from "../functions/_lib/progress.js";

/** Days of three games each, starting Fri 2026-09-04. */
function log(days) {
  const out = {};
  days.forEach((games, i) => {
    const d = new Date(Date.UTC(2026, 8, 4 + i)).toISOString().slice(0, 10);
    out[d] = games;
  });
  return out;
}

test("the log flattens into one chronological series with session seats", () => {
  const s = gameSeries(log([[76, 70, 98], [80, 76, 127]]));
  assert.equal(s.length, 6);
  assert.deepEqual(s[0], { date: "2026-09-04", score: 76, seat: 0, n: 1 });
  assert.deepEqual(s[3], { date: "2026-09-05", score: 80, seat: 0, n: 4 });
  assert.equal(s[5].seat, 2);
  // Games logged without a score are legacy records and carry no information.
  assert.equal(gameSeries({ "2026-09-04": [100, null, 120] }).length, 2);
});

test("dates are read in calendar order regardless of insertion order", () => {
  const s = gameSeries({ "2026-09-06": [120], "2026-09-04": [90], "2026-09-05": [100] });
  assert.deepEqual(s.map((g) => g.score), [90, 100, 120]);
});

test("spread needs two games and matches the sample deviation", () => {
  assert.equal(spread([100]), null);
  assert.equal(spread([]), null);
  assert.equal(spread([90, 110]), Math.sqrt(200));
  assert.equal(Math.round(spread([76, 70, 98, 80, 76, 127, 77, 79, 96, 159, 115])), 28);
});

test("the rolling average trails the last ten games", () => {
  const s = gameSeries(log([[10, 20, 30]]));
  // Before the window fills it averages what exists.
  assert.deepEqual(rollingAverage(s), [10, 15, 20]);
  const twelve = gameSeries(log([[0, 0, 0], [0, 0, 0], [0, 0, 0], [30, 30, 30]]));
  const roll = rollingAverage(twelve, 10);
  assert.equal(roll[11], 9);   // last ten are seven 0s and three 30s
});

test("a clean climb reads as a real trend, a flat log does not", () => {
  const up = gameSeries(log([[100, 101, 102], [103, 104, 105], [106, 107, 108], [109, 110, 111]]));
  const t = trend(up);
  assert.equal(Math.round(t.slope), 1);
  assert.equal(t.stderr, 0);          // a perfect line has no residual scatter
  assert.equal(t.low, t.high);

  const flat = gameSeries(log([[95, 95, 95], [95, 95, 95]]));
  assert.equal(trend(flat).slope, 0);

  assert.equal(trend(gameSeries(log([[100, 110]]))), null);   // too few games
});

test("the slope carries a confidence interval that straddles zero on noisy data", () => {
  const noisy = gameSeries(log([[70, 130, 70], [130, 70, 130], [70, 130, 70], [130, 70, 130]]));
  const t = trend(noisy);
  assert.ok(t.low < 0 && t.high > 0, "wild scatter must not produce a confident slope");
  assert.ok(t.stderr > 0);
});

test("games per week is measured from the log", () => {
  assert.equal(gamesPerWeek(gameSeries(log([[1, 2, 3], [1, 2, 3]]))), 21);   // 6 games over 2 days
  assert.equal(gamesPerWeek(gameSeries(log([[100]]))), null);
});

test("session position exposes the warm up gap", () => {
  const { rows, gap } = bySessionPosition(gameSeries(log([[70, 80, 100], [70, 80, 100]])));
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { seat: 0, game: 1, sessions: 2, average: 70 });
  assert.deepEqual(rows[2], { seat: 2, game: 3, sessions: 2, average: 100 });
  assert.equal(gap, 30);

  // A seat bowled only once is not yet evidence of anything.
  const thin = bySessionPosition(gameSeries(log([[70, 80, 100], [70, 80]])));
  assert.equal(thin.rows.length, 2);
  assert.equal(thin.gap, 10);
});

test("the best series is a fixed three game block, never a whole day", () => {
  assert.equal(SERIES_GAMES, 3);
  const best = bestSession(log([[100, 100, 100], [90, 90, 90], [120, 200]]));
  assert.deepEqual(best, { date: "2026-09-04", total: 300, games: 3, from: 1 });

  // A long night must not win on volume alone: six mediocre games total more
  // than three good ones, but the best three of them do not.
  const volume = bestSession(log([[130, 130, 130], [80, 80, 80, 80, 80, 80]]));
  assert.equal(volume.date, "2026-09-04");
  assert.equal(volume.total, 390);

  // The block slides, so a strong finish inside a long session still counts.
  const late = bestSession(log([[70, 70, 70, 150, 160, 170]]));
  assert.deepEqual(late, { date: "2026-09-04", total: 480, games: 3, from: 4 });

  // Sessions shorter than a series cannot post one.
  assert.equal(bestSession(log([[200, 200]])), null);
  assert.equal(bestSession({}), null);
});

test("a short log refuses to call a trend and says how many games are missing", () => {
  const v = verdict(gameSeries(log([[76, 70, 98], [80, 76, 127]])));
  assert.equal(v.state, "early");
  assert.equal(v.games, 6);
  assert.equal(v.needed, MIN_TREND_GAMES - 6);
  assert.match(v.text, /6 more games/);

  const one = verdict(gameSeries(log([Array(MIN_TREND_GAMES - 1).fill(95)])));
  assert.match(one.text, /1 more game before/);
});

test("a genuine climb is reported with a rate, noise is reported as no trend", () => {
  const up = verdict(gameSeries(log([[100, 101, 102], [103, 104, 105], [106, 107, 108], [109, 110, 111]])));
  assert.equal(up.state, "improving");
  assert.equal(up.slopePerGame, 1);
  assert.equal(up.slopePer10, 10);         // a pin a game is ten over the rolling window
  assert.equal(up.gamesPerWeek, 21);
  assert.match(up.text, /Improving, about 10 pins every 10 games/);

  const noisy = verdict(gameSeries(log([[70, 130, 70], [130, 70, 130], [70, 130, 70], [130, 70, 130]])));
  assert.equal(noisy.state, "flat");
  assert.ok(noisy.lowPer10 < 0 && noisy.highPer10 > 0);
  assert.match(noisy.text, /No trend yet/);

  const down = verdict(gameSeries(log([[111, 110, 109], [108, 107, 106], [105, 104, 103], [102, 101, 100]])));
  assert.equal(down.state, "declining");
  assert.match(down.text, /Sliding, about 10 pins every 10 games/);
});

test("the report separates recent form from the lifetime average", () => {
  // Ten games at 80 then three at 140: the lifetime average barely moves, the
  // rolling one moves a lot. That gap is the entire point of the panel.
  const r = progressReport(log([
    [80, 80, 80], [80, 80, 80], [80, 80, 80], [80], [140, 140, 140],
  ]));
  assert.equal(r.games, 13);
  assert.equal(r.average, 93);
  assert.equal(r.recentAverage, 98);
  // Measured against the true mean of 93.8, not the floored 93 on display.
  assert.equal(r.delta, 4);
  assert.equal(r.window, 10);
  assert.equal(r.series.length, 13);
  assert.deepEqual(r.series[0], { n: 1, date: "2026-09-04", game: 1, score: 80 });
  assert.equal(r.rolling.length, 13);
  assert.ok(r.spread > 0);
  assert.equal(r.best.date, "2026-09-08");
  assert.equal(r.best.total, 420);          // the three 140s, not the whole log
  assert.equal(r.verdict.state, "improving");
});

test("an empty log reports nothing rather than throwing", () => {
  const r = progressReport({});
  assert.equal(r.games, 0);
  assert.equal(r.average, null);
  assert.equal(r.recentAverage, null);
  assert.equal(r.delta, null);
  assert.equal(r.spread, null);
  assert.equal(r.best, null);
  assert.deepEqual(r.series, []);
  assert.deepEqual(r.session.rows, []);
  assert.equal(r.session.gap, null);
  assert.equal(r.verdict.state, "early");
  assert.equal(r.verdict.needed, MIN_TREND_GAMES);
});

test("Alex's real log as of Sept 7 has no readable trend yet", () => {
  const r = progressReport(log([[159, 115], [77, 79, 96], [80, 76, 127], [76, 70, 98]]));
  assert.equal(r.games, 11);
  assert.equal(r.average, 95);
  assert.equal(r.spread, 28);
  assert.equal(r.verdict.state, "early");
  assert.equal(r.verdict.needed, 1);
  // The warm up gap is the finding that IS supported at this sample size.
  assert.equal(r.session.rows[0].average, 98);
  assert.equal(r.session.rows[2].average, 107);
});
