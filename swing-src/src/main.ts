import './style.css';
import { Game } from './Game';
import { T } from './core/tuning';
import { facadeDebug } from './render/materials';
import type { Quality } from './render/PostFX';
import type { PilotStyle } from './bench/BotPilot';

const q = new URLSearchParams(location.search);
const app = document.getElementById('app')!;
const start = document.getElementById('start')!;

facadeDebug.value = Number(q.get('fdebug') ?? 0);

function boot(): void {
  try {
    const game = new Game(app, {
      seed: Number(q.get('seed') ?? 1337) || 1337,
      quality: (q.get('quality') as Quality) ?? (matchMedia('(max-width: 900px)').matches ? 'medium' : 'high'),
      bench: (q.get('bench') as PilotStyle | null) ?? null,
      benchSeconds: Number(q.get('seconds') ?? 20),
      debug: q.has('debug'),
      timeOfDay: q.has('tod') ? Number(q.get('tod')) : undefined,
    });
    Object.assign(window as object, { game, tuning: T });
    if (q.has('skin')) game.setSkin(Math.max(0, ['strand', 'classic'].indexOf((q.get('skin') ?? '').toLowerCase())));
    game.start();
    start.classList.add('hidden');
  } catch (e) {
    console.error(e);
    start.innerHTML = `<h1>STRAND</h1><p>WebGL2 is required. ${(e as Error).message}</p>`;
  }
}

if (q.has('bench') || q.has('autostart')) boot();
else start.addEventListener('click', boot, { once: true });
