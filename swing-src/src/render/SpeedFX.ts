import {
  AdditiveBlending, BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Vector3,
  type Camera, type Scene,
} from 'three';
import { smoothstep } from '../core/math';

const COUNT = 220;
const BOX = 26; // m: streaks live in a cube this wide around the camera

/**
 * Air streaks that only appear at high speed: short world-space line segments scattered around the
 * camera, each stretched backwards along the hero's velocity, fading in above ~70% of top speed.
 * They respawn ahead of the camera as it passes them, so the field is endless and allocation-free.
 */
export class SpeedFX {
  private readonly pts = new Float32Array(COUNT * 3);
  private readonly pos = new Float32Array(COUNT * 2 * 3);
  private readonly col = new Float32Array(COUNT * 2 * 3);
  private readonly geo = new BufferGeometry();
  private readonly mat: LineBasicMaterial;
  readonly mesh: LineSegments;
  private readonly _d = new Vector3();
  private seed = 1;
  private strength = 0;

  constructor(scene: Scene) {
    for (let i = 0; i < COUNT; i++) {
      this.pts[i * 3] = (this.rand() - 0.5) * BOX;
      this.pts[i * 3 + 1] = (this.rand() - 0.5) * BOX;
      this.pts[i * 3 + 2] = (this.rand() - 0.5) * BOX;
    }
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new BufferAttribute(this.col, 3));
    this.mat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false });
    this.mesh = new LineSegments(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
    scene.add(this.mesh);
  }

  private rand(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  /** @param vel hero velocity (m/s); @param topSpeed speed at which the effect is at full strength */
  update(dt: number, camera: Camera, vel: Vector3, topSpeed = 50): void {
    const speed = vel.length();
    const want = smoothstep(topSpeed * 0.7, topSpeed, speed);
    this.strength += (want - this.strength) * Math.min(1, dt * 4);
    this.mesh.visible = this.strength > 0.01;
    if (!this.mesh.visible) return;
    this.mat.opacity = this.strength * 0.55;
    const c = camera.position;
    const half = BOX / 2;
    const d = this._d.copy(vel).multiplyScalar(1 / Math.max(speed, 1e-3));
    const len = Math.min(4, speed * 0.06);
    for (let i = 0; i < COUNT; i++) {
      const o = i * 3;
      // wrap each streak into the box around the camera (so it reappears ahead once passed)
      let x = this.pts[o], y = this.pts[o + 1], z = this.pts[o + 2];
      x = ((((x - c.x + half) % BOX) + BOX) % BOX) - half + c.x;
      y = ((((y - c.y + half) % BOX) + BOX) % BOX) - half + c.y;
      z = ((((z - c.z + half) % BOX) + BOX) % BOX) - half + c.z;
      this.pts[o] = x; this.pts[o + 1] = y; this.pts[o + 2] = z;
      // keep streaks off the lens: fade those within 2.5 m of the camera
      const dx = x - c.x, dy = y - c.y, dz = z - c.z;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const a = smoothstep(2.5, 5, r) * (1 - smoothstep(half * 0.7, half, r));
      const p = i * 6;
      this.pos[p] = x; this.pos[p + 1] = y; this.pos[p + 2] = z;
      this.pos[p + 3] = x - d.x * len; this.pos[p + 4] = y - d.y * len; this.pos[p + 5] = z - d.z * len;
      this.col[p] = this.col[p + 1] = this.col[p + 2] = a;
      this.col[p + 3] = this.col[p + 4] = this.col[p + 5] = 0;
    }
    (this.geo.attributes.position as BufferAttribute).needsUpdate = true;
    (this.geo.attributes.color as BufferAttribute).needsUpdate = true;
  }
}
