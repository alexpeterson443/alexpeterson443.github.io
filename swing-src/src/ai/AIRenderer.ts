import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TrafficSim } from './TrafficSim';
import { PedestrianSim, PED_WALK, PED_FLEE, PED_LOOK } from './PedestrianSim';

/** Realistic car paints (linear-ish sRGB hex); yellow cabs weighted by repetition. */
const CAR_PAINTS = [
  0xe8e8e6, 0xf2f2f0, 0x16171a, 0x1f2023, 0x9ea3a8, 0x6d7278, 0x4a4f55, 0x1d2f52, 0x2a4a7a,
  0x7d1a1a, 0xa82020, 0x4a1f25, 0x2c3d2e, 0xb8ad94, 0x8a6f4d, 0xf2b705, 0xf2b705, 0xf0b400,
];
const CLOTHES = [0x2b2f3a, 0x3c4a5e, 0x6b2530, 0x8a8f96, 0xd9d4c7, 0x1e1e1e, 0x2f4f3a, 0xa35a2a, 0x4b3b6b, 0xc7a64a, 0x7a8ca3, 0x5a3825];
const SKIN = [0xf1c8a8, 0xd9a47e, 0xb67b52, 0x8d5a3b, 0x5e3a26, 0xe8b996];

/** Box with a flat vertex colour, translated to (x, y, z). */
function box(w: number, h: number, d: number, x: number, y: number, z: number, c: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  g.translate(x, y, z);
  return paint(g, c);
}

function paint(g: THREE.BufferGeometry, c: number): THREE.BufferGeometry {
  const col = new THREE.Color(c);
  const n = g.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col.r; a[i * 3 + 1] = col.g; a[i * 3 + 2] = col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  if (g.index) return g.toNonIndexed();
  return g;
}

/** Keep only position/normal/color so merged parts agree on attributes. */
function strip(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const ng = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') ng.deleteAttribute(k);
  return ng;
}

/** Low-poly car body (model faces +Z, ground at y = 0, ~4.6 m long). White parts take the instance paint. */
function carGeometry(): THREE.BufferGeometry {
  const W = 0xffffff, DARK = 0x0b0c0e, GLASS = 0x151a20;
  const parts = [
    box(1.82, 0.62, 4.5, 0, 0.62, 0, W), // lower body
    box(1.6, 0.52, 2.3, 0, 1.19, -0.25, GLASS), // cabin glass
    box(1.5, 0.08, 2.05, 0, 1.49, -0.25, W), // roof
    box(1.64, 0.36, 0.08, 0, 1.12, 0.93, W), // A-pillar band (hides glass z-fight)
    box(1.86, 0.2, 4.56, 0, 0.36, 0, DARK), // bumpers / sills
  ];
  for (const [x, z] of [[-0.82, 1.45], [0.82, 1.45], [-0.82, -1.45], [0.82, -1.45]]) parts.push(box(0.26, 0.64, 0.64, x, 0.32, z, DARK));
  const g = mergeGeometries(parts.map(strip), false)!;
  for (const p of parts) p.dispose();
  g.computeBoundingSphere();
  return g;
}

/** Head- and taillight quads (+Z front). Vertex colours carry the emission tint. */
function lightGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const quad = (x: number, y: number, z: number, ry: number, c: number) => {
    const g = new THREE.PlaneGeometry(0.34, 0.16);
    g.rotateY(ry);
    g.translate(x, y, z);
    parts.push(strip(paint(g, c)));
  };
  for (const x of [-0.62, 0.62]) {
    quad(x, 0.78, 2.262, 0, 0xfff1d6);
    quad(x, 0.8, -2.262, Math.PI, 0xff1a0a);
  }
  const g = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  return g;
}

/** Pedestrian: torso capsule (clothing colour). Second part: head (skin) + legs (dark trousers). Model faces +Z. */
function pedGeometries(): { body: THREE.BufferGeometry; rest: THREE.BufferGeometry } {
  const torso = new THREE.CapsuleGeometry(0.21, 0.5, 2, 6);
  torso.scale(1, 1, 0.7);
  torso.translate(0, 1.2, 0);
  const body = strip(paint(torso, 0xffffff));
  const head = new THREE.IcosahedronGeometry(0.12, 1);
  head.translate(0, 1.66, 0.01);
  const legs = [box(0.14, 0.84, 0.16, -0.09, 0.42, 0, 0x30343c), box(0.14, 0.84, 0.16, 0.09, 0.42, 0, 0x30343c)];
  const parts = [strip(paint(head, 0xffffff)), ...legs.map(strip)];
  const rest = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  torso.dispose();
  head.dispose();
  return { body, rest };
}

function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, n: number, shadows: boolean): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false; // culled per instance on the CPU
  m.castShadow = shadows;
  m.receiveShadow = shadows;
  m.count = 0;
  return m;
}

export interface AIRenderOptions {
  carDrawDistance?: number;
  pedDrawDistance?: number;
  /** only pedestrians closer than this get the procedural walk bob/sway */
  pedAnimDistance?: number;
  /** y of the sidewalk surface (pedestrians stand on it) */
  sidewalkY?: number;
  shadows?: boolean;
}

/**
 * Instanced rendering of TrafficSim / PedestrianSim state. Each frame visible instances (within
 * draw distance and inside the camera frustum by bounding sphere) are compacted to the front of
 * the instance buffers and `mesh.count` is set, so GPU cost scales with what is on screen.
 */
export class AIRenderer {
  readonly group = new THREE.Group();
  readonly cars: THREE.InstancedMesh;
  readonly carLights: THREE.InstancedMesh;
  readonly pedBody: THREE.InstancedMesh;
  readonly pedRest: THREE.InstancedMesh;
  carsRendered = 0;
  pedsRendered = 0;

  private readonly carColor: Float32Array;
  private readonly clothColor: Float32Array;
  private readonly skinColor: Float32Array;
  private readonly frustum = new THREE.Frustum();
  private readonly projView = new THREE.Matrix4();
  private readonly sphere = new THREE.Sphere();
  private readonly m4 = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly e = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly pos = new THREE.Vector3();
  private readonly one = new THREE.Vector3(1, 1, 1);
  private readonly lightMat: THREE.MeshBasicMaterial;
  private readonly o: Required<AIRenderOptions>;

  constructor(private readonly traffic: TrafficSim, private readonly peds: PedestrianSim, opts: AIRenderOptions = {}) {
    this.o = { carDrawDistance: 450, pedDrawDistance: 180, pedAnimDistance: 70, sidewalkY: 0, shadows: true, ...opts };
    const nc = traffic.count, np = peds.count;
    const carMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.35 });
    this.cars = instanced(carGeometry(), carMat, Math.max(1, nc), this.o.shadows);
    this.lightMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    this.carLights = instanced(lightGeometry(), this.lightMat, Math.max(1, nc), false);
    this.carLights.receiveShadow = false;
    // lights share the car transforms: same attribute, uploaded once
    this.carLights.instanceMatrix = this.cars.instanceMatrix;
    this.setLightIntensity(1);

    const { body, rest } = pedGeometries();
    const pedMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    this.pedBody = instanced(body, pedMat, Math.max(1, np), this.o.shadows);
    this.pedRest = instanced(rest, pedMat, Math.max(1, np), this.o.shadows);
    this.pedRest.instanceMatrix = this.pedBody.instanceMatrix;

    // per-agent colours, deterministic from sim ids
    const col = new THREE.Color();
    this.carColor = new Float32Array(nc * 3);
    for (let i = 0; i < nc; i++) {
      col.setHex(CAR_PAINTS[traffic.color[i] % CAR_PAINTS.length]);
      this.carColor.set([col.r, col.g, col.b], i * 3);
    }
    this.clothColor = new Float32Array(np * 3);
    this.skinColor = new Float32Array(np * 3);
    for (let i = 0; i < np; i++) {
      const hsh = Math.imul(i + 1, 0x9e3779b1) >>> 0;
      col.setHex(CLOTHES[hsh % CLOTHES.length]);
      this.clothColor.set([col.r, col.g, col.b], i * 3);
      col.setHex(SKIN[(hsh >>> 8) % SKIN.length]);
      this.skinColor.set([col.r, col.g, col.b], i * 3);
    }
    this.cars.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, nc) * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.pedBody.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, np) * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.pedRest.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, np) * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.group.name = 'ai';
    this.group.add(this.cars, this.carLights, this.pedBody, this.pedRest);
  }

  /** Head/taillight brightness multiplier (>1 blooms). Drive it from time of day, e.g. 0.4 by day, 3 at night. */
  setLightIntensity(k: number): void {
    this.lightMat.color.setScalar(k);
  }

  update(camera: THREE.Camera, time: number, drawCars: boolean, drawPeds: boolean): void {
    camera.updateMatrixWorld();
    this.projView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projView);
    const cp = camera.getWorldPosition(this.pos);
    const camX = cp.x, camY = cp.y, camZ = cp.z;
    this.carsRendered = drawCars ? this.writeCars(camX, camY, camZ) : 0;
    this.pedsRendered = drawPeds ? this.writePeds(camX, camY, camZ, time) : 0;
    this.cars.visible = this.carLights.visible = this.carsRendered > 0;
    this.pedBody.visible = this.pedRest.visible = this.pedsRendered > 0;
  }

  private writeCars(camX: number, camY: number, camZ: number): number {
    const tr = this.traffic, tf = tr.transforms;
    const mat = this.cars.instanceMatrix.array as Float32Array;
    const colr = this.cars.instanceColor!.array as Float32Array;
    const D2 = this.o.carDrawDistance ** 2;
    let k = 0;
    this.sphere.radius = 2.6;
    for (let i = 0; i < tr.count; i++) {
      const x = tf[i * 3], z = tf[i * 3 + 1];
      const dx = x - camX, dz = z - camZ;
      if (dx * dx + dz * dz + camY * camY > D2) continue;
      this.sphere.center.set(x, 0.8, z);
      if (!this.frustum.intersectsSphere(this.sphere)) continue;
      const yaw = tf[i * 3 + 2], c = Math.cos(yaw), s = Math.sin(yaw), o = k * 16;
      // rotationY(yaw) then translate, column-major
      mat[o] = c; mat[o + 1] = 0; mat[o + 2] = -s; mat[o + 3] = 0;
      mat[o + 4] = 0; mat[o + 5] = 1; mat[o + 6] = 0; mat[o + 7] = 0;
      mat[o + 8] = s; mat[o + 9] = 0; mat[o + 10] = c; mat[o + 11] = 0;
      mat[o + 12] = x; mat[o + 13] = 0; mat[o + 14] = z; mat[o + 15] = 1;
      colr[k * 3] = this.carColor[i * 3]; colr[k * 3 + 1] = this.carColor[i * 3 + 1]; colr[k * 3 + 2] = this.carColor[i * 3 + 2];
      k++;
    }
    this.cars.count = this.carLights.count = k;
    if (k > 0) {
      this.cars.instanceMatrix.clearUpdateRanges();
      this.cars.instanceMatrix.addUpdateRange(0, k * 16);
      this.cars.instanceMatrix.needsUpdate = true;
      this.cars.instanceColor!.clearUpdateRanges();
      this.cars.instanceColor!.addUpdateRange(0, k * 3);
      this.cars.instanceColor!.needsUpdate = true;
    }
    return k;
  }

  private writePeds(camX: number, camY: number, camZ: number, time: number): number {
    const P = this.peds;
    const mat = this.pedBody.instanceMatrix.array as Float32Array;
    const cb = this.pedBody.instanceColor!.array as Float32Array;
    const cr = this.pedRest.instanceColor!.array as Float32Array;
    const D2 = this.o.pedDrawDistance ** 2, A2 = this.o.pedAnimDistance ** 2, y0 = this.o.sidewalkY;
    let k = 0;
    this.sphere.radius = 1.1;
    for (let i = 0; i < P.count; i++) {
      const x = P.x[i], z = P.z[i];
      const dx = x - camX, dz = z - camZ, dy = y0 + 1 - camY;
      const d2 = dx * dx + dz * dz + dy * dy;
      if (d2 > D2) continue;
      this.sphere.center.set(x, y0 + 0.9, z);
      if (!this.frustum.intersectsSphere(this.sphere)) continue;
      let bob = 0, roll = 0, pitch = 0;
      if (d2 < A2) {
        const st = P.state[i], ph = P.phase[i], sp = P.curSpeed[i];
        if (sp > 0.05 && (st === PED_WALK || st === PED_FLEE)) {
          const run = st === PED_FLEE ? 1 : 0;
          bob = Math.abs(Math.sin(ph)) * (0.04 + 0.05 * run);
          roll = Math.sin(ph) * 0.045;
          pitch = 0.04 + 0.2 * run;
        } else if (st === PED_LOOK && (i & 3) === 0) {
          bob = Math.max(0, Math.sin(time * 9 + i)) * 0.18; // a few cheer and hop
        }
      }
      this.e.set(pitch, P.heading[i], roll);
      this.q.setFromEuler(this.e);
      this.pos.set(x, y0 + bob, z);
      this.m4.compose(this.pos, this.q, this.one);
      this.m4.toArray(mat, k * 16);
      cb[k * 3] = this.clothColor[i * 3]; cb[k * 3 + 1] = this.clothColor[i * 3 + 1]; cb[k * 3 + 2] = this.clothColor[i * 3 + 2];
      cr[k * 3] = this.skinColor[i * 3]; cr[k * 3 + 1] = this.skinColor[i * 3 + 1]; cr[k * 3 + 2] = this.skinColor[i * 3 + 2];
      k++;
    }
    this.pedBody.count = this.pedRest.count = k;
    if (k > 0) {
      const im = this.pedBody.instanceMatrix;
      im.clearUpdateRanges(); im.addUpdateRange(0, k * 16); im.needsUpdate = true;
      const a = this.pedBody.instanceColor!, b = this.pedRest.instanceColor!;
      a.clearUpdateRanges(); a.addUpdateRange(0, k * 3); a.needsUpdate = true;
      b.clearUpdateRanges(); b.addUpdateRange(0, k * 3); b.needsUpdate = true;
    }
    return k;
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const m of [this.cars, this.carLights, this.pedBody, this.pedRest]) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      m.dispose();
    }
  }
}
