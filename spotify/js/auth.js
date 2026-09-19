/* Authorization Code with PKCE. No client secret, no server: the whole flow
   runs in the browser, which is the only way a static GitHub Pages site can
   talk to Spotify without leaking credentials. */
window.SP = window.SP || {};

SP.auth = (function () {
  "use strict";

  var util = SP.util;
  var AUTHORIZE = "https://accounts.spotify.com/authorize";
  var TOKEN = "https://accounts.spotify.com/api/token";

  var SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-follow-read",
    "user-read-playback-state",
    "user-read-currently-playing"
  ];

  /* The app is registered against this exact string; keep it stable by
     dropping any filename and query the browser happens to be showing. */
  function redirectUri() {
    var path = location.pathname.replace(/index\.html$/, "");
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return location.origin + path;
  }

  function clientId() {
    return util.load("clientId", "") || "";
  }

  function setClientId(id) {
    var trimmed = (id || "").trim();
    if (trimmed) util.save("clientId", trimmed);
    else util.drop("clientId");
  }

  function base64url(bytes) {
    var str = "";
    var arr = new Uint8Array(bytes);
    for (var i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function randomString(bytes) {
    var buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return base64url(buf);
  }

  function challenge(verifier) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)).then(base64url);
  }

  /* ---- token storage ---- */

  function tokens() {
    return util.load("tokens", null);
  }

  function storeTokens(data, previous) {
    var saved = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || (previous && previous.refresh_token) || "",
      /* 60s of slack so a request never starts with a token about to die. */
      expires_at: Date.now() + ((data.expires_in || 3600) - 60) * 1000,
      scope: data.scope || (previous && previous.scope) || ""
    };
    util.save("tokens", saved);
    return saved;
  }

  function isConnected() {
    var t = tokens();
    return !!(t && t.refresh_token);
  }

  function logout() {
    util.drop("tokens");
  }

  /* ---- the flow ---- */

  var PENDING_MS = 15 * 60 * 1000;

  function login() {
    var id = clientId();
    if (!id) return Promise.reject(new Error("Add your Spotify client ID first."));
    var verifier = randomString(64);
    var state = randomString(16);
    return challenge(verifier).then(function (code_challenge) {
      /* localStorage, not sessionStorage: installed to a home screen, the trip
         through Spotify can come back in a different browsing context, and a
         session-scoped verifier would be gone by then. It is one-shot and
         short-lived either way — cleared the moment it is used. */
      util.save("pending", { verifier: verifier, state: state, at: Date.now() });
      var params = new URLSearchParams({
        client_id: id,
        response_type: "code",
        redirect_uri: redirectUri(),
        state: state,
        scope: SCOPES.join(" "),
        code_challenge_method: "S256",
        code_challenge: code_challenge
      });
      location.assign(AUTHORIZE + "?" + params.toString());
    });
  }

  function postToken(body) {
    return fetch(TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString()
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = data.error_description || data.error || ("token request failed (" + res.status + ")");
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  /* Call once at startup. Resolves to "connected", "none", or throws with a
     message worth showing (a denied consent screen, a stale state). */
  function handleRedirect() {
    var params = new URLSearchParams(location.search);
    var code = params.get("code");
    var error = params.get("error");
    var state = params.get("state");
    if (!code && !error) return Promise.resolve("none");

    var waiting = util.load("pending", null) || {};
    util.drop("pending");
    var expected = waiting.state;
    var verifier = waiting.verifier;
    var fresh = waiting.at && Date.now() - waiting.at < PENDING_MS;
    history.replaceState({}, "", redirectUri());

    if (error) {
      return Promise.reject(new Error(error === "access_denied"
        ? "Spotify access was declined."
        : "Spotify returned: " + error));
    }
    if (!verifier || !fresh || state !== expected) {
      return Promise.reject(new Error("That login didn't come back to the same app — tap Connect again from here."));
    }
    return postToken({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri(),
      client_id: clientId(),
      code_verifier: verifier
    }).then(function (data) {
      storeTokens(data, null);
      return "connected";
    });
  }

  var refreshing = null;

  function refresh() {
    var current = tokens();
    if (!current || !current.refresh_token) return Promise.reject(new Error("Not connected to Spotify."));
    if (refreshing) return refreshing;
    refreshing = postToken({
      grant_type: "refresh_token",
      refresh_token: current.refresh_token,
      client_id: clientId()
    }).then(function (data) {
      refreshing = null;
      return storeTokens(data, current).access_token;
    }).catch(function (err) {
      refreshing = null;
      /* A rejected refresh token is permanent — drop it so the UI can
         offer a clean reconnect instead of looping. */
      if (/invalid_grant/i.test(err.message)) logout();
      throw err;
    });
    return refreshing;
  }

  function accessToken() {
    var current = tokens();
    if (!current) return Promise.reject(new Error("Not connected to Spotify."));
    if (current.access_token && Date.now() < current.expires_at) {
      return Promise.resolve(current.access_token);
    }
    return refresh();
  }

  return {
    SCOPES: SCOPES,
    redirectUri: redirectUri,
    clientId: clientId,
    setClientId: setClientId,
    login: login,
    logout: logout,
    isConnected: isConnected,
    handleRedirect: handleRedirect,
    accessToken: accessToken,
    refresh: refresh
  };
})();
