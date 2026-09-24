import { describe, it, expect } from 'vitest';
import { Intent } from '../src/input/Intent';
import { BotPilot, type PilotStyle } from '../src/bench/BotPilot';
import { cityPlayer } from './helpers';

/** Fly a bot down an avenue of the generated city and return the metrics. */
export function flight(style: PilotStyle, seconds: number, seed = 1337, startY = 45) {
  const { city, p } = cityPlayer(seed);
  const x = city.avenueX[2];
  const z = city.bounds.z1 - 30;
  p.spawn(x, startY, z);
  p.vel.set(0, 0, -15);
  const bot = new BotPilot(style, 0); // yaw 0 = looking toward −Z (north up the avenue)
  const input = new Intent();
  const dt = 1 / 120;
  for (let i = 0; i < seconds / dt; i++) {
    bot.drive(p, input, dt);
    input.latch();
    p.step(dt, input);
    bot.observe(p, dt);
  }
  return { m: bot.m, p };
}

describe('bot flights (traversal feel regression)', () => {
  it('sustains a fast swing chain down an avenue without touching the street', () => {
    const { m } = flight('swing', 11);
    process.stderr.write(`\nswing: ${JSON.stringify({ ...m, states: undefined })}\nstates ${JSON.stringify(m.states)}\n`);
    expect(m.swings).toBeGreaterThanOrEqual(5);
    expect(m.avgSpeed).toBeGreaterThan(26);
    expect(m.wallContacts).toBeLessThanOrEqual(4);
    expect(m.groundTouches).toBe(0);
    expect(m.minSwingClearance).toBeGreaterThan(1.0);
  });

  it('dive-catch keeps momentum', () => {
    // a real dive: from well above the rooftops, falling until low enough to catch a web
    const { m } = flight('diveCatch', 10, 1337, 110);
    process.stderr.write(`\ndive: ${JSON.stringify({ ...m, states: undefined })}\n`);
    expect(m.maxSpeed).toBeGreaterThan(40);
    expect(m.groundTouches).toBe(0);
  });

  it('turning flights make progress around corners', () => {
    const { m } = flight('swingTurn', 24);
    process.stderr.write(`\nturn: ${JSON.stringify({ ...m, states: undefined })}\nstates ${JSON.stringify(m.states)}\n`);
    expect(m.swings).toBeGreaterThanOrEqual(6);
    expect(m.distance).toBeGreaterThan(600);
  });
});
