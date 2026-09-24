import { CollisionWorld, Kind } from '../world/CollisionWorld';
import type { CityLayout } from './CityGenerator';

/** Turn a generated layout into collision boxes. Visual-only details (windows, trim) are skipped. */
export function buildCollision(city: CityLayout): CollisionWorld {
  const w = new CollisionWorld(16);
  for (const b of city.buildings) {
    for (const t of b.tiers) w.addBox(t.x0, t.y0, t.z0, t.x1, t.y1, t.z1, Kind.Building, b.id);
  }
  for (const p of city.props) {
    const hx = p.sx / 2, hz = p.sz / 2;
    switch (p.type) {
      case 'parapet':
        w.addBox(p.x - hx, p.y, p.z - hz, p.x + hx, p.y + p.sy, p.z + hz, Kind.Building | Kind.Low, p.building);
        break;
      case 'hvac':
      case 'vent':
      case 'kiosk':
        w.addBox(p.x - hx, p.y, p.z - hz, p.x + hx, p.y + p.sy, p.z + hz, Kind.Prop | Kind.Low, p.building);
        break;
      case 'waterTower': {
        const r = p.sx, legH = p.sy, tankH = p.sz;
        const s = r * 0.85; // square that fits a cylinder well enough for gameplay
        w.addBox(p.x - s, p.y + legH, p.z - s, p.x + s, p.y + legH + tankH + r * 0.5, p.z + s, Kind.Prop, p.building);
        w.addBox(p.x - s * 0.8, p.y, p.z - s * 0.8, p.x + s * 0.8, p.y + legH, p.z + s * 0.8, Kind.Prop | Kind.NoWeb, p.building);
        break;
      }
      case 'antenna':
        w.addBox(p.x - 0.6, p.y, p.z - 0.6, p.x + 0.6, p.y + p.sy, p.z + 0.6, Kind.Prop | Kind.NoWeb, p.building);
        break;
      case 'billboard': {
        const bh = p.sy;
        w.addBox(p.x - hx, p.y + 2.2, p.z - hz, p.x + hx, p.y + bh, p.z + hz, Kind.Prop, p.building);
        break;
      }
      case 'streetLight':
      case 'signal':
        w.addBox(p.x - 0.15, 0, p.z - 0.15, p.x + 0.15, p.sy, p.z + 0.15, Kind.Prop | Kind.NoWeb);
        break;
      case 'tree':
        w.addBox(p.x - 0.25, 0, p.z - 0.25, p.x + 0.25, p.sy * 0.45, p.z + 0.25, Kind.Prop | Kind.NoWeb);
        break;
      default:
        break;
    }
  }
  w.build();
  return w;
}
