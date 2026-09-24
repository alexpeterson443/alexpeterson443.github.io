import { PerspectiveCamera, Vector3 } from 'three';
import { T } from '../core/tuning';
import { clamp, damp, hlen, lerp, smoothstep, wrapAngle } from '../core/math';
import { Kind, makeHit, type Contact, type CollisionWorld } from '../world/CollisionWorld';
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
 * Scalar second-order spring (x'' = ω²(target − x) − 2ζω x'), sub-stepped so it stays stable
 * and frame-rate independent at any dt. Impulses on `v` give the "kick then settle" shapes.
 */
class Spring {
  x = 0;
  v = 0;
  step(target: number, omega: number, zeta: number, dt: number): number {
    const n = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.v += (omega * omega * (target - this.x) - 2 * zeta * omega * this.v) * h;
      this.x += this.v * h;
    }
    return this.x;
  }
  reset(x = 0): void {
    this.x = x;
    this.v = 0;
  }
}

const AIR_STATES: ReadonlySet<StateId> = new Set<StateId>(['Airborne', 'Trick', 'PointLaunch', 'WebZip', 'Swinging']);

/**
 * Third-person traversal camera. The player owns yaw/pitch; on top of that the camera layers
 * speed-driven distance/FOV, a velocity-matched follow spring (lag on acceleration, then a
 * catch-up), a web-attach "heartbeat" (FOV kick + drag-back), pitch that follows the swing arc,
 * a downward tilt in high dives, roll into turns, delayed auto-follow behind the hero, and a
 * collision solver that slides along walls and eases in before occluders instead of popping.
 */
export class TraversalCamera {
  readonly camera: PerspectiveCamera;
  /** Player-controlled yaw/pitch (mouse/stick). Gameplay maps the stick with `yaw`. */
  yaw = 0;
  pitch = -0.15;
  /** Rendered yaw: follows `yaw` 1:1 for mouse input and smoothly for external/auto changes. */
  private viewYaw = 0;
  private viewYawV = 0;
  /** Contextual pitch layered on the player's pitch (arc tangent, dive tilt). */
  private autoPitch = 0;
  private renderPitch = -0.15;
  private readonly focus = new Vector3();
  private readonly focusV = new Vector3();
  private readonly lastVel = new Vector3();
  private readonly travel = new Vector3(0, 0, -1);
  private dist = 5;
  private fov = 62;
  private roll = 0;
  private lead = 0;
  private frameY = 0;
  private readonly kick = new Spring(); // FOV heartbeat (degrees)
  private readonly drag = new Spring(); // web-attach drag-back (m)
  private readonly dip = new Spring(); // landing dip (m)
  private collDist = 50;
  private trauma = 0;
  private t = 0;
  private sinceLook = 10;
  private lastKick = -10;
  private groundY = 0;
  private probeT = 0;
  private initialized = false;
  readonly forward = new Vector3();
  /** Diagnostics for tests/debug: last solved values. */
  readonly debug = { fov: 62, dist: 5, roll: 0, pitch: 0, collided: false, kick: 0, drag: 0 };
  private readonly hit = makeHit();
  private readonly contacts: Contact[] = [];
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();
  private readonly _c = new Vector3();
  private readonly _d = new Vector3();
  private readonly _r = new Vector3();
  private readonly _u = new Vector3();
  private readonly _tgt = new Vector3();

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(62, aspect, 0.1, 3000);
  }

  addTrauma(x: number): void {
    this.trauma = Math.min(1, this.trauma + x);
  }

  landingDip(impact: number): void {
    this.dip.v -= Math.min(6, impact * 0.18);
  }

  /**
   * Web-attach "heartbeat": a quick FOV widening with a slight dip and drag-back that the
   * follow then accelerates out of. Called on each new swing (deduplicated, so routing the
   * player event as well as detecting the state change is harmless).
   */
  onWebAttach(speed: number): void {
    if (this.t - this.lastKick < 0.25) return;
    this.lastKick = this.t;
    const C = T.camera;
    const s = smoothstep(C.speedMin, C.fovSpeedRef, speed);
    // underdamped (ω 16, ζ 0.55) peak ≈ 0.52·v/ω ; critically damped (ω 6.5) peak = v/(ω·e)
    this.kick.v += (C.attachFovKick * (0.45 + 0.55 * s) * 16) / 0.522;
    this.drag.v += C.attachDragBack * (0.35 + 0.65 * s) * 6.5 * Math.E;
  }

  look(dx: number, dy: number): void {
    if (dx !== 0 || dy !== 0) this.sinceLook = 0;
    this.yaw -= dx;
    this.viewYaw -= dx; // mouse input is never smoothed
    this.pitch = clamp(this.pitch - dy, -1.35, 1.1);
  }

  snapTo(pos: Vector3, yaw: number): void {
    this.yaw = this.viewYaw = yaw;
    this.viewYawV = 0;
    this.focus.copy(pos);
    this.focus.y += T.camera.height;
    this.focusV.set(0, 0, 0);
    this.travel.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    this.kick.reset();
    this.drag.reset();
    this.dip.reset();
    this.autoPitch = 0;
    this.frameY = 0;
    this.lead = 0;
    this.collDist = 50;
    this.initialized = true;
  }

  update(dt: number, f: CameraFrame, world: CollisionWorld): void {
    this.t += dt;
    this.sinceLook += dt;
    const C = T.camera;
    const speed = f.vel.length();
    const hs = hlen(f.vel);
    const sFast = smoothstep(C.speedMin, C.fovSpeedRef, speed);
    const air = AIR_STATES.has(f.state);
    const vertWall = f.state === 'WallRunning' && f.wallMode === 'vertical';

    // ground under the hero (for the dive tilt), a few times a second
    this.probeT -= dt;
    if (this.probeT <= 0) {
      this.probeT = 0.1;
      this.groundY = world.heightBelow(this._a.copy(f.pos), 600);
    }
    const altitude = f.pos.y - 0.9 - this.groundY;

    // smoothed horizontal heading (pendulum wobble and bumps don't swing the follow around)
    if (hs > 1) {
      const k = damp(3.5, dt);
      this.travel.x += (f.vel.x / hs - this.travel.x) * k;
      this.travel.z += (f.vel.z / hs - this.travel.z) * k;
      this.travel.y = 0;
      if (this.travel.lengthSq() > 1e-6) this.travel.normalize();
    }

    // --- auto-follow: rotate behind the hero after a short time without look input ---
    const idle = smoothstep(C.autoFollowDelay, C.autoFollowDelay + 1.0, this.sinceLook);
    const moving = air || f.state === 'Landing' || (f.state === 'WallRunning' && f.wallMode === 'horizontal') || (f.state === 'Grounded' && hs > 4);
    if (moving && idle > 0 && hs > 3) {
      const targetYaw = Math.atan2(-this.travel.x, -this.travel.z);
      const diff = wrapAngle(targetYaw - this.yaw);
      // coming straight at the camera: turn round slowly rather than whip-pan
      const back = smoothstep(2.0, 2.9, Math.abs(diff));
      const rate = C.autoRecenter * idle * smoothstep(3, 18, hs) * (1 - 0.7 * back);
      this.yaw += diff * damp(rate, dt);
    }
    if (vertWall && this.sinceLook > 0.5) {
      // climbing: square up to the facade and look up it
      const wallYaw = Math.atan2(f.wallNormal.x, f.wallNormal.z);
      this.yaw += wrapAngle(wallYaw - this.yaw) * damp(3, dt);
      this.pitch += (0.5 - this.pitch) * damp(2.5, dt);
    } else if ((moving || speed > 3) && idle > 0) {
      // drift back to the rest pitch while travelling (never needs horizontal speed: a
      // straight drop after a climb must not stay looking at the sky)
      this.pitch += (C.pitchRest - this.pitch) * damp(1.3 * idle, dt);
    }

    // rendered yaw chases the logical yaw (auto-follow, scripted/bench yaw) critically damped
    {
      const n = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / n, w = C.yawFollow;
      for (let i = 0; i < n; i++) {
        const diff = wrapAngle(this.yaw - this.viewYaw);
        this.viewYawV += (w * w * diff - 2 * w * this.viewYawV) * h;
        this.viewYaw += this.viewYawV * h;
      }
      this.viewYaw = this.yaw - wrapAngle(this.yaw - this.viewYaw);
    }

    // --- contextual pitch: follow the arc tangent, tilt down to show the ground in dives ---
    const vPitch = Math.atan2(f.vel.y, Math.max(hs, 2));
    let wantAuto = 0;
    if (f.state === 'Swinging') {
      wantAuto = clamp(vPitch * C.arcPitch, -0.2, 0.15) * smoothstep(6, 18, speed);
    } else if (air) {
      const fall = smoothstep(-6, -30, f.vel.y);
      const high = smoothstep(8, 40, altitude);
      const tilt = Math.max(f.diving ? 1 : 0, fall * 0.7) * high;
      wantAuto = clamp(vPitch * C.arcPitch * 0.5, -0.1, 0.1) * (1 - tilt) - C.diveTilt * tilt;
    }
    this.autoPitch += (wantAuto - this.autoPitch) * damp(2.2, dt);
    const autoW = smoothstep(0.15, 0.9, this.sinceLook);
    this.renderPitch = clamp(this.pitch + this.autoPitch * autoW, -1.4, 1.15);

    // --- focus: velocity-matched spring → no steady lag, lags on acceleration then catches up ---
    const tgt = this._tgt.copy(f.pos);
    tgt.y += C.height;
    // horizontal look-ahead: more room in front of the hero at speed
    if (hs > 0.5) {
      const la = Math.min(C.lookAhead * hs * 0.1, 1.6);
      tgt.x += (f.vel.x / hs) * la;
      tgt.z += (f.vel.z / hs) * la;
    }
    // the hero rides the arc in the frame: sinks while dropping, climbs while rising
    const wantFrameY = clamp(-f.vel.y * C.arcFrame, -0.75, 0.8) * (vertWall ? 0 : 1);
    this.frameY += (wantFrameY - this.frameY) * damp(3, dt);
    tgt.y += this.frameY;
    if (!this.initialized) { this.focus.copy(tgt); this.focusV.copy(f.vel); this.initialized = true; }
    {
      const n = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / n;
      const wh = C.followFreq, wv = C.followFreqV, z = C.followDamping;
      const fo = this.focus, fv = this.focusV, v = f.vel;
      // an impact (wall run start, hard landing) changes the body's velocity in one step; the
      // spring must not coast on through the hero into the wall, so it adopts the new velocity
      const jump = Math.hypot(v.x - this.lastVel.x, v.y - this.lastVel.y, v.z - this.lastVel.z);
      if (jump > 10) fv.copy(v);
      this.lastVel.copy(v);
      for (let i = 0; i < n; i++) {
        fv.x += (wh * wh * (tgt.x - fo.x) + 2 * z * wh * (v.x - fv.x)) * h;
        fv.z += (wh * wh * (tgt.z - fo.z) + 2 * z * wh * (v.z - fv.z)) * h;
        fv.y += (wv * wv * (tgt.y - fo.y) + 2 * z * wv * (v.y - fv.y)) * h;
        fo.addScaledVector(fv, h);
      }
      // bounded lag keeps the hero readable at 100+ mph; the excess is removed softly
      const off = this._a.subVectors(fo, tgt);
      const oh = Math.hypot(off.x, off.z);
      if (oh > C.maxLag) {
        const k = C.maxLag / oh;
        fo.x = tgt.x + off.x * k;
        fo.z = tgt.z + off.z * k;
        const ox = off.x / oh, oz = off.z / oh;
        const rel = (fv.x - v.x) * ox + (fv.z - v.z) * oz;
        if (rel > 0) { fv.x -= rel * ox; fv.z -= rel * oz; }
      }
      const maxV = C.maxLag * 0.6;
      if (Math.abs(off.y) > maxV) {
        fo.y = tgt.y + Math.sign(off.y) * maxV;
        if ((fv.y - v.y) * off.y > 0) fv.y = v.y;
      }
    }

    // the pivot may lag or lead the hero, but never into a building: look-ahead at speed toward a
    // facade would put it inside, and every collision ray would then start behind the wall
    {
      const base = this._a.set(f.pos.x, f.pos.y + C.height * 0.6, f.pos.z);
      const dir = this._d.subVectors(this.focus, base);
      const len = dir.length();
      if (len > 0.05) {
        dir.multiplyScalar(1 / len);
        if (world.raycast(base, dir, len + 0.35, this.hit, Kind.NoWeb)) {
          const keep = Math.max(0, this.hit.t - 0.35);
          if (keep < len) {
            this.focus.copy(base).addScaledVector(dir, keep);
            const vin = this.focusV.dot(dir);
            if (vin > 0) this.focusV.addScaledVector(dir, -vin);
          }
        }
      }
    }

    // --- web-attach heartbeat & landing dip springs ---
    this.kick.step(0, 16, 0.55, dt);
    this.drag.step(0, 6.5, 1, dt);
    this.dip.step(0, 7.75, 0.71, dt);

    // --- distance, FOV ---
    let wantDist = lerp(C.distance, C.distanceAtSpeed, sFast);
    if (f.state === 'Swinging') wantDist += 0.35;
    if (vertWall) wantDist += 1.0;
    if (f.state === 'Perching' || f.state === 'WallCrawling') wantDist -= 0.5;
    this.dist += (wantDist - this.dist) * damp(2.2, dt);
    const wantFov = lerp(C.fov, C.fovAtSpeed, sFast) + (f.diving ? 3 * smoothstep(25, 70, speed) : 0);
    this.fov += (wantFov - this.fov) * damp(2.5, dt);
    const fovNow = clamp(this.fov + this.kick.x, 40, 100);
    // half dolly-zoom on the kick: the city rushes outward while the hero shrinks only a little
    const dolly = Math.pow(Math.tan((this.fov * Math.PI) / 360) / Math.tan((fovNow * Math.PI) / 360), 0.5);
    const distNow = this.dist * dolly + this.drag.x;

    // --- basis ---
    const cy = Math.cos(this.viewYaw), sy = Math.sin(this.viewYaw);
    const cp = Math.cos(this.renderPitch), sp = Math.sin(this.renderPitch);
    const fwd = this.forward.set(-sy * cp, sp, -cy * cp);
    const right = this._r.set(cy, 0, -sy);
    const up = this._u.crossVectors(right, fwd).normalize();

    // --- roll into turns / sideways rope pull (lateral acceleration in camera space) ---
    const aLat = clamp(f.acc.x * right.x + f.acc.z * right.z, -45, 45);
    const wantRoll = clamp(-aLat * C.rollAmount * 0.0045, -C.rollMax, C.rollMax) * smoothstep(6, 22, speed) * (vertWall ? 0 : 1);
    this.roll += (wantRoll - this.roll) * damp(3.2, dt);
    // look-target lead toward where the hero is heading across the screen
    const vLat = f.vel.x * right.x + f.vel.z * right.z;
    this.lead += (clamp(vLat * 0.04, -1.1, 1.1) - this.lead) * damp(2.5, dt);

    // --- desired position ---
    const pivot = this.focus;
    const desired = this._b.copy(pivot).addScaledVector(fwd, -distNow).addScaledVector(right, C.shoulder);
    desired.addScaledVector(up, this.dip.x - this.drag.x * 0.3);

    // --- collision: slide along walls, ease in ahead of occluders, never see through them ---
    this.debug.collided = false;
    const pushed = this._c.copy(desired);
    const nC = world.resolveSphere(pushed, 0.35, this.contacts, 0, Kind.NoWeb);
    if (nC > 0) this.debug.collided = true;
    const toCam = this._d.subVectors(pushed, pivot);
    const want = Math.max(0.01, toCam.length());
    toCam.multiplyScalar(1 / want);
    let hard = want;
    let soft = want;
    for (let k = 0; k < 5; k++) {
      // centre ray + 4 rays toward the corners of the near plane's neighbourhood (hard),
      // then a wider ring (soft) that only counts surfaces facing the line of sight
      const ox = k === 1 ? 1 : k === 2 ? -1 : 0, oy = k === 3 ? 1 : k === 4 ? -1 : 0;
      for (let pass = 0; pass < 2; pass++) {
        if (pass === 1 && k === 0) continue;
        const rad = pass === 0 ? 0.22 : 0.9;
        const end = this._a.copy(pushed).addScaledVector(right, ox * rad).addScaledVector(up, oy * rad);
        const dir = end.sub(pivot);
        const len = dir.length();
        dir.multiplyScalar(1 / len);
        if (world.raycast(pivot, dir, len + 0.3, this.hit, Kind.NoWeb)) {
          const tAlong = (this.hit.t - 0.3) * (want / len);
          if (pass === 0) hard = Math.min(hard, tAlong);
          else if (Math.abs(this.hit.normal.dot(toCam)) > 0.5) soft = Math.min(soft, tAlong + 0.2);
        }
      }
    }
    hard = Math.max(0.6, hard);
    soft = Math.max(0.6, soft);
    if (hard < want - 0.05) this.debug.collided = true;
    // ease toward the soft limit (in fast, out slow); the hard limit always wins
    const tSoft = Math.min(soft, want);
    this.collDist += (tSoft - this.collDist) * damp(tSoft < this.collDist ? 9 : 2.2, dt);
    this.collDist = Math.min(this.collDist, hard, want + 0.5);
    const d = Math.min(want, this.collDist, hard);
    const cam = this.camera;
    cam.position.copy(pivot).addScaledVector(toCam, d);

    // --- shake: trauma² × noise (mostly rotational), plus a faint rumble near top speed ---
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    const rumble = smoothstep(55, 95, speed) * 0.06;
    const sh = (this.trauma * this.trauma + rumble * rumble) * C.shake;
    const tt = this.t * 21;
    cam.position.addScaledVector(up, noise1(tt + 31.7) * sh * 0.12);
    const look = this._a.copy(pivot).addScaledVector(fwd, 6).addScaledVector(right, C.shoulder * 0.4 + this.lead);
    look.addScaledVector(right, noise1(tt) * sh * 0.35).addScaledVector(up, noise1(tt + 13.1) * sh * 0.3);
    cam.lookAt(look);
    cam.rotateZ(this.roll + noise1(tt + 77.3) * sh * 0.04);
    if (Math.abs(cam.fov - fovNow) > 0.01) {
      cam.fov = fovNow;
      cam.updateProjectionMatrix();
    }
    const dbg = this.debug;
    dbg.fov = fovNow; dbg.dist = d; dbg.roll = this.roll; dbg.pitch = this.renderPitch; dbg.kick = this.kick.x; dbg.drag = this.drag.x;
  }
}
