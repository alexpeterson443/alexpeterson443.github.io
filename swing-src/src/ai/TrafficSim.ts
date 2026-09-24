import { Rng } from '../core/rng';
import { RoadGraph, LANE_ROAD, SIG_GREEN, SIG_AMBER, TURN_STRAIGHT, TURN_LEFT, TURN_RIGHT } from './RoadGraph';

/** Player state the traffic reacts to (plain numbers, no three.js). */
export interface PlayerProbe {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

export interface TrafficOptions {
  cars?: number;
  seed?: number;
  /** full-rate IDM within this radius of the focus (m) */
  nearRadius?: number;
  /** reduced-rate simplified model within this radius; coarse beyond */
  midRadius?: number;
}

// IDM parameters (shared; per-car variation lives in desired speed and length).
const IDM_A = 1.6; // max acceleration m/s²
const IDM_B = 2.6; // comfortable deceleration m/s²
const IDM_T = 1.25; // time headway s
const IDM_S0 = 2.2; // jam distance m
const MAX_DECEL = 9; // physical braking limit m/s²
const MIN_GAP = 0.6; // hard bumper-to-bumper floor
const TURN_SPEED = 6.5;
const STOP_MARGIN = 0.4; // front bumper stops this far before the lane end
const LOOKAHEAD = 90;
const CELL = 32;

/**
 * Pure traffic simulation: N cars on a RoadGraph using the Intelligent Driver Model, fixed-time
 * signals, box-entry claims to avoid merging conflicts, and distance LOD around a focus point.
 * All state is in typed arrays; `update` does not allocate.
 */
export class TrafficSim {
  readonly count: number;
  readonly lane: Int32Array;
  readonly s: Float64Array;
  readonly v: Float32Array;
  readonly v0: Float32Array;
  readonly length: Float32Array;
  readonly color: Uint8Array;
  /** next connector for road lanes (the chosen turn), -1 on connectors */
  readonly next: Int32Array;
  /** 1 = cleared to enter the next intersection */
  readonly go: Uint8Array;
  /** 0 = full IDM, 1 = reduced rate, 2 = coarse */
  readonly lod: Uint8Array;
  /** 1 while braking for the player */
  readonly yielding: Uint8Array;
  /** x, z, yaw per car (yaw = atan2(dirX, dirZ), model faces +Z) */
  readonly transforms: Float32Array;
  /** cars at full rate after the last update */
  activeCount = 0;
  tick = 0;

  private readonly rng: Rng;
  private readonly acc: Float32Array;
  private readonly honkCd: Float32Array;
  private readonly vNew: Float32Array;
  private readonly adv: Float32Array;
  private readonly upd: Uint8Array;
  // lane buckets (counting sort, rebuilt every tick)
  private readonly laneStart: Int32Array;
  private readonly laneCnt: Int32Array;
  private readonly order: Int32Array;
  private readonly rank: Int32Array;
  // box-entry claims per road lane: which connector currently feeds it, and how many cars are on it
  private readonly claimConn: Int32Array;
  private readonly claimCnt: Int32Array;
  // spatial grid for proximity queries
  private readonly gx0: number;
  private readonly gz0: number;
  private readonly gw: number;
  private readonly gh: number;
  private readonly cellHead: Int32Array;
  private readonly cellNext: Int32Array;
  private readonly honkBuf = new Float32Array(64);
  private honkN = 0;
  private readonly nearR2: number;
  private readonly midR2: number;

  constructor(readonly graph: RoadGraph, opts: TrafficOptions = {}) {
    const n = (this.count = opts.cars ?? 220);
    this.rng = new Rng((opts.seed ?? 4242) ^ 0x7a3f);
    this.nearR2 = (opts.nearRadius ?? 250) ** 2;
    this.midR2 = (opts.midRadius ?? 500) ** 2;
    this.lane = new Int32Array(n);
    this.s = new Float64Array(n);
    this.v = new Float32Array(n);
    this.v0 = new Float32Array(n);
    this.length = new Float32Array(n);
    this.color = new Uint8Array(n);
    this.next = new Int32Array(n);
    this.go = new Uint8Array(n);
    this.lod = new Uint8Array(n);
    this.yielding = new Uint8Array(n);
    this.transforms = new Float32Array(n * 3);
    this.acc = new Float32Array(n);
    this.honkCd = new Float32Array(n);
    this.vNew = new Float32Array(n);
    this.adv = new Float32Array(n);
    this.upd = new Uint8Array(n);
    const L = graph.laneCount;
    this.laneStart = new Int32Array(L);
    this.laneCnt = new Int32Array(L);
    this.order = new Int32Array(n);
    this.rank = new Int32Array(n);
    this.claimConn = new Int32Array(L).fill(-1);
    this.claimCnt = new Int32Array(L);
    const b = graph.city.bounds;
    this.gx0 = b.x0; this.gz0 = b.z0;
    this.gw = Math.ceil((b.x1 - b.x0) / CELL) + 1;
    this.gh = Math.ceil((b.z1 - b.z0) / CELL) + 1;
    this.cellHead = new Int32Array(this.gw * this.gh);
    this.cellNext = new Int32Array(n);
    this.spawn();
  }

  /** Scatter cars over road lanes without overlap. Deterministic. */
  private spawn(): void {
    const g = this.graph, r = this.rng;
    let placed = 0;
    for (let attempt = 0; placed < this.count && attempt < this.count * 50; attempt++) {
      const ln = r.int(0, g.roadLaneCount - 1);
      const len = r.range(4.2, 5.3);
      const s = r.range(len, g.len[ln] - len - 6);
      let ok = true;
      for (let j = 0; j < placed; j++) {
        if (this.lane[j] === ln && Math.abs(this.s[j] - s) < (len + this.length[j]) / 2 + 6) { ok = false; break; }
      }
      if (!ok) continue;
      this.setCar(placed, ln, s, 0);
      this.length[placed] = len;
      this.v0[placed] = r.range(10.5, 15);
      this.v[placed] = this.v0[placed] * r.range(0.3, 0.9);
      this.color[placed] = r.int(0, 255);
      this.honkCd[placed] = r.range(0, 3);
      placed++;
    }
    if (placed < this.count) throw new Error(`TrafficSim: could only place ${placed}/${this.count} cars`);
    this.buildIndex();
  }

  /** Put car i on a road lane at arc position s with speed v (tests and respawn). */
  setCar(i: number, lane: number, s: number, v: number): void {
    this.lane[i] = lane;
    this.s[i] = s;
    this.v[i] = v;
    this.go[i] = 0;
    this.acc[i] = 0;
    this.next[i] = this.graph.kind[lane] === LANE_ROAD ? this.chooseNext(lane) : -1;
    this.graph.sample(lane, s, this.transforms, i * 3);
  }

  private chooseNext(lane: number): number {
    const g = this.graph;
    const st = g.succStart[lane], n = g.succCount[lane];
    if (n === 1) return g.succ[st];
    let wsum = 0;
    for (let k = 0; k < n; k++) wsum += turnWeight(g.turn[g.succ[st + k]]);
    let x = this.rng.next() * wsum;
    for (let k = 0; k < n; k++) {
      x -= turnWeight(g.turn[g.succ[st + k]]);
      if (x <= 0) return g.succ[st + k];
    }
    return g.succ[st + n - 1];
  }

  /** Counting sort of cars into lane buckets, ascending s inside each bucket; also rebuilds the grid. */
  private buildIndex(): void {
    const n = this.count, cnt = this.laneCnt, start = this.laneStart, ord = this.order;
    cnt.fill(0);
    for (let i = 0; i < n; i++) cnt[this.lane[i]]++;
    let acc = 0;
    for (let l = 0; l < cnt.length; l++) { start[l] = acc; acc += cnt[l]; cnt[l] = 0; }
    for (let i = 0; i < n; i++) { const l = this.lane[i]; ord[start[l] + cnt[l]++] = i; }
    for (let l = 0; l < cnt.length; l++) {
      const c = cnt[l];
      if (c < 2) continue;
      const a = start[l];
      for (let p = a + 1; p < a + c; p++) {
        const car = ord[p], sv = this.s[car];
        let q = p - 1;
        while (q >= a && this.s[ord[q]] > sv) { ord[q + 1] = ord[q]; q--; }
        ord[q + 1] = car;
      }
    }
    for (let p = 0; p < n; p++) this.rank[ord[p]] = p;
    // grid
    this.cellHead.fill(-1);
    const tf = this.transforms;
    for (let i = 0; i < n; i++) {
      const c = this.cellOf(tf[i * 3], tf[i * 3 + 1]);
      this.cellNext[i] = this.cellHead[c];
      this.cellHead[c] = i;
    }
  }

  private cellOf(x: number, z: number): number {
    let cx = Math.floor((x - this.gx0) / CELL), cz = Math.floor((z - this.gz0) / CELL);
    cx = cx < 0 ? 0 : cx >= this.gw ? this.gw - 1 : cx;
    cz = cz < 0 ? 0 : cz >= this.gh ? this.gh - 1 : cz;
    return cz * this.gw + cx;
  }

  /** Rear-bumper position of the last car on a lane (lane length if empty). */
  private rearRoom(lane: number): number {
    if (this.laneCnt[lane] === 0) return this.graph.len[lane];
    const c = this.order[this.laneStart[lane]];
    return this.s[c] - this.length[c] / 2;
  }

  /** May a car enter connector `conn` now? Checks claims and room at the start of its exit lane. */
  private exitClear(conn: number, len: number): boolean {
    const out = this.graph.connOut[conn];
    if (this.claimCnt[out] > 0 && this.claimConn[out] !== conn) return false;
    return this.rearRoom(out) - this.claimCnt[out] * 7 > len + IDM_S0 + 1;
  }

  /**
   * Advance the simulation. `t` is the signal clock (s); focus is the LOD centre (normally the player
   * or camera); `player` (may be null) is treated as an obstacle when standing in a lane.
   */
  update(dt: number, t: number, focusX: number, focusZ: number, player: PlayerProbe | null): void {
    const g = this.graph, n = this.count;
    this.tick++;
    this.buildIndex();
    const pOn = player !== null && player.y < 2.5;
    let active = 0;

    // ---- phase 1: decide speed and a safe advance per car (from start-of-tick positions) ----
    for (let i = 0; i < n; i++) {
      this.acc[i] += dt;
      this.upd[i] = 0;
      const tf = i * 3;
      const dxf = this.transforms[tf] - focusX, dzf = this.transforms[tf + 1] - focusZ;
      const d2 = dxf * dxf + dzf * dzf;
      const lod = d2 < this.nearR2 ? 0 : d2 < this.midR2 ? 1 : 2;
      this.lod[i] = lod;
      if (lod === 0) active++;
      const period = lod === 0 ? 1 : lod === 1 ? 4 : 16;
      if ((this.tick + i) % period !== 0) continue;
      const h = this.acc[i];
      this.acc[i] = 0;
      this.upd[i] = 1;
      this.honkCd[i] -= h;

      const ln = this.lane[i], s = this.s[i], v = this.v[i], len = this.length[i];
      const isRoad = g.kind[ln] === LANE_ROAD;
      let vDes = this.v0[i];
      let gap = 1e9, vLead = 0;

      // leader on the same lane, else along the path ahead
      const p = this.rank[i];
      if (p + 1 < this.laneStart[ln] + this.laneCnt[ln]) {
        const l = this.order[p + 1];
        gap = this.s[l] - s - (this.length[l] + len) / 2;
        vLead = this.v[l];
      } else {
        let dist = g.len[ln] - s;
        let nl = isRoad ? this.next[i] : g.succ[g.succStart[ln]];
        for (let k = 0; k < 2 && dist < LOOKAHEAD; k++) {
          if (this.laneCnt[nl] > 0) {
            const l = this.order[this.laneStart[nl]];
            gap = dist + this.s[l] - (this.length[l] + len) / 2;
            vLead = this.v[l];
            break;
          }
          dist += g.len[nl];
          if (g.kind[nl] !== LANE_ROAD) nl = g.succ[g.succStart[nl]];
          else break;
        }
        // stop line
        if (isRoad) {
          const dStop = g.len[ln] - s - len / 2 - STOP_MARGIN;
          const sig = g.signalCode(ln, t);
          const clear = this.exitClear(this.next[i], len);
          if (sig === SIG_GREEN) this.go[i] = clear || (this.go[i] === 1 && dStop < (v * v) / (2 * 4)) ? 1 : 0;
          else if (sig === SIG_AMBER) this.go[i] = this.go[i] === 1 && dStop < (v * v) / (2 * 3.5) ? 1 : 0;
          else this.go[i] = this.go[i] === 1 && dStop < (v * v) / (2 * MAX_DECEL) + 0.3 ? 1 : 0;
          if (this.go[i] === 0 && dStop < gap) { gap = dStop; vLead = 0; }
        }
      }
      // slow for turns
      if (isRoad) {
        const nt = g.turn[this.next[i]];
        if (nt !== TURN_STRAIGHT) {
          const dEnd = Math.max(0, g.len[ln] - s);
          vDes = Math.min(vDes, Math.sqrt(TURN_SPEED * TURN_SPEED + 2 * 1.5 * dEnd));
        }
      } else if (g.turn[ln] !== TURN_STRAIGHT) vDes = Math.min(vDes, TURN_SPEED);

      // the player standing in the lane ahead is an obstacle
      this.yielding[i] = 0;
      if (pOn) {
        const yaw = this.transforms[tf + 2], sy = Math.sin(yaw), cy = Math.cos(yaw);
        for (let k = 0; k < 2; k++) {
          const px = player!.x + (k === 1 ? player!.vx * 0.4 : 0), pz = player!.z + (k === 1 ? player!.vz * 0.4 : 0);
          const dx = px - this.transforms[tf], dz = pz - this.transforms[tf + 1];
          const fwd = dx * sy + dz * cy, lat = dx * cy - dz * sy;
          if (fwd > 0 && fwd < 15 + len / 2 && lat < 2.4 && lat > -2.4) {
            const pg = fwd - len / 2 - 1.2;
            if (pg < gap) { gap = pg; vLead = 0; }
            this.yielding[i] = 1;
          }
        }
        if (this.yielding[i] === 1 && this.honkCd[i] <= 0) {
          this.honkCd[i] = 4 + this.rng.next() * 5;
          if (this.honkN < this.honkBuf.length) {
            this.honkBuf[this.honkN++] = this.transforms[tf];
            this.honkBuf[this.honkN++] = this.transforms[tf + 1];
          }
        }
      }

      // speed update
      let vn: number;
      if (lod === 0) {
        const free = vDes > 0.1 ? 1 - Math.pow(v / vDes, 4) : -1;
        let a = IDM_A * free;
        if (gap < 1e8) {
          const gs = gap > 0.1 ? gap : 0.1;
          const sStar = IDM_S0 + Math.max(0, v * IDM_T + (v * (v - vLead)) / (2 * Math.sqrt(IDM_A * IDM_B)));
          a -= IDM_A * (sStar / gs) * (sStar / gs);
        }
        if (a < -MAX_DECEL) a = -MAX_DECEL;
        vn = v + a * h;
      } else {
        // simplified: cruise at desired speed, stop short of obstacles
        vn = Math.min(vDes, Math.max(0, (gap - IDM_S0) / 1.2));
      }
      if (vn < 0) vn = 0;
      let adv = vn * h;
      const maxAdv = gap - MIN_GAP;
      if (adv > maxAdv) adv = maxAdv > 0 ? maxAdv : 0;
      if (h > 0 && vn * h > adv) vn = adv / h;
      this.vNew[i] = vn;
      this.adv[i] = adv;
    }
    this.activeCount = active;

    // ---- phase 2: integrate, cross lane boundaries ----
    for (let i = 0; i < n; i++) {
      if (!this.upd[i]) continue;
      this.v[i] = this.vNew[i];
      let s = this.s[i] + this.adv[i];
      let ln = this.lane[i];
      for (let guard = 0; guard < 4 && s > g.len[ln]; guard++) {
        if (g.kind[ln] === LANE_ROAD) {
          const c = this.next[i];
          const out = g.connOut[c];
          if (!this.go[i] || (this.claimCnt[out] > 0 && this.claimConn[out] !== c)) { s = g.len[ln]; this.v[i] = 0; break; }
          this.claimConn[out] = c;
          this.claimCnt[out]++;
          s -= g.len[ln];
          ln = c;
          this.next[i] = -1;
        } else {
          const out = g.connOut[ln];
          if (--this.claimCnt[out] <= 0) { this.claimCnt[out] = 0; this.claimConn[out] = -1; }
          s -= g.len[ln];
          ln = out;
          this.next[i] = this.chooseNext(out);
          this.go[i] = 0;
        }
      }
      this.s[i] = s;
      this.lane[i] = ln;
      g.sample(ln, s, this.transforms, i * 3);
    }
  }

  /** Writes up to out.length car ids within r of (x,z) into out; returns the count. */
  queryNear(x: number, z: number, r: number, out: Int32Array): number {
    let k = 0;
    const r2 = r * r, tf = this.transforms;
    const cx0 = Math.max(0, Math.floor((x - r - this.gx0) / CELL)), cx1 = Math.min(this.gw - 1, Math.floor((x + r - this.gx0) / CELL));
    const cz0 = Math.max(0, Math.floor((z - r - this.gz0) / CELL)), cz1 = Math.min(this.gh - 1, Math.floor((z + r - this.gz0) / CELL));
    for (let cz = cz0; cz <= cz1; cz++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        for (let i = this.cellHead[cz * this.gw + cx]; i >= 0; i = this.cellNext[i]) {
          const dx = tf[i * 3] - x, dz = tf[i * 3 + 1] - z;
          if (dx * dx + dz * dz <= r2 && k < out.length) out[k++] = i;
        }
      }
    }
    return k;
  }

  /** 0..1 traffic density around a point (distance-weighted car count within 60 m, grid positions of the last tick). */
  densityNear(x: number, z: number): number {
    const R = 60, tf = this.transforms;
    let w = 0;
    const cx0 = Math.max(0, Math.floor((x - R - this.gx0) / CELL)), cx1 = Math.min(this.gw - 1, Math.floor((x + R - this.gx0) / CELL));
    const cz0 = Math.max(0, Math.floor((z - R - this.gz0) / CELL)), cz1 = Math.min(this.gh - 1, Math.floor((z + R - this.gz0) / CELL));
    for (let cz = cz0; cz <= cz1; cz++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        for (let i = this.cellHead[cz * this.gw + cx]; i >= 0; i = this.cellNext[i]) {
          const d = Math.hypot(tf[i * 3] - x, tf[i * 3 + 1] - z);
          if (d < R) w += (1 - d / R) * (0.4 + 0.6 * Math.min(1, this.v[i] / 8));
        }
      }
    }
    return Math.min(1, w / 5);
  }

  /** Honk positions since the last drain as [x0,z0,x1,z1,...] in `out`; returns the number of honks. */
  drainHonks(out: Float32Array): number {
    const n = Math.min(this.honkN, out.length) >> 1;
    for (let k = 0; k < n * 2; k++) out[k] = this.honkBuf[k];
    this.honkN = 0;
    return n;
  }

  /** Number of cars currently on connector lanes feeding each lane (debug/tests). */
  claimsOn(lane: number): number {
    return this.claimCnt[lane];
  }
}

function turnWeight(turn: number): number {
  return turn === TURN_STRAIGHT ? 0.6 : turn === TURN_LEFT ? 0.18 : turn === TURN_RIGHT ? 0.22 : 0.05;
}
