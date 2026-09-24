// Frozen copy of functions/_lib/summary.js as it was before frame stats were
// added. The Streak section of the live summary must match this byte for byte.

// The state, written out as plain text for Claude to read in a chat.
//
// A chat fetches a URL and reads what comes back, so this leads with the
// answers to the questions he is likely to ask (is the streak alive, how am I
// bowling) and keeps the raw log underneath for anything else.

const REASONS = { closed: "alley closed", sick: "sick", injured: "injured", away: "away" };

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function summaryText(state, now = new Date()) {
  const s = state || {};
  const sc = s.scores || {};
  const h = s.hours || {};
  const coach = s.coach || {};
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

  out.push("## Scores");
  out.push(`- Games logged: ${sc.games ?? 0}`);
  const latest = (sc.days || [])[0];
  if (latest && latest.scores.length) out.push(`- Latest game: ${latest.scores[latest.scores.length - 1]} on ${latest.date}`);
  if (sc.average !== null && sc.average !== undefined) out.push(`- Average: ${sc.average}`);
  if (sc.high !== null && sc.high !== undefined) out.push(`- High game: ${sc.high}${sc.highDate ? ` on ${sc.highDate}` : ""}`);
  if (s.progress && s.progress.recentAverage !== null && s.progress.recentAverage !== undefined) {
    out.push(`- Recent average: ${s.progress.recentAverage}`);
  }
  if (coach.form && coach.form.text) out.push(`- Form: ${coach.form.text}`);
  if (coach.better && coach.better.answer) {
    const answer = /[.!?]$/.test(coach.better.answer) ? coach.better.answer : `${coach.better.answer}.`;
    out.push(`- Getting better? ${answer}${coach.better.because ? ` ${coach.better.because}` : ""}`);
  }
  if (coach.focus) out.push(`- Work on: ${coach.focus.title}. ${coach.focus.text || ""}`.trimEnd());
  for (const i of coach.insights || []) out.push(`- ${i.title}. ${i.text || ""}`.trimEnd());
  out.push("");

  if (h.todayLabel) {
    out.push("## Alley today");
    out.push(`- Hours: ${h.todayLabel}${h.lastCallAt ? `, last game goes on at ${h.lastCallAt}` : ""}`);
    if (h.lastCallPassed) out.push("- Last call has passed for today.");
    else if (h.open) out.push("- Open now.");
    else if (h.beforeOpen) out.push(`- Opens at ${h.opensAt}.`);
    if (coach.window && coach.window.sentence) out.push(`- ${coach.window.sentence}`);
    out.push("");
  }

  const days = sc.days || [];
  if (days.length) {
    out.push("## Games by day (newest first, last 30 days with games)");
    for (const d of days) out.push(`- ${d.date}: ${d.scores.map((n) => (n === null ? "?" : n)).join(", ")}`);
    out.push("");
  }

  return out.join("\n");
}
