import { Quaternion, Vector3, type Object3D } from 'three';

const _a = new Vector3();
const _b = new Vector3();
const _c = new Vector3();
const _t = new Vector3();
const _n = new Vector3();
const _bend = new Vector3();
const _bNew = new Vector3();
const _d0 = new Vector3();
const _d1 = new Vector3();
const _q = new Quaternion();
const _wq = new Quaternion();
const _pq = new Quaternion();
const _orig1 = new Quaternion();
const _orig2 = new Quaternion();

/** Rotate `bone` (in world space) by the rotation taking direction `from` to `to`. */
function rotateWorld(bone: Object3D, from: Vector3, to: Vector3): void {
  _q.setFromUnitVectors(from, to);
  bone.getWorldQuaternion(_wq);
  _wq.premultiply(_q);
  bone.parent!.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_wq));
  bone.updateMatrixWorld(true);
}

/**
 * Analytic two-bone IK (law of cosines) in world space. `upper` → `mid` → `end` are consecutive
 * joints; the chain bends toward `pole`. `weight` blends from the FK pose (0) to full IK (1).
 * Returns the reach ratio (|target − root| / chain length) for callers that want to detect
 * over-extension.
 */
export function solveTwoBone(upper: Object3D, mid: Object3D, end: Object3D, target: Vector3, pole: Vector3, weight = 1): number {
  if (weight <= 0) return 0;
  upper.updateMatrixWorld(true);
  upper.getWorldPosition(_a);
  mid.getWorldPosition(_b);
  end.getWorldPosition(_c);
  const l1 = _a.distanceTo(_b), l2 = _b.distanceTo(_c);
  _t.copy(target);
  const toT = _d0.subVectors(_t, _a);
  let d = toT.length();
  const reach = d / (l1 + l2);
  const maxD = (l1 + l2) * 0.999, minD = Math.abs(l1 - l2) * 1.001 + 1e-4;
  if (d < 1e-5) return reach;
  toT.multiplyScalar(1 / d);
  d = Math.min(maxD, Math.max(minD, d));
  _t.copy(_a).addScaledVector(toT, d);
  // bend plane from the pole vector
  _n.subVectors(pole, _a).cross(toT);
  if (_n.lengthSq() < 1e-8) _n.set(1, 0, 0).cross(toT);
  _n.normalize();
  _bend.crossVectors(toT, _n).normalize(); // perpendicular to target line, toward the pole side
  if (_bend.dot(_d1.subVectors(pole, _a)) < 0) _bend.negate();
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  _bNew.copy(_a).addScaledVector(toT, cosA * l1).addScaledVector(_bend, sinA * l1);

  _orig1.copy(upper.quaternion);
  _orig2.copy(mid.quaternion);
  rotateWorld(upper, _d0.subVectors(_b, _a).normalize(), _d1.subVectors(_bNew, _a).normalize());
  mid.getWorldPosition(_b);
  end.getWorldPosition(_c);
  rotateWorld(mid, _d0.subVectors(_c, _b).normalize(), _d1.subVectors(_t, _b).normalize());
  if (weight < 1) {
    _q.copy(upper.quaternion);
    upper.quaternion.copy(_orig1).slerp(_q, weight);
    _q.copy(mid.quaternion);
    mid.quaternion.copy(_orig2).slerp(_q, weight);
    upper.updateMatrixWorld(true);
  }
  return reach;
}
