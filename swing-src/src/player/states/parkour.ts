import { Vector3 } from 'three';
import { registerState } from '../StateMachine';
import type { Player } from '../Player';
import { yawOf } from './common';

const _a = new Vector3();

/** Quadratic Bézier through from → apex → to (apex used as control so the curve peaks near it). */
function warp(p: Player, t: number, out: Vector3): Vector3 {
  const u = 1 - t;
  // control point chosen so the curve passes through apex at t = 0.5
  const cx = 2 * p.moveApex.x - 0.5 * (p.moveFrom.x + p.moveTo.x);
  const cy = 2 * p.moveApex.y - 0.5 * (p.moveFrom.y + p.moveTo.y);
  const cz = 2 * p.moveApex.z - 0.5 * (p.moveFrom.z + p.moveTo.z);
  return out.set(
    u * u * p.moveFrom.x + 2 * u * t * cx + t * t * p.moveTo.x,
    u * u * p.moveFrom.y + 2 * u * t * cy + t * t * p.moveTo.y,
    u * u * p.moveFrom.z + 2 * u * t * cz + t * t * p.moveTo.z,
  );
}

/**
 * Motion-warped traversal moves: the body follows a curve fitted to the obstacle, and its
 * velocity is the curve derivative, so leaving the move keeps momentum.
 */
function warpStep(p: Player, dt: number): boolean {
  const t = Math.min(1, p.stateTime / p.moveDur);
  const prev = _a.copy(p.pos);
  warp(p, t, p.pos);
  p.vel.subVectors(p.pos, prev).multiplyScalar(1 / dt);
  const hs = Math.hypot(p.vel.x, p.vel.z);
  if (hs > 0.5) p.facing = yawOf(p.vel.x, p.vel.z);
  return t >= 1;
}

registerState({
  id: 'Vaulting',
  group: 'Parkour',
  enter(p) {
    p.moveDur = Math.max(0.2, p.moveDur);
  },
  step(p, dt) {
    const hs0 = Math.hypot(p.moveTo.x - p.moveFrom.x, p.moveTo.z - p.moveFrom.z) / p.moveDur;
    if (warpStep(p, dt)) {
      // exit with the approach speed along the vault direction, no vertical pop
      const hs = Math.hypot(p.vel.x, p.vel.z) || 1;
      p.vel.x *= hs0 / hs; p.vel.z *= hs0 / hs; p.vel.y = 0;
      return p.probeGround(true, 0.4) ? 'Grounded' : 'Airborne';
    }
    return null;
  },
});

registerState({
  id: 'Mantling',
  group: 'Parkour',
  enter(p) {
    p.moveFrom.copy(p.pos);
    p.moveApex.set(p.pos.x * 0.7 + p.moveTo.x * 0.3, p.moveTo.y + 0.35, p.pos.z * 0.7 + p.moveTo.z * 0.3);
    const rise = p.moveTo.y - p.pos.y;
    p.moveDur = Math.max(0.2, Math.min(0.42, 0.18 + rise * 0.08 - Math.max(0, p.vel.y) * 0.01));
    p.emit('mantle', rise);
  },
  step(p, dt) {
    if (warpStep(p, dt)) {
      const hs = Math.hypot(p.vel.x, p.vel.z);
      const keep = Math.min(hs, 6);
      if (hs > 0.1) { p.vel.x *= keep / hs; p.vel.z *= keep / hs; }
      p.vel.y = 0;
      p.probeGround(true, 0.5);
      return 'Grounded';
    }
    return null;
  },
});
