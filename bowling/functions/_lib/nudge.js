// When the evening reminder is worth sending.
//
// One trigger, and only one: the day is still unsettled and the lanes are
// about to stop taking games. Everything here is pure so the decision can be
// tested without a clock, a network, or a KV namespace.

/** How far ahead of last call the reminder goes out. */
export const LEAD_MS = 2 * 60 * 60 * 1000;

/**
 * True when `nowMs` sits in the last stretch before the alley stops seating
 * games. The window closes at last call itself: after that a push would only
 * be telling him about something he can no longer do.
 *
 * A day the alley never opens has no last call and so no window. He cannot
 * bowl that day anyway, and there is no hour that is meaningfully the
 * deadline, so the reminder stays quiet and the day is his to pause.
 */
export function inNudgeWindow(hours, nowMs, leadMs = LEAD_MS) {
  if (!hours || hours.closedToday || typeof hours.lastCallMs !== "number") return false;
  return nowMs >= hours.lastCallMs - leadMs && nowMs < hours.lastCallMs;
}

/**
 * The whole decision, as `{ send, why }`. `why` is carried even when sending,
 * because the dry run endpoint is the only way to see this reasoning without
 * waiting for a real evening.
 */
export function nudgeDecision({ unsettled, hours, nowMs, leadMs = LEAD_MS }) {
  if (!hours || hours.closedToday || typeof hours.lastCallMs !== "number") {
    return { send: false, why: "the alley is closed today, so there is no deadline to warn about" };
  }
  if (!unsettled) return { send: false, why: "today already has a game or a pause" };
  if (nowMs >= hours.lastCallMs) return { send: false, why: "last call has passed" };
  if (nowMs < hours.lastCallMs - leadMs) return { send: false, why: "too early: the window has not opened" };
  return { send: true, why: "no game, no pause, and last call is close" };
}
