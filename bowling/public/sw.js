// Offline shell.
//
// The gated HTML is served `no-store`, so with no signal the app would not open
// at all and there would be no form to log a game into. This keeps a copy of the
// shell so the app always starts; the numbers inside it still come from the API,
// and anything logged while offline waits in the outbox until there is signal.
//
// Only the shell is cached. No scores, no state, no API response ever lands here.

const CACHE = "bowl-shell-v3";
const SHELL = ["/style.css", "/app.js", "/icon-180.png"];

self.addEventListener("install", (e) => {
  // Best effort: a missing asset must not block the worker from installing.
  //
  // The page is precached here rather than waiting for a navigation to pass
  // through the worker. On a first visit the worker is not yet controlling the
  // page, so without this the very first offline launch would find nothing.
  // The request carries the session cookie, so it returns the real page; a 404
  // means the device is not linked and there is nothing worth keeping.
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await Promise.allSettled(SHELL.map((u) => c.add(u)));
      await fetch("/", { credentials: "same-origin" })
        .then((res) => (res.ok ? c.put("/shell", res) : null))
        .catch(() => {});
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // The API is live data and the outbox already handles it failing. Never cache.
  if (url.pathname.startsWith("/api/") || url.pathname === "/manifest.webmanifest") return;

  // The page itself: always prefer the network so a deploy lands immediately,
  // and fall back to the last good copy when there is nothing to reach.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("/shell", copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/shell").then((hit) => hit || Response.error())),
    );
    return;
  }

  // Assets: serve what is on hand so a cold basement launch is instant, and
  // refresh in the background so the next launch has the current build.
  if (SHELL.includes(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const live = fetch(req)
          .then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone())).catch(() => {});
            return res;
          })
          .catch(() => hit);
        return hit || live;
      }),
    );
  }
});
