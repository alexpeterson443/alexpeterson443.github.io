import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { hlen } from '../core/math';
import { Kind, makeHit, type Contact, type CollisionWorld } from '../world/CollisionWorld';
import { WebRope } from '../web/WebRope';
import { AnchorSelector } from '../web/AnchorSelector';
import { makeSwingContext, makeSwingDebug } from '../web/SwingModel';
import type { Intent } from '../input/Intent';
import type { CityLayout, PerchPoint } from '../city/CityGenerator';
import { StateMachine, type StateId } from './StateMachine';
import './states';

export type GameEventType =
  | 'jump' | 'superJump' | 'land' | 'roll' | 'hardLand' | 'webFire' | 'webAttach' | 'webRelease'
  | 'webFail' | 'zip' | 'pointLaunch' | 'perch' | 'wallRun' | 'wallJump' | 'vault' | 'mantle'
  | 'trick' | 'footstep' | 'wallStep' | 'cornerWrap' | 'state'
  /** a = timing quality 0..1 (1 = inside the perfect window at the leg tuck) */
  | 'swingJump'
  /** a = speed into the wall (m/s); only with low Swing Assist */
  | 'wallSlam';

export interface GameEvent {
  type: GameEventType;
  a: number; // generic payload (speed, quality…)
  pos: Vector3;
}

import { CAPSULE_R, CAPSULE_OFFSETS, FEET } from './body';
export { CAPSULE_R, CAPSULE_OFFSETS, FEET };

/**
 * The simulated player body. Owns kinematics and sensing; behaviour lives in the states.
 * Position is the centre of mass. Everything here is deterministic given the Intent stream.
 */
export class Player {
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  readonly prevPos = new Vector3();
  /** Net acceleration of the last step (m/s²), and a smoothed copy for animation. */
  readonly acc = new Vector3();
  readonly accSmooth = new Vector3();
  facing = 0; // yaw, rad (0 = facing −Z)
  readonly fsm: StateMachine;

  readonly rope = new WebRope();
  readonly anchors: AnchorSelector;
  readonly swingDbg = makeSwingDebug();
  /** Heading the current swing holds, assist strength and facade distances (see SwingContext). */
  readonly swingCtx = makeSwingContext();
  /** Arc phase −1..1 (−1 start of the down-swing, 0 bottom, +1 end of the up-swing). */
  swingPhase = 0;
  /** End-of-arc angle (deg) and angular speed (deg/s) of the current swing. */
  swingArcEnd = 90;
  swingOmega = 0;
  /** 0..1, peaks at the leg-tuck point of the up-swing (the ideal jump moment); for animation/HUD. */
  swingTuck = 0;
  /** Last swing jump: timing quality (1 = perfect) and the arc phase it was pressed at. */
  swingJumpQuality = 0;
  swingJumpPhase = 0;
  /** The web let go on its own at the end of a held arc: fire the next one while swing is held. */
  chainPending = false;
  /** Forward zips used since the last swing, landing or wall contact. */
  airZips = 0;
  /** Point-launch timing: when jump was pressed during the zip, and the resulting grade. */
  launchPressT = -10;
  /** Speed (m/s along the aim) a forward zip's burst heads for. */
  zipBurstSpeed = 0;
  pointLaunchQuality = 0;
  wallProbeT = 0;
  prevAnchor: Vector3 | null = null;
  webCooldown = 0;
  timeSinceRelease = 10;
  private lastWebFail = -10;

  // ground
  onGround = false;
  readonly groundNormal = new Vector3(0, 1, 0);
  timeSinceGround = 0;
  groundY = 0; // height of surface below
  // wall
  readonly wallNormal = new Vector3();
  wallBox = -1;
  wallContact = false;
  readonly wallContactNormal = new Vector3();
  ceilingContact = false;
  /** velocity just before the last collision resolved it (for landing impact) */
  readonly preImpactVel = new Vector3();

  // misc per-state data (kept on the body so states stay stateless singletons)
  readonly zipTarget = new Vector3();
  zipPoint: PerchPoint | null = null;
  jumpHeldFromGround = false;
  jumpCharge = 0;
  diveTime = 0;
  trickKind = 0;
  landingImpact = 0;
  wallMode: 'vertical' | 'horizontal' = 'vertical';
  wallSide = 1;
  jumpBufferT = 0;
  readonly moveFrom = new Vector3();
  readonly moveTo = new Vector3();
  readonly moveApex = new Vector3();
  moveDur = 0.3;
  releaseQuality = 0;
  losTimer = 0;
  arcGroundTimer = 0;
  arcGroundY = 0;
  launchQueued = false;
  /** where the visual web of a zip is attached */
  readonly zipWebPoint = new Vector3();
  /** Point-launch/perch target currently under the reticle. */
  perchTarget: PerchPoint | null = null;

  readonly events: GameEvent[] = [];
  readonly contacts: Contact[] = [];
  contactCount = 0;
  simTime = 0;
  distanceTravelled = 0;

  // scratch
  readonly hit = makeHit();
  private readonly _c = new Vector3();
  private readonly _d = new Vector3();
  private readonly _v0 = new Vector3();
  /** velocity at the start of the current fixed step (for the averaged position update) */
  readonly stepStartVel = new Vector3();
  private perchScanT = 0;

  constructor(readonly world: CollisionWorld, readonly city: CityLayout | null) {
    this.anchors = new AnchorSelector(world);
    this.fsm = new StateMachine(this);
  }

  get state(): StateId {
    return this.fsm.current.id;
  }
  get stateTime(): number {
    return this.fsm.time;
  }
  get feetY(): number {
    return this.pos.y - FEET;
  }
  get speed(): number {
    return this.vel.length();
  }

  spawn(x: number, y: number, z: number, facing = 0): void {
    this.pos.set(x, y + FEET, z);
    this.prevPos.copy(this.pos);
    this.vel.set(0, 0, 0);
    this.facing = facing;
    this.rope.detach();
    this.fsm.reset('Airborne');
  }

  emit(type: GameEventType, a = 0): void {
    if (this.events.length > 64) this.events.shift();
    this.events.push({ type, a, pos: this.pos.clone() });
  }

  /** One fixed simulation step. */
  step(dt: number, input: Intent): void {
    this.prevPos.copy(this.pos);
    const v0 = this._v0.copy(this.vel);
    this.stepStartVel.copy(this.vel);
    this.simTime += dt;
    this.webCooldown = Math.max(0, this.webCooldown - dt);
    this.timeSinceRelease += dt;
    this.jumpBufferT = input.jumpPressed ? T.ground.jumpBuffer : Math.max(0, this.jumpBufferT - dt);
    this.perchScanT -= dt;
    if (this.perchScanT <= 0 && this.city) {
      this.perchScanT = 0.05;
      const st = this.fsm.current.id;
      this.perchTarget = st === 'Perching' || st === 'WebZip' ? this.perchTarget : this.findPerchTarget(input);
    }
    this.fsm.step(dt, input);
    const st2 = this.fsm.current.id;
    if (this.onGround || st2 === 'Swinging' || st2 === 'Grounded' || st2 === 'WallRunning' || st2 === 'WallCrawling' || st2 === 'Perching') this.airZips = 0;
    if (!input.traverse || st2 === 'Grounded') this.chainPending = false;
    // derived kinematics
    this.acc.subVectors(this.vel, v0).multiplyScalar(1 / dt);
    const k = 1 - Math.exp(-10 * dt);
    this.accSmooth.lerp(this.acc, k);
    this.distanceTravelled += this.pos.distanceTo(this.prevPos);
    // safety: never leave the world
    if (!Number.isFinite(this.pos.x + this.pos.y + this.pos.z)) this.spawn(0, 60, 0);
    if (this.pos.y < -5) { this.pos.y = FEET; this.vel.y = 0; }
    // the playable district ends a little past its outer avenues (beyond is harbour and scenery):
    // a soft edge removes outward velocity and eases the hero back in
    if (this.city) {
      const b = this.city.bounds, m = 25;
      const ox = this.pos.x < b.x0 - m ? b.x0 - m - this.pos.x : this.pos.x > b.x1 + m ? b.x1 + m - this.pos.x : 0;
      const oz = this.pos.z < b.z0 - m ? b.z0 - m - this.pos.z : this.pos.z > b.z1 + m ? b.z1 + m - this.pos.z : 0;
      if (ox !== 0) { this.pos.x += ox * Math.min(1, 8 * dt); if (this.vel.x * ox < 0) this.vel.x *= -0.2; }
      if (oz !== 0) { this.pos.z += oz * Math.min(1, 8 * dt); if (this.vel.z * oz < 0) this.vel.z *= -0.2; }
    }
  }

  // ---------------------------------------------------------------------
  // physics helpers used by the states
  // ---------------------------------------------------------------------

  /**
   * Position update with sub-stepped collision. Callers integrate v += (F/m)·dt first; the body
   * then moves with the average of the old and new velocity, x += ½(v₀ + v₁)·dt (velocity
   * Verlet for position-independent forces). Unlike plain semi-implicit Euler this has no
   * −½·m·g²·dt² energy offset per step, so pendulum swings and jump apexes are exact.
   */
  moveAndCollide(dt: number): void {
    // half of this step's velocity change, subtracted from the displacement
    const hx = (this.vel.x - this.stepStartVel.x) * 0.5;
    const hy = (this.vel.y - this.stepStartVel.y) * 0.5;
    const hz = (this.vel.z - this.stepStartVel.z) * 0.5;
    this.onGround = false;
    this.wallContact = false;
    this.ceilingContact = false;
    this.contactCount = 0;
    this.preImpactVel.copy(this.vel);
    const travel = this.vel.length() * dt;
    const n = Math.max(1, Math.min(12, Math.ceil(travel / (CAPSULE_R * 0.7))));
    const sdt = dt / n;
    const c = this._c;
    for (let s = 0; s < n; s++) {
      this.pos.x += (this.vel.x - hx) * sdt;
      this.pos.y += (this.vel.y - hy) * sdt;
      this.pos.z += (this.vel.z - hz) * sdt;
      for (const off of CAPSULE_OFFSETS) {
        c.set(this.pos.x, this.pos.y + off, this.pos.z);
        const before = this.contactCount;
        this.contactCount = this.world.resolveSphere(c, CAPSULE_R, this.contacts, this.contactCount);
        if (this.contactCount !== before) {
          this.pos.set(c.x, c.y - off, c.z);
          for (let i = before; i < this.contactCount; i++) this.handleContact(this.contacts[i], off);
        }
      }
    }
  }

  private handleContact(ct: Contact, off: number): void {
    const n = ct.normal;
    const vn = this.vel.dot(n);
    if (n.y > 0.6 && off < 0) {
      this.onGround = true;
      this.groundNormal.copy(n);
      this.groundY = this.feetY;
    } else if (Math.abs(n.y) < 0.4) {
      // step-up small ledges (curbs, low props) while grounded
      if (ct.box >= 0 && this.timeSinceGround < 0.05 && this.world.maxY[ct.box] - this.feetY < T.ground.stepHeight && this.world.maxY[ct.box] - this.feetY > 0) {
        this.pos.y = this.world.maxY[ct.box] + FEET + 0.01;
        this.pos.addScaledVector(n, 0.02);
        return;
      }
      this.wallContact = true;
      this.wallContactNormal.set(n.x, 0, n.z).normalize();
      this.wallBox = ct.box;
    } else if (n.y < -0.6) {
      this.ceilingContact = true;
    }
    if (vn < 0) this.vel.addScaledVector(n, -vn);
  }

  /** Probe below the feet; snaps to ground when close. Returns true if standing. */
  probeGround(snap: boolean, maxDrop = 0.35): boolean {
    this._c.copy(this.pos);
    const down = this._d.set(0, -1, 0);
    if (this.world.raycast(this._c, down, FEET + maxDrop, this.hit) && this.hit.normal.y > 0.6) {
      this.groundY = this.hit.point.y;
      if (snap) {
        this.pos.y = this.hit.point.y + FEET;
        if (this.vel.y < 0) this.vel.y = 0;
      }
      this.groundNormal.copy(this.hit.normal);
      return true;
    }
    return false;
  }

  /** Height of the highest surface below the player (street = 0). */
  surfaceBelow(): number {
    this._c.copy(this.pos);
    return this.world.heightBelow(this._c, 600);
  }

  /** Ray from body along -n to find the wall; updates wallNormal on success. */
  probeWall(n: Vector3, dist = 1.3, heightOff = 0): boolean {
    this._c.set(this.pos.x, this.pos.y + heightOff, this.pos.z);
    const d = this._d.copy(n).multiplyScalar(-1);
    if (this.world.raycast(this._c, d, dist, this.hit, Kind.NoWeb, false) && Math.abs(this.hit.normal.y) < 0.3) {
      return true;
    }
    return false;
  }

  /**
   * Find a ledge in front (direction `fwd`, horizontal) whose top is between the feet and
   * `maxRise` above them, with room to stand. Writes the stand position to `out`.
   */
  findLedge(fwd: Vector3, maxRise: number, reach: number, out: Vector3): boolean {
    const fl = hlen(fwd);
    if (fl < 1e-3) return false;
    const fx = fwd.x / fl, fz = fwd.z / fl;
    const feet = this.feetY;
    const probe = this._c.set(this.pos.x + fx * reach, feet + maxRise + 0.5, this.pos.z + fz * reach);
    const down = this._d.set(0, -1, 0);
    if (!this.world.raycast(probe, down, maxRise + 0.5, this.hit, 0, false)) return false;
    if (this.hit.normal.y < 0.7) return false;
    const top = this.hit.point.y;
    if (top < feet + 0.25 || top > feet + maxRise) return false;
    out.set(this.hit.point.x, top + FEET + 0.02, this.hit.point.z);
    // standing room
    if (this.world.overlapsSphere(this._c.set(out.x, out.y + 0.2, out.z), CAPSULE_R * 0.9)) return false;
    return true;
  }

  // ---------------------------------------------------------------------
  // shared behaviours
  // ---------------------------------------------------------------------

  /**
   * Soft speed cap: excess speed bleeds off exponentially rather than a hard clamp. `gentle` (swings
   * and the flight just after one) bleeds slowly, so a dive's speed carries into the next few arcs;
   * otherwise the rate grows fast with the excess so the cap holds against gravity and dive thrust.
   */
  limitSpeed(dt: number, diving: boolean, gentle = false): void {
    const cap = diving ? T.physics.maxDiveSpeed : T.physics.maxNormalSpeed;
    const s = this.vel.length();
    if (s > cap) {
      const excess = s - cap;
      const rate = gentle
        ? T.physics.swingSpeedSoftness * (0.4 + excess * 0.12)
        : T.physics.speedLimitSoftness * (1 + excess * 0.5);
      const ns = cap + excess * Math.exp(-rate * dt);
      this.vel.multiplyScalar(ns / s);
    }
  }

  /** Try to fire a swing web. Returns true if attached. */
  tryAttachWeb(input: Intent, desired: Vector3): boolean {
    if (this.webCooldown > 0) return false;
    this.webCooldown = T.web.fireCooldown;
    const best = this.anchors.select({
      pos: this.pos, vel: this.vel, input: desired, camForward: input.camForward, prevAnchor: this.prevAnchor, stick: input.moveMag > 0.1,
    });
    if (!best) {
      // nothing to attach to (e.g. above the skyline): keep trying quietly, cue the player once
      if (this.simTime - this.lastWebFail > 0.8) this.emit('webFail');
      this.lastWebFail = this.simTime;
      return false;
    }
    this.rope.attach(best.point, this.pos, best.box);
    this.prevAnchor = this.prevAnchor ?? new Vector3();
    this.prevAnchor.copy(best.point);
    this.emit('webFire', this.pos.distanceTo(best.point));
    return true;
  }

  /** Find a perch/point-launch target near the camera centre. */
  findPerchTarget(input: Intent): PerchPoint | null {
    if (!this.city) return null;
    const cf = input.camForward;
    let best: PerchPoint | null = null;
    let bestScore = -Infinity;
    const maxD = T.zip.pointMaxDistance;
    const cosCone = Math.cos((T.zip.pointConeDeg * Math.PI) / 180);
    const eye = this._c.set(this.pos.x, this.pos.y + 0.8, this.pos.z);
    for (const p of this.city.perches) {
      const dx = p.x - eye.x, dy = p.y - eye.y, dz = p.z - eye.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > maxD * maxD || d2 < 16) continue;
      const d = Math.sqrt(d2);
      const cosA = (dx * cf.x + dy * cf.y + dz * cf.z) / d;
      if (cosA < cosCone) continue;
      if (p.y < this.pos.y - 25) continue;
      const score = cosA * 3 - d / maxD + (p.kind === 'lamp' ? -0.4 : 0);
      if (score > bestScore) {
        // visibility check (only for improving candidates)
        const to = this._d.set(dx / d, dy / d, dz / d);
        if (this.world.raycast(eye, to, d - 1.0, this.hit, Kind.NoWeb, false)) continue;
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  get hSpeed(): number {
    return hlen(this.vel);
  }
}

export type { StateId };
