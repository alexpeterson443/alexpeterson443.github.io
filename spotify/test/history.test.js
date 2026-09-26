/* Node smoke test for the export parser and the aggregator.
   Run with: node spotify/test/history.test.js */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var JS = path.join(__dirname, "..", "js");
/* In a browser `window` IS the global object, so the modules' `window.SP =`
   lands in global scope. Mirror that here or the files can't see each other. */
var sandbox = { console: console, TextDecoder: TextDecoder, TextEncoder: TextEncoder };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
["util.js", "history.js"].forEach(function (file) {
  vm.runInContext(fs.readFileSync(path.join(JS, file), "utf8"), sandbox, { filename: file });
});
var SP = sandbox.SP;

var failures = 0;
function check(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures++; console.error("FAIL  " + label + "\n  expected " + JSON.stringify(expected) + "\n  got      " + JSON.stringify(actual)); }
  else console.log("ok    " + label);
}
function checkTrue(label, value) { check(label, !!value, true); }

/* ---- the three export shapes ---- */

var extended = [{
  ts: "2023-06-11T23:05:12Z",
  platform: "android",
  ms_played: 213574,
  conn_country: "US",
  master_metadata_track_name: "Nights",
  master_metadata_album_artist_name: "Frank Ocean",
  master_metadata_album_album_name: "Blonde",
  spotify_track_uri: "spotify:track:731fPFLGBMzpzrdfVxwp2A",
  episode_name: null,
  reason_start: "clickrow",
  reason_end: "trackdone",
  shuffle: false,
  skipped: false,
  offline: false
}];

var legacy = [{
  endTime: "2023-06-12 08:14",
  artistName: "Frank Ocean",
  trackName: "Nights",
  msPlayed: 60000
}];

var podcast = [{
  ts: "2023-06-13T09:00:00Z",
  ms_played: 1800000,
  master_metadata_track_name: null,
  episode_name: "Episode 12",
  episode_show_name: "Some Show",
  spotify_episode_uri: "spotify:episode:abc",
  reason_end: "endplay",
  skipped: false,
  shuffle: false
}];

var a = SP.history.parseFile(JSON.stringify(extended))[0];
check("extended: ms", a.ms, 213574);
check("extended: track", a.track, "Nights");
check("extended: artist", a.artist, "Frank Ocean");
check("extended: album", a.album, "Blonde");
check("extended: country", a.country, "US");
check("extended: kind", a.kind, "track");

var b = SP.history.parseFile(JSON.stringify(legacy))[0];
check("legacy: ms", b.ms, 60000);
check("legacy: artist", b.artist, "Frank Ocean");
check("legacy: no skip field", b.skipped, undefined);
checkTrue("legacy: timestamp parsed", isFinite(b.ts));
/* Spotify documents the small export's endTime as UTC, so it must not be read
   as the reader's local wall-clock. */
check("legacy: endTime read as UTC", new Date(b.ts).toISOString(), "2023-06-12T08:14:00.000Z");

var c = SP.history.parseFile(JSON.stringify(podcast))[0];
check("podcast: kind", c.kind, "episode");
check("podcast: show as artist", c.artist, "Some Show");

check("file matcher: extended", SP.history.isHistoryFile("MyData/Streaming_History_Audio_2019-2021_0.json"), true);
check("file matcher: endsong", SP.history.isHistoryFile("endsong_3.json"), true);
check("file matcher: legacy", SP.history.isHistoryFile("StreamingHistory_music_0.json"), true);
check("file matcher: other json", SP.history.isHistoryFile("Playlist1.json"), false);
check("file matcher: macos junk", SP.history.isHistoryFile("__MACOSX/._endsong_0.json"), false);

/* ---- aggregation over a generated year ---- */

var rows = [];
var start = Date.UTC(2024, 0, 1, 12, 0, 0);
for (var day = 0; day < 30; day++) {
  for (var play = 0; play < 4; play++) {
    var artist = play % 2 === 0 ? "Artist A" : "Artist B";
    rows.push({
      ts: new Date(start + day * 86400000 + play * 240000).toISOString(),
      ms_played: play === 3 ? 5000 : 200000,
      master_metadata_track_name: "Track " + play,
      master_metadata_album_artist_name: artist,
      master_metadata_album_album_name: "Album " + artist,
      spotify_track_uri: "spotify:track:" + artist.slice(-1) + play,
      platform: "Android OS 13 API 33 (samsung, SM-S911U)",
      conn_country: "US",
      reason_start: "trackdone",
      reason_end: play === 3 ? "fwdbtn" : "trackdone",
      shuffle: play % 2 === 0,
      skipped: play === 3
    });
  }
}
/* A gap, then one more day so the streak is not simply "every day". */
rows.push({
  ts: new Date(start + 45 * 86400000).toISOString(),
  ms_played: 100000,
  master_metadata_track_name: "Track 0",
  master_metadata_album_artist_name: "Artist A",
  master_metadata_album_album_name: "Album Artist A",
  spotify_track_uri: "spotify:track:A0",
  platform: "web_player",
  conn_country: "CA",
  reason_end: "trackdone",
  shuffle: false,
  skipped: false
});

var records = SP.history.parseFile(JSON.stringify(rows));
var stats = SP.history.aggregate(records);

check("aggregate: streams", stats.streams, 121);
check("aggregate: total ms", stats.ms, 30 * (200000 * 3 + 5000) + 100000);
/* Four distinct (artist, track) pairs: the artist alternates with the play. */
check("aggregate: unique tracks", stats.uniqueTracks, 4);
check("aggregate: unique artists", stats.uniqueArtists, 2);
check("aggregate: unique albums", stats.uniqueAlbums, 2);
check("aggregate: active days", stats.activeDays, 31);
check("aggregate: skips", stats.skipped, 30);
check("aggregate: skip rate", Math.round(stats.skipRate * 1000) / 1000, Math.round(30 / 121 * 1000) / 1000);
check("aggregate: shuffled", stats.shuffled, 60);
check("aggregate: streak length", stats.streak.length, 30);
check("aggregate: platforms collapsed", SP.history.countList(stats.platforms).map(function (p) { return p.name; }), ["Android", "Web player"]);
check("aggregate: a missing device isn't shown as one",
  SP.history.platformName("not_applicable"), "Not recorded");
check("aggregate: countries", SP.history.countList(stats.countries).length, 2);
check("aggregate: years covered", stats.yearList.length, 1);
/* The key is folded for merging; the display name is what a reader sees. */
check("aggregate: top artist of 2024", stats.yearList[0].topArtist.name, "Artist A");
check("aggregate: hours are 24 buckets", stats.hours.length, 24);
checkTrue("aggregate: hours sum to total", stats.hours.reduce(function (s, v) { return s + v; }, 0) === stats.ms);
checkTrue("aggregate: weekdays sum to total", stats.weekdays.reduce(function (s, v) { return s + v; }, 0) === stats.ms);
check("aggregate: sessions", stats.sessions, 31);
checkTrue("aggregate: busiest day found", !!stats.busiestDay);

var top = SP.history.topList(stats.artists, 5);
check("top artists: order", top.map(function (t) { return t.name; }), ["Artist A", "Artist B"]);
checkTrue("top artists: A ahead of B", top[0].ms > top[1].ms);

/* Per-artist standing: rank, share of your listening, and the percentile that
   stands in for Wrapped's unavailable "top x% of listeners". */
check("rank: artists are ranked by time", stats.rankedArtists.map(function (a) { return a.name; }), ["Artist A", "Artist B"]);
check("rank: top artist is #1", stats.rankedArtists[0].rank, 1);
check("rank: shares sum to 1", Math.round(stats.rankedArtists.reduce(function (sum, a) { return sum + a.share; }, 0) * 1000) / 1000, 1);
var artistA = stats.artists.get(SP.history.artistKey("Artist A"));
check("rank: share matches the time", Math.round(artistA.share * 1000) / 1000,
  Math.round(artistA.ms / stats.ms * 1000) / 1000);
check("rank: last artist is the 100th percentile", stats.rankedArtists[1].topPercent, 100);

/* Ties must not be split by sort luck: equal time, equal rank and percentile. */
var tieRows = [];
[["Even A", 3], ["Even B", 3], ["Quiet", 1]].forEach(function (pair) {
  for (var i = 0; i < pair[1]; i++) {
    tieRows.push({ ts: new Date(Date.UTC(2024, 0, 1 + i, 12)).toISOString(), ms_played: 120000,
      master_metadata_track_name: "T", master_metadata_album_artist_name: pair[0],
      master_metadata_album_album_name: "A", spotify_track_uri: "spotify:track:" + pair[0] });
  }
});
var tied = SP.history.aggregate(SP.history.parseFile(JSON.stringify(tieRows)));
check("rank: tied artists share a rank", tied.rankedArtists.slice(0, 2).map(function (a) { return a.rank; }), [1, 1]);
check("rank: tied artists share a percentile",
  tied.rankedArtists[0].topPercent === tied.rankedArtists[1].topPercent, true);
check("rank: the next artist keeps its own place", tied.rankedArtists[2].rank, 3);

var detail = SP.history.artistDetail(stats, "Artist A");
check("artist detail: track count", detail.tracks.length, 2);
check("artist detail: years", detail.years.length, 1);
check("artist detail: carries the ranking", detail.artist.rank, 1);

/* A minimum-play filter is how "did I actually listen" gets separated from
   "it started and I hit next". */
var filtered = SP.history.aggregate(records, { minMs: 30000 });
check("minMs: skips excluded", filtered.streams, 91);
check("minMs: ignored counted", filtered.ignored, 30);

/* ---- logged plays from the API ---- */

var logged = SP.history.fromRecentlyPlayed({
  played_at: "2024-05-05T10:00:00.000Z",
  track: {
    name: "Nights", duration_ms: 307000, uri: "spotify:track:x", type: "track",
    artists: [{ name: "Frank Ocean" }],
    album: { name: "Blonde", images: [{ url: "https://i/x.jpg", width: 300 }] }
  }
});
check("recently-played: ms falls back to track length", logged.ms, 307000);
check("recently-played: marked estimated", logged.estimated, true);
check("recently-played: art kept", logged.art, "https://i/x.jpg");

/* ---- junk in, no crash out ---- */

check("garbage rows dropped", SP.history.parseFile('[null, 5, {"nope": 1}, {"ts": "not-a-date", "ms_played": 1}]').length, 0);

console.log(failures ? "\n" + failures + " failing check(s)" : "\nall checks passed");
process.exit(failures ? 1 : 0);
