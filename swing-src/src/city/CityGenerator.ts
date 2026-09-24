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

/** Facade archetypes (appearance only; the renderer and facade shader share these ids). */
export const Archetype = {
  Brick: 0, Brownstone: 1, Limestone: 2, Concrete: 3, Granite: 4, Curtain: 5, Ribbon: 6,
} as const;

/** Roof surface kinds (appearance only). */
export const RoofKind = { Tar: 0, Membrane: 1, Gravel: 2, Pavers: 3 } as const;

export interface Building {
  id: number;
  tiers: Tier[];
  height: number;
  roof: RoofType;
  /** layout style draw: 0 = punched windows, 1 = glass curtain wall, 2 = bands (refined into `archetype`) */
  style: number;
  /** wall colour as HSL of the linear colour (kept for compatibility; `wallColor` is authoritative) */
  hue: number;
  sat: number;
  light: number;
  windowW: number;
  windowH: number;
  floorH: number;
  litFraction: number;
  seed: number;
  // --- appearance only: derived from a separate hash of the building, never the layout RNG ---
  archetype: number;
  /** sRGB 0xRRGGBB */
  wallColor: number;
  trimColor: number;
  frameColor: number;
  glassColor: number;
  /** storefront / lobby storey height (m) */
  groundH: number;
  /** masonry between window bays (m); 0 for glazed grids */
  pier: number;
  /** window sill height above each floor slab (m) */
  sill: number;
  /** windows grouped in pairs within each bay */
  paired: boolean;
  /** office floors (lit by zone at night) rather than apartments (lit per room) */
  office: boolean;
  roofKind: number;
}

/** Deterministic 32-bit hash used to seed the appearance RNG (independent of the layout RNG). */
function appearanceSeed(citySeed: number, id: number): number {
  let h = (Math.imul(citySeed | 0, 0x9e3779b1) ^ Math.imul(id + 1, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Jitter an sRGB colour's brightness/saturation a little so no two buildings match exactly. */
function jitterColor(hex: number, a: Rng, amt: number): number {
  const ch = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((v) => v / 255);
  const k = 1 + a.range(-amt, amt);
  const warm = a.range(-amt, amt) * 0.35;
  const out = ch.map((v, i) => clamp(v * k * (1 + (i === 0 ? warm : i === 2 ? -warm : 0)), 0, 1));
  return (Math.round(out[0] * 255) << 16) | (Math.round(out[1] * 255) << 8) | Math.round(out[2] * 255);
}

/** HSL of the *linear* colour, matching how `Color.setHSL` interprets it in the working colour space. */
function hexToLinearHsl(hex: number): [number, number, number] {
  const r = srgbToLinear(((hex >> 16) & 255) / 255), g = srgbToLinear(((hex >> 8) & 255) / 255), b = srgbToLinear((hex & 255) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

const PAL = {
  brickWall: [0x8b3a2b, 0x9a4632, 0x7b3226, 0x6f3b2c, 0xa0583d, 0x5f2b23, 0x86503a, 0x8f4430, 0xb39a76, 0xa9785a, 0xbdb6a8],
  brickTrim: [0xd2c7b0, 0xc4b89c, 0xe0dcd2, 0xb8ab90, 0xcfc9bb],
  brickFrame: [0x1c1e1e, 0x1f3327, 0xe2e0da, 0x3b2a1f, 0x5a1f1a, 0xdad6cc],
  brownWall: [0x5b3e32, 0x684636, 0x4c342a, 0x735243, 0x62463a],
  brownFrame: [0x1a1a1a, 0xe0ddd5, 0x2d3a2c, 0x3a2418],
  limeWall: [0xcfc1a5, 0xd9cdb5, 0xc2b08f, 0xbfb7a8, 0xe2d6bd, 0xb4a58b, 0xc9b79a, 0xd6c3a3],
  limeTrim: [0xe6ddca, 0xa89a7f, 0xd8cfbd, 0xb9ab90],
  limeFrame: [0x22201c, 0x2b3a31, 0x4b3b2a, 0xdcd8cc, 0x1a1d20],
  concWall: [0x9c9a94, 0x8c8a85, 0xa9a59c, 0x7c7b77, 0xb2aa98, 0x929a9c, 0xa39d92],
  concFrame: [0x9ea4a8, 0x2c2f33, 0x6b6f72, 0x8d8f8c],
  granWall: [0x2a292b, 0x3b3633, 0x4a3f3a, 0x262b30, 0x5a4c44, 0x3d3f42, 0x6b5a50],
  granFrame: [0x4a3a28, 0x151515, 0x3a3a3a, 0x6a5238],
  granGlass: [0x5a4a38, 0x4b555a, 0x3d4a52, 0x465048],
  cwWall: [0x8f979d, 0x5a6066, 0x2e3237, 0xa7adb2, 0x44484c],
  cwGlass: [0x3d6b8f, 0x2f5f70, 0x467f76, 0x7a6548, 0x9aa6ae, 0x2a4666, 0x33393f, 0x5f8fa3, 0x55708a, 0x8a7a64],
  cwFrame: [0xa9b0b5, 0x2b2f33, 0x5c4a36, 0x7d858b],
  ribWall: [0xd9d9d3, 0xc7b99d, 0x9e9b94, 0x4b4e52, 0x8e4b3a, 0xb8c0c4, 0xe4e1d8],
  ribGlass: [0x4f6f80, 0x5d7d74, 0x3d4a55, 0x6a7a80, 0x49606e],
  ribFrame: [0x9aa0a4, 0x2a2d31, 0x5d6166],
  resGlass: [0x8fa3a0, 0x98a4ad, 0x8a9a96, 0xa0aaaf],
} as const;

/**
 * Appearance of one building: archetype, palette, window module and storefront height. Draws only
 * from its own RNG `a`, so the layout (and every other building) is unaffected.
 */
function applyAppearance(b: Building, a: Rng): void {
  const h = b.height;
  const r = a.next();
  let arch: number;
  if (b.style === 1) arch = h > 60 ? (r < 0.8 ? Archetype.Curtain : Archetype.Granite) : r < 0.6 ? Archetype.Curtain : Archetype.Ribbon;
  else if (b.style === 2) arch = h > 90 ? (r < 0.5 ? Archetype.Ribbon : r < 0.8 ? Archetype.Concrete : Archetype.Granite) : r < 0.55 ? Archetype.Ribbon : Archetype.Concrete;
  else if (h < 28) arch = r < 0.45 ? Archetype.Brick : r < 0.75 ? Archetype.Brownstone : Archetype.Limestone;
  else if (h < 70) arch = r < 0.5 ? Archetype.Brick : r < 0.85 ? Archetype.Limestone : Archetype.Concrete;
  else arch = r < 0.55 ? Archetype.Limestone : r < 0.75 ? Archetype.Brick : Archetype.Concrete;

  let wall: number, trim: number, frame: number, glass: number;
  let floorH: number, winW: number, winH: number, pier: number, sill: number, groundH: number;
  let paired = false, office = false;
  switch (arch) {
    case Archetype.Brick:
      wall = a.pick(PAL.brickWall); trim = a.pick(PAL.brickTrim); frame = a.pick(PAL.brickFrame); glass = a.pick(PAL.resGlass);
      floorH = a.range(3.1, 3.4); winW = a.range(0.95, 1.25); winH = a.range(1.65, 1.95); pier = a.range(0.9, 1.5); sill = a.range(0.8, 0.9);
      paired = a.chance(0.25); groundH = a.range(4.2, 4.8);
      break;
    case Archetype.Brownstone:
      wall = a.pick(PAL.brownWall); trim = jitterColor(wall, a, 0.1); frame = a.pick(PAL.brownFrame); glass = a.pick(PAL.resGlass);
      floorH = a.range(3.4, 3.8); winW = a.range(1.0, 1.2); winH = a.range(2.0, 2.3); pier = a.range(1.1, 1.5); sill = 0.75;
      paired = a.chance(0.1); groundH = a.range(4.2, 4.6);
      break;
    case Archetype.Limestone:
      wall = a.pick(PAL.limeWall); trim = a.pick(PAL.limeTrim); frame = a.pick(PAL.limeFrame); glass = a.pick(PAL.resGlass);
      floorH = a.range(3.4, 3.8); winW = a.range(1.0, 1.35); winH = a.range(1.8, 2.15); pier = a.range(0.7, 1.2); sill = 0.8;
      paired = a.chance(0.5); office = a.chance(0.4); groundH = a.range(4.4, 5.2);
      break;
    case Archetype.Concrete:
      wall = a.pick(PAL.concWall); trim = wall; frame = a.pick(PAL.concFrame); glass = a.pick(PAL.ribGlass);
      floorH = a.range(3.3, 3.8); winW = a.range(1.5, 2.3); winH = a.range(1.5, 1.9); pier = a.range(0.7, 1.3); sill = 0.85;
      office = a.chance(0.7); groundH = a.range(4.4, 5.4);
      break;
    case Archetype.Granite:
      wall = a.pick(PAL.granWall); trim = jitterColor(wall, a, 0.15); frame = a.pick(PAL.granFrame); glass = a.pick(PAL.granGlass);
      floorH = a.range(3.8, 4.1); winW = a.range(1.5, 2.4); winH = floorH - a.range(1.0, 1.2); pier = a.range(0.7, 1.0); sill = 0.5;
      office = true; groundH = a.range(5.0, 6.0);
      break;
    case Archetype.Curtain:
      wall = a.pick(PAL.cwWall); frame = a.pick(PAL.cwFrame); trim = frame; glass = a.pick(PAL.cwGlass);
      floorH = a.range(3.8, 4.2); winW = a.range(1.35, 1.7); winH = floorH - a.range(0.9, 1.2); pier = 0; sill = 0.08;
      office = true; groundH = a.range(5.0, 6.2);
      break;
    default:
      wall = a.pick(PAL.ribWall); frame = a.pick(PAL.ribFrame); trim = wall; glass = a.pick(PAL.ribGlass);
      floorH = a.range(3.5, 3.9); winW = a.range(1.4, 2.2); winH = a.range(1.4, 1.8); pier = 0; sill = 0.9;
      office = a.chance(0.85); groundH = a.range(4.6, 5.6);
      break;
  }
  wall = jitterColor(wall, a, 0.07);
  winH = Math.min(winH, floorH - sill - 0.45);
  const [hh, ss, ll] = hexToLinearHsl(wall);
  b.archetype = arch;
  b.wallColor = wall;
  b.trimColor = trim;
  b.frameColor = frame;
  b.glassColor = glass;
  b.hue = hh; b.sat = ss; b.light = ll;
  b.floorH = floorH;
  b.windowW = winW;
  b.windowH = winH;
  b.pier = pier;
  b.sill = sill;
  b.groundH = groundH;
  b.paired = paired;
  b.office = office;
  b.litFraction = office ? a.range(0.3, 0.55) : a.range(0.35, 0.6);
  const masonry = arch <= Archetype.Limestone;
  b.roofKind = masonry ? (a.chance(0.6) ? RoofKind.Tar : RoofKind.Gravel) : a.chance(0.65) ? RoofKind.Membrane : RoofKind.Gravel;
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
    // Legacy appearance draws: kept verbatim so the layout RNG stream (and therefore every roof prop
    // placed after this point) is unchanged. `applyAppearance` then overwrites them from its own hash.
    const floorH = p.floorHeight * brng.range(0.92, 1.12);
    const bd: Building = {
      id, tiers, height: h, roof, style,
      hue: style === 1 ? brng.range(0.52, 0.62) : brng.pick([0.03, 0.06, 0.08, 0.1, 0.12, 0.58]) + brng.range(-0.02, 0.02),
      sat: style === 1 ? brng.range(0.15, 0.35) : brng.range(0.08, 0.38),
      light: style === 1 ? brng.range(0.18, 0.32) : brng.range(0.28, 0.62),
      windowW: style === 1 ? brng.range(1.4, 2.2) : brng.range(1.0, 1.6),
      windowH: style === 1 ? floorH * 0.85 : brng.range(1.5, 2.2),
      floorH,
      litFraction: brng.range(0.25, 0.7),
      seed: brng.next() * 1000,
      archetype: 0, wallColor: 0, trimColor: 0, frameColor: 0, glassColor: 0, groundH: 4.5,
      pier: 1, sill: 0.85, paired: false, office: false, roofKind: 0,
    };
    applyAppearance(bd, new Rng(appearanceSeed(p.seed, id)));
    buildings.push(bd);

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
