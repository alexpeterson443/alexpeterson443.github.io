import { describe, it, expect } from 'vitest';
import { Intent } from '../src/input/Intent';
import { TourPilot } from '../src/bench/TourPilot';
import { findSpawn } from '../src/city/spawn';
import { cityPlayer } from './helpers';

describe('success-criteria tour (integration)', () => {
  it('rooftop → leap → dive → swing → release → zip → point launch → wall run → over the top → swing', () => {
    const { city, p } = cityPlayer(1337);
    const sp = findSpawn(city);
    p.spawn(sp.x, sp.y, sp.z, sp.yaw);
    const bot = new TourPilot(sp.yaw);
    const input = new Intent();
    const dt = 1 / 120;
    for (let i = 0; i < 80 / dt && !bot.finished; i++) {
      bot.drive(p, input, dt);
      input.latch();
      p.step(dt, input);
      bot.observe(p);
      p.events.length = 0;
    }
    process.stderr.write('\n' + bot.log.goals.map((g) => `${g.ok ? '✓' : '✗'} ${g.name} (${g.time}s)`).join('\n') + '\nvisited ' + bot.log.visited.join(',') + '\n');
    for (const g of bot.log.goals) expect(g.ok, g.name).toBe(true);
  });
});
