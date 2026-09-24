import { describe, it, expect } from 'vitest';
import { generateCity } from '../src/city/CityGenerator';
import { RoadGraph, LANE_ROAD, LANE_CONN, AXIS_NS, AXIS_EW, SIG_RED, TURN_STRAIGHT } from '../src/ai/RoadGraph';
import { TrafficSim } from '../src/ai/TrafficSim';
import { PedestrianSim, PED_FLEE } from '../src/ai/PedestrianSim';
import { AISystem } from '../src/ai/AISystem';
import { Scene, PerspectiveCamera, Vector3 } from 'three';

const city = generateCity();
const graph = new RoadGraph(city);
const DT = 1 / 30;

/** A road lane heading south on an interior avenue, and its straight successor connector. */
function southLane(): number {
  for (let l = 0; l < graph.roadLaneCount; l++) {
    if (graph.dir[l] !== 2 || graph.laneNo[l] !== 0) continue;
    const st = graph.succStart[l];
    for (let k = 0; k < graph.succCount[l]; k++) if (graph.turn[graph.succ[st + k]] === TURN_STRAIGHT) return l;
  }
  throw new Error('no lane');
}

describe('road graph', () => {
  it('connects every lane to at least one successor and keeps connectors consistent', () => {
    expect(graph.roadLaneCount).toBeGreaterThan(300);
    for (let l = 0; l < graph.laneCount; l++) {
      expect(graph.succCount[l]).toBeGreaterThan(0);
      expect(graph.len[l]).toBeGreaterThan(1);
      for (let k = 0; k < graph.succCount[l]; k++) {
        const s = graph.succ[graph.succStart[l] + k];
        expect(graph.kind[s]).toBe(graph.kind[l] === LANE_ROAD ? LANE_CONN : LANE_ROAD);
        // successor starts where this lane ends
        expect(Math.hypot(graph.p0x[s] - graph.p2x[l], graph.p0z[s] - graph.p2z[l])).toBeLessThan(1e-6);
      }
    }
  });

  it('drives on the right', () => {
    for (let l = 0; l < graph.roadLaneCount; l++) {
      const dx = graph.p2x[l] - graph.p0x[l], dz = graph.p2z[l] - graph.p0z[l];
      // right vector (-dz, dx); node centre must be on the left
      const n = graph.node[l];
      const side = (graph.nodeX[n] - graph.p2x[l]) * -dz + (graph.nodeZ[n] - graph.p2z[l]) * dx;
      expect(side).toBeLessThan(0);
    }
  });

  it('never shows conflicting greens at an intersection', () => {
    let nsG = 0, ewG = 0;
    for (let n = 0; n < graph.nodeCount; n++) {
      for (let t = 0; t < graph.cycle * 2; t += 0.25) {
        const a = graph.phase(n, AXIS_NS, t), b = graph.phase(n, AXIS_EW, t);
        expect(a === SIG_RED || b === SIG_RED).toBe(true);
        if (a === 0) nsG++;
        if (b === 0) ewG++;
      }
    }
    expect(nsG).toBeGreaterThan(0);
    expect(ewG).toBeGreaterThan(0);
    const l = southLane();
    expect(['green', 'amber', 'red']).toContain(graph.signalStateFor(l, 3));
  });
});

describe('traffic', () => {
  it('IDM: approaching a stopped leader stops without overlap and never reverses', () => {
    const sim = new TrafficSim(graph, { cars: 2, seed: 1 });
    const l = southLane();
    sim.setCar(0, l, 3, 14);
    sim.setCar(1, l, 45, 0);
    sim.v0[1] = 0; // leader wants to stand still
    let prev = sim.s[0];
    for (let k = 0; k < 30 * 12; k++) {
      sim.update(DT, 0, graph.p0x[l], graph.p0z[l], null);
      expect(sim.lane[0]).toBe(l);
      expect(sim.s[0]).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = sim.s[0];
      const gap = sim.s[1] - sim.s[0] - (sim.length[0] + sim.length[1]) / 2;
      expect(gap).toBeGreaterThan(0);
    }
    expect(sim.v[0]).toBeLessThan(0.05);
    const gap = sim.s[1] - sim.s[0] - (sim.length[0] + sim.length[1]) / 2;
    expect(gap).toBeLessThan(6);
  });

  it('stops at a red light before the stop line', () => {
    const l = southLane();
    const n = graph.node[l];
    // find a time with a long red ahead
    let t0 = 0;
    while (!(graph.phase(n, AXIS_NS, t0) === SIG_RED && graph.phase(n, AXIS_NS, t0 + 12) === SIG_RED)) t0 += 0.5;
    const sim = new TrafficSim(graph, { cars: 1, seed: 2 });
    sim.setCar(0, l, 12, 13);
    let t = t0;
    for (let k = 0; k < 30 * 11; k++) { t += DT; sim.update(DT, t, graph.p0x[l], graph.p0z[l], null); }
    expect(sim.lane[0]).toBe(l);
    expect(sim.s[0] + sim.length[0] / 2).toBeLessThanOrEqual(graph.len[l]);
    expect(sim.s[0]).toBeGreaterThan(graph.len[l] - 12);
    expect(sim.v[0]).toBeLessThan(0.1);
  });

  it('brakes and honks for the player standing in the lane', () => {
    const l = southLane();
    const sim = new TrafficSim(graph, { cars: 1, seed: 3 });
    sim.setCar(0, l, 5, 12);
    const out = new Float32Array(8);
    const x = graph.p0x[l], z0 = graph.p0z[l];
    const player = { x, y: 0.9, z: z0 + 35, vx: 0, vy: 0, vz: 0 };
    let honks = 0;
    for (let k = 0; k < 30 * 8; k++) {
      sim.update(DT, 0, x, z0, player);
      honks += sim.drainHonks(out);
    }
    expect(sim.s[0] + sim.length[0] / 2).toBeLessThan(35);
    expect(sim.v[0]).toBeLessThan(0.1);
    expect(honks).toBeGreaterThan(0);
  });

  it('runs 60 s at 30 Hz with no NaNs and no overlaps in any lane', () => {
    const sim = new TrafficSim(graph, { cars: 220, seed: 7 });
    let t = 0, moved = 0;
    const start = Array.from(sim.transforms);
    for (let k = 0; k < 60 * 30; k++) {
      t += DT;
      // move the focus around so every LOD band is exercised
      const fx = Math.cos(t * 0.05) * 300, fz = Math.sin(t * 0.05) * 250;
      sim.update(DT, t, fx, fz, null);
      if (k % 30 === 0 || k === 60 * 30 - 1) {
        for (let i = 0; i < sim.count; i++) {
          expect(Number.isFinite(sim.s[i]) && Number.isFinite(sim.v[i])).toBe(true);
          expect(sim.v[i]).toBeGreaterThanOrEqual(0);
          for (let j = i + 1; j < sim.count; j++) {
            if (sim.lane[j] !== sim.lane[i]) continue;
            const gap = Math.abs(sim.s[j] - sim.s[i]) - (sim.length[i] + sim.length[j]) / 2;
            expect(gap).toBeGreaterThan(0);
          }
        }
      }
    }
    for (let k = 0; k < sim.transforms.length; k++) expect(Number.isFinite(sim.transforms[k])).toBe(true);
    for (let i = 0; i < sim.count; i++) moved += Math.hypot(sim.transforms[i * 3] - start[i * 3], sim.transforms[i * 3 + 1] - start[i * 3 + 1]);
    expect(moved / sim.count).toBeGreaterThan(30); // traffic actually flows
    expect(sim.densityNear(0, 0)).toBeGreaterThanOrEqual(0);
    expect(sim.queryNear(0, 0, 200, new Int32Array(64))).toBeGreaterThan(0);
  });
});

describe('pedestrians', () => {
  it('stay on sidewalks (or crosswalks) for 60 s', () => {
    const sim = new PedestrianSim(city, graph, { pedestrians: 600, seed: 5 });
    const sw = city.params.sidewalkWidth;
    let t = 0;
    for (let k = 0; k < 60 * 30; k++) { t += DT; sim.update(DT, t, 0, 0, null); }
    let crossing = 0;
    for (let i = 0; i < sim.count; i++) {
      const x = sim.x[i], z = sim.z[i];
      expect(Number.isFinite(x) && Number.isFinite(z)).toBe(true);
      if (sim.crossing[i]) { crossing++; continue; }
      const b = city.blocks[sim.block[i]];
      expect(x).toBeGreaterThanOrEqual(b.x0);
      expect(x).toBeLessThanOrEqual(b.x1);
      expect(z).toBeGreaterThanOrEqual(b.z0);
      expect(z).toBeLessThanOrEqual(b.z1);
      const inLot = x > b.x0 + sw && x < b.x1 - sw && z > b.z0 + sw && z < b.z1 - sw;
      expect(inLot).toBe(false);
    }
    expect(crossing).toBeLessThan(sim.count * 0.2);
  });

  it('startle and flee after a nearby impact', () => {
    const sim = new PedestrianSim(city, graph, { pedestrians: 600, seed: 9 });
    sim.update(DT, 0, 0, 0, null);
    const i = 17;
    const ix = sim.x[i] + 3, iz = sim.z[i];
    const d0 = Math.hypot(sim.x[i] - ix, sim.z[i] - iz);
    sim.notifyImpact(ix, iz, 1);
    expect(sim.state[i]).toBe(PED_FLEE);
    const player = { x: ix, y: 0, z: iz, vx: 0, vy: 0, vz: 0 };
    for (let k = 0; k < 30; k++) sim.update(DT, k * DT, ix, iz, player);
    expect(Math.hypot(sim.x[i] - ix, sim.z[i] - iz)).toBeGreaterThan(d0 + 1.5);
    // eventually they stop and look toward the impact
    for (let k = 0; k < 30 * 5; k++) sim.update(DT, 1 + k * DT, ix, iz, player);
    expect(sim.state[i]).not.toBe(PED_FLEE);
  });
});

describe('ai performance', () => {
  it('220 cars + 600 pedestrians tick in < 2 ms on average', () => {
    const traffic = new TrafficSim(graph, { cars: 220, seed: 11 });
    const peds = new PedestrianSim(city, graph, { pedestrians: 600, seed: 11 });
    const player = { x: 0, y: 30, z: 0, vx: 20, vy: 0, vz: 0 };
    let t = 0;
    for (let k = 0; k < 120; k++) { t += DT; traffic.update(DT, t, 0, 0, player); peds.update(DT, t, 0, 0, player); }
    const N = 600;
    const t0 = performance.now();
    for (let k = 0; k < N; k++) {
      t += DT;
      player.x = Math.sin(t * 0.1) * 200;
      traffic.update(DT, t, player.x, 0, player);
      peds.update(DT, t, player.x, 0, player);
    }
    const avg = (performance.now() - t0) / N;
    process.stderr.write(`\nai tick avg ${avg.toFixed(3)} ms (cars active ${traffic.activeCount}, peds active ${peds.activeCount})\n`);
    expect(avg).toBeLessThan(2);
  });
});

describe('AISystem', () => {
  it('builds instanced meshes and renders only visible, nearby instances', () => {
    const scene = new Scene();
    const ai = new AISystem(city, scene, { seed: 3 });
    const cam = new PerspectiveCamera(60, 16 / 9, 0.5, 3000);
    cam.position.set(0, 40, 60);
    cam.lookAt(0, 0, 0);
    const player = { pos: new Vector3(0, 0.9, 0), vel: new Vector3() };
    for (let k = 0; k < 60; k++) ai.update(DT, player, cam);
    ai.notifyImpact(0, 0, 1);
    const st = ai.stats();
    expect(st.cars).toBe(220);
    expect(st.peds).toBe(600);
    expect(st.carsRendered).toBeGreaterThan(0);
    expect(st.carsRendered).toBeLessThan(220);
    expect(st.pedsRendered).toBeGreaterThan(0);
    expect(st.pedsRendered).toBeLessThan(600);
    expect(st.simMs).toBeGreaterThanOrEqual(0);
    const d = ai.densityNear(0, 0);
    expect(d.traffic).toBeGreaterThanOrEqual(0);
    expect(d.crowd).toBeLessThanOrEqual(1);
    expect(Array.isArray(ai.drainHonks())).toBe(true);
    ai.setEnabled(false, false);
    ai.update(DT, player, cam);
    expect(ai.stats().carsRendered).toBe(0);
    ai.dispose();
    expect(scene.children.length).toBe(0);
  });
});
