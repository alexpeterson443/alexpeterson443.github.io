import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { CollisionWorld, Kind, makeHit, type Contact } from '../src/world/CollisionWorld';
import { Intent } from '../src/input/Intent';
import { canyonWorld, makePlayer, stepN } from './helpers';

describe('collision world', () => {
  const w = new CollisionWorld(8);
  w.addBox(0, 0, 0, 10, 20, 10, Kind.Building);
  w.addBox(30, 0, 0, 31, 5, 1, Kind.Prop | Kind.NoWeb);
  w.build();
  const hit = makeHit();

  it('raycasts return the entry face and normal', () => {
    expect(w.raycast(new Vector3(-5, 5, 5), new Vector3(1, 0, 0), 100, hit)).toBe(true);
    expect(hit.t).toBeCloseTo(5, 5);
    expect(hit.normal.toArray()).toEqual([-1, 0, 0]);
    expect(w.raycast(new Vector3(5, 30, 5), new Vector3(0, -1, 0), 100, hit)).toBe(true);
    expect(hit.point.y).toBeCloseTo(20, 5);
    expect(hit.normal.y).toBe(1);
  });

  it('hits the ground plane and respects max distance and kind filters', () => {
    expect(w.raycast(new Vector3(-20, 10, -20), new Vector3(0, -1, 0), 100, hit)).toBe(true);
    expect(hit.box).toBe(-1);
    expect(w.raycast(new Vector3(-5, 5, 5), new Vector3(1, 0, 0), 4, hit)).toBe(false);
    expect(w.raycast(new Vector3(25, 2, 0.5), new Vector3(1, 0, 0), 100, hit, Kind.NoWeb, false)).toBe(false);
  });

  it('ignores the box a ray starts inside', () => {
    expect(w.raycast(new Vector3(5, 5, 5), new Vector3(1, 0, 0), 100, hit, 0, false)).toBe(false);
  });

  it('long diagonal rays traverse many grid cells correctly', () => {
    const d = new Vector3(1, 0.05, 1).normalize();
    expect(w.raycast(new Vector3(-50, 1, -50), d, 200, hit, 0, false)).toBe(true);
    expect(hit.box).toBe(0);
  });

  it('pushes spheres out of faces, edges and corners', () => {
    const cs: Contact[] = [];
    const face = new Vector3(-0.2, 5, 5);
    w.resolveSphere(face, 0.5, cs);
    expect(face.x).toBeCloseTo(-0.5, 5);
    const edge = new Vector3(-0.2, 5, -0.2);
    w.resolveSphere(edge, 0.5, cs);
    expect(Math.hypot(edge.x, edge.z)).toBeCloseTo(0.5, 4);
    const inside = new Vector3(5, 19.9, 5);
    w.resolveSphere(inside, 0.5, cs);
    expect(inside.y).toBeCloseTo(20.5, 4);
  });

  it('does not tunnel a player through a wall at 150 m/s', () => {
    const world = canyonWorld();
    const p = makePlayer(world);
    p.spawn(0, 30, 0);
    p.vel.set(150, 0, 0); // toward tower B face at x = 10
    const input = new Intent();
    stepN(p, input, 30);
    expect(p.pos.x).toBeLessThan(10);
  });
});
