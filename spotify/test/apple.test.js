/* Node tests for the CSV reader, the Apple Music parsers, and the merge:
   the same song played on both services has to become one row.
   Run with: node spotify/test/apple.test.js */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var JS = path.join(__dirname, "..", "js");
var sandbox = { console: console, TextDecoder: TextDecoder, TextEncoder: TextEncoder };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
["util.js", "csv.js", "apple.js", "history.js"].forEach(function (file) {
  vm.runInContext(fs.readFileSync(path.join(JS, file), "utf8"), sandbox, { filename: file });
});
var SP = sandbox.SP;

var failures = 0;
function check(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures++;
    console.error("FAIL  " + label + "\n  expected " + JSON.stringify(expected) + "\n  got      " + JSON.stringify(actual));
  } else {
    console.log("ok    " + label);
  }
}
function checkTrue(label, value) { check(label, !!value, true); }

/* ---- the CSV reader ---- */

check("csv: plain rows", SP.csv.rows("a,b\n1,2\n"), [["a", "b"], ["1", "2"]]);
check("csv: quoted comma", SP.csv.rows('a,b\n"Hello, world",2')[1], ["Hello, world", "2"]);
check("csv: doubled quotes", SP.csv.rows('a\n"She said ""hi"""')[1], ['She said "hi"']);
check("csv: newline inside a quoted field", SP.csv.rows('a,b\n"two\nlines",x')[1], ["two\nlines", "x"]);
check("csv: CRLF", SP.csv.rows("a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]]);
check("csv: BOM is stripped", SP.csv.rows("﻿a,b\n1,2")[0], ["a", "b"]);
check("csv: trailing newline makes no empty row", SP.csv.rows("a\n1\n").length, 2);
check("csv: empty fields survive", SP.csv.rows("a,b,c\n1,,3")[1], ["1", "", "3"]);

var columns = SP.csv.columns(["Event Start Timestamp", "Song Name", " Play Duration Milliseconds "]);
check("csv: column lookup ignores case and padding", columns.pick("play duration milliseconds"), 2);
check("csv: column lookup takes the first candidate present", columns.pick("content name", "song name"), 1);
check("csv: missing column is -1", columns.pick("nope"), -1);

/* ---- Apple: one row per play ---- */

var ACTIVITY = [
  "Artist Name,Song Name,Album Name,Event Start Timestamp,Event End Timestamp,Play Duration Milliseconds,Media Duration In Milliseconds,End Reason Type,Offline,Store Front Name,Source Type,Media Type",
  'Frank Ocean,Nights,Blonde,2023-06-11T23:05:12Z,2023-06-11T23:10:19Z,307000,307000,NATURAL_END_OF_TRACK,false,United States (US),IPHONE,AUDIO',
  'Phoebe Bridgers,"Motion Sickness, Pt. 2",Stranger,2023-06-12T08:00:00Z,2023-06-12T08:00:12Z,12000,240000,TRACK_SKIPPED_FORWARDS,true,United States (US),MAC,AUDIO',
  'Some Band,A Video,Clips,2023-06-12T09:00:00Z,2023-06-12T09:03:00Z,180000,180000,NATURAL_END_OF_TRACK,false,United States (US),MAC,VIDEO'
].join("\n");

var activity = SP.apple.parseFile(ACTIVITY, "Apple Music Play Activity.csv");
check("activity: recognised", activity.kind, "activity");
check("activity: video rows dropped", activity.records.length, 2);
check("activity: artist", activity.records[0].artist, "Frank Ocean");
check("activity: track", activity.records[0].track, "Nights");
check("activity: album", activity.records[0].album, "Blonde");
check("activity: duration", activity.records[0].ms, 307000);
check("activity: timestamp is UTC", new Date(activity.records[0].ts).toISOString(), "2023-06-11T23:05:12.000Z");
check("activity: source tagged", activity.records[0].source, "apple");
check("activity: end reason mapped to the shared vocabulary", activity.records[0].reasonEnd, "trackdone");
check("activity: skip detected", activity.records[1].skipped, true);
check("activity: skip reason mapped", activity.records[1].reasonEnd, "fwdbtn");
check("activity: quoted title with a comma", activity.records[1].track, "Motion Sickness, Pt. 2");
check("activity: offline flag", activity.records[1].offline, true);
check("activity: country code pulled from the store front", activity.records[0].country, "US");

/* Older exports call the title "Content Name". */
var OLD = [
  "Artist Name,Content Name,Event Start Timestamp,Play Duration Milliseconds",
  "Radiohead,Nude,2021-01-02T10:00:00Z,260000"
].join("\n");
check("activity: the older Content Name column still works",
  SP.apple.parseFile(OLD, "Apple Music Play Activity.csv").records[0].track, "Nude");

/* A duration that can't be true is pulled back to the track's own length. */
var SILLY = [
  "Artist Name,Song Name,Event Start Timestamp,Play Duration Milliseconds,Media Duration In Milliseconds",
  "Artist,Song,2021-01-02T10:00:00Z,999999999,240000",
  "Artist,Song,2021-01-03T10:00:00Z,-5,240000"
].join("\n");
var silly = SP.apple.parseFile(SILLY, "Apple Music Play Activity.csv").records;
check("activity: absurd duration clamped to the track length", silly[0].ms, 240000);
check("activity: negative duration becomes zero", silly[1].ms, 0);

/* ---- Apple: one row per track per day ---- */

var DAILY = [
  "Country,Track Identifier,Media type,Date Played,Hours,Play Duration Milliseconds,End Reason Type,Source Type,Play Count,Skip Count,Track Description",
  'US,123,AUDIO,20230611,"18, 19",600000,NATURAL_END_OF_TRACK,LIBRARY,3,1,Frank Ocean - Nights',
  "US,456,AUDIO,2023-06-12,9,180000,NATURAL_END_OF_TRACK,LIBRARY,1,0,Fleetwood Mac - Dreams"
].join("\n");

var daily = SP.apple.parseFile(DAILY, "Apple Music - Play History Daily Tracks.csv");
check("daily: recognised", daily.kind, "daily");
check("daily: a play count becomes that many rows", daily.records.length, 4);
check("daily: the day's total is preserved",
  daily.records.slice(0, 3).reduce(function (sum, r) { return sum + r.ms; }, 0), 600000);
check("daily: artist split from the description", daily.records[0].artist, "Frank Ocean");
check("daily: track split from the description", daily.records[0].track, "Nights");
check("daily: rebuilt times are marked", daily.records[0].approxTime, true);
check("daily: hours from the file are used",
  daily.records.slice(0, 3).map(function (r) { return new Date(r.ts).getHours(); }), [18, 19, 18]);
check("daily: the day is right", new Date(daily.records[0].ts).getDate(), 11);
check("daily: skip count marks that many plays",
  daily.records.slice(0, 3).filter(function (r) { return r.skipped; }).length, 1);
check("daily: YYYY-MM-DD dates parse too", new Date(daily.records[3].ts).getDate(), 12);

check("description: a dash in the title is kept",
  SP.apple.splitDescription("Godspeed You! Black Emperor - Storm - Lift Yr. Skinny Fists"),
  { artist: "Godspeed You! Black Emperor", track: "Storm - Lift Yr. Skinny Fists" });
check("description: en dash separator", SP.apple.splitDescription("Artist – Track"),
  { artist: "Artist", track: "Track" });

/* ---- Apple: the recent list ---- */

var RECENT = [
  "Track Description,Container Album Name,First Event Timestamp,Last Event End Timestamp,Play Duration Milliseconds,Media Duration In Milliseconds",
  "SZA - Good Days,SOS,2024-02-01T12:00:00Z,2024-02-01T12:04:39Z,279000,279000"
].join("\n");
var recent = SP.apple.parseFile(RECENT, "Apple Music - Recently Played Tracks.csv");
check("recent: recognised", recent.kind, "recent");
check("recent: artist and track", [recent.records[0].artist, recent.records[0].track], ["SZA", "Good Days"]);
check("recent: album", recent.records[0].album, "SOS");

check("preference: play activity beats the daily roll-up", SP.apple.better("daily", "activity"), "activity");
check("preference: the daily roll-up beats the recent list", SP.apple.better("recent", "daily"), "daily");

/* A library file is Apple's, but it isn't listening history. */
var LIBRARY = "Track Identifier,Title,Artist,Album,Date Added\n1,Nights,Frank Ocean,Blonde,2020-01-01";
check("library files are left alone",
  SP.apple.parseFile(LIBRARY, "Apple Music Library Tracks.csv").kind, "other");

/* An unfamiliar shape reports its headers instead of importing nothing. */
var STRANGE = "Some Column,Another\n1,2";
var strange = SP.apple.parseFile(STRANGE, "Apple Music Mystery.csv");
check("an unknown shape is not claimed", strange.kind, null);
check("an unknown shape hands back its headers", strange.headers, ["Some Column", "Another"]);

check("file matcher: play activity", SP.apple.isAppleFile("Apple Music Play Activity.csv"), true);
check("file matcher: daily tracks", SP.apple.isAppleFile("Apple Music Activity/Apple Music - Play History Daily Tracks.csv"), true);
check("file matcher: not a spotify json", SP.apple.isAppleFile("endsong_0.json"), false);

/* ---- the merge ---- */

var spotifyRows = SP.history.parseFile(JSON.stringify([
  {
    ts: "2023-06-11T23:05:12Z", ms_played: 307000,
    master_metadata_track_name: "Nights",
    master_metadata_album_artist_name: "Frank Ocean",
    master_metadata_album_album_name: "Blonde",
    spotify_track_uri: "spotify:track:731fPFLGBMzpzrdfVxwp2A",
    reason_end: "trackdone", shuffle: false, skipped: false
  },
  {
    /* Same recording, different label: Spotify's remaster suffix must not
       split this away from Apple's plain title. */
    ts: "2023-06-12T10:00:00Z", ms_played: 257000,
    master_metadata_track_name: "Dreams - 2004 Remaster",
    master_metadata_album_artist_name: "Fleetwood Mac",
    master_metadata_album_album_name: "Rumours", spotify_track_uri: "spotify:track:x",
    reason_end: "trackdone", shuffle: false, skipped: false
  }
]));
spotifyRows.forEach(function (row) { row.source = "spotify"; });

var appleRows = SP.apple.parseFile([
  "Artist Name,Song Name,Album Name,Event Start Timestamp,Play Duration Milliseconds",
  "frank ocean,nights,Blonde,2024-01-05T20:00:00Z,300000",
  "Fleetwood Mac,Dreams,Rumours,2024-01-06T20:00:00Z,257000",
  "Caroline Polachek,Bunny Is a Rider,Bunny,2024-01-07T20:00:00Z,200000"
].join("\n"), "Apple Music Play Activity.csv").records;

var merged = SP.history.aggregate(spotifyRows.concat(appleRows));

check("merge: one artist entry for both services", merged.uniqueArtists, 3);
check("merge: case differences fold together",
  merged.artists.get(SP.history.artistKey("Frank Ocean")).plays, 2);
check("merge: the times add up across services",
  merged.artists.get(SP.history.artistKey("Frank Ocean")).ms, 607000);
check("merge: a remaster suffix doesn't split a track",
  merged.tracks.get(SP.history.trackKey("Fleetwood Mac", "Dreams")).plays, 2);
check("merge: tracks counted once per pair", merged.uniqueTracks, 3);

var bySource = merged.artists.get(SP.history.artistKey("Frank Ocean")).bySource;
check("merge: each artist keeps the per-service split",
  [bySource.get("spotify"), bySource.get("apple")], [307000, 300000]);
check("merge: totals are tracked per service",
  [merged.sources.get("spotify").streams, merged.sources.get("apple").streams], [2, 3]);
check("merge: service totals sum to the whole",
  merged.sources.get("spotify").ms + merged.sources.get("apple").ms, merged.ms);

/* A live take is a different recording and must stay separate. */
var live = SP.history.aggregate(SP.history.parseFile(JSON.stringify([
  { ts: "2023-01-01T10:00:00Z", ms_played: 200000, master_metadata_track_name: "Dreams",
    master_metadata_album_artist_name: "Fleetwood Mac", master_metadata_album_album_name: "Rumours" },
  { ts: "2023-01-02T10:00:00Z", ms_played: 200000, master_metadata_track_name: "Dreams - Live",
    master_metadata_album_artist_name: "Fleetwood Mac", master_metadata_album_album_name: "Live" }
])));
check("merge: a live version stays its own track", live.uniqueTracks, 2);

/* Rows stored before the app knew about Apple Music have no source field. */
var legacy = SP.history.aggregate([
  { ts: Date.UTC(2022, 0, 1), ms: 1000, track: "T", artist: "A", album: null, kind: "track" }
]);
check("merge: a source-less row counts as Spotify", legacy.sources.get("spotify").streams, 1);

console.log(failures ? "\n" + failures + " failing check(s)" : "\nall checks passed");
process.exit(failures ? 1 : 0);
