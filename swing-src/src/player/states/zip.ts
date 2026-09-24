import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { clamp, hlen } from '../../core/math';
import { registerState } from '../StateMachine';
import { FEET } from '../body';
import { airContacts, airStep, airTransitions, beginZip, doJump, landState, yawOf } from './common';

const _to = new Vector3();
const _dv = new Vector3();
const _f = new Vector3();

/** Grade (0..1) of a point launch from how far jump was from the moment of landing on the point. */
export function pointLaunchGrade(secondsFromLanding: number): number {
  const w = T.zip.pointPerfectWindow;
  const d = Math.abs(secondsFromLanding);
  if (d <= w) return 1;
  return clamp(1 - (d - w) / (w * 1.5), 0, 1) * 0.5;
}

registerState({
  id: 'WebZip',
  group: 'Web',
  enter(p) {
    p.launchQueued = false;
    p.launchPressT = -10;
    p.rope.detach();
    p.zipWebPoint.copy(p.zipTarget);
    if (p.zipPoint) p.zipWebPoint.y -= FEET;
    // forward zip: a short burst along the aim, on top of the speed already carried that way
    if (!p.zipPoint) {
      const to = _to.subVectors(p.zipTarget, p.pos).normalize();
      const along = p.vel.dot(to);
      p.zipBurstSpeed = clamp(Math.max(0, along) + T.zip.zipBurst, T.zip.zipMinSpeed, Math.max(T.zip.zipMaxSpeed, along));
      // the yank arrives at once: most of the burst is an impulse, the rest a short pull
      const dv = Math.max(0, p.zipBurstSpeed - Math.max(0, along));
      p.vel.addScaledVector(to, dv * 0.7);
    }
    p.emit('zip', p.zipPoint ? 1 : 0);
  },
  step(p, dt, input) {
    if (input.jumpPressed && !p.launchQueued) { p.launchQueued = true; p.launchPressT = p.simTime; }
    const to = _to.subVectors(p.zipTarget, p.pos);
    const dist = to.length();
    to.multiplyScalar(1 / Math.max(dist, 1e-4));
    if (p.zipPoint) {
      // pull toward the point, easing in so arrival is controlled
      const want = Math.min(T.zip.zipSpeed, dist * 7 + 5);
      const dv = _dv.copy(to).multiplyScalar(want).sub(p.vel);
      const maxDv = T.zip.zipAccel * dt;
      if (dv.length() > maxDv) dv.setLength(maxDv);
      p.vel.add(dv);
      p.moveAndCollide(dt);
      if (hlen(p.vel) > 1) p.facing = yawOf(p.vel.x, p.vel.z);
      const passed = p.vel.dot(_f.subVectors(p.zipTarget, p.pos)) < 0;
      if (dist < 0.7 || (dist < 2.5 && passed) || (p.stateTime > 0.4 && p.speed < 0.5)) {
        p.pos.copy(p.zipTarget);
        if (p.launchQueued) {
          // pressed during the zip: perfect only if it was right before touching the point
          p.pointLaunchQuality = pointLaunchGrade(p.simTime - p.launchPressT);
          return 'PointLaunch';
        }
        return 'Perching';
      }
      if (p.stateTime > 2.5) return 'Airborne';
      return null;
    }
    // forward zip: finish the burst along the aim (sideways drift damped), then hand momentum back
    const along = p.vel.dot(to);
    if (along < p.zipBurstSpeed) p.vel.addScaledVector(to, Math.min(p.zipBurstSpeed - along, T.zip.zipAccel * dt));
    const side = _dv.copy(p.vel).addScaledVector(to, -p.vel.dot(to));
    p.vel.addScaledVector(side, -Math.min(1, 6 * dt));
    p.vel.y -= T.physics.gravity * 0.3 * dt;
    p.limitSpeed(dt, false, true);
    p.moveAndCollide(dt);
    if (hlen(p.vel) > 1) p.facing = yawOf(p.vel.x, p.vel.z);
    if (p.onGround && p.vel.y <= 0) return landState(p);
    const c = airContacts(p, input);
    if (c) return c;
    if (p.stateTime > T.zip.zipBurstTime || dist < 5) {
      p.timeSinceRelease = 0.15;
      return 'Airborne';
    }
    return null;
  },
});

registerState({
  id: 'PointLaunch',
  group: 'Air',
  enter(p, _from, input) {
    const f = input ? input.camForwardFlat(_f) : _f.set(-Math.sin(p.facing), 0, -Math.cos(p.facing));
    // a jump right on landing at the point (the perfect window) launches higher and further
    const q = p.pointLaunchQuality;
    const k = 1 + T.zip.pointPerfectBonus * q;
    p.vel.set(f.x * T.zip.pointLaunchForward * k, T.zip.pointLaunchUp * (1 + T.zip.pointPerfectBonus * 0.6 * q), f.z * T.zip.pointLaunchForward * k);
    p.facing = yawOf(f.x, f.z);
    p.timeSinceRelease = 0;
    p.emit('pointLaunch', q);
    p.pointLaunchQuality = 0;
  },
  step(p, dt, input) {
    if (p.stateTime > 0.2) {
      const t = airTransitions(p, input);
      if (t) return t;
    }
    airStep(p, dt, input, p.stateTime > 0.15);
    const c = airContacts(p, input);
    if (c) return c;
    return p.stateTime > 0.45 ? 'Airborne' : null;
  },
});

registerState({
  id: 'Perching',
  group: 'Parkour',
  enter(p) {
    p.vel.set(0, 0, 0);
    p.emit('perch');
  },
  step(p, dt, input) {
    p.vel.set(0, 0, 0);
    if (input.jumpPressed || p.jumpBufferT > 0) {
      if (p.stateTime < T.zip.pointLaunchWindow) {
        p.pointLaunchQuality = pointLaunchGrade(p.stateTime);
        return 'PointLaunch';
      }
      // leap from perch toward the camera direction
      const f = input.camForwardFlat(_f);
      p.vel.set(f.x * 9, 0, f.z * 9);
      p.facing = yawOf(f.x, f.z);
      return doJump(p, T.ground.jumpSpeed * 1.15, false);
    }
    if (input.zipPressed && beginZip(p, input)) return 'WebZip';
    if (input.traversePressed) {
      const f = input.camForwardFlat(_f);
      p.vel.set(f.x * 12, 4, f.z * 12);
      p.timeSinceRelease = 0.3;
      return 'Airborne';
    }
    if (input.dropPressed) {
      p.vel.set(0, -2, 0);
      return 'Airborne';
    }
    // step off with the stick
    if (input.moveMag > 0.6 && p.stateTime > 0.25) {
      const d = input.moveWorld(_f);
      p.vel.set(d.x * 5, 3, d.z * 5);
      return 'Airborne';
    }
    // face the camera direction while crouched
    const cf = input.camForwardFlat(_f);
    p.facing = yawOf(cf.x, cf.z);
    void dt;
    return null;
  },
});
