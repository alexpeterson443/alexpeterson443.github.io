import type * as THREE from 'three';
import type { CityLayout } from '../city/CityGenerator';
import { RoadGraph } from './RoadGraph';
import { TrafficSim, type PlayerProbe } from './TrafficSim';
import { PedestrianSim } from './PedestrianSim';
import { AIRenderer, type AIRenderOptions } from './AIRenderer';

export interface AISystemOptions extends AIRenderOptions {
  cars?: number;
  pedestrians?: number;
  seed?: number;
}

/**
 * City life: owns the lane graph + signals, the traffic and pedestrian sims (pure) and their
 * instanced renderer. Call `update` once per rendered frame after the player step.
 */
export class AISystem {
  readonly graph: RoadGraph;
  readonly traffic: TrafficSim;
  readonly peds: PedestrianSim;
  readonly renderer: AIRenderer;
  /** signal clock (s) */
  time = 0;
  private carsOn = true;
  private pedsOn = true;
  private simMs = 0;
  private readonly probe: PlayerProbe = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 };
  private readonly honkTmp = new Float32Array(64);

  constructor(city: CityLayout, scene: THREE.Scene, opts: AISystemOptions = {}) {
    const seed = opts.seed ?? city.params.seed;
    this.graph = new RoadGraph(city);
    this.traffic = new TrafficSim(this.graph, { cars: opts.cars ?? 220, seed });
    this.peds = new PedestrianSim(city, this.graph, { pedestrians: opts.pedestrians ?? 600, seed });
    this.renderer = new AIRenderer(this.traffic, this.peds, opts);
    scene.add(this.renderer.group);
  }

  update(dt: number, player: { pos: THREE.Vector3; vel: THREE.Vector3 }, camera: THREE.Camera): void {
    const h = Math.min(Math.max(dt, 0), 0.1);
    const t0 = performance.now();
    this.time += h;
    const p = this.probe;
    p.x = player.pos.x; p.y = player.pos.y; p.z = player.pos.z;
    p.vx = player.vel.x; p.vy = player.vel.y; p.vz = player.vel.z;
    if (this.carsOn) this.traffic.update(h, this.time, p.x, p.z, p);
    if (this.pedsOn) this.peds.update(h, this.time, p.x, p.z, p);
    const t1 = performance.now();
    this.simMs = t1 - t0;
    this.renderer.update(camera, this.time, this.carsOn, this.pedsOn);
  }

  notifyImpact(x: number, z: number, strength: number): void {
    if (this.pedsOn) this.peds.notifyImpact(x, z, strength);
  }

  /** 0..1 densities near a point, for audio */
  densityNear(x: number, z: number): { traffic: number; crowd: number } {
    return {
      traffic: this.carsOn ? this.traffic.densityNear(x, z) : 0,
      crowd: this.pedsOn ? this.peds.densityNear(x, z) : 0,
    };
  }

  /** honk events since last call (positions), for audio */
  drainHonks(): { x: number; z: number }[] {
    const n = this.traffic.drainHonks(this.honkTmp);
    const out: { x: number; z: number }[] = [];
    for (let k = 0; k < n; k++) out.push({ x: this.honkTmp[k * 2], z: this.honkTmp[k * 2 + 1] });
    return out;
  }

  /** Head/taillight brightness (>1 blooms); e.g. lerp(0.4, 3, darkness). */
  setLightIntensity(k: number): void {
    this.renderer.setLightIntensity(k);
  }

  stats(): { cars: number; carsActive: number; carsRendered: number; peds: number; pedsActive: number; pedsRendered: number; simMs: number } {
    return {
      cars: this.carsOn ? this.traffic.count : 0,
      carsActive: this.carsOn ? this.traffic.activeCount : 0,
      carsRendered: this.renderer.carsRendered,
      peds: this.pedsOn ? this.peds.count : 0,
      pedsActive: this.pedsOn ? this.peds.activeCount : 0,
      pedsRendered: this.renderer.pedsRendered,
      simMs: this.simMs,
    };
  }

  setEnabled(cars: boolean, peds: boolean): void {
    this.carsOn = cars;
    this.pedsOn = peds;
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
