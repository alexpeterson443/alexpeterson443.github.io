/* Apple Music's side of the import.

   Apple ships listening history inside "Apple Media Services information" as
   CSV, in three files that describe the same plays at different resolutions:

     Apple Music Play Activity.csv              one row per play, exact times
     Apple Music - Play History Daily Tracks.csv  one row per track per day
     Apple Music - Recently Played Tracks.csv     the short recent list

   Only one of them is imported per drop — they overlap, so taking two would
   count the same listening twice. Play Activity wins when it's there.

   Every column is looked up by name against a list of candidates, because
   Apple has renamed fields between exports (Song Name used to be Content
   Name), and an unrecognised file reports its headers instead of silently
   importing nothing. */
window.SP = window.SP || {};

SP.apple = (function () {
  "use strict";

  var csv = SP.csv;
  var MAX_MS = 12 * 3600 * 1000;

  /* Apple's end reasons, mapped onto the tokens this app already names so a
     habits chart doesn't list the same behaviour twice under two spellings. */
  var END_REASONS = {
    NATURAL_END_OF_TRACK: "trackdone",
    TRACK_SKIPPED_FORWARDS: "fwdbtn",
    TRACK_SKIPPED_BACKWARDS: "backbtn",
    MANUALLY_SELECTED_PLAYBACK_OF_A_DIFFERENT_ITEM: "endplay",
    PLAYBACK_MANUALLY_PAUSED: "endplay",
    SCRUB_END: "endplay",
    EXITED_APPLICATION: "unexpected_exit",
    FAILED_TO_LOAD: "trackerror",
    TRACK_SKIPPED_BECAUSE_OF_ERROR: "trackerror",
    NOT_APPLICABLE: null
  };

  function endReason(raw) {
    if (!raw) return null;
    var key = raw.toUpperCase().replace(/[^A-Z_]/g, "_");
    if (key in END_REASONS) return END_REASONS[key];
    /* Anything new keeps its own wording rather than being forced into a
       bucket that might be wrong. */
    return raw.toLowerCase().replace(/_/g, " ").replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function isAppleFile(name) {
    var base = name.split("/").pop();
    if (!/\.csv$/i.test(base) || base.charAt(0) === ".") return false;
    return /apple\s*music/i.test(base) || /play\s*activity/i.test(base) ||
      /play\s*history\s*daily\s*tracks/i.test(base) || /recently\s*played\s*tracks/i.test(base);
  }

  /* Which of the three it is: the filename when it's recognisable, otherwise
     whatever the header row gives away. */
  function shapeOf(name, columns) {
    var base = (name || "").split("/").pop().toLowerCase();
    if (/play\s*activity/.test(base)) return "activity";
    if (/daily\s*tracks/.test(base)) return "daily";
    if (/recently\s*played/.test(base)) return "recent";
    if (/library\s*(tracks|activity)|likes|dislikes|identifier/.test(base)) return "other";

    if (columns.pick("event start timestamp", "event end timestamp") >= 0) return "activity";
    if (columns.pick("date played") >= 0) return "daily";
    if (columns.pick("first event timestamp", "last event end timestamp") >= 0) return "recent";
    return null;
  }

  /* Apple writes these as UTC, with or without the Z. */
  function stamp(raw) {
    if (!raw) return NaN;
    var text = raw.trim();
    if (!text) return NaN;
    if (/^\d+$/.test(text) && text.length >= 12) return Number(text); /* epoch millis */
    var iso = text.replace(" ", "T");
    if (!/[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)) iso += "Z";
    var ms = Date.parse(iso);
    return isFinite(ms) ? ms : Date.parse(text);
  }

  /* "20230611" or "2023-06-11", always the listener's local day. */
  function playedDay(raw) {
    var text = (raw || "").trim();
    var match = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(text);
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
  }

  /* Apple's durations can arrive negative, or absurdly long when a device
     reported a session badly. Trust the track's own length over both. */
  function duration(raw, mediaMs) {
    var ms = Math.round(Number(raw));
    if (!isFinite(ms) || ms < 0) ms = 0;
    if (mediaMs > 0 && ms > mediaMs * 1.5) ms = mediaMs;
    return Math.min(ms, MAX_MS);
  }

  /* "Frank Ocean - Nights" — first separator wins, so a title with a dash
     in it keeps the rest of its name. */
  function splitDescription(text) {
    var value = (text || "").trim();
    if (!value) return null;
    var match = /^(.+?)\s+[-–—]\s+(.+)$/.exec(value);
    if (!match) return { artist: "Unknown", track: value };
    return { artist: match[1].trim(), track: match[2].trim() };
  }

  function country(raw) {
    if (!raw) return null;
    /* "United States (US)" carries the code; a bare name is fine too. */
    var match = /\(([A-Z]{2})\)\s*$/.exec(raw.trim());
    return match ? match[1] : raw.trim().slice(0, 24);
  }

  function record(fields) {
    return {
      ts: fields.ts,
      ms: fields.ms,
      track: fields.track || "Unknown",
      artist: fields.artist || "Unknown",
      album: fields.album || null,
      uri: null,
      kind: "track",
      source: "apple"
    };
  }

  /* ---- one row per play ---- */

  function readActivity(text, columns, push) {
    var iArtist = columns.pick("artist name", "album artist name");
    var iTrack = columns.pick("song name", "content name", "item name", "title");
    var iAlbum = columns.pick("album name", "container album name", "album");
    var iStart = columns.pick("event start timestamp", "event received timestamp", "event end timestamp");
    var iEnd = columns.pick("event end timestamp");
    var iMs = columns.pick("play duration milliseconds", "play duration in milliseconds");
    var iMedia = columns.pick("media duration in milliseconds");
    var iReason = columns.pick("end reason type");
    var iOffline = columns.pick("offline");
    var iStore = columns.pick("store front name", "store country name", "country");
    var iSource = columns.pick("source type");
    var iMedium = columns.pick("media type", "item type");

    if (iTrack < 0 || iMs < 0 || iStart < 0) return false;

    return function (fields) {
      var medium = csv.value(fields, iMedium).toLowerCase();
      if (medium && /video/.test(medium)) return;

      var mediaMs = iMedia >= 0 ? Number(csv.value(fields, iMedia)) : 0;
      var ms = duration(csv.value(fields, iMs), mediaMs);
      var ts = stamp(csv.value(fields, iStart));
      if (!isFinite(ts) && iEnd >= 0) {
        var ended = stamp(csv.value(fields, iEnd));
        if (isFinite(ended)) ts = ended - ms;
      }
      if (!isFinite(ts)) return;

      var track = csv.value(fields, iTrack);
      if (!track) return;

      var row = record({
        ts: ts, ms: ms, track: track,
        artist: iArtist >= 0 ? csv.value(fields, iArtist) : "",
        album: iAlbum >= 0 ? csv.value(fields, iAlbum) : ""
      });

      var reason = iReason >= 0 ? endReason(csv.value(fields, iReason)) : null;
      if (reason) {
        row.reasonEnd = reason;
        row.skipped = reason === "fwdbtn";
      }
      if (iOffline >= 0) {
        var offline = csv.value(fields, iOffline).toLowerCase();
        if (offline === "true" || offline === "yes") row.offline = true;
      }
      if (iStore >= 0) {
        var where = country(csv.value(fields, iStore));
        if (where) row.country = where;
      }
      if (iSource >= 0) {
        var how = csv.value(fields, iSource);
        if (how) row.platform = how;
      }
      push(row);
    };
  }

  /* ---- one row per track per day ----

     The file gives a day, the hours it was played in, the total time and the
     play count — but not the individual plays. Those are rebuilt: the total
     is split across the count and spread through the hours listed, so every
     total stays exact and only the minute inside the hour is inferred. Rows
     built this way are marked, and the app says so. */

  function readDaily(text, columns, push) {
    var iDescription = columns.pick("track description", "track name", "song name");
    var iArtist = columns.pick("artist name", "container artist name");
    var iDate = columns.pick("date played", "play date", "date");
    var iHours = columns.pick("hours", "hour");
    var iMs = columns.pick("play duration milliseconds", "total play duration milliseconds");
    var iPlays = columns.pick("play count", "plays");
    var iSkips = columns.pick("skip count", "skips");
    var iReason = columns.pick("end reason type");
    var iCountry = columns.pick("country");
    var iMedium = columns.pick("media type", "media_type");

    if (iDescription < 0 || iDate < 0) return false;

    return function (fields) {
      var medium = csv.value(fields, iMedium).toLowerCase();
      if (medium && /video/.test(medium)) return;

      var day = playedDay(csv.value(fields, iDate));
      if (!day) return;

      var named = splitDescription(csv.value(fields, iDescription));
      if (!named) return;
      if (iArtist >= 0 && csv.value(fields, iArtist)) named.artist = csv.value(fields, iArtist);

      var totalMs = duration(csv.value(fields, iMs), 0);
      var plays = iPlays >= 0 ? Math.round(Number(csv.value(fields, iPlays))) : 1;
      if (!isFinite(plays) || plays < 1) plays = 1;
      plays = Math.min(plays, 200); /* a guard, not a real listening figure */
      var skips = iSkips >= 0 ? Math.round(Number(csv.value(fields, iSkips))) : 0;
      if (!isFinite(skips) || skips < 0) skips = 0;

      var hours = (iHours >= 0 ? csv.value(fields, iHours) : "")
        .split(/[,;]/)
        .map(function (part) { return parseInt(part, 10); })
        .filter(function (hour) { return isFinite(hour) && hour >= 0 && hour <= 23; });
      if (!hours.length) hours = [12];

      var each = Math.round(totalMs / plays);
      var reason = iReason >= 0 ? endReason(csv.value(fields, iReason)) : null;
      var place = iCountry >= 0 ? country(csv.value(fields, iCountry)) : null;

      for (var i = 0; i < plays; i++) {
        var hour = hours[i % hours.length];
        /* Spread through the hour so sessions and clocks stay believable. */
        var minute = Math.min(59, Math.round((i / plays) * 59));
        var when = new Date(day.year, day.month, day.day, hour, minute, 0);
        var row = record({
          ts: when.getTime(), ms: each, track: named.track, artist: named.artist, album: ""
        });
        row.approxTime = true;
        if (reason) row.reasonEnd = reason;
        /* The file says how many of the day's plays were skipped, not which. */
        if (iSkips >= 0) row.skipped = i >= plays - skips;
        if (place) row.country = place;
        push(row);
      }
    };
  }

  /* ---- the short recent list ---- */

  function readRecent(text, columns, push) {
    var iDescription = columns.pick("track description", "track name", "song name");
    var iAlbum = columns.pick("container album name", "album name");
    var iFirst = columns.pick("first event timestamp", "last event end timestamp");
    var iMs = columns.pick("play duration milliseconds", "media duration in milliseconds");
    var iMedia = columns.pick("media duration in milliseconds");

    if (iDescription < 0 || iFirst < 0) return false;

    return function (fields) {
      var ts = stamp(csv.value(fields, iFirst));
      if (!isFinite(ts)) return;
      var named = splitDescription(csv.value(fields, iDescription));
      if (!named) return;
      var mediaMs = iMedia >= 0 ? Number(csv.value(fields, iMedia)) : 0;
      push(record({
        ts: ts,
        ms: duration(iMs >= 0 ? csv.value(fields, iMs) : 0, mediaMs),
        track: named.track,
        artist: named.artist,
        album: iAlbum >= 0 ? csv.value(fields, iAlbum) : ""
      }));
    };
  }

  var READERS = { activity: readActivity, daily: readDaily, recent: readRecent };

  /* Returns { kind, records, headers } — kind is null when the file isn't
     Apple listening history, and headers come back so the UI can say what it
     saw instead of just failing. */
  function parseFile(text, name) {
    var header = null;
    var reader = null;
    var records = [];
    var kind = null;

    var push = function (row) { records.push(row); };

    SP.csv.parse(text, function (fields) {
      if (!header) {
        header = fields;
        var columns = SP.csv.columns(fields);
        kind = shapeOf(name, columns);
        if (!kind || kind === "other" || !READERS[kind]) { kind = kind === "other" ? "other" : null; return; }
        reader = READERS[kind](text, columns, push);
        if (!reader) kind = null;
        return;
      }
      if (reader) reader(fields);
    });

    return { kind: reader ? kind : (kind === "other" ? "other" : null), records: records, headers: header || [] };
  }

  var LABELS = {
    activity: "Play Activity",
    daily: "Play History Daily Tracks",
    recent: "Recently Played Tracks"
  };

  /* Play Activity has real timestamps, so it beats the daily roll-up, which
     beats the short recent list. */
  var PREFERENCE = ["activity", "daily", "recent"];

  function better(a, b) {
    return PREFERENCE.indexOf(a) <= PREFERENCE.indexOf(b) ? a : b;
  }

  return {
    isAppleFile: isAppleFile,
    parseFile: parseFile,
    splitDescription: splitDescription,
    endReason: endReason,
    duration: duration,
    LABELS: LABELS,
    PREFERENCE: PREFERENCE,
    better: better
  };
})();
