import { Vector3 } from 'three';
import type { Intent } from '../input/Intent';
import type { Player } from '../player/Player';
import type { StateId } from '../player/StateMachine';

/**
 * Goal-driven scripted playthrough of the brief's success scenario:
 * rooftop sprint → edge leap → dive → web swing(s) with timed releases → web zip to a point →
 * point launch → swing toward a tower → wall-run up the facade → over the top → leap → swing.
 * Each goal has its own input policy, completion condition and timeout.
 */
interface Goal {
  name: string;
  timeout: number;
  enter?(p: Player): void;
  drive(p: Player, i: Intent, t: number): void;
  done(p: Player, t: number): boolean;
}

export interface TourLog {
  goals: { name: string; ok: boolean; time: number }[];
  visited: StateId[];
  transitions: string[];
}

export class TourPilot {
  private goals: Goal[];
  private gi = 0;
  private gt = 0;
  private releases = 0;
  private swings = 0;
  private lastState: StateId | null = null;
  readonly log: TourLog = { goals: [], visited: [], transitions: [] };
  private yaw = 0;
  private readonly _v = new Vector3();
  finished = false;

  constructor(startYaw = 0) {
    this.yaw = startYaw;
    const swingDrive = (p: Player, i: Intent) => {
      i.moveY = 1;
      this.followStreet(p);
      if (p.state === 'WallRunning' || p.state === 'WallCrawling') {
        // kick off the wall back into the street, like a player would
        i.jump = true;
        i.traverse = true;
        return;
      }
      if (p.state === 'Grounded' || p.state === 'Landing' || p.state === 'Recovery') {
        i.traverse = true;
        i.jump = p.stateTime > 0.1;
        return;
      }
      if (p.state === 'Swinging') {
        i.traverse = !(p.rope.swingAngle > 30 && p.vel.y > 0 && p.rope.age > 0.35);
        if (!i.traverse) this.releases++;
      } else i.traverse = p.vel.y < 1;
    };
    this.goals = [
      {
        name: 'sprint to roof edge and leap',
        timeout: 6,
        drive: (_p, i) => { i.moveY = 1; i.traverse = true; },
        done: (p) => p.state === 'Airborne' && p.vel.y > 0,
      },
      {
        name: 'turn up the avenue',
        timeout: 1,
        enter: () => { this.yaw = 0; },
        drive: (p, i) => { i.moveY = 1; i.traverse = p.feetY - p.surfaceBelow() > 4 && p.vel.y < 0; },
        done: (_p, t) => t > 0.3,
      },
      {
        name: 'dive toward the street',
        timeout: 3,
        drive: (p, i) => { i.moveY = 1; i.dive = p.vel.y < 2; i.camForward.set(-Math.sin(this.yaw), -0.6, -Math.cos(this.yaw)).normalize(); },
        done: (p, t) => t > 0.9 || p.feetY < 22,
      },
      {
        name: 'catch webs and swing, releasing on the up-swing',
        timeout: 12,
        enter: () => { this.releases = 0; this.swings = 0; },
        drive: (p, i) => swingDrive(p, i),
        done: () => this.releases >= 1 && this.swings >= 2,
      },
      {
        name: 'web zip to a point',
        timeout: 6,
        drive: (p, i, t) => {
          i.moveY = 0.6;
          i.camForward.set(-Math.sin(this.yaw), 0.25, -Math.cos(this.yaw)).normalize();
          // keep swinging until a point target is under the reticle, then zip
          if (p.perchTarget && p.state !== 'WebZip') { i.zip = t % 0.2 < 0.1; i.traverse = false; }
          else if (p.state !== 'WebZip') swingDrive(p, i);
        },
        done: (p) => p.state === 'Perching' || p.state === 'PointLaunch',
      },
      {
        name: 'point launch',
        timeout: 2,
        drive: (p, i, t) => { i.jump = p.state === 'Perching' && t % 0.2 < 0.1; },
        done: (p) => p.state === 'PointLaunch' || (p.state === 'Airborne' && p.vel.y > 8),
      },
      {
        name: 'swing to a facade and wall-run up it',
        timeout: 10,
        enter: (p) => { this.yaw = this.nearestWallYaw(p); },
        drive: (p, i) => {
          this.yaw = this.nearestWallYaw(p);
          i.moveY = 1;
          i.traverse = p.state === 'Swinging' ? true : p.vel.y < 1 || p.state === 'Grounded' || p.state === 'WallRunning' || p.state === 'WallCrawling';
        },
        done: (p) => p.state === 'WallRunning',
      },
      {
        name: 'run up and over the top',
        timeout: 14,
        drive: (_p, i) => { i.moveY = 1; i.traverse = true; },
        done: (p) => p.state === 'Mantling' || p.state === 'Grounded' || (p.state === 'Airborne' && p.fsm.previous === 'WallRunning'),
      },
      {
        name: 'leap and swing again',
        timeout: 14,
        enter: (p) => { this.yaw += Math.PI; this.releases = 0; void p; },
        drive: (p, i, t) => {
          i.moveY = 1;
          if (p.state === 'Grounded' || p.state === 'Mantling' || p.state === 'Landing' || p.state === 'Recovery') { i.traverse = true; i.jump = t % 0.4 < 0.2; }
          else {
            swingDrive(p, i);
            // above the skyline nothing is in reach: dive until anchors come into range
            i.dive = p.state === 'Airborne' && p.vel.y < 0 && p.feetY > 70;
          }
        },
        done: (p) => p.state === 'Swinging' && p.stateTime > 0.4,
      },
    ];
  }

  private streetT = 0;
  /** Like a player: look down the open street closest to the current heading (re-evaluated ~2×/s). */
  private followStreet(p: Player): void {
    if (p.simTime - this.streetT < 0.5) return;
    this.streetT = p.simTime;
    let best = this.yaw, bestScore = -Infinity;
    const o = this._v.set(p.pos.x, Math.max(p.pos.y - 8, 3), p.pos.z);
    const base = Math.round(this.yaw / (Math.PI / 2)) * (Math.PI / 2);
    for (let k = -1; k <= 1; k++) {
      const a = base + (k * Math.PI) / 2;
      const d = new Vector3(-Math.sin(a), 0, -Math.cos(a));
      const free = p.world.raycast(o, d, 200, p.hit, 8, false) ? p.hit.t : 200;
      const score = free - Math.abs(k) * 40;
      if (score > bestScore) { bestScore = score; best = a; }
    }
    this.yaw = best;
  }

  /** Yaw facing the closest building facade (horizontal ray fan). */
  private nearestWallYaw(p: Player): number {
    let best = this.yaw, bestT = Infinity;
    const o = this._v.copy(p.pos);
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const d = new Vector3(-Math.sin(a), 0, -Math.cos(a));
      if (p.world.raycast(o, d, 120, p.hit, 1 | 8, false) && p.hit.t < bestT && p.world.maxY[p.hit.box] > p.feetY + 12) {
        bestT = p.hit.t;
        best = a;
      }
    }
    return best;
  }

  drive(p: Player, i: Intent, dt: number): void {
    i.moveX = 0; i.moveY = 0; i.jump = false; i.traverse = false; i.zip = false; i.dive = false; i.trick = false; i.drop = false;
    i.camYaw = this.yaw;
    i.camForward.set(-Math.sin(this.yaw), -0.1, -Math.cos(this.yaw)).normalize();
    if (this.finished) return;
    const g = this.goals[this.gi];
    if (this.gt === 0) g.enter?.(p);
    this.gt += dt;
    g.drive(p, i, this.gt);
    i.camYaw = this.yaw;
  }

  observe(p: Player): void {
    const st = p.state;
    if (st !== this.lastState) {
      if (st === 'Swinging') this.swings++;
      if (!this.log.visited.includes(st)) this.log.visited.push(st);
      if (this.lastState) this.log.transitions.push(`${this.lastState}>${st}`);
      this.lastState = st;
    }
    if (this.finished) return;
    const g = this.goals[this.gi];
    const ok = g.done(p, this.gt);
    if (ok || this.gt > g.timeout) {
      this.log.goals.push({ name: g.name, ok, time: +this.gt.toFixed(2) });
      this.gi++;
      this.gt = 0;
      if (this.gi >= this.goals.length) this.finished = true;
    }
  }
}
