import { mcpKeyFor, rotateMcpKey } from "../_lib/mcpkey.js";

// GET  /api/mcpkey -> the connector key and the URL to add to Claude
// POST /api/mcpkey -> retire it and mint a new one
//
// Only the private link or its cookie gets here; the connector key itself only
// opens /api/mcp.
function view(request, key) {
  const origin = new URL(request.url).origin;
  return { key, url: `${origin}/api/mcp?key=${key}` };
}

export async function onRequestGet({ request, env }) {
  return Response.json(view(request, await mcpKeyFor(env)));
}

export async function onRequestPost({ request, env }) {
  return Response.json(view(request, await rotateMcpKey(env)));
}
