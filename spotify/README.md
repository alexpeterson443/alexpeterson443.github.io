# Listening Stats

A static page that links your Spotify account and shows your listening history
and stats. No server, no build step, no dependencies — eight plain `<script>`
files and a stylesheet, served straight from GitHub Pages.

Live at **/spotify/** on this site.

## What you get

| Tab | What's in it |
|---|---|
| **Overview** | What's playing now, your headline numbers, top five artists and tracks, the last two weeks of plays |
| **Top** | Your top 50 artists and tracks over 4 weeks / 6 months / all time, the genres behind them, and when those tracks were released |
| **Recent** | Every play this app has logged, a weekday-by-hour heatmap, most-played artists and tracks, and a full timeline |
| **Library** | Saved tracks, albums, playlists and follows; when you saved things; which artists and release years fill your library |
| **Full history** | Your entire listening life from a Spotify data export: lifetime hours, streaks, top artists/tracks/albums, year-by-year and month-by-month, a listening clock, a calendar per year, skip and shuffle rates, platforms, countries, and search over every stream |
| **Setup** | Client ID, connection, what's stored on this device, and how to wipe it |

## Setting it up (once, about two minutes)

Spotify requires every app to have its own client ID, and a static page can't
keep a secret — so this uses **Authorization Code with PKCE**, where you bring
your own ID and no client secret exists at all.

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
  js/util.js          formatting, storage, DOM helpers
  js/auth.js          PKCE login, token refresh
  js/api.js           Web API client: retries, 429 backoff, pagination
  js/store.js         IndexedDB: the play log and imported history
  js/unzip.js         ZIP reader built on DecompressionStream
  js/history.js       export parsing and all the aggregation
  js/charts.js        SVG/HTML chart primitives
  js/app.js           views, routing, loading
  test/               node tests for the parser and the zip reader
```

## Tests

```sh
npm test          # or: node spotify/test/history.test.js
```

Covers the three export shapes, the aggregation maths (totals, streaks,
sessions, skip rates, per-year rollups), the platform-string collapsing, junk
input, and unzipping a real deflated archive.
