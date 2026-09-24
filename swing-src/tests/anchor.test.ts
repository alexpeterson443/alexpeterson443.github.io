import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { AnchorSelector } from '../src/web/AnchorSelector';
import { CollisionWorld } from '../src/world/CollisionWorld';
import { canyonWorld } from './helpers';
import { resetTuning } from '../src/core/tuning';

describe('anchor selection', () => {
  beforeEach(() => resetTuning());

  it('attaches to real geometry ahead and above while travelling down a street', () => {
    const sel = new AnchorSelector(canyonWorld());
    const pos = new Vector3(0, 30, 0);
    const vel = new Vector3(0, -2, -25);
    const best = sel.select({ pos, vel, input: new Vector3(0, 0, -1), camForward: new Vector3(0, -0.2, -1).normalize(), prevAnchor: null });
    expect(best).not.toBeNull();
    expect(Math.abs(Math.abs(best!.point.x) - 10)).toBeLessThan(0.2); // on a facade/edge of a tower
    expect(best!.point.z).toBeLessThan(pos.z); // ahead
    expect(best!.point.y).toBeGreaterThan(pos.y + 5); // above
    expect(sel.count).toBeGreaterThan(10);
  });

  it('never attaches to empty sky', () => {
    const empty = new CollisionWorld();
    empty.build();
    const sel = new AnchorSelector(empty);
    const best = sel.select({ pos: new Vector3(0, 30, 0), vel: new Vector3(0, 0, -20), input: new Vector3(), camForward: new Vector3(0, 0, -1), prevAnchor: null });
    expect(best).toBeNull();
  });

  it('prefers the side the player is steering toward', () => {
    // a 50 m-wide avenue: room to swing on either side
    const w = new CollisionWorld(16);
    w.addBox(-60, 0, -400, -25, 90, 50, 1, 0);
    w.addBox(25, 0, -400, 60, 90, 50, 1, 1);
    w.build();
    const sel = new AnchorSelector(w);
    const pos = new Vector3(0, 30, 0);
    const vel = new Vector3(0, 0, -25);
    const cam = new Vector3(0, 0, -1);
    const left = sel.select({ pos, vel, input: new Vector3(-0.7, 0, -0.7), camForward: cam, prevAnchor: null })!;
    const leftX = left.point.x;
    const right = sel.select({ pos, vel, input: new Vector3(0.7, 0, -0.7), camForward: cam, prevAnchor: null })!;
    expect(leftX).toBeLessThan(0);
    expect(right.point.x).toBeGreaterThan(0);
  });

  it('penalises anchors whose predicted swing collides or scrapes the ground', () => {
    const sel = new AnchorSelector(canyonWorld());
    sel.select({ pos: new Vector3(0, 12, 0), vel: new Vector3(0, -8, -20), input: new Vector3(0, 0, -1), camForward: new Vector3(0, 0, -1), prevAnchor: null });
    const predicted = sel.candidates.slice(0, sel.count).filter((c) => c.predicted);
    expect(predicted.length).toBeGreaterThan(0);
    const best = sel.best!;
    for (const c of predicted) if (c.collided) expect(c.score).toBeLessThan(best.score);
  });

  it('runs fast enough to use every shot (< 3 ms in node)', () => {
    const sel = new AnchorSelector(canyonWorld());
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) sel.select({ pos: new Vector3(0, 30, -i), vel: new Vector3(0, -3, -30), input: new Vector3(0, 0, -1), camForward: new Vector3(0, 0, -1), prevAnchor: null });
    expect((performance.now() - t0) / 50).toBeLessThan(3);
  });
});
