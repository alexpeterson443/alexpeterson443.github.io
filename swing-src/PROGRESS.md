# Progress

Status of each phase from the brief. Every phase ended with typecheck, build, tests, a headless
Chromium run with its console log inspected, and a commit.

| # | Phase | Status | Evidence |
|---|---|---|---|
| 1 | Environment + engine | ✅ | No GPU or native engine on the machine; TS + Three.js chosen (PROJECT_PLAN.md §2) |
| 2 | Graybox city with collision | ✅ | `CityGenerator`, `buildCollision`, spatial-hash `CollisionWorld`; `collision.test.ts` |
| 3 | Character controller | ✅ | Walk/jog/sprint with momentum-turning, variable jump, super jump, coyote time, jump buffer, step-up |
| 4 | Physics web attachment | ✅ | `WebRope`: constraint, elastic stretch, catch window, measured tension |
| 5 | Pendulum swinging | ✅ | Energy drift < 0.01% over 12 s; period within 2% of 2π√(L/g); tension within 8% of m(v²/L+g) |
| 6 | Swing input + momentum | ✅ | Phase-dependent pumping, steering, graded release boost; test that input changes the trajectory |
| 7 | Anchor selection | ✅ | Ray fan + edge/facade candidates, 14 score terms, forward simulation of the top 8, debug draw |
| 8 | Camera | ✅ | Lag, look-ahead, speed FOV/distance, roll, auto-recenter, collision pull-in, landing dip, shake |
| 9 | Wall run / crawl | ✅ | Vertical and horizontal runs, inner and outer corner wrap, crawl, wall jump, over-the-top mantle |
| 10 | Zip + point launch | ✅ | Perch-point targeting with reticle, forward zip, point launch, perching, leap from perch |
| 11 | Animation | ✅ | Procedural 19-joint rig, locomotion blend space, state cross-fades, physics-driven root orientation, two-bone IK, look-at |
| 12 | Traversal chaining | ✅ | `tour.test.ts` plays the success scenario end to end in Node and in Chromium |
| 13 | Procedural city tools | ✅ | Seeded parameters (blocks, roads, alleys, heights, setbacks, roofs, facade, props); dev-panel regenerate |
| 14 | Rendering polish | ✅ | PBR, physical sky + IBL, shadows, procedural facades with night windows, bloom, SMAA, speed blur |
| 15 | Traffic / pedestrians | ✅ | Lane graph, signals, IDM car-following, sidewalk agents that react to the player; LOD; `ai.test.ts` |
| 16 | Audio | ✅ | Procedural Web Audio: wind that follows speed, web sounds, tension, footsteps, landings, city/traffic/crowd |
| 17 | Optimisation + tuning | 🔁 ongoing | Numbers below; bot flights used as the tuning harness |

## Measurements

These come from the 4-core cloud container. Headless Chromium uses SwiftShader, which renders on the CPU, so fps here is not representative of a real GPU.

| Metric | Value |
|---|---|
| Simulation (120 Hz), browser | ~0.5 ms per frame |
| Anchor selection per shot | < 3 ms (Node test bound), typically ~1 ms |
| Traffic (220 cars) + pedestrians (600), per tick | 0.09 ms Node, ~0.2 ms browser |
| City build (seed 1337) | ~200 ms: 260 buildings, 355 tiers, 2148 props, 2443 colliders |
| Draw calls / instances | ~160 draws per frame including shadows; 6.8k static instances |
| Bundle | 790 KB JS (240 KB gzip) |
| Bot swing chain, avenue, 11 s | ~46 m/s average, 0 street touches, 0 wall hits, release quality 100% |

## Known gaps / next steps

- Nobody has played it by hand yet. Feel was tuned with scripted bots and numeric traces, so hands-on tuning of the dev-panel weights is the obvious next step.
- There is no foot IK against uneven ground: surfaces are flat roofs and streets, so feet are placed by the poses.
- There is no GPU occlusion culling or HLOD. Buildings are culled per 160 m chunk and AI per instance. At this district size fog and the far plane cover distant detail.
- GPU timing (`EXT_disjoint_timer_query_webgl2`) is shown in the stats HUD where the browser supports it; SwiftShader's numbers are meaningless.
- The character is built from primitives (an original placeholder design) rather than a skinned mesh.

## Update: on a real GPU (Apple M5), 24 Sep 2026

Continued on a Mac with a GPU. Measurements below are from installed Chrome on Metal and from the
desktop app, not SwiftShader.

| Area | What changed |
|---|---|
| Swing feel | Arc-phase release and swing jump (bottom → forward, late → up, timed perfect window); heading held with no stick; steering against momentum costs speed; Swing Assist 0–10; cruise ~30 m/s, dive-catch peaks ~58 m/s. Research notes in `docs/TRAVERSAL_REFERENCE.md`. |
| Web physics | Rigid rope while swinging (the elastic band bottomed out at 8–13 g and its slack take-up ratcheted the rope length); **soft catch**: a fresh web pays out up to 3.5 m and brakes evenly (≈4–5 g) instead of stopping the body in one 1/120 s step (80–120 g). Anchors capped at 75 m and penalised for sideways offset. Two assists that could hold a body in the air (ground avoidance at low speed, a swing-plane correction feeding back through the measured tension) fixed. |
| Camera / animation | Speed FOV and distance, web-attach FOV heartbeat, arc-following pitch, dive tilt, turn roll, auto-follow; pivot kept out of walls (wall-run camera no longer collapses); leg tuck follows the swing's own jump window. |
| Look | Keyframed time-of-day looks, analytic sky with stars and moon, aerial + height fog shared by every material, near + static far shadow cascade, AgX + two-stage grade; interior-mapped facades with seven archetypes and storefronts; skyline ring, far streets, harbour water, bridge; new hero suit (plus a red-and-blue "Classic" suit, K), silk web strand, speed streaks, HUD. |
| Controls | Enter also swings. Controls card sits top-left and fades once you move (H). |
| Performance | Dynamic resolution driven by missed frames. Desktop app full screen on the M5's 120 Hz display: ~119 fps, 8.3 ms median / 9.3 ms p99 frame time. |
| Desktop app | `swing-src/desktop`: Electron shell (`npm run build` there builds, ad-hoc signs and installs `/Applications/Strand.app`). |

Tests: 67, all passing (new swing-feel, web-catch and horizon-layout suites).
