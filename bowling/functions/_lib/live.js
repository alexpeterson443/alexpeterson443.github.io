// A strongly consistent copy of the streak's records, for Claude's link.
//
// KV is eventually consistent: a reader in another data centre can see a value
// up to 30 seconds old, and no setting goes lower. D1 with read replication
// off answers every query from its primary, so a write is visible to the very
// next read wherever it comes from.
//
// KV stays the app's store. Every save of these records is copied here as well,
// and /api/claude reads from here first. A failed copy never fails the save;
// the next save of that record puts it right.

export const LIVE_KEYS = new Set(["checkins", "scores", "excused", "settings"]);

export async function mirror(env, key, value) {
  if (!env.LIVE_DB || !LIVE_KEYS.has(key)) return;
  try {
    if (value === null) {
      await env.LIVE_DB.prepare("DELETE FROM live WHERE key = ?").bind(key).run();
    } else {
      await env.LIVE_DB.prepare(
        "INSERT INTO live (key, value, updated) VALUES (?, ?, ?) " +
          "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated = excluded.updated",
      ).bind(key, value, Date.now()).run();
    }
  } catch {
    // KV already has it; this copy is a convenience for reads, not the record.
  }
}

/**
 * A KV stand in that reads the mirrored records from D1. A record D1 has never
 * seen comes from KV and is copied across once, without overwriting a save that
 * got there first.
 */
export function liveKv(kv, db) {
  const get = async (key, opts) => {
    const type = typeof opts === "string" ? opts : opts && opts.type;
    if (db && LIVE_KEYS.has(key)) {
      try {
        const row = await db.prepare("SELECT value FROM live WHERE key = ?").bind(key).first();
        if (row) return type === "json" ? JSON.parse(row.value) : row.value;
        const text = await kv.get(key, { type: "text", cacheTtl: 30 });
        if (text !== null) {
          await db.prepare("INSERT OR IGNORE INTO live (key, value, updated) VALUES (?, ?, ?)")
            .bind(key, text, Date.now()).run();
        }
        return text === null ? null : type === "json" ? JSON.parse(text) : text;
      } catch {
        // Fall through to KV if D1 is unreachable.
      }
    }
    return kv.get(key, { type: type || "text", cacheTtl: 30 });
  };
  return {
    get,
    put: (key, value, opts) => kv.put(key, value, opts),
    delete: (key) => kv.delete(key),
    list: (opts) => kv.list(opts),
  };
}
