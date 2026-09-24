import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { predict, makePrediction } from '../src/web/TrajectoryPredictor';
import { Intent } from '../src/input/Intent';
import { canyonWorld, makePlayer, stepN } from './helpers';
import { resetTuning, T } from '../src/core/tuning';

describe('trajectory prediction', () => {
  beforeEach(() => resetTuning());

  it('ballistic prediction matches the simulated player within 1 m after 1 s', () => {
    const world = canyonWorld();
    const p = makePlayer(world);
    p.spawn(0, 60, 0);
    p.vel.set(0, 8, -20);
    const pr = predict(p.pos, p.vel, null, 0, null, 1.0, 1 / 120, null, null, makePrediction(200));
    const input = new Intent();
    stepN(p, input, 120);
    expect(pr.endPos.distanceTo(p.pos)).toBeLessThan(1.0);
  });

  it('swing prediction matches the simulated swing within 2 m after 1 s', () => {
    const world = canyonWorld();
    const p = makePlayer(world);
    T.assist.enabled = 0;
    T.web.autoReleaseAngle = 999; // compare the pendulum itself, not the top-of-arc release
    p.spawn(0, 40, 0);
    p.vel.set(0, 0, -20);
    const anchor = new Vector3(9.9, 70, -25);
    const des = new Vector3(0, 0, 0.65);
    const pr = predict(p.pos, p.vel, anchor, p.pos.distanceTo(anchor), des, 1.0, 1 / 120, null, null, makePrediction(200), false);
    p.rope.attach(anchor, p.pos);
    p.fsm.transition('Swinging', null);
    const input = new Intent();
    input.traverse = true;
    input.camYaw = Math.PI; // stick at 0.65 toward the camera's forward (+Z) = (0,0,0.65), same as `des`
    input.moveY = 0.65;
    stepN(p, input, 120);
    expect(pr.endPos.distanceTo(p.pos)).toBeLessThan(2);
  });
});
