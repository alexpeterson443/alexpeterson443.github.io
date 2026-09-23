// Game identity, frames and per night notes, in D1.
//
// KV keeps the totals, because the streak reads them and must not change. D1
// holds everything a total cannot: which game is which, the ten frames when he
// entered them, the lane, when it was logged, and how his leg felt that night.
//
// The two are kept in step by position. KV's list for a date is the truth; the
// D1 rows for that date are matched against it game by game, and anything that
// disagrees is rebuilt from KV rather than trusted. Frames are only ever
// attached to a game whose D1 total matches the KV total at that spot, so a
// frame record can never be read against the wrong game.
//
// Every write here runs after the KV write has landed and never fails the
// request: a game that reached KV is logged, and the next sync repairs D1.

import "../../public/frames-core.js";

const F = globalThis.BowlFrames;

export const MAX_LANE = 99;

export function validLane(v) {
  return v === null || v === undefined || (Number.isInteger(v) && v >= 1 && v <= MAX_LANE);
}

export function validPain(v) {
  return v === null || (Number.isInteger(v) && v >= 0 && v <= 3);
}

/**
 * Frames sent by a client, checked and scored. {frames, score} when the game is
 * legal, {error} otherwise.
 */
export function checkFrames(frames) {
  const res = F.scoreGame(frames);
  if (res.error) return { error: res.error };
  return { frames: frames.map(F.clean), score: res.score };
}

function rowId(date, position) {
  // Unique without being derived only from the position, which can move when a
  // game earlier in the night is deleted.
  return `kv:${date}:${position}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function insertFrames(db, gameId, frames) {
  return frames.map((f, i) =>
    db.prepare(
      "INSERT OR REPLACE INTO frames (game_id, frame_number, ball1_pins, ball2_pins, ball3_pins, leave) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(gameId, i + 1, f.b1, f.b2, i === 9 ? f.b3 : null, f.leave));
}

/**
 * Bring D1's rows for one night in line with the KV list for it.
 *
 * `fresh` is the game just logged, always the last on the list: it gets its
 * client id, lane, timestamp and frames. Every other missing game gets a row
 * with its KV total and nothing else, which is how the games from before this
 * existed are brought across.
 */
export async function syncDate(db, date, kvList, fresh = null) {
  const { results: rows = [] } = await db
    .prepare("SELECT id, position, score FROM games WHERE date = ? ORDER BY position")
    .bind(date)
    .all();

  let keep = 0;
  while (keep < rows.length && keep < kvList.length
    && rows[keep].position === keep + 1 && rows[keep].score === kvList[keep]) keep++;

  const stmts = [];
  const stale = rows.slice(keep).map((r) => r.id);
  for (const id of stale) {
    stmts.push(db.prepare("DELETE FROM frames WHERE game_id = ?").bind(id));
    stmts.push(db.prepare("DELETE FROM games WHERE id = ?").bind(id));
  }
  for (let p = keep; p < kvList.length; p++) {
    const isFresh = fresh && p === kvList.length - 1;
    const id = isFresh ? fresh.id : rowId(date, p + 1);
    stmts.push(db.prepare(
      "INSERT OR IGNORE INTO games (id, date, position, score, lane, logged_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(id, date, p + 1, kvList[p], isFresh ? fresh.lane ?? null : null, isFresh ? fresh.loggedAt ?? null : null));
    if (isFresh && fresh.frames) stmts.push(...insertFrames(db, id, fresh.frames));
  }
  if (stmts.length) await db.batch(stmts);
  return { kept: keep, removed: stale.length, added: kvList.length - keep };
}

/** Take one game out of a night and close the gap it leaves. */
export async function removeGame(db, date, index, kvAfter) {
  const pos = index + 1;
  const row = await db.prepare("SELECT id FROM games WHERE date = ? AND position = ?").bind(date, pos).first();
  const stmts = [];
  if (row) {
    stmts.push(db.prepare("DELETE FROM frames WHERE game_id = ?").bind(row.id));
    stmts.push(db.prepare("DELETE FROM games WHERE id = ?").bind(row.id));
  }
  // Two steps, since position is unique within a night and SQLite checks that
  // row by row: park the later games out of the way, then bring them back one
  // lower. Parked high rather than negative, which the CHECK would refuse.
  stmts.push(db.prepare("UPDATE games SET position = position + 1000 WHERE date = ? AND position > ?").bind(date, pos));
  stmts.push(db.prepare("UPDATE games SET position = position - 1001 WHERE date = ? AND position > 1000").bind(date));
  await db.batch(stmts);
  // Whatever the rows were before, they now have to match what KV says.
  await syncDate(db, date, kvAfter);
}

/**
 * Frames for a game already logged as a total. They must add up to that
 * total: the total is what the streak and every old number were built on, so
 * frames that disagree with it are refused rather than quietly replacing it.
 */
export async function putFrames(db, date, kvList, index, frames, lane) {
  await syncDate(db, date, kvList);
  const row = await db.prepare("SELECT id, score FROM games WHERE date = ? AND position = ?").bind(date, index + 1).first();
  if (!row) return { error: "no such game" };
  const checked = checkFrames(frames);
  if (checked.error) return { error: checked.error };
  if (checked.score !== row.score) {
    return { error: `those frames add up to ${checked.score}, but this game was logged as ${row.score}` };
  }
  const stmts = [db.prepare("DELETE FROM frames WHERE game_id = ?").bind(row.id), ...insertFrames(db, row.id, checked.frames)];
  if (lane !== undefined) stmts.push(db.prepare("UPDATE games SET lane = ? WHERE id = ?").bind(lane, row.id));
  await db.batch(stmts);
  return { id: row.id, score: row.score };
}

export async function setPain(db, date, pain) {
  await db.prepare(
    "INSERT INTO sessions (date, pain) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET pain = excluded.pain",
  ).bind(date, pain).run();
}

/**
 * Every game with whatever detail D1 has for it, in KV order.
 *
 * KV decides which games exist and what they scored. D1 contributes detail only
 * where its row agrees with KV at that position; a game D1 has not caught up on
 * is still here, as a total with `framesAvailable` false. Without D1 at all the
 * result is the same shape, totals only, so nothing downstream has to care.
 */
export async function loadDetail(env, scores) {
  const games = [];
  for (const date of Object.keys(scores).sort()) {
    const list = Array.isArray(scores[date]) ? scores[date] : [];
    let position = 0;
    for (const score of list) {
      if (typeof score !== "number") continue;
      position += 1;
      games.push({ date, position, score, id: null, lane: null, loggedAt: null, frames: null, framesAvailable: false });
    }
  }
  const pain = {};
  const db = env.LIVE_DB;
  if (!db) return { games, pain, source: "kv" };

  let rows;
  let frameRows;
  let sessionRows;
  try {
    [rows, frameRows, sessionRows] = (await db.batch([
      db.prepare("SELECT id, date, position, score, lane, logged_at FROM games"),
      db.prepare("SELECT game_id, frame_number, ball1_pins, ball2_pins, ball3_pins, leave FROM frames ORDER BY game_id, frame_number"),
      db.prepare("SELECT date, pain FROM sessions WHERE pain IS NOT NULL"),
    ])).map((r) => r.results || []);
  } catch {
    // Tables not there yet, or D1 unreachable: totals only, never an error.
    return { games, pain, source: "kv" };
  }

  const byFrame = new Map();
  for (const r of frameRows) {
    if (!byFrame.has(r.game_id)) byFrame.set(r.game_id, []);
    byFrame.get(r.game_id).push({ b1: r.ball1_pins, b2: r.ball2_pins, b3: r.ball3_pins, leave: r.leave });
  }
  const byKey = new Map(rows.map((r) => [`${r.date}#${r.position}`, r]));
  for (const g of games) {
    const r = byKey.get(`${g.date}#${g.position}`);
    if (!r || r.score !== g.score) continue;
    g.id = r.id;
    g.lane = r.lane;
    g.loggedAt = r.logged_at;
    const fr = byFrame.get(r.id);
    // Frame backed means all ten frames, legal, adding up to the logged total.
    if (fr && fr.length === 10) {
      const check = F.scoreGame(fr);
      if (!check.error && check.score === g.score) {
        g.frames = fr;
        g.framesAvailable = true;
      }
    }
  }
  for (const r of sessionRows) if (validPain(r.pain) && r.pain !== null) pain[r.date] = r.pain;
  return { games, pain, source: "d1" };
}
