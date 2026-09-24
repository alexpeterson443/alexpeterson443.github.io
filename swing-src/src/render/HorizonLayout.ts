import type { CityLayout } from '../city/CityGenerator';
import { Rng } from '../core/rng';
import { clamp, lerp, smoothstep } from '../core/math';

/**
 * The world beyond the playable district, as plain data (no Three.js, so it runs in Node tests).
 *
 * Geography (north = −Z, east = +X): the district sits on a peninsula. A harbour bay opens to the
 * north and runs out to open sea in the north-west; a river runs down the west side. Across the bay
 * is a second downtown, across the river a lower west bank, and the city fabric carries on to the
 * east and south. A suspension bridge crosses the mouth of the bay. Nothing here is collidable.
 *
 * Land and water live on one tensor grid of cells (fine near the district, coarser far away) so
 * the ground and water meshes share every edge: no T-junctions, no cracks, no overlap.
 */

export const WATER_Y = -2.4;
/** Nothing is placed farther than this from the district centre (camera far plane is 3000 m). */
export const HORIZON_EXTENT = 3300;

export const enum Variant {
  Box = 0, // mid-rise fabric, flat roof with a bulkhead
  Setback = 1, // three stepped tiers
  Crown = 2, // tower with a stepped pyramid crown
  Spire = 3, // slender setback tower with a needle
  Cylinder = 4, // octagonal drum
  Taper = 5, // tapered modern supertall
  Slab = 6, // thin residential slab
  Count = 7,
}

export interface FarBuilding {
  x: number; z: number; // footprint centre
  w: number; d: number; h: number; // footprint size and height (m)
  rot: number; // yaw (rad)
  variant: Variant;
  style: number; // 0 masonry, 1 glass curtain wall, 2 concrete bands
  hue: number; sat: number; light: number;
  lit: number; // fraction of windows lit at night
  floorH: number;
  seed: number;
  crownLight: number; // 0 none, 1 warm floodlit crown, 2 accent
}

export interface BridgeSpec {
  ax: number; az: number; // west/south anchorage (deck end)
  bx: number; bz: number; // other end
  towerT: [number, number]; // tower positions along the span (0..1)
  deckY: number;
  towerH: number; // above the water
  width: number;
}

export interface HorizonLayout {
  bounds: { x0: number; z0: number; x1: number; z1: number };
  centre: { x: number; z: number };
  /** Grid cell edges (sorted). Cell (i, j) spans xs[i]..xs[i+1], zs[j]..zs[j+1]. */
  xs: number[];
  zs: number[];
  /** 0 water, 1 land, 2 district (drawn by CityRenderer), 3 pier. Index i + j * (xs.length - 1). */
  cells: Uint8Array;
  buildings: FarBuilding[];
  bridge: BridgeSpec;
  /** Promenade lamps along the district quays: x, z pairs. */
  lamps: number[];
  /** The two quay lines facing the district: north quay z and west quay x. */
  quayN: number;
  quayW: number;
  /**
   * Skyline panorama seen from the district centre, used by the water to reflect the far shores:
   * per azimuth bin (atan2(dz, dx) mapped to 0..1): tallest height (m), its distance (m) and a
   * night-light density.
   */
  pano: Float32Array; // PANO_BINS * 4
  stats: { cells: number; land: number; water: number; buildings: number; towers: number };
}

export const PANO_BINS = 512;

/** Continuous land test before quantisation to cells. */
export function makeLandTest(city: CityLayout) {
  const b = city.bounds;
  const quayN = b.z0 - 48;
  const quayW = b.x0 - 48;
  // far bank of the river (west bank), wobbling a little
  const farW = (z: number) => quayW - 450 + 38 * Math.sin(z / 230) + 22 * Math.sin(z / 97 + 1.3);
  // far (north) shore of the bay
  const farN = (x: number) => quayN - 780 + 55 * Math.sin(x / 260 + 0.4) + 25 * Math.sin(x / 83);
  // the north shore ends in a point toward the north-west; west of it is open sea
  const northTipX = (z: number) => quayW - 260 - (farN(0) - z) * 0.55;
  // the west bank ends in a headland north of the district's quay line
  const headZ = quayN - 170;
  // the bay's east side: a headland running north from the district's east edge
  const eastX = (z: number) => b.x1 + 420 + 60 * Math.sin(z / 180) + Math.max(0, quayN - 300 - z) * 0.35;
  return {
    quayN, quayW, farW, farN, headZ,
    isLand(x: number, z: number): boolean {
      if (z >= quayN && x >= quayW) return true; // the district's peninsula, east and south
      if (x < farW(z)) {
        // west bank, ending in a rounded headland
        if (z >= quayN) return true;
        const dz = headZ - z;
        return dz < 0 || (x < farW(headZ) - 60 - dz * dz * 0.004 && dz < 260);
      }
      if (z >= quayN) return false; // river
      if (x > eastX(z)) return true; // east headland
      if (z < farN(x) && x > northTipX(z)) return true; // north shore
      return false;
    },
  };
}

/** Distance (m) from a point to the district rectangle (0 inside). */
function distToRect(x: number, z: number, b: { x0: number; z0: number; x1: number; z1: number }): number {
  const dx = Math.max(b.x0 - x, 0, x - b.x1);
  const dz = Math.max(b.z0 - z, 0, z - b.z1);
  return Math.hypot(dx, dz);
}

/** Cell edges outward from a span: [lo, hi] split evenly, then fine steps, then coarse steps. */
function edges(lo: number, hi: number, inner: number, first: number, fine: number, fineTo: number, coarse: number, extent: number, centre: number): number[] {
  const out: number[] = [];
  for (let k = 0; k <= inner; k++) out.push(lo + ((hi - lo) * k) / inner);
  const grow = (start: number, dir: number) => {
    let x = start + dir * first;
    let step = fine;
    const res: number[] = [];
    while (Math.abs(x - centre) < extent) {
      res.push(x);
      if (Math.abs(x - start) > fineTo) step = coarse;
      x += dir * step;
    }
    res.push(x);
    return res;
  };
  return [...grow(lo, -1).reverse(), ...out, ...grow(hi, 1)];
}

export function buildHorizonLayout(city: CityLayout): HorizonLayout {
  const b = city.bounds, p = city.params;
  const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
  const land = makeLandTest(city);
  const rng = new Rng((p.seed ^ 0x5eed7) >>> 0);

  // --- cell grid ---------------------------------------------------------------------------
  const xs = edges(b.x0, b.x1, 25, 48, (p.blockSizeX + p.avenueWidth) / 4, 1500, (p.blockSizeX + p.avenueWidth) / 2, HORIZON_EXTENT, cx);
  const zs = edges(b.z0, b.z1, 20, 48, (p.blockSizeZ + p.streetWidth) / 2, 1500, p.blockSizeZ + p.streetWidth, HORIZON_EXTENT, cz);
  const nx = xs.length - 1, nz = zs.length - 1;
  const cells = new Uint8Array(nx * nz);
  let nLand = 0, nWater = 0;
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const mx = (xs[i] + xs[i + 1]) / 2, mz = (zs[j] + zs[j + 1]) / 2;
      let v = 0;
      if (mx > b.x0 && mx < b.x1 && mz > b.z0 && mz < b.z1) v = 2;
      else if (land.isLand(mx, mz)) v = 1;
      cells[i + j * nx] = v;
      if (v === 1) nLand++;
      else if (v === 0) nWater++;
    }
  }
  const cellAt = (x: number, z: number): number => {
    const i = upper(xs, x) - 1, j = upper(zs, z) - 1;
    if (i < 0 || j < 0 || i >= nx || j >= nz) return 0;
    return cells[i + j * nx];
  };

  // Piers jutting into the bay from the north quay, and into the river from the west quay.
  const quayRow = upper(zs, land.quayN - 1) - 1; // first row north of the quay line
  for (let i = 0; i < nx; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2;
    if (mx < b.x0 + 40 || mx > b.x1 + 200) continue;
    if (i % 5 !== 2) continue;
    for (let j = quayRow; j > quayRow - 2 && j >= 0; j--) if (cells[i + j * nx] === 0) cells[i + j * nx] = 3;
  }
  const quayCol = upper(xs, land.quayW - 1) - 1;
  for (let j = 0; j < nz; j++) {
    const mz = (zs[j] + zs[j + 1]) / 2;
    if (mz < b.z0 + 60 || mz > b.z1 + 400) continue;
    if (j % 5 !== 1) continue;
    for (let i = quayCol; i > quayCol - 2 && i >= 0; i--) if (cells[i + j * nx] === 0) cells[i + j * nx] = 3;
  }

  // --- buildings on the continuing street grid ------------------------------------------------
  const pitchX = p.blockSizeX + p.avenueWidth, pitchZ = p.blockSizeZ + p.streetWidth;
  const ax0 = b.x0 + p.avenueWidth / 2, sz0 = b.z0 + p.streetWidth / 2;
  const clusters = [
    // second downtown across the bay (the big one), a midtown to the east, a cluster to the
    // south-west and a few towers on the west bank
    { x: cx + 120, z: land.quayN - 1250, r: 520, w: 1.0 },
    { x: b.x1 + 1150, z: cz - 250, r: 420, w: 0.75 },
    { x: cx - 250, z: b.z1 + 1350, r: 450, w: 0.6 },
    { x: land.quayW - 1050, z: cz + 350, r: 380, w: 0.45 },
    { x: b.x1 + 650, z: land.quayN - 900, r: 300, w: 0.5 },
  ];
  const clusterAt = (x: number, z: number) => {
    let c = 0;
    for (const k of clusters) {
      const d = Math.hypot(x - k.x, z - k.z) / k.r;
      c = Math.max(c, k.w * Math.exp(-d * d));
    }
    return c;
  };
  const footprintOnLand = (x0: number, z0: number, x1: number, z1: number) => {
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [(x0 + x1) / 2, (z0 + z1) / 2]]) {
      if (cellAt(x, z) !== 1) return false;
    }
    return true;
  };

  const buildings: FarBuilding[] = [];
  let towers = 0;
  const iMin = Math.floor((cx - HORIZON_EXTENT - ax0) / pitchX), iMax = Math.ceil((cx + HORIZON_EXTENT - ax0) / pitchX);
  const jMin = Math.floor((cz - HORIZON_EXTENT - sz0) / pitchZ), jMax = Math.ceil((cz + HORIZON_EXTENT - sz0) / pitchZ);
  for (let bi = iMin; bi < iMax; bi++) {
    for (let bj = jMin; bj < jMax; bj++) {
      if (bi >= 0 && bi < p.blocksX && bj >= 0 && bj < p.blocksZ) continue; // the playable district
      const brng = rng.fork((bi + 1000) * 7919 + (bj + 1000) * 131);
      const bx0 = ax0 + bi * pitchX + p.avenueWidth / 2, bx1 = bx0 + p.blockSizeX;
      const bz0 = sz0 + bj * pitchZ + p.streetWidth / 2, bz1 = bz0 + p.blockSizeZ;
      const mx = (bx0 + bx1) / 2, mz = (bz0 + bz1) / 2;
      const dc = Math.hypot(mx - cx, mz - cz);
      if (dc > HORIZON_EXTENT - 150) continue;
      const de = distToRect(mx, mz, b);
      const core = clusterAt(mx, mz);
      const far = smoothstep(1400, 2200, dc);
      // occasional park blocks break up the fabric
      if (brng.chance(0.07 * (1 - core))) continue;
      const sw = p.sidewalkWidth;
      const lx0 = bx0 + sw, lx1 = bx1 - sw, lz0 = bz0 + sw, lz1 = bz1 - sw;
      // lots: several near, fewer far (sub-pixel detail isn't worth the instances)
      const nLotsX = far > 0.5 ? brng.int(1, 2) : brng.int(2, 4);
      const rows = far > 0.5 || brng.chance(0.35) ? 1 : 2;
      for (let r = 0; r < rows; r++) {
        const rz0 = lerp(lz0, lz1, r / rows), rz1 = lerp(lz0, lz1, (r + 1) / rows);
        let x = lx0;
        for (let k = 0; k < nLotsX; k++) {
          const last = k === nLotsX - 1;
          const w = last ? lx1 - x : (lx1 - lx0) / nLotsX * brng.range(0.75, 1.25);
          const x1 = Math.min(lx1, x + w);
          const gap = brng.range(0.5, 3);
          const fx0 = x + (k > 0 ? gap : 0), fx1 = x1;
          const fz0 = rz0 + (r > 0 ? gap : 0), fz1 = rz1;
          x = x1;
          if (fx1 - fx0 < 8) continue;
          if (!footprintOnLand(fx0, fz0, fx1, fz1)) continue;
          // height: low-rise hugging the district, mid-rise fabric, towers in the clusters
          const lowRise = 1 - smoothstep(60, 320, de);
          let h = lerp(20, 40, brng.next()) * Math.exp(0.35 * brng.gauss());
          h = lerp(h, brng.range(9, 22), lowRise);
          h *= lerp(1, 1.5, core);
          let variant: Variant = brng.chance(0.08) && h > 25 ? Variant.Slab : Variant.Box;
          const towerChance = core * 0.85 + (1 - lowRise) * 0.035;
          let fw = fx1 - fx0, fd = fz1 - fz0;
          const fxc = (fx0 + fx1) / 2;
          let fzc = (fz0 + fz1) / 2;
          if (lowRise < 0.3 && brng.chance(towerChance)) {
            towers++;
            const tall = Math.pow(brng.next(), lerp(2.2, 0.9, core));
            h = lerp(75, lerp(170, 440, core), tall);
            if (h > 300 && brng.chance(0.5)) variant = Variant.Taper;
            else if (h > 200) variant = brng.pick([Variant.Spire, Variant.Crown, Variant.Setback, Variant.Taper, Variant.Cylinder]);
            else variant = brng.pick([Variant.Setback, Variant.Setback, Variant.Box, Variant.Crown, Variant.Cylinder, Variant.Slab]);
            // towers stand on squarer footprints
            const s = Math.min(fw, fd, lerp(28, 52, brng.next()));
            fw = Math.min(fw, s * brng.range(1.0, 1.35));
            fd = Math.min(fd, s);
            if (variant === Variant.Cylinder || variant === Variant.Taper) fw = fd = Math.min(fw, fd);
          } else if (variant === Variant.Slab) {
            fd = Math.min(fd, brng.range(12, 18));
            fzc = brng.chance(0.5) ? fz0 + fd / 2 : fz1 - fd / 2;
          }
          h = clamp(h, 7, 460);
          const style = h > 90 ? (brng.chance(0.62) ? 1 : 2) : brng.chance(0.58) ? 0 : brng.chance(0.5) ? 2 : 1;
          buildings.push({
            x: fxc, z: fzc, w: fw, d: fd, h,
            rot: variant === Variant.Cylinder ? brng.range(0, Math.PI) : 0,
            variant, style,
            hue: style === 1 ? brng.range(0.5, 0.6) : brng.pick([0.03, 0.06, 0.08, 0.1, 0.12, 0.58]) + brng.range(-0.02, 0.02),
            sat: style === 1 ? brng.range(0.12, 0.3) : brng.range(0.06, 0.3),
            light: style === 1 ? brng.range(0.16, 0.3) : brng.range(0.3, 0.6),
            lit: brng.range(0.2, 0.65),
            floorH: 3.6 * brng.range(0.92, 1.12),
            seed: brng.next() * 1000,
            crownLight: h > 150 && brng.chance(0.4) ? (brng.chance(0.2) ? 2 : 1) : 0,
          });
        }
      }
    }
  }

  // --- suspension bridge across the mouth of the bay ------------------------------------------
  // West end on the headland of the west bank, east end on the north shore's western point.
  const aX = land.farW(land.headZ) - 150, aZ = land.headZ + 40;
  const nzFar = land.farN(aX + 250);
  const bX = aX + 330, bZ = nzFar - 150;
  const bridge: BridgeSpec = { ax: aX, az: aZ, bx: bX, bz: bZ, towerT: [0.22, 0.78], deckY: 32, towerH: 150, width: 26 };

  // --- promenade lamps along the district quays ------------------------------------------------
  const lamps: number[] = [];
  for (let x = b.x0 - 30; x <= b.x1 + 150; x += 24) lamps.push(x, land.quayN + 3);
  for (let z = land.quayN + 20; z <= b.z1 + 300; z += 24) lamps.push(land.quayW + 3, z);

  // --- skyline panorama from the district centre --------------------------------------------
  const pano = new Float32Array(PANO_BINS * 4);
  const addPano = (x: number, z: number, halfW: number, h: number, light: number) => {
    const dx = x - cx, dz = z - cz;
    const dist = Math.hypot(dx, dz);
    if (dist < 1) return;
    const az = Math.atan2(dz, dx);
    const half = Math.atan(halfW / dist);
    const a0 = Math.floor(((az - half + Math.PI) / (2 * Math.PI)) * PANO_BINS);
    const a1 = Math.floor(((az + half + Math.PI) / (2 * Math.PI)) * PANO_BINS);
    const elev = Math.atan2(h, dist);
    for (let a = a0; a <= a1; a++) {
      const k = ((a % PANO_BINS) + PANO_BINS) % PANO_BINS;
      const o = k * 4;
      const cur = pano[o] > 0 ? Math.atan2(pano[o], pano[o + 1]) : -1;
      if (elev > cur) { pano[o] = h; pano[o + 1] = dist; }
      pano[o + 2] += light / Math.max(1, a1 - a0 + 1);
      pano[o + 3] = Math.max(pano[o + 3], dist);
    }
  };
  for (const f of buildings) {
    if (distToRect(f.x, f.z, b) < 250) continue; // near fabric is hidden by the quays anyway
    addPano(f.x, f.z, Math.max(f.w, f.d) / 2, f.h, f.lit * f.h * Math.max(f.w, f.d) * 0.0005);
  }
  // bridge towers
  for (const t of bridge.towerT) addPano(lerp(bridge.ax, bridge.bx, t), lerp(bridge.az, bridge.bz, t), 6, bridge.towerH, 0.2);
  // normalise the light channel
  let maxL = 1e-6;
  for (let k = 0; k < PANO_BINS; k++) maxL = Math.max(maxL, pano[k * 4 + 2]);
  for (let k = 0; k < PANO_BINS; k++) pano[k * 4 + 2] = Math.min(1, (pano[k * 4 + 2] / maxL) * 1.6);

  return {
    bounds: { ...b }, centre: { x: cx, z: cz }, xs, zs, cells, buildings, bridge, lamps,
    quayN: land.quayN, quayW: land.quayW, pano,
    stats: { cells: nx * nz, land: nLand, water: nWater, buildings: buildings.length, towers },
  };
}

/** Index of the first element greater than v (binary search over sorted edges). */
function upper(a: number[], v: number): number {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (a[m] <= v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/** Cell value at a world point (0 water, 1 land, 2 district, 3 pier; 0 outside the grid). */
export function cellAtPoint(l: HorizonLayout, x: number, z: number): number {
  const nx = l.xs.length - 1, nz = l.zs.length - 1;
  const i = upper(l.xs, x) - 1, j = upper(l.zs, z) - 1;
  if (i < 0 || j < 0 || i >= nx || j >= nz) return 0;
  return l.cells[i + j * nx];
}
