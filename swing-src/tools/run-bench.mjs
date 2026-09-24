// Headless runtime check + benchmark. Serves the production build, drives it in Chromium
// (SwiftShader software GL in the container, the real GPU on a dev machine), captures console output/errors, screenshots, and BENCH_RESULT.
//
//   node tools/run-bench.mjs [bench=swing] [seconds=12] [quality=medium] [shots=4] [w=1280] [h=720] [states=1]
// states=1 also saves one screenshot per movement state (bench-out/<bench>-state-<State>.png).
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; }));
const bench = args.bench ?? 'swing';
const seconds = Number(args.seconds ?? 12);
const quality = args.quality ?? 'medium';
const shots = Number(args.shots ?? 4);
const W = Number(args.w ?? 1280), H = Number(args.h ?? 720);
const extra = args.extra ?? '';
const root = resolve(new URL('../../swing', import.meta.url).pathname);
const out = resolve(new URL('../bench-out', import.meta.url).pathname);
await mkdir(out, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = join(root, decodeURIComponent(url.pathname));
  if (p.endsWith('/')) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
  res.end(await readFile(p));
}).listen(0);
const port = server.address().port;

// Linux CI container: bundled Chromium on SwiftShader. Elsewhere (a dev Mac): installed Chrome on
// the real GPU, which is the only place frame times mean anything.
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'].find(existsSync);
const common = ['--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'];
const browser = exe
  ? await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...common] })
  : await chromium.launch({ channel: 'chrome', headless: args.headed !== '1', args: ['--use-angle=metal', ...common] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const logs = [];
const errors = [];
page.on('console', (m) => { logs.push(`[${m.type()}] ${m.text()}`); if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}\n${e.stack}`));

const url = `http://localhost:${port}/?bench=${bench}&seconds=${seconds}&quality=${quality}${extra ? '&' + extra : ''}`;
console.log('open', url);
await page.goto(url);
const t0 = Date.now();
let result = null;
let shot = 0;
const interval = (seconds * 1000) / Math.max(1, shots);
let nextShot = 1500;
const stateShots = new Set();
while (Date.now() - t0 < seconds * 1000 * 12 + 30000) {
  await page.waitForTimeout(250);
  const el = Date.now() - t0;
  if (shot < shots && el > nextShot) {
    await page.screenshot({ path: join(out, `${bench}-${shot}.png`) });
    shot++;
    nextShot += interval;
  }
  if (args.states === '1') {
    // one screenshot per movement state, taken once it has lasted a moment (for pose/camera review)
    const st = await page.evaluate(() => { const p = window.game?.player; return p ? `${p.state}|${p.stateTime.toFixed(2)}` : null; });
    if (st) {
      const [name, t] = st.split('|');
      // up to three shots per state: just in, settled, and well into it
      for (const [k, at] of [[0, 0.25], [1, 0.9], [2, 2.0]]) {
        const key = `${name}-${k}`;
        if (Number(t) > at && !stateShots.has(key)) {
          stateShots.add(key);
          await page.screenshot({ path: join(out, `${bench}-state-${name}-${k}.png`) });
          break;
        }
      }
    }
  }
  result = await page.evaluate(() => window.__benchResult ?? null);
  if (result) break;
  if (errors.length > 5) break;
}
await page.screenshot({ path: join(out, `${bench}-final.png`) });
await writeFile(join(out, `${bench}-log.txt`), logs.join('\n'));
console.log(logs.filter((l) => !l.includes('BENCH_RESULT')).slice(0, 40).join('\n'));
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
console.log('RESULT', JSON.stringify(result, null, 1));
await browser.close();
server.close();
process.exit(errors.length || !result ? 1 : 0);
