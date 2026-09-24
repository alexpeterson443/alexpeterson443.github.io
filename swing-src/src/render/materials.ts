import { Color, MeshStandardMaterial, type WebGLProgramParametersWithUniforms } from 'three';
import { envUniforms } from './Environment';

/**
 * Building material: MeshStandardMaterial (PBR, shadows, fog, IBL all intact) with a procedural
 * facade injected into its shader. Windows are a world-space grid so they tile across every
 * instance without UVs. Per-instance attributes (see CityRenderer.buildBuildings):
 *   instanceColor = wall colour
 *   aFacade  = (windowW, windowH, floorH, seed)
 *   aFacade2 = (archetype, litFraction, pier, sill)
 *   aFacade3 = (groundH, paired, office, roofKind)
 *   aGlass, aFrame, aTrim = glass tint, window frame and trim colours (linear)
 * Glass shows an interior-mapped room (back wall, side walls, floor, ceiling, blinds/curtains)
 * as emission, with the PBR specular giving Fresnel sky reflections on top. Windows fade to their
 * average colour once a cell covers only a few pixels (fwidth), so there is no shimmer without TAA.
 */
export const facadeDebug = { value: 0 };
export function createFacadeMaterial(): MeshStandardMaterial {
  const m = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 });
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    sh.uniforms.uNight = envUniforms.uNight;
    sh.uniforms.uTime = envUniforms.uTime;
    sh.uniforms.uFDebug = facadeDebug;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec4 aFacade;
attribute vec4 aFacade2;
attribute vec4 aFacade3;
attribute vec3 aGlass;
attribute vec3 aFrame;
attribute vec3 aTrim;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;
flat varying vec4 vFacade3;
flat varying vec3 vGlass;
flat varying vec3 vFrame;
flat varying vec3 vTrim;`)
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
  vFacade3 = aFacade3;
  vGlass = aGlass;
  vFrame = aFrame;
  vTrim = aTrim;
}`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uNight;
uniform float uTime;
uniform float uFDebug;
varying vec3 vFWorld;
varying vec3 vFNormal;
flat varying vec4 vFacade;
flat varying vec4 vFacade2;
flat varying vec4 vFacade3;
flat varying vec3 vGlass;
flat varying vec3 vFrame;
flat varying vec3 vTrim;
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
// anti-aliased 1D band: 1 inside [a, b], filtered by derivative width w
float band(float x, float a, float b, float w) {
  return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x));
}
// anti-aliased rectangle [lo, hi]
float rect(vec2 p, vec2 lo, vec2 hi, vec2 w) {
  return band(p.x, lo.x, hi.x, w.x) * band(p.y, lo.y, hi.y, w.y);
}
// Interior-mapped room behind a window. o = entry point in room space (x across, y up, 0 at the
// glass), d = view ray in room space (d.z > 0 goes into the room), size = room (w, h, depth).
// Returns lit colour; 'lamp' lights it from the ceiling, 'day' from the window.
vec3 roomColor(vec3 o, vec3 d, vec3 size, float seed, float lamp, float day, vec3 lampCol, float office) {
  vec3 inv = 1.0 / max(abs(d), vec3(1e-4)) * sign(d + 1e-6);
  float tx = ((d.x > 0.0 ? size.x : 0.0) - o.x) * inv.x;
  float ty = ((d.y > 0.0 ? size.y : 0.0) - o.y) * inv.y;
  float tz = (size.z - o.z) * inv.z;
  float t = min(tx, min(ty, tz));
  vec3 hp = o + d * t;
  float r1 = fh1(vec2(seed, 3.0)), r2 = fh1(vec2(seed, 7.0)), r3 = fh1(vec2(seed, 11.0));
  vec3 wallPaint = mix(vec3(0.62, 0.58, 0.5), mix(vec3(0.45, 0.52, 0.58), vec3(0.6, 0.42, 0.34), r2), r1 * 0.7);
  // offices: white-grey walls and grey carpet, so lit floors read as even bands, not a patchwork
  wallPaint = mix(wallPaint, vec3(0.68, 0.68, 0.66) * (0.9 + 0.2 * r1), office);
  vec3 floorCol = mix(mix(vec3(0.28, 0.18, 0.11), vec3(0.35, 0.34, 0.33), r3), vec3(0.3, 0.31, 0.32), office);
  vec3 ceilCol = vec3(0.8, 0.78, 0.74);
  vec3 c;
  float depthK = clamp(hp.z / size.z, 0.0, 1.0);
  if (t == tz) {
    c = wallPaint * 0.9;
    // furniture / partition silhouette against the back wall
    float fx = hp.x / size.x;
    float shelf = step(0.18 + r2 * 0.4, fx) * step(fx, 0.45 + r2 * 0.4) * step(hp.y, 0.9 + r3 * 1.2);
    c = mix(c, c * 0.35, shelf);
    // a framed picture or a doorway
    float pic = step(abs(fx - (0.3 + r1 * 0.4)), 0.12) * step(abs(hp.y - size.y * 0.55), 0.35);
    c = mix(c, mix(vec3(0.2, 0.25, 0.3), vec3(0.5, 0.3, 0.2), r3), pic * 0.8);
  } else if (t == tx) {
    c = wallPaint * 0.72;
  } else if (d.y > 0.0) {
    c = ceilCol;
  } else {
    c = floorCol;
  }
  // lamp: bright under the ceiling fixture in the middle of the room, falling off to the corners
  float fall = 1.0 - 0.55 * smoothstep(0.0, 0.8, length((hp.xz - vec2(size.x * 0.5, size.z * 0.5)) / size.xz));
  float nearCeil = 0.6 + 0.4 * smoothstep(0.0, size.y, hp.y);
  vec3 lit = c * lampCol * lamp * fall * nearCeil;
  // daylight: comes in through the window, so the room darkens toward the back
  vec3 dayLit = c * day * mix(1.0, 0.35, depthK);
  return lit + dayLit;
}
float gRough; float gMetal; vec3 gEmit;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 N = normalize(vFNormal);
  vec3 P = vFWorld;
  float arch = vFacade2.x;       // 0 brick 1 brownstone 2 limestone 3 concrete 4 granite 5 curtain 6 ribbon
  float lit = vFacade2.y;
  float pier = vFacade2.z;
  float sill = vFacade2.w;
  float groundH = vFacade3.x;
  float paired = vFacade3.y;
  float office = vFacade3.z;
  float seed = floor(vFacade.w);
  gRough = 0.85; gMetal = 0.0; gEmit = vec3(0.0);
  vec3 wallCol = diffuseColor.rgb;
  if (abs(N.y) < 0.5) {
    bool alongX = abs(N.z) > abs(N.x);
    float face = alongX ? (N.z > 0.0 ? 3.0 : 4.0) : (N.x > 0.0 ? 1.0 : 2.0);
    // horizontal coordinate increases to the right when looking at the face from outside
    float u = alongX ? P.x * sign(N.z) : -P.z * sign(N.x);
    float v = P.y;
    vec3 T = alongX ? vec3(sign(N.z), 0.0, 0.0) : vec3(0.0, 0.0, -sign(N.x));
    float floorH = vFacade.z;
    float winW = vFacade.x;
    float winH = vFacade.y;
    bool glassy = arch > 4.5;
    float gap = 0.18;
    float winSpan = paired > 0.5 ? winW * 2.0 + gap : winW;
    float cellW = winSpan + pier;
    // --- where are we: storefront storey or an upper floor ---
    bool ground = v < groundH;
    float fy = ground ? v : (v - groundH);
    vec2 cell = vec2(u / cellW, fy / floorH);
    vec2 id = floor(cell);
    vec2 lp = vec2(fract(cell.x) * cellW, fract(cell.y) * floorH); // metres within the cell
    vec2 w = fwidth(vec2(u, v)) * 1.1 + 1e-4;                       // metres per pixel
    // cells per pixel → how "far" this is; beyond ~5 px per cell we fade detail to averages
    float far = smoothstep(0.1, 0.3, max(w.x / cellW, w.y / floorH));
    float px = max(w.x, w.y);

    // ---------- the storefront storey ----------
    float glassMask = 0.0, frameMask = 0.0, trimMask = 0.0, signMask = 0.0;
    vec2 wp = vec2(0.0); vec2 wsize = vec2(1.0);
    float roomSeed = 0.0;
    if (ground) {
      float bayW = 5.4 + fh1(vec2(seed, 1.0)) * 1.8;
      float bx = fract(u / bayW) * bayW;
      float bid = floor(u / bayW);
      float bulk = 0.55;
      float signTop = groundH - 0.25, signBot = groundH - 1.15;
      glassMask = rect(vec2(bx, v), vec2(0.35, bulk), vec2(bayW - 0.35, signBot - 0.1), w);
      signMask = rect(vec2(bx, v), vec2(0.2, signBot), vec2(bayW - 0.2, signTop), w) * step(0.35, fh1(vec2(bid, seed + 5.0)));
      // mullions and a door every other bay
      float mull = band(bx, bayW * 0.5 - 0.04, bayW * 0.5 + 0.04, w.x) * step(0.5, fh1(vec2(bid, seed)));
      frameMask = max(mull, band(v, signBot - 0.1, signBot, w.y)) * glassMask;
      wp = vec2(bx - 0.35, v - bulk); wsize = vec2(bayW - 0.7, signBot - 0.1 - bulk);
      roomSeed = bid * 7.0 + seed;
    } else {
      // ---------- upper floors ----------
      float x0 = pier * 0.5;
      float y0 = glassy ? 0.0 : sill;
      float wh = glassy ? floorH : winH;
      if (arch > 5.5) { y0 = sill; wh = winH; } // ribbon: glass band between spandrels
      vec2 lo = vec2(x0, y0), hi = vec2(x0 + winSpan, y0 + wh);
      if (glassy) { lo.x = 0.0; hi.x = cellW; }
      glassMask = rect(lp, lo, hi, w);
      wp = lp - lo; wsize = hi - lo;
      // frame: a band just inside the opening, mullions, the pair split and an office transom
      float fw = glassy ? 0.05 : 0.07;
      float inner = rect(lp, lo + fw, hi - fw, w);
      float mull = paired > 0.5 ? band(lp.x, x0 + winW, x0 + winW + gap, w.x) : 0.0;
      if (!glassy && winW > 1.3 && paired < 0.5) mull = max(mull, band(lp.x, x0 + winW * 0.5 - 0.03, x0 + winW * 0.5 + 0.03, w.x));
      float transom = office > 0.5 && !glassy ? band(lp.y, y0 + wh * 0.72 - 0.03, y0 + wh * 0.72 + 0.03, w.y) : 0.0;
      if (glassy) {
        // curtain wall: slim mullions at every module, a spandrel panel at each slab
        float spand = arch < 5.5 ? band(lp.y, 0.0, 1.05, w.y) : 0.0;
        mull = band(lp.x, 0.0, 0.05, w.x) + band(lp.x, cellW - 0.05, cellW, w.x) + band(lp.y, 0.0, 0.06, w.y);
        frameMask = clamp(mull + spand * 0.0, 0.0, 1.0);
        trimMask = spand;
      } else {
        frameMask = clamp((glassMask - inner) + mull + transom, 0.0, 1.0) * glassMask;
        // stone sill under each window, lintel above
        trimMask = rect(lp, vec2(x0 - 0.12, y0 - 0.14), vec2(x0 + winSpan + 0.12, y0), w);
        if (arch < 2.5) trimMask = max(trimMask, rect(lp, vec2(x0 - 0.06, y0 + wh), vec2(x0 + winSpan + 0.06, y0 + wh + 0.22), w));
        // limestone / granite: a band course at every floor line
        if (arch > 1.5 && arch < 4.5) trimMask = max(trimMask, band(lp.y, 0.0, 0.16, w.y) * 0.8);
      }
      roomSeed = id.x * 13.0 + id.y * 131.0 + face * 7.0 + seed;
    }

    // ---------- wall ----------
    float grime = fnoise(vec2(u, v) * 0.35 + seed) * 0.16 + fnoise(vec2(u * 0.08, v * 0.5) + seed) * 0.1;
    vec3 wall = wallCol * (0.84 + grime);
    // brick courses up close (fade out long before they could alias)
    if (arch < 1.5) {
      float course = v / 0.075;
      float row = floor(course);
      float bxk = (u + (mod(row, 2.0) * 0.11)) / 0.225;
      float mortar = max(1.0 - smoothstep(0.0, 0.12, fract(course)), 1.0 - smoothstep(0.0, 0.05, fract(bxk)));
      float mfade = 1.0 - smoothstep(0.004, 0.012, px);
      wall *= mix(1.0, (0.86 + 0.28 * fh1(vec2(floor(bxk), row))) * mix(1.0, 0.72, mortar), mfade);
    }
    // rusticated base for stone buildings
    if ((arch > 1.5 && arch < 4.5) && v < groundH + floorH * 1.0) wall *= 1.0 - 0.18 * (1.0 - smoothstep(0.0, 0.05, fract(v / 0.62))) * (1.0 - smoothstep(0.01, 0.03, px));
    // soot streaks below sills and a darker, dirtier street level
    float streak = fnoise(vec2(u * 1.7, floor(v / floorH) * 3.0 + seed)) * (1.0 - smoothstep(0.0, floorH * 0.6, lp.y - sill + floorH * 0.0));
    wall *= 1.0 - 0.12 * streak * (1.0 - glassMask);
    wall *= mix(0.7, 1.0, smoothstep(0.0, 9.0, v));
    vec3 trim = vTrim * (0.9 + grime * 0.6);
    vec3 frame = vFrame;

    // ---------- glass: interior room + reflection ----------
    vec3 V = normalize(P - cameraPosition);
    // ray in room space: x along the face, y up, z into the building
    vec3 d = vec3(dot(V, T), V.y, -dot(V, N));
    float roomW = ground ? wsize.x : cellW;
    float roomH = ground ? wsize.y + 1.0 : floorH;
    float roomD = ground ? 7.0 : 4.5 + fh1(vec2(roomSeed, 2.0)) * 2.0;
    vec3 o = vec3(ground ? wp.x : lp.x, ground ? wp.y + 0.3 : lp.y, 0.0);
    float rnd = fh1(vec2(roomSeed, 1.0));
    // who has the lights on: apartments per room, offices by floor zone; shops all evening
    float zone = fh1(vec2(floor(id.x / 6.0) + seed, id.y));
    float onDraw = office > 0.5 ? zone * 0.8 + rnd * 0.2 : rnd;
    float isOn = ground ? step(0.25, fh1(vec2(roomSeed, 9.0))) : step(onDraw, lit);
    // late-night thinning: fewer lights as the night deepens is too subtle to see; keep it simple
    float warmCool = office > 0.5 ? step(0.35, fh1(vec2(seed, 4.0))) : step(0.8, fh1(vec2(roomSeed, 4.0)));
    vec3 lampCol = mix(vec3(1.0, 0.72, 0.44), vec3(0.78, 0.88, 1.0), warmCool);
    float lampPow = (ground ? 3.2 : 1.9) * (0.7 + 0.6 * fh1(vec2(roomSeed, 5.0)));
    float night = uNight;
    float lamp = isOn * lampPow * smoothstep(0.15, 0.7, night);
    float dayIn = 0.22 * (1.0 - night);
    vec3 room = vec3(0.0);
    if (glassMask > 0.001 && far < 0.999 && d.z > 0.0) {
      room = roomColor(o, d, vec3(roomW, roomH, roomD), roomSeed, lamp, dayIn, lampCol, ground ? 0.0 : office);
      // blinds / curtains right behind the glass
      if (!ground) {
        float kind = fh1(vec2(roomSeed, 6.0));
        vec2 q = wp / max(wsize, vec2(0.01));
        if (kind < 0.3) {
          float drop = 0.15 + 0.7 * fh1(vec2(roomSeed, 8.0));
          float slats = 0.75 + 0.25 * smoothstep(0.3, 0.5, fract(wp.y / 0.06)) * (1.0 - smoothstep(0.004, 0.01, px));
          float blind = step(1.0 - drop, q.y);
          vec3 bc = vec3(0.72, 0.7, 0.66) * slats;
          room = mix(room, bc * (lamp * lampCol * 0.55 + dayIn * 1.6), blind);
        } else if (kind < 0.55) {
          float open = 0.18 + 0.3 * fh1(vec2(roomSeed, 10.0));
          float cur = max(1.0 - smoothstep(open - 0.02, open + 0.02, q.x), smoothstep(1.0 - open - 0.02, 1.0 - open + 0.02, q.x));
          vec3 cc = mix(vec3(0.75, 0.68, 0.55), vec3(0.45, 0.2, 0.18), step(0.6, fh1(vec2(roomSeed, 12.0))));
          room = mix(room, cc * (lamp * lampCol * 0.7 + dayIn * 1.4), cur * 0.92);
        }
        // a TV's blue flicker in a few dark rooms
        float tv = step(0.93, fh1(vec2(roomSeed, 14.0))) * (1.0 - isOn) * smoothstep(0.4, 0.8, night);
        room += tv * vec3(0.25, 0.4, 1.0) * (0.35 + 0.25 * sin(uTime * (7.0 + rnd * 5.0)) * sin(uTime * 2.3 + rnd * 20.0));
      }
    }
    // distance average: lit fraction of rooms glowing, the rest dark glass
    vec3 roomAvg = mix(vec3(0.03), lampCol * 0.55, lit) * lampPow * smoothstep(0.15, 0.7, night) + vec3(0.05) * (1.0 - night);
    room = mix(room, roomAvg, far);
    vec3 tint = mix(vec3(1.0), vGlass * 2.2, glassy ? 0.85 : 0.35);

    // ---------- storefront sign ----------
    vec3 signCol = vec3(0.0);
    if (signMask > 0.0) {
      float sc = fh1(vec2(roomSeed, 21.0));
      vec3 sgn = sc < 0.25 ? vec3(0.9, 0.2, 0.15) : sc < 0.5 ? vec3(0.1, 0.35, 0.8) : sc < 0.7 ? vec3(0.1, 0.5, 0.3) : sc < 0.85 ? vec3(0.9, 0.7, 0.2) : vec3(0.85, 0.85, 0.82);
      signCol = sgn;
    }

    // ---------- compose ----------
    float gm = clamp(glassMask - frameMask, 0.0, 1.0);
    // far away the openings collapse to their coverage fraction
    float cover = ground ? 0.55 : (glassy ? 0.85 : (winSpan * winH) / (cellW * floorH));
    gm = mix(gm, cover * 0.9, far);
    float fm = mix(frameMask, cover * 0.1, far);
    float tm = mix(trimMask, 0.08, far);
    vec3 base = mix(wall, trim, tm * (1.0 - gm));
    base = mix(base, frame, fm);
    base = mix(base, signCol * 0.6 + vec3(0.02), signMask * (1.0 - far));
    // glass itself is dark: what you see is the room (emission) plus the specular reflection
    diffuseColor.rgb = mix(base, vGlass * 0.05, gm);
    // mirror-ish curtain walls; clear residential glass is a dielectric
    float panelRough = 0.04 + 0.08 * fh1(vec2(id.x + seed, id.y));
    gRough = mix(mix(0.9, 0.55, fm), glassy ? panelRough : 0.06, gm);
    gMetal = mix(mix(0.0, glassy ? 0.6 : 0.1, fm), glassy ? 0.75 : 0.0, gm);
    if (glassy) diffuseColor.rgb = mix(diffuseColor.rgb, vGlass * 0.9, gm * 0.9); // metal tint colours the reflection
    gEmit = room * tint * gm * (glassy ? 0.55 : 1.0);
    gEmit += signCol * signMask * (1.0 - far) * (0.02 + 1.6 * smoothstep(0.2, 0.7, night));
    if (uFDebug > 0.5) { diffuseColor.rgb = uFDebug < 1.5 ? vec3(gm) : uFDebug < 2.5 ? vec3(rnd) : vec3(far); gEmit = vec3(0.0); gMetal = 0.0; gRough = 1.0; }
  } else if (N.y > 0.5) {
    // roofs: tar with patches, pale membrane with seams, or gravel
    float kind = vFacade3.w;
    float n = fnoise(P.xz * 0.6 + seed) * 0.5 + fnoise(P.xz * 3.1) * 0.25;
    vec2 w2 = fwidth(P.xz) + 1e-4;
    if (kind < 0.5) diffuseColor.rgb = vec3(0.09, 0.09, 0.1) * (0.8 + n) + vec3(0.03) * step(0.72, fnoise(P.xz * 0.25 + seed));
    else if (kind < 1.5) {
      float seam = 1.0 - smoothstep(0.0, 0.03 + w2.x, abs(fract(P.x / 1.8) - 0.5) * 1.8 - 0.86);
      diffuseColor.rgb = vec3(0.55, 0.56, 0.57) * (0.82 + n * 0.4) * mix(1.0, 0.8, seam * 0.5);
    } else diffuseColor.rgb = mix(vec3(0.3, 0.29, 0.27), vec3(0.42, 0.4, 0.37), fnoise(P.xz * 9.0)) * (0.8 + n * 0.5);
    gRough = kind > 0.5 && kind < 1.5 ? 0.7 : 0.95;
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
  m.customProgramCacheKey = () => 'facade-v2';
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
