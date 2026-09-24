import { Matrix4, Quaternion, Vector3, type Object3D } from 'three';
import { clamp, damp, hlen, lerp, smoothstep } from '../core/math';
import { T } from '../core/tuning';
import type { StateId } from '../player/StateMachine';
import { J, POSE_SIZE, setNeutral, type Pose } from './Pose';
import { Rig } from './Rig';
import { solveTwoBone } from './IK';

/** Everything the animation layer reads from the simulation (it never writes back). */
export interface AnimFrame {
  pos: Vector3;
  vel: Vector3;
  acc: Vector3;
  state: StateId;
  stateTime: number;
  facing: number;
  ropeActive: boolean;
  anchor: Vector3;
  swingAngle: number;
  tension: number;
  zipTarget: Vector3;
  wallNormal: Vector3;
  wallMode: 'vertical' | 'horizontal';
  trickKind: number;
  landingImpact: number;
  diving: boolean;
  jumpCharge: number;
  releaseQuality: number;
  camForward: Vector3;
}

/** Channels this animator layers on top of the shared pose layout. */
const X = { chestRoll: POSE_SIZE, headRoll: POSE_SIZE + 1 } as const;
const N = POSE_SIZE + 2;
const newX = (): Pose => new Float32Array(N);

const UP = new Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const COM_TO_WALL = 0.43; // body centre stand-off from a facade while on it (capsule radius + skin)

/** Inertialization time into each state (s). */
const BLEND_IN: Partial<Record<StateId, number>> = {
  Grounded: 0.24, Airborne: 0.32, Swinging: 0.26, WebZip: 0.16, PointLaunch: 0.14, Perching: 0.22,
  WallRunning: 0.2, WallCrawling: 0.28, Vaulting: 0.12, Mantling: 0.14, Landing: 0.12, Recovery: 0.12, Trick: 0.16,
};

/**
 * Inertialization (quintic offset decay, as in "Inertialization: High-Performance Animation
 * Transitions", Bollo 2018): at a transition the difference between the outgoing pose (and its
 * velocity) and the new state's pose is recorded, then decayed to zero with continuous position,
 * velocity and acceleration. Unlike a cross-fade from a frozen snapshot, nothing ever pops, and a
 * transition that interrupts another starts from wherever the body actually is.
 */
class Inertializer {
  private readonly x0 = new Float32Array(N);
  private readonly v0 = new Float32Array(N);
  private readonly a0 = new Float32Array(N);
  private readonly A = new Float32Array(N);
  private readonly B = new Float32Array(N);
  private readonly C = new Float32Array(N);
  private readonly t1 = new Float32Array(N);
  private t = 1e9;

  start(prev: Pose, vel: Pose, target: Pose, dur: number, dt: number): void {
    for (let i = 0; i < N; i++) {
      let x = prev[i] + vel[i] * dt - target[i];
      let v = clamp(vel[i], -40, 40);
      if (Math.abs(x) < 1e-5) { this.t1[i] = 0; continue; }
      const s = x < 0 ? -1 : 1;
      x *= s; v *= s;
      if (v > 0) v = 0; // heading away from the target: start from rest so it never overshoots
      let t1 = dur;
      if (v < 0) t1 = Math.min(t1, (-5 * x) / v);
      t1 = Math.max(t1, 1e-3);
      const a0 = Math.max(0, (-8 * v * t1 - 20 * x) / (t1 * t1));
      const t2 = t1 * t1, t3 = t2 * t1, t4 = t3 * t1, t5 = t4 * t1;
      this.A[i] = (s * -(a0 * t2 + 6 * v * t1 + 12 * x)) / (2 * t5);
      this.B[i] = (s * (3 * a0 * t2 + 16 * v * t1 + 30 * x)) / (2 * t4);
      this.C[i] = (s * -(3 * a0 * t2 + 12 * v * t1 + 20 * x)) / (2 * t3);
      this.a0[i] = s * a0;
      this.v0[i] = s * v;
      this.x0[i] = s * x;
      this.t1[i] = t1;
    }
    this.t = 0;
  }

  /** out = target + decaying offset. Call once per frame after `start`/previous apply. */
  apply(out: Pose, dt: number, advance: boolean): void {
    if (advance) this.t += dt;
    const t = this.t;
    for (let i = 0; i < N; i++) {
      if (t >= this.t1[i]) continue;
      const t2 = t * t, t3 = t2 * t;
      out[i] += this.A[i] * t3 * t2 + this.B[i] * t2 * t2 + this.C[i] * t3 + 0.5 * this.a0[i] * t2 + this.v0[i] * t + this.x0[i];
    }
  }
}

/** Scalar spring (secondary motion). */
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
}

/** An additive whole-body rotation (flip, twist, roll) on its own clock, so it always completes. */
interface Spin {
  active: boolean;
  t: number;
  dur: number;
  axis: 0 | 1 | 2; // local x (flip), y (twist), z (corkscrew)
  sign: number;
  tuck: number;
  speed: number;
}

/** One crawl limb planted on the wall by IK. */
interface Limb {
  planted: Vector3;
  from: Vector3;
  to: Vector3;
  t: number;
  stepping: boolean;
}

/**
 * Procedural animation. Per frame: state pose (from the physics: rope angle, g-load, speeds) →
 * inertialized transitions → additive springs (landing compression, overlapping limbs) → root
 * orientation from the physics (rope line, flight path, wall) plus additive flips/rolls → FK →
 * weighted IK (web hand locked on the anchor, zip hands, crawl limbs planted on the facade, hands
 * on perch/ground) → head look. The controller owns the trajectory; this only interprets it.
 */
export class Animator {
  readonly pose = newX();
  private readonly target = newX();
  private readonly inert = new Inertializer();
  private readonly inertOut = newX();
  private readonly inertPrev = newX();
  private readonly inertVel = newX();
  private lastState: StateId | null = null;
  private pendingBlend = 0;
  private phase = 0;
  private locoSpeed = 0;
  private landDip = 0;
  private landDipV = 0;
  private breath = 0;
  private time = 0;
  // smoothed switches (binary sim flags must never pop the pose)
  private diveW = 0;
  private tuckW = 0;
  private swingSide = 0;
  private relT = 10;
  private relKind: 'spread' | 'flip' | 'none' = 'none';
  private relStrength = 0;
  private releases = 0;
  private readonly legLag = new Spring();
  private readonly legLagR = new Spring();
  private readonly armLag = new Spring();
  /** smoothed root orientation (without additive spins) */
  readonly bodyQuat = new Quaternion();
  private readonly prevBodyQuat = new Quaternion();
  private readonly targetQuat = new Quaternion();
  private readonly spinQuat = new Quaternion();
  private readonly rootOffset = new Vector3();
  private readonly spin: Spin = { active: false, t: 0, dur: 0.6, axis: 0, sign: 1, tuck: 1, speed: 1 };
  private queuedSpin: Spin | null = null;
  private readonly m4 = new Matrix4();
  private readonly _f = new Vector3();
  private readonly _u = new Vector3();
  private readonly _l = new Vector3();
  private readonly _t = new Vector3();
  private readonly _p = new Vector3();
  private readonly _v = new Vector3();
  private readonly _w = new Vector3();
  private readonly _o = new Vector3();
  private readonly _q = new Quaternion();
  /** which hand holds the current web */
  private webHand: 'L' | 'R' = 'R';
  // IK weights (0..1) and their targets
  private ikL = 0;
  private ikR = 0;
  private readonly ikTargetL = new Vector3();
  private readonly ikTargetR = new Vector3();
  private reachT = 1;
  private zipW = 0;
  private perchW = 0;
  private recoverW = 0;
  private crawlW = 0;
  private lookW = 0;
  private readonly lookDir = new Vector3(0, 0, -1);
  private readonly limbs: Limb[] = Array.from({ length: 4 }, () => ({ planted: new Vector3(), from: new Vector3(), to: new Vector3(), t: 0, stepping: false }));
  private readonly crawlNormal = new Vector3();
  private crawlPhase = 0;
  /** footstep/wall-step events produced this frame (consumed by audio) */
  readonly steps: { wall: boolean; speed: number }[] = [];
  private readonly tmpPose = newX();

  constructor(readonly rig: Rig) {
    setNeutral(this.pose);
    setNeutral(this.inertPrev);
  }

  update(dt: number, f: AnimFrame): void {
    this.steps.length = 0;
    this.time += dt;
    this.breath += dt;
    this.relT += dt;
    const st = f.state;
    if (st !== this.lastState) this.onEnter(st, this.lastState, f);

    // smoothed flags
    this.diveW += ((f.diving ? 1 : 0) - this.diveW) * damp(7, dt);
    this.advanceSpin(dt);

    const target = this.target;
    setNeutral(target);
    target[X.chestRoll] = 0;
    target[X.headRoll] = 0;
    this.buildStatePose(dt, f, target);

    // inertialized transition
    const out = this.inertOut;
    out.set(target);
    if (this.pendingBlend > 0) {
      this.inert.start(this.inertPrev, this.inertVel, target, this.pendingBlend, dt);
      this.pendingBlend = 0;
      this.inert.apply(out, dt, false);
    } else this.inert.apply(out, dt, true);
    const idt = 1 / Math.max(dt, 1e-4);
    for (let i = 0; i < N; i++) {
      this.inertVel[i] = (out[i] - this.inertPrev[i]) * idt;
      this.inertPrev[i] = out[i];
    }
    const p = this.pose;
    p.set(out);

    // additive: landing compression spring
    this.landDipV += (-120 * this.landDip - 16 * this.landDipV) * dt;
    this.landDip += this.landDipV * dt;
    const dip = Math.min(0, this.landDip);
    p[J.hipY] += dip * 0.35;
    p[J.lKnee] -= dip * 1.4; p[J.rKnee] -= dip * 1.4;
    p[J.lThigh] -= dip * 0.8; p[J.rThigh] -= dip * 0.8;
    p[J.spinePitch] -= dip * 0.5;
    p[J.lArmOut] -= dip * 0.4; p[J.rArmOut] -= dip * 0.4;

    this.orient(dt, f);
    this.secondary(dt, f, p);
    this.applyPose();
    this.applyIK(dt, f);
  }

  // ---------------------------------------------------------------------------------------------
  private onEnter(st: StateId, prev: StateId | null, f: AnimFrame): void {
    this.lastState = st;
    if (prev !== null) this.pendingBlend = BLEND_IN[st] ?? 0.2;
    if (st === 'Swinging') {
      // hold the web with the hand on the anchor's side (alternating when it's dead ahead)
      const fwd = this._f.set(-Math.sin(f.facing), 0, -Math.cos(f.facing));
      if (hlen(f.vel) > 2) fwd.set(f.vel.x, 0, f.vel.z).normalize();
      const left = this._l.crossVectors(UP, fwd);
      const to = this._t.subVectors(f.anchor, f.pos);
      const side = to.dot(left) / Math.max(1, to.length());
      this.webHand = side > 0.12 ? 'L' : side < -0.12 ? 'R' : this.webHand === 'R' ? 'L' : 'R';
      this.reachT = 0;
      this.tuckW = 0;
    }
    if (st === 'Airborne' && prev === 'Swinging') this.onRelease(f);
    if (st === 'Trick') {
      const k = f.trickKind;
      this.startSpin(k <= 1 ? 0 : 2, k === 1 || k === 3 ? -1 : 1, T.air.trickDuration * 0.95, k <= 1 ? 1 : 0.5);
    }
    if (st === 'Landing') {
      if (this.spin.active) this.spin.speed = 4; // finish any flip quickly, then roll
      this.startSpin(0, 1, T.landing.rollTime, 1, true);
    }
    if (st === 'Grounded' && prev && prev !== 'Vaulting' && prev !== 'Mantling' && prev !== 'Landing' && prev !== 'Recovery') {
      this.landDipV -= Math.min(2.2, f.landingImpact * 0.09 + 0.3);
    }
    if (st === 'WallCrawling') this.initCrawl(f);
  }

  /** Release pose: steep launches flip, flat/forward launches open into a spread dive. */
  private onRelease(f: AnimFrame): void {
    const hs = hlen(f.vel);
    const pitch = Math.atan2(f.vel.y, Math.max(hs, 0.1));
    const speed = f.vel.length();
    this.relT = 0;
    this.relStrength = clamp(0.55 + f.releaseQuality * 0.45, 0, 1) * smoothstep(8, 20, speed);
    this.releases++;
    if (speed > 10 && pitch > (40 * Math.PI) / 180 && !this.spin.active) {
      this.relKind = 'flip';
      // alternate a front flip and a twisting layout for variety
      if (this.releases % 2 === 0) this.startSpin(0, 1, 0.62, 1);
      else this.startSpin(1, this.webHand === 'R' ? 1 : -1, 0.7, 0.35);
    } else this.relKind = speed > 8 ? 'spread' : 'none';
  }

  private startSpin(axis: 0 | 1 | 2, sign: number, dur: number, tuck: number, queueIfBusy = false): void {
    const s: Spin = { active: true, t: 0, dur, axis, sign, tuck, speed: 1 };
    if (this.spin.active) {
      if (queueIfBusy) this.queuedSpin = s;
      return;
    }
    Object.assign(this.spin, s);
  }

  private advanceSpin(dt: number): void {
    const s = this.spin;
    if (!s.active && this.queuedSpin) {
      Object.assign(s, this.queuedSpin);
      this.queuedSpin = null;
    }
    if (!s.active) { this.spinQuat.identity(); return; }
    s.t += dt * s.speed;
    if (s.t >= s.dur) {
      s.active = false;
      this.spinQuat.identity();
      if (this.queuedSpin) { Object.assign(s, this.queuedSpin); this.queuedSpin = null; }
      return;
    }
    const u = s.t / s.dur;
    // quick launch into the rotation, soft finish
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const ang = s.sign * TAU * e;
    this._l.set(s.axis === 0 ? 1 : 0, s.axis === 1 ? 1 : 0, s.axis === 2 ? 1 : 0);
    this.spinQuat.setFromAxisAngle(this._l, ang);
  }

  /** 0..1 tuck demanded by the current spin (peaks mid-rotation). */
  private spinTuck(): number {
    const s = this.spin;
    if (!s.active) return 0;
    return s.tuck * Math.sin(Math.PI * clamp(s.t / s.dur, 0, 1));
  }

  // ---------------------------------------------------------------------------------------------
  private buildStatePose(dt: number, f: AnimFrame, p: Pose): void {
    const hs = hlen(f.vel);
    const t = f.stateTime;
    switch (f.state) {
      case 'Grounded': {
        this.locomotion(dt, hs, p, false, f);
        if (f.jumpCharge > 0) {
          const c = clamp(f.jumpCharge / T.ground.superJumpChargeTime, 0, 1);
          this.crouch(p, 0.4 + c * 0.6);
          p[J.lArmOut] += c * 0.5; p[J.rArmOut] += c * 0.5;
          p[J.lShoulder] -= c * 0.4; p[J.rShoulder] -= c * 0.4;
        }
        break;
      }
      case 'Landing':
        this.airPose(dt, f, p);
        this.tuck(p, Math.max(0.85, this.spinTuck()));
        break;
      case 'Recovery': {
        // three-point landing, rising as the recovery completes
        const k = 1 - smoothstep(0.35, 1, t / T.landing.recoveryTime);
        this.locomotion(dt, hs, p, false, f);
        const q = 1 - k;
        for (let i = 0; i < N; i++) p[i] *= q;
        setNeutralAdd(p, q);
        p[J.hipY] += -0.52 * k;
        p[J.spinePitch] += 0.8 * k;
        p[J.chestPitch] += 0.15 * k;
        p[J.lThigh] += 1.75 * k; p[J.lKnee] += 2.2 * k; p[J.lFoot] += -0.3 * k;
        p[J.rThigh] += 0.35 * k; p[J.rKnee] += 2.0 * k; p[J.rAbduct] += 0.3 * k; p[J.rFoot] += 0.4 * k;
        p[J.rShoulder] += 1.0 * k; p[J.rElbow] += 0.15 * k; p[J.rArmOut] += 0.25 * k;
        p[J.lShoulder] += -0.5 * k; p[J.lArmOut] += 1.0 * k; p[J.lElbow] += 0.5 * k;
        p[J.headPitch] += -0.55 * k;
        break;
      }
      case 'Airborne':
        this.airPose(dt, f, p);
        this.tuck(p, this.spinTuck());
        break;
      case 'PointLaunch': {
        this.airPose(dt, f, p);
        const k = smoothstep(0, 0.1, t) * (1 - smoothstep(0.1, 0.3, t));
        this.tuck(p, k);
        const s = smoothstep(0.12, 0.35, t);
        p[J.lShoulder] = lerp(p[J.lShoulder], 2.75, s); p[J.rShoulder] = lerp(p[J.rShoulder], 2.55, s);
        p[J.lArmOut] = lerp(p[J.lArmOut], 0.25, s); p[J.rArmOut] = lerp(p[J.rArmOut], 0.35, s);
        p[J.lElbow] = lerp(p[J.lElbow], 0.15, s); p[J.rElbow] = lerp(p[J.rElbow], 0.35, s);
        p[J.lThigh] = lerp(p[J.lThigh], 0.1, s); p[J.rThigh] = lerp(p[J.rThigh], -0.15, s);
        p[J.lKnee] = lerp(p[J.lKnee], 0.25, s); p[J.rKnee] = lerp(p[J.rKnee], 0.6, s);
        p[J.headPitch] = lerp(p[J.headPitch], -0.3, s);
        break;
      }
      case 'Trick': {
        this.airPose(dt, f, p);
        this.tuck(p, this.spinTuck());
        if (f.trickKind >= 2) {
          const k = Math.sin(clamp(t / T.air.trickDuration, 0, 1) * Math.PI);
          p[J.lArmOut] = lerp(p[J.lArmOut], 0.05, k); p[J.rArmOut] = lerp(p[J.rArmOut], 0.05, k);
          p[J.lShoulder] = lerp(p[J.lShoulder], 0.3, k); p[J.rShoulder] = lerp(p[J.rShoulder], 0.3, k);
        }
        break;
      }
      case 'Swinging': this.swingPose(dt, f, p); break;
      case 'WebZip': {
        // both arms haul on the line; legs trail, then gather for the landing
        const d = f.zipTarget.distanceTo(f.pos);
        const gather = 1 - smoothstep(2.5, 7, d);
        p[J.lShoulder] = 2.4; p[J.rShoulder] = 2.2; p[J.lElbow] = 0.6; p[J.rElbow] = 0.8;
        p[J.lArmOut] = 0.25; p[J.rArmOut] = 0.25;
        p[J.spinePitch] = -0.15; p[J.chestPitch] = -0.1;
        p[J.lThigh] = -0.35; p[J.rThigh] = 0.2; p[J.lKnee] = 0.6; p[J.rKnee] = 1.2;
        p[J.lFoot] = 0.5; p[J.rFoot] = 0.4;
        this.tuck(p, gather * 0.8);
        p[J.headPitch] = -0.2;
        break;
      }
      case 'Perching': {
        this.crouch(p, 1);
        p[J.lAbduct] = 0.42; p[J.rAbduct] = 0.36;
        p[J.lKnee] = 2.45; p[J.rKnee] = 2.3;
        p[J.spinePitch] = 0.62;
        p[J.rShoulder] = 0.9; p[J.rElbow] = 0.3; p[J.rArmOut] = 0.15;
        p[J.lShoulder] = 0.55; p[J.lArmOut] = 0.45; p[J.lElbow] = 1.5;
        p[J.headPitch] = -0.45 + Math.sin(this.breath * 1.3) * 0.03;
        break;
      }
      case 'WallRunning':
        this.locomotion(dt, Math.max(12, f.vel.length()), p, true, f);
        if (f.wallMode === 'vertical') {
          p[J.headPitch] -= 0.25;
          p[J.spinePitch] += 0.1;
        } else {
          // inner arm reaches for the wall for balance
          const inner = this.wallSideLeft(f) ? 'l' : 'r';
          if (inner === 'l') { p[J.lArmOut] = 1.0; p[J.lShoulder] = 0.6; p[J.lElbow] = 0.3; }
          else { p[J.rArmOut] = 1.0; p[J.rShoulder] = 0.6; p[J.rElbow] = 0.3; }
        }
        break;
      case 'WallCrawling': {
        // spread, low and flat against the facade; IK plants the hands and feet
        p[J.hipY] = -0.05;
        p[J.lShoulder] = 2.0; p[J.rShoulder] = 2.0; p[J.lArmOut] = 0.9; p[J.rArmOut] = 0.9;
        p[J.lElbow] = 1.3; p[J.rElbow] = 1.3;
        p[J.lThigh] = 0.9; p[J.rThigh] = 0.9; p[J.lAbduct] = 0.75; p[J.rAbduct] = 0.75;
        p[J.lKnee] = 1.8; p[J.rKnee] = 1.8;
        p[J.headPitch] = -0.65;
        const sway = Math.sin(this.crawlPhase);
        p[J.spineRoll] = sway * 0.12; p[J.hipYaw] = -sway * 0.08; p[J.headYaw] = sway * 0.1;
        break;
      }
      case 'Vaulting': {
        const k = Math.sin(clamp(t / 0.35, 0, 1) * Math.PI);
        this.locomotion(dt, hs, p, false, f);
        p[J.hipRoll] = 0.7 * k;
        p[J.lThigh] = lerp(p[J.lThigh], 1.3, k); p[J.rThigh] = lerp(p[J.rThigh], 1.6, k);
        p[J.lKnee] = lerp(p[J.lKnee], 1.7, k); p[J.rKnee] = lerp(p[J.rKnee], 0.8, k);
        p[J.rShoulder] = lerp(p[J.rShoulder], 0.7, k); p[J.rElbow] = lerp(p[J.rElbow], 0.1, k);
        p[J.lArmOut] = lerp(p[J.lArmOut], 1.3, k);
        break;
      }
      case 'Mantling': {
        const k = clamp(t / 0.35, 0, 1);
        const s = Math.sin(k * Math.PI);
        p[J.lShoulder] = lerp(2.6, 0.3, k); p[J.rShoulder] = lerp(2.6, 0.3, k);
        p[J.lElbow] = lerp(0.3, 1.6, s); p[J.rElbow] = p[J.lElbow];
        p[J.lThigh] = 1.6 * s; p[J.rThigh] = 0.8 * s;
        p[J.lKnee] = 2.0 * s; p[J.rKnee] = 1.4 * s;
        p[J.spinePitch] = 0.4 * s;
        break;
      }
    }
  }

  /** Walk → jog → run → sprint blend space with idle blend-in, lean and footstep events. */
  private locomotion(dt: number, speed: number, p: Pose, wall: boolean, f: AnimFrame): void {
    this.locoSpeed += (speed - this.locoSpeed) * damp(8, dt);
    const s = this.locoSpeed;
    const mv = wall ? 1 : smoothstep(0.12, 0.9, s);
    // idle layer
    const b = Math.sin(this.breath * 1.7);
    const idle = 1 - mv;
    if (idle > 0) {
      p[J.chestPitch] += b * 0.02 * idle;
      p[J.lArmOut] += (0.04 + b * 0.01) * idle; p[J.rArmOut] += (0.04 + b * 0.01) * idle;
      p[J.headYaw] += Math.sin(this.breath * 0.3) * 0.25 * idle;
      p[J.hipRoll] += Math.sin(this.breath * 0.23) * 0.03 * idle;
      p[J.lKnee] += 0.06 * idle;
    }
    if (mv <= 0) return;
    const run = smoothstep(2.5, 7, s), sprint = smoothstep(8, 15, s);
    // gait cycle length (m) grows with speed; a superhero sprint covers ~5 m per cycle
    const stride = lerp(1.45, lerp(2.9, 5.2, sprint), run);
    const prev = this.phase;
    this.phase += (dt * Math.max(s, 0.6) * TAU) / stride;
    if (mv > 0.5 && Math.floor(prev / Math.PI) !== Math.floor(this.phase / Math.PI)) this.maybeStep(wall, s);
    const ph = this.phase;
    const sin = Math.sin(ph);
    const aT = lerp(0.38, lerp(0.85, 1.1, sprint), run) * mv;
    const kneeAmp = lerp(0.55, lerp(1.55, 2.05, sprint), run) * mv;
    p[J.lThigh] += aT * sin + 0.12 * run * mv;
    p[J.rThigh] += -aT * sin + 0.12 * run * mv;
    p[J.lKnee] += 0.1 * mv + kneeAmp * Math.max(0, Math.sin(ph - 1.3)) + 0.22 * run * mv;
    p[J.rKnee] += 0.1 * mv + kneeAmp * Math.max(0, Math.sin(ph + Math.PI - 1.3)) + 0.22 * run * mv;
    p[J.lFoot] += (0.35 * Math.sin(ph - 0.4) * run - 0.1 * run) * mv;
    p[J.rFoot] += (-0.35 * Math.sin(ph - 0.4) * run - 0.1 * run) * mv;
    const aA = lerp(0.3, lerp(0.8, 1.15, sprint), run) * mv;
    p[J.lShoulder] += -aA * sin * 0.9 + 0.12 * mv;
    p[J.rShoulder] += aA * sin * 0.9 + 0.12 * mv;
    p[J.lElbow] += lerp(0.15, 1.45, run) * mv;
    p[J.rElbow] += lerp(0.15, 1.45, run) * mv;
    p[J.lArmOut] += -0.02 * mv; p[J.rArmOut] += -0.02 * mv;
    p[J.spinePitch] += lerp(0.04, lerp(0.2, 0.38, sprint), run) * mv;
    p[J.hipYaw] += sin * 0.12 * (0.4 + run) * mv;
    p[J.chestYaw] += -sin * 0.18 * (0.4 + run) * mv;
    p[J.hipY] += (-Math.abs(Math.cos(ph)) * lerp(0.02, 0.08, run) + 0.02 * run - 0.04 * sprint) * mv;
    p[J.headPitch] += -p[J.spinePitch] * 0.6;
    if (!wall) {
      // lean into turns: torso and head look into the curve (the root banks in orient())
      const fwd = this._f.set(-Math.sin(f.facing), 0, -Math.cos(f.facing));
      const left = this._l.crossVectors(UP, fwd);
      const aL = clamp(f.acc.x * left.x + f.acc.z * left.z, -30, 30);
      p[J.headYaw] += aL * 0.012 * mv;
      p[J.chestYaw] += aL * 0.006 * mv;
      p[X.chestRoll] += aL * 0.004 * mv;
    }
  }

  private maybeStep(wall: boolean, speed: number): void {
    this.steps.push({ wall, speed });
  }

  private airPose(dt: number, f: AnimFrame, p: Pose): void {
    const vy = f.vel.y;
    const rise = smoothstep(-1, 8, vy);
    const fall = smoothstep(0, -18, vy);
    const fast = smoothstep(-18, -42, vy);
    const apex = clamp(1 - rise - fall, 0, 1);
    const t = this.breath;
    // rising: gathered legs, arms up and forward
    const L = (i: number, v: number, w: number) => { p[i] += v * w; };
    L(J.lThigh, 1.05, rise); L(J.rThigh, 0.55, rise); L(J.lKnee, 1.55, rise); L(J.rKnee, 1.05, rise);
    L(J.lShoulder, 1.35, rise); L(J.rShoulder, 0.95, rise); L(J.lArmOut, 0.35, rise); L(J.rArmOut, 0.45, rise);
    L(J.lElbow, 0.45, rise); L(J.rElbow, 0.6, rise); L(J.spinePitch, 0.12, rise);
    // apex: floating, limbs open
    L(J.lThigh, 0.45, apex); L(J.rThigh, 0.05, apex); L(J.lKnee, 0.9, apex); L(J.rKnee, 0.5, apex);
    L(J.lAbduct, 0.12, apex); L(J.rAbduct, 0.12, apex);
    L(J.lShoulder, 0.55, apex); L(J.rShoulder, 0.4, apex); L(J.lArmOut, 0.95, apex); L(J.rArmOut, 1.05, apex);
    L(J.lElbow, 0.45, apex); L(J.rElbow, 0.4, apex); L(J.spinePitch, -0.05, apex);
    // falling: arms up and out, legs cycling, arched, looking down at what's coming
    const cyc = Math.sin(t * 6.5);
    const slow = fall * (1 - fast);
    L(J.lThigh, 0.35 + cyc * 0.18, slow); L(J.rThigh, 0.05 - cyc * 0.18, slow);
    L(J.lKnee, 1.0 + cyc * 0.2, slow); L(J.rKnee, 0.55 - cyc * 0.15, slow);
    L(J.lShoulder, 1.7, slow); L(J.rShoulder, 1.5, slow); L(J.lArmOut, 1.05, slow); L(J.rArmOut, 1.15, slow);
    L(J.lElbow, 0.45, slow); L(J.rElbow, 0.5, slow); L(J.spinePitch, -0.15, slow); L(J.headPitch, 0.2, slow);
    // fast fall: skydiver arch
    L(J.lThigh, -0.1, fast); L(J.rThigh, 0.05, fast); L(J.lKnee, 0.7, fast); L(J.rKnee, 0.9, fast);
    L(J.lAbduct, 0.3, fast); L(J.rAbduct, 0.3, fast);
    L(J.lShoulder, 1.0, fast); L(J.rShoulder, 1.0, fast); L(J.lArmOut, 1.4, fast); L(J.rArmOut, 1.4, fast);
    L(J.lElbow, 0.5, fast); L(J.rElbow, 0.5, fast); L(J.spinePitch, -0.35, fast); L(J.headPitch, -0.3, fast);

    // release: open spread into the flight (forward launches)
    if (this.relKind === 'spread' && (f.state === 'Airborne' || f.state === 'Trick')) {
      const r = this.relT;
      const w = smoothstep(0, 0.1, r) * (1 - smoothstep(0.45, 0.95, r)) * this.relStrength * (1 - this.diveW);
      if (w > 0) {
        for (let i = 0; i < N; i++) p[i] *= 1 - w;
        setNeutralAdd(p, 1 - w);
        L(J.lArmOut, 1.45, w); L(J.rArmOut, 1.5, w); L(J.lShoulder, 0.35, w); L(J.rShoulder, 0.15, w);
        L(J.lElbow, 0.3, w); L(J.rElbow, 0.2, w);
        L(J.lThigh, -0.35, w); L(J.rThigh, 0.45, w); L(J.lKnee, 0.35, w); L(J.rKnee, 1.25, w);
        L(J.lAbduct, 0.22, w); L(J.rAbduct, 0.18, w); L(J.lFoot, 0.5, w); L(J.rFoot, 0.3, w);
        L(J.spinePitch, -0.35, w); L(J.chestPitch, -0.18, w); L(J.headPitch, -0.3, w);
      }
    }
    // dive: streamlined head-first, arms swept back along the body
    const d = this.diveW;
    if (d > 0.001) {
      for (let i = 0; i < N; i++) p[i] *= 1 - d;
      setNeutralAdd(p, 1 - d);
      L(J.lShoulder, -0.4, d); L(J.rShoulder, -0.35, d); L(J.lArmOut, 0.28, d); L(J.rArmOut, 0.28, d);
      L(J.lElbow, 0.12, d); L(J.rElbow, 0.18, d);
      L(J.lThigh, -0.05, d); L(J.rThigh, 0.08, d); L(J.lKnee, 0.12, d); L(J.rKnee, 0.35, d);
      L(J.lFoot, 0.6, d); L(J.rFoot, 0.6, d);
      L(J.spinePitch, -0.12, d); L(J.headPitch, -0.45, d);
    }
    void dt;
  }

  private swingPose(dt: number, f: AnimFrame, p: Pose): void {
    const a = f.swingAngle; // degrees: − before the bottom, + after
    const t = f.stateTime;
    const G = clamp(f.tension / (T.physics.mass * T.physics.gravity), 0, 6); // g-load
    const heavy = smoothstep(1.2, 4, G);
    const lo = T.web.idealReleaseAngleMin, hi = T.web.idealReleaseAngleMax;
    // phases along the arc
    const down = smoothstep(-4, -35, a);
    const up = smoothstep(2, 14, a);
    const late = smoothstep(hi - 2, hi + 22, a) * (f.vel.y > -1 ? 1 : 0);
    // the swing-jump cue: legs tuck to ~90° through the ideal jump window on the up-swing
    const inWindow = f.vel.y > 0 ? smoothstep(lo - 12, lo + 1, a) * (1 - smoothstep(hi - 6, hi + 10, a)) : 0;
    this.tuckW += (inWindow - this.tuckW) * damp(16, dt);
    const tk = this.tuckW;
    const catchK = 1 - smoothstep(0.05, 0.3, t);
    const free = this.webHand === 'R' ? 'l' : 'r';

    // --- legs ---
    // bottom: hanging along the rope, legs long and trailing a touch, one knee softer
    let lTh = -0.18, rTh = 0.05, lKn = 0.3, rKn = 0.55;
    // down-swing: legs trail back behind the fall, body arched into it
    lTh = lerp(lTh, -0.55, down); rTh = lerp(rTh, -0.2, down); lKn = lerp(lKn, 0.75, down); rKn = lerp(rKn, 1.05, down);
    // up-swing: legs swing through and rise
    lTh = lerp(lTh, 0.45, up * (1 - tk)); rTh = lerp(rTh, 0.25, up * (1 - tk));
    // tuck (the jump cue)
    lTh = lerp(lTh, 1.6, tk); rTh = lerp(rTh, 1.45, tk); lKn = lerp(lKn, 2.0, tk); rKn = lerp(rKn, 1.85, tk);
    // past the window: pike, legs thrown up ahead
    lTh = lerp(lTh, 1.15, late * (1 - tk)); rTh = lerp(rTh, 0.95, late * (1 - tk));
    lKn = lerp(lKn, 0.35, late * (1 - tk)); rKn = lerp(rKn, 0.5, late * (1 - tk));
    // catching the web: legs still gathered from the air
    lTh = lerp(lTh, 0.8, catchK * 0.7); rTh = lerp(rTh, 0.4, catchK * 0.7); lKn = lerp(lKn, 1.3, catchK * 0.7); rKn = lerp(rKn, 1.0, catchK * 0.7);
    // g-load makes the legs heavy: straighter and closer to the rope line at the bottom
    lKn += heavy * 0.12 * (1 - tk); rKn += heavy * 0.1 * (1 - tk);
    p[J.lThigh] = lTh; p[J.rThigh] = rTh; p[J.lKnee] = lKn; p[J.rKnee] = rKn;
    p[J.lAbduct] = 0.08 + 0.1 * down; p[J.rAbduct] = 0.06 + 0.05 * tk;
    p[J.lFoot] = 0.45 + 0.2 * down; p[J.rFoot] = 0.35;

    // --- torso: arched into the drop, curled in the tuck, compressed by the g-load ---
    p[J.spinePitch] = -0.22 * down + 0.4 * tk - 0.08 * late + 0.1 * heavy * (1 - down);
    p[J.chestPitch] = -0.12 * down + 0.15 * tk + 0.08 * heavy;
    const side = this.webHand === 'R' ? -1 : 1; // web shoulder leads up
    p[J.chestYaw] = 0.14 * side;
    p[X.chestRoll] = -0.1 * side;
    // sideways pull (steering, off-axis anchors) leans the hips and spine
    const lean = clamp(this.swingSide * 0.012, -0.35, 0.35);
    p[J.spineRoll] = lean;
    p[J.hipRoll] = lean * 0.6;
    p[J.headPitch] = -0.1 + 0.15 * heavy + 0.1 * tk - 0.2 * late;

    // --- arms ---
    // web arm: raised toward the rope in FK so the IK blend is short; the IK locks it on
    const wS = 2.7, wO = 0.25, wE = 0.12;
    // free arm: out and back for balance on the drop, tucked in the jump window, then reaching
    // forward-up for the next web (the hands alternate)
    let fS = lerp(0.25, -0.35, down), fO = lerp(0.95, 1.2, down), fE = lerp(0.55, 0.35, down);
    fS = lerp(fS, 0.95, tk); fO = lerp(fO, 0.45, tk); fE = lerp(fE, 1.55, tk);
    fS = lerp(fS, 2.3, late); fO = lerp(fO, 0.4, late); fE = lerp(fE, 0.35, late);
    fO -= heavy * 0.2;
    if (free === 'l') {
      p[J.lShoulder] = fS; p[J.lArmOut] = fO; p[J.lElbow] = fE;
      p[J.rShoulder] = wS; p[J.rArmOut] = wO; p[J.rElbow] = wE;
    } else {
      p[J.rShoulder] = fS; p[J.rArmOut] = fO; p[J.rElbow] = fE;
      p[J.lShoulder] = wS; p[J.lArmOut] = wO; p[J.lElbow] = wE;
    }
  }

  private tuck(p: Pose, k: number): void {
    if (k <= 0) return;
    p[J.lThigh] = lerp(p[J.lThigh], 1.95, k); p[J.rThigh] = lerp(p[J.rThigh], 1.85, k);
    p[J.lKnee] = lerp(p[J.lKnee], 2.4, k); p[J.rKnee] = lerp(p[J.rKnee], 2.35, k);
    p[J.lAbduct] = lerp(p[J.lAbduct], 0.12, k); p[J.rAbduct] = lerp(p[J.rAbduct], 0.12, k);
    p[J.lShoulder] = lerp(p[J.lShoulder], 0.95, k); p[J.rShoulder] = lerp(p[J.rShoulder], 0.9, k);
    p[J.lArmOut] = lerp(p[J.lArmOut], 0.3, k); p[J.rArmOut] = lerp(p[J.rArmOut], 0.3, k);
    p[J.lElbow] = lerp(p[J.lElbow], 1.9, k); p[J.rElbow] = lerp(p[J.rElbow], 1.9, k);
    p[J.spinePitch] = lerp(p[J.spinePitch], 0.75, k);
    p[J.headPitch] = lerp(p[J.headPitch], 0.35, k);
  }

  private crouch(p: Pose, k: number): void {
    p[J.hipY] = lerp(p[J.hipY], -0.42, k);
    p[J.lThigh] = lerp(p[J.lThigh], 1.7, k); p[J.rThigh] = lerp(p[J.rThigh], 1.7, k);
    p[J.lKnee] = lerp(p[J.lKnee], 2.3, k); p[J.rKnee] = lerp(p[J.rKnee], 2.3, k);
    p[J.lAbduct] = lerp(p[J.lAbduct], 0.25, k); p[J.rAbduct] = lerp(p[J.rAbduct], 0.25, k);
    p[J.lFoot] = lerp(p[J.lFoot], -0.6, k); p[J.rFoot] = lerp(p[J.rFoot], -0.6, k);
    p[J.spinePitch] = lerp(p[J.spinePitch], 0.55, k);
    p[J.headPitch] = lerp(p[J.headPitch], -0.35, k);
  }

  /** True when the facade is on the hero's left during a horizontal wall run. */
  private wallSideLeft(f: AnimFrame): boolean {
    const hs = hlen(f.vel);
    if (hs < 0.5) return true;
    // left = up × fwd ; wall is on the left when the normal points right (−left)
    const lx = -f.vel.z / hs, lz = f.vel.x / hs; // (UP × fwd) with fwd = vel/hs … = (fz, 0, −fx)·(−1)
    return f.wallNormal.x * lx + f.wallNormal.z * lz < 0;
  }

  // ---------------------------------------------------------------------------------------------
  /** Root orientation and offset: chosen per state from the physics, then smoothed. */
  private orient(dt: number, f: AnimFrame): void {
    const fwd = this._f.set(-Math.sin(f.facing), 0, -Math.cos(f.facing));
    const up = this._u.copy(UP);
    const hs = hlen(f.vel);
    const speed = f.vel.length();
    const off = this._o.set(0, 0, 0);
    let rate = 12;
    switch (f.state) {
      case 'Grounded':
      case 'Vaulting':
      case 'Recovery': {
        // bank into horizontal acceleration (centripetal on turns, forward on starts, back on stops)
        const a = this._t.set(f.acc.x, 0, f.acc.z);
        const al = a.length();
        if (al > 22) a.multiplyScalar(22 / al);
        a.multiplyScalar(0.017 * smoothstep(0.5, 4, hs));
        up.add(a).normalize();
        rate = 10;
        break;
      }
      case 'Swinging': {
        // hang along the web; a little of the specific force (what the body feels)
        const toA = this._t.subVectors(f.anchor, f.pos).normalize();
        const sf = this._v.copy(f.acc).addScaledVector(UP, T.physics.gravity);
        if (sf.lengthSq() > 1) up.copy(toA).lerp(sf.normalize(), 0.2).normalize();
        else up.copy(toA);
        if (speed > 1) fwd.copy(f.vel).normalize();
        // sideways component of the rope pull (for the hip lean)
        const left = this._l.crossVectors(up, fwd).normalize();
        this.swingSide += (clamp(f.acc.dot(left), -40, 40) - this.swingSide) * damp(6, dt);
        rate = 9;
        break;
      }
      case 'WebZip': {
        const to = this._t.subVectors(f.zipTarget, f.pos).normalize();
        up.lerp(to, 0.7).normalize();
        if (speed > 1) fwd.copy(f.vel).normalize();
        rate = 12;
        break;
      }
      case 'Airborne':
      case 'Trick':
      case 'PointLaunch':
      case 'Landing': {
        if (speed > 2) {
          const vd = this._t.copy(f.vel).normalize();
          // head leads along the flight path when diving/falling fast or opening a release spread
          const dive = Math.max(this.diveW * 0.92, smoothstep(-10, -35, f.vel.y) * 0.5);
          const launch = f.state === 'PointLaunch' ? 0.6 : smoothstep(4, 16, f.vel.y) * 0.3;
          const r = this.relT;
          const spread = this.relKind === 'spread' ? smoothstep(0, 0.12, r) * (1 - smoothstep(0.45, 0.95, r)) * 0.45 * this.relStrength : 0;
          const k = f.state === 'Landing' ? 0 : Math.max(dive, launch, spread);
          up.lerp(vd, k).normalize();
          if (hs > 1) fwd.set(f.vel.x / hs, 0, f.vel.z / hs);
        }
        rate = f.state === 'Landing' ? 14 : 7;
        break;
      }
      case 'WallRunning': {
        const n = f.wallNormal;
        // feet on the facade, body leaning out from it (superhero wall run)
        const beta = (f.wallMode === 'vertical' ? 62 : 52) * (Math.PI / 180);
        const cb = Math.cos(beta), sb = Math.sin(beta);
        up.set(n.x * sb, cb, n.z * sb);
        if (f.wallMode === 'vertical') fwd.set(-n.x * cb, sb, -n.z * cb);
        else if (hs > 1) fwd.set(f.vel.x / hs, 0, f.vel.z / hs);
        off.set(n.x, 0, n.z).multiplyScalar(0.84 * sb - COM_TO_WALL + 0.02);
        rate = 13;
        break;
      }
      case 'WallCrawling': {
        const n = f.wallNormal;
        fwd.set(-n.x, 0, -n.z);
        up.set(n.x * 0.12, 1, n.z * 0.12).normalize();
        off.set(-n.x, 0, -n.z).multiplyScalar(0.12);
        rate = 12;
        break;
      }
      default:
        break;
    }
    // basis: z = forward (⊥ up), y = up, x = up × forward (character's left)
    const z = this._p.copy(fwd).addScaledVector(up, -fwd.dot(up));
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1).addScaledVector(up, -up.z);
    z.normalize();
    const x = this._l.crossVectors(up, z).normalize();
    this.m4.makeBasis(x, up, z);
    this.targetQuat.setFromRotationMatrix(this.m4);
    if (this.bodyQuat.dot(this.targetQuat) < 0) {
      this.targetQuat.set(-this.targetQuat.x, -this.targetQuat.y, -this.targetQuat.z, -this.targetQuat.w);
    }
    this.prevBodyQuat.copy(this.bodyQuat);
    this.bodyQuat.slerp(this.targetQuat, damp(rate, dt));
    this.rootOffset.lerp(off, damp(10, dt));
    const r = this.rig.root;
    r.position.copy(f.pos).add(this.rootOffset);
    // a roll or flip happens around a lower pivot: drop the tucked ball onto the ground
    if (this.spin.active && this.lastState === 'Landing') {
      r.position.y -= 0.42 * Math.sin(Math.PI * clamp(this.spin.t / this.spin.dur, 0, 1));
    }
    r.quaternion.copy(this.bodyQuat).multiply(this.spinQuat);
  }

  /** Overlapping action: limbs lag the body's rotation and acceleration (spring layer). */
  private secondary(dt: number, f: AnimFrame, p: Pose): void {
    // body-local angular velocity from the smoothed root (flips are excluded on purpose)
    const q = this._q.copy(this.prevBodyQuat).invert().multiply(this.bodyQuat);
    const sgn = q.w < 0 ? -1 : 1;
    const idt = 1 / Math.max(dt, 1e-4);
    const wx = clamp(2 * q.x * sgn * idt, -12, 12);
    const wz = clamp(2 * q.z * sgn * idt, -12, 12);
    // local linear acceleration (forward = +z)
    const inv = this._q.copy(this.bodyQuat).invert();
    const aLocal = this._v.copy(f.acc).applyQuaternion(inv);
    const aF = clamp(aLocal.z, -60, 60), aX = clamp(aLocal.x, -60, 60);
    const air = f.state !== 'Grounded' && f.state !== 'WallRunning' && f.state !== 'WallCrawling' && f.state !== 'Perching' && f.state !== 'Recovery';
    const w = air ? 1 : 0.25;
    const lagT = clamp((wx * 0.1 - aF * 0.004) * w, -0.55, 0.55);
    this.legLag.step(lagT, 11, 0.42, dt);
    this.legLagR.step(lagT * 0.8, 9, 0.38, dt);
    this.armLag.step(clamp((wz * 0.08 + aX * 0.004) * w, -0.4, 0.4), 10, 0.45, dt);
    p[J.lThigh] += this.legLag.x;
    p[J.rThigh] += this.legLagR.x;
    p[J.lKnee] += Math.max(0, -this.legLag.x) * 0.5;
    p[J.rKnee] += Math.max(0, -this.legLagR.x) * 0.5;
    p[J.lArmOut] += this.armLag.x;
    p[J.rArmOut] -= this.armLag.x;
  }

  private applyPose(): void {
    const p = this.pose, r = this.rig;
    r.hips.position.y = 0.02 + p[J.hipY];
    r.hips.rotation.set(p[J.hipPitch], p[J.hipYaw], p[J.hipRoll], 'YXZ');
    r.spine.rotation.set(p[J.spinePitch], p[J.spineYaw], p[J.spineRoll], 'YXZ');
    r.chest.rotation.set(p[J.chestPitch], p[J.chestYaw], p[X.chestRoll], 'YXZ');
    r.neck.rotation.set(p[J.neckPitch], 0, 0);
    r.head.rotation.set(p[J.headPitch], p[J.headYaw], p[X.headRoll], 'YXZ');
    // legs: forward swing is −X rotation; abduct rotates about Z toward the limb's own side
    r.thighL.rotation.set(-p[J.lThigh], 0, p[J.lAbduct], 'ZXY');
    r.thighR.rotation.set(-p[J.rThigh], 0, -p[J.rAbduct], 'ZXY');
    r.shinL.rotation.set(p[J.lKnee], 0, 0);
    r.shinR.rotation.set(p[J.rKnee], 0, 0);
    r.footL.rotation.set(p[J.lFoot], 0, 0);
    r.footR.rotation.set(p[J.rFoot], 0, 0);
    r.upperArmL.rotation.set(-p[J.lShoulder], p[J.lArmTwist], p[J.lArmOut], 'ZXY');
    r.upperArmR.rotation.set(-p[J.rShoulder], -p[J.rArmTwist], -p[J.rArmOut], 'ZXY');
    r.foreArmL.rotation.set(-p[J.lElbow], 0, 0);
    r.foreArmR.rotation.set(-p[J.rElbow], 0, 0);
    r.root.updateMatrixWorld(true);
  }

  // ---------------------------------------------------------------------------------------------
  /** Weighted IK layers and the head look. Every weight ramps, so nothing snaps on or off. */
  private applyIK(dt: number, f: AnimFrame): void {
    const r = this.rig;
    const st = f.state;
    // --- web hand: reaches with the shot, locks on the anchor, lets go smoothly on release ---
    const swinging = st === 'Swinging' && f.ropeActive;
    if (swinging) {
      this.reachT += dt;
      (this.webHand === 'L' ? this.ikTargetL : this.ikTargetR).copy(f.anchor);
    }
    const reach = smoothstep(0, 0.1, this.reachT);
    const wantL = swinging && this.webHand === 'L' ? reach : 0;
    const wantR = swinging && this.webHand === 'R' ? reach : 0;
    this.ikL = wantL >= this.ikL ? wantL : Math.max(wantL, this.ikL - dt / 0.22);
    this.ikR = wantR >= this.ikR ? wantR : Math.max(wantR, this.ikR - dt / 0.22);
    if (this.ikL > 0) this.aimArm(r.upperArmL, r.foreArmL, r.handL, this.ikTargetL, 1, easeW(this.ikL));
    if (this.ikR > 0) this.aimArm(r.upperArmR, r.foreArmR, r.handR, this.ikTargetR, -1, easeW(this.ikR));

    // --- zip: both hands haul on the line ---
    this.zipW = approach(this.zipW, st === 'WebZip' ? 1 : 0, dt / (st === 'WebZip' ? 0.08 : 0.2));
    if (this.zipW > 0) {
      this.aimArm(r.upperArmR, r.foreArmR, r.handR, f.zipTarget, -1, easeW(this.zipW) * 0.95);
      this.aimArm(r.upperArmL, r.foreArmL, r.handL, f.zipTarget, 1, easeW(this.zipW) * 0.75, 0.55);
    }

    const fwd = this._f.set(-Math.sin(f.facing), 0, -Math.cos(f.facing));
    const right = this._l.crossVectors(fwd, UP).normalize();
    // --- perch: one hand down on the perch in front of the feet ---
    this.perchW = approach(this.perchW, st === 'Perching' ? 1 : 0, dt / 0.2);
    if (this.perchW > 0) {
      const tgt = this._w.copy(f.pos).addScaledVector(UP, -0.86).addScaledVector(fwd, 0.36).addScaledVector(right, 0.14);
      this.reachPoint(r.upperArmR, r.foreArmR, r.handR, tgt, -1, easeW(this.perchW));
    }
    // --- three-point landing: the leading hand slaps the ground ---
    const recK = st === 'Recovery' ? 1 - smoothstep(0.35, 1, f.stateTime / T.landing.recoveryTime) : 0;
    this.recoverW = approach(this.recoverW, recK, dt / 0.06);
    if (this.recoverW > 0) {
      const tgt = this._w.copy(f.pos).addScaledVector(UP, -0.86).addScaledVector(fwd, 0.5).addScaledVector(right, 0.2);
      this.reachPoint(r.upperArmR, r.foreArmR, r.handR, tgt, -1, easeW(this.recoverW));
    }
    // --- crawl: hands and feet planted on the facade ---
    this.crawlW = approach(this.crawlW, st === 'WallCrawling' ? 1 : 0, dt / 0.22);
    if (this.crawlW > 0) this.crawlIK(dt, f);

    // --- head look ---
    let wantLook = 0;
    if (st === 'Grounded' || st === 'Perching' || (st === 'Airborne' && this.diveW < 0.5 && !this.spin.active)) {
      wantLook = 1;
      this.lookDir.copy(f.camForward);
    } else if (st === 'Swinging' && f.vel.lengthSq() > 4) {
      wantLook = 0.5;
      this.lookDir.copy(f.vel).normalize();
    }
    this.lookW += (wantLook - this.lookW) * damp(6, dt);
    if (this.lookW > 0.01) {
      r.chest.getWorldQuaternion(this._q).invert();
      const local = this._t.copy(this.lookDir).applyQuaternion(this._q);
      const yaw = clamp(Math.atan2(local.x, local.z), -0.9, 0.9);
      const pitch = clamp(-Math.asin(clamp(local.y, -1, 1)), -0.5, 0.6);
      r.head.rotation.y += yaw * 0.6 * this.lookW;
      r.head.rotation.x += pitch * 0.5 * this.lookW;
      r.head.updateMatrixWorld(true);
    }
  }

  /** Point an arm straight at a (possibly far) target, elbow bending slightly out and back. */
  private aimArm(upper: Object3D, fore: Object3D, hand: Object3D, point: Vector3, side: number, w: number, reachFrac = 0.97): void {
    upper.getWorldPosition(this._p);
    const dir = this._t.subVectors(point, this._p);
    const d = dir.length();
    if (d < 1e-3) return;
    dir.multiplyScalar(1 / d);
    const reach = Rig.UPPER_ARM + Rig.FORE_ARM;
    const target = this._v.copy(this._p).addScaledVector(dir, Math.min(d, reach * reachFrac));
    this.poleFor(side, 0.35, -0.35, 0.3);
    solveTwoBone(upper, fore, hand, target, this._w, w);
  }

  /** Put a hand on a nearby point (full two-bone solve). */
  private reachPoint(upper: Object3D, fore: Object3D, hand: Object3D, point: Vector3, side: number, w: number): void {
    upper.getWorldPosition(this._p);
    this.poleFor(side, 0.5, -0.2, 0.25);
    this._v.copy(point);
    solveTwoBone(upper, fore, hand, this._v, this._w, w);
  }

  /** Pole target in `_w`: from the shoulder in `_p`, out to `side`, back and down in body space. */
  private poleFor(side: number, out: number, back: number, down: number): void {
    const q = this.rig.chest.getWorldQuaternion(this._q);
    const lx = this._l.set(1, 0, 0).applyQuaternion(q); // character's left
    this._w.copy(this._p).addScaledVector(lx, side * out);
    this._w.addScaledVector(this._o.set(0, 0, 1).applyQuaternion(q), back);
    this._w.addScaledVector(this._o.set(0, 1, 0).applyQuaternion(q), -down);
  }

  // ---------------------------------------------------------------------------------------------
  private static readonly CRAWL_REST: readonly [number, number][] = [[-0.3, 0.52], [0.3, 0.52], [-0.26, -0.7], [0.26, -0.7]];

  private crawlIdeal(i: number, f: AnimFrame, lead: number, out: Vector3): Vector3 {
    const n = f.wallNormal;
    const [s, y] = Animator.CRAWL_REST[i];
    // S = UP × n points to the character's right when facing the wall
    out.copy(f.pos).addScaledVector(n, -COM_TO_WALL + (i < 2 ? 0.06 : 0.1));
    out.x += n.z * s; out.z += -n.x * s; out.y += y;
    out.addScaledVector(f.vel, lead);
    return out;
  }

  private initCrawl(f: AnimFrame): void {
    this.crawlNormal.copy(f.wallNormal);
    for (let i = 0; i < 4; i++) {
      const l = this.limbs[i];
      this.crawlIdeal(i, f, 0, l.planted);
      l.stepping = false;
      l.t = 0;
    }
  }

  /** Procedural stepping: diagonal pairs lift and re-plant when they fall behind the body. */
  private crawlIK(dt: number, f: AnimFrame): void {
    const r = this.rig;
    if (f.state === 'WallCrawling') {
      if (this.crawlNormal.dot(f.wallNormal) < 0.9) this.initCrawl(f); // wrapped a corner
      const speed = f.vel.length();
      this.crawlPhase += dt * speed * 4;
      const dur = clamp(0.26 - speed * 0.02, 0.13, 0.26);
      const ideal = this._t;
      for (let pair = 0; pair < 2; pair++) {
        const a = pair === 0 ? 0 : 1, b = pair === 0 ? 3 : 2; // (LH, RF) and (RH, LF)
        const other = pair === 0 ? [1, 2] : [0, 3];
        const busy = this.limbs[other[0]].stepping || this.limbs[other[1]].stepping;
        if (busy || this.limbs[a].stepping || this.limbs[b].stepping) continue;
        const da = this.crawlIdeal(a, f, 0, ideal).distanceTo(this.limbs[a].planted);
        const db = this.crawlIdeal(b, f, 0, ideal).distanceTo(this.limbs[b].planted);
        if (Math.max(da, db) > 0.2) {
          for (const i of [a, b]) {
            const l = this.limbs[i];
            l.from.copy(l.planted);
            this.crawlIdeal(i, f, 0.16, l.to);
            l.stepping = true;
            l.t = 0;
          }
        }
      }
      for (let i = 0; i < 4; i++) {
        const l = this.limbs[i];
        if (!l.stepping) continue;
        l.t += dt / dur;
        this.crawlIdeal(i, f, 0.16, l.to);
        const e = smoothstep(0, 1, l.t);
        l.planted.copy(l.from).lerp(l.to, e).addScaledVector(f.wallNormal, 0.12 * Math.sin(Math.PI * clamp(l.t, 0, 1)));
        if (l.t >= 1) {
          l.stepping = false;
          this.crawlIdeal(i, f, 0.16, l.planted);
          if (i === 0) this.maybeStep(true, speed);
        }
      }
    }
    const w = easeW(this.crawlW);
    const n = this.crawlNormal;
    const q = r.chest.getWorldQuaternion(this._q);
    const lx = this._l.set(1, 0, 0).applyQuaternion(q);
    // arms: elbows out and away from the wall
    for (const [i, upper, fore, hand, side] of [[0, r.upperArmL, r.foreArmL, r.handL, 1], [1, r.upperArmR, r.foreArmR, r.handR, -1]] as const) {
      upper.getWorldPosition(this._p);
      this._w.copy(this._p).addScaledVector(lx, side * 0.6).addScaledVector(n, 0.35).addScaledVector(UP, -0.15);
      this._v.copy(this.limbs[i].planted);
      solveTwoBone(upper, fore, hand, this._v, this._w, w);
    }
    // legs: knees splayed out and up (frog)
    const hq = r.hips.getWorldQuaternion(this._q);
    const hx = this._l.set(1, 0, 0).applyQuaternion(hq);
    for (const [i, upper, mid, end, side] of [[2, r.thighL, r.shinL, r.footL, 1], [3, r.thighR, r.shinR, r.footR, -1]] as const) {
      upper.getWorldPosition(this._p);
      this._w.copy(this._p).addScaledVector(hx, side * 0.7).addScaledVector(n, 0.3).addScaledVector(UP, 0.25);
      this._v.copy(this.limbs[i].planted);
      solveTwoBone(upper, mid, end, this._v, this._w, w);
    }
  }

  /** World position of the hand currently holding the web (for the web line). */
  webHandPosition(out: Vector3): Vector3 {
    return (this.webHand === 'R' ? this.rig.handR : this.rig.handL).getWorldPosition(out);
  }

  get POSE_SIZE(): number {
    return POSE_SIZE;
  }
  debugPose(): Pose {
    this.tmpPose.set(this.pose);
    return this.tmpPose;
  }
  /** For tests/debug: whether an additive flip/roll is running. */
  get spinning(): boolean {
    return this.spin.active;
  }
}

/** p += neutral · w (used when a layer replaces the pose: keeps the neutral rest offsets). */
function setNeutralAdd(p: Pose, w: number): void {
  p[J.lArmOut] += 0.12 * w;
  p[J.rArmOut] += 0.12 * w;
  p[J.lElbow] += 0.15 * w;
  p[J.rElbow] += 0.15 * w;
  p[J.lKnee] += 0.05 * w;
  p[J.rKnee] += 0.05 * w;
}

function approach(x: number, target: number, step: number): number {
  return x < target ? Math.min(target, x + step) : Math.max(target, x - step);
}

/** Ease for IK weights (0..1) so reaches start and settle softly. */
function easeW(w: number): number {
  return w * w * (3 - 2 * w);
}
