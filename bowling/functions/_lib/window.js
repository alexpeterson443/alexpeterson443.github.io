// When he is actually free to bowl today.
//
// Everything else in this app reports on games already bowled. This is the one
// piece that answers the question he has before he bowls: the alley is open
// until 9:45, he has class at 2 and again at 4, so when does he go?
//
// The calendar already knows where he has to be. Subtract that from the alley's
// hours and what is left is the answer, which beats reading two schedules and
// doing the arithmetic in his head every afternoon.
//
// Pure functions only, so they can be unit tested with node.

/** A window shorter than this is not worth walking to the Union for. */
export const MIN_WINDOW_MINUTES = 45;

/**
 * Gaps between commitments where the lanes will still put a game on.
 *
 * Bounded below by now, so a window that has already passed is not offered, and
 * above by last call rather than closing time, since the alley stops seating
 * games before it shuts.
 */
export function freeWindows(busy, hours, nowMs, minMinutes = MIN_WINDOW_MINUTES) {
  if (!hours || hours.closedToday) return [];
  const { openMs, lastCallMs } = hours;
  if (typeof openMs !== "number" || typeof lastCallMs !== "number") return [];

  const from = Math.max(nowMs, openMs);
  if (lastCallMs <= from) return [];

  // Clip each commitment to the bowlable part of the day, then merge overlaps
  // so back to back classes read as one block rather than two.
  const blocks = (Array.isArray(busy) ? busy : [])
    .filter((b) => b && typeof b.start === "number" && typeof b.end === "number" && b.end > b.start)
    .map((b) => ({ start: Math.max(b.start, from), end: Math.min(b.end, lastCallMs), summary: b.summary || null }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev && b.start <= prev.end) {
      prev.end = Math.max(prev.end, b.end);
      if (!prev.summary) prev.summary = b.summary;
    } else {
      merged.push({ ...b });
    }
  }

  const gaps = [];
  let cursor = from;
  for (const b of merged) {
    if (b.start - cursor >= minMinutes * 60_000) gaps.push({ start: cursor, end: b.start, before: b.summary });
    cursor = Math.max(cursor, b.end);
  }
  if (lastCallMs - cursor >= minMinutes * 60_000) gaps.push({ start: cursor, end: lastCallMs, before: null });

  return gaps.map((g) => ({ ...g, minutes: Math.round((g.end - g.start) / 60_000) }));
}

/**
 * The window to actually aim for: the one he is standing in, otherwise the next.
 *
 * `open` marks the window that contains now, which changes the wording from a
 * plan into a nudge.
 */
export function bestWindow(windows, nowMs) {
  if (!windows.length) return null;
  const here = windows.find((w) => w.start <= nowMs && w.end > nowMs);
  const w = here || windows[0];
  return { ...w, open: !!here };
}

/**
 * The window worth showing him, or nothing.
 *
 * A window only means something when the calendar actually constrains the day.
 * With nothing on it, "free until last call" is the alley's opening hours read
 * back to him, which the countdown already carries, so a day with no
 * commitments gets no window rather than a line that says nothing.
 */
export function planWindow(busy, hours, nowMs, minMinutes = MIN_WINDOW_MINUTES) {
  if (!hours || hours.closedToday) return null;
  const { openMs, lastCallMs } = hours;
  if (typeof openMs !== "number" || typeof lastCallMs !== "number") return null;

  // Judged against the part of the day still ahead of him: a class that ended
  // this morning constrains nothing, and treating it as a constraint would
  // unlock a window equal to the alley's remaining hours.
  const from = Math.max(nowMs, openMs);
  const relevant = (Array.isArray(busy) ? busy : []).filter(
    (b) => b && typeof b.start === "number" && typeof b.end === "number" &&
      b.end > from && b.start < lastCallMs,
  );
  if (!relevant.length) return null;
  return bestWindow(freeWindows(relevant, hours, nowMs, minMinutes), nowMs);
}

/**
 * The same window in as few words as fit on one line, for the hero.
 *
 * This is the line that has to be readable without scrolling, so it carries the
 * times and nothing else.
 */
export function windowShort(w, fmt) {
  if (!w) return null;
  const length = w.minutes >= 60
    ? `${Math.floor(w.minutes / 60)}h${w.minutes % 60 ? ` ${w.minutes % 60}m` : ""}`
    : `${w.minutes}m`;
  return w.open
    ? `Free until ${fmt(w.end)} · ${length} left`
    : `Free ${fmt(w.start)} to ${fmt(w.end)} · ${length}`;
}

/**
 * One sentence naming the window, in his timezone.
 *
 * `fmt` takes an instant and returns a clock label, which keeps this function
 * free of Intl so it can be tested with fixed strings.
 */
export function windowSentence(w, fmt) {
  if (!w) return null;
  const until = fmt(w.end);
  const hours = Math.floor(w.minutes / 60);
  const mins = w.minutes % 60;
  const length = hours ? `${hours}h${mins ? ` ${mins}m` : ""}` : `${mins} minutes`;

  if (w.open) {
    const tail = w.before ? ` before ${w.before}` : "";
    return `You are free until ${until}${tail}. That is ${length} to get a game in.`;
  }
  const tail = w.before ? `, before ${w.before}` : "";
  return `Your window today is ${fmt(w.start)} to ${until}${tail}. ${length} free with the lanes open.`;
}
