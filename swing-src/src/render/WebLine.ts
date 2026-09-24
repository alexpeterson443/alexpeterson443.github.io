import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, Mesh, MeshBasicMaterial,
  PerspectiveCamera, PlaneGeometry, Vector3, type Camera, type Scene,
} from 'three';

/** Soft round sprite for the anchor impact puff (built once). */
let puffTex: CanvasTexture | null = null;
function puffTexture(): CanvasTexture {
  if (puffTex) return puffTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(220,240,255,0.55)');
  grd.addColorStop(1, 'rgba(200,230,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  puffTex = new CanvasTexture(c);
  return puffTex;
}

const SEG = 28;

/**
 * Camera-facing ribbon drawn from the hand to the web anchor. Shoots out over a few frames,
 * sags when slack, vibrates with tension, and lingers briefly after release.
 */
export class WebLine {
  readonly mesh: Mesh;
  private readonly pos = new Float32Array((SEG + 1) * 2 * 3);
  private readonly geo = new BufferGeometry();
  private shoot = 1;
  private linger = 0;
  private active = false;
  private readonly from = new Vector3();
  private readonly to = new Vector3();
  private readonly lingerFrom = new Vector3();
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();
  private readonly _s = new Vector3();
  private readonly _view = new Vector3();
  private t = 0;
  /** strand half-width at the hand (m); it tapers toward the anchor */
  width = 0.016;
  /** drawing-buffer height in pixels, for the one-pixel minimum width (set on resize) */
  static viewportH = 720;
  private readonly puff: Mesh;
  private puffT = 1;

  constructor(scene: Scene, color = new Color(0.9, 0.94, 1.0)) {
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    const idx: number[] = [];
    for (let i = 0; i < SEG; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geo.setIndex(idx);
    // a silk strand, not a laser: display-white, so it only blooms where the scene around it does
    const mat = new MeshBasicMaterial({ color, side: DoubleSide, transparent: true, opacity: 0.9, depthWrite: false });
    this.mesh = new Mesh(this.geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    scene.add(this.mesh);
    const pm = new MeshBasicMaterial({ map: puffTexture(), color: new Color(1.4, 1.5, 1.6), transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.puff = new Mesh(new PlaneGeometry(1, 1), pm);
    this.puff.visible = false;
    this.puff.renderOrder = 3;
    scene.add(this.puff);
  }

  /** Call when a new web fires. */
  fire(): void {
    this.shoot = 0;
    this.linger = 0;
  }

  release(): void {
    if (this.active) {
      this.linger = 0.28;
      this.lingerFrom.copy(this.from);
    }
  }

  /**
   * @param hand world position of the hand (null = no active web)
   * @param anchor world anchor
   * @param taut 0 = slack … 1 = taut
   * @param tension rope tension (N) for vibration
   */
  update(dt: number, camera: Camera, hand: Vector3 | null, anchor: Vector3, taut: number, tension: number): void {
    this.t += dt;
    if (hand) {
      if (!this.active) this.fire();
      this.active = true;
      this.from.copy(hand);
      this.to.copy(anchor);
      const was = this.shoot;
      // the strand flies out at a finite speed (~0.08 s for a typical 35 m web)
      this.shoot = Math.min(1, this.shoot + (dt * 450) / Math.max(8, hand.distanceTo(anchor)));
      if (was < 1 && this.shoot >= 1) this.puffT = 0; // it hit: a small burst of silk at the anchor
    } else {
      if (this.active) this.release();
      this.active = false;
      this.linger -= dt;
      if (this.linger <= 0) {
        this.mesh.visible = false;
        return;
      }
      // released web recoils toward the anchor and falls
      this.from.lerp(this.to, dt * 6);
      this.from.y -= dt * 4;
    }
    this.mesh.visible = true;
    const a = this.from, b = this._b.copy(a).lerp(this.to, this.shoot);
    const len = a.distanceTo(b);
    const sag = (1 - taut) * Math.min(3, len * 0.08) + (hand ? 0 : 1.5);
    const vib = Math.min(0.06, tension / 200000) * Math.sin(this.t * 90);
    const cam = camera.position;
    const w = this.width * (hand ? 1 : Math.max(0.3, this.linger / 0.28));
    // world size of one pixel per metre of distance, so far segments never thin below a pixel
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 60;
    const pxPerM = (2 * Math.tan((fov * Math.PI) / 360)) / WebLine.viewportH;
    this.updatePuff(dt, camera);
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      const p = this._a.copy(a).lerp(b, u);
      const bow = 4 * u * (1 - u);
      p.y -= sag * bow;
      p.x += vib * bow;
      // side vector ⟂ to line and to the view direction
      const tangent = this._s.subVectors(b, a).normalize();
      const view = this._view.subVectors(cam, p).normalize();
      const dist = p.distanceTo(cam);
      const half = Math.max(w * (0.55 + 0.45 * (1 - u)), dist * pxPerM * 0.6);
      const side = tangent.cross(view).normalize().multiplyScalar(half);
      const o = i * 6;
      this.pos[o] = p.x + side.x; this.pos[o + 1] = p.y + side.y; this.pos[o + 2] = p.z + side.z;
      this.pos[o + 3] = p.x - side.x; this.pos[o + 4] = p.y - side.y; this.pos[o + 5] = p.z - side.z;
    }
    (this.geo.attributes.position as BufferAttribute).needsUpdate = true;
  }

  private updatePuff(dt: number, camera: Camera): void {
    this.puffT += dt / 0.28;
    const on = this.puffT < 1;
    this.puff.visible = on;
    if (!on) return;
    const k = this.puffT;
    const size = 0.6 + 2.6 * k;
    this.puff.position.copy(this.to);
    this.puff.quaternion.copy(camera.quaternion);
    this.puff.scale.setScalar(size);
    (this.puff.material as MeshBasicMaterial).opacity = (1 - k) * (1 - k);
  }
}
