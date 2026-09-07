#!/usr/bin/env python3
"""Fetch UWM dining menus from Nutrislice and write slim JSON.

The Nutrislice API sends no CORS headers and returns ~5 MB per week per meal,
so the browser app can't call it directly. This script runs in CI, trims each
week down to the fields the app actually uses, and writes one file per day per
location.

Locations come in two shapes:

  * "menu"   - structured food items (Sandburg, Cambridge, the Grinds, ...).
               One file per day under menus/<slug>/<date>.json.
  * "images" - a fixed set of menu-board images, identical every day
               (Palm Gardens, Burger King, Taco Bell). Mirrored into
               images/ once and referenced from the index; no day files.

Usage: python3 scripts/fetch_menus.py [--weeks 2] [--out sandburg/data]
"""

import argparse
import datetime as dt
import gzip
import json
import os
import shutil
import sys
import urllib.error
import urllib.request

API = "https://uwm.api.nutrislice.com"
DAY_NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
UA = "uwm-eats/1.0 (+https://sandburgmenu.com)"

# Order the picker follows: the full-service halls first, then cafes, then the
# fixed-menu counters. Anything Nutrislice adds later lands at the end.
LOCATION_ORDER = [
    "sandburg-cafe",
    "cambridge-cafe",
    "union-station",
    "grind",
    "grind-library",
    "grind-lubar-entrepreneurship-center",
    "grind-sandburg-hall",
    "city-subs",
    "flour-shop",
    "gasthaus",
    "pacific-wraps",
    "pizza-presto",
    "stir-fry",
    "palm-gardens",
    "burger-king",
    "taco-bell",
]


def get_json(url, tries=4):
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Accept": "application/json", "Accept-Encoding": "gzip"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return json.loads(raw.decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as err:
            last = err
            if attempt < tries - 1:
                import time

                time.sleep(2 ** attempt)
    raise SystemExit(f"failed to fetch {url}: {last}")


def download(url, dest, tries=4):
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp, open(dest, "wb") as out:
                shutil.copyfileobj(resp, out)
            return
        except (urllib.error.URLError, TimeoutError) as err:
            last = err
            if attempt < tries - 1:
                import time

                time.sleep(2 ** attempt)
    raise SystemExit(f"failed to download {url}: {last}")


def station_name(item):
    text = (item.get("text") or "").strip()
    if text:
        return text
    alt = (item.get("image_alt") or "").strip()
    if alt.startswith("Station:"):
        alt = alt[len("Station:"):].strip()
    if alt.lower().startswith("station "):
        alt = alt[len("station "):].strip()
    return alt


def num(value, digits=0):
    if value is None:
        return None
    rounded = round(float(value), digits)
    return int(rounded) if digits == 0 else rounded


def slim_food(food, station):
    icons = (food.get("icons") or {}).get("food_icons") or []
    tags, allergens = [], []
    for icon in icons:
        if not icon.get("enabled"):
            continue
        name = icon.get("name") or icon.get("synced_name") or ""
        if icon.get("is_highlight"):
            tags.append(name)
        elif icon.get("is_filter"):
            allergens.append(name)
    nutrition = food.get("rounded_nutrition_info") or {}
    serving = food.get("serving_size_info") or {}
    amount = (serving.get("serving_size_amount") or "").strip()
    unit = (serving.get("serving_size_unit") or "").strip()
    entry = {
        "id": food.get("id"),
        "name": (food.get("name") or "").strip(),
        "station": station,
        "description": (food.get("description") or "").strip(),
        "tags": sorted(set(tags)),
        "allergens": sorted(set(allergens)),
        "serving": " ".join(p for p in (amount, unit) if p),
        "calories": num(nutrition.get("calories")),
        "protein": num(nutrition.get("g_protein")),
        "carbs": num(nutrition.get("g_carbs")),
        "fat": num(nutrition.get("g_fat")),
        "sugar": num(nutrition.get("g_sugar")),
        "fiber": num(nutrition.get("g_fiber")),
        "sodium": num(nutrition.get("mg_sodium")),
    }
    price = food.get("price")
    if price:
        entry["price"] = round(float(price), 2)
    return {k: v for k, v in entry.items() if v not in (None, "", [])}


def slim_day(day):
    """Flatten one day's menu_items into an ordered list of foods with stations."""
    station = ""
    seen = set()
    foods = []
    for item in day.get("menu_items") or []:
        if item.get("is_station_header") or item.get("is_section_title"):
            name = station_name(item)
            if name:
                station = name
            continue
        food = item.get("food")
        if not food:
            continue
        entry = slim_food(food, station)
        if not entry.get("name"):
            continue
        key = (entry["name"].lower(), entry.get("station", ""))
        if key in seen:
            continue
        seen.add(key)
        foods.append(entry)
    return foods


def day_images(day):
    """Menu-board images for a day, for locations that publish pictures not foods."""
    out = []
    for item in day.get("menu_items") or []:
        url = item.get("image")
        if not url:
            continue
        out.append({
            "url": url,
            "alt": (item.get("image_alt") or "").strip(),
            "description": (item.get("image_description") or "").strip(),
        })
    return out


def monday_of(date):
    return date - dt.timedelta(days=date.weekday())


def hours_from_school(school):
    hours = {}
    for day in DAY_NAMES:
        if not school.get(f"{day}_enabled"):
            hours[day] = None
        elif school.get(f"{day}_is_24_hours"):
            hours[day] = "24 hours"
        else:
            start = (school.get(f"{day}_start") or "")[:5]
            end = (school.get(f"{day}_end") or "")[:5]
            hours[day] = f"{start}-{end}" if start and end else None
    return hours


def menu_types(school):
    out = []
    for entry in school.get("active_menu_types") or []:
        slug = entry.get("slug") if isinstance(entry, dict) else entry
        if slug:
            out.append(slug)
    return out


def order_key(slug):
    return (LOCATION_ORDER.index(slug), slug) if slug in LOCATION_ORDER else (len(LOCATION_ORDER), slug)


def fetch_location(school, weeks, start):
    """Return (by_date, images) for one location."""
    slug = school["slug"]
    by_date = {}
    images = []
    for week in range(weeks):
        week_start = start + dt.timedelta(weeks=week)
        for meal in menu_types(school):
            url = (
                f"{API}/menu/api/weeks/school/{slug}/menu-type/{meal}/"
                f"{week_start.year}/{week_start.month:02d}/{week_start.day:02d}/"
            )
            print(f"  {slug}: {meal} week of {week_start}", file=sys.stderr)
            payload = get_json(url)
            for day in payload.get("days") or []:
                date = day.get("date")
                if not date:
                    continue
                foods = slim_day(day)
                if foods:
                    by_date.setdefault(date, {})[meal] = foods
                    continue
                # No structured foods: this may be an image-board menu. The
                # boards repeat every day, so keep the first set we see.
                if not images:
                    images = day_images(day)
    return by_date, images


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weeks", type=int, default=2, help="weeks to fetch, starting this week")
    parser.add_argument("--out", default="sandburg/data", help="output directory")
    parser.add_argument("--only", help="comma-separated slugs, for testing")
    args = parser.parse_args()

    schools = get_json(f"{API}/menu/api/schools/")
    if args.only:
        wanted = {s.strip() for s in args.only.split(",")}
        schools = [s for s in schools if s.get("slug") in wanted]
    schools.sort(key=lambda s: order_key(s.get("slug") or ""))

    today = dt.date.today()
    start = monday_of(today)

    menus_dir = os.path.join(args.out, "menus")
    images_dir = os.path.join(args.out, "images")
    os.makedirs(menus_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)

    locations = []
    written_days = 0
    written_items = 0
    fresh_day_files = set()
    fresh_images = set()

    for school in schools:
        slug = school.get("slug")
        if not slug:
            continue
        by_date, images = fetch_location(school, args.weeks, start)

        entry = {
            "slug": slug,
            "name": school.get("name"),
            "address": school.get("address"),
            "timezone": school.get("timezone") or "America/Chicago",
            "hours": hours_from_school(school),
            "meals": menu_types(school),
        }

        if by_date:
            entry["kind"] = "menu"
            entry["dates"] = sorted(by_date)
            day_dir = os.path.join(menus_dir, slug)
            os.makedirs(day_dir, exist_ok=True)
            for date, meals in sorted(by_date.items()):
                payload = {
                    "date": date,
                    "location": slug,
                    "meals": {m: meals[m] for m in entry["meals"] if m in meals},
                }
                path = os.path.join(day_dir, f"{date}.json")
                with open(path, "w", encoding="utf-8") as handle:
                    json.dump(payload, handle, separators=(",", ":"), ensure_ascii=False)
                fresh_day_files.add(os.path.relpath(path, menus_dir))
                written_items += sum(len(v) for v in meals.values())
            written_days += len(by_date)
        elif images:
            entry["kind"] = "images"
            entry["dates"] = []
            saved = []
            for i, img in enumerate(images, 1):
                ext = ".png" if "/png/" in img["url"] else ".jpg"
                name = f"{slug}-{i}{ext}"
                download(img["url"], os.path.join(images_dir, name))
                fresh_images.add(name)
                saved.append({
                    "src": f"images/{name}",
                    "alt": img["alt"] or f"{school.get('name')} menu board {i}",
                    "description": img["description"],
                })
            entry["images"] = saved
            print(f"  {slug}: {len(saved)} menu image(s)", file=sys.stderr)
        else:
            entry["kind"] = "none"
            entry["dates"] = []
            print(f"  {slug}: no menu published", file=sys.stderr)

        locations.append(entry)

    if not any(loc["kind"] != "none" for loc in locations):
        raise SystemExit("no menu data returned; refusing to overwrite existing files")

    # Drop day files and images that rolled out of the window.
    for root, _dirs, files in os.walk(menus_dir):
        for name in files:
            if not name.endswith(".json"):
                continue
            path = os.path.join(root, name)
            if os.path.relpath(path, menus_dir) not in fresh_day_files:
                os.remove(path)
    for name in os.listdir(images_dir):
        if name not in fresh_images:
            os.remove(os.path.join(images_dir, name))

    index = {
        "generated_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "source": "https://uwm.nutrislice.com/",
        "locations": locations,
    }
    with open(os.path.join(args.out, "index.json"), "w", encoding="utf-8") as handle:
        json.dump(index, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    kinds = {}
    for loc in locations:
        kinds[loc["kind"]] = kinds.get(loc["kind"], 0) + 1
    print(
        f"wrote {len(locations)} locations "
        f"({kinds.get('menu', 0)} menu, {kinds.get('images', 0)} image, {kinds.get('none', 0)} empty), "
        f"{written_days} day files, {written_items} items",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
