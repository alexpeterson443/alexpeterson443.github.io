import './style.css';
import { Game } from './Game';
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
    });
    (window as unknown as { game: Game }).game = game;
    game.start();
    start.classList.add('hidden');
  } catch (e) {
    console.error(e);
    start.innerHTML = `<h1>STRAND</h1><p>WebGL2 is required. ${(e as Error).message}</p>`;
  }
}

if (q.has('bench') || q.has('autostart')) boot();
else start.addEventListener('click', boot, { once: true });
