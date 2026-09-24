import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial,
  Vector3, type Camera, type Scene,
} from 'three';

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
  width = 0.035;

  constructor(scene: Scene, color = new Color(0.92, 0.95, 1.0)) {
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    const idx: number[] = [];
    for (let i = 0; i < SEG; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geo.setIndex(idx);
    const mat = new MeshBasicMaterial({ color, side: DoubleSide, transparent: true, opacity: 0.95, depthWrite: false });
    mat.color.multiplyScalar(1.6); // slight HDR so it catches bloom
    this.mesh = new Mesh(this.geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    scene.add(this.mesh);
    void AdditiveBlending;
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
      this.shoot = Math.min(1, this.shoot + dt / 0.07);
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
    const w = this.width * (hand ? 1 : Math.max(0.2, this.linger / 0.28));
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      const p = this._a.copy(a).lerp(b, u);
      const bow = 4 * u * (1 - u);
      p.y -= sag * bow;
      p.x += vib * bow;
      // side vector ⟂ to line and to the view direction
      const tangent = this._s.subVectors(b, a).normalize();
      const view = this._view.subVectors(cam, p).normalize();
      const side = tangent.cross(view).normalize().multiplyScalar(w * (0.6 + 0.4 * (1 - u)));
      const o = i * 6;
      this.pos[o] = p.x + side.x; this.pos[o + 1] = p.y + side.y; this.pos[o + 2] = p.z + side.z;
      this.pos[o + 3] = p.x - side.x; this.pos[o + 4] = p.y - side.y; this.pos[o + 5] = p.z - side.z;
    }
    (this.geo.attributes.position as BufferAttribute).needsUpdate = true;
  }
}
