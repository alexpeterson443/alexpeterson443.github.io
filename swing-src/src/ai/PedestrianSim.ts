import { Rng } from '../core/rng';
import type { CityLayout } from '../city/CityGenerator';
import { RoadGraph, AXIS_NS, AXIS_EW } from './RoadGraph';
import type { PlayerProbe } from './TrafficSim';

/** Pedestrian behaviour states (exposed to the renderer). */
export const PED_WALK = 0, PED_IDLE = 1, PED_FLEE = 2, PED_LOOK = 3;

export interface PedestrianOptions {
  pedestrians?: number;
  seed?: number;
  /** full-rate update radius around the focus (m) */
  nearRadius?: number;
  /** reduced-rate radius; beyond it pedestrians are all but frozen (1 Hz, not hashed, not rendered) */
  farRadius?: number;
}

const CELL = 2.5;
const SEP_R = 1.1;
// Corner k of a block loop: 0 NW, 1 NE, 2 SE, 3 SW. For each corner, the two crossings:
// [dBi, dBj, targetCorner, axisOfParallelTraffic]
const CROSS: number[][][] = [
  [[0, -1, 3, AXIS_NS], [-1, 0, 1, AXIS_EW]],
  [[0, -1, 2, AXIS_NS], [1, 0, 0, AXIS_EW]],
  [[0, 1, 1, AXIS_NS], [1, 0, 3, AXIS_EW]],
  [[0, 1, 0, AXIS_NS], [-1, 0, 2, AXIS_EW]],
];
// intersection node offset (di, dj) from block (bi, bj) for each corner
const CORNER_NODE = [[0, 0], [1, 0], [1, 1], [0, 1]];
// unit tangent (+u direction) and inward normal per edge
const TX = [1, 0, -1, 0], TZ = [0, 1, 0, -1];

/**
 * Pure pedestrian simulation. Each agent walks the rectangular sidewalk loop of its block at a
 * lateral inset `d` from the kerb (param `u` ∈ [0,4): integer part = edge, fraction = along it),
 * pauses now and then, crosses at corners on a parallel green, separates from neighbours via a
 * uniform spatial hash, and startles away from the player. Allocation-free per tick.
 */
export class PedestrianSim {
  readonly count: number;
  readonly block: Int32Array;
  readonly u: Float64Array;
  readonly d: Float32Array;
  readonly dir: Int8Array;
  readonly speed: Float32Array;
  readonly state: Uint8Array;
  /** 1 while on a crosswalk */
  readonly crossing: Uint8Array;
  readonly x: Float32Array;
  readonly z: Float32Array;
  /** facing yaw (atan2(dirX, dirZ), model faces +Z) */
  readonly heading: Float32Array;
  /** walk-cycle phase (radians) and current ground speed, for animation */
  readonly phase: Float32Array;
  readonly curSpeed: Float32Array;
  /** 0 full, 1 reduced, 2 frozen */
  readonly lod: Uint8Array;
  activeCount = 0;
  tick = 0;

  private readonly rng: Rng;
  private readonly homeD: Float32Array;
  private readonly timer: Float32Array;
  private readonly accDt: Float32Array;
  private readonly lookX: Float32Array;
  private readonly lookZ: Float32Array;
  private readonly runSpeed: Float32Array;
  // pending/active crossing
  private readonly cTarget: Int32Array; // target block
  private readonly cCorner: Int8Array; // target corner
  private readonly cAxis: Int8Array; // -1 = none pending
  private readonly cNode: Int32Array;
  private readonly cx0: Float32Array;
  private readonly cz0: Float32Array;
  private readonly cx1: Float32Array;
  private readonly cz1: Float32Array;
  private readonly cProg: Float32Array;
  private readonly sepU: Float32Array;
  private readonly sepSlow: Float32Array;
  // blocks
  private readonly bx0: Float64Array;
  private readonly bz0: Float64Array;
  private readonly bx1: Float64Array;
  private readonly bz1: Float64Array;
  private readonly blockAt: Int32Array; // bi * nbz + bj → block index
  private readonly blockI: Int32Array;
  private readonly blockJ: Int32Array;
  private readonly nbx: number;
  private readonly nbz: number;
  private readonly sw: number;
  // hash
  private readonly gx0: number;
  private readonly gz0: number;
  private readonly gw: number;
  private readonly gh: number;
  private readonly cellHead: Int32Array;
  private readonly cellNext: Int32Array;
  private readonly nearR2: number;
  private readonly farR2: number;

  constructor(readonly city: CityLayout, readonly graph: RoadGraph, opts: PedestrianOptions = {}) {
    const n = (this.count = opts.pedestrians ?? 600);
    this.rng = new Rng((opts.seed ?? 4242) ^ 0x51ed);
    this.nearR2 = (opts.nearRadius ?? 120) ** 2;
    this.farR2 = (opts.farRadius ?? 300) ** 2;
    this.sw = city.params.sidewalkWidth;
    const f32 = () => new Float32Array(n);
    this.block = new Int32Array(n); this.u = new Float64Array(n); this.d = f32(); this.dir = new Int8Array(n);
    this.speed = f32(); this.state = new Uint8Array(n); this.crossing = new Uint8Array(n);
    this.x = f32(); this.z = f32(); this.heading = f32(); this.phase = f32(); this.curSpeed = f32();
    this.lod = new Uint8Array(n);
    this.homeD = f32(); this.timer = f32(); this.accDt = f32(); this.lookX = f32(); this.lookZ = f32(); this.runSpeed = f32();
    this.cTarget = new Int32Array(n); this.cCorner = new Int8Array(n); this.cAxis = new Int8Array(n).fill(-1); this.cNode = new Int32Array(n);
    this.cx0 = f32(); this.cz0 = f32(); this.cx1 = f32(); this.cz1 = f32(); this.cProg = f32();
    this.sepU = f32(); this.sepSlow = f32();

    const B = city.blocks.length;
    this.bx0 = new Float64Array(B); this.bz0 = new Float64Array(B); this.bx1 = new Float64Array(B); this.bz1 = new Float64Array(B);
    this.nbx = city.params.blocksX; this.nbz = city.params.blocksZ;
    this.blockAt = new Int32Array(this.nbx * this.nbz).fill(-1);
    this.blockI = new Int32Array(B); this.blockJ = new Int32Array(B);
    const perim = new Float64Array(B);
    let total = 0;
    for (let b = 0; b < B; b++) {
      const bl = city.blocks[b];
      this.bx0[b] = bl.x0; this.bz0[b] = bl.z0; this.bx1[b] = bl.x1; this.bz1[b] = bl.z1;
      const cx = (bl.x0 + bl.x1) / 2, cz = (bl.z0 + bl.z1) / 2;
      let bi = 0, bj = 0;
      while (bi + 1 < city.avenueX.length && city.avenueX[bi + 1] < cx) bi++;
      while (bj + 1 < city.streetZ.length && city.streetZ[bj + 1] < cz) bj++;
      this.blockI[b] = bi; this.blockJ[b] = bj;
      if (bi < this.nbx && bj < this.nbz) this.blockAt[bi * this.nbz + bj] = b;
      total += perim[b] = 2 * (bl.x1 - bl.x0 + bl.z1 - bl.z0) * (bl.park ? 0.6 : 1);
    }

    const bd = city.bounds;
    this.gx0 = bd.x0; this.gz0 = bd.z0;
    this.gw = Math.ceil((bd.x1 - bd.x0) / CELL) + 1;
    this.gh = Math.ceil((bd.z1 - bd.z0) / CELL) + 1;
    this.cellHead = new Int32Array(this.gw * this.gh);
    this.cellNext = new Int32Array(n);

    const r = this.rng;
    for (let i = 0; i < n; i++) {
      let pick = r.next() * total, b = 0;
      while (b < B - 1 && (pick -= perim[b]) > 0) b++;
      this.block[i] = b;
      this.u[i] = r.next() * 4;
      this.homeD[i] = this.d[i] = r.range(1.5, Math.min(3, this.sw - 0.8));
      this.dir[i] = r.chance(0.5) ? 1 : -1;
      this.speed[i] = r.range(1.1, 1.7);
      this.runSpeed[i] = r.range(3.4, 5);
      this.phase[i] = r.range(0, 6.28);
      this.timer[i] = r.range(5, 60); // until next spontaneous pause
      this.place(i);
    }
  }

  private edgeLen(b: number, e: number, d: number): number {
    return (e & 1) === 0 ? this.bx1[b] - this.bx0[b] - 2 * d : this.bz1[b] - this.bz0[b] - 2 * d;
  }

  private cornerX(b: number, c: number, d: number): number {
    return c === 0 || c === 3 ? this.bx0[b] + d : this.bx1[b] - d;
  }

  private cornerZ(b: number, c: number, d: number): number {
    return c < 2 ? this.bz0[b] + d : this.bz1[b] - d;
  }

  /** Recompute world position/heading from loop coordinates. */
  private place(i: number): void {
    const b = this.block[i], d = this.d[i], u = this.u[i];
    const e = Math.floor(u) & 3, f = u - Math.floor(u);
    const L = this.edgeLen(b, e, d);
    this.x[i] = this.cornerX(b, e, d) + TX[e] * f * L;
    this.z[i] = this.cornerZ(b, e, d) + TZ[e] * f * L;
  }

  private cellOf(x: number, z: number): number {
    let cx = Math.floor((x - this.gx0) / CELL), cz = Math.floor((z - this.gz0) / CELL);
    cx = cx < 0 ? 0 : cx >= this.gw ? this.gw - 1 : cx;
    cz = cz < 0 ? 0 : cz >= this.gh ? this.gh - 1 : cz;
    return cz * this.gw + cx;
  }

  /** Startle everyone within a radius: run away, then turn to look at (x, z). strength 0..1. */
  notifyImpact(x: number, z: number, strength: number): void {
    const R = 6 + 14 * Math.min(1, Math.max(0, strength));
    for (let i = 0; i < this.count; i++) {
      const dx = this.x[i] - x, dz = this.z[i] - z;
      if (dx * dx + dz * dz < R * R) this.startle(i, x, z, strength);
    }
  }

  private startle(i: number, x: number, z: number, strength: number): void {
    this.lookX[i] = x;
    this.lookZ[i] = z;
    if (this.state[i] === PED_FLEE) return;
    this.state[i] = PED_FLEE;
    this.timer[i] = 1.2 + 1.8 * strength + this.rng.next();
    if (!this.crossing[i]) {
      this.cAxis[i] = -1;
      const e = Math.floor(this.u[i]) & 3;
      const away = (this.x[i] - x) * TX[e] + (this.z[i] - z) * TZ[e];
      this.dir[i] = away >= 0 ? 1 : -1;
    }
  }

  /** Advance. `t` is the signal clock shared with traffic; focus is the LOD centre. */
  update(dt: number, t: number, focusX: number, focusZ: number, player: PlayerProbe | null): void {
    const n = this.count;
    this.tick++;
    // spatial hash of non-frozen agents
    this.cellHead.fill(-1);
    let active = 0;
    for (let i = 0; i < n; i++) {
      const dx = this.x[i] - focusX, dz = this.z[i] - focusZ, d2 = dx * dx + dz * dz;
      const lod = d2 < this.nearR2 ? 0 : d2 < this.farR2 ? 1 : 2;
      this.lod[i] = lod;
      if (lod === 2) continue;
      active++;
      const c = this.cellOf(this.x[i], this.z[i]);
      this.cellNext[i] = this.cellHead[c];
      this.cellHead[c] = i;
    }
    this.activeCount = active;

    // player whooshing past at speed near street level
    if (player) {
      const sp = Math.hypot(player.vx, player.vy, player.vz);
      if (sp > 12 && player.y < 10) {
        const R = 7;
        const cx0 = Math.max(0, Math.floor((player.x - R - this.gx0) / CELL)), cx1 = Math.min(this.gw - 1, Math.floor((player.x + R - this.gx0) / CELL));
        const cz0 = Math.max(0, Math.floor((player.z - R - this.gz0) / CELL)), cz1 = Math.min(this.gh - 1, Math.floor((player.z + R - this.gz0) / CELL));
        for (let cz = cz0; cz <= cz1; cz++) for (let cx = cx0; cx <= cx1; cx++) {
          for (let j = this.cellHead[cz * this.gw + cx]; j >= 0; j = this.cellNext[j]) {
            const dx = this.x[j] - player.x, dz = this.z[j] - player.z;
            if (dx * dx + dz * dz < R * R && this.state[j] !== PED_FLEE) this.startle(j, player.x, player.z, Math.min(1, sp / 40));
          }
        }
      }
    }

    // separation (near LOD only): lateral push and slow-down behind someone
    for (let i = 0; i < n; i++) {
      this.sepU[i] = 0;
      this.sepSlow[i] = 1;
      if (this.lod[i] !== 0 || this.crossing[i]) continue;
      const xi = this.x[i], zi = this.z[i];
      const e = Math.floor(this.u[i]) & 3;
      const mx = TX[e] * this.dir[i], mz = TZ[e] * this.dir[i];
      const nxw = -TZ[e], nzw = TX[e]; // inward normal
      const cx = Math.floor((xi - this.gx0) / CELL), cz = Math.floor((zi - this.gz0) / CELL);
      for (let oz = -1; oz <= 1; oz++) for (let ox = -1; ox <= 1; ox++) {
        const gx = cx + ox, gz = cz + oz;
        if (gx < 0 || gz < 0 || gx >= this.gw || gz >= this.gh) continue;
        for (let j = this.cellHead[gz * this.gw + gx]; j >= 0; j = this.cellNext[j]) {
          if (j === i) continue;
          const dx = this.x[j] - xi, dz = this.z[j] - zi;
          const q = dx * dx + dz * dz;
          if (q > SEP_R * SEP_R || q < 1e-8) continue;
          const dist = Math.sqrt(q), w = 1 - dist / SEP_R;
          this.sepU[i] -= ((dx * nxw + dz * nzw) / dist) * w;
          const ahead = dx * mx + dz * mz;
          if (ahead > 0 && this.state[j] !== PED_FLEE) {
            const slow = 0.35 + 0.65 * (dist / SEP_R);
            if (slow < this.sepSlow[i]) this.sepSlow[i] = slow;
          }
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const lod = this.lod[i];
      this.accDt[i] += dt;
      if (lod === 2) this.curSpeed[i] = 0;
      if ((lod === 1 && (this.tick + i) % 4 !== 0) || (lod === 2 && (this.tick + i) % 32 !== 0)) continue;
      const h = this.accDt[i];
      this.accDt[i] = 0;
      this.step(i, h, t);
    }
  }

  private step(i: number, h: number, t: number): void {
    const st = this.state[i];
    this.timer[i] -= h;
    let v = 0;
    if (st === PED_WALK) {
      v = this.speed[i] * this.sepSlow[i];
      if (this.timer[i] <= 0) {
        this.state[i] = PED_IDLE;
        this.timer[i] = this.rng.range(1.5, 6);
      }
    } else if (st === PED_IDLE) {
      if (this.cAxis[i] >= 0 && !this.crossing[i]) {
        const rem = this.graph.greenRemaining(this.cNode[i], this.cAxis[i], t);
        const len = Math.hypot(this.cx1[i] - this.cx0[i], this.cz1[i] - this.cz0[i]);
        if (rem > len / (this.speed[i] * 1.3) + 1) {
          this.crossing[i] = 1;
          this.cProg[i] = 0;
          this.state[i] = PED_WALK;
          this.timer[i] = this.rng.range(20, 60);
        } else if (this.timer[i] <= 0) this.cAxis[i] = -1; // gave up waiting
      }
      if (this.timer[i] <= 0 && this.cAxis[i] < 0) {
        this.state[i] = PED_WALK;
        this.timer[i] = this.rng.range(15, 70);
      }
    } else if (st === PED_FLEE) {
      v = this.runSpeed[i];
      if (this.timer[i] <= 0) {
        this.state[i] = PED_LOOK;
        this.timer[i] = this.rng.range(3, 6.5);
      }
    } else if (this.timer[i] <= 0) {
      this.state[i] = PED_WALK;
      this.timer[i] = this.rng.range(15, 70);
    }
    this.curSpeed[i] = v;
    this.phase[i] += v * h * 4.4;

    if (this.crossing[i]) {
      const len = Math.max(0.1, Math.hypot(this.cx1[i] - this.cx0[i], this.cz1[i] - this.cz0[i]));
      const vc = this.state[i] === PED_FLEE ? v : this.state[i] === PED_WALK ? this.speed[i] * 1.3 : this.speed[i];
      this.curSpeed[i] = vc;
      this.cProg[i] += (vc * h) / len;
      if (this.cProg[i] >= 1) {
        // arrive on the next block's corner, continue along its loop away from the corner
        this.crossing[i] = 0;
        this.cAxis[i] = -1;
        this.block[i] = this.cTarget[i];
        const k = this.cCorner[i];
        this.u[i] = (((k + (this.dir[i] > 0 ? 1e-4 : -1e-4)) % 4) + 4) % 4;
        this.place(i);
      } else {
        const p = this.cProg[i];
        this.x[i] = this.cx0[i] + (this.cx1[i] - this.cx0[i]) * p;
        this.z[i] = this.cz0[i] + (this.cz1[i] - this.cz0[i]) * p;
        if (this.state[i] !== PED_LOOK && this.state[i] !== PED_IDLE) this.heading[i] = Math.atan2(this.cx1[i] - this.cx0[i], this.cz1[i] - this.cz0[i]);
        else this.faceLook(i);
      }
      return;
    }

    // lateral inset: relax toward home (hug the buildings while fleeing), plus separation
    const sw = this.sw;
    const home = this.state[i] === PED_FLEE ? sw - 0.6 : this.homeD[i] + this.dir[i] * 0.3;
    let d = this.d[i] + (home - this.d[i]) * Math.min(1, 0.8 * h) + this.sepU[i] * 1.6 * h;
    d = d < 0.7 ? 0.7 : d > sw - 0.5 ? sw - 0.5 : d;
    this.d[i] = d;

    if (v > 0) {
      const b = this.block[i];
      let u = this.u[i], dist = v * h;
      for (let guard = 0; guard < 6 && dist > 1e-6; guard++) {
        const e = Math.floor(u) & 3;
        const L = this.edgeLen(b, e, d);
        const f = u - Math.floor(u);
        const room = this.dir[i] > 0 ? (1 - f) * L : f * L;
        if (dist < room) { u += (this.dir[i] * dist) / L; break; }
        dist -= room;
        // reached a corner
        const corner = this.dir[i] > 0 ? (e + 1) & 3 : e;
        u = corner + (this.dir[i] > 0 ? 1e-4 : -1e-4);
        if (u < 0) u += 4;
        if (this.state[i] === PED_WALK && this.maybeQueueCrossing(i, corner)) { u = corner; break; }
      }
      this.u[i] = u >= 4 ? u - 4 : u;
    }
    this.place(i);
    if (this.state[i] === PED_LOOK) this.faceLook(i);
    else if (this.state[i] !== PED_IDLE) {
      const e = Math.floor(this.u[i]) & 3;
      this.heading[i] = Math.atan2(TX[e] * this.dir[i], TZ[e] * this.dir[i]);
    }
  }

  private faceLook(i: number): void {
    this.heading[i] = Math.atan2(this.lookX[i] - this.x[i], this.lookZ[i] - this.z[i]);
  }

  /** At a corner: sometimes decide to cross to the neighbouring block; waits (idle) for a parallel green. */
  private maybeQueueCrossing(i: number, corner: number): boolean {
    if (!this.rng.chance(0.3)) return false;
    const b = this.block[i];
    const opt = CROSS[corner][this.rng.chance(0.5) ? 0 : 1];
    const bi = this.blockI[b] + opt[0], bj = this.blockJ[b] + opt[1];
    if (bi < 0 || bj < 0 || bi >= this.nbx || bj >= this.nbz) return false;
    const tb = this.blockAt[bi * this.nbz + bj];
    if (tb < 0) return false;
    const d = this.d[i];
    this.cTarget[i] = tb;
    this.cCorner[i] = opt[2];
    this.cAxis[i] = opt[3];
    this.cNode[i] = (this.blockI[b] + CORNER_NODE[corner][0]) * this.graph.nz + this.blockJ[b] + CORNER_NODE[corner][1];
    this.cx0[i] = this.cornerX(b, corner, d);
    this.cz0[i] = this.cornerZ(b, corner, d);
    this.cx1[i] = this.cornerX(tb, opt[2], d);
    this.cz1[i] = this.cornerZ(tb, opt[2], d);
    this.state[i] = PED_IDLE;
    this.timer[i] = this.rng.range(15, 45); // patience
    this.heading[i] = Math.atan2(this.cx1[i] - this.cx0[i], this.cz1[i] - this.cz0[i]);
    return true;
  }

  /** 0..1 crowd density near a point (active agents within 30 m). */
  densityNear(x: number, z: number): number {
    const R = 30;
    let w = 0;
    const cx0 = Math.max(0, Math.floor((x - R - this.gx0) / CELL)), cx1 = Math.min(this.gw - 1, Math.floor((x + R - this.gx0) / CELL));
    const cz0 = Math.max(0, Math.floor((z - R - this.gz0) / CELL)), cz1 = Math.min(this.gh - 1, Math.floor((z + R - this.gz0) / CELL));
    for (let cz = cz0; cz <= cz1; cz++) for (let cx = cx0; cx <= cx1; cx++) {
      for (let j = this.cellHead[cz * this.gw + cx]; j >= 0; j = this.cellNext[j]) {
        const dd = Math.hypot(this.x[j] - x, this.z[j] - z);
        if (dd < R) w += 1 - dd / R;
      }
    }
    return Math.min(1, w / 6);
  }
}
