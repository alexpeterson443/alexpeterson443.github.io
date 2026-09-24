import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace, Scene, Vector3, WebGLRenderer } from 'three';
import { T } from './core/tuning';
import { clamp, hlen, smoothstep } from './core/math';
import { profiler } from './core/profiler';
import { generateCity, type CityLayout } from './city/CityGenerator';
import { buildCollision } from './city/buildCollision';
import { findSpawn } from './city/spawn';
import type { CollisionWorld } from './world/CollisionWorld';
import { Intent } from './input/Intent';
import { InputManager } from './input/InputManager';
import { Player } from './player/Player';
import { TraversalCamera, type CameraFrame } from './camera/TraversalCamera';
import { Environment } from './render/Environment';
import { CityRenderer } from './render/CityRenderer';
import { PostFX, type Quality } from './render/PostFX';
import { WebLine } from './render/WebLine';
import { Rig } from './anim/Rig';
import { Animator, type AnimFrame } from './anim/Animator';
import { AudioSystem, type AudioFrame } from './audio/AudioSystem';
import { AISystem } from './ai/AISystem';
import { DebugDraw } from './debug/DebugDraw';
import { Hud } from './debug/Hud';
import { DevPanel, type DebugFlags, type PanelHooks } from './debug/DevPanel';
import { GpuTimer } from './debug/GpuTimer';
import { BotPilot, type PilotStyle } from './bench/BotPilot';
import { TourPilot } from './bench/TourPilot';
import { makePrediction, predict } from './web/TrajectoryPredictor';

export interface GameOptions {
  seed: number;
  quality: Quality;
  bench: PilotStyle | null;
  benchSeconds: number;
  debug: boolean;
}

interface BenchState {
  bot: BotPilot;
  tour: TourPilot | null;
  frames: number[];
  sim: number[];
  render: number[];
  t: number;
  seconds: number;
  name: PilotStyle;
}

/** Composition root: owns every system and runs the frame. */
export class Game {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  city!: CityLayout;
  world!: CollisionWorld;
  player!: Player;
  private cityView!: CityRenderer;
  readonly env: Environment;
  readonly cam: TraversalCamera;
  readonly post: PostFX;
  readonly input: InputManager;
  readonly intent = new Intent();
  readonly rig = new Rig();
  readonly anim = new Animator(this.rig);
  readonly audio = new AudioSystem();
  ai: AISystem | null = null;
  readonly web: WebLine;
  readonly zipWeb: WebLine;
  readonly debug: DebugDraw;
  readonly hud: Hud;
  readonly panel: DevPanel;
  readonly gpu: GpuTimer;
  private acc = 0;
  private last = 0;
  private fps = 60;
  private frameMs = 16;
  private simTime = 0;
  private bench: BenchState | null = null;
  private readonly renderPos = new Vector3();
  private readonly _v = new Vector3();
  private readonly _w = new Vector3();
  private readonly pred = makePrediction(160);
  private hudTimer = 0;
  private stepsLastFrame = 0;
  readonly flags: DebugFlags = {
    velocity: false, acceleration: false, tension: false, anchor: true, candidates: false, scores: false,
    trajectory: false, collision: false, forces: false, stats: false,
  };
  private hooks: PanelHooks;
  private quality: Quality;
  private timeScale = 1;
  private paused = false;

  constructor(private container: HTMLElement, opts: GameOptions) {
    this.renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.info.autoReset = false; // composer renders several passes; count the whole frame
    container.appendChild(this.renderer.domElement);
    this.gpu = new GpuTimer(this.renderer.getContext() as WebGL2RenderingContext);
    this.cam = new TraversalCamera(1);
    this.env = new Environment(this.scene, this.renderer);
    this.post = new PostFX(this.renderer, this.scene, this.cam.camera);
    this.quality = opts.quality;
    this.input = new InputManager(this.renderer.domElement);
    this.scene.add(this.rig.root);
    this.web = new WebLine(this.scene);
    this.zipWeb = new WebLine(this.scene);
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    container.appendChild(overlay);
    this.debug = new DebugDraw(this.scene, overlay);
    this.hud = new Hud(container);
    this.flags.stats = opts.debug;
    this.debug.enabled = opts.debug;
    this.hooks = {
      flags: this.flags,
      env: { timeOfDay: this.env.timeOfDay, bloom: 0.55 },
      quality: { preset: this.quality },
      ai: { cars: true, pedestrians: true },
      audio: { volume: 0.8, muted: false },
      sim: { timeScale: 1, paused: false },
      seed: opts.seed,
      onTime: () => { this.env.timeOfDay = this.hooks.env.timeOfDay; this.env.apply(); this.updateLights(); },
      onQuality: () => this.setQuality(this.hooks.quality.preset as Quality),
      onAI: () => this.ai?.setEnabled(this.hooks.ai.cars, this.hooks.ai.pedestrians),
      onAudio: () => { this.audio.masterVolume = this.hooks.audio.volume; this.audio.muted = this.hooks.audio.muted; },
      onBloom: () => this.post.setBloom(this.hooks.env.bloom),
      respawn: () => this.spawn(),
      regenerate: (seed) => { const u = new URL(location.href); u.searchParams.set('seed', String(seed)); location.href = u.toString(); },
      bench: (name) => this.startBench(name as PilotStyle, 20),
    };
    this.panel = new DevPanel(this.hooks);
    this.buildWorld(opts.seed);
    this.setQuality(this.quality);
    window.addEventListener('resize', () => this.resize());
    this.resize();
    const startAudio = () => this.audio.start();
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('keydown', startAudio);
    if (opts.bench) this.startBench(opts.bench, opts.benchSeconds);
  }

  private buildWorld(seed: number): void {
    const t0 = performance.now();
    this.city = generateCity({ seed });
    this.world = buildCollision(this.city);
    this.player = new Player(this.world, this.city);
    this.cityView = new CityRenderer(this.city);
    this.cityView.addTo(this.scene);
    this.ai = new AISystem(this.city, this.scene, { seed });
    this.updateLights();
    this.spawn();
    console.info(`[strand] city seed ${seed}: ${this.city.stats.buildings} buildings, ${this.city.stats.tiers} tiers, ${this.city.stats.props} props, ` +
      `${this.world.count} colliders, ${this.cityView.drawCalls} draws, ${this.cityView.instances} instances, built in ${(performance.now() - t0).toFixed(0)} ms`);
  }

  private updateLights(): void {
    this.ai?.setLightIntensity(0.4 + 2.6 * nightOf(this.env.timeOfDay));
  }

  /** Spawn on a mid-height rooftop near the downtown core, looking up an avenue. */
  spawn(): void {
    const sp = findSpawn(this.city);
    this.player.spawn(sp.x, sp.y, sp.z, sp.yaw);
    this.player.fsm.reset('Airborne');
    this.cam.snapTo(this.player.pos, sp.yaw);
    this.cam.pitch = -0.12;
  }

  setQuality(q: Quality): void {
    this.quality = q;
    const pr = Math.min(window.devicePixelRatio || 1, q === 'ultra' ? 2 : q === 'high' ? 1.5 : q === 'medium' ? 1 : 0.75);
    this.renderer.setPixelRatio(pr);
    this.env.setShadowQuality(q === 'ultra' ? 4096 : q === 'high' ? 2048 : 1024, q !== 'low');
    this.renderer.shadowMap.enabled = q !== 'low';
    this.post.setQuality(q);
    this.resize();
  }

  private resize(): void {
    const w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.post.setSize(w, h);
    this.cam.camera.aspect = w / h;
    this.cam.camera.updateProjectionMatrix();
  }

  startBench(name: PilotStyle, seconds: number): void {
    this.spawn();
    this.player.vel.set(0, 0, -15);
    this.cam.yaw = 0;
    const sp = findSpawn(this.city);
    const tour = name === 'tour' ? new TourPilot(sp.yaw) : null;
    if (tour) this.player.vel.set(0, 0, 0);
    this.bench = { bot: new BotPilot(name, 0), tour, frames: [], sim: [], render: [], t: 0, seconds, name };
    this.hud.flash(`BENCH ${name} (${seconds}s)`);
    this.hud.hideHelp();
    console.info(`[strand] bench ${name} started`);
  }

  start(): void {
    this.last = performance.now();
    const loop = (now: number) => {
      requestAnimationFrame(loop);
      this.frame(now);
    };
    requestAnimationFrame(loop);
  }

  /** One rendered frame. */
  frame(now: number): void {
    const rawDt = (now - this.last) / 1000;
    this.last = now;
    const dt = clamp(rawDt, 0.0005, 0.1);
    this.fps += (1 / Math.max(1e-3, rawDt) - this.fps) * 0.05;
    this.frameMs += (rawDt * 1000 - this.frameMs) * 0.05;
    profiler.begin('frame');
    this.handleUIKeys();

    // --- input & camera look ---
    const pad = this.input.fill(this.intent);
    const sens = T.camera.sensitivity;
    this.cam.look(this.input.lookDX * sens + pad.padLookX * 3.2 * dt, this.input.lookDY * sens + pad.padLookY * 2.4 * dt);
    this.input.lookDX = this.input.lookDY = 0;
    if (this.bench) this.cam.yaw = this.intent.camYaw;
    this.intent.camYaw = this.cam.yaw;
    this.intent.camPitch = this.cam.pitch;
    this.intent.camForward.copy(this.cam.forward.lengthSq() > 0 ? this.cam.forward : this._v.set(0, 0, -1));

    // --- fixed-step simulation ---
    profiler.begin('sim');
    const h = 1 / T.physics.fixedHz;
    this.paused = this.hooks.sim.paused;
    this.timeScale = this.hooks.sim.timeScale;
    if (!this.paused) this.acc += dt * this.timeScale;
    let steps = 0;
    const p = this.player;
    while (this.acc >= h && steps < 10) {
      if (this.bench) {
        if (this.bench.tour) this.bench.tour.drive(p, this.intent, h);
        else this.bench.bot.drive(p, this.intent, h);
        this.cam.yaw = this.intent.camYaw;
      }
      this.intent.latch();
      p.step(h, this.intent);
      this.handleEvents();
      if (this.bench) {
        this.bench.tour?.observe(p);
        this.bench.bot.observe(p, h);
      }
      this.acc -= h;
      this.simTime += h;
      steps++;
    }
    if (steps === 10) this.acc = 0; // spiral-of-death guard
    this.stepsLastFrame = steps;
    const simMs = profiler.end('sim');
    const alpha = this.acc / h;
    this.renderPos.lerpVectors(p.prevPos, p.pos, alpha);

    // --- animation, camera, world systems ---
    profiler.begin('anim');
    const af = this.animFrame();
    this.anim.update(dt, af);
    for (const s of this.anim.steps) {
      const e = { type: s.wall ? 'wallStep' as const : 'footstep' as const, a: s.speed, pos: this.renderPos };
      this.audio.onEvent(e, this.audioFrame());
    }
    profiler.end('anim');
    profiler.begin('camera');
    this.cam.update(dt, this.cameraFrame(), this.world);
    profiler.end('camera');
    this.env.followShadow(this.renderPos);
    this.env.update(dt);
    profiler.begin('ai');
    this.ai?.update(dt, { pos: this.renderPos, vel: p.vel }, this.cam.camera);
    profiler.end('ai');
    this.updateWebs(dt);
    const speed = p.vel.length();
    this.post.setSpeed(smoothstep(30, 85, speed) * 0.9);
    const af2 = this.audioFrame();
    this.audio.update(dt, af2);
    if (this.ai) for (const honk of this.ai.drainHonks()) this.audio.honk(Math.hypot(honk.x - this.cam.camera.position.x, honk.z - this.cam.camera.position.z));

    // --- debug & HUD ---
    this.drawDebug();
    this.updateHud(dt, simMs);

    // --- render ---
    profiler.begin('render');
    this.renderer.info.reset();
    this.gpu.begin();
    this.post.render(this.scene, this.cam.camera, dt);
    this.gpu.end();
    const rMs = profiler.end('render');
    profiler.end('frame');
    this.tickBench(dt, simMs, rMs);
  }

  private handleUIKeys(): void {
    const i = this.input;
    if (i.consume('Backquote') || i.consume('F1')) this.panel.toggle();
    if (i.consume('KeyG')) { this.debug.enabled = !this.debug.enabled; this.flags.stats = this.debug.enabled; this.flags.candidates = this.debug.enabled; this.flags.scores = this.debug.enabled; this.flags.trajectory = this.debug.enabled; this.flags.velocity = this.debug.enabled; }
    if (i.consume('KeyH')) this.hud.toggleHelp();
    if (i.consume('KeyM')) { this.audio.muted = !this.audio.muted; this.hud.flash(this.audio.muted ? 'muted' : 'sound on'); }
    if (i.consume('KeyT')) {
      const presets = [0.3, 0.5, 0.71, 0.78, 0.9];
      const idx = presets.findIndex((x) => x > this.env.timeOfDay + 0.01);
      this.env.timeOfDay = presets[idx < 0 ? 0 : idx];
      this.hooks.env.timeOfDay = this.env.timeOfDay;
      this.env.apply();
      this.updateLights();
    }
    if (i.consume('KeyP')) this.hooks.sim.paused = !this.hooks.sim.paused;
    if (i.consume('Backspace')) this.spawn();
    i.pressedOnce.clear();
  }

  private handleEvents(): void {
    const p = this.player;
    if (!p.events.length) return;
    const af = this.audioFrame();
    for (const e of p.events) {
      this.audio.onEvent(e, af);
      switch (e.type) {
        case 'hardLand':
          this.cam.addTrauma(0.55);
          this.cam.landingDip(e.a);
          this.ai?.notifyImpact(e.pos.x, e.pos.z, 1);
          break;
        case 'roll':
          this.cam.addTrauma(0.15);
          this.cam.landingDip(e.a * 0.6);
          this.ai?.notifyImpact(e.pos.x, e.pos.z, 0.5);
          break;
        case 'land':
          this.cam.landingDip(e.a * 0.5);
          if (e.a > 8) this.ai?.notifyImpact(e.pos.x, e.pos.z, 0.25);
          break;
        case 'superJump':
        case 'pointLaunch':
          this.cam.addTrauma(0.12);
          break;
        case 'webFire':
          this.web.fire();
          break;
        case 'webRelease':
          if (e.a > 0.85) this.hud.flash('perfect release');
          break;
        default:
          break;
      }
    }
    if (!this.bench) p.events.length = 0;
  }

  private animFrame(): AnimFrame {
    const p = this.player;
    return (this._af ??= {
      pos: this.renderPos, vel: p.vel, acc: p.accSmooth, state: p.state, stateTime: p.stateTime, facing: p.facing,
      ropeActive: false, anchor: p.rope.anchor, swingAngle: 0, tension: 0, zipTarget: p.zipWebPoint,
      wallNormal: p.wallNormal, wallMode: 'vertical', trickKind: 0, landingImpact: 0, diving: false, jumpCharge: 0,
      releaseQuality: 0, camForward: this.cam.forward,
    }, Object.assign(this._af, {
      state: p.state, stateTime: p.stateTime, facing: p.facing, ropeActive: p.rope.active, swingAngle: p.rope.swingAngle,
      tension: p.rope.tension, wallMode: p.wallMode, trickKind: p.trickKind, landingImpact: p.landingImpact,
      diving: this.intent.dive && (p.state === 'Airborne' || p.state === 'Trick'), jumpCharge: p.jumpCharge, releaseQuality: p.releaseQuality,
    }));
  }
  private _af: AnimFrame | null = null;

  private cameraFrame(): CameraFrame {
    const p = this.player;
    return (this._cf ??= {
      pos: this.renderPos, vel: p.vel, acc: p.accSmooth, state: p.state, wallNormal: p.wallNormal, wallMode: 'vertical',
      ropeActive: false, anchor: p.rope.anchor, diving: false,
    }, Object.assign(this._cf, { state: p.state, wallMode: p.wallMode, ropeActive: p.rope.active, diving: this.intent.dive && p.state === 'Airborne' }));
  }
  private _cf: CameraFrame | null = null;

  private audioFrame(): AudioFrame {
    const p = this.player;
    const cp = this.cam.camera.position;
    const dens = this.ai ? this.ai.densityNear(cp.x, cp.z) : { traffic: 0, crowd: 0 };
    return (this._aud ??= {
      speed: 0, verticalSpeed: 0, altitude: 0, state: '', ropeActive: false, ropeTension: 0, diving: false,
      camPos: cp, camForward: this.cam.forward, nearbyTraffic: 0, nearbyCrowd: 0, timeOfDay: 0.7,
    }, Object.assign(this._aud, {
      speed: p.vel.length(), verticalSpeed: p.vel.y, altitude: p.feetY, state: p.state, ropeActive: p.rope.active,
      ropeTension: p.rope.tension, diving: this.intent.dive && p.state === 'Airborne', nearbyTraffic: dens.traffic,
      nearbyCrowd: dens.crowd, timeOfDay: this.env.timeOfDay,
    }));
  }
  private _aud: AudioFrame | null = null;

  private updateWebs(dt: number): void {
    const p = this.player;
    const cam = this.cam.camera;
    if (p.rope.active && p.state === 'Swinging') {
      const hand = this.anim.webHandPosition(this._v);
      const taut = clamp((p.rope.distance - p.rope.length + 1.5) / 1.5, 0, 1);
      this.web.update(dt, cam, hand, p.rope.anchor, taut, p.rope.tension);
    } else this.web.update(dt, cam, null, p.rope.anchor, 1, 0);
    if (p.state === 'WebZip') {
      this.rig.handR.getWorldPosition(this._w);
      this.zipWeb.update(dt, cam, this._w, p.zipWebPoint, 1, 0);
    } else this.zipWeb.update(dt, cam, null, p.zipWebPoint, 1, 0);

    // point-launch reticle
    const pt = p.perchTarget;
    if (pt && p.state !== 'WebZip' && p.state !== 'Perching') {
      const v = this._w.set(pt.x, pt.y, pt.z).project(cam);
      if (v.z < 1) this.hud.setReticle(((v.x + 1) / 2) * this.container.clientWidth - 9, ((1 - v.y) / 2) * this.container.clientHeight - 9);
      else this.hud.setReticle(null);
    } else this.hud.setReticle(null);
  }

  private drawDebug(): void {
    const d = this.debug;
    d.begin();
    if (!d.enabled) { d.end(); return; }
    const p = this.player, f = this.flags, cam = this.cam.camera;
    const o = this.renderPos;
    if (f.velocity) d.arrow(o, p.vel, 0.12, 0x00ff66);
    if (f.acceleration) d.arrow(o, p.accSmooth, 0.03, 0xffaa00);
    if (p.rope.active && f.anchor) {
      d.cross(p.rope.anchor, 0.8, 0xff3355);
      if (f.tension) {
        const c = clamp(p.rope.tension / 8000, 0, 1);
        d.line(o, p.rope.anchor, (Math.round(255 * c) << 16) | (Math.round(255 * (1 - c)) << 8));
        d.label(this._v.copy(o).lerp(p.rope.anchor, 0.5), `T ${(p.rope.tension / 1000).toFixed(1)} kN`, cam, '#ffd');
      }
    }
    if (f.forces && p.state === 'Swinging') {
      const s = p.swingDbg;
      d.arrow(o, s.pump, 0.004, 0x33ccff);
      d.arrow(o, s.steer, 0.004, 0xcc66ff);
      d.arrow(o, s.assist, 0.004, 0xffff33);
      d.arrow(o, s.drag, 0.004, 0xff6666);
    }
    const sel = p.anchors;
    if (f.candidates) {
      let best = -Infinity, worst = Infinity;
      for (let i = 0; i < sel.count; i++) {
        const c = sel.candidates[i];
        if (c.valid) { best = Math.max(best, c.score); worst = Math.min(worst, c.score); }
      }
      for (let i = 0; i < sel.count; i++) {
        const c = sel.candidates[i];
        const k = c.valid ? (c.score - worst) / Math.max(1e-3, best - worst) : 0;
        const color = !c.valid ? 0x555555 : c === sel.best ? 0xffffff : (Math.round(255 * (1 - k)) << 16) | (Math.round(255 * k) << 8) | 0x20;
        d.cross(c.point, c === sel.best ? 0.9 : 0.4, color);
        if (f.scores && c.valid) d.label(c.point, c.score.toFixed(2) + (c.collided ? ' ✗' : ''), cam, c === sel.best ? '#fff' : '#bbb');
      }
      for (let i = 0; i < sel.predictionCount; i++) {
        const pr = sel.predictions[i];
        for (let k = 1; k < pr.count; k++) d.line(pr.points[k - 1], pr.points[k], pr.collided ? 0x884444 : 0x446688);
      }
    }
    if (f.trajectory) {
      const pr = predict(p.pos, p.vel, p.rope.active ? p.rope.anchor : null, p.rope.length, null, 2.0, 1 / 60, this.world, null, this.pred, true);
      for (let k = 1; k < pr.count; k++) d.line(pr.points[k - 1], pr.points[k], 0x00ffff);
    }
    if (f.collision) {
      const w = this.world, r = 30;
      w.queryRect(o.x - r, o.z - r, o.x + r, o.z + r, (i) => {
        if (w.maxY[i] < o.y - 40 || w.minY[i] > o.y + 40) return;
        d.box(w.minX[i], w.minY[i], w.minZ[i], w.maxX[i], w.maxY[i], w.maxZ[i], 0x2266aa);
      });
      d.circle(this._v.set(o.x, o.y - 0.9, o.z), 0.4, 0xffffff);
      d.circle(this._v.set(o.x, o.y + 0.45, o.z), 0.4, 0xffffff);
    }
    d.end();
  }

  private updateHud(dt: number, simMs: number): void {
    const p = this.player;
    this.hud.update(dt);
    this.hud.setSpeed(p.vel.length(), p.state);
    this.hudTimer -= dt;
    if (this.hudTimer > 0) return;
    this.hudTimer = 0.1;
    this.hud.showStats = this.flags.stats;
    if (!this.flags.stats) { this.hud.setStats(''); return; }
    const r = p.rope, info = this.renderer.info;
    const ai = this.ai?.stats();
    const lines = [
      `FPS ${this.fps.toFixed(0)}  frame ${this.frameMs.toFixed(1)} ms  steps ${this.stepsLastFrame}`,
      `CPU sim ${profiler.get('sim').toFixed(2)} ms (${simMs.toFixed(2)})  anim ${profiler.get('anim').toFixed(2)}  cam ${profiler.get('camera').toFixed(2)}  ai ${profiler.get('ai').toFixed(2)}`,
      `CPU render submit ${profiler.get('render').toFixed(2)} ms  GPU ${this.gpu.supported ? (this.gpu.ms >= 0 ? this.gpu.ms.toFixed(2) + ' ms' : '…') : 'n/a'}`,
      `draws ${info.render.calls}  tris ${(info.render.triangles / 1000).toFixed(0)}k  anchor select ${p.anchors.lastTimeMs.toFixed(2)} ms`,
      `state ${p.state} (${p.stateTime.toFixed(2)} s)  prev ${p.fsm.previous ?? '-'}`,
      `speed ${p.vel.length().toFixed(1)} m/s (${(p.vel.length() * 2.237).toFixed(0)} mph)  h ${hlen(p.vel).toFixed(1)}  v ${p.vel.y.toFixed(1)}`,
      `altitude ${p.feetY.toFixed(1)} m  above surface ${(p.feetY - p.surfaceBelow()).toFixed(1)} m`,
      r.active
        ? `web L ${r.length.toFixed(1)} → ${r.targetLength.toFixed(1)} m  d ${r.distance.toFixed(1)}  angle ${r.swingAngle.toFixed(0)}°  v_r ${r.radialVel.toFixed(2)}  v_t ${r.tangentialSpeed.toFixed(1)}  T ${(r.tension / 1000).toFixed(2)} kN (analytic ${(r.tensionAnalytic / 1000).toFixed(2)})`
        : `web -  last release quality ${(p.releaseQuality * 100).toFixed(0)}%`,
      ai ? `traffic ${ai.carsActive}/${ai.cars} (drawn ${ai.carsRendered})  peds ${ai.pedsActive}/${ai.peds} (drawn ${ai.pedsRendered})  ai sim ${ai.simMs.toFixed(2)} ms` : '',
      `audio ${JSON.stringify(this.audio.stats()).slice(0, 90)}`,
    ];
    this.hud.setStats(lines.join('\n'));
  }

  private tickBench(dt: number, simMs: number, rMs: number): void {
    const b = this.bench;
    if (!b) return;
    b.t += dt;
    b.frames.push(dt * 1000);
    b.sim.push(simMs);
    b.render.push(rMs);
    this.player.events.length = 0;
    if (b.t < b.seconds && !(b.tour && b.tour.finished)) return;
    const sorted = [...b.frames].sort((a, c) => a - c);
    const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
    const result = {
      bench: b.name,
      seconds: +b.t.toFixed(2),
      frames: b.frames.length,
      fpsAvg: +(1000 / avg(b.frames)).toFixed(1),
      frameMsP50: +sorted[Math.floor(sorted.length * 0.5)].toFixed(2),
      frameMsP99: +sorted[Math.floor(sorted.length * 0.99)].toFixed(2),
      simMsAvg: +avg(b.sim).toFixed(3),
      renderSubmitMsAvg: +avg(b.render).toFixed(3),
      gpuMs: this.gpu.supported ? +this.gpu.ms.toFixed(2) : null,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      flight: { ...b.bot.m, states: b.bot.m.states },
      tour: b.tour?.log.goals,
      ai: this.ai?.stats(),
    };
    console.info('BENCH_RESULT ' + JSON.stringify(result));
    (window as unknown as { __benchResult: unknown }).__benchResult = result;
    this.hud.flash(`bench done: ${result.fpsAvg} fps, ${result.flight.avgSpeed.toFixed(1)} m/s`);
    this.bench = null;
  }

  /** Test hooks for the headless runner. */
  debugState(): Record<string, unknown> {
    const p = this.player;
    return { state: p.state, pos: p.pos.toArray(), vel: p.vel.toArray(), fps: this.fps };
  }
}

function nightOf(t: number): number {
  const elev = Math.sin((t - 0.25) * Math.PI * 2) * 62;
  return 1 - smoothstep(-4, 14, elev);
}
