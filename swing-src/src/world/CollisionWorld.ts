import { Vector3 } from 'three';

/** Surface classification bits. */
export const Kind = {
  Building: 1,
  Prop: 2, // HVAC, water tower, billboard frame…
  Perch: 4, // good point-launch/perch target (roof corners, tower tops, poles)
  NoWeb: 8, // webs don't stick (e.g. thin poles)
  Low: 16, // vaultable obstacle
} as const;

export interface RayHit {
  t: number;
  point: Vector3;
  normal: Vector3;
  box: number; // -1 = ground plane
}

export interface Contact {
  normal: Vector3;
  depth: number;
  box: number;
}

/**
 * Static collision world made of axis-aligned boxes plus an infinite ground plane at y = 0.
 * Boxes are stored struct-of-arrays and indexed by a uniform 2D (XZ) grid; cities are tall
 * and flat, so a 2D grid is the right trade-off. Raycasts walk the grid with 2D DDA.
 */
export class CollisionWorld {
  minX = new Float32Array(0);
  minY = new Float32Array(0);
  minZ = new Float32Array(0);
  maxX = new Float32Array(0);
  maxY = new Float32Array(0);
  maxZ = new Float32Array(0);
  kind = new Uint8Array(0);
  owner = new Int32Array(0); // building id or -1
  count = 0;

  readonly cell: number;
  private gx0 = 0;
  private gz0 = 0;
  private gw = 1;
  private gh = 1;
  private cellStart = new Int32Array(1);
  private cellItems = new Int32Array(0);
  private stamp = new Uint32Array(0);
  private stampId = 1;
  private pending: number[] = [];

  /** Counters for the profiler/debug HUD. */
  stats = { raycasts: 0, sphereQueries: 0 };

  constructor(cellSize = 16) {
    this.cell = cellSize;
  }

  addBox(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, kind: number, owner = -1): number {
    this.pending.push(minX, minY, minZ, maxX, maxY, maxZ, kind, owner);
    return this.pending.length / 8 - 1;
  }

  /** Finalise pending boxes and build the grid. Call once after all addBox calls. */
  build(): void {
    const n = this.pending.length / 8;
    this.count = n;
    this.minX = new Float32Array(n);
    this.minY = new Float32Array(n);
    this.minZ = new Float32Array(n);
    this.maxX = new Float32Array(n);
    this.maxY = new Float32Array(n);
    this.maxZ = new Float32Array(n);
    this.kind = new Uint8Array(n);
    this.owner = new Int32Array(n);
    this.stamp = new Uint32Array(n);
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (let i = 0; i < n; i++) {
      const p = this.pending, o = i * 8;
      this.minX[i] = p[o]; this.minY[i] = p[o + 1]; this.minZ[i] = p[o + 2];
      this.maxX[i] = p[o + 3]; this.maxY[i] = p[o + 4]; this.maxZ[i] = p[o + 5];
      this.kind[i] = p[o + 6]; this.owner[i] = p[o + 7];
      x0 = Math.min(x0, p[o]); z0 = Math.min(z0, p[o + 2]);
      x1 = Math.max(x1, p[o + 3]); z1 = Math.max(z1, p[o + 5]);
    }
    if (n === 0) { x0 = z0 = 0; x1 = z1 = 1; }
    const c = this.cell;
    this.gx0 = Math.floor(x0 / c) * c;
    this.gz0 = Math.floor(z0 / c) * c;
    this.gw = Math.max(1, Math.ceil((x1 - this.gx0) / c));
    this.gh = Math.max(1, Math.ceil((z1 - this.gz0) / c));
    const counts = new Int32Array(this.gw * this.gh + 1);
    const forCells = (i: number, fn: (ci: number) => void) => {
      const cx0 = this.cx(this.minX[i]), cx1 = this.cx(this.maxX[i]);
      const cz0 = this.cz(this.minZ[i]), cz1 = this.cz(this.maxZ[i]);
      for (let z = cz0; z <= cz1; z++) for (let x = cx0; x <= cx1; x++) fn(z * this.gw + x);
    };
    for (let i = 0; i < n; i++) forCells(i, (ci) => counts[ci + 1]++);
    for (let i = 1; i < counts.length; i++) counts[i] += counts[i - 1];
    this.cellStart = counts;
    this.cellItems = new Int32Array(counts[counts.length - 1]);
    const fill = counts.slice(0, -1);
    for (let i = 0; i < n; i++) forCells(i, (ci) => { this.cellItems[fill[ci]++] = i; });
    this.pending = [];
  }

  private cx(x: number): number {
    return Math.min(this.gw - 1, Math.max(0, Math.floor((x - this.gx0) / this.cell)));
  }
  private cz(z: number): number {
    return Math.min(this.gh - 1, Math.max(0, Math.floor((z - this.gz0) / this.cell)));
  }
  private nextStamp(): number {
    if (++this.stampId === 0xffffffff) { this.stamp.fill(0); this.stampId = 1; }
    return this.stampId;
  }

  /** Visit each box whose XZ footprint overlaps the rectangle once. Return true from fn to stop. */
  queryRect(x0: number, z0: number, x1: number, z1: number, fn: (i: number) => boolean | void): void {
    const s = this.nextStamp();
    const cx0 = this.cx(x0), cx1 = this.cx(x1), cz0 = this.cz(z0), cz1 = this.cz(z1);
    for (let z = cz0; z <= cz1; z++) {
      for (let x = cx0; x <= cx1; x++) {
        const ci = z * this.gw + x;
        for (let k = this.cellStart[ci]; k < this.cellStart[ci + 1]; k++) {
          const i = this.cellItems[k];
          if (this.stamp[i] === s) continue;
          this.stamp[i] = s;
          if (this.maxX[i] < x0 || this.minX[i] > x1 || this.maxZ[i] < z0 || this.minZ[i] > z1) continue;
          if (fn(i) === true) return;
        }
      }
    }
  }

  /** Slab test. Returns entry distance or -1. Writes the entry face normal axis into outAxis[0]. */
  private rayBox(i: number, ox: number, oy: number, oz: number, idx: number, idy: number, idz: number, tMax: number, n: Vector3): number {
    let t0 = 0, t1 = tMax, ax = -1, sign = 0;
    // X
    let a = (this.minX[i] - ox) * idx, b = (this.maxX[i] - ox) * idx;
    if (a > b) { const t = a; a = b; b = t; }
    if (a > t0) { t0 = a; ax = 0; sign = idx > 0 ? -1 : 1; }
    if (b < t1) t1 = b;
    if (t0 > t1) return -1;
    a = (this.minY[i] - oy) * idy; b = (this.maxY[i] - oy) * idy;
    if (a > b) { const t = a; a = b; b = t; }
    if (a > t0) { t0 = a; ax = 1; sign = idy > 0 ? -1 : 1; }
    if (b < t1) t1 = b;
    if (t0 > t1) return -1;
    a = (this.minZ[i] - oz) * idz; b = (this.maxZ[i] - oz) * idz;
    if (a > b) { const t = a; a = b; b = t; }
    if (a > t0) { t0 = a; ax = 2; sign = idz > 0 ? -1 : 1; }
    if (b < t1) t1 = b;
    if (t0 > t1 || ax < 0) return -1; // ax<0: origin inside box → ignore
    n.set(ax === 0 ? sign : 0, ax === 1 ? sign : 0, ax === 2 ? sign : 0);
    return t0;
  }

  private readonly _n = new Vector3();

  /**
   * Ray cast against boxes (filtered by kind mask, skip mask) and the ground plane.
   * `dir` must be normalised. Returns true on hit and fills `out`.
   */
  raycast(origin: Vector3, dir: Vector3, maxDist: number, out: RayHit, skipKinds = 0, includeGround = true): boolean {
    this.stats.raycasts++;
    const ox = origin.x, oy = origin.y, oz = origin.z;
    const dx = dir.x, dy = dir.y, dz = dir.z;
    const idx = 1 / (dx || 1e-12), idy = 1 / (dy || 1e-12), idz = 1 / (dz || 1e-12);
    let best = maxDist, bestBox = -2;
    const bn = out.normal;
    if (includeGround && dy < 0 && oy > 0) {
      const t = -oy * idy;
      if (t < best) { best = t; bestBox = -1; bn.set(0, 1, 0); }
    }
    const s = this.nextStamp();
    // 2D DDA across grid cells
    const c = this.cell;
    let x = Math.floor((ox - this.gx0) / c), z = Math.floor((oz - this.gz0) / c);
    const stepX = dx > 0 ? 1 : -1, stepZ = dz > 0 ? 1 : -1;
    const tdx = Math.abs(dx) < 1e-9 ? Infinity : c / Math.abs(dx);
    const tdz = Math.abs(dz) < 1e-9 ? Infinity : c / Math.abs(dz);
    let tnx = Math.abs(dx) < 1e-9 ? Infinity : ((dx > 0 ? (x + 1) * c : x * c) + this.gx0 - ox) / dx;
    let tnz = Math.abs(dz) < 1e-9 ? Infinity : ((dz > 0 ? (z + 1) * c : z * c) + this.gz0 - oz) / dz;
    let tCell = 0;
    const n = this._n;
    for (let guard = 0; guard < 4096; guard++) {
      if (x >= 0 && z >= 0 && x < this.gw && z < this.gh) {
        const ci = z * this.gw + x;
        for (let k = this.cellStart[ci]; k < this.cellStart[ci + 1]; k++) {
          const i = this.cellItems[k];
          if (this.stamp[i] === s) continue;
          this.stamp[i] = s;
          if (this.kind[i] & skipKinds) continue;
          const t = this.rayBox(i, ox, oy, oz, idx, idy, idz, best, n);
          if (t >= 0 && t < best) { best = t; bestBox = i; bn.copy(n); }
        }
      } else {
        // outside grid and moving away → done
        if ((x < 0 && stepX < 0) || (x >= this.gw && stepX > 0) || (z < 0 && stepZ < 0) || (z >= this.gh && stepZ > 0)) break;
      }
      if (tCell > best) break;
      if (tnx < tnz) { tCell = tnx; tnx += tdx; x += stepX; } else { tCell = tnz; tnz += tdz; z += stepZ; }
      if (tCell > best) break;
    }
    if (bestBox === -2) return false;
    out.t = best;
    out.box = bestBox;
    out.point.set(ox + dx * best, oy + dy * best, oz + dz * best);
    return true;
  }

  /** True if the segment a→b is unobstructed (ignores ground if both ends above it). */
  lineOfSight(a: Vector3, b: Vector3, skipKinds = 0): boolean {
    const d = this._los.subVectors(b, a);
    const len = d.length();
    if (len < 1e-6) return true;
    d.multiplyScalar(1 / len);
    return !this.raycast(a, d, len - 0.05, this._losHit, skipKinds);
  }
  private readonly _los = new Vector3();
  private readonly _losHit: RayHit = { t: 0, point: new Vector3(), normal: new Vector3(), box: -1 };

  /**
   * Push a sphere out of all boxes and the ground. Appends contacts to `contacts` (reusing
   * objects) and returns the number written. Iterates to settle corners.
   */
  resolveSphere(c: Vector3, r: number, contacts: Contact[], startIndex = 0, skipKinds = 0): number {
    this.stats.sphereQueries++;
    let nC = startIndex;
    const push = (nx: number, ny: number, nz: number, depth: number, box: number) => {
      if (nC >= contacts.length) contacts.push({ normal: new Vector3(), depth: 0, box: -1 });
      const ct = contacts[nC++];
      ct.normal.set(nx, ny, nz);
      ct.depth = depth;
      ct.box = box;
    };
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      if (c.y < r) {
        push(0, 1, 0, r - c.y, -1);
        c.y = r;
        moved = true;
      }
      this.queryRect(c.x - r, c.z - r, c.x + r, c.z + r, (i) => {
        if (this.kind[i] & skipKinds) return;
        if (c.y + r < this.minY[i] || c.y - r > this.maxY[i]) return;
        const qx = Math.max(this.minX[i], Math.min(c.x, this.maxX[i]));
        const qy = Math.max(this.minY[i], Math.min(c.y, this.maxY[i]));
        const qz = Math.max(this.minZ[i], Math.min(c.z, this.maxZ[i]));
        let dx = c.x - qx, dy = c.y - qy, dz = c.z - qz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= r * r) return;
        let depth: number;
        if (d2 > 1e-10) {
          const d = Math.sqrt(d2);
          dx /= d; dy /= d; dz /= d;
          depth = r - d;
        } else {
          // centre inside the box: exit through the nearest face
          const px0 = c.x - this.minX[i], px1 = this.maxX[i] - c.x;
          const py0 = c.y - this.minY[i], py1 = this.maxY[i] - c.y;
          const pz0 = c.z - this.minZ[i], pz1 = this.maxZ[i] - c.z;
          let m = px0; dx = -1; dy = 0; dz = 0;
          if (px1 < m) { m = px1; dx = 1; dy = 0; dz = 0; }
          if (py0 < m) { m = py0; dx = 0; dy = -1; dz = 0; }
          if (py1 < m) { m = py1; dx = 0; dy = 1; dz = 0; }
          if (pz0 < m) { m = pz0; dx = 0; dy = 0; dz = -1; }
          if (pz1 < m) { m = pz1; dx = 0; dy = 0; dz = 1; }
          depth = m + r;
        }
        c.x += dx * depth; c.y += dy * depth; c.z += dz * depth;
        push(dx, dy, dz, depth, i);
        moved = true;
      });
      if (!moved) break;
    }
    return nC;
  }

  overlapsSphere(c: Vector3, r: number, skipKinds = 0): boolean {
    if (c.y < r) return true;
    let hit = false;
    this.queryRect(c.x - r, c.z - r, c.x + r, c.z + r, (i) => {
      if (this.kind[i] & skipKinds) return;
      const qx = Math.max(this.minX[i], Math.min(c.x, this.maxX[i]));
      const qy = Math.max(this.minY[i], Math.min(c.y, this.maxY[i]));
      const qz = Math.max(this.minZ[i], Math.min(c.z, this.maxZ[i]));
      const dx = c.x - qx, dy = c.y - qy, dz = c.z - qz;
      if (dx * dx + dy * dy + dz * dz < r * r) { hit = true; return true; }
    });
    return hit;
  }

  private readonly _down = new Vector3(0, -1, 0);
  private readonly _gh: RayHit = { t: 0, point: new Vector3(), normal: new Vector3(), box: -1 };
  /** Height of the highest surface below `p` (0 = street). */
  heightBelow(p: Vector3, maxDist = 1000): number {
    return this.raycast(p, this._down, maxDist, this._gh) ? this._gh.point.y : 0;
  }

  boxCenter(i: number, out: Vector3): Vector3 {
    return out.set((this.minX[i] + this.maxX[i]) / 2, (this.minY[i] + this.maxY[i]) / 2, (this.minZ[i] + this.maxZ[i]) / 2);
  }
}

export function makeHit(): RayHit {
  return { t: 0, point: new Vector3(), normal: new Vector3(), box: -1 };
}
