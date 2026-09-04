import { hasValidSession } from "./_lib/auth.js";

// Pages serves login.html at the clean URL /login and redirects the .html form.
const PUBLIC_PATHS = new Set(["/api/login", "/login", "/login.html", "/style.css"]);

// Everything on the site is gated behind the password except the login page,
// its stylesheet, and the login endpoint itself.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (!env.PASSWORD) {
    return new Response(
      "PASSWORD secret is not set. Run: npx wrangler pages secret put PASSWORD",
      { status: 500 },
    );
  }

  if (PUBLIC_PATHS.has(url.pathname)) return next();

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

  return Response.redirect(`${url.origin}/login`, 302);
}
