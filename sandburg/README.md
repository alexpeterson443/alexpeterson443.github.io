# Sandburg Café menu

A small static site that shows the daily food menu for the Sandburg Café at
UW–Milwaukee: <https://alexpeterson443.github.io/sandburg/>

## How it works

UWM Dining publishes its menus through Nutrislice. That API sends no CORS
headers and returns roughly 5 MB per week per meal, so the browser can't call it
directly. Instead:

1. `scripts/fetch_menus.py` pulls two weeks of breakfast, lunch, dinner and
   snacks from `https://uwm.api.nutrislice.com`, keeps only what the page shows
   (name, station, description, serving size, calories/macros, dietary tags and
   allergens), and writes `data/index.json` plus one `data/menus/<date>.json`
   per day — about 100 KB a day instead of 5 MB.
2. `.github/workflows/refresh-menu.yml` runs that script every morning at
   4:10 am Central and commits the result.
3. The page loads `data/index.json` once, then one day file at a time.

## Features

- Opens on today's date and the meal being served right now (Central time).
- Day rail across the two published weeks, a segmented meal switcher, and items
  grouped by station.
- Station navigation that follows your scroll — a sticky chip rail on phones, a
  pinned sidebar list on tablets and desktops.
- Search, Vegetarian/Vegan and Favorites filters, and "hide items containing"
  for the ten allergens Nutrislice tags. On narrow screens they live in a
  collapsible panel with a count badge; on wide screens they sit in the sidebar.
- A summary line ("157 items · 22 stations · 71 vegan") that tracks the filters.
- Tap an item for its serving size, a protein/carb/fat split bar and the full
  nutrition panel.
- Star items as favorites; a banner calls them out when they're on the menu.
- Filters and favorites persist in `localStorage`, and each viewed day is cached
  there so the page still works offline.
- Open/closed status from the café's posted hours; light and dark themes.
- Keyboard: `/` focuses search, arrow keys move between days.

## Installing it as an app

`manifest.webmanifest` plus `sw.js` make the page installable: Safari's
*Share → Add to Home Screen* on an iPhone or iPad, or the install button in
Chrome/Edge, gives it its own icon (`icon.svg`, rendered to `icon-192.png`,
`icon-512.png` and `apple-touch-icon.png`) and launches it full screen. The
service worker caches the page shell and the last menu data it saw, so it opens
without a connection.

## Running it locally

```sh
python3 scripts/fetch_menus.py --weeks 2 --out data   # refresh the data
python3 -m http.server 8000                           # then open /sandburg/
```
