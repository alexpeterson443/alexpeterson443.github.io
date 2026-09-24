import { Rng } from '../core/rng';
import { clamp, lerp } from '../core/math';

/** Everything configurable about a generated district. Same params + seed → identical city. */
export interface CityParams {
  seed: number;
  blocksX: number;
  blocksZ: number;
  blockSizeX: number; // along X (long side, Manhattan-style)
  blockSizeZ: number;
  avenueWidth: number; // roads running along Z
  streetWidth: number; // roads running along X
  sidewalkWidth: number;
  alleyChance: number;
  alleyWidth: number;
  lotMinWidth: number;
  lotMaxWidth: number;
  buildingDensity: number; // 0..1 chance a lot is built (else plaza/park)
  minHeight: number;
  medianHeight: number;
  maxHeight: number;
  skyscraperChance: number;
  downtownRadius: number; // falloff of the tall core
  setbackChance: number;
  floorHeight: number;
  propDensity: number; // 0..2 multiplier on roof/street props
  waterTowerChance: number;
  billboardChance: number;
  treeSpacing: number;
  lightSpacing: number;
}

export const defaultCityParams: CityParams = {
  seed: 1337,
  blocksX: 6,
  blocksZ: 8,
  blockSizeX: 96,
  blockSizeZ: 58,
  avenueWidth: 26,
  streetWidth: 17,
  sidewalkWidth: 4.5,
  alleyChance: 0.45,
  alleyWidth: 6.5,
  lotMinWidth: 14,
  lotMaxWidth: 34,
  buildingDensity: 0.93,
  minHeight: 12,
  medianHeight: 38,
  maxHeight: 250,
  skyscraperChance: 0.2,
  downtownRadius: 260,
  setbackChance: 0.7,
  floorHeight: 3.6,
  propDensity: 1,
  waterTowerChance: 0.35,
  billboardChance: 0.12,
  treeSpacing: 14,
  lightSpacing: 26,
};

export interface Tier {
  x0: number; z0: number; x1: number; z1: number;
  y0: number; y1: number;
}

export type RoofType = 'flat' | 'parapet' | 'stepped' | 'spire' | 'crown';

export interface Building {
  id: number;
  tiers: Tier[];
  height: number;
  roof: RoofType;
  /** facade style: 0 = brick/stone punched windows, 1 = glass curtain wall, 2 = concrete bands */
  style: number;
  hue: number;
  sat: number;
  light: number;
  windowW: number;
  windowH: number;
  floorH: number;
  litFraction: number;
  seed: number;
}

export type PropType =
  | 'waterTower' | 'hvac' | 'antenna' | 'billboard' | 'streetLight' | 'signal'
  | 'tree' | 'vent' | 'parapet' | 'bench' | 'hydrant' | 'kiosk' | 'planter';

export interface Prop {
  type: PropType;
  x: number; y: number; z: number;
  sx: number; sy: number; sz: number;
  rotY: number;
  building: number; // -1 = street
  variant: number;
}

export interface Road {
  axis: 'x' | 'z'; // direction of travel
  c: number; // centre coordinate across the road (z for axis x, x for axis z)
  from: number; to: number; // extent along the road
  width: number;
  lanesPerDir: number;
}

export interface Block {
  x0: number; z0: number; x1: number; z1: number; // includes sidewalk
  park: boolean;
}

export interface PerchPoint {
  x: number; y: number; z: number;
  building: number;
  kind: 'roofCorner' | 'tower' | 'antenna' | 'lamp' | 'billboard';
}

export interface CityLayout {
  params: CityParams;
  bounds: { x0: number; z0: number; x1: number; z1: number };
  roads: Road[];
  blocks: Block[];
  buildings: Building[];
  props: Prop[];
  perches: PerchPoint[];
  /** X coordinates of avenue centrelines and Z coordinates of street centrelines. */
  avenueX: number[];
  streetZ: number[];
  stats: { buildings: number; tiers: number; props: number; tallest: number };
}

/** Lognormal-ish height sample around a median, pushed up near the downtown core. */
function sampleHeight(rng: Rng, p: CityParams, core: number): number {
  const sigma = 0.45;
  let h = p.medianHeight * Math.exp(sigma * rng.gauss()) * lerp(0.55, 1.35, core);
  if (rng.chance(p.skyscraperChance * (0.25 + core * 1.3))) {
    h = lerp(110, p.maxHeight, Math.pow(rng.next(), 0.8) * (0.5 + 0.5 * core));
  }
  return clamp(h, p.minHeight, p.maxHeight);
}

export function generateCity(params: Partial<CityParams> = {}): CityLayout {
  const p: CityParams = { ...defaultCityParams, ...params };
  const rng = new Rng(p.seed);

  // --- road grid ----------------------------------------------------------
  const totalX = p.blocksX * p.blockSizeX + (p.blocksX + 1) * p.avenueWidth;
  const totalZ = p.blocksZ * p.blockSizeZ + (p.blocksZ + 1) * p.streetWidth;
  const ox = -totalX / 2, oz = -totalZ / 2;
  const avenueX: number[] = [];
  const streetZ: number[] = [];
  for (let i = 0; i <= p.blocksX; i++) avenueX.push(ox + p.avenueWidth / 2 + i * (p.blockSizeX + p.avenueWidth));
  for (let j = 0; j <= p.blocksZ; j++) streetZ.push(oz + p.streetWidth / 2 + j * (p.blockSizeZ + p.streetWidth));

  const roads: Road[] = [];
  for (const x of avenueX) roads.push({ axis: 'z', c: x, from: oz, to: oz + totalZ, width: p.avenueWidth, lanesPerDir: 2 });
  for (const z of streetZ) roads.push({ axis: 'x', c: z, from: ox, to: ox + totalX, width: p.streetWidth, lanesPerDir: 1 });

  const blocks: Block[] = [];
  const buildings: Building[] = [];
  const props: Prop[] = [];
  const perches: PerchPoint[] = [];
  // Two downtown cores so the skyline has a shape rather than a single spike.
  const cores = [
    { x: ox + totalX * 0.42, z: oz + totalZ * 0.4, w: 1 },
    { x: ox + totalX * 0.7, z: oz + totalZ * 0.75, w: 0.7 },
  ];
  const coreAt = (x: number, z: number) => {
    let c = 0;
    for (const k of cores) {
      const d = Math.hypot(x - k.x, z - k.z) / p.downtownRadius;
      c = Math.max(c, k.w * Math.exp(-d * d));
    }
    return c;
  };

  let tierCount = 0;
  let tallest = 0;

  const addBuilding = (x0: number, z0: number, x1: number, z1: number, brng: Rng) => {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const core = coreAt(cx, cz);
    const h = sampleHeight(brng, p, core);
    const id = buildings.length;
    const style = h > 90 ? (brng.chance(0.65) ? 1 : 2) : brng.chance(0.62) ? 0 : brng.chance(0.5) ? 2 : 1;
    const tiers: Tier[] = [];
    // Setbacks: tall buildings step in as they rise (zoning-envelope look, and great ledges to run on).
    const nTiers = h > 60 && brng.chance(p.setbackChance) ? brng.int(2, h > 150 ? 4 : 3) : 1;
    let tx0 = x0, tz0 = z0, tx1 = x1, tz1 = z1, y = 0;
    for (let t = 0; t < nTiers; t++) {
      const last = t === nTiers - 1;
      const frac = last ? 1 : lerp(0.35, 0.6, brng.next()) + t * 0.1;
      const top = last ? h : Math.max(y + 12, Math.min(h - 10, h * frac));
      tiers.push({ x0: tx0, z0: tz0, x1: tx1, z1: tz1, y0: y, y1: top });
      y = top;
      const inset = brng.range(2, 6);
      const minSide = 9;
      if (tx1 - tx0 - 2 * inset > minSide) { tx0 += inset; tx1 -= inset; }
      if (tz1 - tz0 - 2 * inset > minSide) { tz0 += inset; tz1 -= inset; }
      if (last) break;
    }
    tierCount += tiers.length;
    tallest = Math.max(tallest, h);
    const roofRoll = brng.next();
    const roof: RoofType = h > 150 && roofRoll < 0.35 ? 'spire' : h > 110 && roofRoll < 0.55 ? 'crown' : roofRoll < 0.72 ? 'parapet' : 'flat';
    const floorH = p.floorHeight * brng.range(0.92, 1.12);
    buildings.push({
      id, tiers, height: h, roof, style,
      hue: style === 1 ? brng.range(0.52, 0.62) : brng.pick([0.03, 0.06, 0.08, 0.1, 0.12, 0.58]) + brng.range(-0.02, 0.02),
      sat: style === 1 ? brng.range(0.15, 0.35) : brng.range(0.08, 0.38),
      light: style === 1 ? brng.range(0.18, 0.32) : brng.range(0.28, 0.62),
      windowW: style === 1 ? brng.range(1.4, 2.2) : brng.range(1.0, 1.6),
      windowH: style === 1 ? floorH * 0.85 : brng.range(1.5, 2.2),
      floorH,
      litFraction: brng.range(0.25, 0.7),
      seed: brng.next() * 1000,
    });

    // --- roof dressing on the top tier ---
    const top = tiers[tiers.length - 1];
    const tw = top.x1 - top.x0, td = top.z1 - top.z0;
    const roofY = top.y1;
    if (roof === 'parapet' || roof === 'crown') {
      const ph = roof === 'crown' ? brng.range(2.5, 5) : brng.range(0.8, 1.3);
      const th = 0.45;
      props.push({ type: 'parapet', x: (top.x0 + top.x1) / 2, y: roofY, z: top.z0 + th / 2, sx: tw, sy: ph, sz: th, rotY: 0, building: id, variant: 0 });
      props.push({ type: 'parapet', x: (top.x0 + top.x1) / 2, y: roofY, z: top.z1 - th / 2, sx: tw, sy: ph, sz: th, rotY: 0, building: id, variant: 0 });
      props.push({ type: 'parapet', x: top.x0 + th / 2, y: roofY, z: (top.z0 + top.z1) / 2, sx: th, sy: ph, sz: td - 2 * th, rotY: 0, building: id, variant: 0 });
      props.push({ type: 'parapet', x: top.x1 - th / 2, y: roofY, z: (top.z0 + top.z1) / 2, sx: th, sy: ph, sz: td - 2 * th, rotY: 0, building: id, variant: 0 });
    }
    // Roof corners of every tier are perch points.
    for (const t of tiers) {
      const py = t.y1 + (roof === 'parapet' && t === top ? 1.1 : 0);
      for (const [px, pz] of [[t.x0, t.z0], [t.x1, t.z0], [t.x0, t.z1], [t.x1, t.z1]]) {
        perches.push({ x: px, y: py, z: pz, building: id, kind: 'roofCorner' });
      }
    }
    if (roof === 'spire') {
      const sh = brng.range(18, 45);
      props.push({ type: 'antenna', x: (top.x0 + top.x1) / 2, y: roofY, z: (top.z0 + top.z1) / 2, sx: 1.2, sy: sh, sz: 1.2, rotY: 0, building: id, variant: 0 });
      perches.push({ x: (top.x0 + top.x1) / 2, y: roofY + sh, z: (top.z0 + top.z1) / 2, building: id, kind: 'antenna' });
    }
    const pd = p.propDensity;
    const nHvac = Math.floor(brng.range(0, 3.5) * pd * Math.min(1, (tw * td) / 400));
    for (let k = 0; k < nHvac; k++) {
      const sx = brng.range(2, 5), sz = brng.range(2, 4), sy = brng.range(1.2, 2.4);
      const hx = brng.range(top.x0 + sx / 2 + 1.5, top.x1 - sx / 2 - 1.5);
      const hz = brng.range(top.z0 + sz / 2 + 1.5, top.z1 - sz / 2 - 1.5);
      if (Number.isFinite(hx) && Number.isFinite(hz) && top.x1 - top.x0 > sx + 3 && top.z1 - top.z0 > sz + 3)
        props.push({ type: brng.chance(0.3) ? 'vent' : 'hvac', x: hx, y: roofY, z: hz, sx, sy, sz, rotY: 0, building: id, variant: brng.int(0, 2) });
    }
    if (h > 18 && h < 110 && brng.chance(p.waterTowerChance * pd) && tw > 10 && td > 10) {
      const r = brng.range(2.2, 3.2);
      const legH = brng.range(3, 5);
      const tankH = brng.range(4.5, 6.5);
      const wx = brng.range(top.x0 + r + 1.5, top.x1 - r - 1.5);
      const wz = brng.range(top.z0 + r + 1.5, top.z1 - r - 1.5);
      props.push({ type: 'waterTower', x: wx, y: roofY, z: wz, sx: r, sy: legH, sz: tankH, rotY: brng.range(0, 6.28), building: id, variant: 0 });
      perches.push({ x: wx, y: roofY + legH + tankH + r * 0.55, z: wz, building: id, kind: 'tower' });
    }
    if (h > 25 && h < 140 && brng.chance(p.billboardChance * pd)) {
      const alongX = brng.chance(0.5);
      const bw = Math.min(alongX ? tw - 2 : td - 2, brng.range(10, 18));
      if (bw > 6) {
        const bh = bw * 0.42;
        const edge = brng.chance(0.5);
        const bx = alongX ? (top.x0 + top.x1) / 2 : edge ? top.x0 + 1.5 : top.x1 - 1.5;
        const bz = alongX ? (edge ? top.z0 + 1.5 : top.z1 - 1.5) : (top.z0 + top.z1) / 2;
        props.push({ type: 'billboard', x: bx, y: roofY, z: bz, sx: alongX ? bw : 0.5, sy: bh + 3, sz: alongX ? 0.5 : bw, rotY: alongX ? 0 : Math.PI / 2, building: id, variant: brng.int(0, 5) });
        perches.push({ x: bx, y: roofY + bh + 3, z: bz, building: id, kind: 'billboard' });
      }
    }
  };

  for (let bi = 0; bi < p.blocksX; bi++) {
    for (let bj = 0; bj < p.blocksZ; bj++) {
      const bx0 = avenueX[bi] + p.avenueWidth / 2, bx1 = avenueX[bi + 1] - p.avenueWidth / 2;
      const bz0 = streetZ[bj] + p.streetWidth / 2, bz1 = streetZ[bj + 1] - p.streetWidth / 2;
      const brng = rng.fork(bi * 131 + bj * 7919);
      const park = brng.chance(0.06) && coreAt((bx0 + bx1) / 2, (bz0 + bz1) / 2) < 0.6;
      blocks.push({ x0: bx0, z0: bz0, x1: bx1, z1: bz1, park });
      const sw = p.sidewalkWidth;
      const lx0 = bx0 + sw, lx1 = bx1 - sw, lz0 = bz0 + sw, lz1 = bz1 - sw;
      if (park) {
        for (let k = 0; k < 18 * p.propDensity; k++) {
          const s = brng.range(0.8, 1.3);
          props.push({ type: 'tree', x: brng.range(lx0 + 3, lx1 - 3), y: 0, z: brng.range(lz0 + 3, lz1 - 3), sx: s, sy: s * brng.range(6, 9), sz: s, rotY: brng.range(0, 6.28), building: -1, variant: brng.int(0, 2) });
        }
        continue;
      }
      // Rows: two rows back-to-back, optionally split by a mid-block alley running along X.
      const hasAlley = brng.chance(p.alleyChance);
      const midZ = (lz0 + lz1) / 2 + brng.range(-4, 4);
      const rows: [number, number][] = hasAlley
        ? [[lz0, midZ - p.alleyWidth / 2], [midZ + p.alleyWidth / 2, lz1]]
        : brng.chance(0.5) ? [[lz0, lz1]] : [[lz0, midZ], [midZ, lz1]];
      for (const [rz0, rz1] of rows) {
        let x = lx0;
        while (x < lx1 - 1) {
          let w = brng.range(p.lotMinWidth, p.lotMaxWidth);
          if (lx1 - (x + w) < p.lotMinWidth) w = lx1 - x;
          const gap = brng.chance(0.12) ? brng.range(3.5, 6) : 0; // narrow gaps between buildings
          const x1 = Math.min(lx1, x + w);
          if (brng.chance(p.buildingDensity)) addBuilding(x, rz0, x1 - gap, rz1, brng.fork(buildings.length + 17));
          else {
            // small plaza with a kiosk/trees
            props.push({ type: 'tree', x: (x + x1) / 2, y: 0, z: (rz0 + rz1) / 2, sx: 1, sy: 7, sz: 1, rotY: 0, building: -1, variant: 1 });
            props.push({ type: 'kiosk', x: (x + x1) / 2 + 3, y: 0, z: (rz0 + rz1) / 2 + 3, sx: 3, sy: 2.8, sz: 2.5, rotY: 0, building: -1, variant: 0 });
          }
          x = x1;
        }
      }
      // Sidewalk furniture along all four edges of the block.
      const edges: [number, number, number, number, number][] = [
        [bx0, bz0 + 1.2, bx1, bz0 + 1.2, 0],
        [bx0, bz1 - 1.2, bx1, bz1 - 1.2, Math.PI],
        [bx0 + 1.2, bz0, bx0 + 1.2, bz1, Math.PI / 2],
        [bx1 - 1.2, bz0, bx1 - 1.2, bz1, -Math.PI / 2],
      ];
      for (const [ax, az, cx, cz, rot] of edges) {
        const len = Math.hypot(cx - ax, cz - az);
        const nl = Math.floor(len / p.lightSpacing);
        for (let k = 1; k < nl; k++) {
          const t = k / nl;
          const lx = lerp(ax, cx, t), lz = lerp(az, cz, t);
          props.push({ type: 'streetLight', x: lx, y: 0, z: lz, sx: 0.18, sy: 7.5, sz: 0.18, rotY: rot, building: -1, variant: 0 });
          perches.push({ x: lx, y: 7.7, z: lz, building: -1, kind: 'lamp' });
        }
        const nt = Math.floor(len / p.treeSpacing);
        for (let k = 0; k < nt; k++) {
          if (!brng.chance(0.45 * p.propDensity)) continue;
          const t = (k + 0.5) / nt;
          const tx = lerp(ax, cx, t), tz = lerp(az, cz, t);
          const s = brng.range(0.7, 1.1);
          props.push({ type: 'tree', x: tx, y: 0, z: tz, sx: s, sy: s * brng.range(5.5, 8), sz: s, rotY: brng.range(0, 6.28), building: -1, variant: brng.int(0, 2) });
        }
        const nh = Math.floor(len / 40);
        for (let k = 0; k < nh; k++) {
          if (!brng.chance(0.5)) continue;
          const t = brng.range(0.1, 0.9);
          props.push({ type: brng.chance(0.5) ? 'hydrant' : 'bench', x: lerp(ax, cx, t), y: 0, z: lerp(az, cz, t), sx: 1, sy: 1, sz: 1, rotY: rot, building: -1, variant: 0 });
        }
      }
    }
  }

  // Traffic signals on intersection corners.
  for (const x of avenueX) {
    for (const z of streetZ) {
      const hx = p.avenueWidth / 2 + 1.0, hz = p.streetWidth / 2 + 1.0;
      props.push({ type: 'signal', x: x + hx, y: 0, z: z + hz, sx: 0.2, sy: 6, sz: 0.2, rotY: Math.PI, building: -1, variant: 0 });
      props.push({ type: 'signal', x: x - hx, y: 0, z: z - hz, sx: 0.2, sy: 6, sz: 0.2, rotY: 0, building: -1, variant: 1 });
    }
  }

  return {
    params: p,
    bounds: { x0: ox, z0: oz, x1: ox + totalX, z1: oz + totalZ },
    roads, blocks, buildings, props, perches, avenueX, streetZ,
    stats: { buildings: buildings.length, tiers: tierCount, props: props.length, tallest },
  };
}
