/**
 * REDLINE — local-only persistence.
 *
 * Everything lives on the device. Metadata goes in one IndexedDB record so the
 * whole state can be mirrored in memory synchronously after boot; photos live
 * in their own store as Blobs so the metadata record stays small.
 */

const DB_NAME = 'redline';
const DB_VERSION = 1;
const STATE_KEY = 'state';

let db = null;

function open() {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
      if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos');
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode, fn) {
  return open().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(store, mode);
        const req = fn(t.objectStore(store));
        t.oncomplete = () => resolve(req && req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

export const photos = {
  put: (id, blob) => tx('photos', 'readwrite', (s) => s.put(blob, id)),
  get: (id) => tx('photos', 'readonly', (s) => s.get(id)),
  del: (id) => tx('photos', 'readwrite', (s) => s.delete(id)),
  clear: () => tx('photos', 'readwrite', (s) => s.clear()),
};

/** Object URLs are cached so a re-render of the same card doesn't leak. */
const urlCache = new Map();
export async function photoURL(id) {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id);
  const blob = await photos.get(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}
export function forgetPhotoURL(id) {
  const url = urlCache.get(id);
  if (url) { URL.revokeObjectURL(url); urlCache.delete(id); }
}

function freshState() {
  return {
    v: 1,
    createdAt: Date.now(),
    profile: { name: 'Spotter', xp: 0 },
    spots: [],
    settings: {
      theme: 'dark',
      haptics: true,
      units: 'imperial',
      saveLocation: true,
      savePhotos: true,
    },
    hunts: {},
    badges: [],
    lastSpotDay: null,
    streak: 0,
    bestStreak: 0,
  };
}

/** In-memory mirror. Read it directly; mutate only through `commit`. */
export let state = freshState();

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    tx('kv', 'readwrite', (s) => s.put(JSON.parse(JSON.stringify(state)), STATE_KEY)).catch((e) =>
      console.warn('[redline] save failed', e)
    );
  }, 250);
}

/** Apply a mutation, persist it, and notify views. */
export function commit(mutator) {
  const result = mutator(state);
  scheduleSave();
  for (const fn of listeners) fn(state);
  return result;
}

/** Persist + notify without a mutator (for external writes). */
export function touch() { commit(() => {}); }

export async function load() {
  try {
    const saved = await tx('kv', 'readonly', (s) => s.get(STATE_KEY));
    if (saved && saved.v) state = migrate(saved);
  } catch (e) {
    console.warn('[redline] load failed, starting fresh', e);
  }
  return state;
}

function migrate(s) {
  const base = freshState();
  const merged = { ...base, ...s, profile: { ...base.profile, ...s.profile }, settings: { ...base.settings, ...s.settings } };
  merged.spots = Array.isArray(merged.spots) ? merged.spots : [];
  return merged;
}

export async function wipe() {
  await tx('kv', 'readwrite', (s) => s.delete(STATE_KEY));
  await photos.clear();
  for (const id of urlCache.keys()) forgetPhotoURL(id);
  state = freshState();
  for (const fn of listeners) fn(state);
}

/* ---------- portability: your data, in a file you own ---------- */

function blobToDataURL(blob) {
  return new Promise((res) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.readAsDataURL(blob);
  });
}

function dataURLtoBlob(url) {
  const [head, b64] = url.split(',');
  const mime = /:(.*?);/.exec(head)[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Full backup including photos. */
export async function exportAll({ includePhotos = true } = {}) {
  const pics = {};
  if (includePhotos) {
    for (const spot of state.spots) {
      if (!spot.photo) continue;
      const blob = await photos.get(spot.photo);
      if (blob) pics[spot.photo] = await blobToDataURL(blob);
    }
  }
  return JSON.stringify({ app: 'redline', exported: new Date().toISOString(), state, photos: pics }, null, 2);
}

export async function importAll(json, { merge = true } = {}) {
  const parsed = JSON.parse(json);
  if (parsed.app !== 'redline' || !parsed.state) throw new Error('Not a REDLINE backup file.');
  const incoming = migrate(parsed.state);

  if (parsed.photos) {
    for (const [id, dataUrl] of Object.entries(parsed.photos)) {
      try { await photos.put(id, dataURLtoBlob(dataUrl)); } catch { /* skip unreadable photo */ }
    }
  }

  if (merge) {
    const known = new Set(state.spots.map((s) => s.id));
    const added = incoming.spots.filter((s) => !known.has(s.id));
    state.spots = [...state.spots, ...added].sort((a, b) => b.ts - a.ts);
    state.profile.xp = state.spots.reduce((n, s) => n + (s.xpAwarded || 0), 0);
    state.badges = [...new Set([...state.badges, ...incoming.badges])];
    state.bestStreak = Math.max(state.bestStreak, incoming.bestStreak || 0);
  } else {
    state = incoming;
  }
  scheduleSave();
  for (const fn of listeners) fn(state);
  return state.spots.length;
}
