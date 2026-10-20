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
| **Scan** | Full-screen viewfinder with torch and camera flip. Capture, and the app reads the dominant paint colour off the frame, grabs a coarse location, optionally runs an on-device vision model to name the car, then ranks the rest of the catalog so the cars that actually live on your street are one tap away. |
| **Map** | Your sightings plotted against each other, with spread and unique-location stats. |
| **Hunts** | Three daily bounties and one weekly, generated deterministically from the date — everyone gets the same ones on the same day, with no server involved. Plus 15 curated collection sets. |
| **Garage** | Level, XP, streak, rarity breakdown, 16 badges, settings, and full data export/import. |

## Visual identification

Optional, off by default. Turn it on and REDLINE will try to name the car in
your photo before you touch the list.

It's **MobileCLIP-S0 running in the tab** — zero-shot, no training on our part,
no server. The trick that makes it cheap: CLIP has two towers, and the text one
never has to ship. Every car in the catalog was embedded ahead of time by
`tools/build-embeddings.mjs` and baked into a 129 KB int8 blob. At runtime the
app downloads only the vision tower (~21 MB, once, cached by the browser),
embeds your photo, and takes 257 dot products against that blob. WebGPU when
the device has it, WASM everywhere else.

**How well it works.** Against the full 257-car catalog, on seven real
photographs:

| Photo | Top guess | |
|---|---|---|
| Land Rover Defender | Land Rover Defender 90 — 87% | ✅ |
| Ferrari F40 | Ferrari F40 — 75% | ✅ |
| Lamborghini Countach | Lamborghini Countach LP400 — 66% | ✅ |
| Ford F-150 | Ford F-150 — 52% | ✅ |
| Mazda MX-5 (NA) | Mazda MX-5 Miata (NA) — 50% | ✅ correct generation |
| 2018 Toyota Camry | Nissan Altima — 39% | ❌ Accord 2nd, Sentra 3rd |
| 1957 VW Beetle | Fiat 500 Nuova — 28% | ❌ right era, wrong car |

Distinctive shapes it gets right and says so confidently. Anonymous modern
sedans it does not — and its confidence drops accordingly, which is the useful
part. Below ~50% the app says so in as many words and points you at the list.

**Your own history breaks the ties.** Cars you log often, and cars logged near
this spot before, get a small additive nudge. It is deliberately small: 0.035
against cosine gaps that run 0.05+ between genuinely different cars, so it can
only decide a near-tie. In the table above it flips exactly one row — the Camry,
from Altima — and leaves all five confident answers untouched. 5/7 → 6/7.

**The manual list never goes away.** The guesses sit above a search field over
the whole catalog, because a model that's right five times in seven is an
accelerator, not an oracle.

The photo is never uploaded. Fetching the model weights is the only network
request this app makes, ever; decline it and everything else still works.

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

**Private by construction.** No account, no server, no analytics. Photos and
state live in IndexedDB on the device; coordinates are rounded to ~11 m before
they're written. Export gives you a single JSON file with everything in it, and
import merges it back. The one and only network request the app can make is
fetching the vision model, and only if you ask for it.

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
│   ├── ai.js                   MobileCLIP vision tower + embedding search
│   └── app.js                  router, views, sheets, reveal, share export
├── ai/car-embeddings.bin       257 × 512 int8 text embeddings (129 KB)
├── tools/build-embeddings.mjs  regenerates the above; not shipped to the browser
└── assets/                     tachometer icon (SVG + rendered PNGs)
```

The app itself has no build step and no dependencies — plain ES modules served
straight from Pages. `tools/` is the one exception: it runs in Node to
regenerate the embedding blob whenever the catalog changes.

## Adding a car

Append a row to `ROWS` in `js/catalog.js`:

```
id|Make|Model|yearStart|yearEnd|body|country|drive|hp|engine|rarity|tags
```

`yearEnd` of `0` means still in production. `body` is one of the eleven
silhouette keys. `rarity` is 1–6. Tags drive set membership and hunt matching,
so reuse existing ones where they fit.

Then regenerate the embedding blob so visual identify knows about it:

```sh
cd tools && npm i @huggingface/transformers && node build-embeddings.mjs
```
