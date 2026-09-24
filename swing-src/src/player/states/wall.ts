import { Vector3 } from 'three';
import { T } from '../../core/tuning';
import { registerState, type StateId } from '../StateMachine';
import { CAPSULE_R, FEET, type Player } from '../Player';
import type { Intent } from '../../input/Intent';
import { beginZip, wallJump, yawOf } from './common';

const _S = new Vector3();
const _m = new Vector3();
const _vt = new Vector3();
const _o = new Vector3();
const _dir = new Vector3();

/** Horizontal tangent along the wall: S = up × n. */
function sideOf(n: Vector3, out: Vector3): Vector3 {
  return out.set(n.z, 0, -n.x);
}

/** Map stick input onto the wall plane: forward (into wall) → up, sideways → along wall. */
function wallInput(p: Player, input: Intent): { up: number; side: number } {
  const m = input.moveWorld(_m);
  const n = p.wallNormal;
  const S = sideOf(n, _S);
  return { up: -(m.x * n.x + m.z * n.z), side: m.x * S.x + m.z * S.z };
}

type WallResult = 'ok' | 'top' | 'bottom' | 'lost' | 'wrapped';

/**
 * Keep the body glued to the wall: re-probe the facade, handle inner corners (contact with a new
 * wall) and outer corners (wrap around to the adjacent face), and detect the top edge.
 */
function stickToWall(p: Player, dt: number): WallResult {
  const n = p.wallNormal;
  // inner corner: moved into another wall
  if (p.wallContact && p.wallContactNormal.dot(n) < 0.5) {
    const oldN = _o.copy(n);
    n.copy(p.wallContactNormal);
    const S = sideOf(n, _S);
    const speed = Math.hypot(p.vel.x, p.vel.z);
    p.wallSide = Math.sign(S.dot(oldN)) || 1;
    p.vel.x = S.x * p.wallSide * speed;
    p.vel.z = S.z * p.wallSide * speed;
    p.emit('cornerWrap', 0);
    return 'wrapped';
  }
  if (p.probeWall(n, CAPSULE_R + 0.9)) {
    n.copy(p.hit.normal).setY(0).normalize();
    // hold a constant stand-off from the facade
    const target = CAPSULE_R + 0.03;
    const dist = p.hit.t;
    p.pos.addScaledVector(n, (target - dist) * Math.min(1, 20 * dt));
    return 'ok';
  }
  // lost the wall. top edge? (a ledge just above/in front)
  if (p.vel.y > -1 && p.findLedge(_dir.copy(n).multiplyScalar(-1), 2.6, 0.9, p.moveTo)) return 'top';
  if (p.probeWall(n, CAPSULE_R + 1.2, -0.8)) {
    // wall still exists lower down: we popped over the lip without a floor (e.g. thin parapet)
    return 'top';
  }
  // outer corner: wrap onto the adjacent face in the direction of travel
  const S = sideOf(n, _S);
  const vs = p.vel.dot(S);
  if (Math.abs(vs) > 1.5) {
    const s = Math.sign(vs);
    const newN = _vt.copy(S).multiplyScalar(s);
    const probe = _o.copy(p.pos).addScaledVector(newN, CAPSULE_R + 0.8).addScaledVector(n, -(CAPSULE_R + 0.6));
    const dir = _dir.copy(newN).multiplyScalar(-1);
    if (p.world.raycast(probe, dir, 2.0, p.hit, 0, false) && Math.abs(p.hit.normal.y) < 0.3) {
      const oldN = _m.copy(n);
      n.copy(p.hit.normal).setY(0).normalize();
      p.pos.set(p.hit.point.x + n.x * (CAPSULE_R + 0.05), p.pos.y, p.hit.point.z + n.z * (CAPSULE_R + 0.05));
      const S2 = sideOf(n, _S);
      p.wallSide = Math.sign(S2.dot(oldN.multiplyScalar(-1))) || 1;
      const speed = Math.abs(vs);
      p.vel.x = S2.x * p.wallSide * speed;
      p.vel.z = S2.z * p.wallSide * speed;
      p.emit('cornerWrap', 1);
      return 'wrapped';
    }
  }
  return 'lost';
}

function onWallLost(p: Player, r: WallResult): StateId | null {
  if (r === 'top') {
    if (p.findLedge(_dir.copy(p.wallNormal).multiplyScalar(-1), 2.6, 1.0, p.moveTo)) return 'Mantling';
    // clear the lip with a pop
    p.vel.set(-p.wallNormal.x * 5, Math.max(p.vel.y, 9), -p.wallNormal.z * 5);
    p.emit('vault');
    return 'Airborne';
  }
  if (r === 'lost') return 'Airborne';
  return null;
}

registerState({
  id: 'WallRunning',
  group: 'Wall',
  enter(p, from) {
    const n = p.wallNormal;
    const S = sideOf(n, _S);
    const vIn = -(p.vel.x * n.x + p.vel.z * n.z);
    const vSide = p.vel.dot(S);
    if (from === 'Grounded' || from === 'WallCrawling' || vIn > Math.abs(vSide) * 0.9) {
      p.wallMode = 'vertical';
      p.vel.set(S.x * vSide * 0.3, Math.max(T.wall.wallRunUpSpeed, p.vel.y, vIn * 0.8), S.z * vSide * 0.3);
    } else {
      p.wallMode = 'horizontal';
      p.wallSide = Math.sign(vSide) || 1;
      const sp = Math.max(T.wall.wallRunSpeed, Math.abs(vSide));
      p.vel.set(S.x * p.wallSide * sp, Math.max(p.vel.y * 0.4, 2), S.z * p.wallSide * sp);
    }
    p.emit('wallRun', p.wallMode === 'vertical' ? 1 : 0);
  },
  step(p, dt, input) {
    if (input.jumpPressed) return wallJump(p, input);
    if (input.zipPressed && beginZip(p, input)) return 'WebZip';
    if (!input.traverse) return 'WallCrawling';
    const n = p.wallNormal;
    const S = sideOf(n, _S);
    const wi = wallInput(p, input);
    if (p.wallMode === 'horizontal' && wi.up > 0.65) p.wallMode = 'vertical';
    else if (p.wallMode === 'vertical' && Math.abs(wi.side) > 0.75) {
      p.wallMode = 'horizontal';
      p.wallSide = Math.sign(wi.side);
    }
    const vt = _vt;
    const tired = p.stateTime > T.wall.wallRunDuration;
    if (p.wallMode === 'vertical') {
      vt.copy(S).multiplyScalar(wi.side * 5);
      vt.y = T.wall.wallRunUpSpeed; // vertical runs don't tire: holding traverse climbs any tower
    } else {
      if (wi.side * p.wallSide < -0.5) p.wallSide = -p.wallSide;
      const cur = Math.abs(p.vel.dot(S));
      const sp = Math.max(T.wall.wallRunSpeed, cur - 4 * dt);
      vt.copy(S).multiplyScalar(p.wallSide * sp);
      vt.y = wi.up * 6 + (tired ? -4 : 1.5);
    }
    // approach target velocity, remove motion into/away from the wall
    const k = 1 - Math.exp(-8 * dt);
    p.vel.lerp(vt, k);
    const vn = p.vel.dot(n);
    p.vel.addScaledVector(n, -vn - 0.8);
    p.moveAndCollide(dt);
    p.facing = p.wallMode === 'vertical' ? yawOf(-n.x, -n.z) : yawOf(p.vel.x, p.vel.z);
    if (p.vel.y < 0 && p.probeGround(false, 0.3)) return 'Grounded';
    const r = stickToWall(p, dt);
    return onWallLost(p, r);
  },
});

registerState({
  id: 'WallCrawling',
  group: 'Wall',
  enter(p) {
    p.vel.multiplyScalar(0.1);
  },
  step(p, dt, input) {
    if (input.jumpPressed) return wallJump(p, input);
    if (input.zipPressed && beginZip(p, input)) return 'WebZip';
    if (input.traversePressed || (input.traverse && p.stateTime > 0.2)) return 'WallRunning';
    if (input.dropPressed) {
      p.vel.copy(p.wallNormal).multiplyScalar(3);
      return 'Airborne';
    }
    const n = p.wallNormal;
    const S = sideOf(n, _S);
    const wi = wallInput(p, input);
    const vt = _vt.copy(S).multiplyScalar(wi.side * T.wall.wallCrawlSpeed);
    vt.y = wi.up * T.wall.wallCrawlSpeed;
    p.vel.lerp(vt, 1 - Math.exp(-14 * dt));
    const vn = p.vel.dot(n);
    p.vel.addScaledVector(n, -vn - 0.3);
    p.moveAndCollide(dt);
    const hv = Math.hypot(wi.up, wi.side);
    p.facing = yawOf(-n.x, -n.z);
    if (wi.up < -0.3 && p.feetY - p.surfaceBelow() < 0.5) {
      p.pos.addScaledVector(n, 0.3);
      return 'Grounded';
    }
    void hv;
    const r = stickToWall(p, dt);
    if (r === 'wrapped') return null;
    return onWallLost(p, r);
  },
});

void FEET;
