import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { clamp, smoothstep } from '../core/math';
import type { WebRope } from './WebRope';
import type { CollisionWorld, RayHit } from '../world/CollisionWorld';
import { makeHit } from '../world/CollisionWorld';

/** Per-step breakdown of swing forces, kept for debug drawing. */
export interface SwingForceDebug {
  gravity: Vector3;
  drag: Vector3;
  pump: Vector3;
  steer: Vector3;
  assist: Vector3;
  spring: number;
}

export function makeSwingDebug(): SwingForceDebug {
  return { gravity: new Vector3(), drag: new Vector3(), pump: new Vector3(), steer: new Vector3(), assist: new Vector3(), spring: 0 };
}

/**
 * What the swing knows beyond the body and the rope. Gameplay always passes one; calling
 * `accumulateSwingForces` without it gives the plain pendulum used by the physics tests.
 */
export interface SwingContext {
  /** Unit horizontal direction the swing holds: the stick when pushed, else the heading at attach. */
  heading: Vector3;
  /** Whether `heading` comes from the stick this step. */
  stick: boolean;
  /** Swing Assist 0..1 (tuning strength / 10). */
  assist: number;
  /** Horizontal distance to a facade on the left / right of the heading (Infinity = none close). */
  wallLeft: number;
  wallRight: number;
}

export function makeSwingContext(): SwingContext {
  return { heading: new Vector3(0, 0, -1), stick: false, assist: 1, wallLeft: Infinity, wallRight: Infinity };
}

/** Swing Assist as 0..1 from the single 0–10 tuning value. */
export function assistLevel(): number {
  return clamp(T.assist.strength / 10, 0, 1);
}

/**
 * Gravity felt on the rope this step. The arc is stylised to feel like a pull rather than a float:
 * dropping forward into the swing is heavier than g, the climb out of it slightly lighter, so the
 * bottom of every forward arc is fast and the web visibly yanks you through it. Without a context
 * (the physics tests) it is the plain symmetric pendulum.
 */
export function swingGravity(vel: Vector3, ctx?: SwingContext | null): number {
  const g = T.physics.gravity * T.web.swingGravityScale;
  if (!ctx) return g;
  const fwd = vel.x * ctx.heading.x + vel.z * ctx.heading.z;
  if (vel.y < 0 && fwd > 0) return g * (1 + T.web.downswingPull);
  if (vel.y > 0 && fwd > 0) return g * (1 - T.web.upswingLift);
  return g;
}

const _t = new Vector3();
const _lat = new Vector3();
const _vh = new Vector3();
const _probe = new Vector3();
const _hit: RayHit = makeHit();
const _assistStart = new Vector3();

/**
 * Accumulate all forces acting on a swinging body into F (Newtons).
 *   F = m·g_eff + F_drag + F_pump + F_steer + F_assist + F_spring
 * `desired` is a horizontal world direction scaled by stick magnitude (0..1).
 * `groundY` is the height of the surface under the player (used by ground-avoid assist).
 */
export function accumulateSwingForces(
  pos: Vector3,
  vel: Vector3,
  rope: WebRope,
  desired: Vector3,
  groundY: number,
  world: CollisionWorld | null,
  F: Vector3,
  dbg?: SwingForceDebug,
  ctx?: SwingContext | null,
): void {
  const m = T.physics.mass;
  const g = swingGravity(vel, ctx);
  rope.measure(pos, vel, g);
  const rHat = rope.dir;
  const a = ctx ? ctx.assist : assistLevel();

  // gravity
  F.set(0, -m * g, 0);
  dbg?.gravity.set(0, -m * g, 0);

  // quadratic drag, partly suppressed while swinging (speed preservation)
  const speed = vel.length();
  const k = T.physics.airDrag * (1 - T.web.swingSpeedPreservation);
  F.addScaledVector(vel, -k * speed);
  dbg?.drag.copy(vel).multiplyScalar(-k * speed);

  // player input: tangential pump + out-of-plane steering. Pushing along the motion on the
  // down-swing adds energy like a pumping swinger; pulling against it brakes; turning costs a
  // share of the turn force.
  const inMag = desired.length();
  dbg?.pump.set(0, 0, 0);
  dbg?.steer.set(0, 0, 0);
  let turnForce = 0;
  const vt = _vh.copy(vel).addScaledVector(rHat, -vel.dot(rHat));
  const vtl = vt.length();
  if (vtl > 1e-6) vt.multiplyScalar(1 / vtl);
  if (inMag > 0.05 && rope.taut) {
    // project desired onto tangent plane of the sphere
    const t = _t.copy(desired).addScaledVector(rHat, -desired.dot(rHat));
    const tl = t.length();
    if (tl > 1e-4) {
      t.multiplyScalar(1 / tl);
      const down = vel.y < 0;
      const phase = down ? 1 : T.web.upswingPumpScale;
      if (vtl > 1.5) {
        const along = t.dot(vt);
        const pump = Math.max(0, along) * T.web.pumpForce * phase * inMag;
        const brake = Math.max(0, -along) * T.web.steerBrakeForce * inMag;
        F.addScaledVector(vt, pump - brake);
        dbg?.pump.copy(vt).multiplyScalar(pump - brake);
        // steer: component of desired perpendicular to motion within tangent plane
        const lat = _lat.copy(t).addScaledVector(vt, -along);
        const steer = T.web.swingSteerForce * inMag;
        F.addScaledVector(lat, steer);
        dbg?.steer.copy(lat).multiplyScalar(steer);
        turnForce += lat.length() * steer;
      } else {
        // nearly stationary: push to start swinging
        F.addScaledVector(t, T.web.pumpForce * 2 * inMag);
        dbg?.pump.copy(t).multiplyScalar(T.web.pumpForce * 2 * inMag);
      }
    }
  }

  // --- assistance forces (never position overrides), all scaled by Swing Assist ---
  const assistStart = _assistStart.copy(F);
  if (a > 0) {
    // forward momentum assistance
    if (inMag > 0.1) {
      F.x += desired.x * T.assist.forwardAssistForce * a;
      F.z += desired.z * T.assist.forwardAssistForce * a;
    }
    // predictive ground avoidance: lift grows as predicted clearance shrinks
    const feet = pos.y - 0.9 - groundY;
    const predicted = feet + Math.min(0, vel.y) * 0.45;
    const want = T.assist.groundClearance * a;
    if (predicted < want) {
      const u = smoothstep(want, T.assist.minSwingAltitude * 0.3 * a, predicted);
      F.y += T.assist.groundAvoidForce * u * a;
    }
    // reference heading for arc correction: the held heading, else stick, else travel
    let fx = 0, fz = 0;
    if (ctx) { fx = ctx.heading.x; fz = ctx.heading.z; }
    else {
      const dl = Math.hypot(desired.x, desired.z);
      if (dl > 0.05) { fx = desired.x / dl; fz = desired.z / dl; }
      else {
        const hs = Math.hypot(vel.x, vel.z);
        if (hs >= 2) { fx = vel.x / hs; fz = vel.z / hs; }
      }
    }
    if (fx !== 0 || fz !== 0) {
      const lx = -fz, lz = fx; // left perpendicular of the heading
      // swing-plane assist: cancel part of the rope's sideways pull so the arc follows the
      // street instead of pendulum-ing into the facade the anchor is on
      const pa = T.assist.swingPlaneAssist * a;
      if (pa > 0 && rope.taut && rope.tension > 0) {
        const tx = -rHat.x * rope.tension, tz = -rHat.z * rope.tension;
        const across = tx * lx + tz * lz;
        const cap = m * 45;
        const c = clamp(across, -cap, cap) * pa;
        F.x -= lx * c;
        F.z -= lz * c;
      }
      // arc correction: damp sideways drift relative to the heading (no stick = keep going
      // straight). Correction is a turn, so it pays the same speed cost as steering.
      if (ctx && rope.taut) {
        const vLat = vel.x * lx + vel.z * lz;
        const acc = clamp(-vLat * T.assist.arcCorrection * a, -T.assist.arcCorrectionMaxAccel * a, T.assist.arcCorrectionMaxAccel * a);
        F.x += lx * acc * m;
        F.z += lz * acc * m;
        turnForce += Math.abs(acc) * m * (ctx.stick ? 1 : 0.25);
      }
      // street centring: a facade close beside the swing pushes you back over the street
      if (ctx && (ctx.wallLeft < T.assist.streetCenterRange || ctx.wallRight < T.assist.streetCenterRange)) {
        const r0 = T.assist.streetCenterRange;
        const wl = smoothstep(r0, 1.5, ctx.wallLeft), wr = smoothstep(r0, 1.5, ctx.wallRight);
        const push = (wl - wr) * T.assist.streetCentering * m * a; // + = push right (away from the left wall)
        F.x -= lx * push;
        F.z -= lz * push;
      }
    }
    // wall-slam protection: probe along velocity, push sideways off the obstacle
    if (world && speed > 6) {
      const look = Math.min(26, speed * 0.4);
      _probe.copy(vel).multiplyScalar(1 / speed);
      if (world.raycast(pos, _probe, look, _hit, 0, false) && Math.abs(_hit.normal.y) < 0.5) {
        const urgency = 1 - _hit.t / look;
        // lateral direction: the wall normal minus its component along velocity
        const n = _lat.copy(_hit.normal).addScaledVector(_probe, -_hit.normal.dot(_probe));
        const nl = n.length();
        // steering into the wall on purpose means "take me there": the swing becomes a wall run
        let into = 0;
        if (ctx?.stick && inMag > 0.05) into = Math.max(0, -(desired.x * _hit.normal.x + desired.z * _hit.normal.z) / inMag);
        const f = T.assist.cornerAvoidForce * urgency * a * (1 - smoothstep(0.35, 0.75, into));
        if (nl > 1e-3) F.addScaledVector(n, f / nl);
        else F.addScaledVector(_hit.normal, f * 0.5);
      }
    }
  }
  // turning is not free: part of the sideways force comes out of the speed along the arc
  if (turnForce > 0 && vtl > 3) F.addScaledVector(vt, -turnForce * T.web.turnSpeedCost);
  dbg?.assist.copy(F).sub(assistStart);

  // elastic web spring (after measure)
  const s = rope.applyForces(pos, vel, F);
  if (dbg) dbg.spring = s;
}

/**
 * Auto-shorten/extend the rope target so the arc bottom keeps ground clearance. Part of Swing
 * Assist: at 0 the rope keeps whatever length it was fired with and the street is fair game.
 */
export function updateRopeTarget(rope: WebRope, pos: Vector3, groundY: number, wantLow: boolean, assist = assistLevel()): void {
  if (assist <= 0) return;
  const clearance = T.assist.groundClearance * assist;
  // bottom of the arc is directly below the anchor at distance L
  const maxSafe = rope.anchor.y - groundY - clearance - 0.9;
  let target = rope.targetLength;
  if (T.assist.autoShorten && rope.length > maxSafe) target = Math.max(T.web.minLength, maxSafe);
  else if (T.assist.autoExtend && wantLow && rope.length < maxSafe - 6 && pos.y > rope.anchor.y - rope.length * 0.3) {
    // lengthen on the way in so the arc sweeps lower and faster
    target = Math.min(maxSafe - 2, T.web.maxLength, rope.length + 8);
  }
  rope.targetLength = target;
}

/**
 * Where in its arc a swing is, from the rope geometry and the energy it carries.
 * Returns the arc phase in −1..1: −1 = the far end of the down-swing, 0 = the bottom, +1 = the end
 * of the up-swing (its apex, or level with the anchor where the web goes slack). `out.end` is the
 * end-of-arc angle (deg) and `out.omega` the angular speed (deg/s).
 */
export function arcPhase(rope: WebRope, out: { phase: number; end: number; omega: number }): void {
  const L = Math.max(1, rope.length);
  const a = Math.abs(rope.swingAngle) * (Math.PI / 180);
  const g = T.physics.gravity * T.web.swingGravityScale;
  const h = L * (1 - Math.cos(Math.min(a, Math.PI)));
  const hMax = h + (rope.tangentialSpeed * rope.tangentialSpeed) / (2 * g);
  const c = 1 - hMax / L;
  const amp = c <= 0 ? 90 : Math.min(90, Math.acos(Math.min(1, c)) * (180 / Math.PI));
  out.end = Math.max(12, amp);
  out.phase = clamp(rope.swingAngle / out.end, -1, 1);
  out.omega = (rope.tangentialSpeed / L) * (180 / Math.PI);
}

/** Swing-jump launch (m/s, horizontal-forward and up) for a jump at arc phase `phase`. */
export function swingJumpImpulse(phase: number, perfect: number, out: { fwd: number; up: number }): { fwd: number; up: number } {
  const W = T.web;
  if (phase < -0.15) {
    // still dropping into the arc: the web lets go and you only get a small hop
    out.fwd = 0;
    out.up = W.swingJumpHop;
    return out;
  }
  // bottom → mostly horizontal-forward; late in the up-swing → mostly up
  const k = smoothstep(-0.1, 0.92, phase);
  const pitch = (W.swingJumpPitchBottom + (W.swingJumpPitchLate - W.swingJumpPitchBottom) * k) * (Math.PI / 180);
  // entering the arc (−0.15..0) ramps up from the hop to a full jump
  const ramp = phase < 0 ? 0.55 + 0.45 * smoothstep(-0.15, 0, phase) : 1;
  const mag = W.swingJumpSpeed * ramp * (1 + W.swingJumpPerfectBonus * clamp(perfect, 0, 1));
  out.fwd = mag * Math.cos(pitch);
  out.up = Math.max(mag * Math.sin(pitch), phase < 0 ? W.swingJumpHop : 0);
  return out;
}

/**
 * Timing grade of a swing jump: 1 inside the perfect window centred on the leg-tuck point of the
 * up-swing, falling to 0 outside it. The window is in time, so it is the same at any speed.
 */
export function swingJumpPerfect(phase: number, end: number, omega: number): number {
  if (phase <= 0) return 0;
  const tuck = T.web.swingJumpTuckPhase * end;
  const dt = (phase * end - tuck) / Math.max(omega, 5); // s from the tuck (+ = late)
  const half = T.web.swingJumpPerfectWindow * 0.5;
  if (Math.abs(dt) <= half) return 1;
  return clamp(1 - (Math.abs(dt) - half) / half, 0, 1) * 0.6; // near miss: partial credit
}
