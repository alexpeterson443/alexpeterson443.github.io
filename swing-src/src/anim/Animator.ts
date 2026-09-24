import { Matrix4, Quaternion, Vector3 } from 'three';
import { clamp, damp, easeInOutSine, easeOutCubic, hlen, lerp, smoothstep } from '../core/math';
import { T } from '../core/tuning';
import type { StateId } from '../player/StateMachine';
import { J, POSE_SIZE, copyPose, lerpPose, newPose, setNeutral, type Pose } from './Pose';
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

const UP = new Vector3(0, 1, 0);
/** Cross-fade durations into each state (s). */
const BLEND_IN: Partial<Record<StateId, number>> = {
  Grounded: 0.16, Airborne: 0.22, Swinging: 0.14, WebZip: 0.1, PointLaunch: 0.08, Perching: 0.14,
  WallRunning: 0.12, WallCrawling: 0.18, Vaulting: 0.08, Mantling: 0.08, Landing: 0.06, Recovery: 0.05, Trick: 0.08,
};

/**
 * Procedural animation: state poses → cross-fade → additive layers → root orientation from
 * physics (specific force / rope direction / wall normal) → IK (web hand, zip hands) → look-at.
 * The controller owns the trajectory; the animator only interprets it.
 */
export class Animator {
  readonly pose = newPose();
  private target = newPose();
  private from = newPose();
  private blendT = 1;
  private blendDur = 0.15;
  private lastState: StateId | null = null;
  private prevState: StateId | null = null;
  private phase = 0;
  private locoSpeed = 0;
  private landDip = 0;
  private landDipV = 0;
  private breath = 0;
  /** smoothed root orientation */
  readonly bodyQuat = new Quaternion();
  private readonly targetQuat = new Quaternion();
  private readonly extraQuat = new Quaternion();
  private readonly m4 = new Matrix4();
  private readonly _f = new Vector3();
  private readonly _u = new Vector3();
  private readonly _l = new Vector3();
  private readonly _t = new Vector3();
  private readonly _p = new Vector3();
  private readonly _v = new Vector3();
  /** which hand holds the web this swing (alternates) */
  private webHand: 'L' | 'R' = 'R';
  /** footstep/wall-step events produced this frame (consumed by audio) */
  readonly steps: { wall: boolean; speed: number }[] = [];
  private tmpPose = newPose();

  constructor(readonly rig: Rig) {
    setNeutral(this.pose);
  }

  update(dt: number, f: AnimFrame): void {
    this.steps.length = 0;
    const st = f.state;
    if (st !== this.lastState) {
      copyPose(this.from, this.pose);
      this.blendT = 0;
      this.blendDur = BLEND_IN[st] ?? 0.15;
      this.prevState = this.lastState;
      this.lastState = st;
      if (st === 'Swinging') this.webHand = this.webHand === 'R' ? 'L' : 'R';
      if (st === 'Grounded' && this.prevState && this.prevState !== 'Vaulting' && this.prevState !== 'Mantling') {
        this.landDipV -= Math.min(2.2, f.landingImpact * 0.09 + 0.3);
      }
    }
    this.breath += dt;
    const target = this.target;
    setNeutral(target);
    this.buildStatePose(dt, f, target);

    // cross-fade from the pose at the moment of transition
    this.blendT = Math.min(1, this.blendT + dt / this.blendDur);
    const w = easeInOutSine(this.blendT);
    lerpPose(this.pose, this.from, target, w);

    // additive: landing compression spring
    this.landDipV += (-120 * this.landDip - 16 * this.landDipV) * dt;
    this.landDip += this.landDipV * dt;
    const dip = Math.min(0, this.landDip);
    this.pose[J.hipY] += dip * 0.35;
    this.pose[J.lKnee] -= dip * 1.4; this.pose[J.rKnee] -= dip * 1.4;
    this.pose[J.lThigh] -= dip * 0.8; this.pose[J.rThigh] -= dip * 0.8;
    this.pose[J.spinePitch] -= dip * 0.5;

    this.orient(dt, f);
    this.applyPose();
    this.applyIK(f);
  }

  // ---------------------------------------------------------------------------------------------
  private buildStatePose(dt: number, f: AnimFrame, p: Pose): void {
    const hs = hlen(f.vel);
    const t = f.stateTime;
    switch (f.state) {
      case 'Grounded': {
        this.locomotion(dt, hs, p, false);
        if (f.jumpCharge > 0) {
          const c = clamp(f.jumpCharge / T.ground.superJumpChargeTime, 0, 1);
          this.crouch(p, 0.4 + c * 0.6);
          p[J.lArmOut] += c * 0.5; p[J.rArmOut] += c * 0.5;
        }
        break;
      }
      case 'Landing': {
        // forward roll: tuck + the root rotation happens in orient()
        this.tuck(p, 1);
        break;
      }
      case 'Recovery': {
        // three-point landing, rising as the recovery completes
        const k = 1 - smoothstep(0.35, 1, t / T.landing.recoveryTime);
        p[J.hipY] = -0.55 * k;
        p[J.spinePitch] = 0.75 * k;
        p[J.lThigh] = 1.7 * k; p[J.lKnee] = 2.3 * k;
        p[J.rThigh] = 0.2 * k; p[J.rKnee] = 1.9 * k; p[J.rAbduct] = 0.25 * k;
        p[J.rShoulder] = 0.9 * k; p[J.rElbow] = 0.2; p[J.rArmOut] = 0.3 * k;
        p[J.lShoulder] = -0.3 * k; p[J.lArmOut] = 0.9 * k; p[J.lElbow] = 0.6 * k;
        p[J.headPitch] = -0.5 * k;
        break;
      }
      case 'Airborne':
      case 'PointLaunch': {
        this.airPose(f, p);
        if (f.state === 'PointLaunch') {
          const k = smoothstep(0, 0.12, t) * (1 - smoothstep(0.12, 0.35, t));
          this.tuck(p, k);
          const s = smoothstep(0.15, 0.4, t);
          p[J.lShoulder] = lerp(p[J.lShoulder], 2.7, s); p[J.rShoulder] = lerp(p[J.rShoulder], 2.5, s);
        }
        break;
      }
      case 'Trick': {
        this.airPose(f, p);
        const k = Math.sin(clamp(t / T.air.trickDuration, 0, 1) * Math.PI);
        this.tuck(p, k * (f.trickKind === 2 || f.trickKind === 3 ? 0.5 : 1));
        if (f.trickKind >= 2) { p[J.lArmOut] = 1.4; p[J.rArmOut] = 1.4; }
        break;
      }
      case 'Swinging': this.swingPose(f, p); break;
      case 'WebZip': {
        // both arms pulling along the line, legs trailing and tucking on arrival
        p[J.lShoulder] = 2.4; p[J.rShoulder] = 2.2; p[J.lElbow] = 0.5; p[J.rElbow] = 0.7;
        p[J.spinePitch] = -0.1;
        p[J.lThigh] = -0.2; p[J.rThigh] = 0.3; p[J.lKnee] = 0.7; p[J.rKnee] = 1.2;
        break;
      }
      case 'Perching': {
        this.crouch(p, 1);
        p[J.rShoulder] = 0.8; p[J.rElbow] = 0.3; p[J.rArmOut] = 0.1;
        p[J.lArmOut] = 0.5; p[J.lElbow] = 1.2;
        p[J.headPitch] = -0.25 + Math.sin(this.breath * 1.3) * 0.03;
        break;
      }
      case 'WallRunning': {
        if (f.wallMode === 'vertical') {
          this.locomotion(dt, 12, p, true);
          p[J.spinePitch] = -0.15;
          p[J.headPitch] = -0.4;
        } else {
          this.locomotion(dt, Math.max(10, hs), p, true);
        }
        break;
      }
      case 'WallCrawling': {
        const sp = f.vel.length();
        this.phase += dt * sp * 2.2;
        const s = Math.sin(this.phase), c = Math.cos(this.phase);
        const a = smoothstep(0.1, 1.5, sp);
        p[J.hipY] = -0.1;
        p[J.lShoulder] = 2.2 + s * 0.5 * a; p[J.rShoulder] = 2.2 - s * 0.5 * a;
        p[J.lArmOut] = 0.7; p[J.rArmOut] = 0.7; p[J.lElbow] = 1.4 + c * 0.3 * a; p[J.rElbow] = 1.4 - c * 0.3 * a;
        p[J.lThigh] = 0.6 - s * 0.5 * a; p[J.rThigh] = 0.6 + s * 0.5 * a;
        p[J.lAbduct] = 0.6; p[J.rAbduct] = 0.6; p[J.lKnee] = 1.7; p[J.rKnee] = 1.7;
        p[J.headPitch] = -0.7;
        if (a > 0.2 && Math.abs(s) < 0.08) this.maybeStep(true, sp);
        break;
      }
      case 'Vaulting': {
        const k = Math.sin(clamp(t / 0.35, 0, 1) * Math.PI);
        p[J.hipRoll] = 0.7 * k;
        p[J.lThigh] = 1.2 * k; p[J.rThigh] = 1.5 * k; p[J.lKnee] = 1.6 * k; p[J.rKnee] = 0.8 * k;
        p[J.rShoulder] = 0.6; p[J.rElbow] = 0.1; p[J.lArmOut] = 1.2 * k;
        break;
      }
      case 'Mantling': {
        const k = clamp(t / 0.35, 0, 1);
        p[J.lShoulder] = lerp(2.6, 0.3, k); p[J.rShoulder] = lerp(2.6, 0.3, k);
        p[J.lElbow] = lerp(0.3, 1.6, Math.sin(k * Math.PI)); p[J.rElbow] = p[J.lElbow];
        p[J.lThigh] = 1.6 * Math.sin(k * Math.PI); p[J.rThigh] = 0.8 * Math.sin(k * Math.PI);
        p[J.lKnee] = 2.0 * Math.sin(k * Math.PI); p[J.rKnee] = 1.4 * Math.sin(k * Math.PI);
        break;
      }
    }
  }

  /** Walk → jog → run → sprint blend space driven by speed, with footstep events. */
  private locomotion(dt: number, speed: number, p: Pose, wall: boolean): void {
    this.locoSpeed += (speed - this.locoSpeed) * damp(10, dt);
    const s = this.locoSpeed;
    if (s < 0.25 && !wall) {
      const b = Math.sin(this.breath * 1.7);
      p[J.chestPitch] = b * 0.02;
      p[J.lArmOut] = 0.14 + b * 0.01; p[J.rArmOut] = 0.14 + b * 0.01;
      p[J.headYaw] = Math.sin(this.breath * 0.3) * 0.25;
      return;
    }
    const run = smoothstep(2.5, 7, s), sprint = smoothstep(8, 15, s);
    const stride = lerp(1.3, lerp(2.4, 3.6, sprint), run);
    const prev = this.phase;
    this.phase += (dt * s * Math.PI * 2) / stride;
    // footstep at each half cycle
    if (Math.floor(prev / Math.PI) !== Math.floor(this.phase / Math.PI)) this.maybeStep(wall, s);
    const ph = this.phase;
    const sin = Math.sin(ph);
    const aT = lerp(0.38, lerp(0.85, 1.05, sprint), run);
    const kneeAmp = lerp(0.55, lerp(1.6, 2.1, sprint), run);
    p[J.lThigh] = aT * sin + 0.1 * run;
    p[J.rThigh] = -aT * sin + 0.1 * run;
    p[J.lKnee] = 0.12 + kneeAmp * Math.max(0, Math.sin(ph - 1.3)) + 0.25 * run;
    p[J.rKnee] = 0.12 + kneeAmp * Math.max(0, Math.sin(ph + Math.PI - 1.3)) + 0.25 * run;
    p[J.lFoot] = 0.3 * Math.sin(ph - 0.4) * run;
    p[J.rFoot] = -0.3 * Math.sin(ph - 0.4) * run;
    const aA = lerp(0.3, lerp(0.8, 1.2, sprint), run);
    p[J.lShoulder] = -aA * sin * 0.9 + 0.1;
    p[J.rShoulder] = aA * sin * 0.9 + 0.1;
    p[J.lElbow] = lerp(0.25, 1.45, run);
    p[J.rElbow] = lerp(0.25, 1.45, run);
    p[J.lArmOut] = 0.1; p[J.rArmOut] = 0.1;
    p[J.spinePitch] = lerp(0.04, lerp(0.22, 0.42, sprint), run);
    p[J.hipYaw] = sin * 0.12 * (0.4 + run);
    p[J.chestYaw] = -sin * 0.18 * (0.4 + run);
    p[J.hipY] = -Math.abs(Math.cos(ph)) * lerp(0.02, 0.08, run) + 0.02 * run;
    p[J.headPitch] = -p[J.spinePitch] * 0.6;
  }

  private maybeStep(wall: boolean, speed: number): void {
    this.steps.push({ wall, speed });
  }

  private airPose(f: AnimFrame, p: Pose): void {
    const vy = f.vel.y;
    const rise = smoothstep(-2, 6, vy);
    const fall = smoothstep(2, -14, vy);
    const t = this.breath;
    // rising: tucked legs, arms up; falling: spread and reaching, legs cycling slightly
    p[J.lThigh] = lerp(0.2, 0.9, rise) + Math.sin(t * 7) * 0.12 * fall;
    p[J.rThigh] = lerp(-0.1, 0.4, rise) - Math.sin(t * 7) * 0.12 * fall;
    p[J.lKnee] = lerp(0.5, 1.5, rise);
    p[J.rKnee] = lerp(0.9, 1.2, rise);
    p[J.lShoulder] = lerp(0.3, 1.6, rise); p[J.rShoulder] = lerp(0.1, 1.2, rise);
    p[J.lArmOut] = lerp(1.0, 0.4, rise) * (0.6 + 0.4 * fall); p[J.rArmOut] = p[J.lArmOut];
    p[J.lElbow] = 0.5; p[J.rElbow] = 0.6;
    p[J.spinePitch] = lerp(-0.15, 0.1, rise);
    // strong release: celebratory spread
    if (f.releaseQuality > 0.8 && f.stateTime < 0.5 && f.state === 'Airborne') {
      const k = Math.sin((f.stateTime / 0.5) * Math.PI);
      p[J.lArmOut] += 0.7 * k; p[J.rArmOut] += 0.7 * k; p[J.spinePitch] -= 0.3 * k;
    }
    if (f.diving) {
      // streamlined: arms back along the body, legs together and straight
      const d = 1;
      p[J.lShoulder] = lerp(p[J.lShoulder], -0.4, d); p[J.rShoulder] = lerp(p[J.rShoulder], -0.4, d);
      p[J.lArmOut] = 0.25; p[J.rArmOut] = 0.25; p[J.lElbow] = 0.1; p[J.rElbow] = 0.1;
      p[J.lThigh] = -0.05; p[J.rThigh] = 0.05; p[J.lKnee] = 0.15; p[J.rKnee] = 0.3;
      p[J.headPitch] = -0.4;
    }
  }

  private swingPose(f: AnimFrame, p: Pose): void {
    const a = f.swingAngle; // − before bottom, + after
    const g = clamp(f.tension / (T.physics.mass * T.physics.gravity * 3), 0, 1.5);
    const after = smoothstep(-5, 30, a);
    // legs trail on the down-swing, kick forward through the bottom and extend on the up-swing
    p[J.lThigh] = lerp(-0.35, 1.1, after); p[J.rThigh] = lerp(-0.1, 0.8, after);
    p[J.lKnee] = lerp(1.2, 0.35, after) + g * 0.3; p[J.rKnee] = lerp(0.8, 0.6, after) + g * 0.2;
    p[J.spinePitch] = lerp(-0.25, 0.15, after) - g * 0.1;
    p[J.chestPitch] = -0.1 * g;
    // free arm out for balance
    const free = this.webHand === 'R' ? 'l' : 'r';
    if (free === 'l') { p[J.lArmOut] = 1.1; p[J.lShoulder] = 0.4; p[J.lElbow] = 0.7; }
    else { p[J.rArmOut] = 1.1; p[J.rShoulder] = 0.4; p[J.rElbow] = 0.7; }
    p[J.headPitch] = -0.15;
  }

  private tuck(p: Pose, k: number): void {
    p[J.lThigh] = lerp(p[J.lThigh], 1.9, k); p[J.rThigh] = lerp(p[J.rThigh], 1.9, k);
    p[J.lKnee] = lerp(p[J.lKnee], 2.4, k); p[J.rKnee] = lerp(p[J.rKnee], 2.4, k);
    p[J.lShoulder] = lerp(p[J.lShoulder], 0.9, k); p[J.rShoulder] = lerp(p[J.rShoulder], 0.9, k);
    p[J.lElbow] = lerp(p[J.lElbow], 1.9, k); p[J.rElbow] = lerp(p[J.rElbow], 1.9, k);
    p[J.spinePitch] = lerp(p[J.spinePitch], 0.7, k);
    p[J.headPitch] = lerp(p[J.headPitch], 0.3, k);
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

  // ---------------------------------------------------------------------------------------------
  /** Root orientation: forward/up chosen per state from the physics, then smoothed. */
  private orient(dt: number, f: AnimFrame): void {
    const fwd = this._f.set(-Math.sin(f.facing), 0, -Math.cos(f.facing));
    const up = this._u.copy(UP);
    const hs = hlen(f.vel);
    const speed = f.vel.length();
    let rate = 12;
    this.extraQuat.identity();
    switch (f.state) {
      case 'Grounded': {
        // lean into horizontal acceleration (centripetal on turns, forward on starts)
        const lean = this._t.set(f.acc.x, 0, f.acc.z).multiplyScalar(0.018);
        if (lean.length() > 0.45) lean.setLength(0.45);
        up.add(lean).normalize();
        break;
      }
      case 'Swinging': {
        // hang along the web; hips follow the specific force (what the body feels)
        const toA = this._t.subVectors(f.anchor, f.pos).normalize();
        const sf = this._v.copy(f.acc).addScaledVector(UP, T.physics.gravity);
        if (sf.lengthSq() > 1) up.copy(toA).lerp(sf.normalize(), 0.3).normalize();
        else up.copy(toA);
        if (speed > 1) fwd.copy(f.vel).normalize();
        rate = 10;
        break;
      }
      case 'WebZip': {
        const to = this._t.subVectors(f.zipTarget, f.pos).normalize();
        up.lerp(to, 0.7).normalize();
        if (speed > 1) fwd.copy(f.vel).normalize();
        rate = 14;
        break;
      }
      case 'Airborne':
      case 'Trick':
      case 'PointLaunch': {
        if (speed > 2) {
          const vh = this._t.copy(f.vel).normalize();
          // pitch with the flight path: head leads when diving/falling fast
          const dive = f.diving ? 0.9 : smoothstep(-8, -30, f.vel.y) * 0.55;
          const launch = f.state === 'PointLaunch' ? 0.6 : smoothstep(4, 16, f.vel.y) * 0.35;
          up.lerp(vh, Math.max(dive, launch)).normalize();
          if (hs > 1) fwd.set(f.vel.x / hs, 0, f.vel.z / hs);
        }
        rate = f.diving ? 6 : 8;
        break;
      }
      case 'WallRunning':
        if (f.wallMode === 'vertical') {
          fwd.copy(f.wallNormal).negate();
          up.copy(UP);
        } else {
          up.copy(f.wallNormal);
          if (hs > 1) fwd.set(f.vel.x / hs, f.vel.y / hs * 0.3, f.vel.z / hs);
        }
        rate = 16;
        break;
      case 'WallCrawling':
        fwd.copy(f.wallNormal).negate();
        up.copy(UP);
        rate = 14;
        break;
      case 'Landing': {
        if (hs > 1) fwd.set(f.vel.x / hs, 0, f.vel.z / hs);
        const k = easeInOutSine(clamp(f.stateTime / T.landing.rollTime, 0, 1));
        this._l.crossVectors(UP, fwd).normalize();
        this.extraQuat.setFromAxisAngle(this._l, k * Math.PI * 2);
        rate = 30;
        break;
      }
      default:
        break;
    }
    if (f.state === 'Trick') {
      const k = easeOutCubic(clamp(f.stateTime / T.air.trickDuration, 0, 1));
      const ang = k * Math.PI * 2;
      if (f.trickKind === 0) this.extraQuat.setFromAxisAngle(this._l.set(1, 0, 0), ang);
      else if (f.trickKind === 1) this.extraQuat.setFromAxisAngle(this._l.set(1, 0, 0), -ang);
      else this.extraQuat.setFromAxisAngle(this._l.set(0, 0, 1), f.trickKind === 2 ? ang : -ang);
    }
    // basis: z = forward (⊥ up), y = up, x = up × forward (character's left)
    const z = this._p.copy(fwd).addScaledVector(up, -fwd.dot(up));
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1).addScaledVector(up, -up.z);
    z.normalize();
    const x = this._l.crossVectors(up, z).normalize();
    this.m4.makeBasis(x, up, z);
    this.targetQuat.setFromRotationMatrix(this.m4);
    // local-space extras (roll/flip) applied after the basis
    if (f.state === 'Landing') this.targetQuat.premultiply(this.extraQuat);
    else if (f.state === 'Trick') this.targetQuat.multiply(this.extraQuat);
    const k = f.state === 'Landing' || f.state === 'Trick' ? 1 : damp(rate, dt);
    this.bodyQuat.slerp(this.targetQuat, k);
    this.rig.root.position.copy(f.pos);
    this.rig.root.quaternion.copy(this.bodyQuat);
  }

  private applyPose(): void {
    const p = this.pose, r = this.rig;
    r.hips.position.y = 0.02 + p[J.hipY];
    r.hips.rotation.set(p[J.hipPitch], p[J.hipYaw], p[J.hipRoll], 'YXZ');
    r.spine.rotation.set(p[J.spinePitch], p[J.spineYaw], p[J.spineRoll], 'YXZ');
    r.chest.rotation.set(p[J.chestPitch], p[J.chestYaw], 0, 'YXZ');
    r.neck.rotation.set(p[J.neckPitch], 0, 0);
    r.head.rotation.set(p[J.headPitch], p[J.headYaw], 0, 'YXZ');
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

  /** Hands reach along the web; head looks where the camera looks (bounded). */
  private applyIK(f: AnimFrame): void {
    const r = this.rig;
    const reach = Rig.UPPER_ARM + Rig.FORE_ARM;
    const aimHand = (upper: typeof r.upperArmL, fore: typeof r.foreArmL, hand: typeof r.handL, point: Vector3, w: number) => {
      upper.getWorldPosition(this._p);
      const dir = this._t.subVectors(point, this._p);
      const d = dir.length();
      if (d < 1e-3) return;
      dir.multiplyScalar(1 / d);
      const target = this._v.copy(this._p).addScaledVector(dir, Math.min(d, reach * 0.97));
      // pole: behind and below the shoulder so the elbow bends naturally
      const pole = this._l.copy(this._p).addScaledVector(dir, 0.2);
      pole.y -= 0.5;
      solveTwoBone(upper, fore, hand, target, pole, w);
    };
    if (f.state === 'Swinging' && f.ropeActive) {
      if (this.webHand === 'R') aimHand(r.upperArmR, r.foreArmR, r.handR, f.anchor, 1);
      else aimHand(r.upperArmL, r.foreArmL, r.handL, f.anchor, 1);
    } else if (f.state === 'WebZip') {
      aimHand(r.upperArmR, r.foreArmR, r.handR, f.zipTarget, 0.9);
      aimHand(r.upperArmL, r.foreArmL, r.handL, f.zipTarget, 0.7);
    }
    // head look-at toward the camera direction, clamped relative to the chest
    if (f.state === 'Grounded' || f.state === 'Perching' || f.state === 'Airborne') {
      r.chest.getWorldQuaternion(this.targetQuat).invert();
      const local = this._t.copy(f.camForward).applyQuaternion(this.targetQuat);
      const yaw = clamp(Math.atan2(local.x, local.z), -0.9, 0.9);
      const pitch = clamp(-Math.asin(clamp(local.y, -1, 1)), -0.5, 0.6);
      r.head.rotation.y += yaw * 0.6;
      r.head.rotation.x += pitch * 0.5;
      r.head.updateMatrixWorld(true);
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
    return copyPose(this.tmpPose, this.pose);
  }
}
