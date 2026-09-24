import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { Intent } from '../src/input/Intent';
import { canyonWorld, makePlayer, stepN } from './helpers';
import { resetTuning, T } from '../src/core/tuning';
import type { StateId } from '../src/player/StateMachine';

function visited(p: ReturnType<typeof makePlayer>): Set<StateId> {
  return new Set(p.fsm.history.map((h) => h.to));
}

describe('movement state machine', () => {
  beforeEach(() => resetTuning());

  it('spawns into the air and lands on the street', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 3, 0);
    stepN(p, new Intent(), 120);
    expect(p.state).toBe('Grounded');
    expect(p.feetY).toBeCloseTo(0, 1);
  });

  it('walks, sprints and decelerates', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 0, 100);
    const input = new Intent();
    stepN(p, input, 30);
    input.moveY = 1;
    stepN(p, input, 120);
    expect(p.hSpeed).toBeCloseTo(T.ground.jogSpeed, 0);
    input.traverse = true;
    stepN(p, input, 180);
    expect(p.hSpeed).toBeGreaterThan(T.ground.sprintSpeed * 0.95);
    input.traverse = false;
    input.moveY = 0;
    stepN(p, input, 120);
    expect(p.hSpeed).toBeLessThan(0.1);
  });

  it('variable jump: holding jump goes higher than tapping', () => {
    const apex = (hold: number) => {
      const p = makePlayer(canyonWorld());
      p.spawn(0, 0, 100);
      const input = new Intent();
      input.moveY = 1;
      stepN(p, input, 60);
      input.jump = true;
      let maxY = 0;
      stepN(p, input, 200, 1 / 120, (i) => { if (i === hold) input.jump = false; maxY = Math.max(maxY, p.feetY); });
      return maxY;
    };
    expect(apex(60)).toBeGreaterThan(apex(3) * 1.3);
  });

  it('charges a super jump from standstill', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 0, 100);
    const input = new Intent();
    stepN(p, input, 30);
    input.jump = true;
    stepN(p, input, 80);
    input.jump = false;
    let maxY = 0;
    stepN(p, input, 300, 1 / 120, () => { maxY = Math.max(maxY, p.feetY); });
    expect(maxY).toBeGreaterThan(12);
  });

  it('chains jump → swing → release → air → land and keeps momentum on release', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 30, 50);
    p.vel.set(0, 0, -20);
    const input = new Intent();
    input.moveY = 1; // camYaw 0 → forward = −Z
    input.traverse = true;
    let swung = false;
    stepN(p, input, 240, 1 / 120, () => { if (p.state === 'Swinging') swung = true; });
    expect(swung).toBe(true);
    // release near the bottom/up-swing
    let guard = 0;
    while (p.state === 'Swinging' && !(p.rope.swingAngle > 15 && p.vel.y > 0) && guard++ < 600) stepN(p, input, 1);
    const vBefore = p.vel.clone();
    input.traverse = false;
    stepN(p, input, 1);
    expect(p.state).toBe('Airborne');
    expect(p.vel.length()).toBeGreaterThanOrEqual(vBefore.length() * 0.95);
    expect(p.releaseQuality).toBeGreaterThan(0.3);
    stepN(p, input, 1200);
    expect(['Grounded', 'Landing', 'Recovery', 'WallCrawling']).toContain(p.state);
  });

  it('wall-runs up a facade when sprinting into it with traverse', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(5, 0, -100);
    const input = new Intent();
    input.camYaw = -Math.PI / 2; // face +X toward tower B at x = 10
    input.moveY = 1;
    input.traverse = true;
    let maxY = 0;
    stepN(p, input, 240, 1 / 120, () => { maxY = Math.max(maxY, p.pos.y); });
    expect(visited(p).has('WallRunning')).toBe(true);
    expect(maxY).toBeGreaterThan(15);
  });

  it('runs up and over the top of a wall onto the roof', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(5, 0, -100);
    const input = new Intent();
    input.camYaw = -Math.PI / 2;
    input.moveY = 1;
    input.traverse = true;
    stepN(p, input, 900);
    expect(p.feetY).toBeGreaterThan(79);
    expect(visited(p).has('Mantling') || visited(p).has('Airborne')).toBe(true);
  });

  it('sticks to a wall (crawl) when hitting it without traverse, and can wall-jump', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(6, 20, -100);
    p.vel.set(12, 0, 0);
    const input = new Intent();
    stepN(p, input, 60);
    expect(p.state).toBe('WallCrawling');
    input.jump = true;
    stepN(p, input, 2);
    expect(p.state).toBe('Airborne');
    expect(p.vel.x).toBeLessThan(0);
  });

  it('vaults a low obstacle while running', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 0, -20);
    const input = new Intent();
    input.moveY = 1;
    input.traverse = true;
    stepN(p, input, 240);
    expect(visited(p).has('Vaulting')).toBe(true);
    expect(p.pos.z).toBeLessThan(-32);
  });

  it('classifies landings by impact speed', () => {
    const land = (vy: number, vx: number) => {
      const p = makePlayer(canyonWorld());
      p.spawn(0, 0.3, 100);
      p.vel.set(vx, vy, 0);
      stepN(p, new Intent(), 12);
      return p.state;
    };
    expect(land(-8, 0)).toBe('Grounded');
    expect(land(-22, 15)).toBe('Landing');
    expect(land(-35, 0)).toBe('Recovery');
  });

  it('soft-limits speed to maxNormalSpeed and allows faster dives', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 2000, 150);
    const input = new Intent();
    stepN(p, input, 1200);
    expect(p.speed).toBeLessThan(T.physics.maxNormalSpeed + 3);
    input.dive = true;
    input.camForward.set(0, -1, 0);
    stepN(p, input, 600);
    expect(p.speed).toBeGreaterThan(T.physics.maxNormalSpeed + 5);
    expect(p.speed).toBeLessThan(T.physics.maxDiveSpeed + 3);
  });

  it('web-zips to a point and point-launches with a jump', () => {
    const p = makePlayer(canyonWorld());
    p.spawn(0, 20, 0);
    p.perchTarget = { x: 10, y: 80, z: -30, building: 1, kind: 'roofCorner' };
    const input = new Intent();
    input.zip = true;
    stepN(p, input, 1);
    // keep the target while zipping
    expect(p.state).toBe('WebZip');
    input.zip = false;
    stepN(p, input, 60);
    input.jump = true;
    stepN(p, input, 200, 1 / 120, () => { if (p.state === 'PointLaunch') input.jump = false; });
    expect(visited(p).has('PointLaunch')).toBe(true);
  });

  it('player input materially changes the swing trajectory (not on rails)', () => {
    const run = (mx: number) => {
      const p = makePlayer(canyonWorld());
      p.spawn(0, 40, 50);
      p.vel.set(0, 0, -20);
      const anchor = new Vector3(-9.9, 70, 20);
      p.rope.attach(anchor, p.pos);
      p.fsm.transition('Swinging', null);
      const input = new Intent();
      input.traverse = true;
      input.moveX = mx;
      input.moveY = 0.7;
      // heading is compared while still on the web (steering hard into the canyon walls ends in a
      // wall run, whose velocity is vertical)
      const swingVel = p.vel.clone();
      stepN(p, input, 150, 1 / 120, () => { if (p.state === 'Swinging') swingVel.copy(p.vel); });
      return { pos: p.pos.clone(), vel: swingVel };
    };
    const a = run(-0.7), b = run(0.7);
    expect(a.pos.distanceTo(b.pos)).toBeGreaterThan(3);
    expect(a.pos.x).toBeLessThan(b.pos.x - 3); // each went the way it steered
    const ang = Math.acos(a.vel.clone().setY(0).normalize().dot(b.vel.clone().setY(0).normalize()));
    expect(ang).toBeGreaterThan(0.25);
  });
});
