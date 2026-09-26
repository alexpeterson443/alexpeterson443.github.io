/* Offline shell for Listening Stats. Bump CACHE when the shell changes.

   Worth having beyond the usual reasons: the play log and any imported
   history live in IndexedDB, so with the shell cached the whole Full history
   tab works with no network at all. */
var CACHE = "listening-stats-v2";
/* Derived from where this worker sits, so the app still behaves if the folder
   is ever served from a different path or its own domain. */
var SCOPE = new URL("./", self.location).pathname;
var SHELL = [
  "./", "./index.html", "./style.css", "./manifest.webmanifest", "./icon.svg",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
  "./js/util.js", "./js/auth.js", "./js/api.js", "./js/store.js",
  "./js/unzip.js", "./js/csv.js", "./js/apple.js", "./js/history.js",
  "./js/charts.js", "./js/app.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (key) {
      return key === CACHE ? null : caches.delete(key);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  /* Never touch Spotify: tokens and account data have no business in a cache,
     and an intercepted auth request is a good way to break the login. */
  if (url.origin !== location.origin) return;
  if (url.pathname.indexOf(SCOPE) !== 0) return;

  /* Network first for the shell, so a deploy shows up on the next launch;
     the cache is the fallback when there's no signal. */
  event.respondWith(
    fetch(request).then(function (response) {
      if (response.ok && response.type === "basic") {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (hit) {
        if (hit) return hit;
        /* A deep link like /spotify/#history opened cold and offline still
           has a shell to render. */
        if (request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
