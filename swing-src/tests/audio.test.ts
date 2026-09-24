import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  AudioSystem, type AudioFrame, windGainForSpeed, windCutoffForSpeed, whistleGain, tensionToGain,
  tensionToPitch, clothGainForSpeed, altitudeCityFactor, daylight,
} from '../src/audio/AudioSystem';
import type { GameEventType } from '../src/player/Player';

const frame = (o: Partial<AudioFrame> = {}): AudioFrame => ({
  speed: 20, verticalSpeed: -3, altitude: 40, state: 'Swinging', ropeActive: true, ropeTension: 5000,
  diving: false, camPos: { x: 0, y: 40, z: 5 }, camForward: { x: 0, y: 0, z: -1 },
  nearbyTraffic: 0.5, nearbyCrowd: 0.5, timeOfDay: 0.5, ...o,
});

const EVENTS: GameEventType[] = [
  'jump', 'superJump', 'land', 'roll', 'hardLand', 'webFire', 'webAttach', 'webRelease', 'webFail', 'zip',
  'pointLaunch', 'perch', 'wallRun', 'wallJump', 'vault', 'mantle', 'trick', 'footstep', 'wallStep', 'cornerWrap', 'state',
];

describe('audio system (no Web Audio)', () => {
  it('is a safe no-op in Node', () => {
    expect(typeof (globalThis as { AudioContext?: unknown }).AudioContext).toBe('undefined');
    const a = new AudioSystem();
    expect(() => {
      a.start();
      a.start();
      for (let i = 0; i < 10; i++) a.update(1 / 60, frame({ speed: i * 10 }));
      for (const type of EVENTS) a.onEvent({ type, a: 10, pos: new Vector3(1, 40, 0) }, frame());
      a.masterVolume = 0.3;
      a.muted = true;
      a.update(1 / 60, frame());
    }).not.toThrow();
    expect(a.running).toBe(false);
    expect(a.masterVolume).toBe(0.3);
    const s = a.stats();
    expect(s.voices).toBe(0);
    for (const v of Object.values(s)) expect(Number.isFinite(v)).toBe(true);
    expect(() => a.dispose()).not.toThrow();
    expect(() => a.dispose()).not.toThrow();
  });
});

describe('audio mappings', () => {
  const speeds = Array.from({ length: 121 }, (_, i) => i);

  it('wind gain is bounded, monotonic and speed-shaped', () => {
    let prev = -1;
    for (const s of speeds) {
      const g = windGainForSpeed(s);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(prev);
      prev = g;
    }
    expect(windGainForSpeed(4)).toBeLessThan(0.05);
    expect(windGainForSpeed(70)).toBeGreaterThan(0.8);
    expect(windGainForSpeed(-10)).toBe(0);
    // smooth: no big jumps between adjacent m/s
    for (const s of speeds.slice(1)) expect(windGainForSpeed(s) - windGainForSpeed(s - 1)).toBeLessThan(0.03);
  });

  it('wind cutoff and whistle rise with speed; diving adds whistle', () => {
    expect(windCutoffForSpeed(80)).toBeGreaterThan(windCutoffForSpeed(20));
    expect(windCutoffForSpeed(20)).toBeGreaterThan(windCutoffForSpeed(0));
    expect(whistleGain(10, false)).toBe(0);
    expect(whistleGain(80, false)).toBeGreaterThan(0.5);
    expect(whistleGain(35, true)).toBeGreaterThan(whistleGain(35, false));
    expect(whistleGain(200, true)).toBeLessThanOrEqual(1);
  });

  it('tension maps to a bounded, monotonic strain level and pitch', () => {
    expect(tensionToGain(0)).toBe(0);
    expect(tensionToGain(100)).toBe(0);
    let prevG = -1, prevP = 0;
    for (let T = 0; T <= 25000; T += 500) {
      const g = tensionToGain(T), p = tensionToPitch(T);
      expect(g).toBeGreaterThanOrEqual(prevG);
      expect(p).toBeGreaterThanOrEqual(prevP);
      expect(g).toBeLessThanOrEqual(1);
      prevG = g;
      prevP = p;
    }
    expect(tensionToGain(20000)).toBe(1);
  });

  it('cloth, altitude and daylight helpers are sensible', () => {
    expect(clothGainForSpeed(0)).toBe(0);
    expect(clothGainForSpeed(60)).toBe(1);
    expect(altitudeCityFactor(0)).toBe(1);
    expect(altitudeCityFactor(300)).toBeCloseTo(0.15);
    expect(altitudeCityFactor(100)).toBeLessThan(altitudeCityFactor(20));
    expect(daylight(0.5)).toBeCloseTo(1);
    expect(daylight(0)).toBeCloseTo(0);
  });
});
