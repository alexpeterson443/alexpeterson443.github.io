// Pure helpers for game scores. Scores are stored as { "YYYY-MM-DD": [n, n] }.

export function isValidScore(n) {
  return Number.isInteger(n) && n >= 0 && n <= 300;
}

/** Flatten to a list of games, newest date first, in the order bowled. */
export function gameList(scores) {
  const out = [];
  for (const date of Object.keys(scores).sort().reverse()) {
    scores[date].forEach((score, index) => out.push({ date, index, score }));
  }
  return out;
}

export function scoreStats(scores) {
  const all = Object.values(scores).flat();
  const games = all.length;
  const high = games ? Math.max(...all) : null;
  const average = games ? Math.round(all.reduce((a, b) => a + b, 0) / games) : null;
  const highDate = high === null ? null
    : Object.keys(scores).sort().find((d) => scores[d].includes(high));
  return { games, high, highDate, average, list: gameList(scores).slice(0, 20) };
}
