// Pure helpers for game scores. Stored as { "YYYY-MM-DD": [n, ...] }.
// Every game needs a real score: that is what verifies a day was bowled.
// (Older records may still hold null for a game logged without a score.)

export function isValidScore(n) {
  return Number.isInteger(n) && n >= 0 && n <= 300;
}

/** Per day summary, newest first. */
export function dayList(scores) {
  return Object.keys(scores)
    .sort()
    .reverse()
    .map((date) => ({ date, games: scores[date].length, scores: scores[date] }));
}

export function scoreStats(scores) {
  const all = Object.values(scores).flat();
  const known = all.filter((n) => n !== null);
  const games = all.length;
  const high = known.length ? Math.max(...known) : null;
  const average = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
  const highDate = high === null ? null
    : Object.keys(scores).sort().find((d) => scores[d].includes(high));
  return { games, scored: known.length, high, highDate, average, days: dayList(scores).slice(0, 30) };
}
