import { Color, MeshStandardMaterial, type WebGLProgramParametersWithUniforms } from 'three';
import { envUniforms } from './Environment';

/**
 * Building material: MeshStandardMaterial (PBR, shadows, fog, IBL all intact) with a procedural
 * facade injected into its shader. Windows are a world-space grid so they tile across every
 * instance without UVs. Per-instance attributes:
 *   aFacade  = (windowW, windowH, floorH, seed)
 *   aFacade2 = (style, litFraction, 0, 0)       style 0 = punched masonry, 1 = curtain wall, 2 = ribbon bands
 * Distant windows fade to their average via fwidth-based filtering, so no shimmer without TAA.
 */
export const facadeDebug = { value: 0 };
export function createFacadeMaterial(): MeshStandardMaterial {
  const m = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 });
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    sh.uniforms.uNight = envUniforms.uNight;
    sh.uniforms.uFDebug = facadeDebug;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec4 aFacade;
attribute vec4 aFacade2;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;`)
      .replace('#include <project_vertex>', `#include <project_vertex>
{
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
    im = instanceMatrix;
  #endif
  vFWorld = (modelMatrix * im * vec4(transformed, 1.0)).xyz;
  vFNormal = normalize(mat3(modelMatrix) * mat3(im) * objectNormal);
  vFacade = aFacade;
  vFacade2 = aFacade2;
}`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uNight;
uniform float uFDebug;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;
// integer hash: stable for any input magnitude (sin-based hashes break down at world scale)
float fh1(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float fnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(fh1(i), fh1(i + vec2(1, 0)), u.x), mix(fh1(i + vec2(0, 1)), fh1(i + vec2(1, 1)), u.x), u.y);
}
// anti-aliased box mask of half-size h centred at c, filtered by derivative width w
float aaBox(vec2 f, vec2 c, vec2 h, vec2 w) {
  vec2 d = abs(f - c) - h;
  vec2 m = 1.0 - smoothstep(-w, w, d);
  return m.x * m.y;
}
float gRough; float gMetal; vec3 gEmit;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 N = normalize(vFNormal);
  vec3 P = vFWorld;
  float style = vFacade2.x;
  float lit = vFacade2.y;
  float seed = floor(vFacade.w);
  gRough = 0.85; gMetal = 0.0; gEmit = vec3(0.0);
  vec3 base = diffuseColor.rgb;
  if (abs(N.y) < 0.5) {
    float face = abs(N.x) > 0.5 ? (N.x > 0.0 ? 1.0 : 2.0) : (N.z > 0.0 ? 3.0 : 4.0);
    float u = abs(N.x) > 0.5 ? P.z : P.x;
    float v = P.y;
    float floorH = vFacade.z;
    float winW = vFacade.x;
    float pier = style > 0.5 && style < 1.5 ? 0.18 : 0.95;
    float cellW = winW + pier;
    vec2 cell = vec2(u / cellW, v / floorH);
    vec2 id = floor(cell);
    vec2 f = fract(cell);
    vec2 w = fwidth(cell) * 1.2 + 1e-4;
    vec2 half_ = vec2(winW / cellW, min(0.92, vFacade.y / floorH)) * 0.5;
    vec2 ctr = vec2(0.5, 0.55);
    if (style > 1.5) { half_ = vec2(0.5, 0.3); } // ribbon windows
    float mask = aaBox(f, ctr, half_, w);
    // fade to the average when a cell covers only a few pixels (mip-like filtering)
    float avg = (2.0 * half_.x) * (2.0 * half_.y);
    float far = smoothstep(0.12, 0.35, max(w.x, w.y));
    mask = mix(mask, avg, far);
    float ground = 1.0 - step(floorH * 1.25, v);
    // storefront band: tall glazing at street level
    if (ground > 0.5) {
      float sf = aaBox(vec2(fract(u / 6.0), v / (floorH * 1.25)), vec2(0.5, 0.45), vec2(0.42, 0.35), fwidth(vec2(u / 6.0, v / (floorH * 1.25))) + 1e-4);
      mask = sf;
    }
    float rnd = fh1(id + vec2(seed, face * 131.0));
    // lit rooms: per-window choice up close, the building's average when windows are sub-pixel
    float on = mix(step(rnd, lit), lit, far);
    // masonry/concrete wall with weathering and a darker base
    float grime = fnoise(P.xy * 0.35 + P.zy * 0.35 + seed) * 0.18;
    vec3 wall = base * (0.82 + grime) * mix(0.55, 1.0, smoothstep(0.0, 14.0, v));
    // floor slab lines for curtain walls
    if (style > 0.5 && style < 1.5) wall = mix(wall, base * 0.45, 1.0 - smoothstep(0.0, 0.08, abs(f.y - 0.02) - w.y));
    // glass: cool reflective; unlit rooms dark with a fake interior depth gradient
    float room = 0.35 + 0.65 * smoothstep(0.1, 0.9, f.y);
    vec3 glass = mix(vec3(0.05, 0.07, 0.09), vec3(0.08, 0.1, 0.13), mix(rnd, 0.5, far)) * mix(room, 0.7, far);
    vec3 warm = mix(vec3(1.0, 0.72, 0.42), vec3(0.75, 0.86, 1.0), step(0.78, fh1(id * 3.0 + vec2(seed + 7.0, 11.0))));
    float intensity = mix(mix(0.5, 1.6, fh1(id + vec2(seed * 2.0 + 3.0, 5.0))), 1.05, far) * (ground > 0.5 ? 1.6 : 1.0);
    diffuseColor.rgb = mix(wall, glass, mask);
    gRough = mix(0.88, 0.06, mask);
    gMetal = mix(0.0, 0.6, mask);
    // rooms only read as lit once the daylight on the glass fades; no glowing mosaic at noon
    gEmit = warm * intensity * on * mask * (uNight * uNight * 0.55) * (1.0 - far * 0.35);
    if (uFDebug > 0.5) { diffuseColor.rgb = uFDebug < 1.5 ? vec3(mask) : uFDebug < 2.5 ? vec3(rnd) : vec3(far); gEmit = vec3(0.0); gMetal = 0.0; gRough = 1.0; }
  } else if (N.y > 0.5) {
    // roof: tar/gravel with patches
    float n = fnoise(P.xz * 0.6 + seed) * 0.5 + fnoise(P.xz * 3.1) * 0.25;
    diffuseColor.rgb = mix(vec3(0.16, 0.16, 0.17), base * 0.55, 0.35) * (0.75 + n);
    gRough = 0.95;
  } else {
    diffuseColor.rgb *= 0.3;
  }
}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = gRough;`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
metalnessFactor = gMetal;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += gEmit;`);
  };
  m.customProgramCacheKey = () => 'facade-v1';
  return m;
}

/** Asphalt + road markings + crosswalks drawn procedurally from the road grid. */
export function createGroundMaterial(avenueX: number[], streetZ: number[], avenueW: number, streetW: number): MeshStandardMaterial {
  const m = new MeshStandardMaterial({ color: new Color(0.11, 0.11, 0.115), roughness: 0.9 });
  const ax = avenueX.slice(0, 16);
  const sz = streetZ.slice(0, 16);
  while (ax.length < 16) ax.push(1e6);
  while (sz.length < 16) sz.push(1e6);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uAx = { value: ax };
    sh.uniforms.uSz = { value: sz };
    sh.uniforms.uAw = { value: avenueW };
    sh.uniforms.uSw = { value: streetW };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vGW;
uniform float uAx[16];
uniform float uSz[16];
uniform float uAw;
uniform float uSw;
float gh(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p))) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}
float gn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(gh(i), gh(i+vec2(1,0)), u.x), mix(gh(i+vec2(0,1)), gh(i+vec2(1,1)), u.x), u.y); }
float gRoughG;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec2 p = vGW.xz;
  float dAx = 1e9; float dSz = 1e9;
  for (int i = 0; i < 16; i++) { dAx = min(dAx, abs(p.x - uAx[i])); dSz = min(dSz, abs(p.y - uSz[i])); }
  float onAve = step(dAx, uAw * 0.5);
  float onSt = step(dSz, uSw * 0.5);
  float inter = onAve * onSt;
  vec2 fw = fwidth(p) + 1e-4;
  vec3 col = diffuseColor.rgb * (0.8 + 0.35 * gn(p * 0.8) + 0.15 * gn(p * 7.0));
  float paint = 0.0; vec3 paintCol = vec3(0.85);
  // avenue: double yellow centre line + dashed lane lines
  if (onAve > 0.5 && inter < 0.5) {
    float yl = 1.0 - smoothstep(0.08 - fw.x, 0.08 + fw.x, abs(dAx - 0.18));
    if (yl > 0.0) { paint = yl; paintCol = vec3(0.85, 0.65, 0.12); }
    float lane = (1.0 - smoothstep(0.07 - fw.x, 0.07 + fw.x, abs(dAx - uAw * 0.25))) * step(fract(p.y / 9.0), 0.45);
    paint = max(paint, lane);
  }
  if (onSt > 0.5 && inter < 0.5) {
    float yl = 1.0 - smoothstep(0.08 - fw.y, 0.08 + fw.y, abs(dSz - 0.15));
    if (yl > 0.0) { paint = yl; paintCol = vec3(0.85, 0.65, 0.12); }
  }
  // crosswalk zebras at intersection edges
  float cwA = step(uSw * 0.5 - 3.2, dSz) * step(dSz, uSw * 0.5 - 0.4) * onAve;
  float cwS = step(uAw * 0.5 - 3.2, dAx) * step(dAx, uAw * 0.5 - 0.4) * onSt;
  float zebraA = cwA * step(0.5, fract(p.x / 1.2));
  float zebraS = cwS * step(0.5, fract(p.y / 1.2));
  paint = max(paint, max(zebraA, zebraS) * (1.0 - inter * 0.0));
  float worn = 0.75 + 0.25 * gn(p * 2.3);
  col = mix(col, paintCol * worn, paint);
  diffuseColor.rgb = col;
  gRoughG = mix(0.92, 0.6, paint);
}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = gRoughG;');
  };
  m.customProgramCacheKey = () => 'ground-v1';
  return m;
}
