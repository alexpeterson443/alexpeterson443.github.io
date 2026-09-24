import {
  BoxGeometry, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, Group,
  IcosahedronGeometry, InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PlaneGeometry, Quaternion, SRGBColorSpace, Vector3, AdditiveBlending,
  type Material, type Scene,
} from 'three';
import type { CityLayout, Prop, PropType } from '../city/CityGenerator';
import { Rng } from '../core/rng';
import { createFacadeMaterial, createGroundMaterial } from './materials';
import { envUniforms } from './Environment';

const _m = new Matrix4();
const _q = new Quaternion();
const _p = new Vector3();
const _s = new Vector3();
const UPY = new Vector3(0, 1, 0);

/** Build-time helper: collect instance transforms/colours, then emit one InstancedMesh. */
class Batch {
  mats: number[] = [];
  cols: number[] = [];
  extra: number[][] = [];
  add(x: number, y: number, z: number, sx: number, sy: number, sz: number, rotY = 0, col?: Color, extra?: number[]): void {
    _q.setFromAxisAngle(UPY, rotY);
    _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
    this.mats.push(..._m.elements);
    if (col) this.cols.push(col.r, col.g, col.b);
    if (extra) extra.forEach((v, i) => ((this.extra[i] ??= []).push(v)));
  }
  get count(): number {
    return this.mats.length / 16;
  }
  build(geo: BufferGeometry, mat: Material | Material[], shadows = true, extraNames: string[] = [], extraSizes: number[] = []): InstancedMesh | null {
    const n = this.count;
    if (n === 0) return null;
    const mesh = new InstancedMesh(geo, mat, n);
    mesh.instanceMatrix.array.set(this.mats);
    if (this.cols.length) mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(this.cols), 3);
    extraNames.forEach((name, i) => geo.setAttribute(name, new InstancedBufferAttribute(new Float32Array(this.extra[i]), extraSizes[i])));
    mesh.castShadow = shadows;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    return mesh;
  }
}

/** Unit geometry with its base at y = 0 (so scale.y = height). */
function baseBox(): BoxGeometry {
  const g = new BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  return g;
}

/**
 * Turns a CityLayout into GPU-instanced meshes. Buildings are chunked on a grid so frustum
 * culling works per chunk; props are one instanced draw per type.
 */
export class CityRenderer {
  readonly group = new Group();
  drawCalls = 0;
  instances = 0;
  private lampPool: InstancedMesh | null = null;

  constructor(private city: CityLayout) {
    this.buildGround();
    this.buildBuildings();
    this.buildProps();
  }

  addTo(scene: Scene): void {
    scene.add(this.group);
  }

  private add(mesh: InstancedMesh | Mesh | null): void {
    if (!mesh) return;
    this.group.add(mesh);
    this.drawCalls++;
    if (mesh instanceof InstancedMesh) this.instances += mesh.count;
  }

  private buildGround(): void {
    const b = this.city.bounds, p = this.city.params;
    const margin = 600;
    const g = new PlaneGeometry(b.x1 - b.x0 + margin * 2, b.z1 - b.z0 + margin * 2);
    g.rotateX(-Math.PI / 2);
    const ground = new Mesh(g, createGroundMaterial(this.city.avenueX, this.city.streetZ, p.avenueWidth, p.streetWidth));
    ground.position.set((b.x0 + b.x1) / 2, 0, (b.z0 + b.z1) / 2);
    ground.receiveShadow = true;
    this.add(ground);
    // raised sidewalks / plazas (visual kerbs)
    const walk = new Batch();
    const park = new Batch();
    for (const bl of this.city.blocks) {
      (bl.park ? park : walk).add((bl.x0 + bl.x1) / 2, 0, (bl.z0 + bl.z1) / 2, bl.x1 - bl.x0, 0.14, bl.z1 - bl.z0);
    }
    this.add(walk.build(baseBox(), new MeshStandardMaterial({ color: 0x77736c, roughness: 0.92 }), false));
    this.add(park.build(baseBox(), new MeshStandardMaterial({ color: 0x3f5a2e, roughness: 1 }), false));
  }

  private buildBuildings(): void {
    const mat = createFacadeMaterial();
    const chunk = 160;
    const b = this.city.bounds;
    const nx = Math.ceil((b.x1 - b.x0) / chunk), nz = Math.ceil((b.z1 - b.z0) / chunk);
    const batches: Batch[] = Array.from({ length: nx * nz }, () => new Batch());
    const col = new Color(), glass = new Color(), frame = new Color(), trimC = new Color();
    const trim = new Batch();
    for (const bd of this.city.buildings) {
      col.setHex(bd.wallColor);
      glass.setHex(bd.glassColor);
      frame.setHex(bd.frameColor);
      trimC.setHex(bd.trimColor);
      for (const t of bd.tiers) {
        const cx = (t.x0 + t.x1) / 2, cz = (t.z0 + t.z1) / 2;
        const ci = Math.min(nx - 1, Math.floor((cx - b.x0) / chunk)) + Math.min(nz - 1, Math.floor((cz - b.z0) / chunk)) * nx;
        batches[ci].add(cx, t.y0, cz, t.x1 - t.x0, t.y1 - t.y0, t.z1 - t.z0, 0, col, [
          bd.windowW, bd.windowH, bd.floorH, bd.seed,
          bd.archetype, bd.litFraction, bd.pier, bd.sill,
          bd.groundH, bd.paired ? 1 : 0, bd.office ? 1 : 0, bd.roofKind,
          glass.r, glass.g, glass.b, frame.r, frame.g, frame.b, trimC.r, trimC.g, trimC.b,
        ]);
        // cornice ledge ringing each tier top (four slabs, so the roof surface stays visible)
        const tc = trimC.clone().multiplyScalar(0.85);
        const w = t.x1 - t.x0, d = t.z1 - t.z0, o = 0.3, h = 0.55, y = t.y1 - 0.45;
        trim.add(cx, y, t.z0 + 0.15, w + 2 * o, h, 0.9, 0, tc);
        trim.add(cx, y, t.z1 - 0.15, w + 2 * o, h, 0.9, 0, tc);
        trim.add(t.x0 + 0.15, y, cz, 0.9, h, d, 0, tc);
        trim.add(t.x1 - 0.15, y, cz, 0.9, h, d, 0, tc);
      }
    }
    const geo = baseBox();
    // per-instance extras, in the order pushed above: [attribute name, component count]
    const layout: [string, number][] = [['aFacade', 4], ['aFacade2', 4], ['aFacade3', 4], ['aGlass', 3], ['aFrame', 3], ['aTrim', 3]];
    for (const batch of batches) {
      if (!batch.count) continue;
      const g = geo.clone();
      const e = batch.extra;
      let k = 0;
      const attrs = layout.map(([name, size]) => {
        const arr = new Float32Array(batch.count * size);
        for (let i = 0; i < batch.count; i++) for (let c = 0; c < size; c++) arr[i * size + c] = e[k + c][i];
        k += size;
        return [name, new InstancedBufferAttribute(arr, size)] as const;
      });
      batch.extra = [];
      const mesh = batch.build(g, mat);
      if (!mesh) continue;
      for (const [name, a] of attrs) g.setAttribute(name, a);
      this.add(mesh);
    }
    this.add(trim.build(baseBox(), new MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })));
  }

  private buildProps(): void {
    const by = new Map<PropType, Prop[]>();
    for (const p of this.city.props) {
      let l = by.get(p.type);
      if (!l) by.set(p.type, (l = []));
      l.push(p);
    }
    const get = (t: PropType) => by.get(t) ?? [];
    const rng = new Rng(99);
    const concrete = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const metal = new MeshStandardMaterial({ color: 0x8a8f94, roughness: 0.45, metalness: 0.7 });
    const darkMetal = new MeshStandardMaterial({ color: 0x2c3034, roughness: 0.5, metalness: 0.6 });
    const wood = new MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.8 });

    // parapets: tinted like their building
    {
      const bt = new Batch();
      const c = new Color();
      for (const p of get('parapet')) {
        const bd = this.city.buildings[p.building];
        c.setHSL(bd.hue, bd.sat * 0.8, bd.light * 0.85);
        bt.add(p.x, p.y, p.z, p.sx, p.sy, p.sz, 0, c);
      }
      this.add(bt.build(baseBox(), concrete));
    }
    // HVAC units + fans, vents
    {
      const box = new Batch(), fan = new Batch(), vent = new Batch();
      for (const p of get('hvac')) {
        box.add(p.x, p.y, p.z, p.sx, p.sy, p.sz);
        fan.add(p.x, p.y + p.sy, p.z, Math.min(p.sx, p.sz) * 0.35, 0.15, Math.min(p.sx, p.sz) * 0.35);
      }
      for (const p of get('vent')) vent.add(p.x, p.y, p.z, p.sx * 0.3, p.sy, p.sx * 0.3);
      this.add(box.build(baseBox(), metal));
      const fg = new CylinderGeometry(1, 1, 1, 14); fg.translate(0, 0.5, 0);
      this.add(fan.build(fg, darkMetal));
      const vg = new CylinderGeometry(1, 1, 1, 10); vg.translate(0, 0.5, 0);
      this.add(vent.build(vg, metal));
    }
    // water towers: legs, tank, conical roof
    {
      const tank = new Batch(), roof = new Batch(), legs = new Batch(), band = new Batch();
      for (const p of get('waterTower')) {
        const r = p.sx, legH = p.sy, h = p.sz;
        tank.add(p.x, p.y + legH, p.z, r, h, r, p.rotY);
        band.add(p.x, p.y + legH + h * 0.33, p.z, r * 1.02, 0.15, r * 1.02);
        band.add(p.x, p.y + legH + h * 0.66, p.z, r * 1.02, 0.15, r * 1.02);
        roof.add(p.x, p.y + legH + h, p.z, r * 1.05, r * 0.55, r * 1.05, p.rotY);
        for (let k = 0; k < 4; k++) {
          const a = p.rotY + (k * Math.PI) / 2 + Math.PI / 4;
          legs.add(p.x + Math.cos(a) * r * 0.75, p.y, p.z + Math.sin(a) * r * 0.75, 0.25, legH + 0.2, 0.25);
        }
      }
      const tg = new CylinderGeometry(1, 1, 1, 18); tg.translate(0, 0.5, 0);
      this.add(tank.build(tg, wood));
      this.add(band.build(tg.clone(), darkMetal));
      const rg = new ConeGeometry(1, 1, 18); rg.translate(0, 0.5, 0);
      this.add(roof.build(rg, new MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.7 })));
      this.add(legs.build(baseBox(), darkMetal));
    }
    // antennas with aircraft-warning lights
    {
      const mast = new Batch(), lamp = new Batch();
      for (const p of get('antenna')) {
        mast.add(p.x, p.y, p.z, 0.35, p.sy, 0.35);
        lamp.add(p.x, p.y + p.sy, p.z, 0.5, 0.5, 0.5);
      }
      const mg = new CylinderGeometry(0.4, 1, 1, 8); mg.translate(0, 0.5, 0);
      this.add(mast.build(mg, metal));
      this.add(lamp.build(new IcosahedronGeometry(1, 1), new MeshStandardMaterial({ color: 0x220000, emissive: 0xff2010, emissiveIntensity: 6 }), false));
    }
    // billboards: frame + emissive panel with invented ads
    {
      const frame = new Batch();
      const panels: Batch[] = Array.from({ length: 6 }, () => new Batch());
      for (const p of get('billboard')) {
        const w = Math.max(p.sx, p.sz), h = p.sy - 3;
        frame.add(p.x, p.y, p.z, p.sx === 0.5 ? 0.4 : w * 0.05, 3, p.sz === 0.5 ? 0.4 : w * 0.05, 0);
        frame.add(p.x, p.y + 2.2, p.z, p.sx + 0.3, h + 0.8, p.sz + 0.3, 0);
        // panel faces both sides
        panels[p.variant % 6].add(p.x, p.y + 2.6 + h / 2, p.z, w, h, 1, p.rotY);
        panels[p.variant % 6].add(p.x, p.y + 2.6 + h / 2, p.z, w, h, 1, p.rotY + Math.PI);
      }
      this.add(frame.build(baseBox(), darkMetal));
      const tex = makeAdAtlas();
      panels.forEach((bt, i) => {
        const g = new PlaneGeometry(1, 1);
        const uv = g.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setX(k, (uv.getX(k) + i) / 6);
        // offset so the panel sits just proud of the frame on either side
        g.translate(0, 0, 0.36);
        const mat = new MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.5 });
        this.add(bt.build(g, mat, false));
      });
    }
    // street lights: pole + arm + head, plus additive light pools on the ground
    {
      const pole = new Batch(), arm = new Batch(), head = new Batch(), pool = new Batch();
      for (const p of get('streetLight')) {
        pole.add(p.x, 0, p.z, 0.14, p.sy, 0.14);
        const dx = Math.sin(p.rotY + Math.PI / 2), dz = Math.cos(p.rotY + Math.PI / 2);
        const ox = -dz * 1.3, oz = dx * 1.3; // arm reaches toward the road
        arm.add(p.x + ox * 0.5, p.sy - 0.1, p.z + oz * 0.5, Math.abs(ox) + 0.12, 0.12, Math.abs(oz) + 0.12);
        head.add(p.x + ox, p.sy - 0.35, p.z + oz, 0.55, 0.25, 0.55);
        pool.add(p.x + ox, 0.03, p.z + oz, 9, 1, 9);
      }
      const pg = new CylinderGeometry(0.6, 1, 1, 8); pg.translate(0, 0.5, 0);
      this.add(pole.build(pg, darkMetal));
      this.add(arm.build(baseBox(), darkMetal));
      this.add(head.build(baseBox(), new MeshStandardMaterial({ color: 0x333333, emissive: 0xffd9a0, emissiveIntensity: 3 }), false));
      const poolGeo = new PlaneGeometry(1, 1); poolGeo.rotateX(-Math.PI / 2);
      const poolMat = new MeshBasicMaterial({ map: radialTexture(), color: 0xffc98a, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0 });
      poolMat.onBeforeCompile = (sh) => {
        sh.uniforms.uNight = envUniforms.uNight;
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNight;')
          .replace('#include <opaque_fragment>', 'diffuseColor.a = diffuseColor.a * 0.0 + texture2D(map, vMapUv).r * uNight * 0.55;\n#include <opaque_fragment>');
      };
      poolMat.opacity = 1;
      this.lampPool = pool.build(poolGeo, poolMat, false);
      if (this.lampPool) this.lampPool.receiveShadow = false;
      this.add(this.lampPool);
    }
    // traffic signals
    {
      const pole = new Batch(), box = new Batch(), red = new Batch(), green = new Batch();
      for (const p of get('signal')) {
        pole.add(p.x, 0, p.z, 0.2, p.sy, 0.2);
        const dir = p.variant === 0 ? -1 : 1;
        box.add(p.x + dir * 0.0, p.sy - 1.6, p.z, 0.45, 1.3, 0.45);
        (p.variant === 0 ? red : green).add(p.x, p.sy - 0.9, p.z, 0.2, 0.2, 0.2);
      }
      const pg = new CylinderGeometry(0.5, 0.5, 1, 8); pg.translate(0, 0.5, 0);
      this.add(pole.build(pg, darkMetal));
      this.add(box.build(baseBox(), new MeshStandardMaterial({ color: 0x1d2024, roughness: 0.6 })));
      const sg = new IcosahedronGeometry(1, 1);
      this.add(red.build(sg, new MeshStandardMaterial({ color: 0x200000, emissive: 0xff2a1a, emissiveIntensity: 5 }), false));
      this.add(green.build(sg, new MeshStandardMaterial({ color: 0x002000, emissive: 0x30ff80, emissiveIntensity: 5 }), false));
    }
    // trees: trunk + clustered canopy with colour variation
    {
      const trunk = new Batch(), crown = new Batch();
      const c = new Color();
      for (const p of get('tree')) {
        trunk.add(p.x, 0, p.z, 0.18 * p.sx, p.sy * 0.5, 0.18 * p.sx);
        c.setHSL(0.22 + rng.range(-0.04, 0.05), 0.45, 0.2 + rng.range(-0.05, 0.06));
        const r = p.sy * 0.28;
        crown.add(p.x, p.sy * 0.62, p.z, r, r * 0.85, r, p.rotY, c);
        crown.add(p.x + r * 0.4, p.sy * 0.52, p.z + r * 0.2, r * 0.7, r * 0.6, r * 0.7, p.rotY, c);
      }
      const tg = new CylinderGeometry(0.7, 1, 1, 7); tg.translate(0, 0.5, 0);
      this.add(trunk.build(tg, wood));
      this.add(crown.build(new IcosahedronGeometry(1, 1), new MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true })));
    }
    // street furniture
    {
      const bench = new Batch(), hydrant = new Batch(), kiosk = new Batch();
      for (const p of get('bench')) bench.add(p.x, 0, p.z, 1.8, 0.5, 0.6, p.rotY);
      for (const p of get('hydrant')) hydrant.add(p.x, 0, p.z, 0.22, 0.8, 0.22);
      for (const p of get('kiosk')) kiosk.add(p.x, 0, p.z, p.sx, p.sy, p.sz);
      this.add(bench.build(baseBox(), wood));
      const hg = new CylinderGeometry(1, 1, 1, 8); hg.translate(0, 0.5, 0);
      this.add(hydrant.build(hg, new MeshStandardMaterial({ color: 0xb02a1e, roughness: 0.5 })));
      this.add(kiosk.build(baseBox(), new MeshStandardMaterial({ color: 0x2f5d50, roughness: 0.6 })));
    }
  }
}

function radialTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.5, 'rgba(160,160,160,1)');
  gr.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/** Six invented billboard ads drawn on a canvas atlas (original placeholder art). */
function makeAdAtlas(): CanvasTexture {
  const w = 256, h = 110;
  const c = document.createElement('canvas');
  c.width = w * 6;
  c.height = h;
  const g = c.getContext('2d')!;
  const ads: [string, string, string, string][] = [
    ['#0e2a47', '#39c6ff', 'NIMBUS', 'AIR · 24/7'],
    ['#3d0d24', '#ff4f8b', 'PULSE', 'energy soda'],
    ['#10291a', '#8cff6a', 'VERDE', 'city greens'],
    ['#2b1a05', '#ffb347', 'HALCYON', 'hotel & spa'],
    ['#161616', '#f2f2f2', 'OBLIQUE', 'new season'],
    ['#221043', '#b890ff', 'LUMEN', 'stream it'],
  ];
  ads.forEach(([bg, fg, title, sub], i) => {
    const x = i * w;
    const gr = g.createLinearGradient(x, 0, x + w, h);
    gr.addColorStop(0, bg);
    gr.addColorStop(1, '#000000');
    g.fillStyle = gr;
    g.fillRect(x, 0, w, h);
    g.fillStyle = fg;
    g.globalAlpha = 0.25;
    g.beginPath();
    g.arc(x + w * 0.82, h * 0.5, 44, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.font = 'bold 46px sans-serif';
    g.fillText(title, x + 14, 58);
    g.font = '20px sans-serif';
    g.fillStyle = '#ffffffcc';
    g.fillText(sub, x + 16, 90);
  });
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
