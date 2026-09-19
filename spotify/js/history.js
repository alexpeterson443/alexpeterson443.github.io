/* Reads a Spotify data export and turns it into numbers.

   Spotify ships listening history in three shapes over the years, and an
   account that's been around a while can hold all three in one download:

     Streaming_History_Audio_2019-2021_0.json   extended export, current
     endsong_0.json                             extended export, older name
     StreamingHistory_music_0.json              the small account export

   The first two carry ms_played, skips, shuffle, platform and country; the
   third only carries a timestamp, a name and a duration. Everything is
   normalized to one record shape and the stats say which fields are real. */
window.SP = window.SP || {};

SP.history = (function () {
  "use strict";

  var util = SP.util;

  var FILE_RE = /(streaming[ _-]?history|endsong)/i;
  var SESSION_GAP = 30 * 60 * 1000;

  function isHistoryFile(name) {
    var base = name.split("/").pop();
    return /\.json$/i.test(base) && FILE_RE.test(base) && base.charAt(0) !== ".";
  }

  /* ---- normalizing ---- */

  function normalize(row) {
    if (!row || typeof row !== "object") return null;

    var ts, ms;
    if (row.ts !== undefined) {
      ts = Date.parse(row.ts);
      ms = Number(row.ms_played) || 0;
    } else if (row.endTime !== undefined) {
      /* The small account export writes "2023-06-11 23:05", documented as UTC. */
      ts = Date.parse(row.endTime.replace(" ", "T") + ":00Z");
      ms = Number(row.msPlayed) || 0;
    } else {
      return null;
    }
    if (!isFinite(ts)) return null;

    var track = row.master_metadata_track_name || row.trackName || null;
    var episode = row.episode_name || null;
    var audiobook = row.audiobook_title || null;

    var record = {
      ts: ts,
      ms: ms,
      track: track || episode || audiobook || "Unknown",
      artist: row.master_metadata_album_artist_name || row.artistName ||
              row.episode_show_name || row.audiobook_title || "Unknown",
      album: row.master_metadata_album_album_name || row.episode_show_name || null,
      uri: row.spotify_track_uri || row.spotify_episode_uri || null,
      kind: track ? "track" : (episode ? "episode" : (audiobook ? "audiobook" : "track"))
    };

    if (row.skipped !== undefined && row.skipped !== null) record.skipped = !!row.skipped;
    if (row.shuffle !== undefined && row.shuffle !== null) record.shuffle = !!row.shuffle;
    if (row.offline !== undefined && row.offline !== null) record.offline = !!row.offline;
    if (row.platform) record.platform = String(row.platform);
    if (row.conn_country) record.country = String(row.conn_country);
    if (row.reason_start) record.reasonStart = String(row.reason_start);
    if (row.reason_end) record.reasonEnd = String(row.reason_end);
    return record;
  }

  function parseFile(text) {
    var data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Expected a JSON array of streams.");
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var record = normalize(data[i]);
      if (record) out.push(record);
    }
    return out;
  }

  /* A play the app logged itself, shaped like an export row. Spotify's
     recently-played feed reports what started, not how long it ran, so the
     track's own length is the honest estimate. */
  function fromRecentlyPlayed(item) {
    if (!item || !item.track) return null;
    var track = item.track;
    var artists = (track.artists || []).map(function (a) { return a.name; });
    return {
      ts: Date.parse(item.played_at),
      ms: track.duration_ms || 0,
      track: track.name || "Unknown",
      artist: artists[0] || "Unknown",
      album: (track.album && track.album.name) || null,
      uri: track.uri || null,
      kind: track.type === "episode" ? "episode" : "track",
      art: track.album ? util.art(track.album.images, 64) : null,
      estimated: true
    };
  }

  /* ---- aggregating ---- */

  function keyOf(record) {
    return record.uri || (record.artist + "\u0000" + record.track);
  }

  function bump(map, key, seed) {
    var entry = map.get(key);
    if (!entry) { entry = seed(); map.set(key, entry); }
    return entry;
  }

  function count(map, key) {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  }

  function emptyMatrix() {
    var rows = [];
    for (var day = 0; day < 7; day++) rows.push(new Array(24).fill(0));
    return rows;
  }

  /* One pass over every stream. Everything the UI shows is derived from this. */
  function aggregate(records, opts) {
    opts = opts || {};
    var minMs = opts.minMs === undefined ? 0 : opts.minMs;

    var stats = {
      streams: 0, ms: 0, first: null, last: null,
      tracks: new Map(), artists: new Map(), albums: new Map(),
      days: new Map(), dayPlays: new Map(), months: new Map(), years: new Map(),
      hours: new Array(24).fill(0), hourPlays: new Array(24).fill(0),
      weekHourMs: emptyMatrix(), weekHourPlays: emptyMatrix(),
      weekdays: new Array(7).fill(0), weekdayPlays: new Array(7).fill(0),
      platforms: new Map(), countries: new Map(),
      reasonStart: new Map(), reasonEnd: new Map(),
      skipped: 0, skippable: 0, shuffled: 0, shuffleKnown: 0, offline: 0,
      episodes: { streams: 0, ms: 0, shows: new Map() },
      estimated: 0,
      ignored: 0
    };

    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.ms < minMs) { stats.ignored++; continue; }

      var date = new Date(r.ts);
      stats.streams++;
      stats.ms += r.ms;
      if (stats.first === null || r.ts < stats.first) stats.first = r.ts;
      if (stats.last === null || r.ts > stats.last) stats.last = r.ts;
      if (r.estimated) stats.estimated++;

      if (r.kind === "episode") {
        stats.episodes.streams++;
        stats.episodes.ms += r.ms;
        var show = bump(stats.episodes.shows, r.artist, function () {
          return { name: r.artist, ms: 0, plays: 0 };
        });
        show.ms += r.ms;
        show.plays++;
      }

      var tKey = keyOf(r);
      var track = bump(stats.tracks, tKey, function () {
        return { key: tKey, name: r.track, artist: r.artist, album: r.album, uri: r.uri,
                 art: r.art || null, ms: 0, plays: 0, skips: 0, first: r.ts, last: r.ts };
      });
      track.ms += r.ms;
      track.plays++;
      if (r.ts < track.first) track.first = r.ts;
      if (r.ts > track.last) track.last = r.ts;
      if (!track.art && r.art) track.art = r.art;

      var artist = bump(stats.artists, r.artist, function () {
        return { name: r.artist, ms: 0, plays: 0, first: r.ts, last: r.ts,
                 tracks: new Map(), years: new Map(), art: r.art || null };
      });
      artist.ms += r.ms;
      artist.plays++;
      if (r.ts < artist.first) artist.first = r.ts;
      if (r.ts > artist.last) artist.last = r.ts;
      if (!artist.art && r.art) artist.art = r.art;
      artist.tracks.set(tKey, (artist.tracks.get(tKey) || 0) + r.ms);

      if (r.album) {
        var aKey = r.artist + "\u0000" + r.album;
        var album = bump(stats.albums, aKey, function () {
          return { key: aKey, name: r.album, artist: r.artist, art: r.art || null, ms: 0, plays: 0 };
        });
        album.ms += r.ms;
        album.plays++;
        if (!album.art && r.art) album.art = r.art;
      }

      var dayKey = util.dateKey(date);
      stats.days.set(dayKey, (stats.days.get(dayKey) || 0) + r.ms);
      stats.dayPlays.set(dayKey, (stats.dayPlays.get(dayKey) || 0) + 1);

      var ymKey = util.monthKey(date);
      var month = bump(stats.months, ymKey, function () { return { key: ymKey, ms: 0, plays: 0 }; });
      month.ms += r.ms;
      month.plays++;

      var yearKey = date.getFullYear();
      var year = bump(stats.years, yearKey, function () {
        return { year: yearKey, ms: 0, plays: 0, artists: new Map(), tracks: new Map(), days: new Set() };
      });
      year.ms += r.ms;
      year.plays++;
      year.days.add(dayKey);
      year.artists.set(r.artist, (year.artists.get(r.artist) || 0) + r.ms);
      year.tracks.set(tKey, (year.tracks.get(tKey) || 0) + r.ms);
      artist.years.set(yearKey, (artist.years.get(yearKey) || 0) + r.ms);

      var hour = date.getHours();
      stats.hours[hour] += r.ms;
      stats.hourPlays[hour]++;
      var weekday = date.getDay();
      stats.weekdays[weekday] += r.ms;
      stats.weekdayPlays[weekday]++;
      stats.weekHourMs[weekday][hour] += r.ms;
      stats.weekHourPlays[weekday][hour]++;

      count(stats.platforms, platformName(r.platform));
      count(stats.countries, r.country);
      count(stats.reasonStart, r.reasonStart);
      count(stats.reasonEnd, r.reasonEnd);

      if (r.skipped !== undefined) {
        stats.skippable++;
        if (r.skipped) { stats.skipped++; track.skips++; }
      } else if (r.reasonEnd === "fwdbtn") {
        stats.skippable++;
        stats.skipped++;
        track.skips++;
      }
      if (r.shuffle !== undefined) {
        stats.shuffleKnown++;
        if (r.shuffle) stats.shuffled++;
      }
      if (r.offline) stats.offline++;
    }

    derive(stats, records, minMs);
    return stats;
  }

  /* Spotify's platform strings are long and machine-ish
     ("Android OS 13 API 33 (samsung, SM-S911U)"); the family is the part a
     person recognises. */
  function platformName(raw) {
    if (!raw) return null;
    var value = String(raw);
    if (/android/i.test(value)) return "Android";
    if (/(ios|iphone|ipad)/i.test(value)) return "iPhone / iPad";
    if (/(osx|mac|darwin)/i.test(value)) return "Mac";
    if (/(windows|win32|winnt)/i.test(value)) return "Windows";
    if (/linux/i.test(value)) return "Linux";
    if (/(web_player|webplayer|browser)/i.test(value)) return "Web player";
    if (/(cast|chromecast)/i.test(value)) return "Cast";
    if (/partner|sonos|tv|xbox|playstation/i.test(value)) return "Speaker / TV";
    return value.length > 24 ? value.slice(0, 24) + "…" : value;
  }

  function derive(stats, records, minMs) {
    stats.uniqueTracks = stats.tracks.size;
    stats.uniqueArtists = stats.artists.size;
    stats.uniqueAlbums = stats.albums.size;
    stats.activeDays = stats.days.size;
    stats.skipRate = stats.skippable ? stats.skipped / stats.skippable : null;
    stats.shuffleRate = stats.shuffleKnown ? stats.shuffled / stats.shuffleKnown : null;

    var dayKeys = Array.from(stats.days.keys()).sort();
    stats.busiestDay = null;
    stats.days.forEach(function (ms, key) {
      if (!stats.busiestDay || ms > stats.busiestDay.ms) stats.busiestDay = { day: key, ms: ms };
    });
    stats.streak = longestStreak(dayKeys);
    stats.span = stats.first === null ? 0 :
      Math.max(1, Math.round((stats.last - stats.first) / util.DAY_MS) + 1);
    stats.dailyAverage = stats.span ? stats.ms / stats.span : 0;
    stats.perActiveDay = stats.activeDays ? stats.ms / stats.activeDays : 0;

    /* Sessions: consecutive streams with less than half an hour between them. */
    var ordered = records
      .filter(function (r) { return r.ms >= minMs; })
      .map(function (r) { return { ts: r.ts, ms: r.ms }; })
      .sort(function (a, b) { return a.ts - b.ts; });

    var sessions = 0;
    var longest = null;
    var current = null;
    for (var i = 0; i < ordered.length; i++) {
      var row = ordered[i];
      if (!current || row.ts - current.end > SESSION_GAP) {
        if (current && (!longest || current.ms > longest.ms)) longest = current;
        current = { start: row.ts, end: row.ts + row.ms, ms: row.ms, streams: 1 };
        sessions++;
      } else {
        current.end = Math.max(current.end, row.ts + row.ms);
        current.ms += row.ms;
        current.streams++;
      }
    }
    if (current && (!longest || current.ms > longest.ms)) longest = current;
    stats.sessions = sessions;
    stats.longestSession = longest;

    stats.yearList = Array.from(stats.years.values()).sort(function (a, b) { return a.year - b.year; });
    stats.yearList.forEach(function (year) {
      year.topArtist = biggest(year.artists);
      var topTrackKey = biggest(year.tracks);
      year.topTrack = topTrackKey ? stats.tracks.get(topTrackKey.key) : null;
      year.topTrackMs = topTrackKey ? topTrackKey.ms : 0;
      year.activeDays = year.days.size;
    });

    stats.monthList = Array.from(stats.months.values()).sort(function (a, b) {
      return a.key < b.key ? -1 : 1;
    });
  }

  function biggest(map) {
    var best = null;
    map.forEach(function (ms, key) {
      if (!best || ms > best.ms) best = { key: key, ms: ms };
    });
    return best;
  }

  function longestStreak(sortedDayKeys) {
    if (!sortedDayKeys.length) return { length: 0, from: null, to: null };
    var best = { length: 1, from: sortedDayKeys[0], to: sortedDayKeys[0] };
    var run = 1;
    for (var i = 1; i < sortedDayKeys.length; i++) {
      var prev = new Date(sortedDayKeys[i - 1] + "T12:00:00");
      var cur = new Date(sortedDayKeys[i] + "T12:00:00");
      var gap = Math.round((cur - prev) / util.DAY_MS);
      run = gap === 1 ? run + 1 : 1;
      if (run > best.length) {
        best = { length: run, from: sortedDayKeys[i - run + 1], to: sortedDayKeys[i] };
      }
    }
    return best;
  }

  /* ---- views over the aggregate ---- */

  function topList(map, n, key) {
    return util.topOf(map, n, key || "ms");
  }

  function countList(map, n) {
    var out = [];
    map.forEach(function (value, key) { out.push({ name: key, value: value }); });
    out.sort(function (a, b) { return b.value - a.value; });
    return n ? out.slice(0, n) : out;
  }

  function artistDetail(stats, name) {
    var artist = stats.artists.get(name);
    if (!artist) return null;
    var tracks = [];
    artist.tracks.forEach(function (ms, key) {
      var track = stats.tracks.get(key);
      if (track) tracks.push({ name: track.name, album: track.album, ms: ms, plays: track.plays });
    });
    tracks.sort(function (a, b) { return b.ms - a.ms; });
    var years = [];
    artist.years.forEach(function (ms, year) { years.push({ year: year, ms: ms }); });
    years.sort(function (a, b) { return a.year - b.year; });
    return { artist: artist, tracks: tracks, years: years };
  }

  /* No `limit` means every match — the caller wants honest totals and can
     slice the list it shows. */
  function search(records, query, limit) {
    var needle = query.trim().toLowerCase();
    if (!needle) return [];
    var cap = limit || Infinity;
    var out = [];
    for (var i = records.length - 1; i >= 0 && out.length < cap; i--) {
      var r = records[i];
      if (r.track.toLowerCase().indexOf(needle) !== -1 ||
          r.artist.toLowerCase().indexOf(needle) !== -1 ||
          (r.album && r.album.toLowerCase().indexOf(needle) !== -1)) {
        out.push(r);
      }
    }
    return out.sort(function (a, b) { return b.ts - a.ts; });
  }

  return {
    isHistoryFile: isHistoryFile,
    parseFile: parseFile,
    fromRecentlyPlayed: fromRecentlyPlayed,
    aggregate: aggregate,
    platformName: platformName,
    topList: topList,
    countList: countList,
    artistDetail: artistDetail,
    search: search
  };
})();
