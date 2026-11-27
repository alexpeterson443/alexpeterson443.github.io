import { keyMatches, hasValidSession, makeSessionCookie, timerMatches, closuresTokenMatches } from "./_lib/auth.js";
import { READ_PATHS, readKeyMatches } from "./_lib/readkey.js";
import { MCP_PATH, mcpKeyMatches } from "./_lib/mcpkey.js";

// Assets that reveal nothing are public so installs and icons always work.
// The HTML page, the API, and the manifest stay gated.
const PUBLIC = new Set(["/ping", "/style.css", "/app.js", "/frames-core.js", "/sw.js", "/icon-180.png", "/icon-512.png"]);

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
// X-Access-Key header from the app's own fetches) is allowed. Only the ?key=
// form, the private link opened in a browser, receives a one year cookie. The key is deliberately left in the page URL so bookmarks
// and iPhone home screen icons keep working even with a separate cookie jar.
// The read only key (see _lib/readkey.js) opens GET on the read endpoints and
// nothing more. Everyone else gets a plain 404.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (PUBLIC.has(url.pathname)) return withHeaders(await next(), {});

  if (!env.ACCESS_KEY) {
    return new Response("ACCESS_KEY secret is not set.", { status: 500 });
  }

  // The notification timer (nudge/) gets one door: a plain POST to /api/nudge,
  // which decides for itself whether anything is due. It cannot force a send,
  // read anything back beyond that decision, or get a session cookie.
  if (
    request.method === "POST" && url.pathname === "/api/nudge" && !url.search &&
    (await timerMatches(env, request.headers.get("X-Nudge-Token")))
  ) {
    return withHeaders(await next(), { "Cache-Control": "private, no-store" });
  }

  // Alley closures get the same kind of door: a plain POST to /api/closures
  // with the X-Closures-Token header. It can set or lift a closure and nothing
  // else, and never gets a session cookie.
  if (
    request.method === "POST" && url.pathname === "/api/closures" && !url.search &&
    (await closuresTokenMatches(env, request.headers.get("X-Closures-Token")))
  ) {
    return withHeaders(await next(), { "Cache-Control": "private, no-store" });
  }

  const noStore = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
  const queryKey = url.searchParams.get("key");
  const key = queryKey ?? request.headers.get("X-Access-Key");

  // The Claude connector: a key on every request (its own connector key, or
  // the private link's), never the session cookie, so another page can't
  // drive it with the browser's cookie. It never gets a cookie either.
  if (url.pathname === MCP_PATH) {
    const ok = key !== null && (
      (request.method === "POST" && (await mcpKeyMatches(env, key))) || (await keyMatches(env, key))
    );
    if (ok) return withHeaders(await next(), noStore);
    if (key !== null) await new Promise((r) => setTimeout(r, 800));
    return withHeaders(Response.json({ error: "unauthorized" }, { status: 401 }), noStore);
  }

  let authed = await hasValidSession(env, request);
  let setCookie = null;

  if (key !== null) {
    if (await keyMatches(env, key)) {
      authed = true;
      // Only the private link in a browser needs a cookie. Apps and scripts
      // send the key on every request, and a cookie would outlive the key.
      if (queryKey !== null) setCookie = await makeSessionCookie(env, request);
    } else if (
      !authed && request.method === "GET" && READ_PATHS.has(url.pathname) && (await readKeyMatches(env, key))
    ) {
      // The read only key, for Claude in a chat: those two reads and nothing
      // else, and no cookie, so it can never become a session that writes.
      authed = true;
    } else if (!authed) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

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
