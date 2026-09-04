import { keyMatches, hasValidSession, makeSessionCookie } from "./_lib/auth.js";

// Assets that reveal nothing are public so installs and icons always work.
// The HTML page, the API, and the manifest stay gated.
const PUBLIC = new Set(["/ping", "/style.css", "/app.js", "/icon-180.png", "/icon-512.png"]);

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; " +
    "base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function withHeaders(res, extra) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) out.headers.set(k, v);
  return out;
}

// Private link gate. Any request carrying the key (?key= in the URL, or the
// X-Access-Key header from the app's own fetches) is allowed and receives a
// one year cookie. The key is deliberately left in the page URL so bookmarks
// and iPhone home screen icons keep working even with a separate cookie jar.
// Everyone else gets a plain 404.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (PUBLIC.has(url.pathname)) return withHeaders(await next(), {});

  if (!env.ACCESS_KEY) {
    return new Response("ACCESS_KEY secret is not set.", { status: 500 });
  }

  const key = url.searchParams.get("key") ?? request.headers.get("X-Access-Key");
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
    const out = withHeaders(await next(), noStore);
    if (setCookie) out.headers.append("Set-Cookie", setCookie);
    return out;
  }

  if (url.pathname.startsWith("/api/")) {
    return withHeaders(Response.json({ error: "unauthorized" }, { status: 401 }), noStore);
  }
  return withHeaders(new Response("Not found", { status: 404 }), noStore);
}
