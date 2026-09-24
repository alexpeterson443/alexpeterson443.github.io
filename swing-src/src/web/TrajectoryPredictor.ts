import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { WebRope } from './WebRope';
import { accumulateSwingForces, arcPhase, assistLevel, makeSwingContext, updateRopeTarget } from './SwingModel';
import type { CollisionWorld } from '../world/CollisionWorld';

export interface Prediction {
  points: Vector3[];
  count: number;
  minClearance: number; // lowest feet height above street (m)
  collided: boolean;
  collideTime: number;
  endSpeed: number;
  endPos: Vector3;
  maxSpeed: number;
  progress: number; // displacement along the reference direction
  apexHeight: number;
}

export function makePrediction(capacity = 128): Prediction {
  return {
    points: Array.from({ length: capacity }, () => new Vector3()),
    count: 0, minClearance: Infinity, collided: false, collideTime: Infinity,
    endSpeed: 0, endPos: new Vector3(), maxSpeed: 0, progress: 0, apexHeight: -Infinity,
  };
}

const rope = new WebRope();
const p = new Vector3();
const v = new Vector3();
const F = new Vector3();
const hold = new Vector3();
const ctx = makeSwingContext();
const arc = { phase: 0, end: 90, omega: 0 };

/**
 * Forward-simulates the player using the same force model and integrator as gameplay, at a
 * coarser step. Used both for anchor scoring and for the debug trajectory overlay.
 * If `anchor` is null the flight is ballistic (gravity + drag).
 * A null `desired` mirrors the swing state with no stick: it holds the heading the swing started
 * with (`refDir`, else the current travel direction) at the no-stick pump strength.
 * With `releaseAtApex` the swing lets go where a held swing would (level with the anchor, or the
 * end of its arc) and continues ballistically.
 */
export function predict(
  pos: Vector3, vel: Vector3,
  anchor: Vector3 | null, length: number,
  desired: Vector3 | null,
  horizon: number, dt: number,
  world: CollisionWorld | null,
  refDir: Vector3 | null,
  out: Prediction,
  releaseAtApex = true,
): Prediction {
  p.copy(pos);
  v.copy(vel);
  out.count = 0;
  out.minClearance = Infinity;
  out.collided = false;
  out.collideTime = Infinity;
  out.maxSpeed = 0;
  out.apexHeight = -Infinity;
  const m = T.physics.mass;
  const steps = Math.min(out.points.length, Math.ceil(horizon / dt));
  let swinging = !!anchor;
  if (anchor) {
    rope.attach(anchor, pos, -1, length);
  }
  // the swing context the state would build: held heading, assist, no facade sensing
  const stick = !!desired && Math.hypot(desired.x, desired.z) > 0.1;
  const hs0 = Math.hypot(vel.x, vel.z);
  if (stick) ctx.heading.set(desired!.x, 0, desired!.z).normalize();
  else if (refDir && Math.hypot(refDir.x, refDir.z) > 1e-3) ctx.heading.set(refDir.x, 0, refDir.z).normalize();
  else if (hs0 > 2) ctx.heading.set(vel.x / hs0, 0, vel.z / hs0);
  else ctx.heading.set(0, 0, -1);
  ctx.stick = stick;
  ctx.assist = assistLevel();
  ctx.wallLeft = ctx.wallRight = Infinity;
  const d = stick ? desired! : hold.copy(ctx.heading).multiplyScalar(T.web.noStickPump);
  const start = pos;
  for (let i = 0; i < steps; i++) {
    if (swinging) {
      updateRopeTarget(rope, p, 0, false, ctx.assist);
      accumulateSwingForces(p, v, rope, d, 0, null, F, undefined, ctx);
      p.addScaledVector(v, dt).addScaledVector(F, (0.5 * dt * dt) / m);
      v.addScaledVector(F, dt / m);
      rope.age += dt;
      const sT = T.web.stiffness * Math.max(0, rope.stretch);
      rope.constrain(p, v, dt, m, sT);
      rope.reel(dt, T.web.reelRate);
      rope.takeUpSlack(p);
      if (releaseAtApex) {
        if (p.y > rope.anchor.y - T.web.detachAboveAnchor && v.y > 0) swinging = false;
        else if (rope.age > 0.3 && rope.swingAngle > 8) {
          arcPhase(rope, arc);
          if (arc.phase >= T.web.autoReleasePhase || v.y <= 0) swinging = false;
        }
      }
    } else {
      const s = v.length();
      F.copy(v).multiplyScalar(-T.physics.airDrag * s);
      F.y -= m * T.physics.gravity;
      p.addScaledVector(v, dt).addScaledVector(F, (0.5 * dt * dt) / m);
      v.addScaledVector(F, dt / m);
    }
    out.points[i].copy(p);
    out.count = i + 1;
    const clr = p.y - 0.9;
    if (clr < out.minClearance) out.minClearance = clr;
    if (p.y > out.apexHeight) out.apexHeight = p.y;
    const sp = v.length();
    if (sp > out.maxSpeed) out.maxSpeed = sp;
    if (world && (i & 1) === 0 && world.overlapsSphere(p, 0.45)) {
      out.collided = true;
      out.collideTime = i * dt;
      break;
    }
    if (p.y < 0.5) {
      out.collided = true;
      out.collideTime = i * dt;
      break;
    }
  }
  out.endSpeed = v.length();
  out.endPos.copy(p);
  out.progress = refDir ? (p.x - start.x) * refDir.x + (p.z - start.z) * refDir.z : 0;
  return out;
}
