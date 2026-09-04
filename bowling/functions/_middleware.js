import { keyMatches, hasValidSession, makeSessionCookie } from "./_lib/auth.js";

// Private link gate. Any request carrying ?key=<ACCESS_KEY> is allowed and
// also receives a one year cookie. The key is deliberately left in the URL so
// bookmarks and iPhone home screen icons keep working even in browsers with a
// separate cookie jar. Everyone else gets a plain 404.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (!env.ACCESS_KEY) {
    return new Response("ACCESS_KEY secret is not set.", { status: 500 });
  }

  const key = url.searchParams.get("key");
  let authed = await hasValidSession(env, request);
  let setCookie = null;

  if (key !== null) {
    if (await keyMatches(env, key)) {
      authed = true;
      setCookie = await makeSessionCookie(env, request);
    } else if (!authed) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  const noStore = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

  if (authed) {
    const res = await next();
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(noStore)) out.headers.set(k, v);
    if (setCookie) out.headers.append("Set-Cookie", setCookie);
    return out;
  }

  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: noStore });
  }
  return new Response("Not found", { status: 404, headers: noStore });
}
