// What the game probably was.
//
// The app records totals, because a total is all he is willing to type at the
// alley. A total does not say how it happened: 118 could be five strikes and
// five open frames, or no strikes at all and eight spares. Those are different
// bowlers with the same score, and they need different practice.
//
// So this works backwards. Two rates explain almost everything about a game:
// how often the first ball strikes, and how often the rest get picked up. Every
// pair of rates implies an exact distribution of final scores, computed below
// without any simulation, and the pair that makes his 26 actual scores most
// likely is the pair he is bowling at. The same pass gives the expected number
// of strikes, spares and open frames for each possible score, which is the
// reconstruction.
//
// This is an estimate and the app says so everywhere it appears. Totals carry
// real information about the strike to spare ratio (strikes make a score swing
// more than spares do) but not enough to pin it down, so every figure here
// comes with the range the log actually supports.
//
// Pure functions only, so they can be unit tested with node.

/**
 * Pins on a first ball that did not strike.
 *
 * This is the model's one assumption rather than something fitted: with only
 * totals to go on, three free parameters cannot be told apart. The shape is a
 * beginner's first ball, most often leaving one to three pins. Changing it
 * moves the fitted rates a little and the reconstruction barely at all, which
 * the tests check.
 */
export const FIRST_BALL = [
  { pins: 9, p: 0.22 },
  { pins: 8, p: 0.20 },
  { pins: 7, p: 0.16 },
  { pins: 6, p: 0.12 },
  { pins: 5, p: 0.09 },
  { pins: 4, p: 0.07 },
  { pins: 3, p: 0.05 },
  { pins: 2, p: 0.04 },
  { pins: 1, p: 0.03 },
  { pins: 0, p: 0.02 },
];

/**
 * A five bucket first ball, for the search only.
 *
 * Fitting means scoring hundreds of candidate rate pairs, and the full ten
 * bucket ball above makes that sixty times more work than it needs to be. The
 * coarse version finds the same rates to within a grid step, which the tests
 * check, and the winning pair is then scored once at full resolution.
 */
export const COARSE_FIRST = [
  { pins: 9, p: 0.26 },
  { pins: 8, p: 0.24 },
  { pins: 7, p: 0.20 },
  { pins: 5, p: 0.18 },
  { pins: 2, p: 0.12 },
];

/** Games needed before two rates can be fitted to totals at all. */
export const MIN_GAMES = 10;

const MAX_SCORE = 300;

/** A missed spare still usually takes most of what is left standing. */
function openSecond(left) {
  const out = [];
  let sum = 0;
  for (let j = 0; j < left; j++) {
    const w = j + 1;
    out.push({ j, w });
    sum += w;
  }
  return out.map(({ j, w }) => ({ pins: j, p: w / sum }));
}

/**
 * Every way one of the first nine frames can go, with its probability.
 * `kind` is what the frame counts as when reconstructing a game.
 */
export function frameOutcomes(s, c, firstBall = FIRST_BALL) {
  const out = [{ balls: [10], p: s, kind: "strike" }];
  for (const { pins: k, p: q } of firstBall) {
    const base = (1 - s) * q;
    if (base <= 0) continue;
    out.push({ balls: [k, 10 - k], p: base * c, kind: "spare" });
    for (const { pins: j, p } of openSecond(10 - k)) {
      out.push({ balls: [k, j], p: base * (1 - c) * p, kind: "open" });
    }
  }
  return out.filter((o) => o.p > 1e-12);
}

/**
 * Every way the tenth frame can go.
 *
 * It is its own shape: a strike buys two more balls and a spare buys one, and
 * nothing after it collects a bonus. The frame still counts as one mark, so the
 * extra balls do not inflate the strike count.
 */
export function tenthOutcomes(s, c, firstBall = FIRST_BALL) {
  const out = [];
  const firsts = firstBall.filter((f) => f.p > 0);

  // Strike, then two more balls on fresh racks.
  out.push({ balls: [10, 10, 10], p: s * s * s, kind: "strike" });
  for (const { pins: k, p: q } of firsts) {
    out.push({ balls: [10, 10, k], p: s * s * (1 - s) * q, kind: "strike" });
    const base = s * (1 - s) * q;
    out.push({ balls: [10, k, 10 - k], p: base * c, kind: "strike" });
    for (const { pins: j, p } of openSecond(10 - k)) {
      out.push({ balls: [10, k, j], p: base * (1 - c) * p, kind: "strike" });
    }
  }

  // Spare, then one more ball.
  for (const { pins: k, p: q } of firsts) {
    const base = (1 - s) * q * c;
    out.push({ balls: [k, 10 - k, 10], p: base * s, kind: "spare" });
    for (const { pins: k2, p: q2 } of firsts) {
      out.push({ balls: [k, 10 - k, k2], p: base * (1 - s) * q2, kind: "spare" });
    }
  }

  // Open, and the game is over.
  for (const { pins: k, p: q } of firsts) {
    const base = (1 - s) * q * (1 - c);
    for (const { pins: j, p } of openSecond(10 - k)) {
      out.push({ balls: [k, j], p: base * p, kind: "open" });
    }
  }

  return out.filter((o) => o.p > 1e-12);
}

/**
 * Throw a frame's balls and return what it adds to the score and what it owes.
 *
 * `b1` is how many earlier frames are still counting the next ball as a bonus,
 * `b2` how many are counting the one after. A strike buys the next two balls and
 * a spare the next one, which is the whole of bowling's scoring in four lines.
 */
export function applyFrame(b1, b2, balls, kind) {
  let add = 0;
  let a = b1;
  let b = b2;
  for (const v of balls) {
    add += v * (1 + a);
    a = b;
    b = 0;
  }
  if (kind === "strike") return { add, b1: a + 1, b2: b + 1 };
  if (kind === "spare") return { add, b1: a + 1, b2: b };
  return { add, b1: a, b2: b };
}

/** Score a full game given ten frame outcomes, for checking the recurrence. */
export function scoreGame(frames) {
  let total = 0;
  let b1 = 0;
  let b2 = 0;
  for (const f of frames) {
    const step = applyFrame(b1, b2, f.balls, f.kind);
    total += step.add;
    b1 = step.b1;
    b2 = step.b2;
  }
  return total;
}

// Pending bonus state: b1 can reach 2 (two strikes back to back), b2 only 1.
const STATES = 6;
const stateOf = (b1, b2) => b1 * 2 + b2;

/**
 * The exact distribution of final scores for a pair of rates, and with it the
 * expected make up of a game that ends on each score.
 *
 * Carrying the probability alongside the running sums of marks means one pass
 * gives both the odds of every score and, for each score, what a game that
 * landed there was most likely made of. Squared sums come along so the
 * reconstruction can say how firm each figure is.
 */
export function scoreDistribution(s, c, opts = {}) {
  const marksToo = !opts.momentsOnly;
  const nine = frameOutcomes(s, c, opts.firstBall);
  const tenth = tenthOutcomes(s, c, opts.firstBall);
  const W = MAX_SCORE + 1;
  const size = STATES * W;

  // p: probability mass. x/y: strikes and spares weighted by it. x2/y2: their
  // squares, which is what turns an average into an average with a spread.
  let p = new Float64Array(size);
  let x = new Float64Array(size);
  let y = new Float64Array(size);
  let x2 = new Float64Array(size);
  let y2 = new Float64Array(size);
  p[stateOf(0, 0) * W] = 1;

  // Every (state, outcome) pair resolves to the same pins and the same next
  // state whatever the running score is, so it is worked out once per rate pair
  // rather than three hundred times over inside the score loop.
  const table = (outcomes, last) => {
    const rows = [];
    for (let st = 0; st < STATES; st++) {
      const b1 = st >> 1;
      const b2 = st & 1;
      rows.push(outcomes.map((o) => {
        const r = applyFrame(b1, b2, o.balls, o.kind);
        return {
          add: r.add,
          // Nothing follows the tenth frame, so it owes nobody anything.
          to: (last ? stateOf(0, 0) : stateOf(r.b1, r.b2)) * W,
          p: o.p,
          ds: o.kind === "strike" ? 1 : 0,
          dp: o.kind === "spare" ? 1 : 0,
        };
      }));
    }
    return rows;
  };

  const nineT = table(nine, false);
  const tenthT = table(tenth, true);
  const maxAdd = (rows) => Math.max(...rows.flat().map((r) => r.add));
  const nineMax = maxAdd(nineT);

  // Highest score reachable so far, so early frames do not scan the whole range.
  let hi = 0;
  const step = (rows, last) => {
    const np = new Float64Array(size);
    const nx = new Float64Array(size);
    const ny = new Float64Array(size);
    const nx2 = new Float64Array(size);
    const ny2 = new Float64Array(size);

    for (let st = 0; st < STATES; st++) {
      const base = st * W;
      const outs = rows[st];
      for (let v = 0; v <= hi; v++) {
        const mass = p[base + v];
        if (mass <= 0) continue;
        const mx = x[base + v];
        const my = y[base + v];
        const mx2 = x2[base + v];
        const my2 = y2[base + v];

        for (let i = 0; i < outs.length; i++) {
          const o = outs[i];
          const score = v + o.add;
          if (score > MAX_SCORE) continue;
          const to = o.to + score;
          const w = o.p;
          np[to] += mass * w;
          if (!marksToo) continue;
          // (X + d)^2 = X^2 + 2dX + d, since d is 0 or 1.
          nx[to] += (mx + o.ds * mass) * w;
          ny[to] += (my + o.dp * mass) * w;
          nx2[to] += (mx2 + o.ds * (2 * mx + mass)) * w;
          ny2[to] += (my2 + o.dp * (2 * my + mass)) * w;
        }
      }
    }
    p = np; x = nx; y = ny; x2 = nx2; y2 = ny2;
    hi = Math.min(MAX_SCORE, hi + (last ? maxAdd(tenthT) : nineMax));
  };

  for (let f = 0; f < 9; f++) step(nineT, false);
  step(tenthT, true);

  const pmf = new Float64Array(W);
  const strikes = new Float64Array(W);
  const spares = new Float64Array(W);
  const strikeSd = new Float64Array(W);
  const spareSd = new Float64Array(W);
  for (let v = 0; v <= MAX_SCORE; v++) {
    let mp = 0;
    let mx = 0;
    let my = 0;
    let mx2 = 0;
    let my2 = 0;
    for (let st = 0; st < STATES; st++) {
      const i = st * W + v;
      mp += p[i]; mx += x[i]; my += y[i]; mx2 += x2[i]; my2 += y2[i];
    }
    pmf[v] = mp;
    if (mp > 0) {
      strikes[v] = mx / mp;
      spares[v] = my / mp;
      strikeSd[v] = Math.sqrt(Math.max(0, mx2 / mp - strikes[v] ** 2));
      spareSd[v] = Math.sqrt(Math.max(0, my2 / mp - spares[v] ** 2));
    }
  }

  let mean = 0;
  for (let v = 0; v <= MAX_SCORE; v++) mean += v * pmf[v];
  let variance = 0;
  for (let v = 0; v <= MAX_SCORE; v++) variance += pmf[v] * (v - mean) ** 2;

  return { s, c, pmf, strikes, spares, strikeSd, spareSd, mean, sd: Math.sqrt(variance) };
}

const round3 = (v) => Math.round(v * 1000) / 1000;

/** Strike rates worth considering for a recreational bowler. */
export const STRIKE_RATES = [0.02, 0.05, 0.08, 0.12, 0.16, 0.22];

/**
 * Every pair of rates that reproduces his average.
 *
 * The spread deliberately plays no part in this. A single pair of rates can
 * only produce so much swing, and his games swing more than any pair can
 * manage at his average, because some of that swing is which night it was
 * rather than how he bowls. Fitting to the spread would push the answer to
 * whatever widened the distribution, which is how a first attempt ended up
 * claiming he converts two percent of his spares.
 *
 * So the average is the only thing fitted, and it leaves a family rather than
 * an answer: more strikes and fewer spares scores the same as the reverse. The
 * family is the honest output, and what it agrees on is what the app reports.
 */
export function meanFamily(target, opts = {}) {
  const ball = opts.searchBall || COARSE_FIRST;
  const mean = (s, c) => scoreDistribution(s, c, { firstBall: ball, momentsOnly: true }).mean;
  const out = [];
  for (const s of opts.strikeRates || STRIKE_RATES) {
    // The average climbs with the spare rate, so this is a clean bisection.
    if (mean(s, 0) > target) continue;      // already too high with no spares at all
    if (mean(s, 0.95) < target) continue;   // cannot reach him however many he picks up
    let lo = 0;
    let hi = 0.95;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (mean(s, mid) < target) lo = mid;
      else hi = mid;
    }
    const c = round3((lo + hi) / 2);
    // Picking up what is left standing is easier than striking, for every
    // bowler there has ever been. Without this the family stretches into
    // corners like sixteen percent strikes and one percent spares, which match
    // his average and describe nobody.
    if (c < s) continue;
    out.push({ s, c });
  }
  return out;
}

/**
 * What a game that ended on this score was most likely made of.
 *
 * Marks are strikes plus spares, and they are the figure totals really pin
 * down: a 79 is ten open frames whichever way you split it, and a 119 is three
 * or four marks. The split itself is reported as a range because the score
 * genuinely does not decide it.
 */
export function likelyGame(score, dist) {
  if (!dist || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) return null;
  if (!(dist.pmf[score] > 0)) return null;
  const strikes = dist.strikes[score];
  const spares = dist.spares[score];
  return {
    score,
    strikes,
    spares,
    marks: strikes + spares,
    opens: 10 - strikes - spares,
    spread: { strikes: dist.strikeSd[score], spares: dist.spareSd[score] },
  };
}

/** The same game read across the whole family, so the ranges are real. */
export function reconstruct(score, family) {
  const rows = family.map((f) => likelyGame(score, f.dist)).filter(Boolean);
  if (!rows.length) return null;
  const span = (pick) => {
    const vs = rows.map(pick);
    return { low: Math.min(...vs), high: Math.max(...vs), mid: vs.reduce((a, b) => a + b, 0) / vs.length };
  };
  const marks = span((r) => r.marks);
  return {
    score,
    marks: Math.round(marks.mid),
    marksRange: [Math.floor(marks.low), Math.ceil(marks.high)],
    opens: 10 - Math.round(marks.mid),
    strikes: span((r) => r.strikes),
    spares: span((r) => r.spares),
    // True when the family agrees to within a mark, which it does on most games.
    firm: marks.high - marks.low <= 1,
  };
}

/**
 * What one more mark a game is worth, in pins.
 *
 * This is the payoff of the whole exercise. His scores ladder up almost exactly
 * twelve pins per mark, so "convert one more spare a night" stops being advice
 * and becomes a number he can check next week.
 */
export function pinsPerMark(family, from = 1, to = 5) {
  const dist = family[0] && family[0].dist;
  if (!dist) return null;
  // Walk the scores and note where the reconstructed mark count crosses each
  // whole number, then measure the gap between the crossings.
  const at = new Map();
  for (let v = 0; v <= MAX_SCORE; v++) {
    if (!(dist.pmf[v] > 1e-9)) continue;
    const marks = dist.strikes[v] + dist.spares[v];
    const k = Math.round(marks);
    if (Math.abs(marks - k) < 0.06 && !at.has(k)) at.set(k, v);
  }
  const lo = at.get(from);
  const hi = at.get(to);
  if (lo === undefined || hi === undefined || hi <= lo) return null;
  return Math.round((hi - lo) / (to - from));
}

/**
 * Everything the card needs.
 *
 * Marks and open frames are stated plainly. The strike to spare split is given
 * as the range the family allows, with the reason. And the leftover swing is
 * reported on its own, because the gap between how much a fixed bowler would
 * vary and how much he actually varies is a real finding about his nights.
 */
export function frameReport(scores, opts = {}) {
  const values = Object.keys(scores)
    .sort()
    .flatMap((d) => (Array.isArray(scores[d]) ? scores[d] : []))
    .filter((v) => typeof v === "number");

  const need = opts.minGames ?? MIN_GAMES;
  if (values.length < need) {
    return { enough: false, games: values.length, needed: need - values.length };
  }

  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));

  const family = meanFamily(mean, opts).map(({ s, c }) => ({
    s, c, dist: scoreDistribution(s, c, { firstBall: opts.firstBall }),
  }));
  if (!family.length) return { enough: false, games: n, needed: 0 };

  const typical = reconstruct(Math.round(mean), family);
  const modelSd = family.reduce((a, f) => a + f.dist.sd, 0) / family.length;

  const named = [];
  const push = (label, score) => {
    if (named.some((g) => g.score === score)) return;
    const g = reconstruct(score, family);
    if (g) named.push({ label, ...g });
  };
  push("Your last game", values[n - 1]);
  push("Your best game", Math.max(...values));
  push("Your worst game", Math.min(...values));

  const pct = (v) => Math.round(v * 100);
  return {
    enough: true,
    games: n,
    average: Math.round(mean),
    typical,
    pinsPerMark: pinsPerMark(family),
    named,
    split: {
      strikeLow: pct(Math.min(...family.map((f) => f.s))),
      strikeHigh: pct(Math.max(...family.map((f) => f.s))),
      spareLow: pct(Math.min(...family.map((f) => f.c))),
      spareHigh: pct(Math.max(...family.map((f) => f.c))),
    },
    // How much of his swing is the game, and how much is the night.
    swing: {
      yours: Math.round(sd),
      bowling: Math.round(modelSd),
      nights: Math.max(0, Math.round(Math.sqrt(Math.max(0, sd * sd - modelSd * modelSd)))),
    },
  };
}
