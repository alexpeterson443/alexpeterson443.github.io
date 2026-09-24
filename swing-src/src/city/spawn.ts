import type { CityLayout } from './CityGenerator';

/**
 * A mid-height rooftop beside the middle avenue toward the south end. Returns the stand point at
 * the roof edge overlooking the avenue and the yaw that faces into it.
 */
export function findSpawn(c: CityLayout): { x: number; y: number; z: number; yaw: number } {
  const ax = c.avenueX[Math.floor(c.avenueX.length / 2)];
  let best = c.buildings[0], bestScore = -Infinity;
  for (const b of c.buildings) {
    const t = b.tiers[b.tiers.length - 1];
    const cx = (t.x0 + t.x1) / 2, cz = (t.z0 + t.z1) / 2;
    const score = -Math.abs(b.height - 55) * 0.6 - Math.abs(cx - ax) * 0.5 - Math.abs(cz - (c.bounds.z1 - 120)) * 0.3;
    if (score > bestScore) { bestScore = score; best = b; }
  }
  const top = best.tiers[best.tiers.length - 1];
  // stand a few metres in from the roof edge that faces the avenue, clear of rooftop props
  const west = ax < (top.x0 + top.x1) / 2;
  const x = west ? top.x0 + 4 : top.x1 - 4;
  let z = (top.z0 + top.z1) / 2;
  for (const p of c.props) {
    if (p.building !== best.id || p.type === 'parapet') continue;
    if (Math.abs(p.x - x) < p.sx / 2 + 2 && Math.abs(p.z - z) < p.sz / 2 + 2) z = p.z + p.sz / 2 + 2.5 < top.z1 - 1 ? p.z + p.sz / 2 + 2.5 : p.z - p.sz / 2 - 2.5;
  }
  // yaw convention: 0 = −Z; +π/2 faces −X (west)
  return { x, y: top.y1 + 0.2, z, yaw: west ? Math.PI / 2 : -Math.PI / 2 };
}
