import test from "node:test";
import assert from "node:assert/strict";
import {
  FIRST_BALL, COARSE_FIRST, MIN_GAMES, STRIKE_RATES,
  frameOutcomes, tenthOutcomes, applyFrame, scoreGame, scoreDistribution,
  meanFamily, likelyGame, reconstruct, pinsPerMark, frameReport,
} from "../functions/_lib/frames.js";

const strike = { balls: [10], kind: "strike" };
const spare = (k) => ({ balls: [k, 10 - k], kind: "spare" });
const open = (k, j) => ({ balls: [k, j], kind: "open" });
const repeat = (n, f) => Array.from({ length: n }, () => f);

/** Alex's log as of Sept 11. */
const HIS_SCORES = {
  "2026-09-04": [159, 115],
  "2026-09-05": [77, 79, 96],
  "2026-09-06": [80, 76, 127],
  "2026-09-07": [76, 70, 98, 93, 118, 123],
  "2026-09-08": [97, 152, 108, 107, 114, 92, 130, 83],
  "2026-09-10": [81],
  "2026-09-11": [119, 79, 106],
};

test("the scoring recurrence reproduces games anyone can check", () => {
  assert.equal(scoreGame([...repeat(9, strike), { balls: [10, 10, 10], kind: "strike" }]), 300);
  assert.equal(scoreGame([...repeat(9, spare(5)), { balls: [5, 5, 5], kind: "spare" }]), 150);
  assert.equal(scoreGame(repeat(10, open(9, 0))), 90);
  assert.equal(scoreGame(repeat(10, open(0, 0))), 0);

  // Strike, then 7/, then 8-, then nothing: 20 + 18 + 9.
  assert.equal(scoreGame([strike, spare(7), open(8, 1), ...repeat(7, open(0, 0))]), 47);

  // A turkey then nothing: 30 + 20 + 10.
  assert.equal(scoreGame([strike, strike, strike, ...repeat(7, open(0, 0))]), 60);
});

test("bonus debts are tracked, not double counted", () => {
  // Two strikes running leaves the next ball owed to both frames.
  let st = applyFrame(0, 0, [10], "strike");
  assert.deepEqual(st, { add: 10, b1: 1, b2: 1 });
  st = applyFrame(st.b1, st.b2, [10], "strike");
  assert.deepEqual(st, { add: 20, b1: 2, b2: 1 });
  st = applyFrame(st.b1, st.b2, [4, 3], "open");
  // The 4 pays three frames, the 3 pays two.
  assert.equal(st.add, 4 * 3 + 3 * 2);
  assert.deepEqual([st.b1, st.b2], [0, 0]);

  // A spare buys one ball, not two.
  const sp = applyFrame(0, 0, [7, 3], "spare");
  assert.deepEqual(sp, { add: 10, b1: 1, b2: 0 });
});

test("the outcome tables are proper probability distributions", () => {
  for (const [s, c] of [[0.05, 0.2], [0.15, 0.5], [0.3, 0.8]]) {
    const nine = frameOutcomes(s, c);
    const tenth = tenthOutcomes(s, c);
    assert.ok(Math.abs(nine.reduce((a, o) => a + o.p, 0) - 1) < 1e-9, `frames sum at ${s}/${c}`);
    assert.ok(Math.abs(tenth.reduce((a, o) => a + o.p, 0) - 1) < 1e-9, `tenth sums at ${s}/${c}`);
    // A strike frame is one ball; everything else is two, plus the tenth's extras.
    assert.ok(nine.every((o) => (o.kind === "strike" ? o.balls.length === 1 : o.balls.length === 2)));
    assert.ok(tenth.every((o) => (o.kind === "open" ? o.balls.length === 2 : o.balls.length === 3)));
  }
  assert.ok(Math.abs(FIRST_BALL.reduce((a, f) => a + f.p, 0) - 1) < 1e-9);
  assert.ok(Math.abs(COARSE_FIRST.reduce((a, f) => a + f.p, 0) - 1) < 1e-9);
});

test("the score distribution is exact and behaves", () => {
  const d = scoreDistribution(0.14, 0.45);
  let sum = 0;
  for (let v = 0; v <= 300; v++) sum += d.pmf[v];
  assert.ok(Math.abs(sum - 1) < 1e-9, `pmf sums to ${sum}`);
  assert.ok(d.mean > 100 && d.mean < 170);
  assert.ok(d.sd > 5 && d.sd < 40);

  // Bowling better scores higher, in both directions independently.
  assert.ok(scoreDistribution(0.2, 0.45).mean > d.mean);
  assert.ok(scoreDistribution(0.14, 0.6).mean > d.mean);

  // Marks never exceed the ten frames available.
  for (let v = 0; v <= 300; v++) {
    if (d.pmf[v] > 1e-9) assert.ok(d.strikes[v] + d.spares[v] <= 10 + 1e-9, `marks at ${v}`);
  }
});

test("the distribution matches a simulation of the same model", () => {
  const s = 0.12;
  const c = 0.4;
  const nine = frameOutcomes(s, c);
  const tenth = tenthOutcomes(s, c);
  // A seeded generator, so a failure here is a real one and not a bad draw.
  // mulberry32 rather than a plain linear congruential step: the latter
  // multiplies past 2^53 and quietly loses the low bits that matter.
  let seed = 20260912 >>> 0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (table) => {
    let r = rnd();
    for (const o of table) { r -= o.p; if (r <= 0) return o; }
    return table[table.length - 1];
  };

  const runs = 120_000;
  let total = 0;
  let sq = 0;
  const markSum = new Float64Array(301);
  const markCount = new Float64Array(301);
  for (let i = 0; i < runs; i++) {
    const frames = [];
    for (let f = 0; f < 9; f++) frames.push(pick(nine));
    frames.push(pick(tenth));
    const score = scoreGame(frames);
    const marks = frames.filter((f) => f.kind !== "open").length;
    total += score;
    sq += score * score;
    markSum[score] += marks;
    markCount[score] += 1;
  }
  const mcMean = total / runs;
  const mcSd = Math.sqrt(sq / runs - mcMean * mcMean);

  const d = scoreDistribution(s, c);
  assert.ok(Math.abs(d.mean - mcMean) < 0.5, `mean ${d.mean.toFixed(2)} vs ${mcMean.toFixed(2)}`);
  assert.ok(Math.abs(d.sd - mcSd) < 0.5, `sd ${d.sd.toFixed(2)} vs ${mcSd.toFixed(2)}`);

  // And the conditional reconstruction, which is the part that matters.
  let checked = 0;
  for (let v = 60; v <= 190; v++) {
    if (markCount[v] < 400) continue;
    const mc = markSum[v] / markCount[v];
    const exact = d.strikes[v] + d.spares[v];
    assert.ok(Math.abs(exact - mc) < 0.15, `marks at ${v}: ${exact.toFixed(2)} vs ${mc.toFixed(2)}`);
    checked++;
  }
  assert.ok(checked > 60, `only ${checked} scores had enough simulated games`);
});

test("the family reproduces his average and stays believable", () => {
  const family = meanFamily(102);
  assert.ok(family.length >= 2, "more than one pair of rates scores 102");
  for (const { s, c } of family) {
    const mean = scoreDistribution(s, c, { firstBall: COARSE_FIRST }).mean;
    assert.ok(Math.abs(mean - 102) < 1, `${s}/${c} averages ${mean.toFixed(1)}`);
    // Nobody strikes more often than they pick up what is left standing.
    assert.ok(c >= s, `${s}/${c} claims striking is easier than sparing`);
    assert.ok(STRIKE_RATES.includes(s));
  }
  // A score nobody could average is not fudged into a family.
  assert.deepEqual(meanFamily(295), []);
});

test("a fitted family says his 102 average is about two marks a game", () => {
  const family = meanFamily(102).map(({ s, c }) => ({ s, c, dist: scoreDistribution(s, c) }));

  // The split is genuinely undecided, and a mark count is not.
  const typical = reconstruct(102, family);
  assert.equal(typical.marks, 2);
  assert.equal(typical.opens, 8);
  assert.ok(typical.firm);
  assert.ok(typical.strikes.high - typical.strikes.low > 0.5,
    "totals cannot pin down how many of those marks were strikes");

  // A bad game is open frames all the way down, whichever way you split it.
  const bad = reconstruct(70, family);
  assert.equal(bad.marks, 0);
  assert.equal(bad.opens, 10);
  assert.ok(bad.firm);

  // More pins means more marks, always.
  let last = -1;
  for (const score of [70, 80, 90, 100, 110, 120, 130]) {
    const g = reconstruct(score, family);
    assert.ok(g.marks >= last, `marks fell going from ${score - 10} to ${score}`);
    last = g.marks;
  }

  // And the ladder has an even rung height, which is the whole point.
  const per = pinsPerMark(family);
  assert.ok(per >= 9 && per <= 14, `a mark is worth ${per} pins`);
});

test("a score the model cannot produce is refused, not guessed at", () => {
  // A bowler who never strikes cannot reach 300, however many spares he picks
  // up, so there is no composition to report.
  const noStrikes = scoreDistribution(0, 0.5);
  assert.equal(noStrikes.pmf[300], 0);
  assert.equal(likelyGame(300, noStrikes), null);
  assert.equal(reconstruct(300, [{ dist: noStrikes }]), null);

  const dist = scoreDistribution(0.05, 0.2);
  assert.equal(likelyGame(-1, dist), null);
  assert.equal(likelyGame(1.5, dist), null);
  assert.equal(likelyGame(90, null), null);
  // 300 is not impossible at beginner rates, just absurd, and the model says so
  // rather than refusing: one in every few thousand trillion games.
  assert.ok(dist.pmf[300] > 0 && dist.pmf[300] < 1e-12);
});

test("too thin a log is told so rather than fitted", () => {
  const thin = frameReport({ "2026-09-04": [100, 110, 95] });
  assert.equal(thin.enough, false);
  assert.equal(thin.games, 3);
  assert.equal(thin.needed, MIN_GAMES - 3);
  assert.equal(frameReport({}).enough, false);
});

test("his real log reads as marks, an honest split, and where the swing comes from", () => {
  const r = frameReport(HIS_SCORES);
  assert.equal(r.enough, true);
  assert.equal(r.games, 26);
  assert.equal(r.average, 102);

  assert.equal(r.typical.marks, 2);
  assert.equal(r.typical.opens, 8);
  assert.ok(r.pinsPerMark >= 9 && r.pinsPerMark <= 14);

  // The split is reported as the range the log allows, not as a number.
  assert.ok(r.split.strikeHigh > r.split.strikeLow);
  assert.ok(r.split.spareLow >= r.split.strikeLow);

  // His games swing more than any fixed pair of rates can produce, which is a
  // finding about his nights rather than a fault in the model.
  assert.ok(r.swing.yours > r.swing.bowling,
    `observed ${r.swing.yours} should exceed the model's ${r.swing.bowling}`);
  assert.ok(r.swing.bowling > 8 && r.swing.bowling < 20);

  const named = Object.fromEntries(r.named.map((g) => [g.label, g]));
  assert.equal(named["Your worst game"].score, 70);
  assert.equal(named["Your worst game"].opens, 10, "his worst game never converted anything");
  assert.equal(named["Your best game"].score, 159);
  assert.ok(named["Your best game"].marks >= 5);
  assert.equal(named["Your last game"].score, 106);
});

test("the coarse ball used for searching finds the same rates as the full one", () => {
  // The search runs on five buckets for speed; if that changed the answer the
  // speed would not be worth having.
  const coarse = meanFamily(102, { searchBall: COARSE_FIRST });
  const fine = meanFamily(102, { searchBall: FIRST_BALL });
  assert.deepEqual(coarse.map((f) => f.s), fine.map((f) => f.s));
  for (let i = 0; i < coarse.length; i++) {
    assert.ok(Math.abs(coarse[i].c - fine[i].c) < 0.06,
      `spare rate moved from ${fine[i].c} to ${coarse[i].c} at strike rate ${coarse[i].s}`);
  }
});

test("the whole report stays inside a request budget", () => {
  const t0 = Date.now();
  frameReport(HIS_SCORES);
  const ms = Date.now() - t0;
  assert.ok(ms < 600, `frameReport took ${ms}ms`);
});
