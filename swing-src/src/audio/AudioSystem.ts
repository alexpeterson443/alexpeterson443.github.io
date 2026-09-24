import type { GameEvent } from '../player/Player';

/** Per-frame snapshot the audio layer reads. Plain data so it can be filled without allocation. */
export interface AudioFrame {
  speed: number; // player speed m/s
  verticalSpeed: number; // m/s (+ up)
  altitude: number; // m above street
  state: string; // movement StateId
  ropeActive: boolean;
  ropeTension: number; // N
  diving: boolean;
  camPos: { x: number; y: number; z: number };
  camForward: { x: number; y: number; z: number };
  nearbyTraffic: number; // 0..1
  nearbyCrowd: number; // 0..1
  timeOfDay: number; // 0..1 (0.5 = noon)
}

// ---------------------------------------------------------------------------------------------
// Pure mappings (unit-tested; no Web Audio dependency)

const sat = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sstep = (a: number, b: number, x: number) => {
  const t = sat((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Wind loudness 0..1: near-silent below ~5 m/s, roaring by 60–90 m/s. Monotonic. */
export function windGainForSpeed(speed: number): number {
  const x = sat((speed - 3) / 82);
  return 0.5 * Math.pow(x, 0.9) + 0.5 * x * x * (3 - 2 * x);
}

/** Wind lowpass cutoff (Hz): dull rumble when slow, broadband hiss when fast. */
export function windCutoffForSpeed(speed: number): number {
  const x = sat((speed - 3) / 82);
  return 220 * (1 + 30 * Math.pow(x, 1.3));
}

/** High "whistle" band 0..1: appears at high speed, earlier when diving. */
export function whistleGain(speed: number, diving: boolean): number {
  return sat(0.8 * sstep(30, 80, speed) + (diving ? 0.45 * sstep(10, 50, speed) : 0));
}

/** Rope strain loudness 0..1 from tension (N). Slack rope is silent. */
export function tensionToGain(tension: number): number {
  return Math.pow(sat((tension - 150) / 16000), 0.6);
}

/** Fundamental of the low strain drone (Hz) from tension. */
export function tensionToPitch(tension: number): number {
  return 38 + 70 * Math.sqrt(sat(tension / 16000));
}

/** Fabric flutter 0..1 from speed. */
export function clothGainForSpeed(speed: number): number {
  return sstep(2, 45, speed);
}

/** How much street-level city reaches the listener: 1 at street, ~0.15 far above the roofs. */
export function altitudeCityFactor(altitude: number): number {
  return 1 - 0.85 * sstep(15, 220, altitude);
}

/** 0 at midnight, 1 at noon. */
export function daylight(timeOfDay: number): number {
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * timeOfDay);
}

// ---------------------------------------------------------------------------------------------

const MAX_VOICES = 24;
const NOISE_SECONDS = 3;
const jit = (x: number, amt: number) => x * (1 + (Math.random() * 2 - 1) * amt);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Voice {
  srcs: AudioScheduledSourceNode[];
  out: GainNode;
  pan: StereoPannerNode;
  end: number;
}

/** Long-lived looping layers, built once on start(). */
interface Layers {
  windGain: GainNode;
  windLpL: BiquadFilterNode;
  windLpR: BiquadFilterNode;
  whistleGain: GainNode;
  whistleBp: BiquadFilterNode;
  creakGain: GainNode;
  creakBp: BiquadFilterNode;
  creakLfo: OscillatorNode;
  strainGain: GainNode;
  strainA: OscillatorNode;
  strainB: OscillatorNode;
  clothGain: GainNode;
  clothLfoA: OscillatorNode;
  clothLfoB: OscillatorNode;
  cityGain: GainNode;
  cityLp: BiquadFilterNode;
  airGain: GainNode;
  trafficGain: GainNode;
  hissGain: GainNode;
  drone: OscillatorNode;
  crowdGain: GainNode;
  crowdVoices: GainNode[];
  crowdTimers: number[];
}

type Ctor = new () => AudioContext;

function audioCtor(): Ctor | null {
  const g = globalThis as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

/**
 * Procedural traversal audio. Everything is synthesized from three shared noise buffers and
 * oscillators: continuous layers (wind, rope strain, cloth, city, traffic, crowd) are steered by
 * AudioFrame each frame; one-shots are short node graphs spawned per GameEvent, capped at MAX_VOICES.
 */
export class AudioSystem {
  masterVolume = 0.8;
  muted = false;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private amb: GainNode | null = null;
  private white: AudioBuffer | null = null;
  private pink: AudioBuffer | null = null;
  private brown: AudioBuffer | null = null;
  private L: Layers | null = null;
  private readonly loops: AudioScheduledSourceNode[] = [];
  private readonly voices: Voice[] = [];

  private gust = 0;
  private gustTarget = 0;
  private gustTimer = 0;
  private hornTimer = rand(8, 20);
  private sirenTimer = rand(30, 70);
  private droneTimer = 0;
  // last applied values, for stats()
  private sWind = 0;
  private sWhistle = 0;
  private sTension = 0;
  private sCloth = 0;
  private sCity = 0;
  private sTraffic = 0;
  private sCrowd = 0;
  private sDropped = 0;

  constructor() {}

  /** Must be called from a user gesture. Creates the AudioContext lazily; safe to call repeatedly. */
  start(): void {
    try {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
        return;
      }
      const C = audioCtor();
      if (!C) return;
      this.ctx = new C();
      this.build(this.ctx);
      if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
    } catch {
      this.teardown();
    }
  }

  get running(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  update(dt: number, f: AudioFrame): void {
    const ctx = this.ctx, L = this.L;
    if (!ctx || !L || !this.master) return;
    try {
      this.tick(ctx, L, Math.min(Math.max(dt, 0), 0.1), f);
    } catch {
      /* never let audio break the frame */
    }
  }

  onEvent(e: GameEvent, f: AudioFrame): void {
    if (!this.ctx || !this.sfx) return;
    try {
      this.play(e, f);
    } catch {
      /* ignore */
    }
  }

  stats(): Record<string, number> {
    return {
      voices: this.voices.length,
      dropped: this.sDropped,
      wind: this.sWind,
      whistle: this.sWhistle,
      tension: this.sTension,
      cloth: this.sCloth,
      city: this.sCity,
      traffic: this.sTraffic,
      crowd: this.sCrowd,
      running: this.running ? 1 : 0,
    };
  }

  dispose(): void {
    try {
      for (const v of this.voices) this.kill(v);
      this.voices.length = 0;
      for (const s of this.loops) {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      }
      this.loops.length = 0;
      if (this.ctx) void this.ctx.close().catch(() => {});
    } catch {
      /* ignore */
    }
    this.teardown();
  }

  // -------------------------------------------------------------------------------------------
  // Graph construction

  private teardown(): void {
    this.ctx = null;
    this.master = this.sfx = this.amb = null;
    this.white = this.pink = this.brown = null;
    this.L = null;
  }

  private build(ctx: AudioContext): void {
    this.makeNoise(ctx);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.masterVolume;
    comp.connect(this.master).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.amb = ctx.createGain();
    this.sfx.connect(comp);
    this.amb.connect(comp);
    this.L = this.buildLayers(ctx, this.amb, this.sfx);
  }

  /** White, pink (Kellet filter) and brown (leaky integrator) noise, generated once. */
  private makeNoise(ctx: AudioContext): void {
    const n = Math.floor(ctx.sampleRate * NOISE_SECONDS);
    this.white = ctx.createBuffer(1, n, ctx.sampleRate);
    this.pink = ctx.createBuffer(1, n, ctx.sampleRate);
    this.brown = ctx.createBuffer(1, n, ctx.sampleRate);
    const w = this.white.getChannelData(0), p = this.pink.getChannelData(0), b = this.brown.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, br = 0;
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 2 - 1;
      w[i] = x;
      b0 = 0.99886 * b0 + x * 0.0555179;
      b1 = 0.99332 * b1 + x * 0.0750759;
      b2 = 0.969 * b2 + x * 0.153852;
      b3 = 0.8665 * b3 + x * 0.3104856;
      b4 = 0.55 * b4 + x * 0.5329522;
      b5 = -0.7616 * b5 - x * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11;
      b6 = x * 0.115926;
      br = (br + 0.02 * x) / 1.02;
      b[i] = br * 3.5;
    }
    // crossfade the tail into the head so loops don't click
    const fade = Math.min(2048, n >> 2);
    for (const d of [w, p, b]) {
      for (let i = 0; i < fade; i++) {
        const t = i / fade;
        d[n - fade + i] = d[n - fade + i] * (1 - t) + d[i] * t;
      }
    }
  }

  private loop(buf: AudioBuffer, rate = 1): AudioBufferSourceNode {
    const s = this.ctx!.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.playbackRate.value = rate;
    s.start(0, Math.random() * buf.duration);
    this.loops.push(s);
    return s;
  }

  private lfo(type: OscillatorType, freq: number, depth: number, target: AudioParam): OscillatorNode {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
    this.loops.push(o);
    return o;
  }

  private filter(type: BiquadFilterType, freq: number, q: number): BiquadFilterNode {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  private gain(v: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = v;
    return g;
  }

  private buildLayers(ctx: AudioContext, amb: GainNode, sfx: GainNode): Layers {
    const white = this.white!, pink = this.pink!, brown = this.brown!;

    // WIND: two decorrelated pink streams panned L/R, each with slow independent swell
    const windGain = this.gain(0);
    windGain.connect(sfx);
    const windLpL = this.filter('lowpass', 300, 0.5), windLpR = this.filter('lowpass', 320, 0.5);
    const swellL = this.gain(0.8), swellR = this.gain(0.8);
    const panL = ctx.createStereoPanner(), panR = ctx.createStereoPanner();
    panL.pan.value = -0.55;
    panR.pan.value = 0.55;
    this.loop(pink, 0.97).connect(windLpL).connect(swellL).connect(panL).connect(windGain);
    this.loop(pink, 1.03).connect(windLpR).connect(swellR).connect(panR).connect(windGain);
    this.lfo('sine', 0.13, 0.2, swellL.gain);
    this.lfo('sine', 0.21, 0.2, swellR.gain);
    this.lfo('sine', 0.07, 0.25, panL.pan);
    // whistle: narrow band of white noise with a wandering centre
    const whistleBp = this.filter('bandpass', 1800, 9);
    const whistleGain = this.gain(0);
    this.loop(white).connect(whistleBp).connect(whistleGain).connect(sfx);
    this.lfo('sine', 0.31, 260, whistleBp.detune);
    this.lfo('triangle', 0.09, 120, whistleBp.detune);

    // WEB TENSION: stick-slip creak (square-gated resonant noise) + detuned low sawtooth strain
    const creakBp = this.filter('bandpass', 650, 5);
    const creakAm = this.gain(0.5);
    const creakGain = this.gain(0);
    this.loop(brown, 1.4).connect(creakBp).connect(creakAm).connect(creakGain).connect(sfx);
    const creakLfo = this.lfo('square', 8, 0.5, creakAm.gain);
    const strainLp = this.filter('lowpass', 260, 2);
    const strainGain = this.gain(0);
    const strainA = ctx.createOscillator(), strainB = ctx.createOscillator();
    strainA.type = 'sawtooth';
    strainB.type = 'sawtooth';
    strainA.frequency.value = 45;
    strainB.frequency.value = 45.6;
    strainA.connect(strainLp);
    strainB.connect(strainLp);
    strainLp.connect(strainGain).connect(sfx);
    strainA.start();
    strainB.start();
    this.loops.push(strainA, strainB);

    // CLOTH: bandpassed noise amplitude-modulated by two non-harmonic flutter LFOs
    const clothAm = this.gain(0.5);
    const clothGain = this.gain(0);
    this.loop(white, 0.9).connect(this.filter('bandpass', 1100, 0.9)).connect(clothAm).connect(clothGain).connect(sfx);
    const clothLfoA = this.lfo('sine', 7, 0.3, clothAm.gain);
    const clothLfoB = this.lfo('triangle', 11.3, 0.22, clothAm.gain);

    // CITY bed + high-altitude air
    const cityLp = this.filter('lowpass', 500, 0.3);
    const cityGain = this.gain(0);
    this.loop(brown).connect(cityLp).connect(cityGain).connect(amb);
    const airGain = this.gain(0);
    this.loop(pink, 0.8).connect(this.filter('highpass', 2500, 0.4)).connect(airGain).connect(amb);

    // TRAFFIC: road rumble + engine drone + tyre hiss
    const trafficGain = this.gain(0);
    trafficGain.connect(amb);
    this.loop(brown, 0.7).connect(this.filter('lowpass', 170, 0.6)).connect(trafficGain);
    const drone = ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 41;
    drone.connect(this.filter('lowpass', 110, 1)).connect(this.gain(0.12)).connect(trafficGain);
    drone.start();
    this.loops.push(drone);
    this.lfo('sine', 0.05, 3, drone.frequency);
    const hissGain = this.gain(0);
    this.loop(white, 0.85).connect(this.filter('bandpass', 2300, 0.7)).connect(hissGain).connect(amb);

    // CROWD: one pink stream split into vowel-ish formant bands with syllabic random gating
    const crowdGain = this.gain(0);
    crowdGain.connect(amb);
    const crowdSrc = this.loop(pink, 1.1);
    const crowdVoices: GainNode[] = [];
    const crowdTimers: number[] = [];
    for (const [fq, q] of [[330, 4], [520, 5], [780, 4], [1250, 3], [2100, 3]]) {
      const g = this.gain(0.3);
      const bp = this.filter('bandpass', fq, q);
      this.lfo('sine', rand(0.1, 0.3), fq * 0.06, bp.frequency);
      crowdSrc.connect(bp).connect(g).connect(crowdGain);
      crowdVoices.push(g);
      crowdTimers.push(Math.random() * 0.3);
    }

    return {
      windGain, windLpL, windLpR, whistleGain, whistleBp,
      creakGain, creakBp, creakLfo, strainGain, strainA, strainB,
      clothGain, clothLfoA, clothLfoB,
      cityGain, cityLp, airGain, trafficGain, hissGain, drone,
      crowdGain, crowdVoices, crowdTimers,
    };
  }

  // -------------------------------------------------------------------------------------------
  // Continuous layers

  private tick(ctx: AudioContext, L: Layers, dt: number, f: AudioFrame): void {
    const t = ctx.currentTime;
    const s = f.speed > 0 ? f.speed : 0;
    const near = altitudeCityFactor(f.altitude);
    const high = 1 - near;
    const day = daylight(f.timeOfDay);

    this.master!.gain.setTargetAtTime(this.muted ? 0 : sat(this.masterVolume), t, 0.05);

    // gusts: slow random walk that keeps wind alive even at constant speed
    this.gustTimer -= dt;
    if (this.gustTimer <= 0) {
      this.gustTimer = rand(0.8, 2.5);
      this.gustTarget = Math.random() * 2 - 1;
    }
    this.gust += (this.gustTarget - this.gust) * (1 - Math.exp(-1.2 * dt));

    const wind = Math.max(windGainForSpeed(s), 0.05 + 0.12 * high) * (1 + 0.12 * this.gust);
    L.windGain.gain.setTargetAtTime(wind * 0.7, t, 0.12);
    const cut = windCutoffForSpeed(s) * (f.diving ? 1.25 : 1) * (1 + 0.1 * this.gust);
    L.windLpL.frequency.setTargetAtTime(cut, t, 0.15);
    L.windLpR.frequency.setTargetAtTime(cut * 1.07, t, 0.15);
    const wh = whistleGain(s, f.diving);
    L.whistleGain.gain.setTargetAtTime(wh * 0.12, t, 0.25);
    L.whistleBp.frequency.setTargetAtTime(1400 + 20 * s + (f.diving ? 700 : 0), t, 0.3);
    this.sWind = wind;
    this.sWhistle = wh;

    const tg = f.ropeActive ? tensionToGain(f.ropeTension) : 0;
    const tn = sat(f.ropeTension / 16000);
    L.creakGain.gain.setTargetAtTime(tg * 0.2, t, tg > this.sTension ? 0.03 : 0.1);
    L.strainGain.gain.setTargetAtTime(tg * 0.1, t, 0.06);
    if (tg > 0) {
      const hz = tensionToPitch(f.ropeTension);
      L.strainA.frequency.setTargetAtTime(hz, t, 0.05);
      L.strainB.frequency.setTargetAtTime(hz * 1.013, t, 0.05);
      L.creakLfo.frequency.setTargetAtTime(5 + 20 * tn, t, 0.1);
      L.creakBp.frequency.setTargetAtTime(450 + 900 * tn, t, 0.1);
    }
    this.sTension = tg;

    const cloth = clothGainForSpeed(s) * (f.state === 'Grounded' ? 0.3 : 1);
    L.clothGain.gain.setTargetAtTime(cloth * 0.12, t, 0.15);
    L.clothLfoA.frequency.setTargetAtTime(5 + 0.35 * s, t, 0.2);
    L.clothLfoB.frequency.setTargetAtTime(8.3 + 0.5 * s, t, 0.2);
    this.sCloth = cloth;

    const city = 0.16 * (0.3 + 0.7 * near) * (0.6 + 0.4 * day);
    L.cityGain.gain.setTargetAtTime(city, t, 0.5);
    L.cityLp.frequency.setTargetAtTime(160 + 440 * near * (0.6 + 0.4 * day), t, 0.5);
    L.airGain.gain.setTargetAtTime(0.025 * high, t, 0.8);
    this.sCity = city;

    const traffic = sat(f.nearbyTraffic) * near * near;
    L.trafficGain.gain.setTargetAtTime(traffic * 0.25, t, 0.4);
    L.hissGain.gain.setTargetAtTime(traffic * 0.04, t, 0.4);
    this.droneTimer -= dt;
    if (this.droneTimer <= 0) {
      this.droneTimer = rand(1.5, 4);
      L.drone.frequency.setTargetAtTime(rand(36, 52), t, 1.2);
    }
    this.sTraffic = traffic;

    const crowd = sat(f.nearbyCrowd) * near * near * (0.4 + 0.6 * day);
    L.crowdGain.gain.setTargetAtTime(crowd * 0.35, t, 0.5);
    for (let i = 0; i < L.crowdVoices.length; i++) {
      L.crowdTimers[i] -= dt;
      if (L.crowdTimers[i] <= 0) {
        L.crowdTimers[i] = rand(0.12, 0.45);
        L.crowdVoices[i].gain.setTargetAtTime(Math.random() < 0.25 ? 0.05 : rand(0.2, 0.6), t, 0.06);
      }
    }
    this.sCrowd = crowd;

    // distant horns and sirens: rare, quiet, further away the higher we are
    this.hornTimer -= dt;
    if (this.hornTimer <= 0) {
      this.hornTimer = rand(7, 22) / (0.3 + 0.7 * day);
      if (Math.random() < 0.3 + 0.6 * near * (0.3 + 0.7 * sat(f.nearbyTraffic + 0.3))) this.horn(near);
    }
    this.sirenTimer -= dt;
    if (this.sirenTimer <= 0) {
      this.sirenTimer = rand(35, 90) * (0.6 + 0.4 * day);
      if (Math.random() < 0.6) this.siren(near);
    }

    for (let i = this.voices.length - 1; i >= 0; i--) {
      const v = this.voices[i];
      if (v.end < t) {
        this.kill(v);
        this.voices.splice(i, 1);
      }
    }
  }

  private horn(near: number): void {
    const v = this.voice(rand(-0.9, 0.9), 0.03 * (0.35 + 0.65 * near), this.amb);
    if (!v) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    const base = rand(300, 460);
    const lp = this.filter('lowpass', 700 + 900 * near, 0.7);
    lp.connect(v.out);
    const honks = Math.random() < 0.4 ? 2 : 1;
    for (let h = 0; h < honks; h++) {
      const t0 = t + h * rand(0.25, 0.4);
      const dur = h === 0 && honks === 1 ? rand(0.3, 0.8) : rand(0.15, 0.25);
      for (const ratio of [1, 1.26]) {
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = base * ratio;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.5, t0 + 0.02);
        g.gain.setValueAtTime(0.5, t0 + dur);
        g.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
        o.connect(g).connect(lp);
        o.start(t0);
        o.stop(t0 + dur + 0.07);
        v.srcs.push(o);
        v.end = Math.max(v.end, t0 + dur + 0.1);
      }
    }
  }

  private siren(near: number): void {
    const v = this.voice(rand(-1, 1), 0.02 * (0.4 + 0.6 * near), this.amb);
    if (!v) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    const dur = rand(6, 10);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = rand(850, 1000);
    const wail = Math.random() < 0.7;
    const mod = ctx.createOscillator();
    mod.type = wail ? 'sine' : 'triangle';
    mod.frequency.value = wail ? rand(0.2, 0.35) : rand(2.5, 3.5);
    const depth = ctx.createGain();
    depth.gain.value = wail ? 320 : 220;
    mod.connect(depth).connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(this.filter('lowpass', 1400, 0.5)).connect(g).connect(v.out);
    for (const n of [o, mod]) {
      n.start(t);
      n.stop(t + dur + 0.05);
      v.srcs.push(n);
    }
    v.end = t + dur + 0.1;
  }

  // -------------------------------------------------------------------------------------------
  // One-shots

  private voice(pan: number, level: number, bus: GainNode | null = this.sfx): Voice | null {
    const ctx = this.ctx;
    if (!ctx || !bus) return null;
    if (this.voices.length >= MAX_VOICES) {
      this.kill(this.voices.shift()!);
      this.sDropped++;
    }
    const out = ctx.createGain();
    out.gain.value = level;
    const p = ctx.createStereoPanner();
    p.pan.value = pan < -1 ? -1 : pan > 1 ? 1 : pan;
    out.connect(p).connect(bus);
    const v: Voice = { srcs: [], out, pan: p, end: ctx.currentTime + 0.05 };
    this.voices.push(v);
    return v;
  }

  private kill(v: Voice): void {
    for (const s of v.srcs) {
      try {
        s.stop();
      } catch {
        /* not started / already stopped */
      }
    }
    v.out.disconnect();
    v.pan.disconnect();
  }

  private env(t: number, attack: number, dur: number, peak: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    return g;
  }

  /** Filtered noise burst with an exponential cutoff sweep f0 → f1. */
  private noise(v: Voice, buf: AudioBuffer, t: number, dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, peak: number, attack = 0.004): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rand(0.9, 1.1);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(Math.max(20, f0), t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    src.connect(f).connect(this.env(t, attack, dur, peak)).connect(v.out);
    src.start(t, Math.random() * Math.max(0, buf.duration - dur - 0.1));
    src.stop(t + dur + 0.02);
    v.srcs.push(src);
    v.end = Math.max(v.end, t + dur + 0.05);
  }

  /** Pitched blip with an exponential glide f0 → f1. */
  private tone(v: Voice, type: OscillatorType, t: number, dur: number, f0: number, f1: number, peak: number, attack = 0.002): void {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(1, f0), t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    o.connect(this.env(t, attack, dur, peak)).connect(v.out);
    o.start(t);
    o.stop(t + dur + 0.02);
    v.srcs.push(o);
    v.end = Math.max(v.end, t + dur + 0.05);
  }

  /** Stereo placement + distance level of a world position relative to the camera. */
  private place(e: GameEvent, f: AudioFrame): [number, number] {
    const dx = e.pos.x - f.camPos.x, dz = e.pos.z - f.camPos.z;
    const d = Math.hypot(dx, dz, e.pos.y - f.camPos.y);
    const rl = Math.hypot(f.camForward.x, f.camForward.z) || 1;
    const rx = -f.camForward.z / rl, rz = f.camForward.x / rl;
    const pan = ((dx * rx + dz * rz) / Math.max(d, 1)) * 0.6 * sstep(0.5, 4, d);
    return [Number.isFinite(pan) ? pan : 0, 1 / (1 + Math.max(0, d - 6) / 40)];
  }

  private play(e: GameEvent, f: AudioFrame): void {
    const W = this.white!, P = this.pink!, B = this.brown!;
    const [pan, lvl] = this.place(e, f);
    const t = this.ctx!.currentTime + 0.005;
    const a = Number.isFinite(e.a) ? e.a : 0;
    let v: Voice | null;
    switch (e.type) {
      case 'webFire':
      case 'zip': {
        const zip = e.type === 'zip';
        if (!(v = this.voice(pan, lvl))) return;
        const p = jit(1, 0.08);
        const dur = zip ? 0.16 : jit(0.09, 0.15);
        this.noise(v, W, t, dur, 'bandpass', 4600 * p, 850 * p, jit(6, 0.2), 0.55, 0.002);
        this.tone(v, 'sine', t, 0.018, 2800 * p, 1300 * p, 0.12, 0.001);
        this.tone(v, 'sine', t, 0.06, 190 * p, 90, 0.18);
        if (zip) this.noise(v, P, t + 0.08, 0.35, 'bandpass', 500, 2600, 2, 0.22, 0.05);
        return;
      }
      case 'webAttach':
        if (!(v = this.voice(pan, lvl * 0.7))) return;
        this.noise(v, W, t, 0.03, 'highpass', 3000, 1800, 0.7, 0.18);
        this.tone(v, 'triangle', t, 0.08, jit(420, 0.1), 300, 0.08);
        return;
      case 'webRelease': {
        const q = sat(a);
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, P, t, 0.3 + 0.2 * q, 'bandpass', 380, 1000 + 2200 * q, 1.2, 0.14 + 0.3 * q, 0.06);
        return;
      }
      case 'webFail':
        if (!(v = this.voice(pan, lvl))) return;
        this.tone(v, 'sine', t, 0.05, 300, 170, 0.2);
        this.noise(v, B, t, 0.04, 'lowpass', 500, 300, 0.7, 0.18);
        return;
      case 'footstep': {
        const k = sat(a / 12);
        if (!(v = this.voice(pan, lvl * jit(1, 0.15)))) return;
        this.noise(v, B, t, jit(0.08, 0.2), 'lowpass', jit(320, 0.2), 110, 0.8, 0.25 + 0.2 * k);
        this.tone(v, 'sine', t, 0.07, jit(95, 0.12), 50, 0.14 + 0.1 * k);
        this.noise(v, W, t, 0.025, 'highpass', 3500, 2500, 0.7, 0.04 + 0.04 * k);
        return;
      }
      case 'wallStep':
      case 'wallRun':
        if (!(v = this.voice(pan, lvl * (e.type === 'wallRun' ? 1.2 : jit(0.9, 0.15))))) return;
        this.noise(v, W, t, jit(0.05, 0.2), 'bandpass', jit(1900, 0.15), 1100, 2, 0.16);
        this.tone(v, 'sine', t, 0.015, jit(1400, 0.1), 900, 0.05);
        return;
      case 'land': {
        const k = sat(a / 20);
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, B, t, 0.18 + 0.1 * k, 'lowpass', 400 + 300 * k, 100, 0.8, 0.3 + 0.4 * k);
        this.tone(v, 'sine', t, 0.2, 110, 45, 0.1 + 0.3 * k);
        this.noise(v, P, t + 0.02, 0.15, 'bandpass', 1500, 900, 1, 0.1);
        return;
      }
      case 'roll':
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, B, t, 0.16, 'lowpass', 500, 110, 0.8, 0.35);
        this.noise(v, P, t + 0.03, 0.4, 'bandpass', 900, 1500, 1.4, 0.22, 0.05);
        this.noise(v, P, t + 0.22, 0.35, 'bandpass', 1400, 700, 1.4, 0.16, 0.04);
        this.tone(v, 'sine', t + 0.25, 0.1, 80, 50, 0.1);
        return;
      case 'hardLand': {
        if (!(v = this.voice(pan, lvl))) return;
        const k = sat(a / 35);
        this.tone(v, 'sine', t, 0.75, 72, 26, 0.7 + 0.3 * k, 0.003);
        this.noise(v, B, t, 0.5, 'lowpass', 900, 80, 0.9, 0.6 + 0.2 * k);
        this.noise(v, W, t, 0.12, 'bandpass', 2600, 700, 1.5, 0.35);
        this.noise(v, W, t + 0.03, 0.28, 'highpass', 4000, 1800, 0.6, 0.12, 0.01);
        this.duck(0.35, 0.18);
        return;
      }
      case 'jump':
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, W, t, 0.05, 'bandpass', 1500, 700, 1.5, 0.12);
        this.noise(v, P, t, 0.22, 'bandpass', 500, 1400, 1.2, 0.14, 0.03);
        return;
      case 'superJump':
        if (!(v = this.voice(pan, lvl))) return;
        this.tone(v, 'sine', t, 0.3, 55, 130, 0.35, 0.005);
        this.noise(v, B, t, 0.15, 'lowpass', 600, 120, 0.8, 0.35);
        this.noise(v, P, t, 0.6, 'bandpass', 300, 2800, 1.3, 0.4, 0.05);
        return;
      case 'pointLaunch':
        if (!(v = this.voice(pan, lvl))) return;
        this.tone(v, 'triangle', t, 0.3, jit(230, 0.05), 170, 0.08);
        this.tone(v, 'sine', t, 0.5, 80, 220, 0.2, 0.05);
        this.noise(v, P, t, 0.95, 'bandpass', 250, 3600, 1.5, 0.45, 0.15);
        this.noise(v, W, t + 0.25, 0.6, 'highpass', 1500, 5000, 0.5, 0.08, 0.2);
        return;
      case 'wallJump':
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, W, t, 0.07, 'bandpass', 1400, 600, 1.8, 0.2);
        this.noise(v, P, t + 0.02, 0.26, 'bandpass', 600, 1700, 1.2, 0.16, 0.04);
        return;
      case 'vault':
      case 'mantle':
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, W, t, jit(0.09, 0.2), 'bandpass', 2200, 1400, 1.5, 0.18);
        this.noise(v, P, t, 0.12, 'lowpass', 600, 250, 0.7, 0.12);
        if (e.type === 'mantle') this.noise(v, W, t + 0.13, 0.1, 'bandpass', 1800, 1200, 1.5, 0.12);
        return;
      case 'trick':
        if (!(v = this.voice(pan, lvl))) return;
        this.noise(v, P, t, 0.28, 'bandpass', 550, 1900, 2, 0.24, 0.08);
        this.noise(v, P, t + 0.22, 0.3, 'bandpass', 1900, 600, 2, 0.2, 0.03);
        return;
      case 'perch':
        if (!(v = this.voice(pan, lvl))) return;
        this.tone(v, 'sine', t, 0.035, 520, 300, 0.12);
        this.noise(v, W, t, 0.02, 'bandpass', 3000, 2400, 2, 0.06);
        return;
      case 'cornerWrap':
        if (!(v = this.voice(pan, lvl * 0.6))) return;
        this.tone(v, 'triangle', t, 0.22, jit(150, 0.08), 110, 0.05, 0.02);
        return;
      case 'state':
        return;
    }
  }

  /** Briefly dip the ambience bus (heavy impacts). */
  private duck(depth: number, hold: number): void {
    const amb = this.amb, ctx = this.ctx;
    if (!amb || !ctx) return;
    const t = ctx.currentTime;
    amb.gain.cancelScheduledValues(t);
    amb.gain.setTargetAtTime(depth, t, 0.02);
    amb.gain.setTargetAtTime(1, t + hold, 0.5);
  }
}
