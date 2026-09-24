import { Color, Vector3 } from 'three';
import type { Environment } from './Environment';
import { envUniforms } from './Environment';
import { ATMO_PARS, atmoData, atmoUniform } from './Atmosphere';
import { clamp, smoothstep } from '../core/math';

/**
 * Uniforms and GLSL shared by everything beyond the district (skyline, far ground, water). Sky and
 * fog come from the same atmosphere GLSL the sky dome and the district's fog use (Atmosphere.ts),
 * so distant geometry fades into exactly the colour of the sky behind it and the far-plane cut is
 * invisible.
 */
export const hUniforms = {
  uAtmo: atmoUniform,
  hSunDir: { value: new Vector3(0, 1, 0) }, // key light (sun, or moon at night)
  hSunColor: { value: new Color() }, // key colour × intensity (linear)
  hHemiSky: { value: new Color() },
  hHemiGround: { value: new Color() },
  // cosine-weighted sky radiance seen by surfaces facing up / +X / −X / +Z / −Z
  hAmbUp: { value: new Color() },
  hAmbPX: { value: new Color() },
  hAmbNX: { value: new Color() },
  hAmbPZ: { value: new Color() },
  hAmbNZ: { value: new Color() },
  hNight: envUniforms.uNight, // 0 day … 1 night (window lights), shared with the district
  hDark: { value: 0 }, // 0 when the sun is up, 1 in full night
  hTime: { value: 0 },
};

export const HORIZON_GLSL = /* glsl */ `
${ATMO_PARS}
uniform vec3 hSunDir;
uniform vec3 hSunColor;
uniform vec3 hHemiSky;
uniform vec3 hHemiGround;
uniform vec3 hAmbUp;
uniform vec3 hAmbPX;
uniform vec3 hAmbNX;
uniform vec3 hAmbPZ;
uniform vec3 hAmbNZ;
uniform float hNight;
uniform float hDark;
uniform float hTime;

// Sky radiance in a direction (the dome's, minus the sun disc).
vec3 hSky(vec3 dir) {
  vec3 d = normalize(dir);
  return strandSkyBase(d) + uAtmo[4].rgb * strandHG(dot(d, uAtmo[0].xyz), uAtmo[4].w);
}

// Cosine-weighted sky light for a surface normal (precomputed per direction on the CPU).
vec3 hAmbient(vec3 n) {
  vec3 w = n * n;
  vec3 side = (n.x > 0.0 ? hAmbPX : hAmbNX) * w.x + (n.z > 0.0 ? hAmbPZ : hAmbNZ) * w.z;
  vec3 vert = n.y > 0.0 ? hAmbUp : mix(hHemiGround * 0.25, hAmbUp * 0.3, 0.5);
  return side + vert * w.y;
}

// Integer hash: stable at world scale.
float hHash(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float hNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hHash(i), hHash(i + vec2(1, 0)), u.x), mix(hHash(i + vec2(0, 1)), hHash(i + vec2(1, 1)), u.x), u.y);
}

// Atmospheric perspective for a point at camera-relative 'rel': the district's own height and
// aerial fog, plus a guaranteed full fade before the far plane (view depth 3000).
float hFogAmount(vec3 rel, float viewDepth) {
  return max(strandFogAmount(rel, cameraPosition.y), smoothstep(2250.0, 2940.0, viewDepth));
}
vec3 hAtmosColor(vec3 dir) {
  return strandFogColor(dir);
}
`;

/** CPU port of strandSkyBase (Atmosphere.ts) for the ambient probes, read from the live uniform. */
function skyRadiance(d: Vector3, out: Color): Color {
  const a = atmoData;
  const sx = a[0], sz = a[2];
  const h = Math.max(d.y, 0);
  const t = Math.pow(1 - h, a[7]);
  const dl = Math.hypot(d.x, d.z) || 1, sl = Math.hypot(sx, sz) || 1;
  const az = ((d.x / dl) * (sx / sl) + (d.z / dl) * (sz / sl)) * 0.5 + 0.5;
  const k = Math.pow(az, a[11]);
  const mu = d.x * a[0] + d.y * a[1] + d.z * a[2];
  const hg = (g: number) => (1 - g * g) / (12.5663706 * Math.pow(Math.max(1 + g * g - 2 * g * mu, 1e-4), 1.5));
  const haze = hg(a[23]) * (0.3 + 0.7 * t);
  const ch = (i: number) => {
    const hor = a[8 + i] + (a[12 + i] - a[8 + i]) * k;
    return a[4 + i] + (hor - a[4 + i]) * t + a[20 + i] * haze;
  };
  return out.setRGB(ch(0), ch(1), ch(2));
}

const _d = new Vector3();
const _c = new Color();
/** Average sky radiance over the hemisphere around `n` (cosine weighted), by a fixed sample set. */
function ambientProbe(n: Vector3, out: Color): Color {
  out.setRGB(0, 0, 0);
  let wsum = 0;
  for (let i = 0; i < 24; i++) {
    const az = (i / 24) * Math.PI * 2;
    for (const el of [0.06, 0.35, 0.75, 1.25]) {
      _d.set(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
      const w = Math.max(0, _d.dot(n)) * Math.cos(el);
      if (w <= 0) continue;
      skyRadiance(_d, _c);
      out.r += _c.r * w; out.g += _c.g * w; out.b += _c.b * w;
      wsum += w;
    }
  }
  // below the horizon a wall sees the ground/city, not sky: count that half as dim bounce
  const skyFrac = n.y >= 0 ? 0.5 + 0.5 * n.y : 0.5 * (1 + n.y);
  return out.multiplyScalar(skyFrac / Math.max(1e-6, wsum));
}

const PROBES: [keyof typeof hUniforms, Vector3][] = [
  ['hAmbUp', new Vector3(0, 1, 0)],
  ['hAmbPX', new Vector3(1, 0, 0)],
  ['hAmbNX', new Vector3(-1, 0, 0)],
  ['hAmbPZ', new Vector3(0, 0, 1)],
  ['hAmbNZ', new Vector3(0, 0, -1)],
];

let lastKey = '';
/** Pull the live key light, hemisphere and sky into the shared uniforms. Cheap; call once per frame. */
export function updateHorizonUniforms(env: Environment, dt: number): void {
  const u = hUniforms;
  u.hTime.value += dt;
  u.hSunDir.value.copy(env.shadows.dir);
  u.hSunColor.value.copy(env.sun.color).multiplyScalar(env.sun.intensity);
  u.hHemiSky.value.copy(env.hemi.color).multiplyScalar(env.hemi.intensity);
  u.hHemiGround.value.copy(env.hemi.groundColor).multiplyScalar(env.hemi.intensity);
  const elev = Math.asin(clamp(env.sunDir.y, -1, 1)) * (180 / Math.PI);
  u.hDark.value = 1 - smoothstep(-5, 6, elev);
  // ambient probes only change with the sky: recompute when the time of day moves
  const key = env.timeOfDay.toFixed(4);
  if (key !== lastKey) {
    lastKey = key;
    for (const [name, n] of PROBES) ambientProbe(n, u[name].value as Color);
  }
}
