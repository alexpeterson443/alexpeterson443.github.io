// The numbers Claude's link reports, built to resist false confidence.
//
// Three rules run through all of it.
//
// 1. A night is the unit, not a game. Averages are taken within each session
//    first and then across sessions, so one eight game night cannot outweigh a
//    week of two game nights.
// 2. "Form" and "recent" are medians with an interquartile range. One 159 or
//    one 70 moves a mean of ten games by five pins; it barely moves a median.
// 3. A comparison between groups (weekday, time of day, lane, game of the
//    night, pain level) is only made when every group in it has at least
//    MIN_BUCKET_SESSIONS sessions behind it. Below that the claim is not made
//    at all: no hedged version, no "not proof yet". The output simply has no
//    line for it.
//
// Every figure carries its sample size and whether it came from frame data or
// from totals, and the two are never pooled: frame figures are computed from
// frame backed games only.
//
// Pure functions only, so they can be unit tested with node.

/** Sessions each group needs before any comparison involving it is shown. */
export const MIN_BUCKET_SESSIONS = 5;

/** Spare attempts a leave category needs before its conversion rate is shown. */
export const MIN_LEAVE_ATTEMPTS = 5;

/** Nights with pain recorded before pain is correlated with anything. */
export const MIN_PAIN_SESSIONS = 10;

/** Frame backed games needed before their game to game spread is estimated. */
export const MIN_FRAME_GAMES = 5;

/** Games in "recent". */
export const RECENT_GAMES = 10;

/** What a trend has to be to count as detected, per metric. */
export const DETECT = { pins: 10, marks: 1, alpha: 0.05, power: 0.8 };

// z for a two sided 95% test and for 80% power.
const Z_ALPHA = 1.959964;
const Z_POWER = 0.841621;

// ---------- small pieces ----------

export function mean(list) {
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}

/** Sample standard deviation; null under two points. */
export function sd(list) {
  if (list.length < 2) return null;
  const m = mean(list);
  return Math.sqrt(list.reduce((a, b) => a + (b - m) ** 2, 0) / (list.length - 1));
}

/** Linear interpolation quantile (R type 7, the spreadsheet default). */
export function quantile(list, q) {
  if (!list.length) return null;
  const s = [...list].sort((a, b) => a - b);
  const at = (s.length - 1) * q;
  const lo = Math.floor(at);
  const hi = Math.ceil(at);
  return s[lo] + (s[hi] - s[lo]) * (at - lo);
}

export const median = (list) => quantile(list, 0.5);

/** Median with its interquartile range, and how many values it rests on. */
export function summary(list) {
  if (!list.length) return null;
  return { median: median(list), q1: quantile(list, 0.25), q3: quantile(list, 0.75), mean: mean(list), sd: sd(list), n: list.length };
}

/** Spearman rank correlation, ties averaged. */
export function spearman(xs, ys) {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const rank = (v) => {
    const order = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(v.length);
    for (let i = 0; i < order.length;) {
      let j = i;
      while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
      for (let k = i; k <= j; k++) r[order[k][1]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  const mx = mean(rx);
  const my = mean(ry);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < rx.length; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

// ---------- sessions ----------

/**
 * Games grouped into nights, oldest first. `games` are loadDetail's rows:
 * {date, position, score, framesAvailable, frames, lane, loggedAt}.
 */
export function sessionsOf(games, pain = {}) {
  const map = new Map();
  for (const g of games) {
    if (!map.has(g.date)) map.set(g.date, { date: g.date, games: [], pain: Object.hasOwn(pain, g.date) ? pain[g.date] : null });
    map.get(g.date).games.push(g);
  }
  return [...map.values()]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((s) => ({ ...s, games: s.games.sort((a, b) => a.position - b.position), scores: s.games.map((g) => g.score) }));
}

/**
 * The average that treats every night alike: mean within each session, then
 * the mean of those. Its spread is the spread of the nightly means.
 */
export function sessionWeighted(sessions) {
  const means = sessions.map((s) => mean(s.scores)).filter((v) => v !== null);
  if (!means.length) return null;
  return {
    value: mean(means),
    sd: sd(means),
    sessions: means.length,
    games: sessions.reduce((a, s) => a + s.scores.length, 0),
    frames: false,
  };
}

/** Plain mean over games, kept because it is the number the app has always shown. */
export function perGame(games) {
  const v = games.map((g) => g.score);
  if (!v.length) return null;
  return { value: mean(v), sd: sd(v), games: v.length, frames: false };
}

/** Median of the last RECENT_GAMES games, with its IQR. */
export function recent(games, n = RECENT_GAMES) {
  const s = summary(games.slice(-n).map((g) => g.score));
  return s ? { ...s, frames: false } : null;
}

// ---------- comparisons, with the threshold ----------

/**
 * Groups of sessions compared on their session weighted scores.
 *
 * `keyOf(game, session)` puts each game in a group (null leaves it out). Each
 * session contributes one value per group it touches: the mean of its games in
 * that group, so a long night still counts once. Groups below `min` sessions
 * are dropped, and the comparison exists only if two or more groups survive.
 */
export function compareGroups(sessions, keyOf, { min = MIN_BUCKET_SESSIONS, order = null } = {}) {
  const groups = new Map();
  for (const s of sessions) {
    const per = new Map();
    for (const g of s.games) {
      const k = keyOf(g, s);
      if (k === null || k === undefined) continue;
      if (!per.has(k)) per.set(k, []);
      per.get(k).push(g.score);
    }
    for (const [k, list] of per) {
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(mean(list));
    }
  }
  let keys = [...groups.keys()];
  keys = order ? order.filter((k) => groups.has(k)) : keys.sort();
  const rows = keys
    .map((k) => ({ key: k, ...summary(groups.get(k)), sessions: groups.get(k).length, frames: false }))
    .filter((r) => r.sessions >= min);
  return { rows: rows.length >= 2 ? rows : [], min };
}

export const POSITIONS = ["Game 1", "Game 2", "Game 3", "Game 4+"];
const positionKey = (g) => POSITIONS[Math.min(g.position, 4) - 1];

/**
 * Score by game of the night, plus the question he actually asked: where in a
 * night does it fall apart? That part is paired within nights: for each night
 * that reached a later game, that game's score minus game 1's. A paired
 * difference cancels out good and bad nights, which unpaired averages cannot.
 */
export function byPosition(sessions, min = MIN_BUCKET_SESSIONS) {
  const table = compareGroups(sessions, positionKey, { min, order: POSITIONS });
  const drops = [];
  for (const label of POSITIONS.slice(1)) {
    const diffs = [];
    for (const s of sessions) {
      const first = s.games.find((g) => g.position === 1);
      const later = s.games.filter((g) => positionKey(g) === label).map((g) => g.score);
      if (first && later.length) diffs.push(mean(later) - first.score);
    }
    if (diffs.length >= min) drops.push({ key: label, ...summary(diffs), sessions: diffs.length, frames: false });
  }
  return { rows: table.rows, drops, min };
}

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function weekdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Hour of day in the alley's timezone, for games that recorded when they were logged. */
export function hourIn(ms, tz) {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(new Date(ms));
  return Number(h) % 24;
}

export const TIMES = ["Afternoon", "Evening", "Late"];
export function timeOfDay(hour) {
  if (hour < 17) return "Afternoon";
  if (hour < 20) return "Evening";
  return "Late";
}

// ---------- frames ----------

/** Frame figures from frame backed games only. Null without any. */
export function frameStats(games) {
  const framed = games.filter((g) => g.framesAvailable && Array.isArray(g.frames));
  if (!framed.length) return null;
  let strikes = 0;
  let spares = 0;
  let opens = 0;
  let attempts = 0;
  const firstBalls = [];
  const marksPerGame = [];
  for (const g of framed) {
    let marks = 0;
    for (const f of g.frames) {
      firstBalls.push(f.b1);
      if (f.b1 === 10) { strikes++; marks++; continue; }
      attempts++;
      if (f.b1 + (f.b2 ?? 0) === 10) { spares++; marks++; } else opens++;
    }
    marksPerGame.push(marks);
  }
  const frames = framed.length * 10;
  return {
    games: framed.length,
    frames,
    strikeRate: strikes / frames,
    spareRate: attempts ? spares / attempts : null,
    openRate: opens / frames,
    strikes, spares, opens, attempts,
    firstBall: summary(firstBalls),
    marks: summary(marksPerGame),
    scores: summary(framed.map((g) => g.score)),
    frames_available: true,
  };
}

/**
 * Spare conversion, overall and by what was left.
 *
 * "Pins standing" comes from the first ball's count and exists for every frame
 * backed frame. "Leave" is the named leave (e.g. 10, 3-10) and exists only
 * where he tapped the pins. Categories below MIN_LEAVE_ATTEMPTS are dropped.
 */
export function spareStats(games, min = MIN_LEAVE_ATTEMPTS) {
  const framed = games.filter((g) => g.framesAvailable && Array.isArray(g.frames));
  if (!framed.length) return null;
  const tally = new Map();
  const add = (group, key, made) => {
    const k = `${group}|${key}`;
    if (!tally.has(k)) tally.set(k, { group, key, made: 0, attempts: 0 });
    const t = tally.get(k);
    t.attempts++;
    if (made) t.made++;
  };
  let made = 0;
  let attempts = 0;
  for (const g of framed) {
    for (const f of g.frames) {
      if (f.b1 === 10) continue;
      const ok = f.b1 + (f.b2 ?? 0) === 10;
      attempts++;
      if (ok) made++;
      const standing = 10 - f.b1;
      add("standing", standing === 1 ? "1 pin" : standing === 2 ? "2 pins" : "3+ pins", ok);
      if (f.leave) {
        add("leave", f.leave, ok);
        add("leave kind", f.leave.includes("-") ? "Multi pin" : "Single pin", ok);
      }
    }
  }
  const rows = (group, order) => [...tally.values()]
    .filter((t) => t.group === group && t.attempts >= min)
    .sort((a, b) => (order ? order.indexOf(a.key) - order.indexOf(b.key) : b.attempts - a.attempts))
    .map((t) => ({ key: t.key, made: t.made, attempts: t.attempts, rate: t.made / t.attempts, frames_available: true }));
  return {
    games: framed.length,
    overall: attempts ? { made, attempts, rate: made / attempts, frames_available: true } : null,
    byStanding: rows("standing", ["1 pin", "2 pins", "3+ pins"]),
    byKind: rows("leave kind", ["Single pin", "Multi pin"]),
    byLeave: rows("leave", null).slice(0, 5),
    min,
  };
}

// ---------- pain ----------

/**
 * Whether volume costs pins or only hurts.
 *
 * Nights with pain recorded, split low (0 to 1) and high (2 to 3). Compared on
 * games played, the session average, and the within night fade from game 1 to
 * games 3 and later. Each comparison needs MIN_BUCKET_SESSIONS nights in both
 * halves, and the rank correlations need MIN_PAIN_SESSIONS nights in all.
 */
export function painStats(sessions) {
  const noted = sessions.filter((s) => s.pain !== null && s.pain !== undefined && s.scores.length);
  const out = { sessions: noted.length, correlations: [], groups: [], min: MIN_BUCKET_SESSIONS, minAll: MIN_PAIN_SESSIONS };
  if (!noted.length) return out;

  if (noted.length >= MIN_PAIN_SESSIONS && new Set(noted.map((s) => s.pain)).size > 1) {
    const pains = noted.map((s) => s.pain);
    const rhoGames = spearman(pains, noted.map((s) => s.scores.length));
    const rhoScore = spearman(pains, noted.map((s) => mean(s.scores)));
    if (rhoGames !== null) out.correlations.push({ key: "games played", rho: rhoGames, sessions: noted.length });
    if (rhoScore !== null) out.correlations.push({ key: "session average", rho: rhoScore, sessions: noted.length });
  }

  const low = noted.filter((s) => s.pain <= 1);
  const high = noted.filter((s) => s.pain >= 2);
  if (low.length >= MIN_BUCKET_SESSIONS && high.length >= MIN_BUCKET_SESSIONS) {
    out.groups.push({
      key: "games played",
      low: summary(low.map((s) => s.scores.length)),
      high: summary(high.map((s) => s.scores.length)),
    });
    out.groups.push({
      key: "session average",
      low: summary(low.map((s) => mean(s.scores))),
      high: summary(high.map((s) => mean(s.scores))),
    });
  }
  // The fade: only nights that reached a third game can show one.
  const fade = (list) => list
    .filter((s) => s.scores.length >= 3)
    .map((s) => mean(s.scores.slice(2)) - s.scores[0]);
  const lf = fade(low);
  const hf = fade(high);
  if (lf.length >= MIN_BUCKET_SESSIONS && hf.length >= MIN_BUCKET_SESSIONS) {
    out.groups.push({ key: "fade, games 3+ minus game 1", low: summary(lf), high: summary(hf) });
  }
  return out;
}

// ---------- how long until a trend is visible ----------

/**
 * Games needed to see a change of a given size, stated with its assumptions.
 *
 * Two equal halves of the log compared at 95% confidence with 80% power: per
 * half that takes 2(z_a + z_b)^2 sd^2 / d^2 games. The spread is his own game
 * to game spread today. Frame data offers a steadier yardstick than the total:
 * marks per game, where one extra mark a game is worth roughly ten pins.
 */
export function gamesToDetect(spread, effect) {
  if (!spread || !effect) return null;
  const perHalf = Math.ceil((2 * (Z_ALPHA + Z_POWER) ** 2 * spread ** 2) / effect ** 2);
  return perHalf * 2;
}

export function detection(games, frames) {
  const totals = games.map((g) => g.score);
  const totalSd = sd(totals);
  const out = {
    totals: totalSd === null ? null : {
      games: gamesToDetect(totalSd, DETECT.pins), have: totals.length, sd: totalSd, effect: DETECT.pins, frames: false,
    },
    frames: null,
    assumption: `two equal halves of the log compared at 95% confidence with 80% power, spread held at today's game to game spread`,
  };
  if (frames && frames.games >= MIN_FRAME_GAMES && frames.marks && frames.marks.sd) {
    out.frames = {
      games: gamesToDetect(frames.marks.sd, DETECT.marks), have: frames.games, sd: frames.marks.sd, effect: DETECT.marks, frames: true,
    };
  }
  return out;
}

// ---------- everything, in one pass ----------

/**
 * The analysis behind Claude's link. `detail` is loadDetail's result; `tz` is
 * the alley's timezone, for the time of day grouping.
 */
export function analyze(detail, tz = "America/Chicago") {
  const games = detail.games;
  const sessions = sessionsOf(games, detail.pain);
  const frames = frameStats(games);
  const high = games.length ? games.reduce((a, g) => (g.score > a.score ? g : a)) : null;
  return {
    games: games.length,
    frameGames: games.filter((g) => g.framesAvailable).length,
    sessions: sessions.length,
    sessionWeighted: sessionWeighted(sessions),
    perGame: perGame(games),
    recent: recent(games),
    high: high ? { score: high.score, date: high.date, of: games.length, frames: false } : null,
    latest: games.length ? { score: games[games.length - 1].score, date: games[games.length - 1].date, frames: games[games.length - 1].framesAvailable } : null,
    position: byPosition(sessions),
    weekday: compareGroups(sessions, (g) => weekdayOf(g.date), { order: DOW }),
    timeOfDay: compareGroups(sessions, (g) => (g.loggedAt ? timeOfDay(hourIn(g.loggedAt, tz)) : null), { order: TIMES }),
    lane: compareGroups(sessions, (g) => (g.lane ? `Lane ${g.lane}` : null)),
    frameStats: frames,
    spares: spareStats(games),
    pain: painStats(sessions),
    detect: detection(games, frames),
  };
}
