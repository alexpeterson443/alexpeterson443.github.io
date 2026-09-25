/* Listening Stats — views, routing and data loading.

   Three sources of truth, in order of how far back they see:
     1. the Web API (top lists, library, and the last 50 plays)
     2. a play log this app keeps in IndexedDB by polling that 50-play feed
     3. a Spotify data export, which is the only thing that holds a lifetime */
(function () {
  "use strict";

  var util = SP.util, auth = SP.auth, api = SP.api, store = SP.store;
  var past = SP.history, charts = SP.charts, unzip = SP.unzip;
  var el = util.el, $ = util.$;

  var TABS = [
    { id: "overview", label: "Overview" },
    { id: "top", label: "Top" },
    { id: "recent", label: "Recent" },
    { id: "library", label: "Library" },
    { id: "history", label: "Full history" },
    { id: "setup", label: "Setup" }
  ];

  var RANGES = [
    { id: "short_term", label: "Last 4 weeks" },
    { id: "medium_term", label: "Last 6 months" },
    { id: "long_term", label: "All time" }
  ];

  var POLL_MS = 3 * 60 * 1000;

  var state = {
    tab: "overview",
    connected: false,
    me: null,
    range: util.load("range", "medium_term"),
    log: null,
    library: null,
    history: {
      records: null,
      stats: null,
      /* One switch per place the listening came from. All on by default:
         merged is the point. */
      use: util.load("sources", { spotify: true, apple: true, log: true }),
      year: "all",
      metric: "ms",
      importMeta: null,
      logCount: 0
    },
    busy: {},
    error: {}
  };

  /* ---------------------------------------------------------------- chrome */

  function banner(message, kind) {
    var host = $("banners");
    var node = el("div", { class: "banner " + (kind === "bad" ? "is-bad" : kind === "good" ? "is-good" : ""), text: message });
    host.appendChild(node);
    if (kind !== "bad") setTimeout(function () { node.remove(); }, 6000);
    return node;
  }

  function clearBanners() { util.clear($("banners")); }

  function loading(text) {
    return el("div", { class: "loading" }, [el("span", { class: "spinner" }), el("span", { text: text || "Loading…" })]);
  }

  function card(title, sub, kids) {
    return el("section", { class: "card" }, [
      title ? el("h2", { text: title }) : null,
      sub ? el("p", { class: "sub", text: sub }) : null
    ].concat(kids || []));
  }

  function buildTabs() {
    var host = util.clear($("tabs"));
    TABS.forEach(function (tab) {
      var button = el("button", {
        class: "tab", id: "tab-" + tab.id, type: "button", role: "tab",
        text: tab.label, "aria-selected": state.tab === tab.id ? "true" : "false",
        "aria-controls": "view-" + tab.id,
        onclick: function () { go(tab.id); }
      });
      host.appendChild(button);
    });
  }

  function go(tab) {
    state.tab = tab;
    if (location.hash !== "#" + tab) history.replaceState({}, "", "#" + tab);
    buildTabs();
    TABS.forEach(function (t) {
      $("view-" + t.id).classList.toggle("is-on", t.id === tab);
    });
    charts.hideTip();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function render() {
    buildHeader();
    var view = util.clear($("view-" + state.tab));
    if (!navigator.onLine) {
      view.appendChild(el("p", { class: "banner", text:
        "Offline. Your play log and imported history are on this device, so they " +
        "still work \u2014 anything that needs Spotify will fill in when you're back." }));
    }
    var invite = installCard();
    if (invite) view.appendChild(invite);
    ({
      overview: renderOverview, top: renderTop, recent: renderRecent,
      library: renderLibrary, history: renderHistory, setup: renderSetup
    })[state.tab](view);
  }

  function refresh() {
    if ($("view-" + state.tab).classList.contains("is-on")) render();
  }

  /* Wraps an async load so every view gets the same spinner / error / retry
     behaviour without repeating it six times. */
  function ensure(key, loader) {
    if (state[key] !== null && state[key] !== undefined && !state.busy[key]) return true;
    if (state.busy[key]) return false;
    if (state.error[key]) return false;
    state.busy[key] = true;
    loader().then(function (value) {
      state[key] = value;
      state.busy[key] = false;
      refresh();
    }).catch(function (err) {
      state.busy[key] = false;
      state.error[key] = err.message || String(err);
      refresh();
    });
    return false;
  }

  function pending(view, key, text) {
    if (state.error[key]) {
      view.appendChild(card(null, null, [
        el("p", { class: "banner is-bad", text: state.error[key] }),
        el("button", {
          class: "btn btn-sm", type: "button", text: "Try again",
          onclick: function () { state.error[key] = null; state[key] = null; refresh(); }
        })
      ]));
    } else {
      view.appendChild(card(null, null, [loading(text)]));
    }
  }

  /* ------------------------------------------------------------ formatting */

  function hoursNote(ms) {
    var hours = ms / 3600000;
    if (hours >= 48) return Math.round(hours).toLocaleString() + " hours";
    return util.duration(ms);
  }

  /* "Top 0.4%" is only meaningful against a decent pool of artists; with a
     handful of names it is noise, so a small pool gets the plain rank. */
  /* The 0.95 cut keeps consecutive rows from reading "1.0%, 1%, 1%": anything
     that would round to a whole number is shown as one. */
  function percentText(value) {
    if (value < 0.1) return value.toFixed(2) + "%";
    if (value < 0.95) return value.toFixed(1) + "%";
    return Math.round(value) + "%";
  }

  function rankLabel(artist, total) {
    if (!artist || !artist.rank) return null;
    if (total < 20) return "#" + artist.rank + " of " + total;
    return "top " + percentText(artist.topPercent);
  }

  /* Kept short: this sits on one ellipsised line beside the artist name. */
  function shareLabel(artist) {
    if (!artist || !artist.share) return null;
    var pct = artist.share * 100;
    return (pct < 0.1 ? pct.toFixed(2) : pct.toFixed(1)) + "% of your time";
  }

  function artistsOf(track) {
    return (track.artists || []).map(function (a) { return a.name; }).join(", ");
  }

  function trackTip(item) {
    return "<b>" + escape(item.name) + "</b><br>" + escape(item.artist || "") +
      (item.album ? "<br>" + escape(item.album) : "");
  }

  function escape(text) {
    return String(text === null || text === undefined ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ------------------------------------------------------------- the views */

  function connectPrompt(message) {
    return card("Connect your Spotify account", message || null, [
      el("p", { class: "small muted", text:
        "Spotify hands over your top artists and tracks, your library, and the 50 " +
        "most recent plays. This app keeps polling that feed so the log grows, and " +
        "your data export fills in everything before today." }),
      el("div", { class: "row" }, [
        el("button", {
          class: "btn btn-primary", type: "button",
          text: auth.clientId() ? "Connect Spotify" : "Set up in 2 minutes",
          onclick: function () { auth.clientId() ? startLogin() : go("setup"); }
        }),
        el("button", { class: "btn", type: "button", text: "Import an export instead", onclick: function () { go("history"); } })
      ])
    ]);
  }

  /* ---- overview ---- */

  function renderOverview(view) {
    if (!state.connected) {
      view.appendChild(connectPrompt("Nothing is connected yet."));
      var offline = lifetimeStats();
      if (offline) view.appendChild(historyHighlights(offline));
      return;
    }

    if (!ensure("me", function () { return api.me(); })) {
      pending(view, "me", "Reading your profile…");
      return;
    }

    var me = state.me;
    view.appendChild(nowPlayingCard());

    var lifetime = lifetimeStats();
    var tiles = [];
    if (lifetime) {
      tiles.push({ label: "Lifetime listening", value: hoursNote(lifetime.ms), note: util.int(lifetime.streams) + " streams" });
      tiles.push({ label: "Since", value: lifetime.first ? util.dayLabel(util.dateKey(new Date(lifetime.first))) : "—", note: "first stream in your export" });
      tiles.push({ label: "Artists heard", value: util.int(lifetime.uniqueArtists), note: util.int(lifetime.uniqueTracks) + " tracks" });
    }
    tiles.push({ label: "Plays logged here", value: util.int(state.history.logCount), note: "kept on this device" });
    tiles.push({ label: "Followers", value: util.int(me.followers ? me.followers.total : 0), note: me.product ? "Spotify " + me.product : null });
    view.appendChild(card("You", me.display_name || me.id, [charts.tiles(tiles)]));

    if (!lifetime) {
      view.appendChild(card("Want the whole story?", null, [
        el("p", { text:
          "Spotify's API only exposes the last 50 plays, so a lifetime total has to come " +
          "from your data export \u2014 and if you've used Apple Music too, its export drops " +
          "into the same page and the two become one dataset." }),
        el("button", { class: "btn", type: "button", text: "How to get them", onclick: function () { go("history"); } })
      ]));
    }

    /* Not blocking: the log only feeds the "Yours:" line when there's no export. */
    ensure("log", loadLog);
    var key = "top:" + state.range;
    if (!ensure(key, function () {
      return Promise.all([api.top("artists", state.range), api.top("tracks", state.range)])
        .then(function (both) { return { artists: both[0].items || [], tracks: both[1].items || [] }; });
    })) {
      pending(view, key, "Reading your top lists…");
    } else {
      var top = state[key];
      var box = el("div", { class: "cols two" }, [
        el("div", {}, [charts.rankBars(top.artists.slice(0, 5), {
          title: "Top artists", note: rangeLabel(), value: function (a) { return a.popularity || 0; },
          label: function (a) { return a.name; }, format: function (v) { return v + "/100"; },
          art: function (a) { return util.art(a.images, 80); },
          meta: function (a) { return (a.genres || []).slice(0, 2).join(" · "); },
          labelHead: "Artist", valueHead: "Popularity", onSelect: function (a) { showArtist(a.name); }
        })]),
        el("div", {}, [charts.rankBars(top.tracks.slice(0, 5), {
          title: "Top tracks", note: rangeLabel(), value: function (t) { return t.popularity || 0; },
          label: function (t) { return t.name; }, format: function (v) { return v + "/100"; },
          art: function (t) { return util.art(t.album && t.album.images, 80); },
          meta: function (t) { return artistsOf(t); },
          labelHead: "Track", valueHead: "Popularity"
        })])
      ]);
      view.appendChild(card("What you're on lately", null, [
        el("div", { class: "row", style: "margin-bottom:.8rem" }, [rangePicker()]), box,
        el("button", { class: "btn btn-sm btn-ghost", type: "button", text: "See all 50 →", onclick: function () { go("top"); } })
      ]));
    }

    if (ensure("log", loadLog) && state.log.length) {
      var stats = past.aggregate(state.log);
      view.appendChild(card("The last two weeks", "From the plays this app has logged.", [
        charts.columns(lastDays(stats, 14), {
          title: "Plays per day", value: function (d) { return d.value; },
          label: function (d) { return d.name; }, shortLabel: function (d) { return d.short; },
          format: function (v) { return util.int(v) + (v === 1 ? " play" : " plays"); },
          valueHead: "Plays"
        })
      ]));
    }
  }

  function lastDays(stats, count) {
    var out = [];
    var today = new Date();
    for (var i = count - 1; i >= 0; i--) {
      var date = new Date(today.getTime() - i * util.DAY_MS);
      var key = util.dateKey(date);
      out.push({
        name: util.dayLabel(key), short: util.MONTHS[date.getMonth()] + " " + date.getDate(),
        value: stats.dayPlays.get(key) || 0
      });
    }
    return out;
  }

  function nowPlayingCard() {
    var box = card(null, null, [loading("Checking what's playing…")]);
    api.currentlyPlaying().then(function (playing) {
      util.clear(box);
      var item = playing && playing.item;
      if (!item) {
        var last = state.log && state.log.length
          ? state.log.slice().sort(function (a, b) { return b.ts - a.ts; })[0] : null;
        box.appendChild(el("div", { class: "now" }, [
          last && last.art ? el("img", { src: last.art, alt: "" }) : el("span", { class: "now-art" }),
          el("div", { class: "now-body" }, [
            el("span", { class: "now-label", text: last ? "Last played" : "Not playing" }),
            el("div", { class: "now-title", text: last ? last.track : "Nothing is playing right now" }),
            el("div", { class: "now-sub", text: last ? last.artist + " · " + util.ago(new Date(last.ts)) : "Start something and it'll show up here." })
          ])
        ]));
        return;
      }
      var art = item.album ? util.art(item.album.images, 160) : (item.images ? util.art(item.images, 160) : null);
      var pct = item.duration_ms ? Math.min(100, (playing.progress_ms / item.duration_ms) * 100) : 0;
      box.appendChild(el("div", { class: "now" }, [
        art ? el("img", { src: art, alt: "" }) : null,
        el("div", { class: "now-body" }, [
          el("span", { class: "now-label", text: playing.is_playing ? "Playing now" : "Paused" }),
          el("div", { class: "now-title", text: item.name }),
          el("div", { class: "now-sub", text: item.artists ? artistsOf(item) : (item.show ? item.show.name : "") }),
          el("div", { class: "now-bar" }, [el("span", { style: "width:" + pct + "%" })]),
          el("div", { class: "now-sub small", text: util.clock(playing.progress_ms) + " / " + util.clock(item.duration_ms) })
        ])
      ]));
    }).catch(function (err) {
      util.clear(box);
      box.appendChild(el("p", { class: "small muted", text: "Couldn't read the player: " + err.message }));
    });
    return box;
  }

  function rangeLabel() {
    var found = RANGES.filter(function (r) { return r.id === state.range; })[0];
    return found ? found.label : "";
  }

  function rangePicker() {
    return el("div", { class: "seg", role: "group", "aria-label": "Time range" }, RANGES.map(function (range) {
      return el("button", {
        type: "button", text: range.label, "aria-pressed": state.range === range.id ? "true" : "false",
        onclick: function () { state.range = range.id; util.save("range", range.id); refresh(); }
      });
    }));
  }

  /* ---- top ---- */

  function renderTop(view) {
    if (!state.connected) { view.appendChild(connectPrompt("Top lists come from your account.")); return; }

    view.appendChild(card("Your top 50", "Spotify's own ranking of what you play most.", [
      el("div", { class: "row" }, [rangePicker()]),
      el("p", { class: "small muted", style: "margin:.7rem 0 0", text:
        "Order is Spotify's ranking. The bar shows each item's popularity score " +
        "(0–100, how much everyone else plays it) — a rank on its own isn't a quantity worth drawing." })
    ]));

    /* Not blocking: the log only feeds the "Yours:" line when there's no export. */
    ensure("log", loadLog);
    var key = "top:" + state.range;
    if (!ensure(key, function () {
      return Promise.all([api.top("artists", state.range), api.top("tracks", state.range)])
        .then(function (both) { return { artists: both[0].items || [], tracks: both[1].items || [] }; });
    })) { pending(view, key, "Reading your top 50…"); return; }

    var top = state[key];

    view.appendChild(card("Top artists", rangeLabel(), [
      el("div", { class: "grid-cards" }, top.artists.map(function (artist, index) {
        return el("button", {
          class: "thing is-round", type: "button", style: "border:0;background:none;padding:0;text-align:left;cursor:pointer",
          onclick: function () { showArtist(artist.name, artist); }
        }, [
          util.art(artist.images, 200)
            ? el("img", { src: util.art(artist.images, 200), alt: "", loading: "lazy" })
            : el("span", { class: "thing-blank" }),
          el("span", { class: "thing-rank", text: "#" + (index + 1) }),
          el("span", { class: "thing-name", text: artist.name, title: artist.name }),
          el("span", { class: "thing-sub", text: (artist.genres || []).slice(0, 2).join(", ") || "—" }),
          yoursLine(artist.name),
          el("span", { class: "meter" }, [el("span", { style: "width:" + (artist.popularity || 0) + "%" })])
        ]);
      }))
    ]));

    view.appendChild(card("Top tracks", rangeLabel(), [
      charts.rankBars(top.tracks, {
        value: function (t) { return t.popularity || 0; },
        label: function (t) { return t.name; },
        meta: function (t) { return artistsOf(t) + " · " + (t.album ? t.album.name : ""); },
        art: function (t) { return util.art(t.album && t.album.images, 80); },
        format: function (v) { return v + "/100"; },
        labelHead: "Track", valueHead: "Popularity",
        tip: function (t) { return "<b>" + escape(t.name) + "</b><br>" + escape(artistsOf(t)) + "<br>" + util.clock(t.duration_ms); }
      })
    ]));

    var genres = new Map();
    top.artists.forEach(function (artist, index) {
      (artist.genres || []).forEach(function (genre) {
        var entry = genres.get(genre) || { name: genre, count: 0, score: 0 };
        entry.count++;
        /* A genre carried by your #1 artist should outweigh one carried by #48. */
        entry.score += top.artists.length - index;
        genres.set(genre, entry);
      });
    });
    var genreList = util.topOf(genres, 14, "score");
    view.appendChild(card("Genres behind those artists", "Spotify tags artists, not tracks, so this is built from your top artists.", [
      charts.rankBars(genreList, {
        value: function (g) { return g.count; }, label: function (g) { return g.name; },
        format: function (v) { return v + (v === 1 ? " artist" : " artists"); },
        labelHead: "Genre", valueHead: "Top artists",
        emptyText: "Spotify has no genre tags for these artists."
      })
    ]));

    var years = new Map();
    top.tracks.forEach(function (track) {
      var date = track.album && track.album.release_date;
      if (!date) return;
      var year = Number(String(date).slice(0, 4));
      if (!year) return;
      years.set(year, (years.get(year) || 0) + 1);
    });
    var yearRows = Array.from(years.keys()).sort().map(function (year) {
      return { name: String(year), value: years.get(year) };
    });
    view.appendChild(card("When your top tracks came out", null, [
      charts.columns(yearRows, {
        format: function (v) { return v + (v === 1 ? " track" : " tracks"); },
        labelHead: "Release year", valueHead: "Tracks", height: 180
      })
    ]));
  }

  /* How far up your own listening an artist sits, for the cards on the Top
     tab \u2014 blank when nothing all-time knows the name yet. */
  function yoursLine(name) {
    var found = rankedArtist(name);
    if (!found) return null;
    var label = rankLabel(found.artist, found.stats.uniqueArtists);
    return el("span", { class: "thing-sub", text: "Yours: " + label + " \u00b7 " +
      (found.artist.share * 100).toFixed(1) + "%" });
  }

  /* ---- recent ---- */

  function renderRecent(view) {
    if (!state.connected && !(state.log && state.log.length)) {
      view.appendChild(connectPrompt("The play log fills up once you connect."));
      return;
    }
    if (!ensure("log", loadLog)) { pending(view, "log", "Opening the play log…"); return; }

    var log = state.log;
    var stats = past.aggregate(log);

    view.appendChild(card("Play log", null, [
      el("p", { class: "small muted", text:
        "Spotify only ever returns the 50 most recent plays. This page saves each one it " +
        "sees into your browser, so the log keeps growing every time you visit — " +
        "anything before you started will only ever come from a data export." }),
      charts.tiles([
        { label: "Plays logged", value: util.int(stats.streams), note: stats.first ? "since " + util.dayLabel(util.dateKey(new Date(stats.first))) : null },
        { label: "Listening time", value: hoursNote(stats.ms), note: "estimated from track length" },
        { label: "Different tracks", value: util.int(stats.uniqueTracks) },
        { label: "Different artists", value: util.int(stats.uniqueArtists) }
      ]),
      el("div", { class: "row", style: "margin-top:.9rem" }, [
        el("button", { class: "btn btn-sm", type: "button", text: "Check for new plays", onclick: function (event) {
          var button = event.currentTarget;
          button.disabled = true;
          poll(true).then(function (added) {
            button.disabled = false;
            banner(added ? "Logged " + added + " new play" + (added === 1 ? "" : "s") + "." : "Nothing new since the last check.", added ? "good" : null);
            state.log = null; refresh();
          }).catch(function (err) { button.disabled = false; banner(err.message, "bad"); });
        } }),
        el("button", { class: "btn btn-sm btn-ghost", type: "button", text: "Download log (JSON)", onclick: function () { downloadLog(); } })
      ])
    ]));

    if (!log.length) {
      view.appendChild(card(null, null, [el("p", { class: "muted", text: "No plays logged yet. Play something and come back." })]));
      return;
    }

    view.appendChild(card("When you listen", "Every logged play, by day and hour.", [
      charts.clockGrid(stats.weekHourPlays, {
        format: function (v) { return util.int(v) + (v === 1 ? " play" : " plays"); },
        valueHead: "Plays"
      })
    ]));

    view.appendChild(el("div", { class: "cols two" }, [
      card("Most played artists", "In the logged window.", [
        charts.rankBars(past.topList(stats.artists, 10, "plays"), {
          value: function (a) { return a.plays; }, label: function (a) { return a.name; },
          art: function (a) { return a.art; },
          format: function (v) { return util.int(v) + (v === 1 ? " play" : " plays"); },
          labelHead: "Artist", valueHead: "Plays",
          onSelect: function (a) { showArtist(a.name); }
        })
      ]),
      card("Most played tracks", "In the logged window.", [
        charts.rankBars(past.topList(stats.tracks, 10, "plays"), {
          value: function (t) { return t.plays; }, label: function (t) { return t.name; },
          meta: function (t) { return t.artist; }, art: function (t) { return t.art; },
          format: function (v) { return util.int(v) + (v === 1 ? " play" : " plays"); },
          labelHead: "Track", valueHead: "Plays", tip: trackTip
        })
      ])
    ]));

    view.appendChild(timelineCard(log, 200));
  }

  function timelineCard(records, limit) {
    var sorted = records.slice().sort(function (a, b) { return b.ts - a.ts; });
    var shown = sorted.slice(0, limit);
    var list = el("ol", { class: "timeline" });
    var lastDay = null;
    shown.forEach(function (record) {
      var date = new Date(record.ts);
      var key = util.dateKey(date);
      if (key !== lastDay) {
        lastDay = key;
        list.appendChild(el("li", { class: "tl-day", text: util.dayLabel(key) }));
      }
      list.appendChild(el("li", { class: "tl-row" }, [
        el("span", { class: "tl-time", text: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }),
        record.art ? el("img", { class: "tl-art", src: record.art, alt: "", loading: "lazy" }) : el("span", { class: "tl-art" }),
        el("span", { class: "tl-body" }, [
          el("span", { class: "tl-name", text: record.track }),
          el("span", { class: "tl-sub", text: record.artist + (record.album ? " · " + record.album : "") })
        ]),
        el("span", { class: "tl-time", style: "text-align:right", text: util.clock(record.ms) })
      ]));
    });
    return card("Timeline", sorted.length > limit
      ? "Newest " + util.int(limit) + " of " + util.int(sorted.length) + " plays."
      : util.int(sorted.length) + " plays.", [list]);
  }

  function loadLog() {
    return store.allPlays().then(function (rows) {
      state.history.logCount = rows.length;
      return rows;
    });
  }

  function downloadLog() {
    store.allPlays().then(function (rows) {
      var blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = el("a", { href: url, download: "spotify-play-log.json" });
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ---- library ---- */

  function renderLibrary(view) {
    if (!state.connected) { view.appendChild(connectPrompt("Your library lives on your account.")); return; }

    if (!ensure("library", loadLibrary)) {
      pending(view, "library", "Reading your library — this one takes a few requests…");
      return;
    }
    var lib = state.library;
    var totalMs = lib.tracks.reduce(function (sum, row) {
      return sum + ((row.track && row.track.duration_ms) || 0);
    }, 0);

    view.appendChild(card("Library", null, [
      charts.tiles([
        { label: "Saved tracks", value: util.int(lib.trackTotal), note: lib.tracks.length < lib.trackTotal ? "newest " + util.int(lib.tracks.length) + " analysed" : null },
        { label: "If you played it all", value: hoursNote(totalMs) },
        { label: "Saved albums", value: util.int(lib.albumTotal) },
        { label: "Playlists", value: util.int(lib.playlists.length), note: util.int(lib.ownPlaylists) + " yours" },
        { label: "Artists followed", value: util.int(lib.following.length) }
      ])
    ]));

    var byYear = new Map();
    var artistCount = new Map();
    var releaseYears = new Map();
    lib.tracks.forEach(function (row) {
      var added = new Date(row.added_at);
      var year = added.getFullYear();
      if (year) byYear.set(year, (byYear.get(year) || 0) + 1);
      var track = row.track || {};
      (track.artists || []).slice(0, 1).forEach(function (artist) {
        var entry = artistCount.get(artist.name) || { name: artist.name, count: 0 };
        entry.count++;
        artistCount.set(artist.name, entry);
      });
      var release = track.album && track.album.release_date;
      if (release) {
        var rYear = Number(String(release).slice(0, 4));
        if (rYear) releaseYears.set(rYear, (releaseYears.get(rYear) || 0) + 1);
      }
    });

    view.appendChild(card("When you saved them", null, [
      charts.columns(sortedYears(byYear), {
        format: function (v) { return util.int(v) + (v === 1 ? " track" : " tracks"); },
        labelHead: "Year saved", valueHead: "Tracks saved", height: 180
      })
    ]));

    view.appendChild(el("div", { class: "cols two" }, [
      card("Most-saved artists", null, [
        charts.rankBars(util.topOf(artistCount, 12, "count"), {
          value: function (a) { return a.count; }, label: function (a) { return a.name; },
          format: function (v) { return util.int(v) + (v === 1 ? " track" : " tracks"); },
          labelHead: "Artist", valueHead: "Saved tracks",
          onSelect: function (a) { showArtist(a.name); }
        })
      ]),
      card("Release years in your library", null, [
        charts.columns(sortedYears(releaseYears), {
          format: function (v) { return util.int(v) + (v === 1 ? " track" : " tracks"); },
          labelHead: "Release year", valueHead: "Tracks", height: 180
        })
      ])
    ]));

    var playlists = lib.playlists.slice().sort(function (a, b) {
      return (b.tracks ? b.tracks.total : 0) - (a.tracks ? a.tracks.total : 0);
    });
    view.appendChild(card("Playlists", util.int(playlists.length) + " in your account", [
      charts.rankBars(playlists.slice(0, 25), {
        value: function (p) { return p.tracks ? p.tracks.total : 0; },
        label: function (p) { return p.name || "Untitled"; },
        meta: function (p) { return (p.owner && p.owner.display_name) ? "by " + p.owner.display_name : ""; },
        art: function (p) { return util.art(p.images, 80); },
        format: function (v) { return util.int(v) + (v === 1 ? " track" : " tracks"); },
        labelHead: "Playlist", valueHead: "Tracks"
      })
    ]));
  }

  function sortedYears(map) {
    return Array.from(map.keys()).sort(function (a, b) { return a - b; }).map(function (year) {
      return { name: String(year), value: map.get(year) };
    });
  }

  function loadLibrary() {
    var result = { tracks: [], trackTotal: 0, albumTotal: 0, playlists: [], following: [], ownPlaylists: 0 };
    return api.savedTracks({ max: 2000 }).then(function (saved) {
      result.tracks = saved.items;
      result.trackTotal = saved.total;
      return api.savedAlbums({ max: 50 });
    }).then(function (albums) {
      result.albumTotal = albums.total;
      return api.playlists({ max: 300 });
    }).then(function (playlists) {
      result.playlists = playlists.items.filter(Boolean);
      var me = state.me;
      result.ownPlaylists = result.playlists.filter(function (p) {
        return me && p.owner && p.owner.id === me.id;
      }).length;
      return api.followedArtists({ max: 1000 });
    }).then(function (following) {
      result.following = following;
      return result;
    });
  }

  /* ---- full history ---- */

  var statsCache = {};

  var ORIGINS = [
    { id: "spotify", label: "Spotify export" },
    { id: "apple", label: "Apple Music" },
    { id: "log", label: "Logged here" }
  ];

  /* Which origin a stored row came from. Rows written before the app knew
     about Apple Music have no source and are Spotify. */
  function originOf(record) {
    return record.source === "apple" ? "apple" : "spotify";
  }

  function counts() {
    var out = { spotify: 0, apple: 0, log: state.log ? state.log.length : 0 };
    (state.imported || []).forEach(function (record) { out[originOf(record)]++; });
    return out;
  }

  /* The merged dataset: every enabled origin in one array, which is the whole
     point of the exercise \u2014 one artist, one total, whatever played it. */
  function activeRecords() {
    var use = state.history.use;
    var out = [];
    (state.imported || []).forEach(function (record) {
      if (use[originOf(record)]) out.push(record);
    });
    if (use.log && state.log) state.log.forEach(function (record) { out.push(record); });
    return out;
  }

  function cacheKey(part) {
    var use = state.history.use;
    return ORIGINS.map(function (o) { return use[o.id] ? o.id : ""; }).join(",") + "|" + part + "|" +
      (state.imported ? state.imported.length : 0) + "|" + (state.log ? state.log.length : 0);
  }

  /* Whole-source and per-year aggregates both stay cached: switching years
     back and forth shouldn't re-walk 100,000 streams each time. The cache is
     dropped wherever the underlying rows change. */
  function sourceStats() {
    var key = cacheKey("all");
    if (!statsCache[key]) statsCache[key] = past.aggregate(activeRecords());
    return statsCache[key];
  }

  function activeStats() {
    if (state.history.year === "all") return sourceStats();
    var key = cacheKey(state.history.year);
    if (!statsCache[key]) {
      var year = Number(state.history.year);
      statsCache[key] = past.aggregate(activeRecords().filter(function (record) {
        return new Date(record.ts).getFullYear() === year;
      }));
    }
    return statsCache[key];
  }

  function metricValue(entry) {
    return state.history.metric === "plays" ? entry.plays : entry.ms;
  }

  function metricFormat(value) {
    return state.history.metric === "plays"
      ? util.int(value) + (value === 1 ? " play" : " plays")
      : util.duration(value);
  }

  function metricHead() {
    return state.history.metric === "plays" ? "Plays" : "Time";
  }

  function renderHistory(view) {
    var ready = true;
    if (!ensure("imported", loadImported)) { pending(view, "imported", "Opening your imported history…"); ready = false; }
    if (!ensure("log", loadLog)) { ready = false; }
    if (!ready) return;

    var hasImport = state.imported.length > 0;
    var hasLog = state.log.length > 0;

    view.appendChild(importCard(hasImport));
    if (!hasImport && !hasLog) return;

    var have = counts();
    var live = ORIGINS.filter(function (origin) { return have[origin.id] > 0; });

    /* Never leave every switch off \u2014 that would show an empty page with no
       hint why. */
    if (!live.some(function (origin) { return state.history.use[origin.id]; })) {
      live.forEach(function (origin) { state.history.use[origin.id] = true; });
    }

    if (live.length > 1) {
      view.appendChild(card("What to count", "All of it is one dataset \u2014 switch a source off to see its share.", [
        el("div", { class: "chips" }, live.map(function (origin) {
          return el("button", {
            class: "chip", type: "button",
            text: origin.label + " (" + util.int(have[origin.id]) + ")",
            "aria-pressed": state.history.use[origin.id] ? "true" : "false",
            onclick: function () {
              var use = state.history.use;
              var on = live.filter(function (o) { return use[o.id]; });
              /* Turning off the last one would leave nothing to show. */
              if (use[origin.id] && on.length === 1) return;
              use[origin.id] = !use[origin.id];
              util.save("sources", use);
              state.history.year = "all";
              refresh();
            }
          });
        }))
      ]));
    }

    var all = sourceStats();
    var stats = activeStats();

    var yearChips = el("div", { class: "chips" }, [{ year: "all", label: "All time" }].concat(
      all.yearList.slice().reverse().map(function (year) { return { year: String(year.year), label: String(year.year) }; })
    ).map(function (option) {
      return el("button", {
        class: "chip", type: "button", text: option.label,
        "aria-pressed": String(state.history.year) === option.year ? "true" : "false",
        onclick: function () { state.history.year = option.year; refresh(); }
      });
    }));

    var metricToggle = el("div", { class: "seg", role: "group", "aria-label": "Measure" }, [
      { id: "ms", label: "By time" }, { id: "plays", label: "By plays" }
    ].map(function (option) {
      return el("button", {
        type: "button", text: option.label,
        "aria-pressed": state.history.metric === option.id ? "true" : "false",
        onclick: function () { state.history.metric = option.id; refresh(); }
      });
    }));

    view.appendChild(card(null, null, [
      el("div", { class: "spread" }, [yearChips, metricToggle])
    ]));

    view.appendChild(historyHighlights(stats));
    var split = sourceSplit(stats);
    if (split) view.appendChild(split);

    view.appendChild(el("div", { class: "cols two" }, [
      card("Top artists", state.history.year === "all" ? "All time" : state.history.year, [
        charts.rankBars(past.topList(stats.artists, 20, state.history.metric), {
          value: metricValue, label: function (a) { return a.name; },
          format: metricFormat, art: function (a) { return a.art; },
          meta: function (a) {
            return [shareLabel(a), rankLabel(a, stats.uniqueArtists)].filter(Boolean).join(" · ");
          },
          labelHead: "Artist", valueHead: metricHead(),
          onSelect: function (a) { showArtist(a.name); },
          tip: function (a) {
            return "<b>" + escape(a.name) + "</b><br>" + util.duration(a.ms) + " · " +
              util.int(a.plays) + " plays<br>since " + util.dayLabel(util.dateKey(new Date(a.first)));
          }
        })
      ]),
      card("Top tracks", state.history.year === "all" ? "All time" : state.history.year, [
        charts.rankBars(past.topList(stats.tracks, 20, state.history.metric), {
          value: metricValue, label: function (t) { return t.name; },
          meta: function (t) { return t.artist; }, art: function (t) { return t.art; },
          format: metricFormat, labelHead: "Track", valueHead: metricHead(), tip: trackTip
        })
      ])
    ]));

    view.appendChild(el("div", { class: "cols two" }, [
      card("Top albums", null, [
        charts.rankBars(past.topList(stats.albums, 12, state.history.metric), {
          value: metricValue, label: function (a) { return a.name; },
          meta: function (a) { return a.artist; }, art: function (a) { return a.art; },
          format: metricFormat, labelHead: "Album", valueHead: metricHead()
        })
      ]),
      card("Where you played it", "Platform is taken from the export; the log can't see it.", [
        charts.rankBars(past.countList(stats.platforms, 8), {
          value: function (p) { return p.value; }, label: function (p) { return p.name; },
          format: function (v) { return util.int(v) + " streams"; },
          labelHead: "Platform", valueHead: "Streams",
          emptyText: "No platform data in this source."
        }),
        stats.countries.size ? charts.rankBars(past.countList(stats.countries, 6), {
          title: "Countries", value: function (c) { return c.value; }, label: function (c) { return c.name; },
          format: function (v) { return util.int(v) + " streams"; },
          labelHead: "Country", valueHead: "Streams"
        }) : null
      ])
    ]));

    if (stats.yearList.length > 1) {
      view.appendChild(card("Year by year", null, [
        charts.columns(stats.yearList.map(function (year) {
          return { name: String(year.year), value: state.history.metric === "plays" ? year.plays : year.ms, year: year };
        }), {
          format: metricFormat, labelHead: "Year", valueHead: metricHead(),
          tipExtra: function (d) { return d.year.topArtist ? "Top: " + escape(d.year.topArtist.name) : ""; },
          highlight: function (d) { return String(d.name) === String(state.history.year); }
        })
      ]));
    }

    if (stats.monthList.length > 1) {
      view.appendChild(card("Month by month", null, [
        charts.line(stats.monthList.map(function (month) {
          return { name: util.monthLabel(month.key), value: state.history.metric === "plays" ? month.plays : month.ms };
        }), { format: metricFormat, labelHead: "Month", valueHead: metricHead() })
      ]));
    }

    view.appendChild(card("Your listening clock", "Local time, every stream in this selection.", [
      charts.clockGrid(state.history.metric === "plays" ? stats.weekHourPlays : stats.weekHourMs, {
        format: metricFormat, valueHead: metricHead()
      })
    ]));

    var calYears = stats.yearList.slice().reverse().slice(0, 6);
    if (calYears.length) {
      var calendars = calYears.map(function (year) {
        return charts.calendar(state.history.metric === "plays" ? stats.dayPlays : stats.days, year.year, {
          title: String(year.year),
          note: util.int(year.activeDays) + " days with listening",
          format: metricFormat, valueHead: metricHead()
        });
      }).filter(Boolean);
      view.appendChild(card("Every day", null, calendars));
    }

    view.appendChild(yearReviewCard(stats));
    view.appendChild(habitsCard(stats));
    view.appendChild(searchCard());
  }

  var SOURCE_NAMES = { spotify: "Spotify", apple: "Apple Music" };

  function sourceName(id) {
    return SOURCE_NAMES[id] || id;
  }

  /* Only worth a card once there is more than one service in the pile. */
  function sourceSplit(stats) {
    if (!stats.sources || stats.sources.size < 2) return null;
    var rows = [];
    stats.sources.forEach(function (entry) { rows.push(entry); });
    rows.sort(function (a, b) { return b.ms - a.ms; });

    var tiles = rows.map(function (entry) {
      return {
        label: sourceName(entry.source),
        value: hoursNote(entry.ms),
        note: util.int(entry.streams) + " streams \u00b7 " +
          Math.round(entry.ms / stats.ms * 100) + "% of the total"
      };
    });

    return card("Where it came from", "Both services, counted together above.", [
      charts.tiles(tiles),
      el("div", { style: "margin-top:1rem" }, [
        charts.rankBars(rows, {
          title: "Share of your listening",
          value: function (entry) { return entry.ms; },
          label: function (entry) { return sourceName(entry.source); },
          meta: function (entry) {
            return util.dayLabel(util.dateKey(new Date(entry.first))) + " \u2192 " +
              util.dayLabel(util.dateKey(new Date(entry.last)));
          },
          format: util.duration, labelHead: "Service", valueHead: "Time"
        })
      ]),
      stats.approx ? el("p", { class: "small muted", text:
        "Apple's daily file gives a day, an hour and a play count rather than each " +
        "play's clock time, so " + util.int(stats.approx) + " of these streams have a " +
        "rebuilt timestamp: the totals and the hour are exact, the minute inside the " +
        "hour is inferred." }) : null
    ]);
  }

  function historyHighlights(stats) {
    var tiles = [
      { label: "Listening time", value: hoursNote(stats.ms), note: util.int(Math.round(stats.ms / 86400000)) + " full days" },
      { label: "Streams", value: util.int(stats.streams) },
      { label: "Artists", value: util.int(stats.uniqueArtists), note: util.int(stats.uniqueTracks) + " tracks" },
      { label: "Days with music", value: util.int(stats.activeDays), note: stats.span ? "of " + util.int(stats.span) + " days covered" : null },
      { label: "Average a day", value: util.duration(stats.dailyAverage), note: util.duration(stats.perActiveDay) + " on days you listened" },
      { label: "Longest streak", value: util.int(stats.streak.length) + " days", note: stats.streak.from ? util.dayLabel(stats.streak.from) + " → " + util.dayLabel(stats.streak.to) : null }
    ];
    if (stats.busiestDay) {
      tiles.push({ label: "Biggest day", value: util.duration(stats.busiestDay.ms), note: util.dayLabel(stats.busiestDay.day) });
    }
    if (stats.skipRate !== null) {
      tiles.push({ label: "Skipped", value: Math.round(stats.skipRate * 100) + "%", note: util.int(stats.skipped) + " of " + util.int(stats.skippable) + " streams" });
    }
    if (stats.shuffleRate !== null) {
      tiles.push({ label: "On shuffle", value: Math.round(stats.shuffleRate * 100) + "%" });
    }
    if (stats.longestSession) {
      tiles.push({ label: "Longest session", value: util.duration(stats.longestSession.ms), note: util.int(stats.longestSession.streams) + " tracks back to back" });
    }
    if (stats.episodes.streams) {
      tiles.push({ label: "Podcasts", value: hoursNote(stats.episodes.ms), note: util.int(stats.episodes.streams) + " episodes" });
    }
    var note = stats.first
      ? util.dayLabel(util.dateKey(new Date(stats.first))) + " → " + util.dayLabel(util.dateKey(new Date(stats.last)))
      : null;
    return card("The numbers", note, [charts.tiles(tiles)]);
  }

  function yearReviewCard(stats) {
    if (!stats.yearList.length) return el("span");
    var rows = stats.yearList.slice().reverse().map(function (year) {
      var track = year.topTrack;
      return el("div", { class: "tile" }, [
        el("span", { class: "tile-label", text: String(year.year) }),
        el("span", { class: "tile-value", text: hoursNote(year.ms) }),
        el("span", { class: "tile-note", text: util.int(year.plays) + " streams · " + util.int(year.activeDays) + " days" }),
        el("span", { class: "tile-note", text: year.topArtist ? "Artist: " + year.topArtist.name : "" }),
        el("span", { class: "tile-note", text: track ? "Track: " + track.name : "" })
      ]);
    });
    return card("Your year, every year", null, [el("div", { class: "tiles" }, rows)]);
  }

  function habitsCard(stats) {
    var reasons = past.countList(stats.reasonEnd, 8).map(function (row) {
      return { name: REASONS[row.name] || row.name, value: row.value };
    });
    var starts = past.countList(stats.reasonStart, 8).map(function (row) {
      return { name: REASONS[row.name] || row.name, value: row.value };
    });
    if (!reasons.length && !starts.length) return el("span");
    return card("Habits", "How streams start and end, straight from the export.", [
      el("div", { class: "cols two" }, [
        el("div", {}, [charts.rankBars(starts, {
          title: "How a track starts", value: function (r) { return r.value; },
          label: function (r) { return r.name; }, format: function (v) { return util.int(v); },
          labelHead: "Reason", valueHead: "Streams"
        })]),
        el("div", {}, [charts.rankBars(reasons, {
          title: "How a track ends", value: function (r) { return r.value; },
          label: function (r) { return r.name; }, format: function (v) { return util.int(v); },
          labelHead: "Reason", valueHead: "Streams"
        })])
      ])
    ]);
  }

  var REASONS = {
    trackdone: "Played to the end", fwdbtn: "Skipped forward", backbtn: "Went back",
    clickrow: "Picked from a list", playbtn: "Pressed play", appload: "App opened",
    remote: "Remote control", endplay: "Stopped", logout: "Logged out",
    trackerror: "Playback error", unknown: "Unknown", unexpected_exit: "App closed",
    "unexpected-exit-while-paused": "Closed while paused", nextbtn: "Next button",
    clickside: "Picked from a queue", uriopen: "Opened a link", switched_to_video: "Switched to video"
  };

  function searchCard() {
    var results = el("div", {});
    var input = el("input", {
      type: "search", placeholder: "Search every stream — track, artist or album",
      "aria-label": "Search your listening history"
    });
    input.addEventListener("input", util.debounce(function () {
      util.clear(results);
      var found = past.search(activeRecords(), input.value);
      if (!input.value.trim()) return;
      if (!found.length) {
        results.appendChild(el("p", { class: "muted small", text: "Nothing matches that." }));
        return;
      }
      var stats = past.aggregate(found);
      results.appendChild(charts.tiles([
        { label: "Matching streams", value: util.int(found.length) },
        { label: "Time", value: util.duration(stats.ms) },
        { label: "First", value: util.dayLabel(util.dateKey(new Date(stats.first))) },
        { label: "Last", value: util.dayLabel(util.dateKey(new Date(stats.last))) }
      ]));
      results.appendChild(timelineCard(found, 200));
    }, 250));
    return card("Find something", null, [el("div", { class: "field" }, [input]), results]);
  }

  /* ---- import ---- */

  function importCard(hasImport) {
    var status = el("p", { class: "small muted" });
    var bar = el("div", { class: "progress", hidden: true }, [el("span")]);
    var fill = bar.firstChild;

    var input = el("input", {
      type: "file", multiple: true,
      accept: ".json,.csv,.zip,application/json,text/csv,application/zip",
      style: "display:none",
      onchange: function (event) { runImport(event.target.files, status, bar, fill); }
    });

    var drop = el("div", { class: "drop" }, [
      el("p", { style: "margin:0 0 .5rem", text: hasImport ? "Add another export" : "Drop a Spotify or Apple Music export here" }),
      el("p", { class: "small muted", style: "margin:0 0 .8rem", text:
        "my_spotify_data.zip, an Apple Media Services zip, or the JSON and CSV files from inside either" }),
      el("button", { class: "btn", type: "button", text: "Choose files", onclick: function () { input.click(); } }),
      input, bar, status
    ]);

    ["dragenter", "dragover"].forEach(function (name) {
      drop.addEventListener(name, function (event) {
        event.preventDefault();
        drop.classList.add("is-over");
      });
    });
    ["dragleave", "drop"].forEach(function (name) {
      drop.addEventListener(name, function (event) {
        event.preventDefault();
        drop.classList.remove("is-over");
      });
    });
    drop.addEventListener("drop", function (event) {
      if (event.dataTransfer && event.dataTransfer.files.length) {
        runImport(event.dataTransfer.files, status, bar, fill);
      }
    });

    var meta = state.history.importMeta;
    var have = counts();
    var kids = [];

    if (!hasImport) {
      kids.push(el("p", { text:
        "Neither service's API will hand over your listening history \u2014 Spotify's " +
        "stops at the last 50 plays and Apple's has no history endpoint at all. Both " +
        "will post you the whole thing though, and both files drop straight into this " +
        "page, where they become one dataset." }));
      kids.push(el("div", { class: "cols two" }, [
        el("div", {}, [
          el("h3", { class: "viz-title", text: "Spotify" }),
          el("ol", { class: "steps" }, [
            el("li", { html: 'Open <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener">spotify.com/account/privacy</a>.' }),
            el("li", { text: "Tick \u201cExtended streaming history\u201d \u2014 every stream since you joined. (\u201cAccount data\u201d is quicker but only covers the past year.)" }),
            el("li", { text: "Confirm the email, then wait: account data lands in a few days, extended history can take up to 30." })
          ])
        ]),
        el("div", {}, [
          el("h3", { class: "viz-title", text: "Apple Music" }),
          el("ol", { class: "steps" }, [
            el("li", { html: 'Open <a href="https://privacy.apple.com/" target="_blank" rel="noopener">privacy.apple.com</a> and choose \u201cRequest a copy of your data\u201d.' }),
            el("li", { text: "Pick \u201cApple Media Services information\u201d. The music history is the part that matters." }),
            el("li", { text: "Apple emails a download link, usually within a week. Drop the zip in as it arrives." })
          ])
        ])
      ]));
      kids.push(el("p", { class: "small muted", text:
        "Nothing is uploaded either way \u2014 the zips are opened and parsed in this tab." }));
    } else {
      var lines = [];
      if (meta) {
        lines.push("Imported " + util.int(meta.records) + " streams from " + meta.files +
          " file" + (meta.files === 1 ? "" : "s") + " on " + util.dayLabel(meta.day) + ".");
      }
      if (have.apple && meta && meta.appleKind) {
        lines.push("Apple Music came from " + (SP.apple.LABELS[meta.appleKind] || meta.appleKind) + ".");
      }
      if (have.spotify && have.apple) {
        lines.push("Spotify " + util.int(have.spotify) + " streams \u00b7 Apple Music " + util.int(have.apple) + ".");
      }
      if (lines.length) kids.push(el("p", { class: "small muted", text: lines.join(" ") }));
    }

    kids.push(drop);

    if (hasImport) {
      kids.push(el("div", { class: "row", style: "margin-top:.8rem" }, [
        el("button", {
          class: "btn btn-sm btn-danger", type: "button", text: "Clear imported history",
          onclick: function () {
            if (!confirm("Delete the imported history from this browser? The export files on your computer are untouched.")) return;
            store.clearHistory().then(function () {
              state.imported = null;
              state.history.importMeta = null;
              state._lifetime = null;
              statsCache = {};
              banner("Imported history cleared.", "good");
              refresh();
            });
          }
        })
      ]));
    }
    return card(hasImport ? "Imported history" : "Import your listening history", null, kids);
  }

  function runImport(fileList, status, bar, fill) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    bar.hidden = false;
    fill.style.width = "2%";
    status.textContent = "Reading " + files.length + " file" + (files.length === 1 ? "" : "s") + "\u2026";

    collect(files, function (message, fraction) {
      status.textContent = message;
      fill.style.width = Math.round(fraction * 100) + "%";
    }).then(function (found) {
      if (!found.records.length) {
        status.textContent = explainNothing(found);
        fill.style.width = "0";
        return null;
      }
      return store.allHistory().then(function (existing) {
        /* The key carries the source, so the same song played on both
           services on the same evening isn't mistaken for a duplicate. */
        var seen = new Set();
        var had = { spotify: 0, apple: 0 };
        existing.forEach(function (record) {
          seen.add(dedupeKey(record));
          had[originOf(record)]++;
        });

        var fresh = found.records.filter(function (record) {
          var key = dedupeKey(record);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!fresh.length) {
          status.textContent = "Already imported \u2014 all " + util.int(found.records.length) + " streams were there.";
          fill.style.width = "100%";
          return null;
        }

        /* Apple's three files describe the same plays at different
           resolutions, so importing a second kind on top of a first would
           count that listening twice. */
        if (found.appleKind && had.apple && state.history.importMeta &&
            state.history.importMeta.appleKind &&
            state.history.importMeta.appleKind !== found.appleKind) {
          var was = SP.apple.LABELS[state.history.importMeta.appleKind] || "another file";
          var now = SP.apple.LABELS[found.appleKind] || "this file";
          if (!confirm("This browser already holds Apple Music history from " + was +
              ", and " + now + " describes the same plays. Importing both will count " +
              "that listening twice.\n\nImport anyway?")) {
            status.textContent = "Left as it was. Clear the imported history first to switch files.";
            fill.style.width = "0";
            return null;
          }
        }

        status.textContent = "Saving " + util.int(fresh.length) + " streams\u2026";
        return store.addHistory(fresh, function (done, total) {
          fill.style.width = Math.round((done / total) * 100) + "%";
        }).then(function () {
          return store.setMeta("import", {
            records: existing.length + fresh.length,
            files: found.files,
            day: util.dateKey(new Date()),
            appleKind: found.appleKind || (state.history.importMeta && state.history.importMeta.appleKind) || null
          });
        }).then(function () {
          state.imported = null;
          state.history.importMeta = null;
          state._lifetime = null;
          statsCache = {};
          banner(importSummary(fresh, found), "good");
          refresh();
        });
      });
    }).catch(function (err) {
      status.textContent = err.message;
      fill.style.width = "0";
    });
  }

  function dedupeKey(record) {
    return originOf(record) + "|" + record.ts + "|" + record.ms + "|" + record.track;
  }

  function importSummary(fresh, found) {
    var byOrigin = { spotify: 0, apple: 0 };
    fresh.forEach(function (record) { byOrigin[originOf(record)]++; });
    var parts = [];
    if (byOrigin.spotify) parts.push(util.int(byOrigin.spotify) + " from Spotify");
    if (byOrigin.apple) {
      parts.push(util.int(byOrigin.apple) + " from Apple Music" +
        (found.appleKind ? " (" + SP.apple.LABELS[found.appleKind] + ")" : ""));
    }
    return "Imported " + util.int(fresh.length) + " streams \u2014 " + parts.join(" and ") + ".";
  }

  /* When a drop yields nothing, say what was actually in it rather than a
     flat "no data" \u2014 usually it's the wrong file out of the export. */
  function explainNothing(found) {
    if (found.unknown.length) {
      var first = found.unknown[0];
      return "Couldn't read " + first.name + ". Columns found: " +
        first.headers.slice(0, 6).join(", ") + (first.headers.length > 6 ? "\u2026" : "") + ".";
    }
    if (found.skipped) {
      return "No listening history in those files \u2014 look for Streaming_History_*.json, " +
        "endsong_*.json, or Apple's Play Activity / Play History Daily Tracks CSVs.";
    }
    return "Nothing to import.";
  }

  /* Pulls history out of whatever was dropped: zips (including a zip inside a
     zip, which is how Apple's download often arrives), Spotify JSON and Apple
     CSV, in any mix. Anything else is skipped.

     Apple's files overlap, so only the richest kind present is kept. */
  function collect(files, report) {
    var records = [];
    var apple = {};          /* kind -> records, so only the best one is used */
    var used = 0;
    var skipped = 0;
    var unknown = [];
    var index = 0;

    function readText(name, text) {
      if (/\.csv$/i.test(name)) {
        var found = SP.apple.parseFile(text, name);
        if (!found.kind || found.kind === "other") {
          if (found.headers.length) unknown.push({ name: name.split("/").pop(), headers: found.headers });
          else skipped++;
          return;
        }
        if (!found.records.length) { skipped++; return; }
        if (!apple[found.kind]) apple[found.kind] = [];
        found.records.forEach(function (record) { apple[found.kind].push(record); });
        used++;
        return;
      }
      var parsed = past.parseFile(text);
      if (parsed.length) {
        used++;
        parsed.forEach(function (record) { records.push(record); });
      } else {
        skipped++;
      }
    }

    function wanted(name) {
      return past.isHistoryFile(name) || SP.apple.isAppleFile(name);
    }

    function readZip(buffer, label, progress) {
      var entries = unzip.entries(buffer).filter(function (entry) { return !entry.directory; });
      var nested = entries.filter(function (entry) { return /\.zip$/i.test(entry.name); });
      var direct = entries.filter(function (entry) { return wanted(entry.name); });
      if (!direct.length && !nested.length) { skipped++; return Promise.resolve(); }

      return direct.reduce(function (chain, entry, position) {
        return chain.then(function () {
          report("Unpacking " + entry.name.split("/").pop() + "\u2026",
            progress + (position + 1) / (direct.length + nested.length + 1) / (files.length + 1));
          return entry.text().then(function (text) { readText(entry.name, text); });
        });
      }, Promise.resolve()).then(function () {
        /* Apple's download is frequently a zip of zips. */
        return nested.reduce(function (chain, entry) {
          return chain.then(function () {
            report("Opening " + entry.name.split("/").pop() + "\u2026", progress);
            return entry.read().then(function (bytes) {
              return readZip(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
                entry.name, progress);
            });
          });
        }, Promise.resolve());
      });
    }

    function next() {
      if (index >= files.length) return Promise.resolve(finish());
      var file = files[index++];
      var progress = index / (files.length + 1);
      report("Reading " + file.name + "\u2026", progress);

      var task;
      if (/\.zip$/i.test(file.name)) {
        task = file.arrayBuffer().then(function (buffer) { return readZip(buffer, file.name, progress); });
      } else if (/\.(json|csv)$/i.test(file.name)) {
        task = file.text().then(function (text) { readText(file.name, text); })
          .catch(function () { skipped++; });
      } else {
        skipped++;
        task = Promise.resolve();
      }
      return task.then(next);
    }

    function finish() {
      var kinds = Object.keys(apple);
      var appleKind = null;
      if (kinds.length) {
        appleKind = kinds.reduce(function (best, kind) { return SP.apple.better(best, kind); });
        apple[appleKind].forEach(function (record) { records.push(record); });
      }
      return {
        records: records, files: used, skipped: skipped, unknown: unknown,
        appleKind: appleKind,
        appleSkipped: kinds.filter(function (kind) { return kind !== appleKind; })
      };
    }

    return next();
  }

  function loadImported() {
    return store.allHistory().then(function (rows) {
      return store.getMeta("import").then(function (meta) {
        state.history.importMeta = meta || null;
        return rows;
      });
    });
  }

  /* ---- setup ---- */

  function renderSetup(view) {
    var id = auth.clientId();
    var own = auth.ownClientId();
    var uri = auth.redirectUri();

    view.appendChild(card("Connection", null, [
      el("p", { class: state.connected ? "banner is-good" : "banner", text: state.connected
        ? "Connected" + (state.me ? " as " + (state.me.display_name || state.me.id) : "") + "."
        : (own ? "Client ID saved. Not connected yet." : (id ? "Ready — tap Connect Spotify." : "Not set up yet.")) }),
      el("div", { class: "row" }, [
        state.connected
          ? el("button", { class: "btn btn-danger", type: "button", text: "Disconnect", onclick: disconnect })
          : el("button", { class: "btn btn-primary", type: "button", text: "Connect Spotify", disabled: !id, onclick: startLogin })
      ])
    ]));

    var input = el("input", { type: "text", value: own, placeholder: "e.g. 3a9f0c2e5b7d4f1a8c6e2b4d9f7a1c3e", "aria-label": "Spotify client ID", spellcheck: "false" });
    view.appendChild(card("Your own Spotify app", "Optional. This site already has a Spotify app built in, so its owner can just connect. It's in development mode, though, so any other account needs its own app — two minutes, once.", [
      el("ol", { class: "steps" }, [
        el("li", { html: 'Open the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">Spotify developer dashboard</a> and click <b>Create app</b>. Any name will do.' }),
        el("li", {}, [
          el("span", { text: "Set the Redirect URI to exactly this — click to copy:" }),
          el("div", { style: "margin:.4rem 0" }, [
            el("code", { class: "copy", text: uri, title: "Click to copy", onclick: function (event) {
              navigator.clipboard.writeText(uri).then(function () {
                banner("Redirect URI copied.", "good");
              }).catch(function () {
                var range = document.createRange();
                range.selectNodeContents(event.currentTarget);
                var selection = getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
              });
            } })
          ])
        ]),
        el("li", { text: "Tick the Web API, save, then copy the app's Client ID." }),
        el("li", { text: "Paste it here. It stays in this browser — a client ID isn't a secret, and there is no client secret in this flow (PKCE)." })
      ]),
      el("div", { class: "field" }, [
        input,
        el("button", { class: "btn", type: "button", text: "Save", onclick: function () {
          auth.setClientId(input.value);
          banner(auth.ownClientId() ? "Client ID saved." : "Client ID cleared — back to the built-in one.", "good");
          refresh();
        } })
      ]),
      el("p", { class: "small muted", text:
        "While your Spotify app sits in developer mode only accounts you list under " +
        "Settings → User Management can connect — add yourself and you're done." })
    ]));

    view.appendChild(card("What this app asks for", null, [
      el("p", { class: "small muted", text: "Read-only scopes. Nothing here can change your account, your playlists or your playback." }),
      el("ul", { class: "small muted" }, auth.SCOPES.map(function (scope) { return el("li", { text: scope }); }))
    ]));

    var storageBox = el("div", {}, [loading("Measuring what's stored…")]);
    Promise.all([store.countPlays(), store.countHistory(), store.estimate()]).then(function (out) {
      util.clear(storageBox);
      var bytes = out[2] && out[2].usage ? out[2].usage : null;
      storageBox.appendChild(charts.tiles([
        { label: "Plays logged", value: util.int(out[0]) },
        { label: "Imported streams", value: util.int(out[1]) },
        { label: "Browser storage used", value: bytes ? (bytes / 1048576).toFixed(1) + " MB" : "—" }
      ]));
      storageBox.appendChild(el("div", { class: "row", style: "margin-top:.9rem" }, [
        el("button", { class: "btn btn-sm btn-danger", type: "button", text: "Clear play log", onclick: function () {
          if (!confirm("Delete every play this app has logged? This can't be undone.")) return;
          store.clearPlays().then(function () {
            state.log = null; statsCache = {};
            banner("Play log cleared.", "good");
            refresh();
          });
        } }),
        el("button", { class: "btn btn-sm btn-danger", type: "button", text: "Clear imported history", onclick: function () {
          if (!confirm("Delete the imported history? Your export file is untouched.")) return;
          store.clearHistory().then(function () {
            state.imported = null; state._lifetime = null; statsCache = {};
            banner("Imported history cleared.", "good");
            refresh();
          });
        } })
      ]));
    }).catch(function (err) {
      util.clear(storageBox);
      storageBox.appendChild(el("p", { class: "small muted", text: err.message }));
    });
    view.appendChild(card("Stored on this device", null, [storageBox]));

    view.appendChild(card("Where your data goes", null, [
      el("p", { class: "small muted", text:
        "Nowhere. The page is static, the token exchange goes straight from your browser " +
        "to accounts.spotify.com, and everything it reads stays in this browser's storage. " +
        "Clearing site data removes all of it." })
    ]));
  }

  /* ---- artist drill-down ---- */

  function showArtist(name, apiArtist) {
    /* Always the whole source, never the year filter: "your #3 artist" and
       "first heard" mean your listening, not the slice on screen. And it's the
       cached aggregate, so opening this is free. */
    var stats = activeRecords().length ? sourceStats() : null;
    var detail = stats ? past.artistDetail(stats, name) : null;

    var body = el("div", {});
    if (detail) {
      var artist = detail.artist;
      body.appendChild(charts.tiles([
        { label: "You rank them", value: "#" + artist.rank,
          note: "of " + util.int(stats.uniqueArtists) + " artists you've played" },
        stats.uniqueArtists >= 20
          ? { label: "Top", value: percentText(artist.topPercent), note: "of the artists you play" }
          : null,
        { label: "Share of your listening", value: (artist.share * 100).toFixed(1) + "%" },
        { label: "Listening time", value: util.duration(artist.ms) },
        { label: "Streams", value: util.int(artist.plays) },
        { label: "Different tracks", value: util.int(detail.tracks.length) },
        { label: "First heard", value: util.dayLabel(util.dateKey(new Date(artist.first))) },
        { label: "Last heard", value: util.dayLabel(util.dateKey(new Date(artist.last))) }
      ].filter(Boolean)));

      if (artist.bySource && artist.bySource.size > 1) {
        var split = [];
        artist.bySource.forEach(function (ms, source) { split.push({ source: source, ms: ms }); });
        split.sort(function (a, b) { return b.ms - a.ms; });
        body.appendChild(el("p", { class: "small muted", text: "Played on " +
          split.map(function (entry) {
            return sourceName(entry.source) + " (" + util.duration(entry.ms) + ")";
          }).join(" and ") + "." }));
      }

      if (detail.years.length > 1) {
        body.appendChild(charts.columns(detail.years.map(function (year) {
          return { name: String(year.year), value: year.ms };
        }), { title: "By year", format: util.duration, labelHead: "Year", valueHead: "Time", height: 160 }));
      }
      body.appendChild(charts.rankBars(detail.tracks.slice(0, 15), {
        title: "Most played", value: function (t) { return t.ms; }, label: function (t) { return t.name; },
        meta: function (t) { return t.album || ""; }, format: util.duration,
        labelHead: "Track", valueHead: "Time"
      }));
    } else {
      body.appendChild(el("p", { class: "muted", text:
        "No streams for " + name + " in the history loaded here. Import your data export to see the whole picture." }));
    }

    if (apiArtist) {
      var world = [];
      if (apiArtist.followers) world.push(util.int(apiArtist.followers.total) + " followers on Spotify");
      if (apiArtist.popularity !== undefined) world.push(apiArtist.popularity + "/100 popularity");
      body.appendChild(el("p", { class: "small muted", style: "margin-top:.9rem", text:
        [(apiArtist.genres || []).join(", ")].concat(world).filter(Boolean).join(" \u00b7 ") }));
    }

    if (detail) {
      body.appendChild(el("p", { class: "small muted", text:
        "These percentages are about your own listening. Spotify works out the " +
        "\u201ctop 1% of listeners worldwide\u201d figure for Wrapped against everyone " +
        "who played the artist, and never publishes it \u2014 no API gives out " +
        "listener counts or percentiles, so no app outside Spotify can show it." }));
    }

    openModal(name, body);
  }

  function openModal(title, body) {
    var box = el("div", { class: "modal-box", role: "dialog", "aria-modal": "true", "aria-label": title }, [
      el("div", { class: "modal-head" }, [
        el("h2", { text: title }),
        el("button", { class: "btn btn-sm btn-ghost", type: "button", text: "Close", onclick: close })
      ]),
      body
    ]);
    var back = el("div", { class: "modal", onclick: function (event) { if (event.target === back) close(); } }, [box]);
    function close() {
      back.remove();
      document.removeEventListener("keydown", onKey);
      charts.hideTip();
    }
    function onKey(event) { if (event.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    document.body.appendChild(back);
    box.querySelector("button").focus();
  }

  /* ---- connect / disconnect / polling ---- */

  function startLogin() {
    clearBanners();
    auth.login().catch(function (err) { banner(err.message, "bad"); });
  }

  function disconnect() {
    auth.logout();
    state.connected = false;
    state.me = null;
    state.library = null;
    Object.keys(state).forEach(function (key) {
      if (key.indexOf("top:") === 0) delete state[key];
    });
    state.error = {};
    banner("Disconnected. Your play log and imported history are still here.", "good");
    buildHeader();
    refresh();
  }

  /* One poll of the 50-play feed. Everything new goes into the log. */
  function poll(force) {
    if (!state.connected || !navigator.onLine) return Promise.resolve(0);
    var last = util.load("lastPoll", 0);
    if (!force && Date.now() - last < 60000) return Promise.resolve(0);
    util.save("lastPoll", Date.now());
    return api.recentlyPlayed().then(function (page) {
      var records = (page && page.items || [])
        .map(past.fromRecentlyPlayed)
        .filter(function (record) { return record && isFinite(record.ts); });
      if (!records.length) return 0;
      return store.addPlays(records).then(function (added) {
        if (added) {
          state.log = null;
          state.history.logCount += added;
          statsCache = {};
        }
        return added;
      });
    });
  }

  function buildHeader() {
    var connect = $("connectBtn");
    connect.textContent = state.connected ? "Connected" : (auth.clientId() ? "Connect Spotify" : "Set up");
    connect.classList.toggle("btn-primary", !state.connected);
    connect.onclick = function () {
      if (state.connected) go("setup");
      else if (auth.clientId()) startLogin();
      else go("setup");
    };
    var who = $("who");
    if (state.connected && state.me) {
      who.hidden = false;
      $("whoName").textContent = state.me.display_name || state.me.id;
      var art = util.art(state.me.images, 60);
      $("whoArt").hidden = !art;
      if (art) $("whoArt").src = art;
    } else {
      who.hidden = true;
    }
  }

  /* ---- add to home screen ---- */

  var install = { prompt: null, dismissed: util.load("installDismissed", false) };

  function standalone() {
    return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) ||
      navigator.standalone === true;
  }

  function isApple() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  /* Chrome and Edge hand us a real install prompt; Safari never will, so iOS
     gets the Share-sheet instructions instead. Either way it only shows on the
     two tabs where it isn't in the way, and never once installed. */
  function installCard() {
    if (standalone() || install.dismissed) return null;
    if (state.tab !== "overview" && state.tab !== "setup") return null;
    var canPrompt = !!install.prompt;
    if (!canPrompt && !isApple()) return null;

    return el("div", { class: "install" }, [
      el("img", { src: "icon-192.png", alt: "", width: 40, height: 40 }),
      el("div", { class: "install-body" }, [
        el("div", { class: "install-title", text: "Keep this on your home screen" }),
        el("div", { class: "install-note", html: canPrompt
          ? "It opens full screen, and your history works with no signal."
          : "Tap <b>Share</b>, then <kbd>Add to Home Screen</kbd>. It opens full " +
            "screen, and your history works with no signal." })
      ]),
      canPrompt ? el("button", { class: "btn btn-primary btn-sm", type: "button", text: "Install", onclick: function () {
        var prompt = install.prompt;
        install.prompt = null;
        prompt.prompt();
        prompt.userChoice.then(function (choice) {
          if (choice.outcome !== "accepted") install.prompt = prompt;
          refresh();
        });
      } }) : null,
      el("button", { class: "btn btn-sm btn-ghost", type: "button", text: "Not now", onclick: function () {
        install.dismissed = true;
        util.save("installDismissed", true);
        refresh();
      } })
    ]);
  }

  /* ---- theme ---- */

  function initTheme() {
    var saved = util.load("theme", null);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    $("themeBtn").addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var dark = current
        ? current === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      util.save("theme", next);
    });
  }

  /* ---- boot ---- */

  function boot() {
    initTheme();
    buildTabs();

    var wanted = location.hash.replace("#", "");
    if (TABS.some(function (tab) { return tab.id === wanted; })) state.tab = wanted;

    state.connected = auth.isConnected();
    buildHeader();
    go(state.tab);

    auth.handleRedirect().then(function (result) {
      if (result === "connected") {
        state.connected = true;
        buildHeader();
        banner("Connected to Spotify.", "good");
        go("overview");
        startPolling();
      } else if (state.connected) {
        startPolling();
      }
    }).catch(function (err) {
      banner(err.message, "bad");
      go("setup");
    });

    /* A count is cheap; the rows themselves are only worth loading when
       there's something to show. */
    store.countHistory().then(function (count) {
      if (!count) return;
      return loadImported().then(function (rows) {
        state.imported = rows;
        state._lifetime = null;
        refresh();
      });
    }).catch(function () { /* no storage, no history — the rest still works */ });

    store.countPlays().then(function (count) {
      state.history.logCount = count;
      if (count && state.tab === "overview") refresh();
    }).catch(function () { /* ignore */ });
  }

  var polling = false;

  function startPolling() {
    if (polling) return;
    polling = true;
    poll(true).then(function (added) {
      if (added) refresh();
    }).catch(function (err) {
      if (err.status !== 403) banner("Couldn't read recent plays: " + err.message, "bad");
    });
    setInterval(function () {
      if (document.visibilityState !== "visible") return;
      poll(false).then(function (added) { if (added) refresh(); }).catch(function () { /* quiet */ });
    }, POLL_MS);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        poll(false).then(function (added) { if (added) refresh(); }).catch(function () { /* quiet */ });
      }
    });
  }

  /* The all-time picture for views outside the history tab: the export when
     there is one, otherwise whatever the play log has managed to collect. */
  function allTimeStats() {
    var imported = lifetimeStats();
    if (imported) return imported;
    if (state.log && state.log.length) {
      if (!state._logStats || state._logStatsFor !== state.log.length) {
        state._logStats = past.aggregate(state.log);
        state._logStatsFor = state.log.length;
      }
      return state._logStats;
    }
    return null;
  }

  function rankedArtist(name) {
    var stats = allTimeStats();
    if (!stats) return null;
    var artist = stats.artists.get(past.artistKey(name));
    return artist ? { artist: artist, stats: stats } : null;
  }

  function lifetimeStats() {
    if (!state.imported || !state.imported.length) return null;
    if (!state._lifetime) state._lifetime = past.aggregate(state.imported);
    return state._lifetime;
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    install.prompt = event;
    install.dismissed = false;
    refresh();
  });

  window.addEventListener("appinstalled", function () {
    install.prompt = null;
    banner("Added to your home screen.", "good");
    refresh();
  });

  window.addEventListener("online", function () {
    refresh();
    poll(true).then(function (added) { if (added) refresh(); }).catch(function () { /* quiet */ });
  });
  window.addEventListener("offline", refresh);

  window.addEventListener("hashchange", function () {
    var wanted = location.hash.replace("#", "");
    if (wanted && wanted !== state.tab && TABS.some(function (tab) { return tab.id === wanted; })) go(wanted);
  });

  SP.app = { state: state, go: go, poll: poll, lifetimeStats: lifetimeStats };

  boot();
})();
