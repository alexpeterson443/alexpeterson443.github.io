import {
  BufferGeometry, Color, Float32BufferAttribute, Group, InstancedBufferAttribute, InstancedMesh,
  Matrix4, Points, Quaternion, ShaderMaterial, Vector3,
} from 'three';
import { HORIZON_GLSL, hUniforms } from './HorizonShared';
import { Variant, type FarBuilding, type HorizonLayout } from './HorizonLayout';

/**
 * Hundreds of instanced, non-collidable buildings beyond the district: mid-rise fabric plus
 * towers with original silhouettes (setbacks, stepped crowns, needles, drums, tapered supertalls,
 * slabs). One draw per silhouette. The shader lights them from the live sun and sky, draws a
 * filtered window grid (no per-window geometry) that lights up at night, and fades them into the
 * horizon sky with distance.
 */

// ---- geometry --------------------------------------------------------------------------------

class GeoBuilder {
  pos: number[] = [];
  nor: number[] = [];
  quad(a: number[], b: number[], c: number[], d: number[]): void {
    // a-b-c-d counter-clockwise seen from outside
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    for (const p of [a, b, c, a, c, d]) {
      this.pos.push(p[0], p[1], p[2]);
      this.nor.push(nx, ny, nz);
    }
  }
  /** Frustum/prism of a regular n-gon (n=4 → square) from y0 (half size r0) to y1 (half size r1). */
  prism(n: number, y0: number, y1: number, r0: number, r1: number, cap = true, rot = Math.PI / 4): void {
    const k = n === 4 ? Math.SQRT2 : 1 / Math.cos(Math.PI / n); // circumradius for a given apothem
    const pt = (i: number, y: number, r: number) => {
      const a = rot + (i / n) * Math.PI * 2;
      return [Math.cos(a) * r * k, y, Math.sin(a) * r * k];
    };
    for (let i = 0; i < n; i++) {
      const a0 = pt(i, y0, r0), a1 = pt(i + 1, y0, r0), b1 = pt(i + 1, y1, r1), b0 = pt(i, y1, r1);
      this.quad(a1, a0, b0, b1);
    }
    if (cap && r1 > 0) {
      const c = [0, y1, 0];
      for (let i = 0; i < n; i++) {
        const a = pt(i, y1, r1), b = pt(i + 1, y1, r1);
        this.pos.push(...c, ...b, ...a);
        for (let k2 = 0; k2 < 3; k2++) this.nor.push(0, 1, 0);
      }
    }
  }
  box(y0: number, y1: number, half: number): void {
    this.prism(4, y0, y1, half, half);
  }
  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    return g;
  }
}

function variantGeometry(v: Variant): BufferGeometry {
  const g = new GeoBuilder();
  switch (v) {
    case Variant.Box:
    case Variant.Slab:
      g.box(0, 0.965, 0.5);
      g.box(0.965, 1, 0.16); // roof bulkhead
      break;
    case Variant.Setback:
      g.box(0, 0.56, 0.5);
      g.box(0.56, 0.8, 0.39);
      g.box(0.8, 0.975, 0.28);
      g.box(0.975, 1, 0.12);
      break;
    case Variant.Crown:
      g.box(0, 0.82, 0.5);
      g.box(0.82, 0.86, 0.47);
      g.box(0.86, 0.9, 0.4);
      g.box(0.9, 0.935, 0.31);
      g.box(0.935, 0.965, 0.21);
      g.prism(4, 0.965, 1.0, 0.11, 0.0, false);
      break;
    case Variant.Spire:
      g.box(0, 0.48, 0.5);
      g.box(0.48, 0.66, 0.4);
      g.box(0.66, 0.8, 0.3);
      g.prism(4, 0.8, 0.84, 0.3, 0.2);
      g.prism(8, 0.84, 1.0, 0.035, 0.004);
      break;
    case Variant.Cylinder:
      g.prism(8, 0, 0.93, 0.5, 0.5, true, Math.PI / 8);
      g.prism(8, 0.93, 0.975, 0.4, 0.4, true, Math.PI / 8);
      g.prism(8, 0.975, 1.0, 0.4, 0.12, false, Math.PI / 8);
      break;
    case Variant.Taper:
      g.prism(4, 0, 0.9, 0.5, 0.33);
      g.prism(4, 0.9, 0.955, 0.3, 0.24);
      g.prism(4, 0.955, 1.0, 0.16, 0.02, false);
      break;
    default:
      g.box(0, 1, 0.5);
  }
  return g.build();
}

// ---- material --------------------------------------------------------------------------------

const vertexShader = /* glsl */ `
attribute vec4 aP0; // seed, litFraction, style, floorH
attribute vec4 aP1; // height (m), crownLight, 0, 0
varying vec3 vWPos;
varying vec3 vWN;
varying vec3 vLP;
varying vec3 vLN;
varying float vDepth;
flat varying vec4 vP0;
flat varying vec4 vP1;
flat varying vec3 vCol;
void main() {
  vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vLP = position * sc;
  vLN = normalize(normal / sc);
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  vWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * (normal / (sc * sc)));
  vP0 = aP0;
  vP1 = aP1;
  vCol = instanceColor;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
${HORIZON_GLSL}
varying vec3 vWPos;
varying vec3 vWN;
varying vec3 vLP;
varying vec3 vLN;
varying float vDepth;
flat varying vec4 vP0;
flat varying vec4 vP1;
flat varying vec3 vCol;

float aaBox(vec2 f, vec2 c, vec2 h, vec2 w) {
  vec2 d = abs(f - c) - h;
  vec2 m = 1.0 - smoothstep(-w, w, d);
  return m.x * m.y;
}

void main() {
  vec3 N = normalize(vWN);
  vec3 toCam = cameraPosition - vWPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  float seed = vP0.x, lit = vP0.y, style = vP0.z, floorH = vP0.w;
  float height = vP1.x;
  vec3 base = vCol;
  vec3 albedo;
  vec3 emit = vec3(0.0);
  float glassAmt = 0.0;
  float v = vLP.y;

  if (abs(vLN.y) < 0.6) {
    // --- facade: window grid in building-local metres ---
    vec2 t = normalize(vec2(-vLN.z, vLN.x));
    float u = dot(vLP.xz, t);
    float face = floor(atan(vLN.z, vLN.x) * 1.27 + 4.5);
    float cw = style < 0.5 ? 3.1 : style < 1.5 ? 1.6 : 2.8;
    vec2 cell = vec2(u / cw, v / floorH);
    vec2 id = floor(cell);
    vec2 f = fract(cell);
    vec2 fw = fwidth(cell);
    vec2 hs = style < 0.5 ? vec2(0.24, 0.27) : style < 1.5 ? vec2(0.44, 0.4) : vec2(0.5, 0.2);
    float mask = aaBox(f, vec2(0.5, 0.55), hs, fw * 1.2 + 1e-4);
    float far = smoothstep(0.12, 0.4, max(fw.x, fw.y));
    mask = mix(mask, 4.0 * hs.x * hs.y, far);
    float r1 = hHash(id + vec2(seed, face * 97.0));
    // coarse clusters (office floors, apartments) keep a patchwork even when windows are sub-pixel
    vec2 cid = floor(id / vec2(6.0, 3.0));
    float r2 = hHash(cid + vec2(seed * 1.7 + 13.0, face * 31.0));
    float litLocal = clamp(lit * (0.2 + 1.6 * r2 * r2), 0.0, 1.0);
    float on = mix(step(r1, litLocal), litLocal, far);
    float grime = hNoise(vLP.xy * 0.08 + vLP.zy * 0.08 + seed) * 0.16;
    vec3 wall = base * (0.84 + grime) * mix(0.6, 1.0, smoothstep(0.0, 18.0, v));
    // slab edges on curtain walls
    if (style > 0.5 && style < 1.5) wall = mix(wall, base * 0.55, (1.0 - smoothstep(0.0, 0.09, abs(f.y - 0.04) - fw.y)) * (1.0 - far));
    vec3 glass = mix(vec3(0.045, 0.055, 0.07), vec3(0.07, 0.085, 0.1), mix(r1, 0.5, far));
    albedo = mix(wall, glass, mask);
    glassAmt = mask;
    // interiors: warm tungsten, a few cool offices; brighter at street level
    vec3 warm = mix(vec3(1.0, 0.7, 0.4), vec3(0.72, 0.84, 1.0), step(0.8, hHash(id * 3.0 + vec2(seed + 7.0, 11.0))));
    float inten = mix(mix(0.45, 1.5, hHash(id + vec2(seed * 2.0 + 3.0, 5.0))), 1.0, far);
    // same curve as the district's windows: dark by day, lit rooms reading as points at night
    // once windows are sub-pixel their average must stay dim, or whole towers glow beige
    emit = warm * inten * on * mask * (hNight * hNight * 0.9) * mix(1.0, 0.3, far);
    // floodlit crowns at night
    if (vP1.y > 0.5) {
      float top = smoothstep(height * 0.84, height * 0.95, v);
      vec3 cc = vP1.y > 1.5 ? vec3(0.25, 0.88, 0.94) : vec3(1.0, 0.8, 0.55);
      emit += cc * top * hNight * 0.9 * (0.55 + 0.45 * (1.0 - mask));
    }
  } else if (vLN.y > 0.0) {
    // roofs: tar and gravel
    albedo = mix(vec3(0.13, 0.13, 0.14), base * 0.5, 0.3) * (0.8 + 0.4 * hNoise(vWPos.xz * 0.2));
  } else {
    albedo = base * 0.3;
  }

  // --- lighting: live sun + cosine-weighted sky + hemisphere ---
  float ndl = max(dot(N, hSunDir), 0.0);
  vec3 irr = hSunColor * ndl + mix(hHemiGround, hHemiSky, 0.5 * N.y + 0.5);
  vec3 col = albedo * (irr * 0.31830988 + hAmbient(N) * 0.9);
  // glass reflects the sky (Fresnel) and catches the sun
  if (glassAmt > 0.0) {
    vec3 R = reflect(-V, N);
    float F = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
    vec3 refl = hSky(normalize(vec3(R.x, max(R.y, 0.02), R.z)));
    float sunSpec = pow(max(dot(R, hSunDir), 0.0), 350.0) * 40.0;
    col += glassAmt * (refl * F * 0.9 + hSunColor * sunSpec * F);
  }

  // --- atmosphere ---
  float fog = hFogAmount(-V * dist, vDepth);
  vec3 atm = hAtmosColor(-V);
  col = mix(col, atm, fog) + emit * pow(1.0 - fog, 0.7 + 0.8 * (1.0 - hNight));
  gl_FragColor = vec4(col, 1.0);
}`;

export function createSkylineMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    name: 'HorizonSkyline',
    uniforms: hUniforms,
    vertexShader,
    fragmentShader,
  });
}

// ---- aircraft warning lights on the tallest towers --------------------------------------------

const lightVert = /* glsl */ `
attribute float aPhase;
uniform float hTime;
uniform float hNight;
uniform float uPixelRatio;
varying float vI;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float d = -mv.z;
  float blink = step(0.55, fract(hTime * 0.8 + aPhase));
  vI = blink * (0.25 + hNight) * (1.0 - smoothstep(2300.0, 2900.0, d));
  gl_PointSize = uPixelRatio * mix(3.5, 2.2, smoothstep(500.0, 2500.0, d));
  gl_Position = projectionMatrix * mv;
}`;
const lightFrag = /* glsl */ `
varying float vI;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = 1.0 - smoothstep(0.15, 0.5, length(c));
  if (vI * a < 0.01) discard;
  gl_FragColor = vec4(vec3(4.0, 0.35, 0.2) * vI * a, 1.0);
}`;

// ---- assembly --------------------------------------------------------------------------------

const _m = new Matrix4();
const _q = new Quaternion();
const _p = new Vector3();
const _s = new Vector3();
const UP = new Vector3(0, 1, 0);

export class Skyline {
  readonly group = new Group();
  readonly material = createSkylineMaterial();
  private lightMat: ShaderMaterial;
  instances = 0;
  drawCalls = 0;

  constructor(layout: HorizonLayout) {
    const byVariant: FarBuilding[][] = Array.from({ length: Variant.Count }, () => []);
    for (const b of layout.buildings) byVariant[b.variant].push(b);
    const col = new Color();
    byVariant.forEach((list, v) => {
      if (!list.length) return;
      const geo = variantGeometry(v as Variant);
      const n = list.length;
      const mesh = new InstancedMesh(geo, this.material, n);
      const p0 = new Float32Array(n * 4), p1 = new Float32Array(n * 4), cols = new Float32Array(n * 3);
      list.forEach((b, i) => {
        _q.setFromAxisAngle(UP, b.rot);
        _m.compose(_p.set(b.x, 0, b.z), _q, _s.set(b.w, b.h, b.d));
        mesh.setMatrixAt(i, _m);
        col.setHSL(b.hue, b.sat, b.light);
        cols.set([col.r, col.g, col.b], i * 3);
        p0.set([b.seed, b.lit, b.style, b.floorH], i * 4);
        p1.set([b.h, b.crownLight, 0, 0], i * 4);
      });
      mesh.instanceColor = new InstancedBufferAttribute(cols, 3);
      geo.setAttribute('aP0', new InstancedBufferAttribute(p0, 4));
      geo.setAttribute('aP1', new InstancedBufferAttribute(p1, 4));
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false; // the ring surrounds the camera; per-instance culling isn't worth it
      mesh.renderOrder = 2;
      mesh.name = `skyline-${v}`;
      this.group.add(mesh);
      this.instances += n;
      this.drawCalls++;
    });

    // warning lights
    const tops: number[] = [];
    const phase: number[] = [];
    for (const b of layout.buildings) {
      if (b.h < 170) continue;
      tops.push(b.x, b.h + (b.variant === Variant.Spire ? 0 : 1.5), b.z);
      phase.push((b.seed % 1) * 0.3);
    }
    this.lightMat = new ShaderMaterial({
      uniforms: { hTime: hUniforms.hTime, hNight: hUniforms.hNight, uPixelRatio: { value: 1 } },
      vertexShader: lightVert,
      fragmentShader: lightFrag,
    });
    if (tops.length) {
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(tops, 3));
      g.setAttribute('aPhase', new Float32BufferAttribute(phase, 1));
      const pts = new Points(g, this.lightMat);
      pts.frustumCulled = false;
      pts.renderOrder = 3;
      this.group.add(pts);
      this.drawCalls++;
    }
  }

  setPixelRatio(pr: number): void {
    this.lightMat.uniforms.uPixelRatio.value = pr;
  }
}
