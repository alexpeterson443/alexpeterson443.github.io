import {
  BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, Group, IcosahedronGeometry, InstancedMesh,
  Matrix4, Mesh, MeshStandardMaterial, Quaternion, Uint32BufferAttribute, Vector3, Vector4,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import type { CityLayout } from '../city/CityGenerator';
import { HORIZON_GLSL, hUniforms } from './HorizonShared';
import { WATER_Y, type HorizonLayout } from './HorizonLayout';

/**
 * Ground beyond the district: the street grid carries on (roads, kerbs, sidewalks, night street
 * lighting), a waterfront drive and promenade runs along the quays, piers jut into the water and
 * stone quay walls drop to the waterline. Built from the layout's land cells on one shared-vertex
 * grid, so it has no cracks. It overlaps the district's own ground by a few metres and yields to it
 * via polygon offset.
 */
export class FarGround {
  readonly group = new Group();
  readonly mesh: Mesh;
  drawCalls = 0;

  constructor(layout: HorizonLayout, city: CityLayout) {
    const { xs, zs, cells } = layout;
    const nx = xs.length - 1, nz = zs.length - 1;
    const pos: number[] = [];
    const nor: number[] = [];
    const idx: number[] = [];
    // shared grid vertices for the flat land surface
    const vid = new Int32Array((nx + 1) * (nz + 1)).fill(-1);
    const vert = (i: number, j: number) => {
      const k = i + j * (nx + 1);
      if (vid[k] < 0) {
        vid[k] = pos.length / 3;
        pos.push(xs[i], 0, zs[j]);
        nor.push(0, 1, 0);
      }
      return vid[k];
    };
    const isLand = (i: number, j: number) => {
      if (i < 0 || j < 0 || i >= nx || j >= nz) return false;
      const c = cells[i + j * nx];
      return c === 1 || c === 3;
    };
    const isWater = (i: number, j: number) => i >= 0 && j >= 0 && i < nx && j < nz && cells[i + j * nx] === 0;
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        if (!isLand(i, j)) continue;
        const a = vert(i, j), b = vert(i + 1, j), c = vert(i + 1, j + 1), d = vert(i, j + 1);
        idx.push(a, d, c, a, c, b);
      }
    }
    // quay walls: vertical faces where land meets water
    const wall = (x0: number, z0: number, x1: number, z1: number, n: [number, number]) => {
      const base = pos.length / 3;
      const yb = WATER_Y - 1.5;
      pos.push(x0, 0, z0, x1, 0, z1, x1, yb, z1, x0, yb, z0);
      for (let k = 0; k < 4; k++) nor.push(n[0], 0, n[1]);
      // wind so the face points along n
      const cross = (x1 - x0) * n[1] - (z1 - z0) * n[0];
      if (cross < 0) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    };
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        if (!isLand(i, j)) continue;
        if (isWater(i - 1, j)) wall(xs[i], zs[j], xs[i], zs[j + 1], [-1, 0]);
        if (isWater(i + 1, j)) wall(xs[i + 1], zs[j], xs[i + 1], zs[j + 1], [1, 0]);
        if (isWater(i, j - 1)) wall(xs[i], zs[j], xs[i + 1], zs[j], [0, -1]);
        if (isWater(i, j + 1)) wall(xs[i], zs[j + 1], xs[i + 1], zs[j + 1], [0, 1]);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    g.setIndex(new Uint32BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    this.mesh = new Mesh(g, createFarGroundMaterial(layout, city));
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    this.mesh.name = 'horizon-ground';
    this.group.add(this.mesh);
    this.drawCalls++;
    this.buildPromenade(layout);
  }

  /** Lamp posts and a row of trees along the district's quays. */
  private buildPromenade(layout: HorizonLayout): void {
    const L = layout.lamps;
    const n = L.length / 2;
    const m = new Matrix4(), q = new Quaternion(), p = new Vector3(), s = new Vector3();
    const poleGeo = new CylinderGeometry(0.07, 0.11, 1, 6);
    poleGeo.translate(0, 0.5, 0);
    const poles = new InstancedMesh(poleGeo, new MeshStandardMaterial({ color: 0x23272b, roughness: 0.5, metalness: 0.6 }), n);
    const heads = new InstancedMesh(new IcosahedronGeometry(0.32, 1), new MeshStandardMaterial({ color: 0x333333, emissive: new Color(1.0, 0.82, 0.58), emissiveIntensity: 2.4 }), n);
    for (let i = 0; i < n; i++) {
      m.compose(p.set(L[i * 2], 0, L[i * 2 + 1]), q, s.set(1, 5.6, 1));
      poles.setMatrixAt(i, m);
      m.compose(p.set(L[i * 2], 5.75, L[i * 2 + 1]), q, s.set(1, 0.8, 1));
      heads.setMatrixAt(i, m);
    }
    for (const im of [poles, heads]) {
      im.castShadow = im === poles;
      im.receiveShadow = false;
      im.computeBoundingSphere();
      this.group.add(im);
      this.drawCalls++;
    }
    // trees between the lamps, set back from the water
    const trees: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const x = (L[i * 2] + L[i * 2 + 2]) / 2, z = (L[i * 2 + 1] + L[i * 2 + 3]) / 2;
      if (Math.hypot(L[i * 2 + 2] - L[i * 2], L[i * 2 + 3] - L[i * 2 + 1]) > 30) continue;
      const alongX = Math.abs(L[i * 2 + 3] - L[i * 2 + 1]) < 1;
      trees.push(alongX ? x : x + 9, alongX ? z + 9 : z);
    }
    const nt = trees.length / 2;
    const trunkGeo = new CylinderGeometry(0.12, 0.18, 1, 6);
    trunkGeo.translate(0, 0.5, 0);
    const trunks = new InstancedMesh(trunkGeo, new MeshStandardMaterial({ color: 0x4a3627, roughness: 0.9 }), nt);
    const crowns = new InstancedMesh(new IcosahedronGeometry(1, 1), new MeshStandardMaterial({ color: 0x3d5a2a, roughness: 0.95, flatShading: true }), nt);
    const col = new Color();
    for (let i = 0; i < nt; i++) {
      const x = trees[i * 2], z = trees[i * 2 + 1];
      const h = 5.5 + ((i * 7919) % 13) / 13 * 2.5;
      m.compose(p.set(x, 0, z), q, s.set(1, h * 0.55, 1));
      trunks.setMatrixAt(i, m);
      m.compose(p.set(x, h * 0.72, z), q, s.set(h * 0.3, h * 0.27, h * 0.3));
      crowns.setMatrixAt(i, m);
      col.setHSL(0.24 + ((i * 31) % 7) * 0.008, 0.42, 0.2 + ((i * 17) % 5) * 0.012);
      crowns.setColorAt(i, col);
    }
    for (const im of [trunks, crowns]) {
      im.castShadow = true;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      this.group.add(im);
      this.drawCalls++;
    }
  }
}

function createFarGroundMaterial(layout: HorizonLayout, city: CityLayout): MeshStandardMaterial {
  const p = city.params, b = city.bounds;
  const m = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
  m.fog = false; // replaced by the horizon atmosphere below
  // yield to the district's ground where the two overlap along the district edge
  m.polygonOffset = true;
  m.polygonOffsetFactor = 1;
  m.polygonOffsetUnits = 2;
  const grid = new Vector4(b.x0 + p.avenueWidth / 2, b.z0 + p.streetWidth / 2, p.blockSizeX + p.avenueWidth, p.blockSizeZ + p.streetWidth);
  const roads = new Vector4(p.avenueWidth, p.streetWidth, p.sidewalkWidth, 0);
  const district = new Vector4(b.x0, b.z0, b.x1, b.z1);
  const quays = new Vector4(layout.quayN, layout.quayW, 17, 0);
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    Object.assign(sh.uniforms, hUniforms);
    sh.uniforms.uGrid = { value: grid };
    sh.uniforms.uRoads = { value: roads };
    sh.uniforms.uDistrict = { value: district };
    sh.uniforms.uQuays = { value: quays };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGW;\nvarying vec3 vGN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvGN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
${HORIZON_GLSL}
varying vec3 vGW;
varying vec3 vGN;
uniform vec4 uGrid;     // avenue x0, street z0, pitch x, pitch z
uniform vec4 uRoads;    // avenue width, street width, sidewalk width
uniform vec4 uDistrict; // x0 z0 x1 z1
uniform vec4 uQuays;    // north quay z, west quay x, drive width
float gRoughH; vec3 gEmitH;
// 1 inside a band of half-width h around 0, anti-aliased by w
float band(float d, float h, float w) { return 1.0 - smoothstep(h - w, h + w, d); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec2 P = vGW.xz;
  vec2 fw = fwidth(P) + 1e-4;
  float fwm = max(fw.x, fw.y);
  gRoughH = 0.92; gEmitH = vec3(0.0);
  vec3 N = normalize(vGN);
  float n1 = hNoise(P * 0.7), n2 = hNoise(P * 5.3);
  vec3 asphalt = vec3(0.105, 0.105, 0.11) * (0.8 + 0.3 * n1 + 0.14 * n2);
  vec3 walk = vec3(0.19, 0.178, 0.155) * (0.88 + 0.2 * n1);
  vec3 col;
  if (N.y < 0.5) {
    // quay wall: stone courses, wet dark band at the waterline, algae below
    float y = vGW.y;
    float course = fract(y / 0.6);
    float joint = 1.0 - smoothstep(0.0, 0.1, min(course, 1.0 - course)) * (1.0 - smoothstep(0.3, 1.0, fwidth(y / 0.6)));
    vec3 stone = vec3(0.3, 0.28, 0.25) * (0.75 + 0.35 * hNoise(vec2(dot(P, vec2(0.7, 0.7)) * 0.9, y * 2.0)));
    stone *= 1.0 - 0.35 * joint;
    float wet = 1.0 - smoothstep(${(WATER_Y - 0.1).toFixed(2)}, ${(WATER_Y + 1.1).toFixed(2)}, y);
    stone = mix(stone, vec3(0.06, 0.075, 0.06), wet * 0.85);
    col = stone;
    gRoughH = mix(0.85, 0.35, wet);
  } else {
    float dNorth = uDistrict.y - P.y;           // metres north of the district
    float dWest = uDistrict.x - P.x;            // metres west of the district
    bool promN = P.y >= uQuays.x && dNorth > 0.0 && P.x > uQuays.y;
    bool promW = P.x >= uQuays.y && dWest > 0.0 && P.y > uQuays.x;
    bool pier = (P.y < uQuays.x && P.y > uQuays.x - 110.0 && P.x > uQuays.y - 20.0 && P.x < uDistrict.z + 260.0) ||
                (P.x < uQuays.y && P.x > uQuays.y - 110.0 && P.y > uQuays.x - 20.0);
    if (pier) {
      // timber deck on concrete
      float plank = fract((abs(P.x - uQuays.y) < 110.0 && P.y > uQuays.x ? P.y : P.x) / 0.9);
      float seam = (1.0 - smoothstep(0.0, 0.08, min(plank, 1.0 - plank))) * (1.0 - smoothstep(0.1, 0.6, fwm));
      col = vec3(0.23, 0.19, 0.15) * (0.8 + 0.35 * hNoise(P * vec2(0.3, 3.0))) * (1.0 - 0.4 * seam);
      gRoughH = 0.8;
    } else if (promN || promW) {
      // waterfront drive next to the district, then a paved promenade to the quay edge
      float dEdge = promN ? dNorth : dWest;         // from the district edge
      float dQuay = promN ? P.y - uQuays.x : P.x - uQuays.y;
      float along = promN ? P.x : P.y;
      float fwa = promN ? fw.y : fw.x;
      if (dEdge < uQuays.z) {
        col = asphalt;
        float cl = band(abs(abs(dEdge - uQuays.z * 0.5) - 0.18), 0.08, fwa);
        float dash = step(0.5, fract(along / 9.0));
        float lanes = band(abs(abs(dEdge - uQuays.z * 0.5) - uQuays.z * 0.25), 0.07, fwa) * dash;
        col = mix(col, vec3(0.8, 0.62, 0.12), cl);
        col = mix(col, vec3(0.8), lanes);
        gRoughH = 0.9;
      } else if (dEdge < uQuays.z + uRoads.z) {
        col = walk;
      } else {
        // stone paving with a joint grid, a grass strip, and a granite kerb along the water
        vec2 q = vec2(along, dQuay) / 1.5;
        vec2 fq = abs(fract(q) - 0.5);
        float joints = (1.0 - smoothstep(0.43, 0.49, max(fq.x, fq.y))) ;
        joints = mix(joints, 0.85, smoothstep(0.1, 0.5, fwm / 1.5));
        vec3 pave = vec3(0.3, 0.27, 0.23) * (0.85 + 0.25 * hNoise(floor(q) * 0.37)) * mix(0.8, 1.0, joints);
        float grass = band(abs(dQuay - 12.0), 2.6, fwa);
        pave = mix(pave, vec3(0.07, 0.11, 0.045) * (0.8 + 0.4 * n2), grass);
        float kerb = band(dQuay, 0.9, fwa);
        col = mix(pave, vec3(0.36, 0.35, 0.33), kerb);
        gRoughH = mix(0.8, 0.95, grass);
      }
    } else {
      // the street grid carries on beyond the district
      float dA = abs(mod(P.x - uGrid.x + uGrid.z * 0.5, uGrid.z) - uGrid.z * 0.5);
      float dS = abs(mod(P.y - uGrid.y + uGrid.w * 0.5, uGrid.w) - uGrid.w * 0.5);
      float hA = uRoads.x * 0.5, hS = uRoads.y * 0.5;
      float road = max(band(dA, hA, fw.x), band(dS, hS, fw.y));
      float side = max(band(dA, hA + uRoads.z, fw.x), band(dS, hS + uRoads.z, fw.y));
      vec2 blockId = floor((P - uGrid.xy + uGrid.zw * 0.5) / uGrid.zw);
      float bh = hHash(blockId + 71.0);
      // block interiors (mostly under buildings): courtyards, parking, a few small parks
      vec3 inner = bh < 0.18 ? vec3(0.06, 0.1, 0.04) * (0.8 + 0.4 * n1) : vec3(0.15, 0.145, 0.14) * (0.8 + 0.3 * n2);
      col = mix(inner, walk, side);
      col = mix(col, asphalt, road);
      // markings: double yellow on avenues, dashed lanes, crossings
      float onA = band(dA, hA, fw.x) * (1.0 - band(dS, hS, fw.y));
      float onS = band(dS, hS, fw.y) * (1.0 - band(dA, hA, fw.x));
      float yl = max(band(abs(dA - 0.18), 0.08, fw.x) * onA, band(abs(dS - 0.15), 0.08, fw.y) * onS);
      float lane = band(abs(dA - uRoads.x * 0.25), 0.07, fw.x) * step(0.55, fract(P.y / 9.0)) * onA;
      float fadeM = 1.0 - smoothstep(0.08, 0.6, fwm);
      col = mix(col, vec3(0.8, 0.62, 0.12), yl * fadeM);
      col = mix(col, vec3(0.78), lane * fadeM);
      gRoughH = mix(0.92, 0.88, road);
      // night: sodium street lighting along the kerbs (reads as glowing grid lines from afar)
      float kerbLine = max(band(abs(dA - hA - 1.0), 0.6, fw.x), band(abs(dS - hS - 1.0), 0.6, fw.y));
      float lampDots = max(band(abs(mod(P.y, 26.0) - 13.0), 1.2, fw.y), band(abs(mod(P.x, 26.0) - 13.0), 1.2, fw.x));
      float lampAvg = mix(lampDots, 0.1, smoothstep(0.2, 1.0, fwm / 2.0));
      float pool = max(band(dA, hA + 3.0, fw.x * 3.0), band(dS, hS + 3.0, fw.y * 3.0));
      gEmitH = vec3(1.0, 0.62, 0.3) * (kerbLine * lampAvg * 2.5 + pool * 0.05) * hDark;
    }
  }
  diffuseColor.rgb = col;
}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = gRoughH;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += gEmitH;')
      .replace('#include <fog_fragment>', `{
  vec3 d = vGW - cameraPosition;
  float dist = length(d);
  float fo = hFogAmount(d, vViewPosition.z);
  gl_FragColor.rgb = mix(gl_FragColor.rgb - gEmitH, hAtmosColor(d), fo) + gEmitH * pow(1.0 - fo, 0.8);
}`);
  };
  m.customProgramCacheKey = () => 'horizon-ground-v1';
  return m;
}
