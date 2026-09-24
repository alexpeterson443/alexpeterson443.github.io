import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { clamp, hlen, smoothstep } from '../../core/math';
import { Kind } from '../../world/CollisionWorld';
import { registerState, type StateId } from '../StateMachine';
import type { Player } from '../Player';
import type { Intent } from '../../input/Intent';
import { accumulateSwingForces, updateRopeTarget } from '../../web/SwingModel';
import { beginZip, desired, landState, yawOf, approachYaw } from './common';

const _F = new Vector3();
const _d = new Vector3();
const _e = new Vector3();
const _dir = new Vector3();

/**
 * Release timing grade (0..1). Best just after the bottom of the arc on the up-swing, where the
 * velocity points forward and slightly up.
 */
export function releaseQuality(swingAngleDeg: number, vy: number): number {
  if (vy <= 0) return 0;
  const a = swingAngleDeg;
  const lo = T.web.idealReleaseAngleMin, hi = T.web.idealReleaseAngleMax;
  if (a < lo) return clamp(a / lo, 0, 1) * 0.8;
  if (a > hi) return clamp(1 - (a - hi) / 45, 0, 1);
  return 1;
}

export type ReleaseMode = 'letGo' | 'jump' | 'auto';

/**
 * Leave the web. Momentum is always kept.
 *  - letGo: releasing the swing button early gives no boost.
 *  - jump:  jumping off the web; near the bottom of the arc it throws you forward, near the
 *           end of the arc it catapults you upward. Better timing = bigger boost.
 *  - auto:  holding the swing button to the top of the arc detaches with a height boost.
 */
export function releaseWeb(p: Player, mode: ReleaseMode): StateId {
  const r = p.rope;
  const a = r.swingAngle; // + past the bottom
  const earned = smoothstep(0.15, 0.45, r.age); // a boost has to be earned by an actual swing
  let q = 0;
  const hs = hlen(p.vel);
  const fx = hs > 0.5 ? p.vel.x / hs : 0, fz = hs > 0.5 ? p.vel.z / hs : 0;
  if (mode === 'jump') {
    q = (a > -10 ? Math.max(0.35, releaseQuality(Math.max(a, 1), Math.max(p.vel.y, 0.01))) : 0.25) * earned;
    const fwdW = 1 - smoothstep(25, 60, a);
    const upW = smoothstep(18, 60, a);
    p.vel.x += fx * T.web.jumpForwardBoost * fwdW * q;
    p.vel.z += fz * T.web.jumpForwardBoost * fwdW * q;
    p.vel.y = Math.max(p.vel.y, 0) + T.web.jumpReleaseUpBoost * (0.6 + 0.4 * q) + T.web.jumpUpBoost * upW * q;
  } else if (mode === 'auto') {
    q = 0.7 * earned;
    p.vel.x += fx * T.web.releaseBoost * 0.4 * q;
    p.vel.z += fz * T.web.releaseBoost * 0.4 * q;
    p.vel.y = Math.max(p.vel.y, 0) + T.web.autoTopUpBoost * q;
  }
  p.releaseQuality = q;
  r.detach();
  p.timeSinceRelease = 0;
  p.webCooldown = Math.max(p.webCooldown, 0.08);
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

registerState({
  id: 'Swinging',
  group: 'Web',
  enter(p) {
    p.emit('webAttach', p.rope.length);
    p.losTimer = 0;
    p.arcGroundTimer = 0;
  },
  exit(p) {
    if (p.rope.active) p.rope.detach();
  },
  step(p, dt, input: Intent) {
    const r = p.rope;
    if (!r.active) return 'Airborne';
    if (input.jumpPressed) return releaseWeb(p, 'jump');
    if (!input.traverse) return releaseWeb(p, 'letGo');
    if (input.zipPressed) {
      r.detach();
      if (beginZip(p, input)) return 'WebZip';
      return 'Airborne';
    }

    const m = T.physics.mass;
    // no stick: the arc keeps you travelling as straight as possible
    const des = desired(input, _d);
    if (des.lengthSq() < 0.01) {
      const vh = hlen(p.vel);
      if (vh > 3) des.set(p.vel.x / vh, 0, p.vel.z / vh).multiplyScalar(0.65);
      else input.camForwardFlat(des).multiplyScalar(0.65);
    }
    // ground under the player and under the bottom of the arc ahead (roofs in the path count)
    p.arcGroundTimer -= dt;
    if (p.arcGroundTimer <= 0) {
      p.arcGroundTimer = 0.08;
      p.arcGroundY = arcBottomGround(p);
    }
    const groundY = Math.max(p.surfaceBelow(), p.arcGroundY);
    updateRopeTarget(r, p.pos, groundY, input.dive);
    if (input.reel) r.targetLength = Math.max(T.web.minLength, r.length - T.web.reelRate * dt * 2);
    accumulateSwingForces(p.pos, p.vel, r, des, groundY, p.world, _F, p.swingDbg);
    p.vel.addScaledVector(_F, dt / m);
    r.age += dt;
    p.limitSpeed(dt, false);
    p.moveAndCollide(dt);
    const springT = p.swingDbg.spring;
    r.constrain(p.pos, p.vel, dt, m, springT);
    r.reel(dt, T.web.reelRate);
    r.takeUpSlack(p.pos);
    r.measure(p.pos, p.vel, T.physics.gravity * T.web.swingGravityScale);

    // body faces along the swing, leaning into the rope (animation reads accSmooth)
    const hs = hlen(p.vel);
    if (hs > 1) p.facing = approachYaw(p.facing, yawOf(p.vel.x, p.vel.z), 5 * dt);

    // --- detach conditions ---
    if (p.onGround && p.vel.y <= 0.5) return landState(p);
    if (p.wallContact && p.wallBox >= 0 && !(p.world.kind[p.wallBox] & Kind.Low)) {
      p.wallNormal.copy(p.wallContactNormal);
      r.detach();
      return 'WallRunning';
    }
    // swung above the anchor: the rope would go slack → auto release with the arc's boost
    if (p.pos.y > r.anchor.y - T.web.detachAboveAnchor && p.vel.y > 0) return releaseWeb(p, 'auto');
    // held to the end of the arc: the web lets go at the top with a height boost
    if (r.swingAngle > T.web.autoReleaseAngle && p.vel.y < 3 && r.age > 0.45) return releaseWeb(p, 'auto');
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
