import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { clamp, hlen, smoothstep } from '../../core/math';
import { Kind } from '../../world/CollisionWorld';
import { registerState, type StateId } from '../StateMachine';
import type { Player } from '../Player';
import type { Intent } from '../../input/Intent';
import {
  accumulateSwingForces, arcPhase, assistLevel, swingJumpImpulse, swingJumpPerfect, updateRopeTarget,
} from '../../web/SwingModel';
import { beginZip, desired, landState, yawOf, approachYaw } from './common';

const _F = new Vector3();
const _d = new Vector3();
const _e = new Vector3();
const _dir = new Vector3();
const _hold = new Vector3();
const _arc = { phase: 0, end: 90, omega: 0 };
const _jump = { fwd: 0, up: 0 };

/**
 * Release timing grade (0..1) from the arc phase (−1..1, see `arcPhase`). Letting go on the
 * down-swing earns nothing (you just drop); the forward throw builds through the up-swing and is
 * best in the last third of it, where the arc turns you loose flying forward.
 */
export function releaseQuality(phase: number, vy: number): number {
  if (phase <= 0 || vy < -2) return 0;
  return smoothstep(0.18, 0.62, phase);
}

/**
 * Let go of the web: keep momentum and add a timing-graded forward throw. `auto` is the release a
 * held swing makes by itself at the end of its arc; it throws less than a well-timed manual release
 * and queues the next web (chain).
 */
export function releaseWeb(p: Player, auto = false): StateId {
  const r = p.rope;
  // a boost has to be earned by an actual swing: tap-releasing right after attaching gets nothing
  const q = releaseQuality(p.swingPhase, p.vel.y) * smoothstep(0.12, 0.45, r.age);
  const throwQ = q * (auto ? T.web.autoReleaseScale : 1);
  p.releaseQuality = q;
  const hs = hlen(p.vel);
  if (hs > 0.5) {
    p.vel.x += (p.vel.x / hs) * T.web.releaseBoost * throwQ;
    p.vel.z += (p.vel.z / hs) * T.web.releaseBoost * throwQ;
  }
  p.vel.y += T.web.releaseUpBoost * throwQ;
  r.detach();
  p.timeSinceRelease = 0;
  p.webCooldown = Math.max(p.webCooldown, 0.08);
  p.chainPending = auto;
  p.emit('webRelease', q);
  return 'Airborne';
}

/**
 * Jump off the web. Where in the arc decides the launch: dropping in → a small hop; the bottom →
 * mostly horizontal-forward; late in the up-swing → mostly up. Pressing inside the perfect window
 * at the leg tuck gives the biggest launch and a 'swingJump' event with quality 1.
 */
export function swingJump(p: Player, input: Intent): StateId {
  const r = p.rope;
  const settled = smoothstep(0.1, 0.35, r.age); // no free launch from tapping jump right after a catch
  const perfect = swingJumpPerfect(p.swingPhase, p.swingArcEnd, p.swingOmega) * (r.age > 0.25 ? 1 : 0);
  swingJumpImpulse(p.swingPhase, perfect, _jump);
  // forward = travel direction, bent toward the stick so the jump can be aimed
  let fx = 0, fz = 0;
  const hs = hlen(p.vel);
  if (hs > 1) { fx = p.vel.x / hs; fz = p.vel.z / hs; } else { fx = p.swingCtx.heading.x; fz = p.swingCtx.heading.z; }
  const d = desired(input, _d);
  if (d.lengthSq() > 0.01) {
    const dl = d.length();
    fx += (d.x / dl) * 0.6; fz += (d.z / dl) * 0.6;
    const l = Math.hypot(fx, fz) || 1;
    fx /= l; fz /= l;
  }
  p.vel.x += fx * _jump.fwd * settled;
  p.vel.z += fz * _jump.fwd * settled;
  p.vel.y += _jump.up * (0.4 + 0.6 * settled);
  const q = perfect >= 1 ? 1 : perfect;
  p.swingJumpQuality = q;
  p.swingJumpPhase = p.swingPhase;
  p.releaseQuality = q;
  r.detach();
  p.timeSinceRelease = 0;
  p.webCooldown = Math.max(p.webCooldown, 0.08);
  p.chainPending = false;
  p.emit('swingJump', q);
  p.emit('webRelease', q);
  return 'Airborne';
}

/**
 * Height of whatever lies under the lowest point of the current arc. With the swing-plane
 * assist the arc bottom is the anchor projected onto the vertical plane of travel.
 */
function arcBottomGround(p: Player): number {
  const r = p.rope;
  const hs = hlen(p.vel);
  let bx = r.anchor.x, bz = r.anchor.z;
  if (hs > 2) {
    const fx = p.vel.x / hs, fz = p.vel.z / hs;
    const t = (r.anchor.x - p.pos.x) * fx + (r.anchor.z - p.pos.z) * fz;
    if (t > 0) { bx = p.pos.x + fx * t; bz = p.pos.z + fz * t; } else return 0;
  }
  _e.set(bx, Math.min(r.anchor.y - 1, p.pos.y + 60), bz);
  return p.world.heightBelow(_e, 400);
}

/** Horizontal distance to facades left and right of the held heading (for street centring). */
function probeFacades(p: Player): void {
  const c = p.swingCtx;
  const h = c.heading;
  const range = T.assist.streetCenterRange + 4;
  _e.set(p.pos.x, p.pos.y, p.pos.z);
  // "left" follows SwingModel's convention: l = (−h.z, 0, h.x); "right" is −l
  _dir.set(-h.z, 0, h.x);
  c.wallLeft = p.world.raycast(_e, _dir, range, p.hit, Kind.NoWeb | Kind.Low, false) && Math.abs(p.hit.normal.y) < 0.3 ? p.hit.t : Infinity;
  _dir.set(h.z, 0, -h.x);
  c.wallRight = p.world.raycast(_e, _dir, range, p.hit, Kind.NoWeb | Kind.Low, false) && Math.abs(p.hit.normal.y) < 0.3 ? p.hit.t : Infinity;
}

/** Update the swing's arc phase and the tuck cue after the rope has been measured. */
function updatePhase(p: Player): void {
  arcPhase(p.rope, _arc);
  p.swingPhase = _arc.phase;
  p.swingArcEnd = _arc.end;
  p.swingOmega = _arc.omega;
  // tuck cue: 1 at the ideal jump moment, easing in/out over ~2 windows around it
  const tuck = T.web.swingJumpTuckPhase * _arc.end;
  const dtTuck = (_arc.phase * _arc.end - tuck) / Math.max(_arc.omega, 5);
  p.swingTuck = _arc.phase > 0 ? clamp(1 - Math.abs(dtTuck) / (T.web.swingJumpPerfectWindow * 2), 0, 1) : 0;
}

registerState({
  id: 'Swinging',
  group: 'Web',
  enter(p, _from, input) {
    p.emit('webAttach', p.rope.length);
    p.losTimer = 0;
    p.arcGroundTimer = 0;
    p.wallProbeT = 0;
    p.chainPending = false;
    // the heading this swing holds: the stick if pushed, else where we are already going
    const c = p.swingCtx;
    const d = input ? desired(input, _d) : _d.set(0, 0, 0);
    const hs = hlen(p.vel);
    if (d.lengthSq() > 0.01) c.heading.copy(d).setY(0).normalize();
    else if (hs > 2) c.heading.set(p.vel.x / hs, 0, p.vel.z / hs);
    else {
      const ax = p.rope.anchor.x - p.pos.x, az = p.rope.anchor.z - p.pos.z;
      const al = Math.hypot(ax, az);
      if (al > 0.5) c.heading.set(ax / al, 0, az / al);
      else if (input) input.camForwardFlat(c.heading);
    }
    c.wallLeft = c.wallRight = Infinity;
    p.swingPhase = -1;
    p.swingTuck = 0;
  },
  exit(p) {
    if (p.rope.active) p.rope.detach();
    p.swingTuck = 0;
  },
  step(p, dt, input: Intent) {
    const r = p.rope;
    if (!r.active) return 'Airborne';
    if (input.jumpPressed) return swingJump(p, input);
    if (!input.traverse) return releaseWeb(p, false);
    if (input.zipPressed) {
      r.detach();
      if (beginZip(p, input)) return 'WebZip';
      return 'Airborne';
    }

    const m = T.physics.mass;
    const c = p.swingCtx;
    c.assist = assistLevel();
    // the stick steers anywhere; with no stick the swing keeps the heading it started with
    const stick = desired(input, _d);
    c.stick = stick.lengthSq() >= 0.01;
    let des: Vector3;
    if (c.stick) {
      c.heading.copy(stick).setY(0).normalize();
      des = stick;
    } else des = _hold.copy(c.heading).multiplyScalar(T.web.noStickPump);
    // ground under the player and under the bottom of the arc ahead (roofs in the path count)
    p.arcGroundTimer -= dt;
    if (p.arcGroundTimer <= 0) {
      p.arcGroundTimer = 0.08;
      p.arcGroundY = arcBottomGround(p);
    }
    p.wallProbeT -= dt;
    if (p.wallProbeT <= 0) {
      p.wallProbeT = 0.066;
      if (c.assist > 0) probeFacades(p);
      else c.wallLeft = c.wallRight = Infinity;
    }
    const groundY = Math.max(p.surfaceBelow(), p.arcGroundY);
    updateRopeTarget(r, p.pos, groundY, input.dive, c.assist);
    if (input.reel) r.targetLength = Math.max(T.web.minLength, r.length - T.web.reelRate * dt * 2);
    accumulateSwingForces(p.pos, p.vel, r, des, groundY, p.world, _F, p.swingDbg, c);
    p.vel.addScaledVector(_F, dt / m);
    r.age += dt;
    p.limitSpeed(dt, false, true);
    p.moveAndCollide(dt);
    const springT = p.swingDbg.spring;
    r.constrain(p.pos, p.vel, dt, m, springT);
    r.reel(dt, T.web.reelRate);
    r.takeUpSlack(p.pos);
    r.measure(p.pos, p.vel, r.gEff);
    updatePhase(p);

    // body faces along the swing, leaning into the rope (animation reads accSmooth)
    const hs = hlen(p.vel);
    if (hs > 1) p.facing = approachYaw(p.facing, yawOf(p.vel.x, p.vel.z), 5 * dt);

    // --- detach conditions ---
    if (p.onGround && p.vel.y <= 0.5) return landState(p);
    if (p.wallContact && p.wallBox >= 0 && !(p.world.kind[p.wallBox] & Kind.Low)) {
      const n = p.wallContactNormal;
      p.wallNormal.copy(n);
      r.detach();
      const vIn = -(p.preImpactVel.x * n.x + p.preImpactVel.z * n.z);
      if (T.assist.strength < T.assist.wallSlamBelow && vIn > T.wall.slamSpeed) {
        // raw rope physics: you hit the wall. Bounce off, lose the speed, fall.
        p.vel.set(p.vel.x * 0.3 + n.x * 3, Math.min(p.vel.y, 0) * 0.5, p.vel.z * 0.3 + n.z * 3);
        p.timeSinceRelease = 0;
        p.emit('wallSlam', vIn);
        return 'Airborne';
      }
      // a wall in the way becomes a wall run that keeps the swing's momentum
      return 'WallRunning';
    }
    // swung up level with the anchor: the web would go slack → let go and chain the next one
    if (p.pos.y > r.anchor.y - T.web.detachAboveAnchor && p.vel.y > 0) return releaseWeb(p, true);
    // end of the arc with swing still held: let go at the top and chain (never swing backwards)
    if (r.age > 0.3 && r.swingAngle > 8 && (p.swingPhase >= T.web.autoReleasePhase || p.vel.y <= 0)) return releaseWeb(p, true);
    // line of sight to the anchor lost (rope wrapped a corner) → release
    p.losTimer -= dt;
    if (p.losTimer <= 0) {
      p.losTimer = 0.1;
      const hand = _e.set(p.pos.x, p.pos.y + 0.6, p.pos.z);
      const d = _dir.subVectors(r.anchor, hand);
      const len = d.length();
      if (len > 2 && p.world.raycast(hand, d.multiplyScalar(1 / len), len - 1.0, p.hit, Kind.NoWeb, false)) {
        r.detach();
        p.timeSinceRelease = 0;
        p.emit('webRelease', 0);
        return 'Airborne';
      }
    }
    return null;
  },
});
