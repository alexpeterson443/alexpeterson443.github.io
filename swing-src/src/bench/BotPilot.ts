import { Vector3 } from 'three';
import type { Intent } from '../input/Intent';
import type { Player } from '../player/Player';
import type { StateId } from '../player/StateMachine';
import { swingJumpPerfect } from '../web/SwingModel';

/**
 * Scripted "player" used by tests and in-browser benchmarks. It drives the same Intent a human
 * would, so everything it exercises is the real gameplay path.
 */
export interface FlightMetrics {
  seconds: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  /** time-averaged speed while on a web */
  avgSwingSpeed: number;
  minSwingClearance: number;
  swings: number;
  groundTouches: number;
  wallContacts: number;
  releases: number;
  avgReleaseQuality: number;
  swingJumps: number;
  perfectJumps: number;
  wallSlams: number;
  states: Partial<Record<StateId, number>>;
  webFails: number;
}

/**
 * swing      cruise: hold forward, let go in the release window, re-fire past the apex
 * swingChain strong chain: swing-jump at the leg tuck (perfect window), re-press swing at the apex
 * swingHold  hold swing throughout: every arc ends in an automatic release and chains
 * swingLow   late re-fire, low arcs · swingTurn: turn 90° every 6 s · diveCatch: dive from height
 */
export type PilotStyle = 'swing' | 'swingChain' | 'swingHold' | 'swingLow' | 'swingTurn' | 'parkour' | 'diveCatch' | 'tour';

export class BotPilot {
  private releaseT = 0;
  private t = 0;
  readonly m: FlightMetrics = {
    seconds: 0, distance: 0, avgSpeed: 0, maxSpeed: 0, avgSwingSpeed: 0, minSwingClearance: Infinity, swings: 0,
    groundTouches: 0, wallContacts: 0, releases: 0, avgReleaseQuality: 0, swingJumps: 0, perfectJumps: 0, wallSlams: 0,
    states: {}, webFails: 0,
  };
  private qSum = 0;
  private swingT = 0;
  private swingDist = 0;
  private last: StateId | null = null;
  private readonly _v = new Vector3();

  constructor(private style: PilotStyle, private yaw: number) {}

  /** Write this step's intent. */
  drive(p: Player, input: Intent, dt: number): void {
    this.t += dt;
    input.camYaw = this.yaw;
    if (this.style === 'swingTurn') input.camYaw = this.yaw + Math.floor(this.t / 6) * (Math.PI / 2);
    const cy = input.camYaw;
    input.camForward.set(-Math.sin(cy), -0.15, -Math.cos(cy)).normalize();
    input.moveX = 0;
    input.moveY = 1;
    input.jump = false;
    input.zip = false;
    input.dive = false;
    const st = p.state;
    if (this.style === 'parkour') {
      input.traverse = true;
      return;
    }
    if (st === 'Swinging') {
      const r = p.rope;
      if (this.style === 'swingHold') input.traverse = true;
      else if (this.style === 'swingChain') {
        // jump inside the perfect window at the leg tuck
        input.traverse = true;
        input.jump = r.age > 0.3 && swingJumpPerfect(p.swingPhase, p.swingArcEnd, p.swingOmega) >= 1;
        if (input.jump) this.releaseT = 0.1;
      } else {
        // let go in the release window near the end of the up-swing
        const late = this.style === 'swingLow' ? 0.72 : 0.66;
        if (p.swingPhase > late && p.vel.y > 0 && r.age > 0.35) {
          input.traverse = false;
          this.releaseT = 0.12;
        } else input.traverse = true;
      }
    } else if (st === 'Grounded' || st === 'Landing' || st === 'Recovery') {
      input.traverse = true;
      input.jump = this.t % 0.5 < 0.25;
    } else if (st === 'WallRunning' || st === 'WallCrawling') {
      input.traverse = true;
      input.jump = true; // kick off and keep going
    } else {
      this.releaseT -= dt;
      if (this.style === 'diveCatch' && p.vel.y < 0 && p.feetY > 30) {
        // hold the dive until low enough to catch a web out of it
        input.dive = true;
        input.traverse = false;
        input.camForward.set(-Math.sin(cy) * 0.4, -1, -Math.cos(cy) * 0.4).normalize();
        return;
      }
      if (this.style === 'swingHold') input.traverse = true;
      else if (this.style === 'swingChain') {
        // let go of the button for a moment, then press again as the launch tops out
        input.traverse = this.releaseT <= 0 && p.vel.y < 3;
      } else {
        // re-fire once past the apex (falling), like a player would
        input.traverse = this.releaseT <= 0 && p.vel.y < (this.style === 'swingLow' ? -4 : 2);
      }
    }
  }

  /** Accumulate metrics after the step. */
  observe(p: Player, dt: number): void {
    const m = this.m;
    m.seconds += dt;
    const s = p.vel.length();
    m.maxSpeed = Math.max(m.maxSpeed, s);
    const step = this._v.subVectors(p.pos, p.prevPos).length();
    m.distance += step;
    const st = p.state;
    m.states[st] = (m.states[st] ?? 0) + dt;
    if (st === 'Swinging') {
      m.minSwingClearance = Math.min(m.minSwingClearance, p.feetY - p.surfaceBelow());
      this.swingT += dt;
      this.swingDist += step;
    }
    if (st !== this.last) {
      if (st === 'Swinging') m.swings++;
      if (st === 'Grounded' || st === 'Landing' || st === 'Recovery') m.groundTouches++;
      if (st === 'WallRunning' || st === 'WallCrawling') m.wallContacts++;
      this.last = st;
    }
    for (const e of p.events) {
      if (e.type === 'webRelease') { m.releases++; this.qSum += e.a; }
      if (e.type === 'webFail') m.webFails++;
      if (e.type === 'swingJump') { m.swingJumps++; if (e.a >= 1) m.perfectJumps++; }
      if (e.type === 'wallSlam') m.wallSlams++;
    }
    p.events.length = 0;
    m.avgSpeed = m.distance / Math.max(1e-6, m.seconds);
    m.avgSwingSpeed = this.swingDist / Math.max(1e-6, this.swingT);
    m.avgReleaseQuality = m.releases ? this.qSum / m.releases : 0;
  }
}
