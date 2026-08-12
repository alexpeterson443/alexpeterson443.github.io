# REDLINE

**Spot it. Scan it. Own it.** — a mobile-first car-spotting dex.

You point your phone at a car in the wild, capture it, and it becomes a card in
your collection. 257 vehicles across six rarity tiers, from a Toyota Camry to a
250 GTO.

Live at [`/redline/`](https://alexpeterson443.github.io/redline/).

## What it does

| Screen | |
|---|---|
| **Dex** | Every car in the catalog. Collected ones wear your own photo; the rest are silhouettes. Search, filter by rarity/country/body, track completion. |
| **Scan** | Full-screen viewfinder with torch and camera flip. Capture, and the app reads the dominant paint colour off the frame, grabs a coarse location, then ranks the catalog so the cars that actually live on your street are one tap away. |
| **Map** | Your sightings plotted against each other, with spread and unique-location stats. |
| **Hunts** | Three daily bounties and one weekly, generated deterministically from the date — everyone gets the same ones on the same day, with no server involved. Plus 15 curated collection sets. |
| **Garage** | Level, XP, streak, rarity breakdown, 16 badges, settings, and full data export/import. |

## Design notes

**Your photo is the card.** The thing you shot is the artwork — not a stock
render. That's the whole point of spotting.

**The scan button is the centre of the tab bar** and the viewfinder hides the
tab bar entirely, so the shutter sits where your thumb already is.

**Rarity is encounter frequency, not value.** A Camry is Common because you'll
see forty today. A 250 GTO is a Grail because you won't see one. The catalog is
weighted so a supermarket car park is still a productive place to play.

**Holographic foil** on Legendary and Grail cards tilts with the phone's
gyroscope — faint in the grid, full-strength on the reveal.

**Offline first.** The service worker precaches the whole shell. Car parks and
underground garages have no signal and all the interesting cars.

**Private by construction.** No account, no server, no analytics, no network
calls at all. Photos and state live in IndexedDB on the device; coordinates are
rounded to ~11 m before they're written. Export gives you a single JSON file
with everything in it, and import merges it back.

## Structure

```
redline/
├── index.html                  app shell + pre-boot splash
├── manifest.webmanifest        installable PWA, portrait, shortcuts
├── sw.js                       precache shell, cache-first, offline navigation
├── css/app.css                 tokens, layout, rarity ramp, both themes
├── js/
│   ├── catalog.js              257 cars as pipe-delimited rows + 15 sets
│   ├── silhouettes.js          11 body-style side profiles, arches generated
│   ├── store.js                IndexedDB state + photo blobs, export/import
│   ├── engine.js               XP, levels, streaks, bonuses, hunts, badges
│   ├── scan.js                 camera, capture, downscale, paint analysis
│   └── app.js                  router, views, sheets, reveal, share export
└── assets/                     tachometer icon (SVG + rendered PNGs)
```

No build step, no dependencies. Plain ES modules served straight from Pages.

## Adding a car

Append a row to `ROWS` in `js/catalog.js`:

```
id|Make|Model|yearStart|yearEnd|body|country|drive|hp|engine|rarity|tags
```

`yearEnd` of `0` means still in production. `body` is one of the eleven
silhouette keys. `rarity` is 1–6. Tags drive set membership and hunt matching,
so reuse existing ones where they fit.
