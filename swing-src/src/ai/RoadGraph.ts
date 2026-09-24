import type { CityLayout } from '../city/CityGenerator';

/** Signal aspect as seen from a lane's stop line. */
export type SignalState = 'green' | 'amber' | 'red';

/** Numeric aspects for hot paths. */
export const SIG_GREEN = 0, SIG_AMBER = 1, SIG_RED = 2;
/** Lane kinds. Road lanes are block-length segments; connectors are the paths through an intersection box. */
export const LANE_ROAD = 0, LANE_CONN = 1;
/** Road axis: NS = avenue (travel along Z), EW = street (travel along X). */
export const AXIS_NS = 0, AXIS_EW = 1;
/** Connector movements. */
export const TURN_STRAIGHT = 0, TURN_LEFT = 1, TURN_RIGHT = 2, TURN_UTURN = 3;

// Compass directions: 0 = N (-Z), 1 = E (+X), 2 = S (+Z), 3 = W (-X). Right of d is d+1.
const DX = [0, 1, 0, -1];
const DZ = [-1, 0, 1, 0];

/** Signal cycle, seconds. Avenues (NS) get the longer green. */
export interface SignalTiming {
  nsGreen: number;
  ewGreen: number;
  amber: number;
  allRed: number;
  /** progression speed of the green wave along avenues (m/s) */
  waveSpeed: number;
}

export const defaultSignalTiming: SignalTiming = { nsGreen: 22, ewGreen: 16, amber: 3, allRed: 2, waveSpeed: 11 };

/**
 * Directed lane graph for right-hand traffic built from a CityLayout, plus the fixed-time signal
 * controller of every intersection. All data lives in typed arrays indexed by lane / node id.
 * Every lane's geometry is a quadratic Bézier P0→P1→P2 (straight road lanes use the midpoint as P1).
 */
export class RoadGraph {
  readonly nx: number;
  readonly nz: number;
  readonly nodeCount: number;
  readonly nodeX: Float64Array;
  readonly nodeZ: Float64Array;
  /** per-node phase offset (s), a south-bound green wave with a slight east-west skew */
  readonly nodeOffset: Float64Array;
  readonly timing: SignalTiming;
  readonly cycle: number;
  readonly laneWidth: number;

  laneCount = 0;
  /** lanes [0, roadLaneCount) are road lanes, the rest are connectors */
  roadLaneCount = 0;
  p0x!: Float64Array; p0z!: Float64Array;
  p1x!: Float64Array; p1z!: Float64Array;
  p2x!: Float64Array; p2z!: Float64Array;
  len!: Float64Array;
  kind!: Uint8Array;
  axis!: Uint8Array;
  /** road lane: node at its end (stop line); connector: node it crosses */
  node!: Int32Array;
  /** travel direction 0..3 (road lanes; connectors store their entry direction) */
  dir!: Uint8Array;
  /** lane number within its direction, 0 = innermost */
  laneNo!: Uint8Array;
  turn!: Uint8Array;
  /** connector: incoming and outgoing road lane */
  connIn!: Int32Array;
  connOut!: Int32Array;
  succStart!: Int32Array;
  succCount!: Int32Array;
  succ!: Int32Array;

  constructor(readonly city: CityLayout, timing: Partial<SignalTiming> = {}) {
    const p = city.params;
    this.timing = { ...defaultSignalTiming, ...timing };
    const T = this.timing;
    this.cycle = T.nsGreen + T.ewGreen + 2 * (T.amber + T.allRed);
    this.nx = city.avenueX.length;
    this.nz = city.streetZ.length;
    this.nodeCount = this.nx * this.nz;
    this.nodeX = new Float64Array(this.nodeCount);
    this.nodeZ = new Float64Array(this.nodeCount);
    this.nodeOffset = new Float64Array(this.nodeCount);
    const { x0, z0 } = city.bounds;
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.nz; j++) {
        const n = i * this.nz + j;
        this.nodeX[n] = city.avenueX[i];
        this.nodeZ[n] = city.streetZ[j];
        const off = -(city.streetZ[j] - z0) / T.waveSpeed - (city.avenueX[i] - x0) / (T.waveSpeed * 3);
        this.nodeOffset[n] = ((off % this.cycle) + this.cycle) % this.cycle;
      }
    }
    const median = 0.6;
    this.laneWidth = Math.min(3.4, (p.streetWidth / 2 - median) / 1, (p.avenueWidth / 2 - median) / 2);

    // ---- road lanes -----------------------------------------------------------------------
    type L = { ax: number; az: number; bx: number; bz: number; px: number; pz: number; qx: number; qz: number; kind: number; axis: number; node: number; dir: number; no: number; turn: number; cin: number; cout: number; succ: number[] };
    const lanes: L[] = [];
    const roadId = new Int32Array(this.nodeCount * 4 * 2).fill(-1); // (node*4 + dir)*2 + k, node = start node
    const lanesPerDir = (d: number) => (d === 0 || d === 2 ? 2 : 1);
    const halfBox = (d: number) => (d === 0 || d === 2 ? p.streetWidth / 2 : p.avenueWidth / 2);
    const neighbour = (n: number, d: number) => {
      const i = Math.floor(n / this.nz) + DX[d], j = (n % this.nz) + DZ[d];
      return i < 0 || j < 0 || i >= this.nx || j >= this.nz ? -1 : i * this.nz + j;
    };
    for (let a = 0; a < this.nodeCount; a++) {
      for (let d = 0; d < 4; d++) {
        const b = neighbour(a, d);
        if (b < 0) continue;
        const hb = halfBox(d), rx = -DZ[d], rz = DX[d];
        for (let k = 0; k < lanesPerDir(d); k++) {
          const o = median + (k + 0.5) * this.laneWidth;
          const ax = this.nodeX[a] + DX[d] * hb + rx * o, az = this.nodeZ[a] + DZ[d] * hb + rz * o;
          const bx = this.nodeX[b] - DX[d] * hb + rx * o, bz = this.nodeZ[b] - DZ[d] * hb + rz * o;
          roadId[(a * 4 + d) * 2 + k] = lanes.length;
          lanes.push({ ax, az, bx, bz, px: (ax + bx) / 2, pz: (az + bz) / 2, qx: 0, qz: 0, kind: LANE_ROAD, axis: d === 0 || d === 2 ? AXIS_NS : AXIS_EW, node: b, dir: d, no: k, turn: 0, cin: -1, cout: -1, succ: [] });
        }
      }
    }
    this.roadLaneCount = lanes.length;

    // ---- connectors -----------------------------------------------------------------------
    for (let li = 0; li < this.roadLaneCount; li++) {
      const lane = lanes[li];
      const b = lane.node, d = lane.dir, k = lane.no, n = lanesPerDir(d);
      const straightOk = neighbour(b, d) >= 0;
      const add = (e: number, turn: number, kOut: number) => {
        const out = roadId[(b * 4 + e) * 2 + kOut];
        if (out < 0) return;
        const o = lanes[out];
        let px: number, pz: number;
        if (turn === TURN_STRAIGHT) { px = (lane.bx + o.ax) / 2; pz = (lane.bz + o.az) / 2; }
        else if (turn === TURN_UTURN) { px = (lane.bx + o.ax) / 2 + DX[d] * halfBox(d); pz = (lane.bz + o.az) / 2 + DZ[d] * halfBox(d); }
        else if (DX[d] === 0) { px = lane.bx; pz = o.az; }
        else { px = o.ax; pz = lane.bz; }
        lane.succ.push(lanes.length);
        lanes.push({ ax: lane.bx, az: lane.bz, bx: o.ax, bz: o.az, px, pz, qx: 0, qz: 0, kind: LANE_CONN, axis: lane.axis, node: b, dir: d, no: kOut, turn, cin: li, cout: out, succ: [out] });
      };
      if (straightOk) add(d, TURN_STRAIGHT, k);
      if (k === n - 1 || !straightOk) add((d + 1) & 3, TURN_RIGHT, lanesPerDir((d + 1) & 3) - 1);
      if (k === 0 || !straightOk) add((d + 3) & 3, TURN_LEFT, 0);
      if (lane.succ.length === 0) add((d + 2) & 3, TURN_UTURN, 0);
    }

    // ---- pack -----------------------------------------------------------------------------
    const N = (this.laneCount = lanes.length);
    this.p0x = new Float64Array(N); this.p0z = new Float64Array(N);
    this.p1x = new Float64Array(N); this.p1z = new Float64Array(N);
    this.p2x = new Float64Array(N); this.p2z = new Float64Array(N);
    this.len = new Float64Array(N);
    this.kind = new Uint8Array(N); this.axis = new Uint8Array(N); this.dir = new Uint8Array(N);
    this.laneNo = new Uint8Array(N); this.turn = new Uint8Array(N);
    this.node = new Int32Array(N); this.connIn = new Int32Array(N); this.connOut = new Int32Array(N);
    this.succStart = new Int32Array(N); this.succCount = new Int32Array(N);
    let ns = 0;
    for (const l of lanes) ns += l.succ.length;
    this.succ = new Int32Array(ns);
    ns = 0;
    for (let i = 0; i < N; i++) {
      const l = lanes[i];
      this.p0x[i] = l.ax; this.p0z[i] = l.az; this.p1x[i] = l.px; this.p1z[i] = l.pz; this.p2x[i] = l.bx; this.p2z[i] = l.bz;
      this.kind[i] = l.kind; this.axis[i] = l.axis; this.dir[i] = l.dir; this.laneNo[i] = l.no; this.turn[i] = l.turn;
      this.node[i] = l.node; this.connIn[i] = l.cin; this.connOut[i] = l.cout;
      this.succStart[i] = ns; this.succCount[i] = l.succ.length;
      for (const s of l.succ) this.succ[ns++] = s;
      // arc length by sampling (exact for straight lanes)
      let len = 0, lx = l.ax, lz = l.az;
      const steps = l.kind === LANE_ROAD ? 1 : 12;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, u = 1 - t;
        const x = u * u * l.ax + 2 * u * t * l.px + t * t * l.bx, z = u * u * l.az + 2 * u * t * l.pz + t * t * l.bz;
        len += Math.hypot(x - lx, z - lz);
        lx = x; lz = z;
      }
      this.len[i] = len;
    }
  }

  /** Aspect (SIG_*) shown to traffic on `axis` at `node` at time t. NS and EW are never both non-red. */
  phase(node: number, axis: number, t: number): number {
    const T = this.timing;
    let tt = (t + this.nodeOffset[node]) % this.cycle;
    if (tt < 0) tt += this.cycle;
    if (axis === AXIS_EW) tt -= T.nsGreen + T.amber + T.allRed;
    const g = axis === AXIS_NS ? T.nsGreen : T.ewGreen;
    return tt < 0 ? SIG_RED : tt < g ? SIG_GREEN : tt < g + T.amber ? SIG_AMBER : SIG_RED;
  }

  /** Seconds of green left for `axis` at `node` (0 when not green). */
  greenRemaining(node: number, axis: number, t: number): number {
    const T = this.timing;
    let tt = (t + this.nodeOffset[node]) % this.cycle;
    if (tt < 0) tt += this.cycle;
    if (axis === AXIS_EW) tt -= T.nsGreen + T.amber + T.allRed;
    const g = axis === AXIS_NS ? T.nsGreen : T.ewGreen;
    return tt >= 0 && tt < g ? g - tt : 0;
  }

  /** Numeric aspect at a lane's stop line; connectors (already inside the box) are always green. */
  signalCode(lane: number, t: number): number {
    return this.kind[lane] === LANE_CONN ? SIG_GREEN : this.phase(this.node[lane], this.axis[lane], t);
  }

  signalStateFor(lane: number, t: number): SignalState {
    const s = this.signalCode(lane, t);
    return s === SIG_GREEN ? 'green' : s === SIG_AMBER ? 'amber' : 'red';
  }

  /** Writes x, z, yaw at arc distance s along a lane into out[off..off+2]. yaw = atan2(dx, dz) (model faces +Z). */
  sample(lane: number, s: number, out: Float32Array, off: number): void {
    let t = s / this.len[lane];
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const u = 1 - t;
    const ax = this.p0x[lane], az = this.p0z[lane], bx = this.p1x[lane], bz = this.p1z[lane], cx = this.p2x[lane], cz = this.p2z[lane];
    out[off] = u * u * ax + 2 * u * t * bx + t * t * cx;
    out[off + 1] = u * u * az + 2 * u * t * bz + t * t * cz;
    const dx = u * (bx - ax) + t * (cx - bx), dz = u * (bz - az) + t * (cz - bz);
    out[off + 2] = Math.atan2(dx, dz);
  }

  /** Road lane id leaving node `n` in direction d (0 N,1 E,2 S,3 W), lane k; -1 if none. */
  roadLane(n: number, d: number, k: number): number {
    for (let i = 0; i < this.roadLaneCount; i++) {
      if (this.dir[i] === d && this.laneNo[i] === k && this.nodeOfStart(i) === n) return i;
    }
    return -1;
  }

  private nodeOfStart(lane: number): number {
    const d = this.dir[lane];
    const i = Math.floor(this.node[lane] / this.nz) - DX[d], j = (this.node[lane] % this.nz) - DZ[d];
    return i * this.nz + j;
  }
}
