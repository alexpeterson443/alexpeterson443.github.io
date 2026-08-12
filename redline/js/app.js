/**
 * REDLINE — app shell, router and views.
 */

import { CARS, CARS_BY_ID, RARITY, COUNTRIES, setsForCar } from './catalog.js';
import { silhouette } from './silhouettes.js';
import * as store from './store.js';
import { state, commit } from './store.js';
import {
  levelFromXP, scoreSpot, dexStats, collection, setProgress, activeHunts,
  BADGES, checkBadges, currentStreak, rankSuggestions, distance, dayKey,
} from './engine.js';
import { Camera, shotFromFile, getCoords } from './scan.js';

/* ============================================================== helpers == */

const $ = (sel, root = document) => root.querySelector(sel);
const view = () => $('#view');

function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function buzz(pattern = 8) {
  if (!state.settings.haptics) return;
  try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.dataset.open = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.dataset.open = '0'; }, 2400);
}

function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fmtDistance(m) {
  if (state.settings.units === 'imperial') {
    const mi = m / 1609.34;
    return mi < 0.2 ? `${Math.round(m * 3.28084)} ft` : `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
  }
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

const ICON = {
  dex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 7z"/><path d="M9 4v13M15 7v12.5"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><circle cx="12" cy="12" r="3.2"/></svg>',
  hunts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/></svg>',
  garage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M7 21v-6h10v6M7 12h10"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11A8 8 0 0 0 6.3 5.7L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 13.7 5.3L20 16"/><path d="M20 20v-4h-4"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  nophoto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h11M4 12h11M4 18h7"/><path d="M18 13v8M21.5 16.5h-7"/></svg>',
};

/* ================================================================ sheet == */

let sheetDepth = 0;

function openSheet({ title, body, foot, onClose, id = 'sheet' }) {
  const backdrop = h('<div class="sheet-backdrop"></div>');
  const sheet = h(`
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title || 'Details')}">
      <div class="sheet-grab"><i></i></div>
      ${title ? `<div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-x style="background:var(--surface-2);border-color:var(--line);color:var(--text-dim)">${ICON.close}</button></div>` : ''}
      <div class="sheet-body"></div>
    </div>`);

  const bodyEl = $('.sheet-body', sheet);
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else if (body) bodyEl.append(body);

  if (foot) {
    const f = h('<div class="sheet-foot"></div>');
    if (typeof foot === 'string') f.innerHTML = foot;
    else f.append(foot);
    sheet.append(f);
  }

  document.body.append(backdrop, sheet);
  requestAnimationFrame(() => {
    backdrop.dataset.open = '1';
    sheet.dataset.open = '1';
  });

  let closed = false;
  const close = (fromPop) => {
    if (closed) return;
    closed = true;
    sheetDepth--;
    backdrop.dataset.open = '0';
    sheet.dataset.open = '0';
    setTimeout(() => { backdrop.remove(); sheet.remove(); }, 340);
    onClose?.();
    if (!fromPop && history.state?.sheet) history.back();
  };

  sheetDepth++;
  history.pushState({ sheet: id, depth: sheetDepth }, '');
  const onPop = () => { window.removeEventListener('popstate', onPop); close(true); };
  window.addEventListener('popstate', onPop);

  backdrop.addEventListener('click', () => close());
  $('[data-x]', sheet)?.addEventListener('click', () => close());

  /* drag-to-dismiss on the grab handle */
  const grab = $('.sheet-grab', sheet);
  let y0 = 0, dy = 0, dragging = false;
  grab.addEventListener('pointerdown', (e) => {
    dragging = true; y0 = e.clientY; dy = 0;
    sheet.classList.add('dragging');
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - y0);
    sheet.style.transform = `translateY(${dy}px)`;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    if (dy > 90) close();
  };
  grab.addEventListener('pointerup', endDrag);
  grab.addEventListener('pointercancel', endDrag);

  return { close, sheet, bodyEl };
}

/* ============================================================== card DOM == */

/** The sighting that represents a car on its card: newest one with a photo. */
function coverSpot(carId) {
  const mine = state.spots.filter((s) => s.carId === carId);
  return mine.find((s) => s.photo) || mine[0] || null;
}

function cardHTML(car, { count = 0 } = {}) {
  const owned = count > 0;
  const tier = RARITY[car.rarity];
  const cover = owned ? coverSpot(car.id) : null;
  const holo = owned && car.rarity >= 5 ? ' card--holo' : '';
  const art = cover?.photo
    ? `<img data-photo="${esc(cover.photo)}" alt="">`
    : silhouette(car.body);

  return `
    <button class="card ${owned ? 'card--owned' : 'card--locked'}${holo}" data-rarity="${car.rarity}" data-car="${esc(car.id)}">
      <div class="card-art">${art}</div>
      ${owned ? `<span class="pip">${esc(tier.name)}</span>` : ''}
      ${count > 1 ? `<span class="dupe">×${count}</span>` : ''}
      <div class="card-body">
        <div class="card-make">${esc(car.make)}</div>
        <div class="card-model">${owned ? esc(car.model) : '???'}</div>
        <div class="card-meta"><span>${car.flag}</span><span>${owned ? esc(car.years) : esc(car.bodyLabel)}</span></div>
      </div>
    </button>`;
}

/** Swap silhouettes for stored photos once their object URLs resolve. */
async function hydratePhotos(root) {
  const imgs = root.querySelectorAll('img[data-photo]:not([src])');
  for (const img of imgs) {
    const url = await store.photoURL(img.dataset.photo);
    if (url) img.src = url;
    else img.replaceWith(h(silhouette('coupe')));
  }
}

/* ================================================================= views == */

const views = {};
let activeTab = 'dex';
let camera = null;

/* ---------------------------------------------------------------- dex --- */

const dexUI = { q: '', filter: 'all', sort: 'dex' };

views.dex = function renderDex() {
  const counts = collection(state);
  const stats = dexStats(state);

  const el = h(`
    <div>
      <div class="viewhead">
        <div>
          <h1>The Dex</h1>
          <p class="sub"><span class="num">${stats.unique}</span> of <span class="num">${stats.total}</span> found · <span class="num">${stats.pct.toFixed(0)}%</span></p>
        </div>
      </div>
      <div class="bar" style="margin-bottom:14px"><i style="width:${stats.pct}%"></i></div>
      <div class="searchbar">
        ${ICON.search}
        <input type="search" placeholder="Search ${CARS.length} cars…" value="${esc(dexUI.q)}" aria-label="Search the dex">
      </div>
      <div class="chiprow" data-filters></div>
      <div class="grid" data-grid></div>
    </div>`);

  const filters = [
    ['all', 'All'], ['owned', 'Collected'], ['missing', 'Missing'],
    ['6', 'Grails'], ['5', 'Legendary'], ['4', 'Epic'],
    ['jp', '🇯🇵'], ['de', '🇩🇪'], ['us', '🇺🇸'], ['it', '🇮🇹'], ['uk', '🇬🇧'],
    ['coupe', 'Coupes'], ['suv', 'SUVs'], ['wagon', 'Wagons'], ['truck', 'Trucks'],
  ];
  $('[data-filters]', el).innerHTML = filters
    .map(([k, label]) => `<button class="chip" aria-pressed="${dexUI.filter === k}" data-f="${k}">${label}</button>`)
    .join('');

  function paint() {
    const q = dexUI.q.trim().toLowerCase();
    const f = dexUI.filter;
    const list = CARS.filter((c) => {
      if (q && !c.search.includes(q)) return false;
      if (f === 'owned') return counts.has(c.id);
      if (f === 'missing') return !counts.has(c.id);
      if (/^\d$/.test(f)) return c.rarity === +f;
      if (COUNTRIES[f]) return c.country === f;
      if (f !== 'all') return c.body === f;
      return true;
    }).sort((a, b) => {
      const ao = counts.has(a.id) ? 0 : 1;
      const bo = counts.has(b.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      if (a.rarity !== b.rarity) return b.rarity - a.rarity;
      return a.name.localeCompare(b.name);
    });

    const grid = $('[data-grid]', el);
    if (!list.length) {
      grid.innerHTML =
        `<div class="empty" style="grid-column:1/-1"><h3>Nothing matches</h3><p>Try a different search or filter.</p></div>`;
      return;
    }
    grid.innerHTML = list.map((c) => cardHTML(c, { count: counts.get(c.id) || 0 })).join('');
    hydratePhotos(grid);
  }

  paint();

  $('input', el).addEventListener('input', (e) => { dexUI.q = e.target.value; paint(); });
  $('[data-filters]', el).addEventListener('click', (e) => {
    const btn = e.target.closest('[data-f]');
    if (!btn) return;
    dexUI.filter = btn.dataset.f;
    buzz(6);
    el.querySelectorAll('[data-f]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    paint();
  });
  el.addEventListener('click', (e) => {
    const card = e.target.closest('[data-car]');
    if (card) openCar(card.dataset.car);
  });

  return el;
};

/* ---------------------------------------------------------------- map --- */

views.map = function renderMap() {
  const located = state.spots.filter((s) => s.coords);

  if (!located.length) {
    return h(`
      <div>
        <div class="viewhead"><div><h1>Spot Map</h1><p class="sub">Where you found them</p></div></div>
        <div class="empty">
          ${silhouette('wagon')}
          <h3>No locations yet</h3>
          <p>Turn on “Save location” in the Garage, then log a spot — your finds will plot here.</p>
          <button class="btn btn--primary" data-go="scan">Log a spot</button>
        </div>
      </div>`);
  }

  const lats = located.map((s) => s.coords.lat);
  const lngs = located.map((s) => s.coords.lng);
  const pad = 0.0012;
  const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;
  const spanLat = Math.max(1e-5, maxLat - minLat);
  const spanLng = Math.max(1e-5, maxLng - minLng);

  const widest = distance({ lat: minLat, lng: minLng }, { lat: maxLat, lng: maxLng });
  const places = new Set(located.map((s) => `${s.coords.lat.toFixed(3)},${s.coords.lng.toFixed(3)}`)).size;

  const dots = located
    .slice()
    .reverse()
    .map((s) => {
      const car = CARS_BY_ID.get(s.carId);
      if (!car) return '';
      // inset the plot so dots at the extremes aren't clipped by the frame
      const x = 7 + ((s.coords.lng - minLng) / spanLng) * 86;
      const y = 7 + (1 - (s.coords.lat - minLat) / spanLat) * 86;
      return `<button class="mapdot" data-rarity="${car.rarity}" data-car="${esc(car.id)}"
                style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%" title="${esc(car.name)}">${car.flag}</button>`;
    })
    .join('');

  const el = h(`
    <div>
      <div class="viewhead">
        <div><h1>Spot Map</h1><p class="sub"><span class="num">${located.length}</span> located finds</p></div>
      </div>
      <div class="mapwrap">${dots}<span class="maplabel">${esc(fmtDistance(widest))} across</span></div>
      <div class="statgrid">
        <div class="stat"><div class="n num">${located.length}</div><div class="k">Plotted</div></div>
        <div class="stat"><div class="n num">${places}</div><div class="k">Locations</div></div>
        <div class="stat"><div class="n num">${esc(fmtDistance(widest))}</div><div class="k">Spread</div></div>
      </div>
      <p class="micro" style="margin-top:14px;line-height:1.6;text-transform:none;letter-spacing:0;font-size:12px;font-weight:400">
        Coordinates are rounded to about 11&nbsp;m and never leave this device.
      </p>
    </div>`);

  el.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-car]');
    if (dot) openCar(dot.dataset.car);
  });
  return el;
};

/* -------------------------------------------------------------- hunts --- */

views.hunts = function renderHunts() {
  const hunts = activeHunts(state);
  const streak = currentStreak(state);
  const sets = setProgress(state);

  const el = h(`
    <div>
      <div class="viewhead">
        <div><h1>Hunts</h1><p class="sub">Fresh bounties every day</p></div>
        <div style="text-align:right">
          <div class="num" style="font-size:24px;font-weight:800;letter-spacing:-.03em">${streak}</div>
          <div class="micro">day streak</div>
        </div>
      </div>
      <div data-hunts></div>
      <div class="section-title">Collection sets</div>
      <div class="panel" data-sets></div>
    </div>`);

  $('[data-hunts]', el).innerHTML = hunts
    .map((hu) => {
      const icon = hu.icon || (hu.scope === 'weekly' ? '🏆' : '🎯');
      const status = hu.claimed ? 'Claimed' : hu.done ? 'Tap to claim' : `${hu.have} / ${hu.need}`;
      return `
        <div class="hunt ${hu.done ? 'hunt--done' : ''}" data-hunt="${esc(hu.id)}" data-reward="${hu.reward}" data-done="${hu.done && !hu.claimed ? 1 : 0}">
          <div class="hunt-ico">${icon}</div>
          <div>
            <div class="hunt-title">${esc(hu.title)}</div>
            <div class="hunt-sub">${hu.scope === 'weekly' ? 'This week' : 'Today'} · ${esc(status)}</div>
            <div class="bar hunt-prog"><i style="width:${hu.pct}%"></i></div>
          </div>
          <div class="hunt-reward">${hu.claimed ? '✓' : `+${hu.reward}`}</div>
        </div>`;
    })
    .join('');

  $('[data-sets]', el).innerHTML = sets
    .map(
      (s) => `
      <div class="setrow">
        <div class="top">
          <span class="nm">${esc(s.name)}${s.complete ? ' ✓' : ''}</span>
          <span class="ct num">${s.owned}/${s.total}</span>
        </div>
        <div class="bl">${esc(s.blurb)}</div>
        <div class="bar"><i style="width:${(s.owned / s.total) * 100}%"></i></div>
      </div>`
    )
    .join('');

  el.addEventListener('click', (e) => {
    const row = e.target.closest('[data-hunt]');
    if (!row || row.dataset.done !== '1') return;
    const id = row.dataset.hunt;
    const reward = +row.dataset.reward;
    commit((s) => {
      s.hunts[id] = { claimedAt: Date.now(), reward };
      s.profile.xp += reward;
    });
    buzz([12, 40, 18]);
    toast(`Bounty claimed · +${reward} XP`);
    render();
  });

  return el;
};

/* ------------------------------------------------------------- garage --- */

views.garage = function renderGarage() {
  const stats = dexStats(state);
  const lv = levelFromXP(state.profile.xp);
  const streak = currentStreak(state);
  const owned = new Set(state.badges);
  const R = 30;
  const C = 2 * Math.PI * R;

  const el = h(`
    <div>
      <div class="viewhead"><div><h1>Garage</h1><p class="sub">${esc(lv.title)} · Level ${lv.level}</p></div></div>

      <div class="profilecard">
        <div class="ring">
          <svg viewBox="0 0 68 68">
            <defs><linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ff7a3d"/><stop offset="1" stop-color="#ff2f4d"/>
            </linearGradient></defs>
            <circle class="track" cx="34" cy="34" r="${R}" fill="none" stroke-width="6"/>
            <circle class="fill" cx="34" cy="34" r="${R}" fill="none" stroke-width="6"
              stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - lv.pct / 100)}"/>
          </svg>
          <div class="lvl num">${lv.level}</div>
        </div>
        <div>
          <div style="font-size:17px;font-weight:750;letter-spacing:-.02em">${esc(state.profile.name)}</div>
          <div style="font-size:12.5px;color:var(--text-dim);margin:3px 0 8px">
            <span class="num">${lv.into}</span> / <span class="num">${lv.need}</span> XP to level ${lv.level + 1}
          </div>
          <div class="bar"><i style="width:${lv.pct}%"></i></div>
        </div>
      </div>

      <div class="statgrid">
        <div class="stat"><div class="n num">${stats.spots}</div><div class="k">Spots</div></div>
        <div class="stat"><div class="n num">${stats.unique}</div><div class="k">Unique</div></div>
        <div class="stat"><div class="n num">${streak}</div><div class="k">Streak</div></div>
      </div>
      <div class="statgrid">
        <div class="stat"><div class="n num">${stats.pct.toFixed(0)}%</div><div class="k">Dex</div></div>
        <div class="stat"><div class="n num">${stats.countries}</div><div class="k">Countries</div></div>
        <div class="stat"><div class="n num">${state.profile.xp}</div><div class="k">Total XP</div></div>
      </div>

      <div class="section-title">Rarity breakdown</div>
      <div class="panel">${stats.byRarity.map((r) => `
        <div class="setrow" data-rarity="${r.id}">
          <div class="top"><span class="nm" style="color:var(--r)">${esc(r.name)}</span><span class="ct num">${r.owned}/${r.total}</span></div>
          <div class="bar"><i style="width:${(r.owned / r.total) * 100}%;background:var(--r)"></i></div>
        </div>`).join('')}
      </div>

      <div class="section-title">Badges · ${owned.size}/${BADGES.length}</div>
      <div class="badges">${BADGES.map((b) => `
        <div class="badge ${owned.has(b.id) ? 'badge--got' : ''}" data-badge="${esc(b.id)}">
          <div class="ic">${b.icon}</div><div class="nm">${esc(b.name)}</div>
        </div>`).join('')}
      </div>

      <div class="section-title">Recent spots</div>
      <div class="rows" data-recent></div>

      <div class="section-title">Settings</div>
      <div class="rows">
        <button class="row" data-act="theme"><span class="lbl">Theme</span><span class="val">${esc(themeLabel())}</span></button>
        <button class="row" data-act="units"><span class="lbl">Units</span><span class="val">${state.settings.units === 'imperial' ? 'Miles' : 'Kilometres'}</span></button>
        <div class="row"><span class="lbl">Haptics</span><button class="switch" role="switch" data-act="haptics" aria-checked="${state.settings.haptics}"></button></div>
        <div class="row"><span class="lbl">Save location</span><button class="switch" role="switch" data-act="loc" aria-checked="${state.settings.saveLocation}"></button></div>
        <div class="row"><span class="lbl">Save photos</span><button class="switch" role="switch" data-act="photos" aria-checked="${state.settings.savePhotos}"></button></div>
        <button class="row" data-act="rename"><span class="lbl">Spotter name</span><span class="val">${esc(state.profile.name)}</span></button>
      </div>

      <div class="section-title">Your data</div>
      <div class="rows">
        <button class="row" data-act="export"><span class="lbl">Export backup</span><span class="val">.json</span></button>
        <button class="row" data-act="import"><span class="lbl">Import backup</span><span class="val">Merge</span></button>
        <button class="row" data-act="reset"><span class="lbl" style="color:var(--accent)">Erase everything</span></button>
      </div>

      <p style="color:var(--text-faint);font-size:12px;line-height:1.6;margin:16px 2px 0">
        REDLINE keeps every photo, coordinate and card in this browser. No account, no server,
        no analytics — and it works with the signal off.
      </p>
      <div style="height:8px"></div>
    </div>`);

  const recent = state.spots.slice(0, 8);
  $('[data-recent]', el).innerHTML = recent.length
    ? recent.map((s) => {
        const car = CARS_BY_ID.get(s.carId);
        if (!car) return '';
        return `<button class="row" data-car="${esc(car.id)}">
            <span class="lbl">${car.flag} ${esc(car.name)}</span>
            <span class="val">${esc(timeAgo(s.ts))}</span></button>`;
      }).join('')
    : '<div class="row"><span class="val">Nothing logged yet.</span></div>';

  el.addEventListener('click', onGarageClick);
  return el;
};

function themeLabel() {
  return { dark: 'Dark', light: 'Light', auto: 'Match system' }[state.settings.theme] || 'Dark';
}

function onGarageClick(e) {
  const card = e.target.closest('[data-car]');
  if (card) return openCar(card.dataset.car);

  const badge = e.target.closest('[data-badge]');
  if (badge) {
    const b = BADGES.find((x) => x.id === badge.dataset.badge);
    const got = state.badges.includes(b.id);
    return void openSheet({
      title: `${b.icon}  ${b.name}`,
      body: `<p style="color:var(--text-dim);margin:0 0 8px">${esc(b.blurb)}</p>
             <p style="margin:0;font-weight:650;color:${got ? 'var(--good)' : 'var(--text-faint)'}">${got ? 'Earned' : 'Not yet earned'}</p>`,
    });
  }

  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!act) return;
  buzz(6);

  const toggles = { haptics: 'haptics', loc: 'saveLocation', photos: 'savePhotos' };
  if (toggles[act]) {
    commit((s) => { s.settings[toggles[act]] = !s.settings[toggles[act]]; });
    return render();
  }

  if (act === 'theme') {
    const order = ['dark', 'light', 'auto'];
    commit((s) => { s.settings.theme = order[(order.indexOf(s.settings.theme) + 1) % order.length]; });
    applyTheme();
    return render();
  }
  if (act === 'units') {
    commit((s) => { s.settings.units = s.settings.units === 'imperial' ? 'metric' : 'imperial'; });
    return render();
  }
  if (act === 'rename') return renameSheet();
  if (act === 'export') return exportBackup();
  if (act === 'import') return importBackup();
  if (act === 'reset') return resetSheet();
}

function renameSheet() {
  const body = h(`<div><div class="searchbar"><input id="nm" maxlength="18" value="${esc(state.profile.name)}" aria-label="Spotter name"></div></div>`);
  const foot = h('<div><button class="btn btn--primary btn--block" data-save>Save</button></div>');
  const s = openSheet({ title: 'Spotter name', body, foot });
  const input = $('#nm', body);
  input.focus();
  $('[data-save]', foot).addEventListener('click', () => {
    const v = input.value.trim() || 'Spotter';
    commit((st) => { st.profile.name = v; });
    s.close();
    render();
  });
}

async function exportBackup() {
  toast('Packing your collection…');
  const json = await store.exportAll();
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `redline-backup-${dayKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Backup saved');
}

function importBackup() {
  const input = h('<input type="file" accept="application/json,.json" hidden>');
  document.body.append(input);
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    try {
      const n = await store.importAll(await file.text(), { merge: true });
      toast(`Imported · ${n} spots total`);
      render();
    } catch (err) {
      toast(err.message || 'Could not read that file');
    }
  });
  input.click();
}

function resetSheet() {
  const foot = h(`<div>
      <button class="btn btn--danger btn--block" data-yes>Erase everything</button>
      <button class="btn btn--ghost btn--block" data-no>Keep my collection</button>
    </div>`);
  const s = openSheet({
    title: 'Erase everything?',
    body: `<p style="color:var(--text-dim);margin:0">This deletes every spot, photo and badge on this device. It cannot be undone — export a backup first if you want to keep it.</p>`,
    foot,
  });
  $('[data-yes]', foot).addEventListener('click', async () => {
    await store.wipe();
    s.close();
    toast('Collection erased');
    go('dex');
  });
  $('[data-no]', foot).addEventListener('click', () => s.close());
}

/* ================================================================= scan == */

views.scan = function renderScan() {
  const el = h(`
    <div class="scan">
      <video playsinline muted autoplay></video>
      <div class="scrim"></div>
      <div class="reticle"><i></i><i></i><i></i><i></i><div class="sweep"></div></div>
      <div class="scan-top">
        <button class="iconbtn" data-x aria-label="Close scanner">${ICON.close}</button>
        <div style="display:flex;gap:10px">
          <button class="iconbtn" data-torch aria-label="Torch" aria-pressed="false" hidden>${ICON.bolt}</button>
          <button class="iconbtn" data-flip aria-label="Switch camera">${ICON.flip}</button>
        </div>
      </div>
      <div class="scan-hint">Frame the car and tap to capture</div>
      <div class="scan-bottom">
        <button class="iconbtn" data-pick aria-label="Choose a photo">${ICON.image}</button>
        <button class="shutter" data-shoot aria-label="Capture"><i></i></button>
        <button class="iconbtn" data-noshot aria-label="Log without a photo">${ICON.nophoto}</button>
      </div>
    </div>`);

  const video = $('video', el);
  camera = new Camera(video);

  (async () => {
    if (!camera.supported) return showFallback(el, 'This browser has no camera access.');
    try {
      await camera.start();
      const torchBtn = $('[data-torch]', el);
      if (camera.hasTorch) torchBtn.hidden = false;
    } catch (err) {
      showFallback(el, err.name === 'NotAllowedError'
        ? 'Camera permission was declined. You can still add a photo from your library, or log a spot without one.'
        : 'No camera available on this device.');
    }
  })();

  $('[data-x]', el).addEventListener('click', () => go('dex'));
  $('[data-flip]', el).addEventListener('click', async () => { buzz(6); try { await camera.flip(); } catch { toast('Only one camera here'); } });
  $('[data-torch]', el).addEventListener('click', async (e) => {
    const on = await camera.toggleTorch();
    e.currentTarget.setAttribute('aria-pressed', String(on));
  });
  $('[data-shoot]', el).addEventListener('click', async () => {
    buzz(14);
    try {
      const shot = await camera.capture();
      identify(shot);
    } catch (err) {
      toast(err.message || 'Capture failed');
    }
  });
  $('[data-noshot]', el).addEventListener('click', () => identify(null));
  $('[data-pick]', el).addEventListener('click', () => pickFromLibrary());

  return el;
};

function showFallback(root, msg) {
  $('.reticle', root)?.remove();
  $('.scan-hint', root)?.remove();
  root.append(h(`
    <div class="scan-fallback">
      ${silhouette('coupe')}
      <h3 style="margin:0;font-size:18px">Camera unavailable</h3>
      <p style="margin:0;color:var(--text-dim);font-size:14px;max-width:34ch">${esc(msg)}</p>
      <button class="btn btn--primary" data-pick2>${ICON.image} Choose a photo</button>
      <button class="btn btn--ghost" data-noshot2>Log without a photo</button>
    </div>`));
  $('[data-pick2]', root).addEventListener('click', () => pickFromLibrary());
  $('[data-noshot2]', root).addEventListener('click', () => identify(null));
}

function pickFromLibrary() {
  const input = h('<input type="file" accept="image/*" hidden>');
  document.body.append(input);
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    try {
      toast('Reading photo…');
      identify(await shotFromFile(file));
    } catch {
      toast('Could not read that image');
    }
  });
  input.click();
}

/* ----------------------------------------------------------- identify --- */

async function identify(shot) {
  const coords = state.settings.saveLocation ? await getCoords() : null;
  const paint = shot?.palette?.[0] || null;

  const body = h(`
    <div>
      ${shot ? `<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
        <img class="freezethumb" style="width:88px;height:66px;object-fit:cover;border-radius:12px;border:1px solid var(--line)" alt="">
        <div>
          ${paint ? `<div style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:650">
            <span class="swatch" style="background:${esc(paint.hex)}"></span>${esc(paint.name)}</div>` : ''}
          <div class="micro" style="margin-top:5px">${coords ? 'Location saved' : 'No location'}</div>
        </div>
      </div>` : ''}
      <div class="searchbar">${ICON.search}<input type="search" placeholder="Which car is it?" aria-label="Search cars"></div>
      <div class="micro" data-heading>Likely round here</div>
      <div data-list style="margin-top:6px"></div>
    </div>`);

  let thumbURL = null;
  const sheet = openSheet({
    title: 'Identify',
    body,
    id: 'identify',
    onClose: () => { if (thumbURL) URL.revokeObjectURL(thumbURL); },
  });

  if (shot) {
    thumbURL = URL.createObjectURL(shot.blob);
    $('.freezethumb', body).src = thumbURL;
  }

  const suggestions = rankSuggestions(state, { coords, limit: 22 });
  const listEl = $('[data-list]', body);
  const headEl = $('[data-heading]', body);

  const rowFor = (c) => `
    <button class="pickitem" data-rarity="${c.rarity}" data-carpick="${esc(c.id)}">
      <span class="thumb">${silhouette(c.body)}</span>
      <span>
        <span class="nm" style="display:block">${esc(c.name)}</span>
        <span class="sb">${c.flag} ${esc(c.years)} · ${esc(c.bodyLabel)} · ${c.hp} hp</span>
      </span>
      <span class="tier">${esc(RARITY[c.rarity].name)}</span>
    </button>`;

  const paintList = (list, heading) => {
    headEl.textContent = heading;
    listEl.innerHTML = list.length
      ? list.map(rowFor).join('')
      : `<div class="empty" style="padding:28px 8px"><h3>No match</h3><p>Try the make, or a nickname like “Godzilla”.</p></div>`;
  };

  paintList(suggestions, 'Likely round here');

  $('input', body).addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return paintList(suggestions, 'Likely round here');
    const hits = CARS.filter((c) => c.search.includes(q)).slice(0, 40);
    paintList(hits, `${hits.length} match${hits.length === 1 ? '' : 'es'}`);
  });

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest("[data-carpick]");
    if (!btn) return;
    sheet.close();
    confirmSpot(btn.dataset.carpick, shot, coords);
  });
}

/* -------------------------------------------------------------- commit -- */

async function confirmSpot(carId, shot, coords) {
  const car = CARS_BY_ID.get(carId);
  if (!car) return void toast('That car is no longer in the catalog');
  const preview = scoreSpot(state, { carId, coords });

  const id = `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  let photoKey = null;

  if (shot && state.settings.savePhotos) {
    photoKey = `ph_${id}`;
    try { await store.photos.put(photoKey, shot.blob); }
    catch { photoKey = null; toast('Storage full — photo not saved'); }
  }

  const spot = {
    id,
    carId,
    ts: Date.now(),
    coords: coords || null,
    photo: photoKey,
    palette: shot?.palette?.slice(0, 2) || [],
    rarity: car.rarity,
    xpAwarded: preview.xp,
    isNew: preview.isNew,
  };

  const fresh = commit((s) => {
    s.spots.unshift(spot);
    s.profile.xp += preview.xp;
    const st = currentStreak(s);
    s.streak = st;
    s.bestStreak = Math.max(s.bestStreak || 0, st);
    s.lastSpotDay = dayKey();
    return checkBadges(s);
  });

  buzz(preview.isNew ? [16, 45, 22, 45, 30] : 14);
  showReveal(car, preview, spot, fresh);
}

function showReveal(car, preview, spot, freshBadges) {
  const tier = RARITY[car.rarity];
  const holo = car.rarity >= 5 ? ' card--holo' : '';

  const overlay = h(`
    <div class="reveal" data-rarity="${car.rarity}">
      <div class="burst"></div>
      <div>
        <div class="reveal-card${holo}">
          <div class="card-art">${spot.photo ? `<img data-photo="${esc(spot.photo)}" alt="">` : silhouette(car.body)}</div>
          <div class="reveal-meta">
            <div class="tier">${preview.isNew ? 'New find · ' : ''}${esc(tier.name)}</div>
            <h3>${esc(car.name)}</h3>
            <div class="sub">${car.flag} ${esc(car.years)} · ${esc(car.engine)}</div>
            <div class="xpline">
              <span class="xpchip xpchip--big">+${preview.xp} XP</span>
              ${preview.bonuses.map((b) => `<span class="xpchip">${esc(b.label)}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="reveal-actions">
          <button class="btn btn--primary btn--block" data-again>Scan another</button>
          <button class="btn btn--ghost btn--block" data-done>Back to the dex</button>
        </div>
      </div>
    </div>`);

  const burst = $('.burst', overlay);
  const n = car.rarity >= 5 ? 34 : 16;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random();
    const d = 90 + Math.random() * 190;
    burst.append(h(`<i style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;animation-delay:${(Math.random() * 0.12).toFixed(2)}s"></i>`));
  }

  document.body.append(overlay);
  hydratePhotos(overlay);

  const close = () => overlay.remove();
  $('[data-again]', overlay).addEventListener('click', () => { close(); go('scan'); });
  $('[data-done]', overlay).addEventListener('click', () => { close(); go('dex'); });

  if (freshBadges?.length) {
    setTimeout(() => toast(`${freshBadges[0].icon} Badge earned · ${freshBadges[0].name}`), 900);
  }
}

/* ---------------------------------------------------------- car detail -- */

async function openCar(carId) {
  const car = CARS_BY_ID.get(carId);
  if (!car) return;
  const mine = state.spots.filter((s) => s.carId === carId);
  const owned = mine.length > 0;
  const tier = RARITY[car.rarity];
  const cover = coverSpot(carId);
  const sets = setsForCar(carId);

  const body = h(`
    <div data-rarity="${car.rarity}">
      <div class="hero${owned && car.rarity >= 5 ? ' card--holo' : ''}">
        ${cover?.photo ? `<img data-photo="${esc(cover.photo)}" alt="${esc(car.name)}">` : silhouette(car.body)}
      </div>

      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <span class="tier" style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--r);border:1px solid color-mix(in srgb,var(--r) 40%,transparent);padding:3px 8px;border-radius:100px">${esc(tier.name)}</span>
        ${owned ? `<span class="micro">${mine.length} spot${mine.length > 1 ? 's' : ''}</span>` : '<span class="micro">Not collected</span>'}
      </div>
      <div class="micro" style="font-size:11px">${esc(car.make)}</div>
      <h3 style="margin:2px 0 12px;font-size:22px;font-weight:800;letter-spacing:-.03em">${esc(car.model)}</h3>

      <div class="specgrid">
        <div class="spec"><div class="k">Years</div><div class="v">${esc(car.years)}</div></div>
        <div class="spec"><div class="k">Origin</div><div class="v">${car.flag} ${esc(car.countryName)}</div></div>
        <div class="spec"><div class="k">Engine</div><div class="v" style="font-size:13.5px">${esc(car.engine)}</div></div>
        <div class="spec"><div class="k">Output</div><div class="v">${car.hp} hp</div></div>
        <div class="spec"><div class="k">Layout</div><div class="v">${esc(car.driveLabel)}</div></div>
        <div class="spec"><div class="k">Body</div><div class="v">${esc(car.bodyLabel)}</div></div>
      </div>

      <div class="taglist">${car.tags.map((t) => `<span class="tag">${esc(t.replace(/-/g, ' '))}</span>`).join('')}</div>

      ${sets.length ? `<div class="section-title">Appears in</div>
        <div class="taglist">${sets.map((s) => `<span class="tag">${esc(s.name)}</span>`).join('')}</div>` : ''}

      ${owned ? `<div class="section-title">Your sightings</div><div class="rows" data-hist></div>` : ''}
      <div style="height:6px"></div>
    </div>`);

  const foot = owned
    ? h(`<div>
        <button class="btn btn--primary btn--block" data-share>${ICON.share} Share this card</button>
      </div>`)
    : h(`<div><button class="btn btn--primary btn--block" data-go-scan>Go find one</button></div>`);

  const sheet = openSheet({ title: owned ? 'In your dex' : 'Locked', body, foot, id: 'car' });
  hydratePhotos(body);

  if (owned) {
    $('[data-hist]', body).innerHTML = mine
      .map((s) => {
        const bits = [new Date(s.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })];
        if (s.coords) bits.push('📍');
        return `<div class="row">
            <span class="lbl" style="font-size:13.5px">${esc(bits.join(' · '))}</span>
            <span style="display:flex;gap:8px;align-items:center">
              <span class="val">+${s.xpAwarded} XP</span>
              <button class="iconbtn" style="width:32px;height:32px;background:var(--surface-2);border-color:var(--line);color:var(--text-faint)" data-del="${esc(s.id)}" aria-label="Delete this sighting">${ICON.close}</button>
            </span>
          </div>`;
      })
      .join('');

    $('[data-hist]', body).addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      const sid = btn.dataset.del;
      const sp = state.spots.find((x) => x.id === sid);
      if (sp?.photo) { store.forgetPhotoURL(sp.photo); store.photos.del(sp.photo); }
      commit((s) => {
        s.spots = s.spots.filter((x) => x.id !== sid);
        s.profile.xp = Math.max(0, s.profile.xp - (sp?.xpAwarded || 0));
      });
      buzz(10);
      toast('Sighting removed');
      sheet.close();
      render();
    });

    $('[data-share]', foot).addEventListener('click', () => shareCard(car, cover));
  } else {
    $('[data-go-scan]', foot).addEventListener('click', () => { sheet.close(); go('scan'); });
  }
}

/* -------------------------------------------------------------- share --- */

/** Draw the card to a canvas so it can leave the app as an image. */
async function shareCard(car, spot) {
  toast('Building card…');
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const tier = RARITY[car.rarity];

  ctx.fillStyle = '#0a0b0e';
  ctx.fillRect(0, 0, W, H);

  const artH = 860;
  let drew = false;
  if (spot?.photo) {
    const url = await store.photoURL(spot.photo);
    if (url) {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i); i.onerror = rej; i.src = url;
      }).catch(() => null);
      if (img) {
        const s = Math.max(W / img.width, artH / img.height);
        const dw = img.width * s, dh = img.height * s;
        ctx.drawImage(img, (W - dw) / 2, (artH - dh) / 2, dw, dh);
        drew = true;
      }
    }
  }
  if (!drew) {
    const g = ctx.createLinearGradient(0, 0, 0, artH);
    g.addColorStop(0, tier.color + '44');
    g.addColorStop(1, '#12141a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, artH);
    const svg = silhouette(car.body).replace('class="sil "', 'class="sil"');
    const styled = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      .replace('>', '><style>.sil-body{fill:#dfe4ec}.sil-tyre{fill:#2b3038}.sil-rim{fill:#79838f}.sil-hub{fill:#2b3038}</style>');
    const img = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(styled);
    });
    if (img) ctx.drawImage(img, W * 0.1, artH * 0.28, W * 0.8, W * 0.8 * 0.4);
  }

  const scrim = ctx.createLinearGradient(0, artH - 320, 0, artH);
  scrim.addColorStop(0, 'rgba(10,11,14,0)');
  scrim.addColorStop(1, 'rgba(10,11,14,1)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, artH - 320, W, 320);

  ctx.fillStyle = tier.color;
  ctx.fillRect(0, artH, W, 6);

  const pad = 72;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = tier.color;
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.fillText(tier.name.toUpperCase(), pad, artH + 92);

  ctx.fillStyle = '#8d97a5';
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText(car.make.toUpperCase(), pad, artH + 152);

  ctx.fillStyle = '#f3f5f8';
  ctx.font = '800 68px system-ui, sans-serif';
  let title = car.model;
  while (ctx.measureText(title).width > W - pad * 2 && title.length > 8) title = title.slice(0, -2);
  ctx.fillText(title + (title !== car.model ? '…' : ''), pad, artH + 228);

  ctx.fillStyle = '#99a1ad';
  ctx.font = '500 34px system-ui, sans-serif';
  ctx.fillText(`${car.years} · ${car.engine} · ${car.hp} hp · ${car.driveLabel}`, pad, artH + 288);

  ctx.fillStyle = '#4a525f';
  ctx.font = '800 28px system-ui, sans-serif';
  ctx.fillText('REDLINE', pad, H - 54);
  ctx.fillStyle = '#333a45';
  ctx.font = '500 28px system-ui, sans-serif';
  const stamp = spot ? new Date(spot.ts).toLocaleDateString() : '';
  ctx.fillText(stamp, W - pad - ctx.measureText(stamp).width, H - 54);

  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
  const file = new File([blob], `redline-${car.id}.jpg`, { type: 'image/jpeg' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: car.name });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Card saved');
}

/* =============================================================== router == */

const TABS = [
  { id: 'dex', label: 'Dex', icon: ICON.dex },
  { id: 'map', label: 'Map', icon: ICON.map },
  { id: 'scan', label: 'Scan', icon: ICON.scan },
  { id: 'hunts', label: 'Hunts', icon: ICON.hunts },
  { id: 'garage', label: 'Garage', icon: ICON.garage },
];

function go(tab) {
  if (!views[tab]) tab = 'dex';
  if (location.hash !== `#${tab}`) location.hash = tab;
  else route();
}

function route() {
  const tab = location.hash.replace('#', '') || 'dex';
  activeTab = views[tab] ? tab : 'dex';
  render();
}

function render() {
  if (activeTab !== 'scan' && camera) { camera.stop(); camera = null; }

  const v = view();
  const scrollTop = v.scrollTop;
  v.dataset.bleed = activeTab === 'scan' ? '1' : '0';
  document.body.dataset.tab = activeTab;
  v.replaceChildren(views[activeTab]());
  if (activeTab === 'dex') v.scrollTop = scrollTop;

  document.querySelectorAll('.tab').forEach((t) => {
    t.setAttribute('aria-selected', String(t.dataset.tab === activeTab));
  });
}

function applyTheme() {
  const t = state.settings.theme;
  const resolved = t === 'auto'
    ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : t;
  document.documentElement.dataset.theme = resolved;
  $('meta[name="theme-color"]')?.setAttribute('content', resolved === 'light' ? '#f2f4f7' : '#08090b');
}

/* -------------------------------------------------------------- holo ---- */

function wireHolo() {
  if (!window.DeviceOrientationEvent) return;
  let raf = null;
  window.addEventListener('deviceorientation', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const tilt = (e.gamma || 0) * 2 + (e.beta || 0);
      document.documentElement.style.setProperty('--tilt', tilt.toFixed(1));
    });
  });
}

/* ------------------------------------------------------------ first run -- */

function maybeOnboard() {
  if (state.spots.length || localStorage.getItem('redline.seen')) return;
  localStorage.setItem('redline.seen', '1');
  openSheet({
    title: 'Welcome to REDLINE',
    body: `
      <p style="margin:0 0 14px;color:var(--text-dim)">Spot a car in the wild, photograph it, and it becomes a card in your dex. 230+ vehicles, six rarity tiers, daily bounties.</p>
      <div class="rows">
        <div class="row"><span class="lbl">📸 Your photo is the card</span></div>
        <div class="row"><span class="lbl">🔒 Everything stays on this device</span></div>
        <div class="row"><span class="lbl">✈️ Works with no signal</span></div>
        <div class="row"><span class="lbl">🚫 No account, no ads, no tracking</span></div>
      </div>`,
    foot: (() => {
      const f = h('<div><button class="btn btn--primary btn--block" data-start>Start spotting</button></div>');
      f.addEventListener('click', () => { history.back(); setTimeout(() => go('scan'), 260); });
      return f;
    })(),
  });
}

/* ================================================================= boot == */

async function boot() {
  await store.load();
  applyTheme();
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (state.settings.theme === 'auto') applyTheme();
  });

  const bar = $('#tabbar');
  bar.innerHTML = TABS.map((t) =>
    t.id === 'scan'
      ? `<button class="tab tab--scan" data-tab="scan" role="tab" aria-selected="false"><span class="fab">${t.icon}</span><span>${t.label}</span></button>`
      : `<button class="tab" data-tab="${t.id}" role="tab" aria-selected="false">${t.icon}<span>${t.label}</span></button>`
  ).join('');

  bar.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    buzz(6);
    go(t.dataset.tab);
  });

  // one delegated handler for every in-view "go to tab" affordance
  view().addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) go(g.dataset.go);
  });

  window.addEventListener('hashchange', route);
  route();
  wireHolo();
  maybeOnboard();

  document.body.classList.remove('booting');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot();
