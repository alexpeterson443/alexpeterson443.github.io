import test from "node:test";
import assert from "node:assert/strict";
import { progressReport, gameSeries } from "../functions/_lib/progress.js";
import {
  form, lastGame, averageTarget, trendEta, sessions, byWeekday,
  insights, milestones, sessionPrompt, coachReport, FORM_WINDOW,
} from "../functions/_lib/coach.js";

/** Days of games, starting Fri 2026-09-04. */
function log(days) {
  const out = {};
  days.forEach((games, i) => {
    const d = new Date(Date.UTC(2026, 8, 4 + i)).toISOString().slice(0, 10);
    out[d] = games;
  });
  return out;
}

const series = (days) => gameSeries(log(days));

test("form refuses to read a handful of games", () => {
  assert.equal(form(series([[100, 110, 120]])).state, "unknown");
  assert.equal(form(series([[100, 110, 120], [100, 110]])).state, "unknown");
  assert.equal(form([]).state, "unknown");
});

test("form is scaled by his own scatter, not by raw pins", () => {
  // Baseline of nine games at 90 with a 10 pin swing, then three at 140.
  const hot = form(series([[80, 90, 100], [80, 90, 100], [80, 90, 100], [140, 140, 140]]));
  assert.equal(hot.state, "hot");
  assert.equal(hot.gap, 50);
  assert.equal(hot.z, 10);            // 50 pins over a 5 pin standard error
  assert.match(hot.text, /Hot\. Last 3 games average 140, 50 above the 9 before them\./);

  const cold = form(series([[120, 130, 140], [120, 130, 140], [120, 130, 140], [80, 80, 80]]));
  assert.equal(cold.state, "cold");
  assert.equal(cold.gap, -50);
  assert.match(cold.text, /Cold patch/);

  // Same bowler having a normal night must not read as a trend.
  const steady = form(series([[80, 90, 100], [80, 90, 100], [80, 90, 100], [92, 90, 88]]));
  assert.equal(steady.state, "steady");
  assert.equal(steady.z, 0);
  assert.match(steady.text, /inside your normal spread/);
});

test("a flat baseline reports steady rather than dividing by zero", () => {
  const f = form(series([[90, 90, 90], [90, 90, 90], [90, 90, 90], [90, 90, 90]]));
  assert.equal(f.state, "steady");
  assert.equal(f.gap, 0);
});

test("the last game is ranked and its effect on the average is signed", () => {
  const g = lastGame(series([[100, 120]]));
  assert.equal(g.score, 120);
  assert.equal(g.game, 2);
  assert.equal(g.rank, 1);
  assert.equal(g.of, 2);
  assert.equal(g.isBest, true);
  assert.equal(g.moved, 10);
  assert.equal(g.aboveAverage, true);

  // A game under the average pulls it down, and the app has to say so.
  const bad = lastGame(series([[150, 150, 60]]));
  assert.equal(bad.rank, 3);
  assert.equal(bad.isBest, false);
  assert.equal(bad.average, 120);
  assert.equal(bad.moved, -30);
  assert.equal(bad.aboveAverage, false);

  // A first game has nothing to move.
  const first = lastGame(series([[100]]));
  assert.equal(first.moved, null);
  assert.equal(first.isBest, false);
  assert.equal(lastGame([]), null);
});

test("the average target is the exact score needed in the next game", () => {
  const t = averageTarget(series([[100, 100, 100]]));
  assert.deepEqual(t, { average: 100, target: 101, need: 104, reachable: true });
  // Check the arithmetic actually lands.
  assert.equal(Math.floor((300 + 104) / 4), 101);
});

test("an out of reach pin is reported as games at current form", () => {
  const t = averageTarget(series([Array(20).fill(290)]), 295);
  assert.equal(t.reachable, false);
  assert.equal(t.need, 311);          // more than a perfect game
  assert.equal(t.games, 5);
  assert.equal(Math.floor((5800 + 5 * 295) / 25), 291);
});

test("a perfect line needs no projection, a noisy one gets a sample size", () => {
  // No residual scatter means the slope is already certain.
  assert.equal(trendEta(series([[100, 101, 102], [103, 104, 105], [106, 107, 108], [109, 110, 111]])), null);

  const eta = trendEta(series([[90, 110, 95], [100, 115, 100], [95, 120, 105], [105, 125, 110]]));
  assert.ok(eta, "a mild slope in noisy data should still project");
  assert.equal(eta.direction, "up");
  assert.ok(eta.at > 12, "the projection must exceed the games already bowled");
  assert.equal(eta.games, eta.at - 12);

  assert.equal(trendEta(series([[100, 100, 100], [100, 100, 100]])), null);   // zero slope
  assert.equal(trendEta(series([[100, 110]])), null);                          // too few games
});

test("sessions group by date and keep their order", () => {
  const s = sessions(series([[76, 70, 98], [80], [77, 79]]));
  assert.equal(s.length, 3);
  assert.deepEqual(s[0], { date: "2026-09-04", scores: [76, 70, 98] });
  assert.deepEqual(s[1].scores, [80]);
  assert.equal(s[2].date, "2026-09-06");
  assert.deepEqual(sessions([]), []);
});

test("weekday averages need more than one session on that day", () => {
  // Fri 2026-09-04 and Fri 2026-09-11, plus a single Saturday.
  const scores = { "2026-09-04": [100, 110], "2026-09-05": [200], "2026-09-11": [130, 140] };
  const rows = byWeekday(gameSeries(scores));
  assert.equal(rows.length, 1, "one Saturday session is not evidence of anything");
  assert.deepEqual(rows[0], { day: 5, label: "Friday", sessions: 2, games: 4, average: 120 });
});

test("an empty log produces no observations rather than filler", () => {
  assert.deepEqual(insights({}, progressReport({})), []);
  assert.deepEqual(milestones({}, progressReport({})), []);
});

test("a thin log says it is thin and nothing more", () => {
  const scores = log([[100, 105], [95, 110]]);
  const found = insights(scores, progressReport(scores));
  assert.deepEqual(found.map((i) => i.id), ["eta"]);
  assert.match(found[0].text, /8 more games before a slope means anything/);
});

test("a warm up gap outranks everything else he can act on", () => {
  const scores = log([[70, 90, 110], [70, 90, 110], [70, 90, 110], [70, 90, 110]]);
  const found = insights(scores, progressReport(scores));
  const warmup = found.find((i) => i.id === "warmup");
  assert.ok(warmup);
  assert.equal(warmup.tone, "act");
  assert.match(warmup.text, /Game one of the night averages 70, your last game 110/);
  assert.match(warmup.text, /40 pins you are paying for a cold start/);
  // Nothing outweighs it, so it is what the app leads with.
  assert.equal(found[0].id, "warmup");
});

test("a rising floor is reported, and so is a falling one", () => {
  const up = log([[60, 65, 70], [62, 68, 72], [95, 98, 100], [96, 99, 102]]);
  const rising = insights(up, progressReport(up)).find((i) => i.id === "floor");
  assert.ok(rising);
  assert.equal(rising.tone, "good");
  assert.match(rising.text, /Bad games getting less bad/);

  const down = log([[95, 98, 100], [96, 99, 102], [60, 65, 70], [62, 68, 72]]);
  const falling = insights(down, progressReport(down)).find((i) => i.id === "floor");
  assert.ok(falling);
  assert.equal(falling.tone, "bad");
  assert.match(falling.text, /got worse, not better/);
});

test("shorter nights are called out hardest when there is a warm up gap", () => {
  const scores = log([[70, 90, 110, 115], [70, 90, 110, 115], [70, 90, 110, 115], [70], [70], [70]]);
  const found = insights(scores, progressReport(scores));
  const volume = found.find((i) => i.id === "volume");
  assert.ok(volume);
  assert.equal(volume.tone, "act");
  assert.match(volume.text, /your worst night by design/);
  assert.ok(volume.weight > found.find((i) => i.id === "warmup").weight,
    "with a cold start, logging only the cold game is the bigger problem");
});

test("a tightening spread is progress and a widening one is not", () => {
  const tight = log([[40, 100, 160], [50, 110, 170], [104, 105, 106], [103, 105, 107]]);
  const better = insights(tight, progressReport(tight)).find((i) => i.id === "consistency");
  assert.ok(better);
  assert.equal(better.tone, "good");
  assert.match(better.text, /Repeatable is worth more/);

  const loose = log([[104, 105, 106], [103, 105, 107], [40, 100, 160], [50, 110, 170]]);
  const worse = insights(loose, progressReport(loose)).find((i) => i.id === "consistency");
  assert.ok(worse);
  assert.equal(worse.tone, "bad");
  assert.match(worse.text, /Wilder, not better/);
});

test("a run of games on one side of the average is only called at three", () => {
  const two = log([[100, 100, 100, 100, 100, 100, 90, 120, 120]]);
  assert.equal(insights(two, progressReport(two)).find((i) => i.id === "run"), undefined);

  const three = log([[100, 100, 100, 100, 100, 100, 60, 60, 60]]);
  const run = insights(three, progressReport(three)).find((i) => i.id === "run");
  assert.ok(run);
  assert.equal(run.tone, "bad");
  assert.match(run.title, /straight below average/);
});

test("milestones are built from his own numbers", () => {
  const scores = log([[100, 100, 100]]);
  const m = milestones(scores, progressReport(scores));
  const byId = Object.fromEntries(m.map((x) => [x.id, x]));
  assert.match(byId.average.text, /Bowl 104 in your next game/);
  assert.equal(byId.best.label, "Beat 100");
  assert.equal(byId.round, undefined, "150 is not a target from a 100 best");

  const near = log([[100, 120, 140]]);
  const m2 = milestones(near, progressReport(near));
  assert.equal(m2.find((x) => x.id === "round").label, "First 150");
});

test("the session prompt changes with the hour, not just the data", () => {
  const scores = log([[70, 90, 110], [70, 90, 110]]);
  const report = progressReport(scores);

  const pre = sessionPrompt(report, { hours: { beforeOpen: true, opensAt: "10:00 AM" } });
  assert.equal(pre.phase, "pre");
  assert.match(pre.text, /Lanes open at 10:00 AM/);
  assert.match(pre.text, /first game of the night averages 70/i);

  const open = sessionPrompt(report, { hours: { open: true }, atRisk: true });
  assert.equal(open.phase, "open");
  assert.match(open.text, /Streak needs a game today/);

  const mid = sessionPrompt(report, { verifiedToday: true, scoresToday: [72], hours: { open: true } });
  assert.equal(mid.phase, "mid");
  assert.match(mid.text, /best game of the night is usually game 3 at 110/);

  const done = sessionPrompt(report, { verifiedToday: true, scoresToday: [70, 90, 110], hours: { open: false } });
  assert.equal(done.phase, "done");
  assert.match(done.text, /3 games tonight, averaging 90/);

  const late = sessionPrompt(report, { hours: { open: true, lastCallPassed: true, lastCallAt: "9:45 PM" } });
  assert.equal(late.phase, "late");
  assert.match(late.text, /still log a game you bowled earlier/);

  assert.equal(sessionPrompt(report, { hours: { closedToday: true } }).phase, "shut");

  // With no hours to reason about it must not claim the lanes are shut.
  const blind = sessionPrompt(report, {});
  assert.equal(blind.phase, "unknown");
  assert.doesNotMatch(blind.text, /closed|shut/i);
  assert.equal(sessionPrompt(report, { excusedToday: true }).phase, "excused");
});

test("the whole report holds together on an empty log", () => {
  const r = coachReport({}, progressReport({}), {});
  assert.equal(r.form.state, "unknown");
  assert.equal(r.last, null);
  assert.equal(r.focus, null);
  assert.deepEqual(r.insights, []);
  assert.deepEqual(r.milestones, []);
  assert.deepEqual(r.weekday, []);
  assert.ok(r.session.text);
});

test("the focus is something he can act on, and at most three insights show", () => {
  const scores = log([[60, 90, 110, 115], [62, 92, 112, 118], [95, 98, 100, 105], [96], [99], [102]]);
  const r = coachReport(scores, progressReport(scores), { hours: { open: true } });
  assert.ok(r.insights.length <= 3);
  assert.ok(r.focus);
  assert.ok(["act", "bad"].includes(r.focus.tone));
  assert.equal(r.form.window, FORM_WINDOW);
  // The focus is already on screen in its own block, so reading it a second
  // time in the list below would make it look like filler.
  assert.equal(r.insights.some((i) => i.id === r.focus.id), false);
});
