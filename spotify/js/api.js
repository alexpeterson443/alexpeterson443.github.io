/* Thin Web API client: attaches the token, retries the things worth retrying,
   and knows how Spotify paginates (offset for most, cursors for plays). */
window.SP = window.SP || {};

SP.api = (function () {
  "use strict";

  var auth = SP.auth;
  var BASE = "https://api.spotify.com/v1";
  var MAX_RETRY_WAIT = 30000;

  function ApiError(message, status, extra) {
    var err = new Error(message);
    err.status = status;
    if (extra) Object.keys(extra).forEach(function (k) { err[k] = extra[k]; });
    return err;
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function url(path, query) {
    var full = path.charAt(0) === "h" ? path : BASE + path;
    if (!query) return full;
    var params = new URLSearchParams();
    Object.keys(query).forEach(function (key) {
      if (query[key] !== undefined && query[key] !== null) params.set(key, query[key]);
    });
    var qs = params.toString();
    if (!qs) return full;
    return full + (full.indexOf("?") === -1 ? "?" : "&") + qs;
  }

  function request(path, query, attempt) {
    attempt = attempt || 0;
    return auth.accessToken().then(function (token) {
      return fetch(url(path, query), { headers: { Authorization: "Bearer " + token } });
    }).then(function (res) {
      if (res.status === 204) return null;

      if (res.status === 401 && attempt < 1) {
        return auth.refresh().then(function () { return request(path, query, attempt + 1); });
      }

      if (res.status === 429) {
        var retryAfter = Number(res.headers.get("Retry-After") || 2);
        var ms = Math.min((retryAfter + 1) * 1000, MAX_RETRY_WAIT);
        if (attempt >= 2 || (retryAfter + 1) * 1000 > MAX_RETRY_WAIT) {
          throw ApiError("Spotify is rate-limiting this app — try again in " +
            Math.ceil(retryAfter / 60) + " min.", 429, { retryAfter: retryAfter });
        }
        return wait(ms).then(function () { return request(path, query, attempt + 1); });
      }

      if (res.status >= 500 && attempt < 2) {
        return wait(600 * (attempt + 1)).then(function () { return request(path, query, attempt + 1); });
      }

      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          var detail = (body && body.error && body.error.message) || res.statusText;
          if (res.status === 403) {
            detail = detail || "Spotify refused this request.";
            detail += " (If your Spotify app is in developer mode, add yourself " +
              "under Settings → User Management.)";
          }
          throw ApiError(detail || ("Request failed (" + res.status + ")"), res.status);
        });
      }

      return res.json();
    });
  }

  /* Walks `next` links. `max` caps how much we pull so a 12,000-track library
     doesn't turn into 240 sequential requests without the caller asking. */
  function paged(path, query, opts) {
    opts = opts || {};
    var max = opts.max || 1000;
    var items = [];
    var total = null;

    function step(next) {
      return (next ? request(next) : request(path, query)).then(function (page) {
        if (!page) return { items: items, total: total || 0 };
        var body = page.items ? page : (page.artists || page.albums || page.tracks || page);
        if (total === null) total = body.total !== undefined ? body.total : null;
        (body.items || []).forEach(function (item) { items.push(item); });
        if (opts.onPage) opts.onPage(items.length, total);
        if (body.next && items.length < max) return step(body.next);
        return { items: items, total: total === null ? items.length : total };
      });
    }
    return step(null);
  }

  /* ---- endpoints ---- */

  function me() { return request("/me"); }

  function top(type, range, limit) {
    return request("/me/top/" + type, { time_range: range, limit: limit || 50 });
  }

  function recentlyPlayed(before) {
    return request("/me/player/recently-played", { limit: 50, before: before || undefined });
  }

  function currentlyPlaying() {
    return request("/me/player/currently-playing", { additional_types: "track,episode" });
  }

  function savedTracks(opts) {
    return paged("/me/tracks", { limit: 50 }, opts);
  }

  function savedAlbums(opts) {
    return paged("/me/albums", { limit: 50 }, opts);
  }

  function playlists(opts) {
    return paged("/me/playlists", { limit: 50 }, opts);
  }

  function followedArtists(opts) {
    opts = opts || {};
    var items = [];
    function step(after) {
      return request("/me/following", { type: "artist", limit: 50, after: after || undefined })
        .then(function (page) {
          var body = page && page.artists;
          if (!body) return items;
          body.items.forEach(function (a) { items.push(a); });
          if (opts.onPage) opts.onPage(items.length, body.total);
          if (body.cursors && body.cursors.after && items.length < (opts.max || 2000)) {
            return step(body.cursors.after);
          }
          return items;
        });
    }
    return step(null);
  }

  return {
    request: request,
    paged: paged,
    me: me,
    top: top,
    recentlyPlayed: recentlyPlayed,
    currentlyPlaying: currentlyPlaying,
    savedTracks: savedTracks,
    savedAlbums: savedAlbums,
    playlists: playlists,
    followedArtists: followedArtists
  };
})();
