import {
  BufferAttribute, BufferGeometry, Color, Group, Mesh, MeshPhysicalMaterial, Object3D, Vector3,
  type Material, type WebGLProgramParametersWithUniforms,
} from 'three';
import { envUniforms } from '../render/Environment';

/**
 * Procedural humanoid: a 19-joint hierarchy of Object3D "bones" with smooth lofted meshes attached.
 * Local frame: +Z forward, +Y up, +X = character's left. Limbs rest pointing down (−Y).
 * Height ≈ 1.78 m with the root at the centre of mass (feet 0.9 m below).
 *
 * The suit ("Strand"): midnight satin with glossy graphite panels, luminous cyan strand-lines that
 * trace the limbs and converge on the sternum and between the shoulder blades, a smooth mask with
 * narrow cyan slit lenses, and a fresnel rim so the silhouette reads on bright sky and dark streets.
 * All line work is drawn in one shared shader from bone-local coordinates, so it stays crisp at any
 * distance (derivative-filtered) and costs a single program for the whole body. Right-side meshes
 * reuse the left geometry mirrored (scale.x = −1), which mirrors the line layout for free.
 */
export class Rig {
  readonly root = new Group();
  readonly hips = new Object3D();
  readonly spine = new Object3D();
  readonly chest = new Object3D();
  readonly neck = new Object3D();
  readonly head = new Object3D();
  readonly shoulderL = new Object3D();
  readonly upperArmL = new Object3D();
  readonly foreArmL = new Object3D();
  readonly handL = new Object3D();
  readonly shoulderR = new Object3D();
  readonly upperArmR = new Object3D();
  readonly foreArmR = new Object3D();
  readonly handR = new Object3D();
  readonly thighL = new Object3D();
  readonly shinL = new Object3D();
  readonly footL = new Object3D();
  readonly thighR = new Object3D();
  readonly shinR = new Object3D();
  readonly footR = new Object3D();

  static readonly UPPER_ARM = 0.29;
  static readonly FORE_ARM = 0.27;
  static readonly THIGH = 0.44;
  static readonly SHIN = 0.43;

  private readonly materials: Material[] = [];
  /** Shared animated uniforms for every suit material. */
  private readonly fx = {
    uTime: { value: 0 },
    uEnergy: { value: 0 },
  };
  private readonly fireL = { value: 0 };
  private readonly fireR = { value: 0 };
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();

  constructor() {
    const link = (parent: Object3D, child: Object3D, x: number, y: number, z: number) => {
      child.position.set(x, y, z);
      parent.add(child);
    };
    this.root.add(this.hips);
    this.hips.position.set(0, 0.02, 0);
    link(this.hips, this.spine, 0, 0.1, 0);
    link(this.spine, this.chest, 0, 0.18, 0);
    link(this.chest, this.neck, 0, 0.24, 0);
    link(this.neck, this.head, 0, 0.08, 0);
    link(this.chest, this.shoulderL, 0.17, 0.17, 0);
    link(this.shoulderL, this.upperArmL, 0.05, 0, 0);
    link(this.upperArmL, this.foreArmL, 0, -Rig.UPPER_ARM, 0);
    link(this.foreArmL, this.handL, 0, -Rig.FORE_ARM, 0);
    link(this.chest, this.shoulderR, -0.17, 0.17, 0);
    link(this.shoulderR, this.upperArmR, -0.05, 0, 0);
    link(this.upperArmR, this.foreArmR, 0, -Rig.UPPER_ARM, 0);
    link(this.foreArmR, this.handR, 0, -Rig.FORE_ARM, 0);
    link(this.hips, this.thighL, 0.1, -0.05, 0);
    link(this.thighL, this.shinL, 0, -Rig.THIGH, 0);
    link(this.shinL, this.footL, 0, -Rig.SHIN, 0);
    link(this.hips, this.thighR, -0.1, -0.05, 0);
    link(this.thighR, this.shinR, 0, -Rig.THIGH, 0);
    link(this.shinR, this.footR, 0, -Rig.SHIN, 0);

    this.buildBody();
  }

  /**
   * Per-frame presentation state: time, a speed-driven energy level (lines brighten and pulses
   * travel along them when fast), and the decay of the web-shooter flare.
   */
  update(dt: number, speed: number): void {
    this.fx.uTime.value += dt;
    const e = Math.min(1, Math.max(0, (speed - 14) / 32));
    const cur = this.fx.uEnergy.value;
    this.fx.uEnergy.value = cur + (e * e * (3 - 2 * e) - cur) * (1 - Math.exp(-dt * 3));
    this.fireL.value = Math.max(0, this.fireL.value - dt * 2.6);
    this.fireR.value = Math.max(0, this.fireR.value - dt * 2.6);
  }

  /** Flare the web-shooter bracer on whichever hand is nearest the web's origin. */
  webPulse(from: Vector3): void {
    this.handL.getWorldPosition(this._a);
    this.handR.getWorldPosition(this._b);
    (this._a.distanceToSquared(from) < this._b.distanceToSquared(from) ? this.fireL : this.fireR).value = 1;
  }

  dispose(): void {
    this.root.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
    for (const m of this.materials) m.dispose();
  }

  // ---------------------------------------------------------------------------------------------
  private buildBody(): void {
    const suit = (part: number, aux = 0, fire?: { value: number }) => {
      const m = makeSuitMaterial(part, aux, this.fx, fire ?? { value: 0 });
      this.materials.push(m);
      return m;
    };
    const add = (bone: Object3D, geo: BufferGeometry, mat: Material, mirror = false) => {
      const m = new Mesh(geo, mat);
      if (mirror) m.scale.x = -1;
      m.castShadow = true;
      bone.add(m);
      return m;
    };
    const S = 28; // radial segments for the big pieces
    const s = 20; // limbs

    // --- torso: V-taper (broad chest and lats, narrow waist), glutes, trapezius slope ------------
    add(this.hips, loft([
      R(-0.122, 0.04, 0.04, 0, -0.004),
      R(-0.1, 0.085, 0.07, 0, -0.008),
      R(-0.07, 0.13, 0.095, 0, -0.014),
      R(-0.03, 0.148, 0.103, 0, -0.014),
      R(0.01, 0.142, 0.098, 0, -0.008),
      R(0.06, 0.13, 0.091, 0, 0.0),
      R(0.12, 0.124, 0.087, 0, 0.004),
    ], S, 0.008, 0.02), suit(P.Pelvis));
    add(this.spine, loft([
      R(-0.08, 0.128, 0.09, 0, 0.0),
      R(-0.02, 0.122, 0.088, 0, 0.006),
      R(0.04, 0.118, 0.087, 0, 0.01),
      R(0.1, 0.124, 0.09, 0, 0.012),
      R(0.16, 0.13, 0.094, 0, 0.012),
      R(0.22, 0.132, 0.095, 0, 0.01),
    ], S, 0.02, 0.02), suit(P.Abdomen));
    add(this.chest, loft([
      R(-0.08, 0.127, 0.092, 0, 0.011, 2.2),
      R(-0.03, 0.134, 0.098, 0, 0.013, 2.3),
      R(0.02, 0.147, 0.11, 0, 0.017, 2.4),
      R(0.07, 0.16, 0.121, 0, 0.02, 2.5),
      R(0.115, 0.17, 0.12, 0, 0.016, 2.7),
      R(0.16, 0.178, 0.108, 0, 0.006, 3.0),
      R(0.198, 0.168, 0.092, 0, -0.004, 2.8),
      R(0.228, 0.128, 0.078, 0, -0.01, 2.4),
      R(0.252, 0.078, 0.066, 0, -0.012),
      R(0.27, 0.062, 0.06, 0, -0.01),
    ], S, 0.02, 0.01), suit(P.Chest));
    add(this.neck, loft([
      R(-0.05, 0.058, 0.06, 0, -0.008),
      R(0.0, 0.055, 0.057, 0, -0.002),
      R(0.05, 0.053, 0.055, 0, 0.005),
      R(0.1, 0.052, 0.054, 0, 0.01),
    ], s, 0.01, 0.01), suit(P.Neck));

    // --- head: smooth mask, slightly forward of the neck --------------------------------------
    const head = loft([
      R(-0.03, 0.028, 0.03, 0, 0.058),
      R(-0.018, 0.048, 0.05, 0, 0.048),
      R(0.005, 0.064, 0.074, 0, 0.032),
      R(0.035, 0.073, 0.089, 0, 0.022),
      R(0.075, 0.079, 0.098, 0, 0.014),
      R(0.115, 0.081, 0.101, 0, 0.01),
      R(0.15, 0.08, 0.1, 0, 0.004),
      R(0.182, 0.072, 0.092, 0, -0.001),
      R(0.205, 0.055, 0.073, 0, -0.003),
      R(0.219, 0.03, 0.042, 0, -0.002),
    ], 32, 0.008, 0.006);
    head.translate(0, -0.01, 0);
    add(this.head, head, suit(P.Head));

    // --- arms --------------------------------------------------------------------------------
    const UA = Rig.UPPER_ARM, FA = Rig.FORE_ARM;
    const upperArm = limb(UA, [
      [-0.04, 0.066, 0.064, -0.006, 0],
      [0.08, 0.071, 0.068, 0.0, 0.002],
      [0.3, 0.059, 0.06, 0, 0.004],
      [0.5, 0.052, 0.058, 0, 0.01],
      [0.75, 0.046, 0.05, 0, 0.005],
      [1.0, 0.042, 0.043, 0, 0],
    ], s, 0.03, 0.035);
    const foreArm = limb(FA, [
      [0.0, 0.043, 0.045, 0, 0],
      [0.18, 0.049, 0.049, 0, -0.003],
      [0.42, 0.044, 0.041, 0, -0.002],
      [0.78, 0.031, 0.029, 0, 0],
      [1.0, 0.026, 0.031, 0, 0],
    ], s, 0.035, 0.02);
    const gloveCuff = limb(FA, [
      [0.78, 0.036, 0.035, 0, 0],
      [0.9, 0.033, 0.037, 0, 0],
      [1.04, 0.031, 0.037, 0, 0],
    ], s, 0, 0.012);
    const hand = handGeometry();
    for (const [ua, fa, h, mirror] of [[this.upperArmL, this.foreArmL, this.handL, false], [this.upperArmR, this.foreArmR, this.handR, true]] as const) {
      const fire = mirror ? this.fireR : this.fireL;
      add(ua, upperArm, suit(P.UpperArm, UA), mirror);
      add(fa, foreArm, suit(P.ForeArm, FA, fire), mirror);
      add(fa, gloveCuff, suit(P.Cuff, -FA * 0.78 - 0.004), mirror);
      add(h, hand, suit(P.Hand, 0, fire), mirror);
    }

    // --- legs --------------------------------------------------------------------------------
    const TH = Rig.THIGH, SH = Rig.SHIN;
    const thigh = limb(TH, [
      [-0.08, 0.082, 0.084, -0.012, 0],
      [0.1, 0.089, 0.094, -0.004, 0.008],
      [0.35, 0.08, 0.086, 0, 0.012],
      [0.62, 0.068, 0.071, 0, 0.008],
      [0.88, 0.057, 0.06, 0, 0.006],
      [1.0, 0.054, 0.056, 0, 0.002],
    ], s, 0.05, 0.045);
    const shin = limb(SH, [
      [0.0, 0.053, 0.055, 0, 0],
      [0.1, 0.055, 0.062, 0, -0.008],
      [0.28, 0.057, 0.068, 0, -0.02],
      [0.5, 0.047, 0.052, 0, -0.012],
      [0.8, 0.037, 0.039, 0, -0.002],
      [1.0, 0.034, 0.036, 0, 0],
    ], s, 0.04, 0.03);
    const bootCuff = limb(SH, [
      [0.7, 0.043, 0.046, 0, -0.004],
      [0.85, 0.041, 0.044, 0, 0],
      [1.06, 0.04, 0.045, 0, 0.004],
    ], s, 0, 0.02);
    const boot = bootGeometry();
    for (const [th, sh, ft, mirror] of [[this.thighL, this.shinL, this.footL, false], [this.thighR, this.shinR, this.footR, true]] as const) {
      add(th, thigh, suit(P.Thigh, TH), mirror);
      add(sh, shin, suit(P.Shin, SH), mirror);
      add(sh, bootCuff, suit(P.Cuff, -SH * 0.7 - 0.004), mirror);
      add(ft, boot, suit(P.Boot), mirror);
    }
  }
}

// =================================================================================================
// Geometry: closed lofts of (super)elliptical rings along Y, with domed ends and shared vertices so
// normals are smooth everywhere (no UV seam; the shader works from bone-local positions).

interface Ring { y: number; rx: number; rz: number; cx: number; cz: number; e: number }
const R = (y: number, rx: number, rz: number, cx = 0, cz = 0, e = 2): Ring => ({ y, rx, rz, cx, cz, e });

/** A limb along −Y: rows are [t (0 = top joint, 1 = next joint), rx, rz, cx, cz]. */
function limb(len: number, rows: [number, number, number, number, number][], seg: number, capTop: number, capBottom: number): BufferGeometry {
  const rings = rows.map(([t, rx, rz, cx, cz]) => R(-t * len, rx, rz, cx, cz)).sort((a, b) => a.y - b.y);
  return loft(rings, seg, capBottom, capTop);
}

function loft(input: Ring[], seg: number, capBottom: number, capTop: number, domeRings = 3): BufferGeometry {
  const rings: Ring[] = [];
  const first = input[0], last = input[input.length - 1];
  if (capBottom > 0) {
    for (let k = domeRings; k >= 1; k--) {
      const th = (k / (domeRings + 1)) * Math.PI * 0.5;
      rings.push({ ...first, y: first.y - capBottom * Math.sin(th), rx: first.rx * Math.cos(th), rz: first.rz * Math.cos(th) });
    }
  }
  rings.push(...input);
  if (capTop > 0) {
    for (let k = 1; k <= domeRings; k++) {
      const th = (k / (domeRings + 1)) * Math.PI * 0.5;
      rings.push({ ...last, y: last.y + capTop * Math.sin(th), rx: last.rx * Math.cos(th), rz: last.rz * Math.cos(th) });
    }
  }
  const n = rings.length;
  const pos = new Float32Array((n * seg + 2) * 3);
  let o = 0;
  for (const r of rings) {
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const c = Math.cos(a), sn = Math.sin(a);
      const px = Math.sign(c) * Math.pow(Math.abs(c), 2 / r.e);
      const pz = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / r.e);
      pos[o++] = r.cx + r.rx * px; pos[o++] = r.y; pos[o++] = r.cz + r.rz * pz;
    }
  }
  pos[o++] = first.cx; pos[o++] = first.y - capBottom; pos[o++] = first.cz;
  pos[o++] = last.cx; pos[o++] = last.y + capTop; pos[o++] = last.cz;
  const idx: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = (i + 1) * seg + j, d = (i + 1) * seg + ((j + 1) % seg);
      idx.push(a, c, b, b, c, d);
    }
  }
  const pa = n * seg, pb = n * seg + 1, top = (n - 1) * seg;
  for (let j = 0; j < seg; j++) {
    idx.push(pa, j, (j + 1) % seg);
    idx.push(pb, top + ((j + 1) % seg), top + j);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Merge geometries that share a material into one draw. */
function merge(parts: BufferGeometry[]): BufferGeometry {
  let nv = 0, ni = 0;
  for (const p of parts) { nv += p.attributes.position.count; ni += p.index!.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
  const idx: number[] = new Array(ni);
  let vo = 0, io = 0;
  for (const p of parts) {
    pos.set(p.attributes.position.array as Float32Array, vo * 3);
    nor.set(p.attributes.normal.array as Float32Array, vo * 3);
    const src = p.index!.array;
    for (let i = 0; i < src.length; i++) idx[io++] = src[i] + vo;
    vo += p.attributes.position.count;
    p.dispose();
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('normal', new BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/**
 * Gloved hand for the LEFT side (the right is mirrored): hanging down −Y, palm facing the body
 * (−X), thumb forward (+Z), fingers loosely curled toward the palm.
 */
function handGeometry(): BufferGeometry {
  const palm = loft([
    R(-0.128, 0.013, 0.03, -0.024, 0.0, 2.6),
    R(-0.112, 0.016, 0.037, -0.017, 0.0, 2.8),
    R(-0.092, 0.019, 0.042, -0.008, 0.0, 3.0),
    R(-0.068, 0.021, 0.045, -0.002, 0.001, 3.0),
    R(-0.035, 0.022, 0.043, 0.0, 0.002, 2.8),
    R(-0.008, 0.02, 0.034, 0.0, 0.0, 2.4),
    R(0.012, 0.022, 0.03, 0.0, 0.0),
  ], 20, 0.01, 0.01);
  const thumb = loft([
    R(-0.055, 0.011, 0.012),
    R(-0.03, 0.013, 0.014),
    R(0.0, 0.014, 0.016),
  ], 12, 0.01, 0.008);
  // lay the thumb along the palm's front edge, angled down and slightly across the palm
  thumb.rotateX(-0.3);
  thumb.rotateZ(-0.35);
  thumb.translate(-0.006, -0.02, 0.03);
  return merge([palm, thumb]);
}

/** Boot for the LEFT foot: heel to toe along +Z, sole flat at y = −0.055 below the ankle joint. */
function bootGeometry(): BufferGeometry {
  // built along +Y (forward), then rotated so +Y → +Z; ring rz is the half-height, cz = −centre.
  const b = (f: number, halfW: number, halfH: number, centreY: number, e = 3.2) => R(f, halfW, halfH, 0, -centreY, e);
  const g = loft([
    b(-0.07, 0.034, 0.04, -0.016),
    b(-0.05, 0.042, 0.052, -0.004),
    b(-0.015, 0.046, 0.058, 0.0),
    b(0.03, 0.049, 0.048, -0.008),
    b(0.085, 0.05, 0.036, -0.019),
    b(0.14, 0.047, 0.027, -0.028),
    b(0.18, 0.04, 0.023, -0.032),
  ], 22, 0.014, 0.022, 3);
  g.rotateX(Math.PI / 2);
  return g;
}

// =================================================================================================
// Suit shader

const P = {
  Pelvis: 0, Abdomen: 1, Chest: 2, Neck: 3, Head: 4, UpperArm: 5, ForeArm: 6, Hand: 7, Thigh: 8, Shin: 9, Boot: 10, Cuff: 11,
} as const;

const SUIT_PARS = /* glsl */`
uniform float uPart;
uniform float uAux;
uniform float uFire;
uniform float uTime;
uniform float uEnergy;
uniform float uNight;
varying vec3 vLP;
float gCore; float gHalo; float gPanel; float gSeam; float gGear; float gLens; float gLensE; float gAlong; float gPulse;

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// chord distance from p to the surface line at angle a around the Y axis (0 = +X, PI/2 = +Z)
float chord(vec3 p, float a) {
  float r = length(p.xz);
  return length(p.xz - r * vec2(cos(a), sin(a)));
}
// anti-aliased emissive line; never thinner than ~1 px (it dims instead, so it cannot shimmer)
void strand(float d, float w, float k) {
  float fw = max(fwidth(d), 1e-5);
  float ww = max(w, fw * 0.8);
  float core = (1.0 - smoothstep(ww - fw * 0.5, ww + fw * 0.5, d)) * (w / ww);
  gCore = max(gCore, core * k);
  float h = 1.0 - smoothstep(0.0, w * 3.5 + fw, d);
  gHalo = max(gHalo, h * h * k);
}
// thin dark panel seam, faded out once it is sub-pixel
void seam(float d, float w) {
  float fw = max(fwidth(d), 1e-5);
  gSeam = max(gSeam, (1.0 - smoothstep(w - fw * 0.5, w + fw * 0.5, d)) * clamp(w * 2.0 / fw, 0.0, 1.0));
}
float band(float x, float a, float b, float s) { return smoothstep(a - s, a + s, x) * (1.0 - smoothstep(b - s, b + s, x)); }

void suitPattern(vec3 p) {
  gCore = 0.0; gHalo = 0.0; gPanel = 0.0; gSeam = 0.0; gGear = 0.0; gLens = 0.0; gLensE = 0.0; gPulse = 1.0;
  gAlong = -p.y;
  float W = 0.0052;
  int part = int(uPart + 0.5);
  if (part == 5) {                                   // upper arm: outer strand on a graphite stripe
    float t = -p.y / uAux;
    float d = chord(p, 0.12);
    strand(d, W, smoothstep(-0.2, -0.05, t));
    gPanel = 1.0 - smoothstep(0.034, 0.038, d);
    seam(abs(d - 0.036), 0.0012);
  } else if (part == 6) {                            // forearm: strand, then a double-helix bracer
    float t = -p.y / uAux;
    float d = chord(p, 0.12);
    strand(d, W, 1.0 - smoothstep(0.36, 0.46, t));
    gPanel = (1.0 - smoothstep(0.03, 0.034, d)) * (1.0 - smoothstep(0.4, 0.46, t));
    float turns = 1.35;
    float a = 0.12 + (t - 0.44) * turns * 6.2831853;
    float r = length(p.xz);
    float k = r * turns * 6.2831853 / (uAux * 0.34);
    float dh = min(chord(p, a), chord(p, a + 3.14159265)) / sqrt(1.0 + k * k);
    float hk = band(t, 0.44, 0.76, 0.02);
    strand(dh, W * 0.8, hk * (1.0 + 2.5 * uFire));
    gPanel = max(gPanel, hk * 0.6);
    gAlong = t * 0.5;
  } else if (part == 7) {                            // glove: back-of-hand strand + palm emitter
    gGear = 1.0;
    float back = smoothstep(0.004, 0.012, p.x);
    strand(abs(p.z), W * 0.75, back * band(-p.y, 0.0, 0.07, 0.006));
    float e = length(vec3(p.x + 0.02, p.y + 0.03, p.z * 0.8));
    strand(e, 0.007, (0.55 + 3.0 * uFire) * (1.0 - smoothstep(-0.01, 0.0, p.x)));
    gPulse = 1.0 + 1.5 * uFire;
  } else if (part == 8) {                            // thigh: strand spirals from outer hip to front of knee
    float t = -p.y / uAux;
    float a = mix(0.05, 1.3, smoothstep(0.05, 1.0, t));
    float d = chord(p, a);
    strand(d, W, smoothstep(-0.1, 0.02, t));
    gPanel = 1.0 - smoothstep(0.04, 0.044, d);
    seam(abs(d - 0.042), 0.0012);
  } else if (part == 9) {                            // shin: front strand down to the boot cuff
    float t = -p.y / uAux;
    float a = mix(1.3, 1.52, t);
    float d = chord(p, a);
    strand(d, W, 1.0 - smoothstep(0.62, 0.7, t));
    gPanel = (1.0 - smoothstep(0.034, 0.038, d)) * (1.0 - smoothstep(0.66, 0.7, t));
    seam(abs(d - 0.036), 0.0012);
  } else if (part == 10) {                           // boot: glossy black with a lit sole edge
    gGear = 1.0;
    float side = smoothstep(-0.05, -0.047, p.y);
    strand(abs(p.y + 0.041), W * 0.7, side * smoothstep(-0.09, -0.05, p.z));
    seam(abs(p.z - 0.105), 0.0012);
    gAlong = p.z;
  } else if (part == 11) {                           // glove / boot cuff: gear with a thin top ring
    gGear = 1.0;
    strand(abs(p.y - uAux + 0.012), W * 0.6, 1.0);
    gAlong = 0.0;
  } else if (part == 4) {                            // mask: slit lenses + crest
    float front = smoothstep(0.02, 0.05, p.z);
    vec2 q = vec2(abs(p.x), p.y) - vec2(0.037, 0.108);
    float ca = cos(0.36), sa = sin(0.36);
    q = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float hx = 0.03;
    float hy = 0.0105 * (1.0 - 0.55 * smoothstep(-0.018, 0.03, q.x)) * (0.75 + 0.25 * smoothstep(-0.03, -0.01, q.x));
    float el = length(vec2(q.x / hx, q.y / hy));
    float dl = (el - 1.0) * hy;
    float fw = max(fwidth(dl), 1e-5);
    gLens = (1.0 - smoothstep(-fw * 0.5, fw * 0.5, dl)) * front;
    gLensE = el;
    gSeam = max(gSeam, (1.0 - smoothstep(0.0035, 0.0035 + fw, dl)) * front * (1.0 - gLens));
    // crest strand from the brow over the crown to the nape
    float crest = smoothstep(0.16, 0.19, p.y + p.z * 0.35) + (1.0 - smoothstep(-0.03, 0.0, p.z)) * smoothstep(0.0, 0.05, p.y);
    strand(abs(p.x), W * 0.8, clamp(crest, 0.0, 1.0));
    gPanel = 1.0 - smoothstep(0.012, 0.016, abs(p.x));
    gAlong = p.y - p.z;
  } else if (part == 3) {                            // neck: spine strand continues down the back
    strand(abs(p.x), W * 0.8, 1.0 - smoothstep(-0.03, -0.01, p.z));
  } else {                                           // torso pieces
    float front = smoothstep(0.0, 0.035, p.z);
    float back = smoothstep(0.0, 0.035, -p.z);
    vec2 q = vec2(abs(p.x), p.y);
    float flank = length(vec2(abs(p.x), p.z) - length(vec2(abs(p.x), p.z)) * vec2(1.0, 0.0));
    if (part == 2) {                                 // chest: strands converge on the sternum and the spine
      float dF = min(sdSeg(q, vec2(0.128, 0.205), vec2(0.0, 0.035)), sdSeg(q, vec2(0.0, 0.035), vec2(0.0, -0.12)));
      float dB = min(sdSeg(q, vec2(0.122, 0.2), vec2(0.0, 0.05)), sdSeg(q, vec2(0.0, 0.3), vec2(0.0, -0.12)));
      strand(dF, W, front);
      strand(dB, W, back);
      strand(flank, W, 1.0 - smoothstep(0.08, 0.11, p.y));
      // glossy graphite chest plate and shoulder yoke, split by the strands
      float plate = front * smoothstep(-0.01, 0.01, p.y) * (1.0 - smoothstep(0.155, 0.165, abs(p.x)));
      float yoke = smoothstep(0.15, 0.16, p.y);
      gPanel = max(plate, yoke);
      seam(abs(p.y - 0.155), 0.0012);
      seam(abs(p.y + 0.0) + (1.0 - front) * 0.05, 0.0012);
    } else if (part == 1) {                          // abdomen: centre, spine and flank strands
      strand(abs(p.x), W, max(front, back));
      strand(flank, W, 1.0);
    } else {                                         // pelvis: flank strands end at a waist ring
      strand(flank, W, 1.0 - smoothstep(-0.005, 0.01, p.y));
      strand(abs(p.y - 0.004), W * 0.8, 1.0);
      strand(abs(p.x), W, back * smoothstep(-0.01, 0.01, p.y));
    }
  }
  // travelling energy pulses along the lines at speed
  float wave = pow(0.5 + 0.5 * sin(gAlong * 22.0 - uTime * 16.0), 6.0);
  gPulse *= (0.92 + 0.08 * sin(uTime * 2.1)) * (1.0 + uEnergy * (0.35 + 1.4 * wave));
}
`;

function makeSuitMaterial(part: number, aux: number, fx: { uTime: { value: number }; uEnergy: { value: number } }, fire: { value: number }): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.5, metalness: 0.0,
    clearcoat: 1.0, clearcoatRoughness: 0.18,
    sheen: 0.35, sheenRoughness: 0.5, sheenColor: new Color(0.16, 0.34, 0.48),
  });
  const uPart = { value: part }, uAux = { value: aux };
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    Object.assign(sh.uniforms, { uPart, uAux, uFire: fire, uTime: fx.uTime, uEnergy: fx.uEnergy, uNight: envUniforms.uNight });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + SUIT_PARS)
      .replace('#include <metalnessmap_fragment>', /* glsl */`#include <metalnessmap_fragment>
suitPattern(vLP);
{
  // midnight satin base, glossy graphite panels, near-black gear; seams darken
  vec3 base = mix(vec3(0.0095, 0.0135, 0.026), vec3(0.03, 0.035, 0.045), gPanel);
  base = mix(base, vec3(0.0065, 0.0072, 0.009), gGear);
  base = mix(base, vec3(0.001), gSeam * 0.85);
  base = mix(base, vec3(0.0), gLens);
  diffuseColor.rgb = base;
  roughnessFactor = mix(mix(0.58, 0.3, gPanel), 0.26, gGear) + gSeam * 0.3;
  roughnessFactor = mix(roughnessFactor, 0.08, gLens);
  metalnessFactor = mix(0.0, 0.35, max(gPanel, gGear * 0.6));
}`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
{
  vec3 cyan = vec3(0.05, 0.745, 0.871);
  float lineK = mix(2.4, 3.6, uNight) * gPulse;
  totalEmissiveRadiance += cyan * (gCore * lineK + gHalo * 0.12 * lineK);
  vec3 lensCol = mix(vec3(0.75, 1.0, 1.0) * 6.0, cyan * 4.0, smoothstep(0.25, 1.0, gLensE));
  totalEmissiveRadiance += lensCol * gLens * mix(1.0, 1.25, uNight);
  vec3 V = normalize(vViewPosition);
  float fres = pow(1.0 - saturate(dot(normal, V)), 3.0);
  totalEmissiveRadiance += vec3(0.18, 0.46, 0.58) * fres * mix(0.05, 0.4, uNight) * (1.0 - gLens);
}`)
      .replace('#include <lights_physical_fragment>', /* glsl */`#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
  material.clearcoat *= mix(mix(0.3, 1.0, gPanel), 0.9, gGear) * (1.0 - gSeam * 0.8);
#endif`);
  };
  m.customProgramCacheKey = () => 'strand-suit-1';
  return m;
}
