import { readKeyFor, rotateReadKey } from "../_lib/readkey.js";

// GET  /api/readkey -> the read only key and the link to give Claude
// POST /api/readkey -> retire it and mint a new one
//
// Only the private link or its cookie gets here. The read key itself cannot:
// the middleware keeps it to the read endpoints.
function view(request, key) {
  const origin = new URL(request.url).origin;
  return {
    key,
    url: `${origin}/api/claude?key=${key}`,
    jsonUrl: `${origin}/api/state?key=${key}`,
  };
}

export async function onRequestGet({ request, env }) {
  return Response.json(view(request, await readKeyFor(env)));
}

export async function onRequestPost({ request, env }) {
  return Response.json(view(request, await rotateReadKey(env)));
}
