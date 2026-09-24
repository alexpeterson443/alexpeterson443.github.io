import { describe, it, expect } from 'vitest';
import { generateCity } from '../src/city/CityGenerator';
import { buildHorizonLayout, HORIZON_EXTENT } from '../src/render/HorizonLayout';

describe('horizon layout', () => {
  const city = generateCity({ seed: 1337 });
  const l = buildHorizonLayout(city);

  it('keeps every far building out of the playable district and inside the far plane', () => {
    const b = city.bounds;
    for (const f of l.buildings) {
      // axis-aligned extents of the rotated footprint
      const c = Math.abs(Math.cos(f.rot)), s = Math.abs(Math.sin(f.rot));
      const ex = (c * f.w + s * f.d) / 2, ez = (s * f.w + c * f.d) / 2;
      const inside = f.x + ex > b.x0 && f.x - ex < b.x1 && f.z + ez > b.z0 && f.z - ez < b.z1;
      expect(inside).toBe(false);
      expect(Math.hypot(f.x - l.centre.x, f.z - l.centre.z)).toBeLessThan(HORIZON_EXTENT);
    }
    expect(l.buildings.length).toBeGreaterThan(200);
  });

  it('has both land and water, and a finite skyline panorama', () => {
    let water = 0, land = 0;
    for (const c of l.cells) { if (c === 0) water++; else if (c === 1) land++; }
    expect(water).toBeGreaterThan(0);
    expect(land).toBeGreaterThan(0);
    for (const v of l.pano) expect(Number.isFinite(v)).toBe(true);
  });

  it('is deterministic for a seed', () => {
    const again = buildHorizonLayout(generateCity({ seed: 1337 }));
    expect(again.buildings.length).toBe(l.buildings.length);
    expect(again.buildings[10]).toEqual(l.buildings[10]);
  });
});
