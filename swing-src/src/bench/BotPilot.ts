import { Vector3 } from 'three';
import type { Intent } from '../input/Intent';
import type { Player } from '../player/Player';
import type { StateId } from '../player/StateMachine';

/**
 * Scripted "player" used by tests and in-browser benchmarks. It drives the same Intent a human
 * would, so everything it exercises is the real gameplay path.
 */
export interface FlightMetrics {
  seconds: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  minSwingClearance: number;
  swings: number;
  groundTouches: number;
  wallContacts: number;
  releases: number;
  avgReleaseQuality: number;
  states: Partial<Record<StateId, number>>;
  webFails: number;
}

export type PilotStyle = 'swing' | 'swingLow' | 'swingTurn' | 'parkour' | 'diveCatch';

export class BotPilot {
  private releaseT = 0;
  private t = 0;
  readonly m: FlightMetrics = {
    seconds: 0, distance: 0, avgSpeed: 0, maxSpeed: 0, minSwingClearance: Infinity, swings: 0,
    groundTouches: 0, wallContacts: 0, releases: 0, avgReleaseQuality: 0, states: {}, webFails: 0,
  };
  private qSum = 0;
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
      // release on the up-swing, inside the ideal window
      const r = p.rope;
      const late = this.style === 'swingLow' ? 35 : 28;
      if (r.swingAngle > late && p.vel.y > 0 && r.age > 0.35) {
        input.traverse = false;
        this.releaseT = 0.12;
      } else input.traverse = true;
    } else if (st === 'Grounded' || st === 'Landing' || st === 'Recovery') {
      input.traverse = true;
      input.jump = this.t % 0.5 < 0.25;
    } else if (st === 'WallRunning' || st === 'WallCrawling') {
      input.traverse = true;
      input.jump = true; // kick off and keep going
    } else {
      this.releaseT -= dt;
      // re-fire once past the apex (falling), like a player would
      input.traverse = this.releaseT <= 0 && p.vel.y < (this.style === 'swingLow' ? -4 : 2);
      if (this.style === 'diveCatch') input.dive = p.vel.y < 0 && p.feetY > 35;
    }
  }

  /** Accumulate metrics after the step. */
  observe(p: Player, dt: number): void {
    const m = this.m;
    m.seconds += dt;
    const s = p.vel.length();
    m.maxSpeed = Math.max(m.maxSpeed, s);
    m.distance += this._v.subVectors(p.pos, p.prevPos).length();
    const st = p.state;
    m.states[st] = (m.states[st] ?? 0) + dt;
    if (st === 'Swinging') m.minSwingClearance = Math.min(m.minSwingClearance, p.feetY - p.surfaceBelow());
    if (st !== this.last) {
      if (st === 'Swinging') m.swings++;
      if (st === 'Grounded' || st === 'Landing' || st === 'Recovery') m.groundTouches++;
      if (st === 'WallRunning' || st === 'WallCrawling') m.wallContacts++;
      this.last = st;
    }
    for (const e of p.events) {
      if (e.type === 'webRelease') { m.releases++; this.qSum += e.a; }
      if (e.type === 'webFail') m.webFails++;
    }
    p.events.length = 0;
    m.avgSpeed = m.distance / Math.max(1e-6, m.seconds);
    m.avgReleaseQuality = m.releases ? this.qSum / m.releases : 0;
  }
}
