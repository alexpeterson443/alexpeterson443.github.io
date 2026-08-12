/**
 * REDLINE — scoring, progression, hunts and badges.
 *
 * All of it is pure functions over catalog + saved state so any view can ask
 * a question without owning the rules.
 */

import { CARS, CARS_BY_ID, RARITY, SETS, COUNTRIES } from './catalog.js';

/* ---------------- levels ---------------- */

export const LEVEL_TITLES = [
  'Bystander', 'Spotter', 'Enthusiast', 'Regular', 'Anorak', 'Trainspotter',
  'Concours Judge', 'Marque Expert', 'Archivist', 'Legend',
];

/** Cumulative XP required to *reach* a level (1-indexed). */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.round(200 * Math.pow(level - 1, 1.9));
}

export function levelFromXP(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 99) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 5))],
    into: xp - floor,
    need: ceil - floor,
    pct: Math.min(100, ((xp - floor) / (ceil - floor)) * 100),
    nextAt: ceil,
  };
}

/* ---------------- scoring a spot ---------------- */

export function isNightHour(ts) {
  const h = new Date(ts).getHours();
  return h >= 20 || h < 5;
}

/** Haversine, metres. */
export function distance(a, b) {
  if (!a || !b) return 0;
  const R = 6371000;
  const p = Math.PI / 180;
  const dLat = (b.lat - a.lat) * p;
  const dLng = (b.lng - a.lng) * p;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Work out what a spot is worth *before* it is saved.
 * Returns { xp, base, isNew, bonuses:[{key,label,mult|flat}] }
 */
export function scoreSpot(state, { carId, ts = Date.now(), coords = null }) {
  const car = CARS_BY_ID.get(carId);
  if (!car) return { xp: 0, base: 0, isNew: false, bonuses: [] };

  const base = RARITY[car.rarity].xp;
  const owned = state.spots.some((s) => s.carId === carId);
  const isNew = !owned;
  const bonuses = [];

  if (!isNew) bonuses.push({ key: 'dupe', label: 'Duplicate', mult: 0.2 });
  if (isNightHour(ts)) bonuses.push({ key: 'night', label: 'Night shift', mult: 1.25 });

  const streak = currentStreak(state, ts);
  if (streak >= 3) {
    const mult = 1 + Math.min(0.5, Math.floor(streak / 3) * 0.1);
    bonuses.push({ key: 'streak', label: `${streak}-day streak`, mult });
  }

  if (coords && state.spots.length >= 5) {
    const home = homeBase(state);
    if (home && distance(home, coords) > 5000) {
      bonuses.push({ key: 'away', label: 'Away from home turf', mult: 1.2 });
    }
  }

  let xp = base;
  for (const b of bonuses) if (b.mult) xp *= b.mult;
  return { xp: Math.max(1, Math.round(xp)), base, isNew, bonuses, rarity: RARITY[car.rarity] };
}

/** Median of saved coordinates — a rough "where you usually are". */
export function homeBase(state) {
  const pts = state.spots.filter((s) => s.coords).map((s) => s.coords);
  if (pts.length < 3) return null;
  const med = (arr) => {
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.floor(a.length / 2)];
  };
  return { lat: med(pts.map((p) => p.lat)), lng: med(pts.map((p) => p.lng)) };
}

/* ---------------- streaks ---------------- */

export const dayKey = (ts = Date.now()) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function dayNumber(ts) {
  const d = new Date(ts);
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}

/** Consecutive days ending today (or yesterday, which keeps the streak alive). */
export function currentStreak(state, now = Date.now()) {
  const days = [...new Set(state.spots.map((s) => dayNumber(s.ts)))].sort((a, b) => b - a);
  if (!days.length) return 0;
  const today = dayNumber(now);
  if (days[0] !== today && days[0] !== today - 1) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 1) streak++;
    else break;
  }
  return streak;
}

/* ---------------- collection stats ---------------- */

export function collection(state) {
  const counts = new Map();
  for (const s of state.spots) counts.set(s.carId, (counts.get(s.carId) || 0) + 1);
  return counts;
}

export function dexStats(state) {
  const counts = collection(state);
  const byRarity = RARITY.slice(1).map((r) => {
    const total = CARS.filter((c) => c.rarity === r.id).length;
    const owned = CARS.filter((c) => c.rarity === r.id && counts.has(c.id)).length;
    return { ...r, total, owned };
  });
  return {
    unique: counts.size,
    total: CARS.length,
    pct: (counts.size / CARS.length) * 100,
    spots: state.spots.length,
    byRarity,
    countries: new Set(state.spots.map((s) => CARS_BY_ID.get(s.carId)?.country).filter(Boolean)).size,
  };
}

export function setProgress(state) {
  const counts = collection(state);
  return SETS.map((s) => {
    const owned = s.members.filter((id) => counts.has(id));
    return { ...s, owned: owned.length, total: s.members.length, complete: owned.length === s.members.length };
  }).sort((a, b) => b.owned / b.total - a.owned / a.total);
}

/* ---------------- hunts ---------------- */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

const HUNT_KINDS = [
  {
    key: 'body',
    build(rng) {
      const bodies = ['coupe', 'sedan', 'hatch', 'wagon', 'suv', 'truck', 'van', 'roadster', 'offroad'];
      const body = pick(rng, bodies);
      const label = { coupe: 'coupes', sedan: 'sedans', hatch: 'hatchbacks', wagon: 'wagons', suv: 'SUVs', truck: 'trucks', van: 'vans', roadster: 'roadsters', offroad: 'off-roaders' }[body];
      const n = 2 + Math.floor(rng() * 3);
      return { title: `Spot ${n} ${label}`, need: n, test: (c) => c.body === body };
    },
  },
  {
    key: 'country',
    build(rng) {
      const code = pick(rng, ['jp', 'de', 'us', 'it', 'uk', 'fr', 'se', 'kr']);
      const n = 2 + Math.floor(rng() * 3);
      return { title: `Spot ${n} cars from ${COUNTRIES[code].name}`, need: n, test: (c) => c.country === code, icon: COUNTRIES[code].flag };
    },
  },
  {
    key: 'rarity',
    build(rng) {
      const min = 3 + Math.floor(rng() * 2);
      return { title: `Catch anything ${RARITY[min].name} or better`, need: 1, test: (c) => c.rarity >= min };
    },
  },
  {
    key: 'decade',
    build(rng) {
      const dec = pick(rng, [1960, 1970, 1980, 1990, 2000]);
      const n = 1 + Math.floor(rng() * 2);
      return { title: `Spot ${n} car${n > 1 ? 's' : ''} first built in the ${String(dec).slice(2)}s`, need: n, test: (c) => c.yearStart >= dec && c.yearStart < dec + 10 };
    },
  },
  {
    key: 'drive',
    build(rng) {
      const drv = pick(rng, ['rwd', 'awd', 'fwd', '4wd']);
      const n = 2 + Math.floor(rng() * 3);
      return { title: `Spot ${n} ${drv.toUpperCase()} cars`, need: n, test: (c) => c.drive === drv };
    },
  },
  {
    key: 'tag',
    build(rng) {
      const tag = pick(rng, ['turbo', 'v8', 'ev', 'wagon-life', 'hot-hatch', 'jdm', 'daily', 'luxury', 'offroad', 'muscle']);
      const nice = { 'wagon-life': 'wagon', 'hot-hatch': 'hot hatch', jdm: 'JDM', ev: 'electric', v8: 'V8', daily: 'everyday', offroad: 'off-road' }[tag] || tag;
      const n = 2 + Math.floor(rng() * 3);
      return { title: `Spot ${n} ${nice} cars`, need: n, test: (c) => c.tags.includes(tag) };
    },
  },
  {
    key: 'power',
    build(rng) {
      const hp = pick(rng, [300, 400, 500]);
      return { title: `Spot something over ${hp} hp`, need: 1, test: (c) => c.hp > hp };
    },
  },
];

function buildHunts(seedStr, count, prefix) {
  const rng = mulberry32(hash(seedStr));
  const used = new Set();
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < 50) {
    const kind = pick(rng, HUNT_KINDS);
    if (used.has(kind.key) && out.length < HUNT_KINDS.length) continue;
    used.add(kind.key);
    const h = kind.build(rng);
    out.push({ ...h, id: `${prefix}:${kind.key}:${hash(h.title)}`, kind: kind.key });
  }
  return out;
}

/** Monday-anchored week key so weekly bounties roll over predictably. */
function weekKey(now = Date.now()) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return dayKey(d.getTime());
}

/** Today's three daily bounties + one weekly, with live progress. */
export function activeHunts(state, now = Date.now()) {
  const dk = dayKey(now);
  const wk = weekKey(now);
  const daily = buildHunts(`d:${dk}`, 3, 'd').map((h) => ({ ...h, scope: 'daily', reward: 120, windowStart: startOfDay(now) }));
  const weekly = buildHunts(`w:${wk}`, 1, 'w').map((h) => ({ ...h, scope: 'weekly', reward: 600, need: h.need + 3, windowStart: startOfWeek(now) }));

  return [...daily, ...weekly].map((h) => {
    const matched = state.spots.filter((s) => {
      if (s.ts < h.windowStart) return false;
      const car = CARS_BY_ID.get(s.carId);
      return car && h.test(car);
    });
    const have = Math.min(h.need, matched.length);
    return {
      ...h,
      have,
      done: have >= h.need,
      claimed: !!(state.hunts[h.id]),
      pct: (have / h.need) * 100,
    };
  });
}

function startOfDay(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfWeek(now) {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* ---------------- badges ---------------- */

export const BADGES = [
  { id: 'first', name: 'First Blood', blurb: 'Log your first spot.', icon: '🏁', test: (s) => s.spots.length >= 1 },
  { id: 'ten', name: 'Warmed Up', blurb: 'Log 10 spots.', icon: '🔥', test: (s) => s.spots.length >= 10 },
  { id: 'century', name: 'Century', blurb: 'Log 100 spots.', icon: '💯', test: (s) => s.spots.length >= 100 },
  { id: 'unique25', name: 'Collector', blurb: 'Fill 25 unique dex slots.', icon: '📇', test: (s) => collection(s).size >= 25 },
  { id: 'unique100', name: 'Curator', blurb: 'Fill 100 unique dex slots.', icon: '🏛️', test: (s) => collection(s).size >= 100 },
  { id: 'dex50', name: 'Halfway House', blurb: 'Reach 50% dex completion.', icon: '🥈', test: (s) => dexStats(s).pct >= 50 },
  { id: 'dex100', name: 'Completionist', blurb: 'Fill the entire dex.', icon: '🥇', test: (s) => dexStats(s).pct >= 100 },
  { id: 'grail', name: 'Grail Hunter', blurb: 'Catch a Grail-tier car.', icon: '👑', test: (s) => s.spots.some((x) => CARS_BY_ID.get(x.carId)?.rarity === 6) },
  { id: 'legend3', name: 'Right Place, Right Time', blurb: 'Catch 3 Legendary cars.', icon: '✨', test: (s) => new Set(s.spots.filter((x) => CARS_BY_ID.get(x.carId)?.rarity === 5).map((x) => x.carId)).size >= 3 },
  { id: 'night', name: 'Night Owl', blurb: 'Log 10 spots after dark.', icon: '🌙', test: (s) => s.spots.filter((x) => isNightHour(x.ts)).length >= 10 },
  { id: 'streak7', name: 'Seven Straight', blurb: 'Spot on 7 consecutive days.', icon: '📅', test: (s) => (s.bestStreak || 0) >= 7 },
  { id: 'streak30', name: 'Devotion', blurb: 'Spot on 30 consecutive days.', icon: '🗓️', test: (s) => (s.bestStreak || 0) >= 30 },
  { id: 'world', name: 'Globetrotter', blurb: 'Collect cars from 6 countries.', icon: '🌍', test: (s) => dexStats(s).countries >= 6 },
  { id: 'set1', name: 'Set Complete', blurb: 'Finish any collection set.', icon: '🎯', test: (s) => setProgress(s).some((x) => x.complete) },
  { id: 'rotary', name: 'Brap', blurb: 'Catch 3 rotary-engined cars.', icon: '🔄', test: (s) => new Set(s.spots.filter((x) => CARS_BY_ID.get(x.carId)?.tags.includes('rotary')).map((x) => x.carId)).size >= 3 },
  { id: 'shutter', name: 'Photographer', blurb: 'Attach photos to 20 spots.', icon: '📸', test: (s) => s.spots.filter((x) => x.photo).length >= 20 },
];

/** Badges newly earned since last check. */
export function checkBadges(state) {
  const have = new Set(state.badges);
  const fresh = BADGES.filter((b) => !have.has(b.id) && b.test(state));
  for (const b of fresh) state.badges.push(b.id);
  return fresh;
}

/* ---------------- suggestion ranking for the identify sheet ---------------- */

/**
 * Order the catalog for the picker: things you see a lot, near where you are,
 * float up. Keeps the common stuff one tap away without burying the exotica.
 */
export function rankSuggestions(state, { coords = null, limit = 24 } = {}) {
  const recent = new Map();
  state.spots.slice(0, 60).forEach((s, i) => recent.set(s.carId, Math.max(recent.get(s.carId) || 0, 60 - i)));

  const nearby = new Map();
  if (coords) {
    for (const s of state.spots) {
      if (!s.coords) continue;
      if (distance(coords, s.coords) < 800) nearby.set(s.carId, (nearby.get(s.carId) || 0) + 1);
    }
  }

  return [...CARS]
    .map((c) => {
      let score = 0;
      score += (7 - c.rarity) * 8;              // commons are what you actually see
      score += (recent.get(c.id) || 0) * 0.8;   // things you log often
      score += (nearby.get(c.id) || 0) * 25;    // things that live on this street
      return { car: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.car);
}
