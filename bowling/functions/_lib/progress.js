// Progress analysis over the game log.
//
// The point of this module is to be honest. A bowling average over a handful of
// games is mostly noise: with a spread near 30 pins, a good night and a bad night
// look like a trend when they are nothing of the kind. So rather than drawing an
// arrow and hoping, every claim here is checked against the scatter in the data,
// and the answer is allowed to be "not yet".
//
// Pure functions only, so they can be unit tested with node.

/** Games needed before a trend is worth attempting at all. */
export const MIN_TREND_GAMES = 12;

/** Window for the rolling average, in games. */
export const ROLL_WINDOW = 10;

/** Two sided 95% critical values of t, indexed by degrees of freedom. */
const T95 = [
  0, 12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
  2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086,
  2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042,
];

function tCritical(df) {
  if (df < 1) return null;
  return df <= 30 ? T95[df] : 1.96;
}

/**
 * The game log flattened into one chronological series.
 * Each entry keeps the day it belongs to and its position within that session,
 * which is what makes the warm up analysis possible.
 */
export function gameSeries(scores) {
  const out = [];
  for (const date of Object.keys(scores).sort()) {
    const list = scores[date];
    if (!Array.isArray(list)) continue;
    let seat = 0;
    for (const value of list) {
      if (typeof value !== "number") continue;
      out.push({ date, score: value, seat: seat++, n: out.length + 1 });
    }
  }
  return out;
}

/** Mean of a list of numbers, or null when there is nothing to average. */
function mean(list) {
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}

/** Sample standard deviation. Needs two points to mean anything. */
export function spread(list) {
  if (list.length < 2) return null;
  const m = mean(list);
  const ss = list.reduce((a, b) => a + (b - m) ** 2, 0);
  return Math.sqrt(ss / (list.length - 1));
}

/**
 * Trailing average after each game, so the line can be drawn alongside the
 * individual scores. Entries before the window is full average what exists.
 */
export function rollingAverage(series, window = ROLL_WINDOW) {
  return series.map((_, i) => {
    const slice = series.slice(Math.max(0, i - window + 1), i + 1).map((g) => g.score);
    return Math.round(mean(slice) * 10) / 10;
  });
}

/**
 * Ordinary least squares of score against game number, with the standard error
 * of the slope. The error is the whole point: it is what decides whether the
 * slope is a real trend or a line drawn through noise.
 */
export function trend(series) {
  const n = series.length;
  if (n < 3) return null;
  const xs = series.map((g) => g.n);
  const ys = series.map((g) => g.score);
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - (intercept + slope * xs[i])) ** 2;
  const df = n - 2;
  const stderr = df > 0 ? Math.sqrt(sse / df / sxx) : null;
  const t = tCritical(df);
  const margin = stderr !== null && t !== null ? t * stderr : null;
  return {
    slope,
    intercept,
    stderr,
    n,
    // 95% interval on the slope, in pins per game.
    low: margin === null ? null : slope - margin,
    high: margin === null ? null : slope + margin,
  };
}

/** Games bowled per week, measured from the log rather than assumed. */
export function gamesPerWeek(series) {
  if (series.length < 2) return null;
  const first = Date.parse(`${series[0].date}T00:00:00Z`);
  const last = Date.parse(`${series[series.length - 1].date}T00:00:00Z`);
  if (Number.isNaN(first) || Number.isNaN(last)) return null;
  const days = (last - first) / 86_400_000 + 1;
  return (series.length / days) * 7;
}

/**
 * Average score by position within a session: first game of the night, second,
 * and so on. A large gap between the first and last seat is a warm up problem,
 * which is worth more pins than anything else a beginner can change.
 */
export function bySessionPosition(series, minSessions = 2) {
  const seats = new Map();
  for (const g of series) {
    if (!seats.has(g.seat)) seats.set(g.seat, []);
    seats.get(g.seat).push(g.score);
  }
  const rows = [];
  for (const [seat, list] of [...seats.entries()].sort((a, b) => a[0] - b[0])) {
    if (list.length < minSessions) continue;
    rows.push({ seat, game: seat + 1, sessions: list.length, average: Math.round(mean(list)) });
  }
  if (rows.length < 2) return { rows, gap: null };
  return { rows, gap: rows[rows.length - 1].average - rows[0].average };
}

/** Best three game series bowled on any single day. */
export function bestSession(scores) {
  let best = null;
  for (const date of Object.keys(scores).sort()) {
    const list = (scores[date] || []).filter((n) => typeof n === "number");
    if (!list.length) continue;
    const total = list.reduce((a, b) => a + b, 0);
    if (!best || total > best.total) best = { date, total, games: list.length };
  }
  return best;
}

/**
 * Whether improvement is actually visible in the data yet.
 *
 * Three outcomes, and "early" is the honest one for most of a first season:
 * the interval on the slope still straddles zero, so the log cannot tell an
 * improving bowler from a flat one. Saying so beats drawing a hopeful arrow.
 */
export function verdict(series) {
  const n = series.length;
  if (n < MIN_TREND_GAMES) {
    return {
      state: "early",
      games: n,
      needed: MIN_TREND_GAMES - n,
      text: `${MIN_TREND_GAMES - n} more ${MIN_TREND_GAMES - n === 1 ? "game" : "games"} before a trend means anything.`,
    };
  }
  const t = trend(series);
  if (!t || t.low === null) return { state: "early", games: n, needed: 1, text: "Not enough spread to read a trend." };

  // Reported per ten games rather than per week. A weekly rate would mean
  // multiplying by a games per week figure measured over a handful of days,
  // which is unstable enough to turn a mild slope into a wild claim.
  const per10 = (v) => Math.round(v * 10 * 10) / 10;
  const out = {
    games: n,
    slopePerGame: Math.round(t.slope * 100) / 100,
    slopePer10: per10(t.slope),
    lowPer10: per10(t.low),
    highPer10: per10(t.high),
    gamesPerWeek: gamesPerWeek(series) === null ? null : Math.round(gamesPerWeek(series)),
  };

  if (t.low > 0) {
    return { ...out, state: "improving", text: `Improving, about ${Math.round(per10(t.slope))} pins every 10 games.` };
  }
  if (t.high < 0) {
    return { ...out, state: "declining", text: `Sliding, about ${Math.round(Math.abs(per10(t.slope)))} pins every 10 games.` };
  }
  return {
    ...out,
    state: "flat",
    // The interval is the finding. It says exactly how much the log rules out.
    text: `No trend yet. Over 10 games the data still allows anything from ${Math.round(per10(t.low))} to ${Math.round(per10(t.high))} pins.`,
  };
}

/** Everything the progress panel needs, in one pass over the log. */
export function progressReport(scores) {
  const series = gameSeries(scores);
  const values = series.map((g) => g.score);
  const recent = values.slice(-ROLL_WINDOW);
  const lifetime = mean(values);
  const rolling = mean(recent);

  return {
    games: series.length,
    series: series.map((g) => ({ n: g.n, date: g.date, game: g.seat + 1, score: g.score })),
    rolling: rollingAverage(series),
    average: lifetime === null ? null : Math.floor(lifetime),
    recentAverage: rolling === null ? null : Math.floor(rolling),
    // Recent form against the lifetime number. This is the figure that actually
    // moves when he has a good week; the lifetime average is far too slow.
    delta: lifetime === null || rolling === null ? null : Math.round(rolling - lifetime),
    window: Math.min(ROLL_WINDOW, series.length),
    spread: spread(values) === null ? null : Math.round(spread(values)),
    recentSpread: spread(recent) === null ? null : Math.round(spread(recent)),
    session: bySessionPosition(series),
    best: bestSession(scores),
    verdict: verdict(series),
  };
}
