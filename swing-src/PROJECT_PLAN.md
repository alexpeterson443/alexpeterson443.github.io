# STRAND — Web-Swinging Traversal Prototype

An original third-person superhero traversal prototype. The hero ("Strand") swings through a
procedurally generated, dense modern district using a physics-driven web system.
Big-budget swinging games are used only as a *high-level* bar for feel (responsiveness, momentum,
camera polish). No proprietary code, assets, maps, animation, audio or UI is reproduced.

---

## 1. Environment inspection (Phase 1)

| Item | Finding |
|---|---|
| Machine | Cloud container, 4 vCPU Xeon @ 2.8 GHz, 15 GB RAM, **no GPU**, headless Linux |
| Engines | No Unreal, Unity or Godot installed; no display server |
| Toolchains | Node 22, npm 10, Python 3, Rust (cargo), g++, Playwright Chromium (SwiftShader software GL) |
| Repository | `alexpeterson443.github.io` — a GitHub Pages site of static sub-apps |

## 2. Engine decision

**Chosen: TypeScript + Three.js (WebGL2) + Vite, custom gameplay physics.**

Why:

1. **UE5 is not an option here.** It isn't installed, can't be installed without an Epic account,
   needs ~100 GB and a GPU to author, and can't be run or tested in a headless container. Code that can't be
   compiled, run and tested breaks this project's core rule ("compile, run, test, inspect logs at the
   end of every phase"). The same goes for Unity and Godot.
2. **The deployment target is a static website.** A browser build is instantly playable at
   `https://alexpeterson443.github.io/swing/` on any machine, with no installer.
3. **It is fully testable here.** Pure-TypeScript physics runs under Vitest in Node. The whole game runs
   headless in Chromium via Playwright, so scripted benchmark flights, screenshots, console logs and
   frame timings can be collected automatically.
4. **Custom physics is better than a general engine for this game.** A city is mostly axis-aligned
   boxes, so a purpose-built collision world (uniform spatial hash + swept-sphere vs AABB + ray casts) is
   exact, deterministic, allocation-free and much faster than a general rigid-body engine. The web rope is
   a custom constraint in any engine anyway. A WASM physics engine (Rapier) was considered and rejected:
   it would add a boundary crossing every step and give no benefit for boxes.
5. **Native code policy.** C++/Rust→WASM is allowed only if profiling shows a JS hot spot that can't be fixed
   algorithmically. The profiler is built in, so that decision is measured, not guessed.

Trade-offs accepted: WebGL2 has no hardware ray tracing, virtualized geometry or virtual shadow maps.
The nearest practical substitutes are used instead (see §7).

## 3. Architecture

```
swing-src/
  src/
    core/        fixed-timestep loop, math helpers, seeded RNG, tuning registry, profiler
    input/       keyboard / mouse (pointer lock) / gamepad → abstract intent
    world/       CollisionWorld: AABB store, spatial hash, raycast, sphere sweep & resolve, ledge probes
    city/        CityGenerator (deterministic seed → layout), road graph, lanes, sidewalks, props
    player/      PlayerBody, MovementStateMachine, one module per state
    web/         WebRope (constraint physics), AnchorSelector, TrajectoryPredictor, SwingAssist
    anim/        procedural rig, pose library, blend spaces, two-bone IK, look-at, lean, layers
    camera/      TraversalCamera (spring arm, collision, FOV, lag, look-ahead, roll, shake)
    render/      renderer setup, sky/atmosphere, facade shader, instancing, chunk culling, post FX
    ai/          Traffic (lane graph, IDM car following, signals), Pedestrians (sidewalk agents)
    audio/       WebAudio procedural synthesis: wind, web, footsteps, landing, ambience
    debug/       DebugDraw, HUD, dev panel (lil-gui), candidate score labels
    bench/       scripted input sequences + metric capture
  tests/         Vitest unit tests (physics, anchors, prediction, states, collision, generator)
  tools/         Playwright headless runner (bench, screenshots, log capture)
```

The simulation (world, player, web, city layout, AI) never imports Three.js scene objects, so it
runs the same in Node tests and in the browser. Rendering, animation, camera and audio only *read*
simulation state.

Frame flow: `input → fixed steps @120 Hz (movement state machine → forces → integrate → constraints →
collision) → AI (LOD-rate) → animation (variable dt, interpolated) → camera → audio → render`.

## 4. Physics model

Units are SI: meters, seconds, kilograms. Default mass m = 80 kg.

**Integration.** Semi-implicit (symplectic) Euler at a fixed 120 Hz step with an accumulator, with render
interpolation between steps: `a = ΣF / m`, `v ← v + a·dt`, `x ← x + v·dt`. Symplectic Euler keeps
pendulum energy bounded, which is essential for swinging. Explicit Euler would gain energy.

**Forces.** `F = m·g_eff + F_drag + F_input + F_assist`, where
* `g_eff = g · swingGravityScale` while swinging (a stylised heavier swing gives a snappier arc).
* `F_drag = −½ρ C_d A |v| v` (quadratic), with a separate dive profile (smaller A, larger v cap).
* `F_input` is the player's pumping or steering force, projected onto the tangent plane when swinging.

**Web rope.** It has an anchor `p`, a rest length `L` and a relative vector `r = x − p`, with `d = |r|` and `r̂ = r/d`.
* Radial velocity `v_r = v·r̂`. Tangential velocity `v_t = v − v_r r̂`.
* Slack (`d < L`): no force, so the player moves ballistically.
* Taut (`d ≥ L`): a stiff spring-damper models web elasticity, and a hard positional projection keeps the
  stretch at or below `maxStretch`. Outward radial velocity is removed (`v ← v − max(v_r,0)·r̂·(1+e)`, with a small
  restitution `e`). The player is never teleported.
* Tension is measured from the constraint: `T = m·Δv_r/dt + k·(d−L) + c·v_r`. The analytic pendulum value
  `T ≈ m(|v_t|²/L − g_eff·r̂)` is shown next to it in debug.
* Retraction: `L ← max(L_min, L − reelRate·dt)`. Reeling in while taut conserves angular momentum
  (`|v_t|·L` stays constant), so the tangential speed rises. This is the real physical "pump".
* Pumping: tangential input force is scaled by `cos` of the swing phase, so pushing on the down-swing
  adds energy and pushing on the up-swing only steers. This is how good timing gains speed.
* Release: the velocity is kept. A timing-graded release impulse is added along `v̂` and up. It peaks when the
  player releases 15–55° past the bottom of the arc.

**Assistance** (every assist is a force, never a position override, and each can be tuned or disabled):
ground-clearance lift (predictive), minimum-altitude rope shortening at attach, corner avoidance (a lateral
force from a trajectory probe), swing-plane nudge toward the input direction, forward-momentum preservation
(caps drag while swinging at speed), and speed limits (`maxNormalSpeed`, `maxDiveSpeed`, applied softly).

**Anchor selection.** Each shot runs a cone of ray casts (directions weighted by velocity, camera and
input) plus analytic points on the roof edges and facades of nearby buildings. Each candidate is simulated
forward for 0.5–2 s with the same integrator (the `TrajectoryPredictor`). Candidates are scored on:
distance, height above the player, alignment with the direction of travel / camera / input, predicted
minimum ground clearance, predicted collisions, line of sight, the street axis, alternation with the previous
anchor, and the side of any turn the player is asking for. The best playable trajectory wins. If there is no
geometry, no web fires. Debug mode draws every candidate and its score.

## 5. Movement state machine

Hierarchical: a `Locomotion` super-state (Grounded / Airborne / Landing) plus the traversal states
Swinging, WebZip, PointLaunch, WallRunning (vertical & horizontal), WallCrawling, Vaulting, Mantling,
Perching, Trick and Recovery. Each state implements `enter / exit / step / canInterrupt`. Transitions
are data-driven and checked in priority order, and every state can be interrupted by the next traversal input.
Animation reads `state`, the state's normalized time and the body kinematics, so a transition never
snaps: the rig cross-fades pose layers over a per-transition blend time.

## 6. Animation

A procedural humanoid rig (a 19-bone hierarchy) with no external clips. Poses are functions
`(params, phase) → local bone rotations`. These include locomotion blend spaces over speed (idle / walk / jog / run / sprint),
swing poses driven by centripetal acceleration and swing phase, release/flip montages, wall-run cycles,
crawl cycles, perch, landing and roll. On top of that: two-bone IK (web hand → anchor, feet → ground),
procedural lean from acceleration, velocity-aligned body orientation, a head look-at, additive breathing and
trails, and layered cross-fades with animation curves (ease functions). Physics owns the root. Animation only
adapts to it.

## 7. Rendering

WebGL2 PBR (`MeshStandardMaterial` / `MeshPhysicalMaterial`), HDR linear pipeline with ACES tone mapping,
physical sky with atmospheric scattering, a PMREM environment for reflections, and exponential height fog. There
is one cascaded-style directional shadow that follows the player (a texel-snapped ortho frustum). Facades use a
procedural window shader (world-space window grid, per-building variation, emissive interiors, fake parallax
depth, fresnel reflection). Post: bloom, SMAA, vignette and speed-driven radial blur. GPU instancing for
buildings/props/cars/pedestrians, chunked frustum culling, and distance LOD (impostor boxes for far
detail). Quality presets are Low / Medium / High / Ultra.

## 8. Performance targets

* 60 fps at 1080p on a mid-range integrated/discrete GPU at the "High" preset.
* Simulation (120 Hz) under 2 ms/frame. Anchor selection under 0.5 ms per shot.
* No per-frame allocations in the hot paths (pooled vectors, typed arrays).
* Headless (SwiftShader software GL on 4 CPU cores) is not representative of real GPUs. Benchmarks
  there track CPU frame time and relative regressions.

## 9. Milestones

The 17 phases from the brief are tracked in `PROGRESS.md`. Each phase ends with: typecheck + build,
unit tests, a headless run with console-log inspection and screenshots, and a commit.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Can't hand-play in the container | Scripted "bot" flights + numeric metrics (clearance, speed, state coverage) + screenshots |
| Software GL is slow / missing timer queries | CPU-side profiler; GPU timing uses `EXT_disjoint_timer_query_webgl2` when present |
| Swing feels on-rails from over-assist | Every assist is a force with its own tuning weight and a debug readout; tests confirm input changes the trajectory |
| Tunnelling at extreme speed | Sub-stepped swept sphere vs AABB; tests at 150 m/s |
| Scope | District first, polish traversal before secondary systems |
