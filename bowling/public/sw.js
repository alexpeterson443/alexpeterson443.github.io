// Offline shell.
//
// The gated HTML is served `no-store`, so with no signal the app would not open
// at all and there would be no form to log a game into. This keeps a copy of the
// shell so the app always starts; the numbers inside it still come from the API,
// and anything logged while offline waits in the outbox until there is signal.
//
// Only the shell is cached. No scores, no state, no API response ever lands here.

const CACHE = "bowl-shell-v9";
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

// The evening nudge.
//
// The push carries no payload, only the fact that the server thinks tonight is
// at risk. That is deliberate: a payload would mean implementing RFC 8291
// encryption, and the worker can simply ask the API what the state is, using
// the same session cookie the app uses. It also means the wording is decided
// here, at the moment it is shown, rather than however long ago the push was
// queued.
self.addEventListener("push", (e) => {
  e.waitUntil(nudge());
});

async function nudge() {
  let title = "No game logged today";
  let body = "The lanes stop taking games soon.";

  try {
    const res = await fetch("/api/state", { credentials: "same-origin", cache: "no-store" });
    if (res.ok) {
      const s = await res.json();
      // He settled the day in the seconds between the server deciding and the
      // push arriving. Saying nothing risks the browser's own "updated in the
      // background" placeholder, which is still better than a warning about a
      // day that is already safe.
      if (s.verifiedToday || s.excusedToday) return;
      const n = Number(s.current) || 0;
      if (n > 0) title = `${n} day${n === 1 ? "" : "s"} on the line`;
      const last = s.hours && s.hours.lastCallAt;
      body = last
        ? `Nothing logged today. Last game goes on by ${last}.`
        : "Nothing logged today.";
    }
  } catch {
    // No signal, or the session cookie is gone. The generic wording above is
    // still true and still worth waking him for.
  }

  await self.registration.showNotification(title, {
    body,
    tag: "bowl-nudge",
    icon: "/icon-180.png",
    badge: "/icon-180.png",
    data: { url: "/" },
  });
}

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // Prefer the copy he already has open: it keeps whatever he was doing, and
    // its URL still carries the private key if that is how it was opened.
    for (const c of clients) {
      if (new URL(c.url).origin === self.location.origin) return c.focus();
    }
    return self.clients.openWindow("/");
  })());
});
