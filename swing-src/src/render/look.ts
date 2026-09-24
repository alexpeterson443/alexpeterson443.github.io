/**
 * Art-directed "look" per time of day: sky, sun/moon, fog, exposure and grade, authored as keyframes
 * and interpolated. Pure data (no three.js), so it is unit-testable and every system reads the same
 * numbers. Colours are linear-light RGB unless noted; `hex()` converts an sRGB swatch.
 */

export type RGB = [number, number, number];

export interface Look {
  // --- sky (linear radiance) ---
  zenith: RGB;
  horizon: RGB; // horizon colour away from the sun
  horizonSun: RGB; // horizon colour toward the sun's azimuth
  horizonExp: number; // how quickly the horizon colour gives way to the zenith (higher = thinner band)
  sunSpread: number; // azimuthal tightness of the sun-side horizon colour
  glow: RGB; // tight forward-scattering glow around the sun (Henyey-Greenstein, g = glowG)
  glowG: number;
  haze: RGB; // broad glow, strongest along the horizon
  hazeG: number;
  antiSun: RGB; // pink "belt" opposite a low sun
  ground: RGB; // lower hemisphere of the lighting environment (ground bounce)
  sunDisc: number; // disc radiance multiplier on sunColor
  stars: number;
  moon: number; // moon disc visibility
  // --- lights ---
  sunColor: RGB;
  sunIntensity: number;
  moonColor: RGB;
  moonIntensity: number;
  hemiSky: RGB;
  hemiGround: RGB;
  hemiIntensity: number;
  envIntensity: number;
  // --- atmosphere / fog (metres) ---
  fogExtinction: number; // uniform aerial-perspective extinction per metre
  fogHeightDensity: number; // extra extinction at street level
  fogHeightFalloff: number; // 1/m, exponential decay of the ground fog with height
  fogMaxOpacity: number;
  fogSunScatter: number; // how much of the sun glow the haze picks up
  fogElevation: number; // 0..1: how far up the sky the in-scatter colour looks for elevated rays
  // --- camera / post ---
  exposure: number;
  bloomStrength: number;
  bloomThreshold: number; // in exposed (pre-tonemap) units
  contrast: number; // log-space contrast around mid grey, pre-tonemap
  saturation: number;
  vibrance: number;
  lift: RGB; // display-space offsets (neutral 0)
  gamma: RGB; // neutral 1
  gain: RGB; // neutral 1
  splitShadows: number; // strength of the cool shadow tint
  splitHighlights: number; // strength of the warm highlight tint
  splitBalance: number; // -1..1 moves the shadow/highlight pivot
  vignette: number;
  godRays: number;
  aoStrength: number;
}

/** sRGB hex swatch → linear RGB, optionally scaled. */
export function hex(h: string, k = 1): RGB {
  const n = parseInt(h.replace('#', ''), 16);
  const f = (c: number) => {
    const s = c / 255;
    return (s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)) * k;
  };
  return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
}

const NIGHT: Look = {
  zenith: hex('#0a1636', 0.055),
  horizon: hex('#26406e', 0.075),
  horizonSun: hex('#2e4472', 0.08),
  horizonExp: 2.6,
  sunSpread: 2,
  glow: [0, 0, 0],
  glowG: 0.7,
  haze: hex('#3a5a90', 0.05),
  hazeG: 0.2,
  antiSun: [0, 0, 0],
  ground: hex('#2a2a30', 0.03),
  sunDisc: 0,
  stars: 1,
  moon: 1,
  sunColor: hex('#ffd9b0'),
  sunIntensity: 0,
  moonColor: hex('#9db8ff'),
  moonIntensity: 0.55,
  hemiSky: hex('#3a5898'),
  hemiGround: hex('#3c3440'),
  hemiIntensity: 0.12,
  envIntensity: 1.6,
  fogExtinction: 0.0009,
  fogHeightDensity: 0.0022,
  fogHeightFalloff: 0.03,
  fogMaxOpacity: 0.985,
  fogSunScatter: 0,
  fogElevation: 0.4,
  exposure: 1.6,
  bloomStrength: 0.55,
  bloomThreshold: 2.2,
  contrast: 1.12,
  saturation: 1.08,
  vibrance: 0.12,
  lift: [-0.004, 0.0, 0.018],
  gamma: [0.99, 1.0, 1.03],
  gain: [1.0, 1.0, 1.02],
  splitShadows: 0.55,
  splitHighlights: 0.35,
  splitBalance: -0.1,
  vignette: 0.42,
  godRays: 0,
  aoStrength: 0.7,
};

const DUSK: Look = {
  ...NIGHT,
  zenith: hex('#132a6a', 0.11),
  horizon: hex('#5a5c9c', 0.14),
  horizonSun: hex('#f07a44', 0.4),
  horizonExp: 3.2,
  sunSpread: 3,
  glow: hex('#ff8a4a', 0.07),
  glowG: 0.72,
  haze: hex('#d0708a', 0.1),
  hazeG: 0.35,
  antiSun: hex('#8a6aa8', 0.05),
  ground: hex('#34303a', 0.04),
  stars: 0.35,
  moon: 1,
  moonIntensity: 0.4,
  hemiSky: hex('#5a6cb8'),
  hemiGround: hex('#4a3a40'),
  hemiIntensity: 0.1,
  envIntensity: 1.4,
  fogExtinction: 0.0011,
  fogHeightDensity: 0.0024,
  fogHeightFalloff: 0.028,
  fogSunScatter: 0.6,
  exposure: 1.4,
  bloomStrength: 0.55,
  bloomThreshold: 2.0,
  contrast: 1.1,
  saturation: 1.1,
  vibrance: 0.18,
  lift: [0.0, 0.0, 0.014],
  gamma: [1.0, 1.0, 1.02],
  gain: [1.02, 1.0, 1.0],
  splitShadows: 0.5,
  splitHighlights: 0.45,
  splitBalance: -0.05,
};

const SUNSET: Look = {
  ...DUSK,
  zenith: hex('#2a4c9a', 0.22),
  horizon: hex('#8e8cb8', 0.3),
  horizonSun: hex('#ff9a5a', 1.25),
  horizonExp: 3.4,
  sunSpread: 2.2,
  glow: hex('#ffa060', 0.45),
  glowG: 0.8,
  haze: hex('#ff9868', 0.55),
  hazeG: 0.5,
  antiSun: hex('#d890b0', 0.12),
  ground: hex('#5a4438', 0.08),
  sunDisc: 22,
  stars: 0,
  moon: 0.6,
  sunColor: hex('#ff8a4a'),
  sunIntensity: 1.5,
  moonIntensity: 0,
  hemiSky: hex('#7c8ad0'),
  hemiGround: hex('#6a4a3a'),
  hemiIntensity: 0.1,
  envIntensity: 1.1,
  fogExtinction: 0.0011,
  fogHeightDensity: 0.0022,
  fogHeightFalloff: 0.026,
  fogSunScatter: 0.85,
  exposure: 1.3,
  bloomStrength: 0.75,
  bloomThreshold: 1.2,
  contrast: 1.1,
  saturation: 1.08,
  vibrance: 0.15,
  lift: [0.004, 0.0, 0.01],
  gamma: [1.0, 1.0, 1.0],
  gain: [1.03, 1.0, 0.97],
  splitShadows: 0.45,
  splitHighlights: 0.5,
  splitBalance: 0,
  vignette: 0.38,
  godRays: 0.9,
  aoStrength: 0.8,
};

const GOLDEN: Look = {
  ...SUNSET,
  zenith: hex('#2d5cb4', 0.34),
  horizon: hex('#a2b2d4', 0.46),
  horizonSun: hex('#ffc890', 1.2),
  horizonExp: 3.6,
  sunSpread: 2.2,
  glow: hex('#ffd6a0', 0.5),
  glowG: 0.82,
  haze: hex('#ffc49a', 0.5),
  hazeG: 0.55,
  antiSun: hex('#c8a0b8', 0.05),
  ground: hex('#6a5646', 0.16),
  sunDisc: 40,
  moon: 0,
  sunColor: hex('#ffb877'),
  sunIntensity: 2.9,
  hemiSky: hex('#9cb4e8'),
  hemiGround: hex('#7a6050'),
  hemiIntensity: 0.12,
  envIntensity: 1.0,
  fogExtinction: 0.0008,
  fogHeightDensity: 0.0018,
  fogHeightFalloff: 0.022,
  fogSunScatter: 0.8,
  fogElevation: 0.35,
  exposure: 1.05,
  bloomStrength: 0.6,
  bloomThreshold: 1.35,
  contrast: 1.12,
  saturation: 1.08,
  vibrance: 0.14,
  lift: [0.0, 0.004, 0.012],
  gamma: [1.0, 1.0, 1.0],
  gain: [1.03, 1.0, 0.96],
  splitShadows: 0.5,
  splitHighlights: 0.45,
  splitBalance: 0,
  vignette: 0.34,
  godRays: 1,
  aoStrength: 0.85,
};

const NOON: Look = {
  ...GOLDEN,
  zenith: hex('#2a64cc', 0.42),
  horizon: hex('#a6c4e2', 0.72),
  horizonSun: hex('#d6e2ee', 0.85),
  horizonExp: 4.2,
  sunSpread: 3,
  glow: hex('#fff4e0', 0.28),
  glowG: 0.84,
  haze: hex('#e6eef8', 0.35),
  hazeG: 0.5,
  antiSun: [0, 0, 0],
  ground: hex('#6a665e', 0.26),
  sunDisc: 60,
  sunColor: hex('#fff3e2'),
  sunIntensity: 3.4,
  hemiSky: hex('#b8d0ff'),
  hemiGround: hex('#8a8070'),
  hemiIntensity: 0.1,
  envIntensity: 0.95,
  fogExtinction: 0.0007,
  fogHeightDensity: 0.0012,
  fogHeightFalloff: 0.02,
  fogSunScatter: 0.5,
  fogElevation: 0.3,
  exposure: 0.95,
  bloomStrength: 0.5,
  bloomThreshold: 1.5,
  contrast: 1.1,
  saturation: 1.1,
  vibrance: 0.12,
  lift: [0.0, 0.002, 0.008],
  gamma: [1.0, 1.0, 1.0],
  gain: [1.01, 1.0, 0.99],
  splitShadows: 0.35,
  splitHighlights: 0.2,
  splitBalance: 0,
  vignette: 0.3,
  godRays: 0.35,
  aoStrength: 0.9,
};

const MORNING: Look = {
  ...GOLDEN,
  zenith: hex('#3468c4', 0.38),
  horizon: hex('#b0c6e0', 0.6),
  horizonSun: hex('#ffe2c2', 1.05),
  horizonExp: 3.8,
  sunSpread: 2.4,
  glow: hex('#fff0d8', 0.42),
  glowG: 0.82,
  haze: hex('#f4e6da', 0.45),
  hazeG: 0.5,
  antiSun: hex('#b8a8c8', 0.04),
  ground: hex('#606068', 0.16),
  sunDisc: 45,
  sunColor: hex('#ffe0bd'),
  sunIntensity: 2.8,
  hemiSky: hex('#a8c4f0'),
  hemiGround: hex('#6a6460'),
  hemiIntensity: 0.12,
  envIntensity: 1.05,
  fogExtinction: 0.0009,
  fogHeightDensity: 0.0055,
  fogHeightFalloff: 0.045,
  fogSunScatter: 0.7,
  fogElevation: 0.35,
  exposure: 1.05,
  bloomStrength: 0.6,
  bloomThreshold: 1.35,
  contrast: 1.08,
  saturation: 1.05,
  vibrance: 0.12,
  lift: [0.0, 0.004, 0.014],
  gamma: [1.0, 1.0, 1.0],
  gain: [1.02, 1.0, 0.98],
  splitShadows: 0.5,
  splitHighlights: 0.3,
  splitBalance: 0,
  vignette: 0.32,
  godRays: 0.9,
};

const SUNRISE: Look = {
  ...SUNSET,
  horizonSun: hex('#ffa878', 1.1),
  haze: hex('#ffa888', 0.5),
  glow: hex('#ffb070', 0.4),
  sunColor: hex('#ff9a60'),
  fogHeightDensity: 0.006,
  fogHeightFalloff: 0.05,
  moon: 0,
};

const PREDAWN: Look = {
  ...DUSK,
  horizonSun: hex('#c87a70', 0.22),
  haze: hex('#9a7aa0', 0.08),
  glow: hex('#e89070', 0.04),
  fogHeightDensity: 0.004,
  fogHeightFalloff: 0.04,
  moon: 0,
  moonIntensity: 0.3,
};

/** Keyframes by time of day (0.5 = noon). Presets: 0.3 morning, 0.5 noon, 0.71 golden, 0.78 dusk, 0.9 night. */
export const LOOK_KEYS: [number, Look][] = [
  [0.0, NIGHT],
  [0.16, NIGHT],
  [0.205, PREDAWN],
  [0.25, SUNRISE],
  [0.3, MORNING],
  [0.5, NOON],
  [0.71, GOLDEN],
  [0.745, SUNSET],
  [0.78, DUSK],
  [0.84, NIGHT],
  [1.0, NIGHT],
];

function mixInto(out: Record<string, unknown>, a: Record<string, unknown>, b: Record<string, unknown>, k: number): void {
  for (const key of Object.keys(a)) {
    const x = a[key], y = b[key];
    if (Array.isArray(x)) {
      const o = (out[key] as number[] | undefined) ?? [0, 0, 0];
      for (let i = 0; i < x.length; i++) o[i] = x[i] + ((y as number[])[i] - x[i]) * k;
      out[key] = o;
    } else out[key] = (x as number) + ((y as number) - (x as number)) * k;
  }
}

/** The interpolated look at time of day `t` (wrapped to 0..1). Smooth between keys. */
export function lookAt(t: number, out?: Look): Look {
  const tt = ((t % 1) + 1) % 1;
  let i = 0;
  while (i < LOOK_KEYS.length - 2 && LOOK_KEYS[i + 1][0] < tt) i++;
  const [t0, a] = LOOK_KEYS[i];
  const [t1, b] = LOOK_KEYS[i + 1];
  const u = Math.min(1, Math.max(0, (tt - t0) / Math.max(1e-6, t1 - t0)));
  const k = u * u * (3 - 2 * u);
  const o = (out ?? ({} as Look)) as unknown as Record<string, unknown>;
  mixInto(o, a as unknown as Record<string, unknown>, b as unknown as Record<string, unknown>, k);
  return o as unknown as Look;
}

/** Sun elevation (degrees) and azimuth (degrees) for a time of day; the sun rises at 0.25 and sets at 0.75. */
export function sunAngles(t: number): { elev: number; azim: number } {
  return { elev: Math.sin((t - 0.25) * Math.PI * 2) * 62, azim: 200 + (t - 0.5) * 140 };
}
