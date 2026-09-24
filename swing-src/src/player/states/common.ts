import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { hlen, smoothstep } from '../../core/math';
import type { Intent } from '../../input/Intent';
import { FEET } from '../body';
import type { Player } from '../Player';
import type { StateId } from '../StateMachine';
import { Kind } from '../../world/CollisionWorld';

const _F = new Vector3();
const _m = new Vector3();
const _d = new Vector3();
const _c = new Vector3();

export const UPV = new Vector3(0, 1, 0);

/** Yaw (rad) of a horizontal vector; 0 = −Z, matching camera yaw. */
export function yawOf(x: number, z: number): number {
  return Math.atan2(-x, -z);
}

/** Desired horizontal direction from input (scaled by stick magnitude). */
export function desired(input: Intent, out: Vector3): Vector3 {
  return input.moveWorld(out);
}

/**
 * Ballistic step with drag, variable-height jump gravity, air steering and dive.
 *   F = m·g·s_jump − k|v|v + F_steer + F_dive ;  v += F/m·dt ;  x += v·dt
 */
export function airStep(p: Player, dt: number, input: Intent, allowSteer = true): void {
  const m = T.physics.mass;
  let gScale = 1;
  if (p.jumpHeldFromGround) {
    if (input.jump && p.vel.y > 0 && p.stateTime < 0.45) gScale = T.ground.jumpHoldGravityScale;
    else if (!input.jump) p.jumpHeldFromGround = false;
  }
  const diving = input.dive && !p.onGround;
  p.diveTime = diving ? p.diveTime + dt : 0;
  const F = _F.set(0, -m * T.physics.gravity * gScale, 0);
  const s = p.vel.length();
  const k = diving ? T.physics.diveDrag : T.physics.airDrag;
  F.addScaledVector(p.vel, -k * s);

  const d = desired(input, _m);
  const mag = d.length();
  if (allowSteer && mag > 0.05) {
    d.multiplyScalar(1 / mag);
    const hs = hlen(p.vel);
    const along = hs > 0.01 ? (p.vel.x * d.x + p.vel.z * d.z) : 0;
    // parallel: can build a little speed from standstill but can't thrust a fast flight
    if (along < T.air.airSteerMaxSpeedGain + 6) {
      F.x += d.x * m * T.air.airSteerAccel * mag;
      F.z += d.z * m * T.air.airSteerAccel * mag;
    }
    // perpendicular: turn the flight toward the input
    if (hs > 1) {
      const vx = p.vel.x / hs, vz = p.vel.z / hs;
      const dot = d.x * vx + d.z * vz;
      const px = d.x - vx * dot, pz = d.z - vz * dot;
      const turn = m * T.air.airSteerAccel * 1.1 * mag;
      F.x += px * turn;
      F.z += pz * turn;
      // conserve horizontal speed while turning (redirect rather than add)
    }
  }
  if (diving) {
    const cf = input.camForward;
    const dir = _d;
    if (cf.y < -0.25) dir.copy(cf);
    else {
      const hs = hlen(p.vel);
      dir.set(hs > 1 ? (p.vel.x / hs) * 0.35 : 0, -1, hs > 1 ? (p.vel.z / hs) * 0.35 : 0).normalize();
    }
    // the dive push fades out toward terminal speed: past it only gravity and drag act
    const along = p.vel.dot(dir);
    const a = (p.diveTime > 0.45 ? T.air.fastDiveAccel : T.air.diveAccel) * (1 - smoothstep(T.physics.maxDiveSpeed - 10, T.physics.maxDiveSpeed, along));
    F.addScaledVector(dir, m * a);
  }
  p.vel.addScaledVector(F, dt / m);
  // just after a swing the cap is gentle too, so letting go never feels like hitting a wall
  p.limitSpeed(dt, diving, !diving && p.timeSinceRelease < 1);
  p.moveAndCollide(dt);
  if (!p.onGround) p.timeSinceGround += dt;
  // face travel direction (or input when slow)
  const hs = hlen(p.vel);
  if (hs > 1.5) p.facing = approachYaw(p.facing, yawOf(p.vel.x, p.vel.z), 6 * dt);
}

export function approachYaw(cur: number, target: number, maxStep: number): number {
  let d = target - cur;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return cur + Math.max(-maxStep, Math.min(maxStep, d));
}

/** Classify a ground impact → next state. */
export function landState(p: Player): StateId {
  const impact = Math.max(0, -p.preImpactVel.y);
  p.landingImpact = impact;
  const hs = hlen(p.preImpactVel);
  if (p.rope.active) p.rope.detach();
  if (impact >= T.landing.hardSpeed || (impact >= T.landing.rollSpeed && hs <= 7)) {
    p.emit('hardLand', impact);
    return 'Recovery';
  }
  if (impact >= T.landing.rollSpeed) {
    p.emit('roll', impact);
    return 'Landing';
  }
  p.emit('land', impact);
  return 'Grounded';
}

/**
 * Transitions available whenever the player is in the air (Airborne, Trick, PointLaunch
 * after its lock-out). Order = priority.
 */
export function airTransitions(p: Player, input: Intent, allowWeb = true): StateId | null {
  if (input.zipPressed) {
    if (beginZip(p, input)) return 'WebZip';
  }
  // no web when about to touch down anyway (e.g. stepping off a kerb while sprinting)
  if (allowWeb && input.traverse && p.webCooldown <= 0 && p.feetY - p.surfaceBelow() > 2.5) {
    // a held swing chains straight into the next web after an automatic end-of-arc release; a fresh
    // press fires almost at once; a swing held through a manual release waits a moment (or a fall)
    const ready = p.chainPending ? p.timeSinceRelease >= T.web.chainDelay
      : input.traversePressed ? p.timeSinceRelease >= 0.1
      : p.timeSinceRelease > T.web.refireDelay || p.vel.y < -1;
    if (ready) {
      const d = desired(input, _m);
      if (d.lengthSq() < 0.01) {
        // no stick: keep the line you are already flying (falls back to the camera when slow)
        const hs = Math.hypot(p.vel.x, p.vel.z);
        if (hs > 4) d.set(p.vel.x / hs, 0, p.vel.z / hs).multiplyScalar(0.6);
        else input.camForwardFlat(d).multiplyScalar(0.6);
      }
      if (p.tryAttachWeb(input, d)) { p.chainPending = false; return 'Swinging'; }
    }
  }
  return null;
}

/** After an air move: react to contacts. */
export function airContacts(p: Player, input: Intent): StateId | null {
  if (p.onGround && p.vel.y <= 0.5) return landState(p);
  if (p.wallContact) {
    // ledge first: grab the lip if it's within reach
    const fwd = _c.copy(p.wallContactNormal).multiplyScalar(-1);
    if (p.vel.y < 9 && p.findLedge(fwd, 2.4, 0.9, p.moveTo)) return 'Mantling';
    if (p.wallBox >= 0 && p.world.kind[p.wallBox] & Kind.Low) return null; // don't stick to HVAC
    p.wallNormal.copy(p.wallContactNormal);
    if (input.traverse) return 'WallRunning';
    return 'WallCrawling';
  }
  return null;
}

/**
 * Choose zip target: perch point under reticle, else geometry along the camera. Point zips are
 * always available; forward zips in the air are a limited burst (one per air phase by default).
 */
export function beginZip(p: Player, input: Intent): boolean {
  if (p.perchTarget) {
    p.zipPoint = p.perchTarget;
    p.zipTarget.set(p.zipPoint.x, p.zipPoint.y + FEET + 0.05, p.zipPoint.z);
    return true;
  }
  const airborne = !p.onGround && p.feetY - p.surfaceBelow() > 1;
  if (airborne && p.airZips >= T.zip.maxAirZips) {
    p.emit('webFail');
    return false;
  }
  const dir = _d.copy(input.camForward);
  dir.y = Math.max(dir.y, 0.08);
  dir.normalize();
  const eye = _c.set(p.pos.x, p.pos.y + 0.6, p.pos.z);
  if (p.world.raycast(eye, dir, T.zip.zipForwardDistance, p.hit, Kind.NoWeb, true) && p.hit.t > 6) {
    p.zipPoint = null;
    p.zipTarget.copy(p.hit.point);
    if (airborne) p.airZips++;
    return true;
  }
  p.emit('webFail');
  return false;
}

export function doJump(p: Player, speed: number, superJump: boolean): StateId {
  p.vel.y = speed;
  p.jumpHeldFromGround = !superJump;
  p.onGround = false;
  p.timeSinceGround = 1;
  p.jumpCharge = 0;
  p.jumpBufferT = 0;
  p.emit(superJump ? 'superJump' : 'jump', speed);
  return 'Airborne';
}

/**
 * Kick off a wall. From a horizontal run the launch keeps the run speed (plus a push off the wall)
 * so it flows into the next swing: with swing held the next web fires almost at once. Otherwise
 * it is a kick away from the wall, biased toward where the camera looks.
 */
export function wallJump(p: Player, input: Intent): StateId {
  const n = p.wallNormal;
  if (p.state === 'WallRunning' && p.wallMode === 'horizontal') {
    const sx = n.z * p.wallSide, sz = -n.x * p.wallSide; // run direction along the wall
    const run = Math.max(Math.abs(p.vel.x * sx + p.vel.z * sz), T.wall.wallRunSpeed) * 0.97;
    p.vel.set(sx * run + n.x * T.wall.wallLaunchOut, T.wall.wallLaunchUp, sz * run + n.z * T.wall.wallLaunchOut);
    p.facing = yawOf(p.vel.x, p.vel.z);
  } else {
    const cf = input.camForwardFlat(_d);
    const dir = _c.copy(n);
    if (cf.dot(n) > 0.1) dir.add(cf).normalize();
    p.vel.set(dir.x * T.wall.wallJumpOut, T.wall.wallJumpUp, dir.z * T.wall.wallJumpOut);
    p.facing = yawOf(dir.x, dir.z);
  }
  p.pos.addScaledVector(n, 0.1);
  p.timeSinceRelease = 0;
  p.chainPending = true;
  p.emit('wallJump');
  return 'Airborne';
}
