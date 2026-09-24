import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { hlen, lerp, smoothstep } from '../../core/math';
import { Kind } from '../../world/CollisionWorld';
import { FEET } from '../body';
import type { Player } from '../Player';
import { registerState, type StateId } from '../StateMachine';
import type { Intent } from '../../input/Intent';
import { airContacts, airStep, airTransitions, approachYaw, beginZip, desired, doJump, yawOf } from './common';

const _d = new Vector3();
const _h = new Vector3();
const _o = new Vector3();
const _dir = new Vector3();

/** Horizontal ground velocity controller: turns momentum rather than stopping and restarting. */
function groundMove(p: Player, dt: number, input: Intent, speedScale = 1): void {
  const d = desired(input, _d);
  const mag = d.length();
  const sprint = input.traverse;
  const target = (sprint ? T.ground.sprintSpeed : lerp(T.ground.walkSpeed, T.ground.jogSpeed, smoothstep(0.25, 0.85, mag))) * speedScale;
  const hv = _h.set(p.vel.x, 0, p.vel.z);
  let hs = hv.length();
  if (mag > 0.08) {
    d.multiplyScalar(1 / mag);
    if (hs > 0.8) {
      const cur = Math.atan2(hv.x, hv.z);
      const want = Math.atan2(d.x, d.z);
      let diff = want - cur;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      if (Math.abs(diff) > 2.6 && hs > 7) {
        // hard reversal at speed: skid
        hs = Math.max(0, hs - T.ground.decel * 1.4 * dt);
      } else {
        const rate = T.ground.turnRate * (hs > 10 ? 0.55 : 1);
        const nd = cur + Math.max(-rate * dt, Math.min(rate * dt, diff));
        hv.set(Math.sin(nd), 0, Math.cos(nd));
        const want2 = target * mag;
        const a = hs < want2 ? (hs > T.ground.jogSpeed ? T.ground.sprintAccel : T.ground.accel) : T.ground.decel * 0.6;
        hs = hs < want2 ? Math.min(want2, hs + a * dt) : Math.max(want2, hs - a * dt);
      }
    } else {
      hv.copy(d);
      hs = Math.min(target * mag, hs + T.ground.accel * dt);
    }
    if (hs > 0) hv.normalize();
  } else {
    hs = Math.max(0, hs - T.ground.decel * dt);
    if (hs > 0) hv.normalize();
  }
  p.vel.x = hv.x * hs;
  p.vel.z = hv.z * hs;
  p.vel.y = Math.min(p.vel.y, 0) - T.physics.gravity * dt;
  p.moveAndCollide(dt);
  if (hs > 0.3) p.facing = approachYaw(p.facing, yawOf(p.vel.x, p.vel.z), 14 * dt);
  else if (mag > 0.08) p.facing = approachYaw(p.facing, yawOf(d.x, d.z), 10 * dt);
}

registerState({
  id: 'Grounded',
  group: 'Locomotion',
  enter(p) {
    p.timeSinceGround = 0;
    p.jumpCharge = 0;
    p.diveTime = 0;
    p.rope.detach();
    if (p.vel.y < 0) p.vel.y = 0;
    // after a fast landing keep some momentum but not flight speed
    const hs = hlen(p.vel);
    const cap = T.ground.sprintSpeed * 1.25;
    if (hs > cap) { p.vel.x *= cap / hs; p.vel.z *= cap / hs; }
  },
  step(p, dt, input): StateId | null {
    // --- jump / super jump ---
    if (p.jumpBufferT > 0 && p.jumpCharge === 0) {
      if (p.hSpeed < 3 && !input.traverse) p.jumpCharge = 1e-4; // charge a super jump
      else {
        const boost = input.traverse ? 1.06 : 1;
        p.vel.x *= boost; p.vel.z *= boost;
        return doJump(p, T.ground.jumpSpeed, false);
      }
    }
    if (p.jumpCharge > 0) {
      if (input.jump) {
        p.jumpCharge += dt;
      } else {
        const c = Math.min(1, p.jumpCharge / T.ground.superJumpChargeTime);
        const sup = c > 0.45;
        return doJump(p, sup ? lerp(T.ground.jumpSpeed * 1.3, T.ground.superJumpSpeed, c) : T.ground.jumpSpeed, sup);
      }
    }
    if (input.zipPressed && beginZip(p, input)) return 'WebZip';

    groundMove(p, dt, input, p.jumpCharge > 0 ? 0.2 : 1);

    const hs = p.hSpeed;
    // --- parkour: wall run, vault, edge leap ---
    if (p.wallContact && p.wallBox >= 0) {
      const kind = p.world.kind[p.wallBox];
      const top = p.world.maxY[p.wallBox];
      const rise = top - p.feetY;
      if (rise < 1.8 && rise > 0.3 && hs > 2.5) {
        if (setupVault(p, p.wallBox)) return 'Vaulting';
      }
      if (input.traverse && !(kind & Kind.Low) && rise > 2.5) {
        p.wallNormal.copy(p.wallContactNormal);
        return 'WallRunning';
      }
      if (rise <= 2.4 && rise > 0.3 && input.traverse && p.findLedge(_o.copy(p.wallContactNormal).multiplyScalar(-1), 2.4, 0.8, p.moveTo)) return 'Mantling';
    }
    if (hs > 3) {
      // look ahead for a low obstacle before touching it (smooth vault instead of bump)
      const fwd = _dir.set(p.vel.x / hs, 0, p.vel.z / hs);
      const origin = _o.set(p.pos.x, p.feetY + 0.5, p.pos.z);
      if (p.world.raycast(origin, fwd, 0.5 + hs * 0.09, p.hit, Kind.NoWeb, false) && p.hit.box >= 0 && Math.abs(p.hit.normal.y) < 0.3) {
        const rise = p.world.maxY[p.hit.box] - p.feetY;
        if (rise > 0.3 && rise < 1.8 && setupVault(p, p.hit.box)) return 'Vaulting';
      }
      // auto-leap from roof edges when holding traverse
      if (input.traverse && hs > 7) {
        const a = _o.set(p.pos.x + fwd.x * 1.3, p.pos.y, p.pos.z + fwd.z * 1.3);
        if (!p.world.raycast(a, _d.set(0, -1, 0), FEET + 1.5, p.hit)) {
          p.vel.x *= 1.12; p.vel.z *= 1.12;
          return doJump(p, T.ground.jumpSpeed * 0.95, false);
        }
      }
    }
    // --- ground support ---
    if (p.probeGround(true, 0.4) || p.onGround) {
      p.timeSinceGround = 0;
    } else {
      p.timeSinceGround += dt;
      if (p.timeSinceGround > T.ground.coyoteTime) return 'Airborne';
    }
    return null;
  },
});

/** Configure a motion-warped vault over box `b` along the current travel direction. */
function setupVault(p: Player, b: number): boolean {
  const hs = Math.max(4, p.hSpeed);
  const w = p.world;
  const fx = p.vel.x / p.hSpeed || -Math.sin(p.facing), fz = p.vel.z / p.hSpeed || -Math.cos(p.facing);
  // distance along the travel direction to exit the box footprint
  const tx = fx > 1e-3 ? (w.maxX[b] - p.pos.x) / fx : fx < -1e-3 ? (w.minX[b] - p.pos.x) / fx : Infinity;
  const tz = fz > 1e-3 ? (w.maxZ[b] - p.pos.z) / fz : fz < -1e-3 ? (w.minZ[b] - p.pos.z) / fz : Infinity;
  const exit = Math.min(tx, tz);
  if (!Number.isFinite(exit) || exit > 7) return false;
  const top = w.maxY[b];
  const dist = exit + 1.0;
  p.moveFrom.copy(p.pos);
  p.moveTo.set(p.pos.x + fx * dist, p.pos.y, p.pos.z + fz * dist);
  // land on whatever is beyond
  const land = w.heightBelow(_o.set(p.moveTo.x, top + 2, p.moveTo.z), 400);
  p.moveTo.y = Math.max(land, 0) + FEET;
  if (p.moveTo.y < p.pos.y - 3) p.moveTo.y = p.pos.y; // drop beyond: vault then fall naturally
  p.moveApex.set((p.moveFrom.x + p.moveTo.x) / 2, top + FEET + 0.35, (p.moveFrom.z + p.moveTo.z) / 2);
  p.moveDur = Math.max(0.22, Math.min(0.5, dist / hs));
  p.emit('vault');
  return true;
}

registerState({
  id: 'Airborne',
  group: 'Air',
  step(p, dt, input) {
    const t = airTransitions(p, input);
    if (t) return t;
    if (input.trickPressed && p.surfaceBelow() < p.feetY - 4) return 'Trick';
    airStep(p, dt, input);
    return airContacts(p, input);
  },
});

registerState({
  id: 'Trick',
  group: 'Air',
  enter(p, _from, input) {
    // trick flavour from stick: none/forward = front flip, back = back flip, sides = corkscrew
    const mx = input?.moveX ?? 0, my = input?.moveY ?? 0;
    p.trickKind = Math.abs(mx) > 0.5 ? (mx > 0 ? 2 : 3) : my < -0.5 ? 1 : 0;
    p.emit('trick', p.trickKind);
  },
  step(p, dt, input) {
    const t = airTransitions(p, input);
    if (t) return t;
    airStep(p, dt, input);
    const c = airContacts(p, input);
    if (c) return c;
    return p.stateTime > T.air.trickDuration ? 'Airborne' : null;
  },
});

registerState({
  id: 'Landing', // rolling landing: momentum carried through a roll
  group: 'Locomotion',
  enter(p) {
    const hs = p.hSpeed;
    const cap = Math.min(hs, 19);
    if (hs > 0.1) { p.vel.x *= cap / hs; p.vel.z *= cap / hs; }
    p.vel.y = 0;
  },
  step(p, dt, input) {
    if (p.stateTime > 0.12 && p.jumpBufferT > 0) return doJump(p, T.ground.jumpSpeed * 1.1, false);
    const hs = p.hSpeed;
    const ns = Math.max(input.traverse ? T.ground.sprintSpeed * 0.9 : T.ground.jogSpeed, hs - 10 * dt);
    if (hs > 0.1) { p.vel.x *= Math.min(hs, ns) / hs; p.vel.z *= Math.min(hs, ns) / hs; }
    p.vel.y = Math.min(p.vel.y, 0) - T.physics.gravity * dt;
    p.moveAndCollide(dt);
    if (!p.probeGround(true, 0.5) && !p.onGround && p.stateTime > 0.1) return 'Airborne';
    return p.stateTime > T.landing.rollTime ? 'Grounded' : null;
  },
});

registerState({
  id: 'Recovery', // hard "three-point" landing
  group: 'Locomotion',
  enter(p) {
    p.vel.set(p.vel.x * 0.2, 0, p.vel.z * 0.2);
  },
  step(p, dt, input) {
    if (p.stateTime > 0.15 && p.jumpBufferT > 0) return doJump(p, T.ground.jumpSpeed * 1.15, false);
    if (p.stateTime > 0.2 && input.zipPressed && beginZip(p, input)) return 'WebZip';
    p.vel.x *= Math.exp(-10 * dt);
    p.vel.z *= Math.exp(-10 * dt);
    p.vel.y = -1;
    p.moveAndCollide(dt);
    p.probeGround(true, 0.5);
    const early = input.moveMag > 0.5 && p.stateTime > T.landing.recoveryTime * 0.6;
    return p.stateTime > T.landing.recoveryTime || early ? 'Grounded' : null;
  },
});
