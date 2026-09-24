import { PerspectiveCamera, Vector3 } from 'three';
import { T } from '../core/tuning';
import { clamp, damp, hlen, lerp, smoothstep, wrapAngle } from '../core/math';
import { Kind, makeHit, type CollisionWorld } from '../world/CollisionWorld';
import type { StateId } from '../player/StateMachine';

export interface CameraFrame {
  pos: Vector3; // interpolated body position
  vel: Vector3;
  acc: Vector3; // smoothed acceleration
  state: StateId;
  wallNormal: Vector3;
  wallMode: 'vertical' | 'horizontal';
  ropeActive: boolean;
  anchor: Vector3;
  diving: boolean;
}

/** Cheap smooth 1D value noise for camera shake. */
function noise1(x: number): number {
  const i = Math.floor(x), f = x - i;
  const h = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}

/**
 * Third-person traversal camera. The player controls yaw/pitch; everything else (distance, FOV,
 * lag, look-ahead, roll, recentering, shake, landing dip) responds to the body's motion so speed
 * reads clearly without making the image unreadable.
 */
export class TraversalCamera {
  readonly camera: PerspectiveCamera;
  yaw = 0;
  pitch = -0.15;
  private readonly focus = new Vector3();
  private dist = 5;
  private collDist = 50;
  private fov = 62;
  private roll = 0;
  private trauma = 0;
  private dipY = 0;
  private dipV = 0;
  private t = 0;
  private sinceLook = 10;
  private initialized = false;
  readonly forward = new Vector3();
  private readonly hit = makeHit();
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();
  private readonly _r = new Vector3();

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(62, aspect, 0.1, 3000);
  }

  addTrauma(x: number): void {
    this.trauma = Math.min(1, this.trauma + x);
  }

  landingDip(impact: number): void {
    this.dipV -= Math.min(6, impact * 0.18);
  }

  look(dx: number, dy: number): void {
    if (dx !== 0 || dy !== 0) this.sinceLook = 0;
    this.yaw -= dx;
    this.pitch = clamp(this.pitch - dy, -1.35, 1.1);
  }

  snapTo(pos: Vector3, yaw: number): void {
    this.yaw = yaw;
    this.focus.copy(pos);
    this.initialized = true;
  }

  update(dt: number, f: CameraFrame, world: CollisionWorld): void {
    this.t += dt;
    this.sinceLook += dt;
    const C = T.camera;
    const speed = f.vel.length();
    const hs = hlen(f.vel);
    const sFast = smoothstep(10, C.fovSpeedRef, speed);

    // --- auto recenter behind travel at speed (never fights active mouse input) ---
    const traversing = f.state === 'Swinging' || f.state === 'Airborne' || f.state === 'Trick' || f.state === 'WebZip' || f.state === 'PointLaunch' || (f.state === 'WallRunning' && f.wallMode === 'horizontal') || (f.state === 'Grounded' && hs > 9);
    if (traversing && this.sinceLook > 0.9 && hs > 7) {
      const targetYaw = Math.atan2(-f.vel.x, -f.vel.z);
      const k = damp(C.autoRecenter * smoothstep(7, 35, hs) * smoothstep(0.9, 2.0, this.sinceLook), dt);
      this.yaw += wrapAngle(targetYaw - this.yaw) * k;
      const pitchTarget = f.state === 'Swinging' ? -0.1 : f.diving ? -0.45 : -0.18;
      this.pitch += (pitchTarget - this.pitch) * k * 0.6;
    }
    if (f.state === 'WallRunning' && f.wallMode === 'vertical' && this.sinceLook > 0.5) {
      // look up the facade while climbing
      this.pitch += (0.55 - this.pitch) * damp(2.5, dt);
      const wallYaw = Math.atan2(f.wallNormal.x, f.wallNormal.z);
      this.yaw += wrapAngle(wallYaw - this.yaw) * damp(3, dt);
    }

    // --- focus with lag + velocity look-ahead ---
    const target = this._a.copy(f.pos);
    target.y += C.height;
    const la = this._b.copy(f.vel).multiplyScalar(C.lookAhead * 0.1);
    if (la.length() > 3.5) la.setLength(3.5);
    target.add(la);
    if (!this.initialized) { this.focus.copy(target); this.initialized = true; }
    const lagH = damp(C.lag * lerp(1, 0.75, sFast), dt);
    const lagV = damp(C.lag * 1.4, dt);
    this.focus.x += (target.x - this.focus.x) * lagH;
    this.focus.z += (target.z - this.focus.z) * lagH;
    this.focus.y += (target.y - this.focus.y) * lagV;
    // never let lag leave the body more than a few metres behind (readability at 90 m/s)
    const off = this._b.subVectors(this.focus, target);
    if (off.length() > 4) this.focus.copy(target).add(off.setLength(4));

    // --- landing dip (spring) ---
    this.dipV += (-60 * this.dipY - 11 * this.dipV) * dt;
    this.dipY += this.dipV * dt;

    // --- distance, FOV, roll ---
    let wantDist = lerp(C.distance, C.distanceAtSpeed, sFast);
    if (f.state === 'Swinging') wantDist += 0.6;
    if (f.state === 'WallRunning' && f.wallMode === 'vertical') wantDist += 1.2;
    if (f.state === 'Perching' || f.state === 'WallCrawling') wantDist -= 0.6;
    this.dist += (wantDist - this.dist) * damp(2.5, dt);
    const wantFov = lerp(C.fov, C.fovAtSpeed, sFast) + (f.diving ? 5 * smoothstep(20, 70, speed) : 0);
    this.fov += (wantFov - this.fov) * damp(3, dt);

    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const fwd = this.forward.set(-sy * cp, sp, -cy * cp);
    const right = this._r.set(cy, 0, -sy);
    // lateral acceleration in camera space → roll into turns/swings
    const aLat = f.acc.x * right.x + f.acc.z * right.z;
    const wantRoll = clamp(-aLat * 0.0045 * C.rollAmount, -0.13, 0.13) * smoothstep(6, 25, speed);
    this.roll += (wantRoll - this.roll) * damp(4, dt);

    // --- place camera, pull in on collision ---
    const shoulder = 0.45;
    const desired = this._b.copy(this.focus).addScaledVector(fwd, -this.dist).addScaledVector(right, shoulder);
    desired.y += this.dipY;
    const toCam = this._a.subVectors(desired, this.focus);
    const want = toCam.length();
    toCam.multiplyScalar(1 / want);
    let allowed = want;
    if (world.raycast(this.focus, toCam, want + 0.3, this.hit, Kind.NoWeb)) allowed = Math.max(0.6, this.hit.t - 0.35);
    // pull in fast, ease back out
    this.collDist = allowed < this.collDist ? allowed : this.collDist + (allowed - this.collDist) * damp(3, dt);
    const d = Math.min(want, this.collDist);
    const cam = this.camera;
    cam.position.copy(this.focus).addScaledVector(toCam, d);

    // --- shake: trauma² × noise, plus a faint high-speed rumble ---
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const rumble = smoothstep(50, 90, speed) * 0.08;
    const sh = (this.trauma * this.trauma + rumble * rumble) * C.shake;
    const tt = this.t * 22;
    cam.position.x += noise1(tt) * sh * 0.5;
    cam.position.y += noise1(tt + 31.7) * sh * 0.5;

    cam.lookAt(this._a.copy(this.focus).addScaledVector(fwd, 5).addScaledVector(right, shoulder * 0.5));
    cam.rotateZ(this.roll + noise1(tt + 77.3) * sh * 0.05);
    if (Math.abs(cam.fov - this.fov) > 0.01) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
  }
}
