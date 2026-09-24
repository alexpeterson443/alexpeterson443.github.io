import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { DEG, clamp, hlen } from '../core/math';
import { Kind, makeHit, type CollisionWorld } from '../world/CollisionWorld';
import { makePrediction, predict, type Prediction } from './TrajectoryPredictor';

export interface AnchorCandidate {
  point: Vector3;
  normal: Vector3;
  box: number;
  source: 'ray' | 'edge' | 'facade';
  valid: boolean;
  reason: string;
  score: number;
  terms: Record<string, number>;
  predicted: boolean;
  minClearance: number;
  collided: boolean;
}

export interface AnchorQuery {
  pos: Vector3;
  vel: Vector3;
  /** desired horizontal direction (input), may be zero */
  input: Vector3;
  camForward: Vector3;
  prevAnchor: Vector3 | null;
}

const NCAND = 160;

/**
 * Chooses where a web attaches. Candidates come from a cone of ray casts plus analytic points on
 * nearby roof edges and facades. Each is scored on geometry and, for the best few, on a forward
 * simulation of the swing it would produce. Never returns a point in empty sky.
 */
export class AnchorSelector {
  readonly candidates: AnchorCandidate[] = Array.from({ length: NCAND }, () => ({
    point: new Vector3(), normal: new Vector3(), box: -1, source: 'ray' as const, valid: false,
    reason: '', score: -Infinity, terms: {}, predicted: false, minClearance: 0, collided: false,
  }));
  count = 0;
  best: AnchorCandidate | null = null;
  lastTimeMs = 0;
  /** Predictions of the top candidates (for debug drawing). */
  readonly predictions: Prediction[] = Array.from({ length: 6 }, () => makePrediction(80));
  predictionCount = 0;

  private readonly hit = makeHit();
  private readonly dir = new Vector3();
  private readonly heading = new Vector3();
  private readonly toA = new Vector3();
  private readonly tmp = new Vector3();
  private readonly desired = new Vector3();

  constructor(private world: CollisionWorld) {}

  private push(point: Vector3, normal: Vector3, box: number, source: AnchorCandidate['source']): AnchorCandidate | null {
    if (this.count >= NCAND) return null;
    const c = this.candidates[this.count++];
    c.point.copy(point);
    c.normal.copy(normal);
    c.box = box;
    c.source = source;
    c.valid = true;
    c.reason = '';
    c.score = -Infinity;
    c.terms = {};
    c.predicted = false;
    c.minClearance = 0;
    c.collided = false;
    return c;
  }

  select(q: AnchorQuery): AnchorCandidate | null {
    const t0 = performance.now();
    this.count = 0;
    this.best = null;
    this.predictionCount = 0;
    const w = this.world;
    const { pos, vel } = q;
    const speed = vel.length();
    const hs = hlen(vel);

    // Heading: blend of travel direction, input and camera (flattened)
    const heading = this.heading.set(0, 0, 0);
    if (hs > 2) heading.set(vel.x / hs, 0, vel.z / hs).multiplyScalar(Math.min(1, hs / 12) * 1.2);
    heading.addScaledVector(q.input, 1.4);
    const cfl = Math.hypot(q.camForward.x, q.camForward.z);
    if (cfl > 1e-3) heading.add(this.tmp.set(q.camForward.x / cfl, 0, q.camForward.z / cfl).multiplyScalar(0.6));
    if (heading.lengthSq() < 1e-6) heading.set(q.camForward.x, 0, q.camForward.z);
    heading.normalize();
    const desired = this.desired.copy(q.input.lengthSq() > 0.01 ? q.input : heading).setY(0).normalize();

    // --- 1. ray fan -------------------------------------------------------
    const nRays = T.anchor.rayCount;
    const yawSpan = T.web.attachConeDeg * DEG;
    const baseYaw = Math.atan2(heading.x, heading.z);
    const maxLen = T.web.maxLength;
    for (let i = 0; i < nRays; i++) {
      // golden-angle spiral over the cone gives even coverage with any ray count
      const u = (i + 0.5) / nRays;
      const yaw = baseYaw + Math.sin(i * 2.39996) * yawSpan * Math.sqrt(u);
      const elev = (28 + 52 * ((i * 0.618034) % 1)) * DEG;
      const ce = Math.cos(elev);
      const d = this.dir.set(Math.sin(yaw) * ce, Math.sin(elev), Math.cos(yaw) * ce);
      if (w.raycast(pos, d, maxLen, this.hit, Kind.NoWeb, false)) {
        this.push(this.tmp.copy(this.hit.point).addScaledVector(this.hit.normal, 0.05), this.hit.normal, this.hit.box, 'ray');
      }
    }

    // --- 2. analytic roof-edge and facade points of nearby boxes -----------
    const ahead = this.toA.copy(pos).addScaledVector(heading, 18 + speed * 0.4);
    const R = maxLen * 0.85;
    const boxes: number[] = [];
    w.queryRect(ahead.x - R, ahead.z - R, ahead.x + R, ahead.z + R, (i) => {
      if (w.kind[i] & (Kind.NoWeb | Kind.Low)) return;
      if (w.maxY[i] < pos.y + T.web.minAnchorHeightAbovePlayer) return;
      boxes.push(i);
    });
    // nearest boxes first, cap the count to bound cost
    boxes.sort((a, b) => boxDist2(w, a, ahead) - boxDist2(w, b, ahead));
    const idealH = T.web.idealAnchorDistance + speed * 0.25;
    const idealRise = idealH * Math.sin(T.web.idealAnchorElevationDeg * DEG);
    for (let k = 0; k < Math.min(24, boxes.length); k++) {
      const i = boxes[k];
      // target point: ahead of the player, at an ideal rise
      const tx = pos.x + heading.x * idealH * 0.65;
      const tz = pos.z + heading.z * idealH * 0.65;
      const cx = clamp(tx, w.minX[i], w.maxX[i]);
      const cz = clamp(tz, w.minZ[i], w.maxZ[i]);
      // snap to the nearest vertical face of the box
      const dx0 = cx - w.minX[i], dx1 = w.maxX[i] - cx, dz0 = cz - w.minZ[i], dz1 = w.maxZ[i] - cz;
      const m = Math.min(dx0, dx1, dz0, dz1);
      let fx = cx, fz = cz;
      const n = this.dir.set(0, 0, 0);
      if (m === dx0) { fx = w.minX[i]; n.x = -1; } else if (m === dx1) { fx = w.maxX[i]; n.x = 1; } else if (m === dz0) { fz = w.minZ[i]; n.z = -1; } else { fz = w.maxZ[i]; n.z = 1; }
      // face must face the player
      if ((pos.x - fx) * n.x + (pos.z - fz) * n.z < 0) continue;
      const top = w.maxY[i];
      // roof edge
      this.push(this.tmp.set(fx + n.x * 0.05, top - 0.3, fz + n.z * 0.05), n, i, 'edge');
      // facade point at the ideal elevation when the roof is far above
      const fy = pos.y + idealRise;
      if (fy < top - 4 && fy > w.minY[i] + 2) this.push(this.tmp.set(fx + n.x * 0.05, fy, fz + n.z * 0.05), n, i, 'facade');
    }

    // --- 3. static scoring --------------------------------------------------
    const A = T.anchor;
    const lateralSign = Math.sign(heading.x * desired.z - heading.z * desired.x); // turn request
    const turnAmt = 1 - Math.max(-1, Math.min(1, heading.dot(desired)));
    for (let c = 0; c < this.count; c++) {
      const cand = this.candidates[c];
      const to = this.toA.subVectors(cand.point, pos);
      const dist = to.length();
      const rise = to.y;
      const hd = Math.hypot(to.x, to.z);
      const terms = cand.terms;
      if (rise < T.web.minAnchorHeightAbovePlayer) { cand.valid = false; cand.reason = 'too low'; continue; }
      if (dist > maxLen) { cand.valid = false; cand.reason = 'too far'; continue; }
      if (dist < T.web.minLength * 1.4) { cand.valid = false; cand.reason = 'too close'; continue; }
      const hx = hd > 1e-3 ? to.x / hd : 0, hz = hd > 1e-3 ? to.z / hd : 0;
      const along = hx * heading.x + hz * heading.z;
      const cone = Math.cos(T.web.attachConeDeg * DEG);
      if (hd > 4 && along < cone - (speed < 5 ? 0.6 : 0)) { cand.valid = false; cand.reason = 'outside cone'; continue; }
      // visibility: a clear line from the hand to the anchor
      this.tmp.set(pos.x, pos.y + 0.6, pos.z);
      const dir = this.dir.subVectors(cand.point, this.tmp);
      const dl = dir.length();
      dir.multiplyScalar(1 / dl);
      const blocked = w.raycast(this.tmp, dir, dl - 0.6, this.hit, Kind.NoWeb, false);
      if (blocked) { cand.valid = false; cand.reason = 'occluded'; continue; }

      const idealD = T.web.idealAnchorDistance + speed * 0.3;
      terms.distance = Math.exp(-Math.pow((dist - idealD) / (idealD * 0.45), 2));
      const elev = Math.atan2(rise, hd) / DEG;
      terms.height = Math.exp(-Math.pow((elev - T.web.idealAnchorElevationDeg) / 22, 2));
      const vdir = hs > 2 ? (to.x * vel.x + to.z * vel.z) / (hd * hs + 1e-6) : along;
      terms.direction = 0.5 + 0.5 * vdir;
      const cdir = (to.x * q.camForward.x + to.y * q.camForward.y + to.z * q.camForward.z) / (dist + 1e-6);
      terms.camera = 0.5 + 0.5 * cdir;
      terms.input = q.input.lengthSq() > 0.01 ? 0.5 + 0.5 * (hx * desired.x + hz * desired.z) : 0.5;
      // side of the street: prefer anchors offset laterally (swing along streets, not into walls)
      const lat = Math.abs(heading.x * to.z - heading.z * to.x);
      terms.street = Math.exp(-Math.pow((lat - 12) / 12, 2));
      // turning: prefer anchors on the side we're turning to (the rope pulls us round the corner)
      const side = Math.sign(heading.x * to.z - heading.z * to.x);
      terms.turn = turnAmt > 0.15 ? (side === lateralSign ? turnAmt : -turnAmt * 0.5) : 0;
      // continuity: don't re-use the same point, mild preference to alternate sides
      if (q.prevAnchor) {
        const dp = cand.point.distanceTo(q.prevAnchor);
        terms.continuity = dp < 6 ? -1 : Math.min(1, dp / 30);
      } else terms.continuity = 0.5;
      terms.visibility = cand.source === 'ray' ? 1 : 0.85;
      cand.score =
        A.wDistance * terms.distance + A.wHeight * terms.height + A.wDirection * terms.direction +
        A.wCamera * terms.camera + A.wInput * terms.input + A.wStreet * terms.street +
        A.wTurn * terms.turn + A.wContinuity * terms.continuity + A.wVisibility * terms.visibility;
    }

    // --- 4. trajectory prediction for the top candidates --------------------
    const order: number[] = [];
    for (let c = 0; c < this.count; c++) if (this.candidates[c].valid) order.push(c);
    order.sort((a, b) => this.candidates[b].score - this.candidates[a].score);
    const topK = Math.min(8, order.length);
    for (let k = 0; k < topK; k++) {
      const cand = this.candidates[order[k]];
      const pr = this.predictions[Math.min(this.predictions.length - 1, this.predictionCount)];
      predict(pos, vel, cand.point, pos.distanceTo(cand.point), q.input, T.assist.predictHorizon, 1 / 30, w, desired, pr);
      if (this.predictionCount < this.predictions.length) this.predictionCount++;
      cand.predicted = true;
      cand.minClearance = pr.minClearance;
      cand.collided = pr.collided;
      const terms = cand.terms;
      terms.clearance = pr.collided ? -2 + Math.min(1, pr.collideTime / T.assist.predictHorizon) : Math.min(1, pr.minClearance / T.assist.groundClearance) - 0.2;
      const gain = (pr.endSpeed - speed) / 20;
      const prog = pr.progress / (Math.max(8, speed) * T.assist.predictHorizon);
      terms.speedGain = Math.max(-1, Math.min(1, gain * 0.5 + prog * 0.5));
      cand.score += A.wClearance * terms.clearance + A.wSpeedGain * terms.speedGain;
    }
    // un-predicted candidates can't beat a predicted safe one
    for (let k = topK; k < order.length; k++) this.candidates[order[k]].score -= 1.5;

    let best: AnchorCandidate | null = null;
    for (const c of order) {
      const cand = this.candidates[c];
      if (!best || cand.score > best.score) best = cand;
    }
    this.best = best;
    this.lastTimeMs = performance.now() - t0;
    return best;
  }
}

function boxDist2(w: CollisionWorld, i: number, p: Vector3): number {
  const dx = Math.max(w.minX[i] - p.x, 0, p.x - w.maxX[i]);
  const dz = Math.max(w.minZ[i] - p.z, 0, p.z - w.maxZ[i]);
  return dx * dx + dz * dz;
}
