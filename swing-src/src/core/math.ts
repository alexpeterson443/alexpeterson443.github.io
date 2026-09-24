import { Vector3 } from 'three';

export const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const saturate = (x: number) => clamp(x, 0, 1);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = saturate((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const remap = (x: number, a: number, b: number, c: number, d: number) => lerp(c, d, saturate((x - a) / (b - a)));
/** Frame-rate independent exponential approach factor. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
export const DEG = Math.PI / 180;
export const UP = new Vector3(0, 1, 0);

export function wrapAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function approachAngle(cur: number, target: number, maxStep: number): number {
  const d = wrapAngle(target - cur);
  return cur + clamp(d, -maxStep, maxStep);
}

/** Horizontal (XZ) length. */
export const hlen = (v: Vector3) => Math.hypot(v.x, v.z);

/** Pool of scratch vectors for hot paths; never hold a reference past the current function. */
const pool: Vector3[] = Array.from({ length: 64 }, () => new Vector3());
let pi = 0;
export function tmp(x = 0, y = 0, z = 0): Vector3 {
  pi = (pi + 1) & 63;
  return pool[pi].set(x, y, z);
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - saturate(t), 3);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * saturate(t)) - 1) / 2;
