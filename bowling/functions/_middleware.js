import { keyMatches, hasValidSession, makeSessionCookie } from "./_lib/auth.js";

// Private link gate. The site opens only for browsers that have visited
// /?key=<ACCESS_KEY> once; that visit sets a one year cookie. Everyone else
// gets a plain 404 so the site does not even look like it exists.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (!env.ACCESS_KEY) {
    return new Response("ACCESS_KEY secret is not set.", { status: 500 });
  }

  const key = url.searchParams.get("key");
  if (key !== null) {
    if (await keyMatches(env, key)) {
      url.searchParams.delete("key");
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.pathname + (url.search || ""),
          "Set-Cookie": await makeSessionCookie(env, request),
        },
      });
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  if (await hasValidSession(env, request)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set("Cache-Control", "private, no-store");
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  }

  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
}
