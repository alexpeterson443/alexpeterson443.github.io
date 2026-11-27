import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { summaryText } from "../_lib/summary.js";
import { liveKv } from "../_lib/live.js";
import { EXCUSE_REASONS } from "../_lib/streak.js";
import { onRequestPost as scorePost, onRequestDelete as scoreDelete } from "./score.js";
import { onRequestPost as excusePost, onRequestDelete as excuseDelete } from "./excuse.js";

// POST /api/mcp -> a Model Context Protocol server, so Claude can see and
// change the streak from any chat.
//
// Streamable HTTP, stateless, JSON responses only (no SSE). The middleware has
// already checked the full access key (in ?key= or X-Access-Key) before this
// runs: the connector key (see _lib/mcpkey.js) or the private link's key, on
// every request, never the session cookie. The read only key cannot get in.
//
// Every write goes through the same handler the app and the iPhone app use, so
// a game Claude logs is validated exactly like one typed at the alley.

const PROTOCOL = "2025-06-18";
const SUPPORTED = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);
const SERVER = { name: "bowling-streak", version: "1.0.0" };

const date = { type: "string", description: "Night as YYYY-MM-DD (Central time). Defaults to today." };

export const TOOLS = [
  {
    name: "get_streak",
    description:
      "Everything about the bowling streak as plain text: current and best streak, today's status, " +
      "missed and paused days, average, high game, form, alley hours, and recent games.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_games",
    description:
      "Games and paused days as data. Returns each night's scores in the order they were bowled " +
      "(the position is the index delete_game takes), plus paused days and their reasons.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "First night to include, YYYY-MM-DD. Defaults to 30 days ago." },
        to: { type: "string", description: "Last night to include, YYYY-MM-DD. Defaults to today." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "log_game",
    description: "Log one bowled game. A scored game is what counts a night toward the streak.",
    inputSchema: {
      type: "object",
      properties: {
        score: { type: "integer", minimum: 0, maximum: 300, description: "Final score, 0 to 300." },
        date,
        frames: {
          type: "array",
          minItems: 10,
          maxItems: 10,
          description: "Optional frame by frame entry. Pins per ball; b3 only in the 10th. Must add up to score.",
          items: {
            type: "object",
            properties: { b1: { type: "integer" }, b2: { type: ["integer", "null"] }, b3: { type: ["integer", "null"] } },
            required: ["b1"],
          },
        },
      },
      required: ["score"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_game",
    description: "Remove one game. Use get_games first: index is the game's position on that night, starting at 0.",
    inputSchema: {
      type: "object",
      properties: { date: { ...date, description: "Night as YYYY-MM-DD." }, index: { type: "integer", minimum: 0 } },
      required: ["date", "index"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
  },
  {
    name: "pause_days",
    description:
      "Pause a day or a run of days when bowling is not possible. Paused days keep the streak alive " +
      "without adding to it. Future days are allowed (a trip). At most 60 days at once.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "First day, YYYY-MM-DD." },
        to: { type: "string", description: "Last day, YYYY-MM-DD. Defaults to from." },
        reason: { type: "string", enum: EXCUSE_REASONS, description: "Why: closed, lanes, sick, injured, away or time." },
      },
      required: ["from", "reason"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
  },
  {
    name: "unpause_days",
    description: "Remove a pause from a day or a run of days.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "First day, YYYY-MM-DD." },
        to: { type: "string", description: "Last day, YYYY-MM-DD. Defaults to from." },
      },
      required: ["from"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: true },
  },
];

const rpc = (id, result) => Response.json({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const text = (t, isError = false) => ({ content: [{ type: "text", text: t }], isError });

/** Runs one of the app's own handlers with a JSON body and returns its JSON. */
async function viaHandler(handler, env, method, payload) {
  const req = new Request("https://bowling.internal/api", { method, body: JSON.stringify(payload) });
  const res = await handler({ request: req, env });
  return { ok: res.ok, json: await res.json().catch(() => ({})) };
}

function addDaysIso(iso, delta) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

async function readState(env, analysis) {
  const live = { ...env, STREAK_KV: liveKv(env.STREAK_KV, env.LIVE_DB) };
  const cfg = await configFor(live);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  return { cfg, scores, state: await buildState(cfg, days, scores, null, { analysis }) };
}

/** After a write, one line the model can repeat back. */
function after(state, what) {
  const s = state || {};
  const days = (n) => (n === 1 ? "1 day" : `${n ?? "?"} days`);
  const parts = [what, `Streak: ${days(s.current)} (best ${days(s.longest)}).`];
  if (s.verifiedToday) parts.push("Today is bowled.");
  else if (s.excusedToday) parts.push("Today is paused.");
  else if (s.atRisk) parts.push("Today still needs a game.");
  return parts.join(" ");
}

export async function callTool(env, name, args = {}) {
  switch (name) {
    case "get_streak": {
      const { state } = await readState(env, true);
      return text(summaryText(state));
    }
    case "get_games": {
      const { state, scores } = await readState(env, false);
      const today = state.today;
      const to = args.to || today;
      const from = args.from || addDaysIso(to, -30);
      const games = Object.keys(scores)
        .filter((d) => d >= from && d <= to)
        .sort()
        .map((d) => ({ date: d, scores: scores[d] }));
      const paused = Object.entries(state.excuseReasons || {})
        .filter(([d]) => d >= from && d <= to)
        .map(([d, reason]) => ({ date: d, reason }));
      const upcoming = (state.upcoming || []).map((r) => ({ from: r.from, to: r.to, reason: r.reason }));
      return text(JSON.stringify({ today, start: state.start, current: state.current, longest: state.longest, games, paused, upcoming }, null, 2));
    }
    case "log_game": {
      const r = await viaHandler(scorePost, env, "POST", {
        score: args.score,
        date: args.date,
        frames: args.frames,
        id: `mcp:${crypto.randomUUID()}`,
      });
      if (!r.ok) return text(`Not logged: ${r.json.error || "rejected"}`, true);
      return text(after(r.json, `Logged ${args.score} for ${args.date || r.json.today}.`));
    }
    case "delete_game": {
      const r = await viaHandler(scoreDelete, env, "DELETE", { date: args.date, index: args.index });
      if (!r.ok) return text(`Not deleted: ${r.json.error || "rejected"}`, true);
      return text(after(r.json, `Deleted game ${args.index + 1} on ${args.date}.`));
    }
    case "pause_days": {
      const r = await viaHandler(excusePost, env, "POST", { from: args.from, to: args.to, reason: args.reason });
      if (!r.ok) return text(`Not paused: ${r.json.error || "rejected"}`, true);
      return text(after(r.json, `Paused ${args.from}${args.to && args.to !== args.from ? ` to ${args.to}` : ""} (${args.reason}).`));
    }
    case "unpause_days": {
      const r = await viaHandler(excuseDelete, env, "DELETE", { from: args.from, to: args.to });
      if (!r.ok) return text(`Not changed: ${r.json.error || "rejected"}`, true);
      return text(after(r.json, `Removed the pause on ${args.from}${args.to && args.to !== args.from ? ` to ${args.to}` : ""}.`));
    }
    default:
      return null;
  }
}

export async function onRequestPost({ request, env }) {
  let msg;
  try {
    msg = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (Array.isArray(msg)) return rpcError(null, -32600, "Batches are not supported");
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return rpcError(msg?.id, -32600, "Invalid request");

  // Notifications (no id) get an empty 202, as the transport requires.
  if (msg.id === undefined || msg.id === null) return new Response(null, { status: 202 });

  switch (msg.method) {
    case "initialize": {
      const asked = msg.params?.protocolVersion;
      return rpc(msg.id, {
        protocolVersion: SUPPORTED.has(asked) ? asked : PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions:
          "Alex's daily bowling streak. A night counts once a scored game is logged; paused days bridge the streak. " +
          "Dates are YYYY-MM-DD in Central time. Use get_games before delete_game to find the index.",
      });
    }
    case "ping":
      return rpc(msg.id, {});
    case "tools/list":
      return rpc(msg.id, { tools: TOOLS });
    case "tools/call": {
      const name = msg.params?.name;
      try {
        const result = await callTool(env, name, msg.params?.arguments || {});
        if (!result) return rpcError(msg.id, -32602, `Unknown tool: ${name}`);
        return rpc(msg.id, result);
      } catch (e) {
        return rpc(msg.id, text(`Failed: ${e.message}`, true));
      }
    }
    default:
      return rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

// The transport allows a server to refuse the optional GET stream.
export function onRequestGet() {
  return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
}
