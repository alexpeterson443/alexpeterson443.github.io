import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { WebRope } from '../src/web/WebRope';
import { accumulateSwingForces } from '../src/web/SwingModel';
import { releaseQuality } from '../src/player/states/swing';
import { resetTuning, T } from '../src/core/tuning';

/** Plain pendulum using the production force model + constraint, assists/drag off. */
function simulate(L: number, startAngleDeg: number, seconds: number, rigid = true, dt = 1 / 120) {
  T.assist.strength = 0;
  T.web.swingSpeedPreservation = 1; // no drag
  if (rigid) T.web.elasticity = 0;
  T.web.catchRedirect = 0;
  const anchor = new Vector3(0, 100, 0);
  const a = (startAngleDeg * Math.PI) / 180;
  const pos = new Vector3(Math.sin(a) * L, 100 - Math.cos(a) * L, 0);
  const vel = new Vector3();
  const rope = new WebRope();
  rope.attach(anchor, pos);
  rope.age = 1;
  const F = new Vector3();
  const m = T.physics.mass, g = T.physics.gravity * T.web.swingGravityScale;
  const samples: { pos: Vector3; vel: Vector3; t: number; tension: number; d: number }[] = [];
  const zero = new Vector3();
  for (let i = 0, n = Math.round(seconds / dt); i < n; i++) {
    accumulateSwingForces(pos, vel, rope, zero, -1000, null, F);
    pos.addScaledVector(vel, dt).addScaledVector(F, (0.5 * dt * dt) / m);
    vel.addScaledVector(F, dt / m);
    const tension = rope.constrain(pos, vel, dt, m, 0);
    samples.push({ pos: pos.clone(), vel: vel.clone(), t: (i + 1) * dt, tension, d: pos.distanceTo(anchor) });
  }
  const energy = (s: { pos: Vector3; vel: Vector3 }) => 0.5 * m * s.vel.lengthSq() + m * g * s.pos.y;
  return { samples, energy, L, g, m };
}

describe('web rope constraint', () => {
  beforeEach(() => resetTuning());

  it('never lets a rigid rope exceed its length', () => {
    const { samples } = simulate(25, 80, 8);
    for (const s of samples) expect(s.d).toBeLessThanOrEqual(25 + 1e-3);
  });

  it('elastic rope stretch is bounded by maxStretch·elasticity', () => {
    T.web.elasticity = 0.6;
    const { samples, L } = simulate(25, 85, 6, false);
    const maxD = Math.max(...samples.map((s) => s.d));
    expect(maxD).toBeLessThanOrEqual(L + T.web.maxStretch * T.web.elasticity + 1e-3);
    expect(maxD).toBeGreaterThan(L); // it does stretch
  });

  it('conserves pendulum energy within 3% over several swings (symplectic integration)', () => {
    const r = simulate(30, 70, 12);
    const e0 = r.energy(r.samples[0]);
    const swingEnergy = r.m * r.g * 30 * (1 - Math.cos((70 * Math.PI) / 180));
    for (const s of r.samples) expect(Math.abs(r.energy(s) - e0) / swingEnergy).toBeLessThan(0.03);
  });

  it('has the small-angle period 2π√(L/g)', () => {
    const r = simulate(20, 8, 10);
    // count zero crossings of x going positive→negative
    const cross: number[] = [];
    for (let i = 1; i < r.samples.length; i++) if (r.samples[i - 1].pos.x > 0 && r.samples[i].pos.x <= 0) cross.push(r.samples[i].t);
    const period = (cross[cross.length - 1] - cross[0]) / (cross.length - 1);
    const expected = 2 * Math.PI * Math.sqrt(20 / r.g);
    expect(Math.abs(period - expected) / expected).toBeLessThan(0.02);
  });

  it('tension at the bottom matches m(v²/L + g)', () => {
    const r = simulate(30, 60, 4);
    // bottom = sample with max speed
    let best = r.samples[0];
    for (const s of r.samples) if (s.vel.lengthSq() > best.vel.lengthSq()) best = s;
    const v2 = best.vel.lengthSq();
    const expected = r.m * (v2 / 30 + r.g);
    expect(Math.abs(best.tension - expected) / expected).toBeLessThan(0.08);
  });

  it('removes outward radial velocity without teleporting', () => {
    T.web.elasticity = 0;
    T.web.catchRedirect = 0;
    T.web.catchMaxG = 0; // the hard constraint itself (catches are softened separately)
    const rope = new WebRope();
    const anchor = new Vector3(0, 50, 0);
    const pos = new Vector3(0, 30, 0);
    rope.attach(anchor, pos);
    const vel = new Vector3(5, -20, 0); // falling away from the anchor
    pos.addScaledVector(vel, 1 / 120);
    const before = pos.clone();
    rope.constrain(pos, vel, 1 / 120, 80, 0);
    const r = pos.clone().sub(anchor).normalize();
    expect(vel.dot(r)).toBeLessThanOrEqual(1e-9);
    expect(pos.distanceTo(before)).toBeLessThan(0.2); // only the overshoot
    expect(vel.x).toBeCloseTo(5, 1); // tangential part kept
  });

  it('catch redirect preserves speed when diving into a swing', () => {
    T.web.elasticity = 0;
    T.web.catchRedirect = 1;
    const rope = new WebRope();
    const anchor = new Vector3(0, 50, -20);
    const pos = new Vector3(0, 30, 0);
    rope.attach(anchor, pos);
    const vel = new Vector3(0, -30, -10);
    pos.addScaledVector(vel, 1 / 120);
    const s0 = vel.length();
    rope.constrain(pos, vel, 1 / 120, 80, 0);
    expect(vel.length()).toBeGreaterThan(s0 * 0.9);
  });

  it('reeling in raises tangential speed (angular momentum)', () => {
    T.assist.strength = 0;
    T.web.swingSpeedPreservation = 1;
    T.web.elasticity = 0;
    T.web.swingGravityScale = 0.0001; // isolate the effect from gravity
    const rope = new WebRope();
    const anchor = new Vector3(0, 0, 0);
    const pos = new Vector3(20, 0, 0);
    const vel = new Vector3(0, 0, 10);
    rope.attach(anchor, pos);
    rope.targetLength = 10;
    const F = new Vector3();
    const zero = new Vector3();
    for (let i = 0; i < 240; i++) {
      accumulateSwingForces(pos, vel, rope, zero, -1e6, null, F);
      pos.addScaledVector(vel, 1 / 120).addScaledVector(F, 0.5 / 120 / 120 / 80);
      vel.addScaledVector(F, 1 / 120 / 80);
      rope.constrain(pos, vel, 1 / 120, 80, 0);
      rope.reel(1 / 120, 14);
    }
    // L·v ≈ const → v ≈ 20 when L halves (projection loses a little)
    expect(vel.length()).toBeGreaterThan(17);
  });
});

describe('release timing', () => {
  beforeEach(() => resetTuning());
  it('grades the arc by phase: down-swing = nothing, bottom = little, late up-swing = best', () => {
    // phase: −1..0 down-swing, 0 = bottom, 0..1 up-swing toward the end of the arc
    expect(releaseQuality(-0.5, -5)).toBe(0); // still dropping in: you just fall
    expect(releaseQuality(0.05, 3)).toBeLessThan(0.1); // at the bottom: no throw yet
    expect(releaseQuality(0.4, 6)).toBeGreaterThan(0.3);
    expect(releaseQuality(0.7, 4)).toBe(1); // last third of the up-swing: full forward throw
    expect(releaseQuality(0.9, -3)).toBe(0); // already falling back
  });
});
