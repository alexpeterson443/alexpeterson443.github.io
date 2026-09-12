// The adaptive layer.
//
// progress.js answers "what do the numbers say". This answers "so what", and
// the whole point is that the answer changes. Every observation here carries a
// guard: it is emitted only when the log actually supports it, and it is
// weighted so the app can lead with whatever matters tonight rather than
// showing the same four tiles forever.
//
// Nothing here flatters. A wider spread, a falling floor and a volume drop all
// get said as plainly as a personal best does, because a tracker that only
// reports good news is a tracker you stop believing.
//
// Pure functions only, so they can be unit tested with node.

import { gameSeries, spread, trend, tCritical, ROLL_WINDOW, MIN_TREND_GAMES } from "./progress.js";

/** Games that count as "right now". Three is a series. */
export const FORM_WINDOW = 3;

/** Games before that which form the baseline current form is judged against. */
export const BASE_WINDOW = 12;

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function mean(list) {
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}

function weekdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** The log grouped into sessions, oldest first. One session is one date. */
export function sessions(series) {
  const out = [];
  for (const g of series) {
    const last = out[out.length - 1];
    if (last && last.date === g.date) last.scores.push(g.score);
    else out.push({ date: g.date, scores: [g.score] });
  }
  return out;
}

/**
 * Current form: are the last few games actually different from what came
 * before, or is this the same bowler having a normal night?
 *
 * The comparison is scaled by his own scatter, so "hot" means the last three
 * games are far enough above the baseline that noise does not explain them.
 * With a spread near 25 pins that takes about 15 pins of improvement, which is
 * the honest bar. Anything less is "steady", and saying so is the point.
 */
export function form(series) {
  const n = series.length;
  if (n < FORM_WINDOW + 4) return { state: "unknown", games: n, text: null };

  const values = series.map((g) => g.score);
  const recent = values.slice(-FORM_WINDOW);
  const base = values.slice(Math.max(0, n - FORM_WINDOW - BASE_WINDOW), n - FORM_WINDOW);
  const rm = mean(recent);
  const bm = mean(base);
  const sd = spread(base);
  const gap = Math.round(rm - bm);

  if (sd === null || sd === 0) {
    return { state: "steady", games: n, gap, z: 0, text: `Last ${FORM_WINDOW} games are level with the ${base.length} before them.` };
  }

  // Standard error of a mean of FORM_WINDOW games drawn from that scatter.
  const z = (rm - bm) / (sd / Math.sqrt(FORM_WINDOW));
  const out = { games: n, gap, z: Math.round(z * 100) / 100, window: FORM_WINDOW, baseline: Math.round(bm), recent: Math.round(rm) };

  if (z >= 1) return { ...out, state: "hot", text: `Hot. Last ${FORM_WINDOW} games average ${Math.round(rm)}, ${gap} above the ${base.length} before them.` };
  if (z <= -1) return { ...out, state: "cold", text: `Cold patch. Last ${FORM_WINDOW} games average ${Math.round(rm)}, ${Math.abs(gap)} below the ${base.length} before them.` };
  return { ...out, state: "steady", text: `Steady. Last ${FORM_WINDOW} games are inside your normal spread of the ${base.length} before them.` };
}

/**
 * What the most recent game did.
 *
 * This is the line worth reading straight after logging: where the game ranks,
 * and which way it moved the average. A game below the average lowers it, and
 * the app says so.
 */
export function lastGame(series) {
  const n = series.length;
  if (!n) return null;
  const g = series[n - 1];
  const values = series.map((s) => s.score);
  const sum = values.reduce((a, b) => a + b, 0);
  const before = n > 1 ? (sum - g.score) / (n - 1) : null;
  const after = sum / n;
  const better = values.filter((v) => v > g.score).length;
  return {
    date: g.date,
    score: g.score,
    game: g.seat + 1,
    rank: better + 1,
    of: n,
    isBest: better === 0 && n > 1,
    average: Math.floor(after),
    // Movement in the displayed average, which is what he actually sees change.
    moved: before === null ? null : Math.floor(after) - Math.floor(before),
    aboveAverage: before === null ? null : g.score > before,
  };
}

/**
 * The exact score needed in the next game to push the displayed average up a
 * pin, and how many games at current form it would take instead.
 *
 * A lifetime average is slow by construction, and this is the number that makes
 * it concrete: not "keep going" but "throw a 138 tonight".
 */
export function averageTarget(series, recentAverage = null) {
  const n = series.length;
  if (!n) return null;
  const sum = series.reduce((a, g) => a + g.score, 0);
  const exact = sum / n;
  const shown = Math.floor(exact);
  const target = shown + 1;
  const need = Math.ceil(target * (n + 1) - sum);

  const out = { average: shown, target, need, reachable: need <= 300 };
  if (need <= 300) return out;

  // Out of reach in one game, so say how many games at current form it takes.
  const rate = recentAverage === null ? exact : recentAverage;
  if (rate > target) out.games = Math.ceil((n * (target - exact)) / (rate - target));
  return out;
}

/**
 * Games needed before the trend becomes readable, if he keeps bowling exactly
 * like this.
 *
 * The interval on the slope is t * residual / sqrt(Sxx), and for games numbered
 * 1..n Sxx is n(n squared minus one)/12. Hold the slope and the scatter he
 * already has, and the sample size where that interval stops straddling zero
 * falls out. The search walks upward rather than solving for n, so it uses the
 * same t table the verdict does and can never come back with a sample size he
 * has already passed. A projection, not a promise, and it moves every time he
 * bowls.
 */
export function trendEta(series, cap = 400) {
  const t = trend(series);
  if (!t || !t.stderr || t.slope === 0) return null;
  const n = series.length;
  const sxx = (n * (n * n - 1)) / 12;
  if (!sxx) return null;
  const residual = t.stderr * Math.sqrt(sxx);   // scatter around the fitted line
  for (let at = n + 1; at <= cap; at++) {
    const crit = tCritical(at - 2);
    if (crit === null) continue;
    if (Math.abs(t.slope) > crit * (residual / Math.sqrt((at * (at * at - 1)) / 12))) {
      return { games: at - n, at, direction: t.slope > 0 ? "up" : "down" };
    }
  }
  return null;
}

/** Longest run of games at the end of the log on one side of the average. */
function tailRun(series) {
  const values = series.map((g) => g.score);
  const avg = mean(values);
  if (avg === null || !values.length) return null;
  const above = values[values.length - 1] > avg;
  let run = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if ((values[i] > avg) !== above) break;
    run++;
  }
  return { above, run, average: Math.floor(avg) };
}

/**
 * The warm up gap, measured only between seats with real repetition behind them.
 *
 * The endpoint gap will not do. One eight game night creates a game 6 and a
 * game 7 bowled twice each, and letting those define the gap reads noise off
 * the end of the list: it can invent a cold start he does not have, or hide a
 * real one behind a thin seat that happened to score badly.
 */
export function warmupGap(rows, minSessions = 3) {
  const solid = rows.filter((r) => r.sessions >= minSessions);
  if (solid.length < 2) return null;
  const from = solid[0];
  const to = solid[solid.length - 1];
  return { gap: to.average - from.average, from, to, seats: solid.length };
}

/** Average by weekday, for weekdays bowled at least `minSessions` times. */
export function byWeekday(series, minSessions = 2) {
  const groups = new Map();
  for (const s of sessions(series)) {
    const d = weekdayOf(s.date);
    if (!groups.has(d)) groups.set(d, { scores: [], sessions: 0 });
    const g = groups.get(d);
    g.scores.push(...s.scores);
    g.sessions++;
  }
  const rows = [];
  for (const [day, g] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    if (g.sessions < minSessions) continue;
    rows.push({ day, label: DOW[day], sessions: g.sessions, games: g.scores.length, average: Math.round(mean(g.scores)) });
  }
  return rows;
}

/**
 * Ranked observations. Each one is guarded, so a thin log produces a short list
 * and a rich log produces a different list next week.
 *
 * Weights are how much the finding is worth to him, not how flattering it is.
 */
export function insights(scores, report) {
  const series = gameSeries(scores);
  const n = series.length;
  const out = [];
  if (!n) return out;

  const values = series.map((g) => g.score);
  const push = (o) => out.push(o);

  // The floor. For a beginner this is the first thing that really moves: the
  // bad games stop being as bad well before the good games get better.
  if (n >= 8) {
    const half = Math.min(ROLL_WINDOW, Math.floor(n / 2));
    const recent = values.slice(-half);
    const earlier = values.slice(0, half);
    const rise = Math.min(...recent) - Math.min(...earlier);
    if (rise >= 5) {
      push({
        id: "floor", weight: 74, tone: "good", title: "Your bad games are getting better",
        text: `Your worst game in the last ${half} was ${Math.min(...recent)}. In your first ${half} it was ${Math.min(...earlier)}. Your bad nights are getting less bad, which your average is far too slow to show.`,
      });
    } else if (rise <= -8) {
      push({
        id: "floor", weight: 66, tone: "bad", title: "Your bad games got worse",
        text: `Your worst game in the last ${half} was ${Math.min(...recent)}, down from ${Math.min(...earlier)}. Your bad nights got worse, not better.`,
      });
    }
  }

  // Consistency. A tighter spread at the same average is real progress and the
  // only kind most first seasons produce.
  if (n >= 10 && report.spread !== null && report.recentSpread !== null) {
    const early = spread(values.slice(0, Math.min(ROLL_WINDOW, Math.floor(n / 2))));
    if (early !== null && early > 0) {
      const change = report.recentSpread - Math.round(early);
      if (change <= -3) {
        push({
          id: "consistency", weight: 70, tone: "good", title: "You are more consistent",
          text: `Your last ${report.window} games land within about ${report.recentSpread} pins of each other. Early on it was ${Math.round(early)}. Being able to repeat a score is worth more than one big night.`,
        });
      } else if (change >= 4) {
        push({
          id: "consistency", weight: 60, tone: "bad", title: "You are less consistent",
          text: `Your last ${report.window} games are spread over about ${report.recentSpread} pins, against ${Math.round(early)} early on. More up and down, not better, and it makes any direction harder to see.`,
        });
      }
    }
  }

  // Warm up tax, off session position but only across well bowled seats.
  const warm = warmupGap(report.session.rows);
  const gap = warm ? warm.gap : null;
  if (warm && n >= 9 && gap >= 9) {
    push({
      id: "warmup", weight: 88, tone: "act", title: "You bowl into form",
      text: `Game ${warm.from.game} of the night averages ${warm.from.average} across ${warm.from.sessions} sessions, game ${warm.to.game} averages ${warm.to.average}. That gap is ${gap} pins you are paying for a cold start. Throw practice balls before the first game counts.`,
    });
  }

  // Volume. With a warm up gap, a one game night is structurally his worst
  // possible night, so this is the highest value thing he controls.
  const list = sessions(series);
  if (list.length >= 4) {
    const recent = list.slice(-3);
    const earlier = list.slice(0, -3);
    const rm = mean(recent.map((s) => s.scores.length));
    const em = mean(earlier.map((s) => s.scores.length));
    if (rm !== null && em !== null && rm < em - 0.6) {
      const costly = gap !== null && gap >= 9;
      push({
        id: "volume", weight: costly ? 92 : 58, tone: "act", title: "Your nights got shorter",
        text: costly
          ? `Last ${recent.length} sessions averaged ${rm.toFixed(1)} games against ${em.toFixed(1)} before. With a ${gap} pin warm up gap, a one game night is your worst night by design: you only ever log the cold one.`
          : `Last ${recent.length} sessions averaged ${rm.toFixed(1)} games against ${em.toFixed(1)} before. Fewer games means the numbers move slower.`,
      });
    } else if (rm !== null && em !== null && rm > em + 0.6) {
      push({
        id: "volume", weight: 44, tone: "good", title: "Your nights got longer",
        text: `Last ${recent.length} sessions averaged ${rm.toFixed(1)} games against ${em.toFixed(1)} before. More games is how the sample gets big enough to read.`,
      });
    }
  }

  // Ceiling, only for a best that is actually recent.
  const best = Math.max(...values);
  const bestAt = values.lastIndexOf(best);
  if (n >= 6 && bestAt >= n - ROLL_WINDOW) {
    push({
      id: "ceiling", weight: 64, tone: "good", title: "A new best game",
      text: `${best} is the best game you have bowled, and it came in your last ${n - bestAt} games. Your top end moving is worth more than an average that has not.`,
    });
  }

  // A run on one side of the average. Three is where it stops being a coin toss.
  const run = tailRun(series);
  if (run && run.run >= 3) {
    push(run.above
      ? { id: "run", weight: 56, tone: "good", title: `${run.run} straight above average`, text: `Every one of your last ${run.run} games beat your ${run.average} average. Keep bowling while this holds.` }
      : { id: "run", weight: 62, tone: "bad", title: `${run.run} straight below average`, text: `Your last ${run.run} games all came in under your ${run.average} average. Worth checking something concrete: the ball, the lane, or how tired you were.` });
  }

  // Best and worst weekday, once there is more than one session on each.
  const week = byWeekday(series);
  if (week.length >= 2) {
    const top = week.reduce((a, b) => (b.average > a.average ? b : a));
    const low = week.reduce((a, b) => (b.average < a.average ? b : a));
    if (top.average - low.average >= 12) {
      push({
        id: "weekday", weight: 50, tone: "act", title: `${top.label}s are your best`,
        text: `${top.label}s average ${top.average} across ${top.sessions} sessions, ${low.label}s ${low.average}. Not proof of anything yet, but if you get to pick a night, pick that one.`,
      });
    }
  }

  // How far off a readable trend is, which is the honest answer to "am I
  // getting better" and shrinks every time he bowls.
  if (n >= MIN_TREND_GAMES && report.verdict.state === "flat") {
    const eta = trendEta(series);
    if (eta && eta.games > 0 && eta.games <= 200) {
      push({
        id: "eta", weight: 46, tone: "flat", title: "When you will know",
        text: `Your scores swing far enough that it takes roughly ${eta.at} games logged before anyone could call the direction. That is ${eta.games} more. Bowling more games per night is the only thing that brings it closer, and steadier scores would cut it sharply.`,
      });
    }
  } else if (n < MIN_TREND_GAMES) {
    push({
      id: "eta", weight: 40, tone: "flat", title: "Too early to tell",
      text: `${MIN_TREND_GAMES - n} more ${MIN_TREND_GAMES - n === 1 ? "game" : "games"} before a direction means anything. Until then this shows you what happened, not where it is heading.`,
    });
  }

  return out.sort((a, b) => b.weight - a.weight);
}

/**
 * The plain answer to the only question he actually asks, plus the things that
 * are measurable right now even when the direction is not.
 *
 * The trend is usually the least useful number in a first season: it needs
 * hundreds of games. Consistency and the worst game move in weeks, and they
 * move for reasons he can act on, so they carry the card while the trend is
 * still unreadable. Each signal says what it is in a sentence, because a number
 * with no caption is the reason the old panel was unreadable.
 */
export function better(scores, report) {
  const series = gameSeries(scores);
  const values = series.map((g) => g.score);
  const n = values.length;
  const signals = [];

  if (n >= 8) {
    const half = Math.min(ROLL_WINDOW, Math.floor(n / 2));
    const recent = values.slice(-half);
    const early = values.slice(0, half);

    const nowSwing = spread(recent);
    const thenSwing = spread(early);
    if (nowSwing !== null && thenSwing !== null) {
      const now = Math.round(nowSwing);
      const then = Math.round(thenSwing);
      signals.push({
        id: "swing",
        label: "How steady you are",
        value: `${now} pins`,
        direction: now < then - 2 ? "better" : now > then + 2 ? "worse" : "level",
        detail: `Your last ${half} games land within about ${now} pins of each other. Over your first ${half} it was ${then}. Smaller means you can repeat it.`,
      });
    }

    const worstNow = Math.min(...recent);
    const worstThen = Math.min(...early);
    signals.push({
      id: "worst",
      label: "Your worst game lately",
      value: String(worstNow),
      direction: worstNow > worstThen + 4 ? "better" : worstNow < worstThen - 4 ? "worse" : "level",
      detail: `The worst of your last ${half} games was ${worstNow}. Early on it was ${worstThen}. Bad games getting less bad is usually the first real sign of progress.`,
    });

    const bestNow = Math.max(...recent);
    const bestEver = Math.max(...values);
    signals.push({
      id: "best",
      label: "Your best game lately",
      value: String(bestNow),
      direction: bestNow >= bestEver ? "better" : "level",
      detail: bestNow >= bestEver
        ? `${bestNow} is the best you have bowled, and it happened in your last ${half} games.`
        : `Best of your last ${half} games was ${bestNow}. Your record is ${bestEver}.`,
    });
  }

  return {
    answer: report.verdict.headline,
    because: report.verdict.text,
    detail: report.verdict.detail,
    state: report.verdict.state,
    games: n,
    signals,
  };
}

/** Targets computed from his own log rather than round numbers picked for him. */
export function milestones(scores, report) {
  const series = gameSeries(scores);
  if (!series.length) return [];
  const values = series.map((g) => g.score);
  const out = [];

  const avg = averageTarget(series, report.recentAverage);
  if (avg) {
    out.push(avg.reachable
      ? { id: "average", label: `Average ${avg.target}`, text: `Bowl ${avg.need} in your next game and your average ticks to ${avg.target}.` }
      : { id: "average", label: `Average ${avg.target}`, text: avg.games
          ? `Out of reach in one game. About ${avg.games} more games at your recent ${report.recentAverage} gets you there.`
          : `Needs better than your recent form to move. ${avg.target} is not reachable at ${report.recentAverage} a game.` });
  }

  const best = Math.max(...values);
  const recentBest = Math.max(...values.slice(-ROLL_WINDOW));
  out.push({ id: "best", label: `Beat ${best}`, text: `Your best game. Closest you have come in the last ${Math.min(ROLL_WINDOW, values.length)} games is ${recentBest}, ${best - recentBest === 0 ? "which is it" : `${best - recentBest} short`}.` });

  // The next hundred, but only when it is close enough to be a target rather
  // than a wish.
  const nextHundred = (Math.floor(best / 50) + 1) * 50;
  if (nextHundred <= 300 && nextHundred - best <= 45) {
    out.push({ id: "round", label: `First ${nextHundred}`, text: `${nextHundred - best} pins past your best game.` });
  }

  if (report.best) {
    out.push({ id: "series", label: `Series ${report.best.total + 1}`, text: `Your best three in a row is ${report.best.total}, ${Math.round(report.best.total / 3)} a game. Beating it needs three games in one night.` });
  }

  return out;
}

/**
 * What to say about tonight, given where the day sits.
 *
 * This is the part that has to change hour to hour: before the lanes open, mid
 * session with a game already on the board, after last call with nothing
 * logged. Same data, different question.
 */
export function sessionPrompt(report, ctx = {}) {
  const { verifiedToday = false, excusedToday = false, scoresToday = [], hours = null, atRisk = false } = ctx;
  const rows = report.session.rows;
  const firstGame = rows.length ? rows[0].average : null;
  const bestSeat = rows.length ? rows.reduce((a, b) => (b.average > a.average ? b : a)) : null;

  if (excusedToday) {
    return { phase: "excused", text: "Day is parked. Nothing to bowl, nothing to prove." };
  }

  if (verifiedToday) {
    const today = scoresToday.filter((n) => typeof n === "number");
    if (!today.length) return { phase: "done", text: "Today is logged." };
    const openNow = hours && hours.open && !hours.lastCallPassed;
    const n = today.length;
    if (openNow && bestSeat && n < bestSeat.game) {
      return {
        phase: "mid",
        text: `${n} game${n === 1 ? "" : "s"} in at ${Math.round(mean(today))}. Your best game of the night is usually game ${bestSeat.game} at ${bestSeat.average}. There is still time for it.`,
      };
    }
    const avg = Math.round(mean(today));
    return {
      phase: "done",
      text: `${n} game${n === 1 ? "" : "s"} tonight, averaging ${avg}. That is ${avg === report.average ? "level with" : avg > report.average ? `${avg - report.average} above` : `${report.average - avg} below`} your ${report.average} lifetime.`,
    };
  }

  // Nothing logged yet today.
  if (hours && hours.closedToday) return { phase: "shut", text: "Lanes are shut all day. Mark it closed rather than letting it read as a miss." };
  if (hours && hours.beforeOpen) {
    return {
      phase: "pre",
      text: firstGame === null
        ? `Lanes open at ${hours.opensAt}.`
        : `Lanes open at ${hours.opensAt}. Your first game of the night averages ${firstGame}, so get practice balls in before it counts.`,
    };
  }
  if (hours && hours.open && hours.lastCallPassed) {
    return { phase: "late", text: `Past last call at ${hours.lastCallAt}. You can still log a game you bowled earlier.` };
  }
  if (hours && hours.open) {
    const base = firstGame === null ? "Lanes are open." : `Lanes are open. First game of the night averages ${firstGame} for you, ${bestSeat && bestSeat.game > 1 ? `game ${bestSeat.game} averages ${bestSeat.average}` : "so plan on more than one"}.`;
    return { phase: "open", text: atRisk ? `${base} Streak needs a game today.` : base };
  }
  // No hours to reason about. Saying the lanes are shut would be a claim the
  // app cannot back, so it says only what it knows.
  if (!hours) {
    return {
      phase: "unknown",
      text: firstGame === null
        ? "Nothing logged today yet."
        : `Nothing logged today yet. Your first game of the night averages ${firstGame}.`,
    };
  }
  return { phase: "closed", text: "Lanes are closed for today." };
}

/** Everything the adaptive layer produces, in one pass. */
export function coachReport(scores, report, ctx = {}) {
  const series = gameSeries(scores);
  const f = form(series);
  const ranked = insights(scores, report);
  // The thing to actually do tonight, if the log supports naming one. It is
  // then held out of the list below, since reading it twice on one screen makes
  // it look like filler.
  const focus = ranked.find((i) => i.tone === "act") || ranked.find((i) => i.tone === "bad") || null;
  return {
    form: f,
    last: lastGame(series),
    // Sent so the bar chart and the observation quote one figure, not two.
    warmup: warmupGap(report.session.rows),
    better: better(scores, report),
    focus,
    insights: ranked.filter((i) => i !== focus).slice(0, 3),
    milestones: milestones(scores, report),
    session: sessionPrompt(report, ctx),
    weekday: byWeekday(series),
    eta: trendEta(series),
  };
}
