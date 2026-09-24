# Strand

An original, physics-driven third-person web-swinging prototype set in a procedurally generated
city district. Play it at **https://alexpeterson443.github.io/swing/**. It needs WebGL2, a mouse and keyboard or a gamepad, and headphones help.

The design, engine decision and physics model are in [PROJECT_PLAN.md](PROJECT_PLAN.md). Phase-by-phase status and measurements are in [PROGRESS.md](PROGRESS.md).

## Controls

| Action | Keyboard / mouse | Gamepad |
|---|---|---|
| Move | WASD / arrows (hold Alt to walk) | Left stick |
| Camera | Mouse (click to lock pointer) | Right stick |
| Jump: tap, or hold for a higher jump. Hold while standing still to charge a super jump | Space | A |
| Swing / sprint / wall-run / auto-parkour (hold) | Shift or right mouse | RT |
| Web zip; when a ◇ point is targeted, zip to it and press jump on arrival to point-launch | E or left mouse | RB |
| Dive (hold); holding longer becomes a fast dive | Q | LB |
| Aerial trick (stick direction picks it) | F | Y |
| Drop from a wall or perch | C | B |
| Reel in the web | R | – |
| Dev panel · debug draw · help · mute · time of day · pause · respawn | `` ` `` · G · H · M · T · P · Backspace | – |

URL options: `?seed=42` (city), `?quality=low|medium|high|ultra`, `?debug` (stats on), `?bench=tour|swing|swingTurn|diveCatch|parkour&seconds=20` (scripted benchmark; the result is logged as `BENCH_RESULT {…}`).

## How the swinging works

1. **Anchor selection** (`src/web/AnchorSelector.ts`). A fan of ray casts plus analytic points on the roof edges and facades of nearby buildings make the candidates. Each is filtered for distance, elevation, cone, line of sight and a speed-scaled minimum rope length. It is then scored on distance, height, travel direction, camera, input, turn side, street offset, swing plane, continuity and visibility. The best 8 are **forward-simulated** 1.6 s with the gameplay integrator, and that adds clearance and speed-gain terms. A web that would hit geometry within 0.5 s is rejected. If no geometry is in reach, no web fires.
2. **Rope physics** (`src/web/WebRope.ts`, `src/web/SwingModel.ts`). Forces: `F = m·g·s + drag + pump + steer + assists + spring`, integrated as `a = F/m`. The taut constraint `|x−p| ≤ L` projects position and removes outward radial velocity. A fresh catch loses energy (except for a tunable redirect window). Continuous contact is energy-consistent, so the rope does no work. Tension is measured from the constraint impulse and the spring, and the analytic `m(v²/L − g·r̂)` is shown next to it. Slack is taken up automatically, so webs never hang loose.
3. **Assists are forces, never position overrides.** They cover predictive ground clearance, auto-shortening against the ground under the arc bottom, the swing plane (it cancels most of the sideways rope pull, so a facade anchor swings you down the street rather than into the wall), corner avoidance, turn assist and forward momentum. Each one has a weight in the dev panel.
4. **Timing matters.** Pushing on the down-swing pumps energy, while the up-swing only steers. The release boost is graded by angle past the bottom and by swing age.

## Development

```bash
cd swing-src
npm install
npm run dev            # local dev server
npm test               # 59 tests: physics, collision, anchors, prediction, states, city, AI, audio, bot flights, full tour
npm run build          # typecheck + build into ../swing (commit it; GitHub Pages serves it)
node tools/run-bench.mjs bench=tour seconds=60 quality=medium   # headless Chromium run: errors, screenshots, BENCH_RESULT
```

Source layout: `core/` (tuning registry, math, RNG, profiler), `input/`, `world/` (collision), `city/`
(generator, collision build, spawn), `player/` (body + one module per state group), `web/` (rope, swing
forces, anchors, prediction), `anim/` (rig, poses, IK, animator), `camera/`, `render/`, `ai/`
(traffic and pedestrians), `audio/`, `debug/`, `bench/` (bot pilots).

All art, audio and animation are generated procedurally in code. No third-party game assets are used.
