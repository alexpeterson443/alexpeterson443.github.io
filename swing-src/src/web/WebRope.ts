import { Vector3 } from 'three';
import { T } from '../core/tuning';

/**
 * A single web line: an anchor on world geometry, a rest length L, and the physics that
 * keeps |x − p| ≤ L (+ a small elastic stretch). Pure math: no scene objects.
 *
 *   r = x − p, d = |r|, r̂ = r / d
 *   v_r = v · r̂ (radial, + = moving away from anchor)
 *   v_t = v − v_r r̂ (tangential)
 */
export class WebRope {
  active = false;
  readonly anchor = new Vector3();
  anchorBox = -1;
  length = 0; // current rest length L
  targetLength = 0; // assistance/reel target
  age = 0;

  // telemetry (read by debug/anim/audio)
  tension = 0; // N, measured from constraint + spring
  tensionAnalytic = 0; // N, m(|v_t|²/L − g·r̂)
  stretch = 0;
  radialVel = 0;
  tangentialSpeed = 0;
  distance = 0;
  /** angle between rope and straight down, degrees; + when past bottom (rising) */
  swingAngle = 0;
  taut = false;
  /** gravity (m/s²) acting on the swinger this step; the constraint's energy bookkeeping uses it */
  gEff = 0;
  /** rope was already at its limit last step (continuous contact vs. a fresh catch) */
  private inContact = false;
  /** a catch is being absorbed: the web gives (pays out) instead of stopping the body in one step */
  catching = false;
  /** the next tightening is a catch (fresh web, or the line went properly slack) */
  private catchArmed = false;
  /** metres paid out during the current catch */
  private payout = 0;

  private readonly rHat = new Vector3();
  private readonly tmp = new Vector3();

  attach(anchor: Vector3, pos: Vector3, box = -1, length?: number): void {
    this.active = true;
    this.anchor.copy(anchor);
    this.anchorBox = box;
    const d = pos.distanceTo(anchor);
    this.length = Math.max(T.web.minLength, length ?? d);
    this.targetLength = this.length;
    this.age = 0;
    this.tension = 0;
    this.inContact = false;
    this.catching = false;
    this.catchArmed = true;
    this.payout = 0;
    this.swingAngle = -90;
    this.radialVel = 0;
    this.gEff = T.physics.gravity * T.web.swingGravityScale;
  }

  detach(): void {
    this.active = false;
    this.tension = 0;
    this.taut = false;
  }

  /** Update r̂, distance and velocity decomposition. */
  measure(pos: Vector3, vel: Vector3, gEff: number): void {
    this.gEff = gEff;
    const r = this.rHat.subVectors(pos, this.anchor);
    const d = r.length();
    this.distance = d;
    if (d > 1e-6) r.multiplyScalar(1 / d);
    else r.set(0, -1, 0);
    this.radialVel = vel.dot(r);
    const vt2 = Math.max(0, vel.lengthSq() - this.radialVel * this.radialVel);
    this.tangentialSpeed = Math.sqrt(vt2);
    this.stretch = d - this.length;
    this.taut = this.stretch > -0.05;
    // gravity component along r̂ is −g·r̂.y; tension balances centripetal + gravity pull outward
    this.tensionAnalytic = this.taut ? Math.max(0, T.physics.mass * (vt2 / Math.max(1, this.length) - gEff * r.y)) : 0;
    const cosA = Math.max(-1, Math.min(1, -r.y));
    const ang = Math.acos(cosA) * (180 / Math.PI);
    // past the bottom = moving horizontally away from the point under the anchor
    const away = r.x * vel.x + r.z * vel.z;
    this.swingAngle = away >= 0 ? ang : -ang;
  }

  get dir(): Vector3 {
    return this.rHat;
  }

  /** Spring-damper force when stretched past L. Adds into F. Returns the spring tension. */
  applyForces(pos: Vector3, vel: Vector3, F: Vector3): number {
    const e = T.web.elasticity;
    if (e <= 0 || this.stretch <= 0) return 0;
    const Fs = T.web.stiffness * this.stretch + T.web.damping * Math.max(0, this.radialVel);
    F.addScaledVector(this.rHat, -Fs);
    void pos; void vel;
    return Fs;
  }

  /**
   * Hard constraint after integration. Removes outward radial velocity (never teleports more
   * than the stretch overshoot). During the catch window part of the removed speed is
   * redirected along the tangential direction so diving into a swing keeps momentum.
   * Returns the impulse-derived tension (N).
   */
  constrain(pos: Vector3, vel: Vector3, dt: number, mass: number, springTension: number): number {
    const r = this.tmp.subVectors(pos, this.anchor);
    let d = r.length();
    if (d < 1e-6) return 0;
    r.multiplyScalar(1 / d);
    let limit = this.length + T.web.maxStretch * T.web.elasticity;
    let impulseTension = 0;
    const y0 = pos.y;
    const vr0 = vel.dot(r);
    // Only a genuine catch is softened: the first time a fresh web tightens, or after the line went
    // properly slack. The ordinary outward load of a swing is carried by the constraint, exactly.
    if (T.web.catchMaxG <= 0) { this.catching = false; this.catchArmed = false; }
    if (d < this.length - 0.3) this.catchArmed = true;
    if (this.catching && d < limit - 1e-3) this.catching = false;
    if (this.catchArmed && d >= limit - 1e-3) {
      this.catchArmed = false;
      if (vr0 > T.web.catchSoftFrom) { this.catching = true; this.payout = 0; }
    }
    // Soft catch: an elastic web gives a little and brakes the body over a few frames rather than
    // stopping its outward motion in one 1/120 s step (tens of g). The rope pays out up to
    // catchGive metres; the braking beyond what the arc itself needs is capped at catchMaxG.
    const soft = this.catching && T.web.catchMaxG > 0 && this.payout < T.web.catchGive;
    if (soft && d > limit) {
      const give = Math.min(d - limit, T.web.catchGive - this.payout);
      this.payout += give;
      this.length += give;
      this.targetLength = Math.max(this.targetLength, this.length);
      limit += give;
    }
    if (d > limit) {
      pos.copy(this.anchor).addScaledVector(r, limit);
      d = limit;
    }
    if (d >= limit - 1e-4 || (T.web.elasticity <= 0 && d >= this.length - 1e-4)) {
      const vr = vel.dot(r);
      if (vr > 0) {
        const speed0 = vel.length();
        let removed = vr * (1 + T.web.restitution * T.web.elasticity);
        if (soft) {
          const vt2 = Math.max(0, speed0 * speed0 - vr * vr);
          // brake at catchMaxG, or harder if that could not stop the body within the give left:
          // a violent catch is spread over the whole give instead of ending in a hard stop
          const left = Math.max(0.05, T.web.catchGive - this.payout);
          const brake = Math.max(T.web.catchMaxG * T.physics.gravity, (vr * vr) / (2 * left));
          // plus what the arc needs (centripetal) and what gravity adds outward this step
          const gOut = Math.max(0, -r.y) * this.gEff;
          const cap = (vt2 / Math.max(1, d) + gOut + brake) * dt;
          if (removed > cap) removed = cap;
          else this.catching = false; // fully arrested: from here on it is an ordinary swing
        } else this.catching = false; // give used up (or rigid): the rope stops the rest at once
        vel.addScaledVector(r, -removed);
        impulseTension = (mass * removed) / dt;
        // Continuous contact: an ideal rope force is perpendicular to the motion and does no
        // work, so the tiny per-step radial correction must not bleed energy (a discretisation
        // artefact). Real inelastic loss is kept for catches (large v_r).
        const reeling = Math.abs(this.targetLength - this.length) > 1e-3;
        if (!reeling && this.inContact && !this.catching) {
          const g = this.gEff;
          const want = Math.sqrt(Math.max(0, speed0 * speed0 + 2 * g * (y0 - pos.y)));
          const s1 = vel.length();
          if (s1 > 1e-6) vel.multiplyScalar(want / s1);
        }
        if (this.age < T.web.catchWindow && T.web.catchRedirect > 0) {
          const vt = vel.length();
          const fade = 1 - this.age / T.web.catchWindow;
          if (vt > 0.5) vel.multiplyScalar((vt + removed * T.web.catchRedirect * fade) / vt);
        }
      } else if (this.catching && this.age > 0.05) this.catching = false;
    }
    // contact persists while the rope stays at its limit; a step of slack makes the next one a catch
    this.inContact = d >= limit - 1e-3;
    this.tension = springTension + impulseTension;
    return this.tension;
  }

  /**
   * Webs never hang slack: when the body moves toward the anchor the line is taken up
   * (no force, so no energy change) and catches again the moment the body moves away.
   */
  takeUpSlack(pos: Vector3): void {
    const d = pos.distanceTo(this.anchor);
    if (d < this.length) {
      this.length = Math.max(T.web.minLength, d);
      if (this.targetLength > this.length) this.targetLength = this.length;
    }
  }

  /** Reel L toward targetLength at `rate` m/s. */
  reel(dt: number, rate: number): void {
    const d = this.targetLength - this.length;
    const step = rate * dt;
    this.length += Math.max(-step, Math.min(step, d));
    this.length = Math.max(T.web.minLength, Math.min(T.web.maxLength * 1.1, this.length));
  }
}
