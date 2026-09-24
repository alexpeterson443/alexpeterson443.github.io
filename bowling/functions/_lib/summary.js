// The state, written out as plain text for Claude to read in a chat.
//
// A chat fetches a URL and reads what comes back, so this leads with the
// answers to the questions he is likely to ask (is the streak alive, how am I
// bowling) and keeps the raw log underneath for anything else.
//
// Every stat line ends with its sample size and a tag saying where it came
// from: [totals] for game totals, [frames] for games entered frame by frame.
// The two are never pooled. A comparison whose groups do not all clear the
// session threshold in _lib/stats.js is not printed at all.
//
// The header and the Streak section are frozen: test/fixtures/summary-v1.js
// holds the version they must match byte for byte.

import { POSITIONS } from "./stats.js";

const REASONS = { closed: "alley closed", sick: "sick", injured: "injured", away: "away" };

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The whole response stays under this, trimming the games list first. */
export const MAX_CHARS = 4000;

/** Days of games listed at the end, before any trimming. */
export const GAMES_DAYS = 14;

// Numbers the way a bowler reads them: whole pins unless a half is real.
const num = (v, places = 1) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const r = Math.round(v * 10 ** places) / 10 ** places;
  return String(r);
};
const pins = (v) => num(v, v !== null && Math.abs(v - Math.round(v)) >= 0.05 ? 1 : 0);
const pct = (v) => `${Math.round(v * 100)}%`;
const signed = (v) => (v > 0 ? `+${pins(v)}` : pins(v));
const TAG = (frames) => (frames ? "[frames]" : "[totals]");

/** Header and streak, exactly as they have always been written. */
function streakPart(s, now) {
  const out = [];
  out.push("# Bowling streak");
  out.push("");
  out.push(`Data as of ${now.toISOString()} (${s.timezone || "America/Chicago"}; today is ${s.today}).`);
  out.push(`A day counts only when a game score is logged for it. The streak started ${s.start}.`);
  out.push("");

  out.push("## Streak");
  out.push(`- Current streak: ${plural(s.current ?? 0, "day")}`);
  out.push(`- Longest streak: ${plural(s.longest ?? 0, "day")}`);
  out.push(`- Day ${s.dayOfChallenge} of the challenge, ${plural(s.total ?? 0, "day")} bowled`);
  let today;
  if (s.verifiedToday) today = `bowled (${(s.scoresToday || []).join(", ") || "logged"})`;
  else if (s.excusedToday) today = `paused (${REASONS[s.excuseToday] || s.excuseToday})`;
  else if (s.atRisk) today = "not bowled yet, streak at risk";
  else today = "not bowled yet";
  out.push(`- Today: ${today}`);
  const missed = s.missed || [];
  out.push(`- Missed days: ${missed.length ? missed.join(", ") : "none"}`);
  const reasons = s.excuseReasons || {};
  const paused = Object.keys(reasons);
  if (paused.length) out.push(`- Paused days: ${paused.map((d) => `${d} (${REASONS[reasons[d]] || reasons[d]})`).join(", ")}`);
  for (const run of s.upcoming || []) {
    out.push(`- Upcoming pause: ${run.from}${run.to !== run.from ? ` to ${run.to}` : ""} (${REASONS[run.reason] || run.reason})`);
  }
  out.push("");
  return out;
}

function scoresPart(s, a) {
  const out = ["## Scores"];
  out.push("Tags: [totals] = from game totals, [frames] = from games entered frame by frame. n = sample size.");
  const framedNote = a.frameGames ? `, ${a.frameGames} of them by frame` : "";
  out.push(`- Games logged: ${a.games}${framedNote}, over ${plural(a.sessions, "session")}`);
  if (a.latest) out.push(`- Latest game: ${a.latest.score} on ${a.latest.date} (n=1) ${TAG(a.latest.frames)}`);
  const w = a.sessionWeighted;
  // A spread needs two values; with one session there is none to state.
  const sdOf = (v) => (v === null || v === undefined ? "" : `, sd ${num(v)}`);
  if (w) out.push(`- Average per session (each night counts once): ${num(w.value)}${sdOf(w.sd)} (n=${plural(w.sessions, "session")}, ${plural(w.games, "game")}) [totals]`);
  const p = a.perGame;
  if (p) out.push(`- Average per game: ${num(p.value)}${sdOf(p.sd)} (n=${plural(p.games, "game")}) [totals]`);
  const r = a.recent;
  if (r) out.push(`- Recent form: median ${pins(r.median)}, IQR ${pins(r.q1)}–${pins(r.q3)} (n=${r.n}, last ${r.n} games) [totals]`);
  if (a.high) out.push(`- High game: ${a.high.score} on ${a.high.date} (n=${a.high.of} games) [totals]`);
  const v = s.progress && s.progress.verdict;
  if (v && v.headline) out.push(`- Trend: ${v.headline.toLowerCase()} (n=${v.games} games, 95% interval on the slope) [totals]`);
  const d = a.detect;
  const have = (x) => `n=${x.have} logged${x.have >= x.games ? ", enough already" : ""}`;
  if (d && d.totals) out.push(`- Games to detect a ${d.totals.effect} pin change in average: about ${d.totals.games} (${have(d.totals)}; game to game sd ${num(d.totals.sd)}) [totals]`);
  if (d && d.frames) out.push(`- Games to detect a ${d.frames.effect} mark per game change (roughly 10 pins): about ${d.frames.games} (${have(d.frames)}; sd ${num(d.frames.sd)} marks) [frames]`);
  if (d && (d.totals || d.frames)) out.push(`- Assumes ${d.assumption}.`);
  out.push("");
  return out;
}

function framesPart(a) {
  const out = ["## Frame stats"];
  const f = a.frameStats;
  if (!f) {
    out.push("- No games entered by frame yet (n=0).");
  } else {
    out.push(`- Strikes: ${pct(f.strikeRate)} of frames (${f.strikes} of ${f.frames}; n=${plural(f.games, "game")}) [frames]`);
    out.push(`- Open frames: ${pct(f.openRate)} (${f.opens} of ${f.frames}; n=${plural(f.games, "game")}) [frames]`);
    out.push(`- First ball average: ${num(f.firstBall.mean)} pins, sd ${num(f.firstBall.sd)} (n=${plural(f.firstBall.n, "first ball")}) [frames]`);
    out.push(`- Marks per game: median ${pins(f.marks.median)}, IQR ${pins(f.marks.q1)}–${pins(f.marks.q3)} (n=${plural(f.games, "game")}) [frames]`);
    out.push(`- Score in these games: median ${pins(f.scores.median)}, IQR ${pins(f.scores.q1)}–${pins(f.scores.q3)} (n=${plural(f.games, "game")}) [frames]`);
  }
  out.push("");
  return out;
}

function sparesPart(a, { leaves = true } = {}) {
  const out = ["## Spare conversion"];
  const sp = a.spares;
  if (!sp || !sp.overall) {
    out.push("- No spare attempts entered by frame yet (n=0).");
  } else {
    const line = (label, r) => `- ${label}: ${pct(r.rate)} converted (${r.made} made; n=${r.attempts} attempts) [frames]`;
    const o = sp.overall;
    out.push(`- Overall: ${pct(o.rate)} converted (${o.made} made; n=${o.attempts} attempts in ${plural(sp.games, "game")}) [frames]`);
    for (const r of sp.byStanding) out.push(line(`${r.key} standing`, r));
    for (const r of sp.byKind) out.push(line(r.key, r));
    if (leaves) for (const r of sp.byLeave) out.push(line(`Leave ${r.key}`, r));
  }
  out.push("");
  return out;
}

function positionPart(a) {
  const out = ["## Score by game position"];
  const pos = a.position;
  for (const r of pos.rows) {
    out.push(`- ${r.key}: median ${pins(r.median)}, IQR ${pins(r.q1)}–${pins(r.q3)}, mean ${num(r.mean)} (n=${r.sessions} sessions) [totals]`);
  }
  for (const d of pos.drops) {
    out.push(`- ${d.key} minus game 1, same night: median ${signed(d.median)} pins, IQR ${signed(d.q1)} to ${signed(d.q3)} (n=${d.sessions} sessions) [totals]`);
  }
  if (!pos.rows.length && !pos.drops.length) out.push(`- No game position has ${pos.min} sessions yet.`);
  out.push("");
  return out;
}

function comparisonsPart(a) {
  // Only groups that cleared the threshold are in these rows at all, and a
  // comparison with fewer than two of them has no rows. Nothing to hedge.
  const out = [];
  for (const [label, cmp] of [["Weekday", a.weekday], ["Time of day", a.timeOfDay], ["Lane", a.lane]]) {
    for (const r of cmp.rows) {
      out.push(`- ${label} ${r.key}: median ${pins(r.median)}, IQR ${pins(r.q1)}–${pins(r.q3)} (n=${r.sessions} sessions) [totals]`);
    }
  }
  return out.length ? ["## Comparisons", ...out, ""] : [];
}

function painPart(a) {
  const out = ["## Pain correlation"];
  const p = a.pain;
  if (!p.sessions) {
    out.push("- No nights with pain recorded yet (n=0).");
  } else {
    out.push(`- Nights with pain recorded: ${p.sessions}`);
    for (const c of p.correlations) {
      out.push(`- Pain vs ${c.key}: Spearman rho ${num(c.rho, 2)} (n=${c.sessions} sessions) [totals]`);
    }
    for (const g of p.groups) {
      out.push(`- ${g.key[0].toUpperCase()}${g.key.slice(1)}, pain 0–1 vs 2–3: median ${pins(g.low.median)} vs ${pins(g.high.median)} (n=${g.low.n} vs ${g.high.n} sessions) [totals]`);
    }
    if (!p.correlations.length && !p.groups.length) {
      out.push(`- Correlations start at ${p.minAll} nights with pain recorded and ${p.min} nights at each level.`);
    }
  }
  out.push("");
  return out;
}

function alleyPart(s) {
  const h = s.hours || {};
  const coach = s.coach || {};
  const out = [];
  if (h.todayLabel) {
    out.push("## Alley today");
    out.push(`- Hours: ${h.todayLabel}${h.lastCallAt ? `, last game goes on at ${h.lastCallAt}` : ""}`);
    if (h.lastCallPassed) out.push("- Last call has passed for today.");
    else if (h.open) out.push("- Open now.");
    else if (h.beforeOpen) out.push(`- Opens at ${h.opensAt}.`);
    if (coach.window && coach.window.sentence) out.push(`- ${coach.window.sentence}`);
    out.push("");
  }
  return out;
}

function gamesPart(s, days) {
  const sc = s.scores || {};
  const framed = (s.games && s.games.frames) || {};
  const list = (sc.days || []).slice(0, days);
  if (!list.length) return [];
  const out = [`## Games by day (newest first, last ${plural(list.length, "day")} with games; * = entered by frame)`];
  for (const d of list) {
    const flags = framed[d.date] || [];
    out.push(`- ${d.date}: ${d.scores.map((n, i) => (n === null ? "?" : `${n}${flags[i] ? "*" : ""}`)).join(", ")}`);
  }
  out.push("");
  return out;
}

/** The pre analysis summary, for a state that carries no analysis at all. */
function legacyScores(s) {
  const sc = s.scores || {};
  const out = ["## Scores"];
  out.push(`- Games logged: ${sc.games ?? 0}`);
  if (sc.average !== null && sc.average !== undefined) out.push(`- Average per game: ${sc.average} (n=${sc.games ?? 0} games) [totals]`);
  if (sc.high !== null && sc.high !== undefined) out.push(`- High game: ${sc.high}${sc.highDate ? ` on ${sc.highDate}` : ""} [totals]`);
  out.push("");
  return out;
}

export function summaryText(state, now = new Date()) {
  const s = state || {};
  const a = s.analysis;
  const head = streakPart(s, now);

  const build = (days, opts = {}) => {
    const body = a
      ? [...scoresPart(s, a), ...framesPart(a), ...sparesPart(a, opts), ...positionPart(a), ...comparisonsPart(a), ...painPart(a)]
      : legacyScores(s);
    return [...head, ...body, ...alleyPart(s), ...gamesPart(s, days)].join("\n");
  };

  // Under MAX_CHARS: the games list gives way first, a day at a time, then the
  // per leave rows. The streak and the stat lines are what the link is for.
  for (let days = GAMES_DAYS; days >= 3; days--) {
    const text = build(days);
    if (text.length <= MAX_CHARS) return text;
  }
  return build(3, { leaves: false }).slice(0, MAX_CHARS);
}
