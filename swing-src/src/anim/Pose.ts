/**
 * A pose is a flat Float32Array of joint angles (radians) + a hip height offset, so poses can be
 * blended, cross-faded and layered cheaply. Conventions (see Rig): positive pitch on legs/arms
 * swings the limb FORWARD, positive knee/elbow values BEND the joint, positive abduct raises the
 * limb out to its own side. Spine pitch + = lean forward.
 */
export const J = {
  hipY: 0, hipPitch: 1, hipRoll: 2, hipYaw: 3,
  spinePitch: 4, spineRoll: 5, spineYaw: 6,
  chestPitch: 7, chestYaw: 8,
  neckPitch: 9, headPitch: 10, headYaw: 11,
  lThigh: 12, lAbduct: 13, lKnee: 14, lFoot: 15,
  rThigh: 16, rAbduct: 17, rKnee: 18, rFoot: 19,
  lShoulder: 20, lArmOut: 21, lArmTwist: 22, lElbow: 23,
  rShoulder: 24, rArmOut: 25, rArmTwist: 26, rElbow: 27,
} as const;
export const POSE_SIZE = 28;
export type Pose = Float32Array;

export const newPose = (): Pose => new Float32Array(POSE_SIZE);

export function copyPose(dst: Pose, src: Pose): Pose {
  dst.set(src);
  return dst;
}

export function lerpPose(out: Pose, a: Pose, b: Pose, t: number): Pose {
  for (let i = 0; i < POSE_SIZE; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}

/** out += p · w (additive layer). */
export function addPose(out: Pose, p: Pose, w: number): Pose {
  for (let i = 0; i < POSE_SIZE; i++) out[i] += p[i] * w;
  return out;
}

/** Relaxed standing pose. */
export function setNeutral(p: Pose): Pose {
  p.fill(0);
  p[J.lArmOut] = 0.12;
  p[J.rArmOut] = 0.12;
  p[J.lElbow] = 0.15;
  p[J.rElbow] = 0.15;
  p[J.lKnee] = 0.05;
  p[J.rKnee] = 0.05;
  return p;
}
