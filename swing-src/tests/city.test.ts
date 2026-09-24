import { describe, it, expect } from 'vitest';
import { generateCity } from '../src/city/CityGenerator';
import { buildCollision } from '../src/city/buildCollision';

describe('procedural city', () => {
  it('is deterministic per seed', () => {
    const a = generateCity({ seed: 42 });
    const b = generateCity({ seed: 42 });
    expect(JSON.stringify(a.buildings)).toBe(JSON.stringify(b.buildings));
    const c = generateCity({ seed: 43 });
    expect(JSON.stringify(a.buildings)).not.toBe(JSON.stringify(c.buildings));
  });

  it('keeps buildings off the roads', () => {
    const city = generateCity({ seed: 7 });
    const halfA = city.params.avenueWidth / 2, halfS = city.params.streetWidth / 2;
    for (const b of city.buildings) {
      for (const t of b.tiers) {
        for (const x of city.avenueX) expect(t.x1 <= x - halfA + 1e-6 || t.x0 >= x + halfA - 1e-6).toBe(true);
        for (const z of city.streetZ) expect(t.z1 <= z - halfS + 1e-6 || t.z0 >= z + halfS - 1e-6).toBe(true);
      }
    }
  });

  it('produces a dense skyline with setbacks, props and perches', () => {
    const city = generateCity();
    expect(city.buildings.length).toBeGreaterThan(150);
    expect(city.stats.tallest).toBeGreaterThan(120);
    expect(city.buildings.some((b) => b.tiers.length > 1)).toBe(true);
    expect(city.props.filter((p) => p.type === 'waterTower').length).toBeGreaterThan(5);
    expect(city.perches.length).toBeGreaterThan(500);
    const world = buildCollision(city);
    expect(world.count).toBeGreaterThan(city.stats.tiers);
  });

  it('respects configurable parameters', () => {
    const small = generateCity({ blocksX: 2, blocksZ: 2, maxHeight: 40 });
    expect(small.blocks.length).toBe(4);
    expect(small.stats.tallest).toBeLessThanOrEqual(40);
  });
});
