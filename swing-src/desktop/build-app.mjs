// Build Strand.app for this Mac and install it to /Applications.
//   cd swing-src/desktop && npm run build            (add --no-install to only build)
import { packager } from '@electron/packager';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });

// 1. fresh web build (swing-src → ../swing)
run('npm', ['run', 'build'], { cwd: join(here, '..') });
const web = join(here, '..', '..', 'swing');
if (!existsSync(join(web, 'index.html'))) throw new Error('web build missing');

// 2. stage the game files as Resources/game
const stage = join(here, 'game-stage', 'game');
rmSync(join(here, 'game-stage'), { recursive: true, force: true });
cpSync(web, stage, { recursive: true });

// 3. package
const [appDir] = await packager({
  dir: here,
  name: 'Strand',
  executableName: 'Strand',
  platform: 'darwin',
  arch: process.arch === 'arm64' ? 'arm64' : 'x64',
  icon: join(here, 'assets', 'Strand.icns'),
  appBundleId: 'io.github.alexpeterson443.strand',
  appCategoryType: 'public.app-category.action-games',
  appCopyright: 'Strand: an original web-swinging game',
  darwinDarkModeSupport: true,
  extraResource: [stage],
  out: join(here, 'out'),
  overwrite: true,
  prune: true,
  ignore: [/^\/out($|\/)/, /^\/game-stage($|\/)/, /^\/assets($|\/)/, /^\/build-app\.mjs$/],
});
const app = join(appDir, 'Strand.app');

// 4. ad-hoc sign the whole bundle (Apple Silicon refuses to run unsigned code; this is a local build)
run('codesign', ['--force', '--deep', '--sign', '-', app]);
run('codesign', ['--verify', '--deep', '--strict', app]);
console.log(`built ${app}`);

// 5. install
if (!process.argv.includes('--no-install')) {
  const dest = '/Applications/Strand.app';
  rmSync(dest, { recursive: true, force: true });
  run('ditto', [app, dest]);
  console.log(`installed ${dest}`);
}
rmSync(join(here, 'game-stage'), { recursive: true, force: true });
