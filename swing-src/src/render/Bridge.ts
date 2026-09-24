import {
  BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments,
  Mesh, MeshStandardMaterial, Points, PointsMaterial, Vector3,
} from 'three';
import { WATER_Y, type BridgeSpec } from './HorizonLayout';
import { envUniforms } from './Environment';

/**
 * An original suspension bridge across the bay mouth: a deck on the span, two portal towers,
 * parabolic main cables with vertical hangers, and a necklace of deck lights at night. Seen from
 * a kilometre or more, so it is a handful of boxes and lines; the atmosphere fog does the rest.
 */
export class Bridge {
  readonly group = new Group();
  private readonly lights: PointsMaterial;

  constructor(b: BridgeSpec) {
    const a = new Vector3(b.ax, 0, b.az), e = new Vector3(b.bx, 0, b.bz);
    const span = a.distanceTo(e);
    const dir = new Vector3().subVectors(e, a).normalize();
    const side = new Vector3(-dir.z, 0, dir.x);
    const yaw = Math.atan2(dir.x, dir.z);
    const steel = new MeshStandardMaterial({ color: new Color(0x5e6a72), roughness: 0.55, metalness: 0.5 });
    const concrete = new MeshStandardMaterial({ color: new Color(0x8c8880), roughness: 0.85 });

    // deck
    const deck = new Mesh(new BoxGeometry(b.width, 3.2, span), steel);
    deck.position.copy(a).lerp(e, 0.5).setY(b.deckY);
    deck.rotation.y = yaw;
    this.group.add(deck);

    // towers: two legs, cross beams, a pier at the waterline
    const tops: Vector3[] = [];
    for (const t of b.towerT) {
      const c = a.clone().lerp(e, t);
      for (const s of [-1, 1]) {
        const leg = new Mesh(new BoxGeometry(5, b.towerH - WATER_Y, 6), steel);
        leg.position.copy(c).addScaledVector(side, s * (b.width * 0.5 + 2)).setY((b.towerH + WATER_Y) / 2);
        leg.rotation.y = yaw;
        this.group.add(leg);
      }
      for (const y of [b.deckY - 4, b.towerH * 0.62, b.towerH - 6]) {
        const beam = new Mesh(new BoxGeometry(b.width + 8, 4, 4), steel);
        beam.position.copy(c).setY(y);
        beam.rotation.y = yaw;
        this.group.add(beam);
      }
      const pier = new Mesh(new BoxGeometry(b.width + 16, 10, 18), concrete);
      pier.position.copy(c).setY(WATER_Y + 2);
      pier.rotation.y = yaw;
      this.group.add(pier);
      tops.push(c);
    }

    // main cables (parabola between the tower tops, dipping to just above the deck mid-span; straight
    // back-stays to the anchorages) and vertical hangers
    const cable: number[] = [];
    const hang: number[] = [];
    const [t0, t1] = b.towerT;
    const cableY = (u: number) => {
      if (u < t0) return b.deckY + 2 + (b.towerH - 4 - b.deckY - 2) * (u / t0);
      if (u > t1) return b.deckY + 2 + (b.towerH - 4 - b.deckY - 2) * ((1 - u) / (1 - t1));
      const m = (u - t0) / (t1 - t0) * 2 - 1;
      return b.deckY + 4 + (b.towerH - 4 - b.deckY - 4) * m * m;
    };
    const N = 80;
    for (const s of [-1, 1]) {
      let prev: Vector3 | null = null;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const p = a.clone().lerp(e, u).addScaledVector(side, s * (b.width * 0.5 + 2)).setY(cableY(u));
        if (prev) cable.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
        prev = p;
        if (u > t0 && u < t1 && i % 2 === 0) hang.push(p.x, p.y, p.z, p.x, b.deckY + 1.6, p.z);
      }
    }
    const cg = new BufferGeometry();
    cg.setAttribute('position', new Float32BufferAttribute(cable, 3));
    this.group.add(new LineSegments(cg, new LineBasicMaterial({ color: 0x4d575e })));
    const hg = new BufferGeometry();
    hg.setAttribute('position', new Float32BufferAttribute(hang, 3));
    this.group.add(new LineSegments(hg, new LineBasicMaterial({ color: 0x3f474d, transparent: true, opacity: 0.6 })));

    // deck lights along both edges and a light on each cable crest
    const lp: number[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      for (const s of [-1, 1]) {
        const p = a.clone().lerp(e, u).addScaledVector(side, s * b.width * 0.5).setY(b.deckY + 2.2);
        lp.push(p.x, p.y, p.z);
      }
    }
    for (const c of tops) lp.push(c.x, b.towerH + 1, c.z);
    const lg = new BufferGeometry();
    lg.setAttribute('position', new Float32BufferAttribute(lp, 3));
    this.lights = new PointsMaterial({ color: new Color(3.2, 2.4, 1.5), size: 3, sizeAttenuation: false, transparent: true, depthWrite: false });
    const pts = new Points(lg, this.lights);
    pts.frustumCulled = false;
    this.group.add(pts);
  }

  update(): void {
    const night = envUniforms.uNight.value;
    this.lights.opacity = Math.min(1, night * 1.4);
    this.lights.visible = night > 0.05;
  }
}
