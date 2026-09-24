import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { smoothstep } from '../core/math';
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
): void {
  const m = T.physics.mass;
  const g = T.physics.gravity * T.web.swingGravityScale;
  rope.measure(pos, vel, g);
  const rHat = rope.dir;

  // gravity
  F.set(0, -m * g, 0);
  dbg?.gravity.set(0, -m * g, 0);

  // quadratic drag, partly suppressed while swinging (speed preservation)
  const speed = vel.length();
  const k = T.physics.airDrag * (1 - T.web.swingSpeedPreservation);
  F.addScaledVector(vel, -k * speed);
  dbg?.drag.copy(vel).multiplyScalar(-k * speed);

  // player input: tangential pump + out-of-plane steering
  const inMag = desired.length();
  dbg?.pump.set(0, 0, 0);
  dbg?.steer.set(0, 0, 0);
  if (inMag > 0.05 && rope.taut) {
    // project desired onto tangent plane of the sphere
    const t = _t.copy(desired).addScaledVector(rHat, -desired.dot(rHat));
    const tl = t.length();
    if (tl > 1e-4) {
      t.multiplyScalar(1 / tl);
      // swing direction = tangential velocity direction
      const vt = _vh.copy(vel).addScaledVector(rHat, -vel.dot(rHat));
      const vtl = vt.length();
      const down = vel.y < 0; // down-swing: pushing adds energy like a pumping swinger
      const phase = down ? 1 : T.web.upswingPumpScale;
      if (vtl > 1.5) {
        vt.multiplyScalar(1 / vtl);
        const along = t.dot(vt);
        // pump along motion
        const pump = Math.max(0, along) * T.web.pumpForce * phase * inMag;
        F.addScaledVector(vt, pump);
        dbg?.pump.copy(vt).multiplyScalar(pump);
        // steer: component of desired perpendicular to motion within tangent plane
        const lat = _lat.copy(t).addScaledVector(vt, -along);
        const steer = T.web.swingSteerForce * inMag;
        F.addScaledVector(lat, steer);
        dbg?.steer.copy(lat).multiplyScalar(steer);
        // turn assist: lateral force m·|v|·ω toward desired when heading differs a lot
        if (T.assist.enabled && along < 0.5) {
          const w = T.assist.turnAssist * 1.4 * (0.5 - along);
          const hl = Math.hypot(lat.x, lat.z);
          if (hl > 1e-3) {
            const fl = m * Math.min(vtl, 40) * w;
            F.x += (lat.x / hl) * fl;
            F.z += (lat.z / hl) * fl;
            dbg?.steer.addScaledVector(_lat.set(lat.x / hl, 0, lat.z / hl), fl);
          }
        }
      } else {
        // nearly stationary: push to start swinging
        F.addScaledVector(t, T.web.pumpForce * inMag);
        dbg?.pump.copy(t).multiplyScalar(T.web.pumpForce * inMag);
      }
    }
  }

  // --- assistance forces (never position overrides) ---
  const assistStart = _assistStart.copy(F);
  if (T.assist.enabled) {
    // forward momentum assistance
    if (inMag > 0.1) {
      F.x += desired.x * T.assist.forwardAssistForce;
      F.z += desired.z * T.assist.forwardAssistForce;
    }
    // predictive ground avoidance: lift grows as predicted clearance shrinks
    const feet = pos.y - 0.9 - groundY;
    const tHorizon = 0.45;
    const predicted = feet + Math.min(0, vel.y) * tHorizon;
    const want = T.assist.groundClearance;
    if (predicted < want) {
      const u = smoothstep(want, T.assist.minSwingAltitude * 0.3, predicted);
      F.y += T.assist.groundAvoidForce * u;
      // bleed some downward speed into forward speed rather than losing it
    }
    // swing-plane assist: cancel part of the rope's sideways pull (relative to where the player
    // wants to go) so swings follow the street instead of arcing into the facade
    const pa = T.assist.swingPlaneAssist;
    if (pa > 0 && rope.taut && rope.tension > 0) {
      const dl = Math.hypot(desired.x, desired.z);
      let fx: number, fz: number;
      if (dl > 0.05) { fx = desired.x / dl; fz = desired.z / dl; }
      else {
        const hs = Math.hypot(vel.x, vel.z);
        if (hs < 2) { fx = 0; fz = 0; } else { fx = vel.x / hs; fz = vel.z / hs; }
      }
      if (fx !== 0 || fz !== 0) {
        // tension force = −r̂·T ; its horizontal part across the travel direction
        const tx = -rHat.x * rope.tension, tz = -rHat.z * rope.tension;
        const lx = -fz, lz = fx; // left perpendicular
        const across = tx * lx + tz * lz;
        const cap = m * 45;
        const c = Math.max(-cap, Math.min(cap, across)) * pa;
        F.x -= lx * c;
        F.z -= lz * c;
      }
    }
    // corner avoidance: probe along velocity, push sideways off the obstacle
    if (world && speed > 6) {
      const look = Math.min(26, speed * 0.4);
      _probe.copy(vel).multiplyScalar(1 / speed);
      if (world.raycast(pos, _probe, look, _hit, 0, false) && Math.abs(_hit.normal.y) < 0.5) {
        const urgency = 1 - _hit.t / look;
        // lateral direction: the wall normal minus its component along velocity
        const n = _lat.copy(_hit.normal).addScaledVector(_probe, -_hit.normal.dot(_probe));
        const nl = n.length();
        if (nl > 1e-3) F.addScaledVector(n, (T.assist.cornerAvoidForce * urgency) / nl);
        else F.addScaledVector(_hit.normal, T.assist.cornerAvoidForce * urgency * 0.5);
      }
    }
  }
  dbg?.assist.copy(F).sub(assistStart);

  // elastic web spring (after measure)
  const s = rope.applyForces(pos, vel, F);
  if (dbg) dbg.spring = s;
}

/** Auto-shorten/extend the rope target so the arc bottom keeps ground clearance. */
export function updateRopeTarget(rope: WebRope, pos: Vector3, groundY: number, wantLow: boolean): void {
  if (!T.assist.enabled) return;
  const clearance = T.assist.groundClearance;
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
