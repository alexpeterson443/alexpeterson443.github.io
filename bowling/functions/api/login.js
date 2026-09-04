import { passwordMatches, makeSessionCookie } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  if (!(await passwordMatches(env, body.password))) {
    // Small delay blunts brute forcing without needing rate limit infra.
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ error: "wrong password" }, { status: 401 });
  }

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": await makeSessionCookie(env, request) } },
  );
}
