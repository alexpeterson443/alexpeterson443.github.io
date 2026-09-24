import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { hlen } from '../../core/math';
import { registerState } from '../StateMachine';
import { FEET } from '../Player';
import { airContacts, airStep, airTransitions, beginZip, doJump, landState, yawOf } from './common';

const _to = new Vector3();
const _dv = new Vector3();
const _f = new Vector3();

registerState({
  id: 'WebZip',
  group: 'Web',
  enter(p) {
    p.launchQueued = false;
    p.rope.detach();
    p.zipWebPoint.copy(p.zipTarget);
    if (p.zipPoint) p.zipWebPoint.y -= FEET;
    // forward zip: an initial yank toward the target
    if (!p.zipPoint) {
      const to = _to.subVectors(p.zipTarget, p.pos).normalize();
      const along = p.vel.dot(to);
      p.vel.addScaledVector(to, Math.max(0, T.zip.zipForwardImpulse - Math.max(0, along) * 0.5));
    }
    p.emit('zip', p.zipPoint ? 1 : 0);
  },
  step(p, dt, input) {
    if (input.jumpPressed) p.launchQueued = true;
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
        if (p.launchQueued) return 'PointLaunch';
        return 'Perching';
      }
      if (p.stateTime > 2.5) return 'Airborne';
      return null;
    }
    // forward zip: short pull then hand momentum back to the air state
    p.vel.addScaledVector(to, T.zip.zipAccel * 0.35 * dt);
    p.vel.y -= T.physics.gravity * 0.3 * dt;
    p.limitSpeed(dt, false);
    p.moveAndCollide(dt);
    if (hlen(p.vel) > 1) p.facing = yawOf(p.vel.x, p.vel.z);
    if (p.onGround && p.vel.y <= 0) return landState(p);
    const c = airContacts(p, input);
    if (c) return c;
    if (p.stateTime > 0.4 || dist < 5) {
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
    p.vel.set(f.x * T.zip.pointLaunchForward, T.zip.pointLaunchUp, f.z * T.zip.pointLaunchForward);
    p.facing = yawOf(f.x, f.z);
    p.timeSinceRelease = 0;
    p.emit('pointLaunch');
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
      if (p.stateTime < T.zip.pointLaunchWindow) return 'PointLaunch';
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
