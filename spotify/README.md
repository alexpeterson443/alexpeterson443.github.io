# Listening Stats

A static page that links your Spotify account and shows your listening history
and stats, with Apple Music's history merged into the same dataset. No server,
no build step, no dependencies — ten plain `<script>` files and a stylesheet,
served straight from GitHub Pages.

Live at **/spotify/** on this site.

## What you get

| Tab | What's in it |
|---|---|
| **Overview** | What's playing now, your headline numbers, top five artists and tracks, the last two weeks of plays |
| **Top** | Your top 50 artists and tracks over 4 weeks / 6 months / all time, the genres behind them, and when those tracks were released |
| **Recent** | Every play this app has logged, a weekday-by-hour heatmap, most-played artists and tracks, and a full timeline |
| **Library** | Saved tracks, albums, playlists and follows; when you saved things; which artists and release years fill your library |
| **Full history** | Your entire listening life from your Spotify and Apple Music data exports, merged: lifetime hours, streaks, top artists/tracks/albums, where each artist ranks in your listening, year-by-year and month-by-month, a listening clock, a calendar per year, skip and shuffle rates, platforms, countries, and search over every stream |
| **Setup** | Client ID, connection, what's stored on this device, and how to wipe it |

## Add it to your home screen

It's a progressive web app, so it installs like an app without being one.

- **iPhone / iPad:** open it in Safari, tap **Share**, then **Add to Home Screen**.
- **Android / desktop Chrome:** an **Install** button appears on the Overview tab
  (or use the browser's own install item).

Installed, it opens full screen with its own icon, and the shell is cached by a
service worker — so the Full history tab works with **no signal at all**, since
the play log and the imported history live in IndexedDB on the device. Anything
that needs Spotify says so and fills in when you're back online.

One thing worth knowing: **connect Spotify from inside the installed app**. A
home-screen app can keep its own storage jar, so a login started in the browser
may leave the connection in the browser. The login itself survives coming back
in a different tab or window — the PKCE verifier is kept for the round trip
rather than tied to one browsing context — but it lands wherever it started.

The icons are generated, not hand-drawn: `node spotify/tools/make-icons.mjs`
re-renders every PNG from the same source artwork as `icon.svg`.

## Setting it up (once, about two minutes)

Spotify requires every app to have its own client ID, and a static page can't
keep a secret — so this uses **Authorization Code with PKCE**, where no client
secret exists at all.

The site owner's client ID is built in (`DEFAULT_CLIENT_ID` in `js/auth.js` — a
PKCE client ID is public by design), so on this site the owner just presses
Connect. Anyone else, or a fork served from another address, brings their own
ID, which overrides the built-in one:

1. Open the [Spotify developer dashboard](https://developer.spotify.com/dashboard)
   and click **Create app**.
2. Set the **Redirect URI** to the page's own address, exactly — the Setup tab
   prints the right one and copies it on click. On this site that's
   `https://alexpeterson443.github.io/spotify/`.
3. Tick **Web API**, save, and copy the **Client ID**.
4. Paste it into the Setup tab and press Connect.

While the Spotify app sits in developer mode, only accounts listed under
**Settings → User Management** can connect — add yourself there.

The scopes are all read-only: profile, top lists, recently played, library,
playlists, follows and playback state. Nothing here can change your account.

## The 50-play problem, and the way around it

Spotify's Web API only ever returns the **50 most recent plays** — there is no
endpoint for older history. So this page does two things:

- **Logs as it goes.** Every visit polls the recently-played feed and saves
  anything new into IndexedDB, so the log grows over time instead of resetting
  to the last 50. Duration is estimated from track length, since that feed
  reports what started, not how long it ran.
- **Imports your data export.** The full history lives in the download you can
  request at [spotify.com/account/privacy](https://www.spotify.com/account/privacy/).
  Pick **Extended streaming history** (every stream since you joined; up to 30
  days to arrive) rather than **Account data** (quick, but only the past year).
  Drop `my_spotify_data.zip` onto the Full history tab — the zip is unpacked and
  parsed in the browser, nothing is uploaded.

Three export shapes are handled, and one download often has more than one:

| File | Era |
|---|---|
| `Streaming_History_Audio_<years>_<n>.json` | current extended export |
| `endsong_<n>.json` | older extended export |
| `StreamingHistory_music_<n>.json` | the small account export |

Only the extended ones carry skips, shuffle, platform and country; the page says
so where those stats appear.

Audio features (danceability, energy, tempo) are **not** here: Spotify
deprecated `/audio-features` for new apps in November 2024, and any app created
since gets a 403.

## Two services, one dataset

Spotify and Apple Music are counted together, not side by side. An artist you
played on both is **one row** with one total; the split is still there when you
want it.

Tracks and artists are matched by name rather than by ID, because Apple's export
carries no Spotify URI and Spotify's carries no Apple one. Names are folded
first: case, accents, curly apostrophes and dash styles. Track titles also lose
the version suffix that means *the same recording under a different label* —
`Dreams - 2004 Remaster` is `Dreams`. Live takes, remixes, acoustic and
instrumental versions keep theirs, because those really are different
recordings.

What you get from the merge:

- **One set of totals** across both services, and one ranking of artists.
- **A "Where it came from" card** — hours, streams and share per service.
- **A switch per source** (Spotify export / Apple Music / the play log), so you
  can see any one service's numbers on their own.
- **A per-artist split** in the drill-down: *Played on Spotify (5 d 7 hr) and
  Apple Music (2 d 1 hr).*

### Getting the Apple Music export

Open [privacy.apple.com](https://privacy.apple.com/), choose **Request a copy of
your data**, and pick **Apple Media Services information**. It usually arrives
within a week, as a zip — often a zip inside a zip, which this page opens either
way. Three files in it describe listening history:

| File | What it holds |
|---|---|
| `Apple Music Play Activity.csv` | one row per play, with real timestamps — the best of the three |
| `Apple Music - Play History Daily Tracks.csv` | one row per track per day: a date, the hours, a play count and a total |
| `Apple Music - Recently Played Tracks.csv` | the short recent list |

They overlap, so **only the richest one present is imported** — taking two would
count the same listening twice. If you later import a different one on top, the
page says so and asks first.

The daily file has no clock time for individual plays, so those are rebuilt: the
day's total is split across its play count and spread through the hours the file
lists. Totals, days and hours stay exact; only the minute inside the hour is
inferred, and the app says so wherever those rows are counted.

Columns are matched by name against a list of candidates, since Apple has
renamed fields between exports (`Song Name` used to be `Content Name`). A file
that doesn't match anything reports the columns it *did* find rather than
silently importing nothing.

## "Top 1% of listeners" — why this app can't show that

Wrapped's line about being in the top fraction of an artist's listeners is
computed inside Spotify against everyone who played them. **No Web API endpoint
exposes it**, or monthly listeners, or any listener count you could derive it
from — so no third-party app can show that number, and one that claims to is
making it up.

What every artist does carry here is your own standing, which is real and
computable from your history:

- **Your rank** — #3 of the 412 artists you have played.
- **The percentile that follows from it** — "top 0.7% of the artists you play".
  Ties share a rank, and a library under 20 artists shows the plain rank
  instead, since a percentile of eight names means nothing.
- **Share of your time** — what fraction of all your listening went to them.

They appear under every artist in the Full history list, in the artist
drill-down, and on the Top tab's artist cards (as `Yours:`), drawn from your
imported export or, failing that, from the play log.

## Where your data lives

On your device. The token exchange goes from your browser straight to
`accounts.spotify.com`; the tokens sit in `localStorage`, the play log and any
imported history in IndexedDB. There is no backend to send it to. Clearing site
data removes all of it, and the Setup tab has buttons for each piece.

## Files

```
spotify/
  index.html          page shell
  style.css           tokens, layout, chart styling
  manifest.webmanifest  home-screen identity: name, icons, standalone display
  sw.js               service worker: caches the shell so it opens offline
  tools/make-icons.mjs  regenerates the PNG icons from the SVG artwork
  js/util.js          formatting, storage, DOM helpers
  js/auth.js          PKCE login, token refresh
  js/api.js           Web API client: retries, 429 backoff, pagination
  js/store.js         IndexedDB: the play log and imported history
  js/unzip.js         ZIP reader built on DecompressionStream
  js/csv.js           RFC 4180 CSV reader, row by row
  js/apple.js         the three Apple Music export shapes
  js/history.js       export parsing, merge keys and all the aggregation
  js/charts.js        SVG/HTML chart primitives
  js/app.js           views, routing, loading
  test/               node tests for the parser and the zip reader
```

## Tests

```sh
npm test          # or: node spotify/test/history.test.js
```

Covers Spotify's three export shapes and Apple's three, the aggregation maths
(totals, streaks, sessions, skip rates, per-year rollups, per-artist ranking),
the CSV reader's quoting and newline rules, the merge itself (same song on both
services becoming one row, a remaster suffix not splitting a track, a live take
staying separate, per-service splits adding up), the platform-string collapsing,
junk input, and unzipping a real deflated archive.
