# UWM Eats

A small static site that shows the daily menus for every dining spot at
UW-Milwaukee: <https://sandburgmenu.com>

## How it works

UWM Dining publishes its menus through Nutrislice. That API sends no CORS
headers and returns roughly 5 MB per week per meal, so the browser can't call
it directly. Instead:

1. `scripts/fetch_menus.py` pulls two weeks for all 16 locations, keeps only
   what the page shows (name, station, description, serving size,
   calories/macros, dietary tags and allergens), and writes
   `sandburg/data/index.json` plus one `sandburg/data/menus/<slug>/<date>.json`
   per location per day - about 6 MB total instead of ~100 MB.
2. `.github/workflows/refresh-menu.yml` runs that script every morning at
   4:10 am Central, commits the result, and redeploys to Cloudflare Workers.
3. The page loads `data/index.json` once, then one day file at a time.

The refresh runs in GitHub Actions rather than a Cloudflare Cron Trigger
because this account is on the Workers Free plan, where a cron invocation gets
10 ms of CPU. One 5 MB Nutrislice payload costs about 7.6 ms just to parse, and
a full refresh parses 44 of them.

## Locations

Thirteen locations publish structured menus: Sandburg Cafe and Cambridge Cafe
break theirs into breakfast/lunch/dinner (plus snacks and late night), and the
rest publish a single all-day menu.

Three - Palm Gardens, Burger King and Taco Bell - publish a fixed menu board as
images rather than per-item data. The fetch script mirrors those images into
`sandburg/data/images/` and the page shows them instead of the day rail and
filters.

## Features

- A location picker that tags every spot Open or Closed on the cafe's clock,
  re-checked every minute, with today's hours under it.
- Opens on today's date and the meal being served right now (Central time).
- Day rail across the published weeks, a segmented meal switcher where a
  location serves more than one meal, and items grouped by station.
- Station navigation that follows your scroll - a sticky chip rail on phones, a
  pinned sidebar list on tablets and desktops.
- Search, Vegetarian/Vegan and Favorites filters, and "hide items containing"
  for the ten allergens Nutrislice tags.
- A summary line ("157 items - 22 stations - 71 vegan") that tracks the filters.
- Tap an item for its serving size, a protein/carb/fat split bar and the full
  nutrition panel.
- Star items as favorites; a banner calls them out when they're on the menu.
- Filters, favorites and your last location persist in `localStorage`, and each
  viewed day is cached there so the page still works offline.
- Light and dark themes, and a full-bleed layout from a 320px phone to a
  desktop.
- An "AA" control cycles the menu text through three sizes.
- Keyboard: `/` focuses search, arrow keys move between days.

## Installing it as an app

`manifest.webmanifest` plus `sw.js` make the page installable: Safari's
*Share -> Add to Home Screen*, or the install button in Chrome/Edge. The service
worker caches the page shell and the last menu data it saw, so it opens without
a connection.

## Running it locally

```sh
python3 scripts/fetch_menus.py --weeks 2 --out sandburg/data   # refresh the data
python3 -m http.server 8000 --directory sandburg               # then open /
```

Useful flags: `--only sandburg-cafe,palm-gardens` limits the fetch to a few
locations while testing.

## Deploying

```sh
npm run deploy    # wrangler deploy - publishes sandburg/ to Cloudflare Workers
```

CI does this automatically; the workflow needs a `CLOUDFLARE_API_TOKEN` repo
secret with the "Edit Cloudflare Workers" template.
