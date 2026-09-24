import { atmoScales } from '../render/Environment';
import GUI from 'lil-gui';
import { T, Tuning, metaFor, resetTuning } from '../core/tuning';

export interface DebugFlags {
  velocity: boolean;
  acceleration: boolean;
  tension: boolean;
  anchor: boolean;
  candidates: boolean;
  scores: boolean;
  trajectory: boolean;
  collision: boolean;
  forces: boolean;
  stats: boolean;
}

export interface PanelHooks {
  flags: DebugFlags;
  env: { timeOfDay: number; bloom: number };
  suit: { skin: string; options: string[] };
  onSuit: () => void;
  quality: { preset: string };
  ai: { cars: boolean; pedestrians: boolean };
  audio: { volume: number; muted: boolean };
  sim: { timeScale: number; paused: boolean };
  onTime(): void;
  onQuality(): void;
  onAI(): void;
  onAudio(): void;
  onBloom(): void;
  respawn(): void;
  regenerate(seed: number): void;
  bench(name: string): void;
  seed: number;
}

/** In-game developer panel (lil-gui). Every Tuning value is live-editable. */
export class DevPanel {
  readonly gui: GUI;

  constructor(h: PanelHooks) {
    this.gui = new GUI({ title: 'STRAND dev panel' });
    this.gui.domElement.style.zIndex = '20';
    const dbg = this.gui.addFolder('Debug draw');
    const labels: Record<keyof DebugFlags, string> = {
      velocity: 'velocity vector', acceleration: 'acceleration vector', tension: 'web tension',
      anchor: 'anchor', candidates: 'anchor candidates', scores: 'candidate scores',
      trajectory: 'trajectory prediction', collision: 'collision shapes', forces: 'swing forces',
      stats: 'stats HUD (fps/cpu/gpu/state…)',
    };
    for (const k of Object.keys(labels) as (keyof DebugFlags)[]) dbg.add(h.flags, k).name(labels[k]);

    const world = this.gui.addFolder('World & rendering');
    world.add(h.env, 'timeOfDay', 0, 1, 0.005).name('time of day (full)').onChange(() => h.onTime());
    world.add(h.env, 'bloom', 0, 2, 0.01).name('bloom (× look)').onChange(() => h.onBloom());
    const atmo = world.addFolder('atmosphere (× look)');
    atmo.add(atmoScales, 'fog', 0, 3, 0.01).name('aerial fog').onChange(() => h.onTime());
    atmo.add(atmoScales, 'heightFog', 0, 4, 0.01).name('ground fog').onChange(() => h.onTime());
    atmo.add(atmoScales, 'heightFalloff', 0.2, 3, 0.01).name('ground fog falloff').onChange(() => h.onTime());
    atmo.add(atmoScales, 'sky', 0.3, 2, 0.01).name('sky brightness').onChange(() => h.onTime());
    atmo.add(atmoScales, 'stars', 0, 3, 0.01).name('stars').onChange(() => h.onTime());
    atmo.close();
    world.add(h.suit, 'skin', h.suit.options).name('suit (K)').onChange(() => h.onSuit()).listen();
    world.add(h.quality, 'preset', ['low', 'medium', 'high', 'ultra']).name('quality').onChange(() => h.onQuality());
    world.add(h.ai, 'cars').name('traffic').onChange(() => h.onAI());
    world.add(h.ai, 'pedestrians').onChange(() => h.onAI());
    world.add(h.audio, 'volume', 0, 1, 0.01).onChange(() => h.onAudio());
    world.add(h.audio, 'muted').onChange(() => h.onAudio());
    const seedObj = { seed: h.seed };
    world.add(seedObj, 'seed', 1, 99999, 1).name('city seed');
    world.add({ go: () => h.regenerate(seedObj.seed) }, 'go').name('regenerate city');

    const sim = this.gui.addFolder('Simulation');
    sim.add(h.sim, 'timeScale', 0.05, 2, 0.01).name('time scale');
    sim.add(h.sim, 'paused');
    sim.add({ r: () => h.respawn() }, 'r').name('respawn on rooftop');
    for (const b of ['tour', 'swing', 'swingTurn', 'diveCatch', 'parkour']) sim.add({ f: () => h.bench(b) }, 'f').name(`bench: ${b}`);

    const tun = this.gui.addFolder('Tuning');
    const t = T as unknown as Record<string, Record<string, number>>;
    for (const group of Object.keys(Tuning)) {
      const f = tun.addFolder(group);
      f.close();
      for (const key of Object.keys(t[group])) {
        const m = metaFor(`${group}.${key}`, t[group][key]);
        f.add(t[group], key, m.min, m.max, m.step);
      }
    }
    tun.add({ reset: () => { resetTuning(); this.gui.controllersRecursive().forEach((c) => c.updateDisplay()); } }, 'reset').name('reset all tuning');
    tun.close();
    this.gui.close();
    this.gui.hide();
  }

  toggle(): void {
    if (this.gui._hidden) { this.gui.show(); this.gui.open(); } else this.gui.hide();
  }
}
