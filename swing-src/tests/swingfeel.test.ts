import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { Intent } from '../src/input/Intent';
import { T, resetTuning } from '../src/core/tuning';
import { swingJumpImpulse, swingJumpPerfect } from '../src/web/SwingModel';
import { canyonWorld, makePlayer, stepN } from './helpers';

/** Behaviour taken from docs/TRAVERSAL_REFERENCE.md (arc-dependent jumps, steering cost, assist). */
describe('swing feel', () => {
  beforeEach(() => resetTuning());

  it('swing jump: down-swing hops, bottom launches forward, late up-swing launches up', () => {
    const early = swingJumpImpulse(-0.5, 0, { fwd: 0, up: 0 });
    const bottom = swingJumpImpulse(0.02, 0, { fwd: 0, up: 0 });
    const late = swingJumpImpulse(0.9, 0, { fwd: 0, up: 0 });
    expect(early.fwd).toBe(0);
    expect(early.up).toBeLessThan(bottom.fwd);
    expect(bottom.fwd).toBeGreaterThan(bottom.up * 2);
    expect(late.up).toBeGreaterThan(late.fwd * 2);
  });

  it('perfect window is centred on the leg tuck and bounded in time', () => {
    const end = 60, omega = 60; // deg, deg/s
    const tuck = T.web.swingJumpTuckPhase;
    expect(swingJumpPerfect(tuck, end, omega)).toBe(1);
    const half = (T.web.swingJumpPerfectWindow / 2) * omega / end; // phase units
    expect(swingJumpPerfect(tuck + half * 0.9, end, omega)).toBe(1);
    expect(swingJumpPerfect(tuck + half * 3, end, omega)).toBe(0);
    expect(swingJumpPerfect(-0.3, end, omega)).toBe(0);
    const p = swingJumpImpulse(tuck, 1, { fwd: 0, up: 0 });
    const n = swingJumpImpulse(tuck, 0, { fwd: 0, up: 0 });
    expect(Math.hypot(p.fwd, p.up)).toBeGreaterThan(Math.hypot(n.fwd, n.up) * 1.3);
  });

  /** Swing in the canyon for `n` steps with the given stick; returns horizontal speed. */
  function swingSpeed(moveX: number, moveY: number, n: number, strength = 10): { speed: number; minFeet: number; state: string } {
    const p = makePlayer(canyonWorld()); // resets tuning, so set the assist after it
    T.assist.strength = strength;
    p.spawn(0, 40, 50);
    p.vel.set(0, 0, -22);
    p.rope.attach(new Vector3(0, 70, 25), p.pos);
    p.fsm.transition('Swinging', null);
    const input = new Intent();
    input.traverse = true;
    input.moveX = moveX;
    input.moveY = moveY;
    input.camYaw = 0; // camera looks down −z, the direction of travel
    let minFeet = Infinity;
    stepN(p, input, n, 1 / 120, () => { minFeet = Math.min(minFeet, p.feetY); });
    return { speed: Math.hypot(p.vel.x, p.vel.z), minFeet, state: p.state };
  }

  it('steering against the momentum costs speed', () => {
    const along = swingSpeed(0, 1, 60);
    const against = swingSpeed(0, -1, 60);
    expect(against.speed).toBeLessThan(along.speed - 3);
  });

  it('swing assist 10 keeps the arc off the street; assist 0 is raw rope physics', () => {
    // a web longer than the anchor is high: its natural arc bottom is below street level
    const run = (strength: number) => {
      const p = makePlayer(canyonWorld());
      T.assist.strength = strength;
      p.spawn(0, 20, 40);
      p.vel.set(0, -5, -20);
      p.rope.attach(new Vector3(0, 35, 0), p.pos);
      p.fsm.transition('Swinging', null);
      const input = new Intent();
      input.traverse = true;
      let minFeet = Infinity;
      let touched = false;
      stepN(p, input, 240, 1 / 120, () => {
        minFeet = Math.min(minFeet, p.feetY);
        if (p.onGround) touched = true;
      });
      return { minFeet, touched };
    };
    const full = run(10), raw = run(0);
    expect(full.touched).toBe(false);
    expect(full.minFeet).toBeGreaterThan(2);
    expect(raw.touched || raw.minFeet < full.minFeet - 1).toBe(true);
  });
});

describe('web catch', () => {
  beforeEach(() => resetTuning());

  /** Fall onto a fresh web at speed; returns peak rope load (g) and the speed kept. */
  function catchOutOfFall(catchMaxG: number) {
    const p = makePlayer(canyonWorld());
    T.web.catchMaxG = catchMaxG;
    p.spawn(0, 40, 30);
    p.vel.set(0, -22, -8); // moving away from the anchor at ~13 m/s the moment the web tightens
    p.rope.attach(new Vector3(0, 75, 5), p.pos);
    p.fsm.transition('Swinging', null);
    const input = new Intent();
    input.traverse = true;
    const s0 = p.speed;
    let peak = 0;
    stepN(p, input, 60, 1 / 120, () => { peak = Math.max(peak, p.rope.tension / (T.physics.mass * T.physics.gravity)); });
    return { peak, kept: p.speed / s0 };
  }

  it('a soft catch brakes over a few frames instead of one: a strong pull, not a 20 g jerk', () => {
    const soft = catchOutOfFall(T.web.catchMaxG);
    const rigid = catchOutOfFall(0);
    expect(rigid.peak).toBeGreaterThan(12);
    expect(soft.peak).toBeLessThan(7);
    expect(soft.kept).toBeGreaterThan(0.8);
  });
});
