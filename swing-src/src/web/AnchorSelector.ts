import { Vector3 } from 'three';
import { T } from '../core/tuning';
import { DEG, clamp, hlen, smoothstep } from '../core/math';
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
  collideTime: number;
}

export interface AnchorQuery {
  pos: Vector3;
  vel: Vector3;
  /** desired horizontal direction (input), may be zero */
  input: Vector3;
  camForward: Vector3;
  prevAnchor: Vector3 | null;
  /** true when `input` is the player's stick (false: a held heading synthesised by the caller) */
  stick?: boolean;
}

const NCAND = 200;

/**
 * Chooses where a web attaches. Candidates come from a cone of ray casts plus analytic points on the
 * facades and roof edges of nearby buildings, placed as close as the geometry allows to the ideal
 * anchor: ahead along the heading (≈20–40 m) and above (≈15–30 m). Each is scored on geometry
 * (ahead, height, sideways offset, building height, heading, camera, stick, continuity) and, for
 * the best few, on a forward simulation of the swing it would produce. Only building geometry
 * takes a web; it never returns a point in empty sky.
 */
export class AnchorSelector {
  readonly candidates: AnchorCandidate[] = Array.from({ length: NCAND }, () => ({
    point: new Vector3(), normal: new Vector3(), box: -1, source: 'ray' as const, valid: false,
    reason: '', score: -Infinity, terms: {}, predicted: false, minClearance: 0, collided: false, collideTime: Infinity,
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
  private readonly tdir = new Vector3();
  private readonly ideal = new Vector3();
  private readonly boxes: number[] = [];

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
    c.collideTime = Infinity;
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
    const hasInput = q.input.lengthSq() > 0.01;

    // Heading: blend of travel direction, input and camera (flattened)
    const heading = this.heading.set(0, 0, 0);
    if (hs > 2) heading.set(vel.x / hs, 0, vel.z / hs).multiplyScalar(Math.min(1, hs / 12) * 1.2);
    heading.addScaledVector(q.input, 1.4);
    const cfl = Math.hypot(q.camForward.x, q.camForward.z);
    if (cfl > 1e-3) heading.add(this.tmp.set(q.camForward.x / cfl, 0, q.camForward.z / cfl).multiplyScalar(0.6));
    if (heading.lengthSq() < 1e-6) heading.set(q.camForward.x, 0, q.camForward.z);
    heading.normalize();
    // the line the swing should follow: the stick, else the blended heading
    const desired = this.desired.copy(hasInput ? q.input : heading).setY(0).normalize();

    // the ideal anchor: ahead along the line of travel and above, further ahead when fast
    const idealAhead = clamp(T.web.idealAnchorAhead + (speed - 20) * 0.35, 20, 40);
    const idealRise = clamp(T.web.idealAnchorRise + (speed - 20) * 0.15, 15, 30);
    const ideal = this.ideal.copy(pos).addScaledVector(desired, idealAhead);
    ideal.y += idealRise;
    // where the arc should bottom out: a comfortable drop below the current height, never down in
    // the traffic. Diving in fast lowers it (the swing out of a dive sweeps low and long).
    const targetBottom = Math.max(T.assist.groundClearance + 6, pos.y - T.web.idealArcDrop - Math.max(0, -vel.y) * 0.25);

    // --- 1. ray fan -------------------------------------------------------
    const nRays = T.anchor.rayCount;
    const yawSpan = T.web.attachConeDeg * DEG;
    const baseYaw = Math.atan2(heading.x, heading.z);
    const maxLen = T.web.maxLength;
    for (let i = 0; i < nRays; i++) {
      // golden-angle spiral over the cone gives even coverage with any ray count
      const u = (i + 0.5) / nRays;
      const yaw = baseYaw + Math.sin(i * 2.39996) * yawSpan * Math.sqrt(u);
      const elev = (24 + 56 * ((i * 0.618034) % 1)) * DEG;
      const ce = Math.cos(elev);
      const d = this.dir.set(Math.sin(yaw) * ce, Math.sin(elev), Math.cos(yaw) * ce);
      if (w.raycast(pos, d, maxLen, this.hit, Kind.NoWeb, false)) {
        this.push(this.tmp.copy(this.hit.point).addScaledVector(this.hit.normal, 0.05), this.hit.normal, this.hit.box, 'ray');
      }
    }

    // --- 2. analytic facade / roof-edge points nearest the ideal anchor ----
    const R = maxLen * 0.7;
    const boxes = this.boxes;
    boxes.length = 0;
    w.queryRect(ideal.x - R, ideal.z - R, ideal.x + R, ideal.z + R, (i) => {
      if (!(w.kind[i] & Kind.Building) || w.kind[i] & (Kind.NoWeb | Kind.Low)) return;
      if (w.maxY[i] < pos.y + T.web.minAnchorHeightAbovePlayer) return;
      boxes.push(i);
    });
    // nearest to the ideal anchor first, cap the count to bound cost
    boxes.sort((a, b) => boxDist2(w, a, ideal) - boxDist2(w, b, ideal));
    const n = this.dir;
    for (let k = 0; k < Math.min(24, boxes.length); k++) {
      const i = boxes[k];
      const x0 = w.minX[i], x1 = w.maxX[i], z0 = w.minZ[i], z1 = w.maxZ[i];
      const top = w.maxY[i];
      const fy = clamp(ideal.y, w.minY[i] + 2, top - 0.3);
      // the (at most two) vertical faces that face the player
      for (let f = 0; f < 4; f++) {
        let fx: number, fz: number;
        if (f === 0) { if (pos.x >= x0) continue; n.set(-1, 0, 0); fx = x0; fz = clamp(ideal.z, z0 + 0.3, z1 - 0.3); }
        else if (f === 1) { if (pos.x <= x1) continue; n.set(1, 0, 0); fx = x1; fz = clamp(ideal.z, z0 + 0.3, z1 - 0.3); }
        else if (f === 2) { if (pos.z >= z0) continue; n.set(0, 0, -1); fz = z0; fx = clamp(ideal.x, x0 + 0.3, x1 - 0.3); }
        else { if (pos.z <= z1) continue; n.set(0, 0, 1); fz = z1; fx = clamp(ideal.x, x0 + 0.3, x1 - 0.3); }
        const px = fx + n.x * 0.05, pz = fz + n.z * 0.05;
        this.push(this.tmp.set(px, top - 0.3, pz), n, i, 'edge');
        if (fy < top - 3) this.push(this.tmp.set(px, fy, pz), n, i, 'facade');
      }
    }

    // --- 3. static scoring --------------------------------------------------
    const A = T.anchor;
    // turn request: how far the stick points away from the current travel direction
    const tdir = this.tdir.set(hs > 2 ? vel.x / hs : heading.x, 0, hs > 2 ? vel.z / hs : heading.z);
    const lateralSign = Math.sign(tdir.x * desired.z - tdir.z * desired.x);
    const turnAmt = hasInput ? 1 - clamp(tdir.dot(desired), -1, 1) : 0;
    const cone = Math.cos(T.web.attachConeDeg * DEG);
    for (let c = 0; c < this.count; c++) {
      const cand = this.candidates[c];
      const to = this.toA.subVectors(cand.point, pos);
      const dist = to.length();
      const rise = to.y;
      const hd = Math.hypot(to.x, to.z);
      const terms = cand.terms;
      // webs stick to real geometry: buildings, or solid rooftop structures (water tanks, billboard
      // frames) at a penalty; never poles, the street or the sky
      if (cand.box < 0 || !(w.kind[cand.box] & (Kind.Building | Kind.Prop)) || w.kind[cand.box] & Kind.NoWeb) { cand.valid = false; cand.reason = 'not structure'; continue; }
      if (rise < T.web.minAnchorHeightAbovePlayer) { cand.valid = false; cand.reason = 'too low'; continue; }
      if (dist > maxLen) { cand.valid = false; cand.reason = 'too far'; continue; }
      // short ropes at speed mean huge centripetal loads (v²/L); scale the minimum with speed
      if (dist < Math.max(T.web.minLength * 1.4, speed * 0.45)) { cand.valid = false; cand.reason = 'too close'; continue; }
      // shallow anchors produce huge drops; the web must pull mostly upward
      if (Math.atan2(rise, hd) < T.web.minAnchorElevationDeg * DEG) { cand.valid = false; cand.reason = 'too shallow'; continue; }
      const hx = hd > 1e-3 ? to.x / hd : 0, hz = hd > 1e-3 ? to.z / hd : 0;
      const along = hx * heading.x + hz * heading.z;
      if (hd > 4 && along < cone - (speed < 5 ? 0.6 : 0)) { cand.valid = false; cand.reason = 'outside cone'; continue; }
      // swing plane: the arc bottom lies under the anchor, so a sideways anchor swings you into
      // the facade. Rule those out once moving fast.
      const vdir = hs > 2 ? (to.x * vel.x + to.z * vel.z) / (hd * hs + 1e-6) : along;
      const planeRef = hs > 4 ? vdir : along;
      const planeDeg = Math.acos(clamp(planeRef, -1, 1)) / DEG;
      if (hs > 15 && planeDeg > 65) { cand.valid = false; cand.reason = 'sideways at speed'; continue; }
      // visibility: a clear line from the hand to the anchor
      this.tmp.set(pos.x, pos.y + 0.6, pos.z);
      const dir = this.dir.subVectors(cand.point, this.tmp);
      const dl = dir.length();
      dir.multiplyScalar(1 / dl);
      if (w.raycast(this.tmp, dir, dl - 0.6, this.hit, Kind.NoWeb, false)) { cand.valid = false; cand.reason = 'occluded'; continue; }

      // geometry relative to the line of travel
      const fwd = to.x * desired.x + to.z * desired.z;
      const lat = Math.abs(to.x * desired.z - to.z * desired.x);
      // quadratic, not Gaussian: an anchor twice as far as ideal must lose clearly, not just tie
      terms.ahead = clamp(1 - Math.pow((fwd - idealAhead) / 13, 2), -3, 1);
      terms.height = clamp(1 - Math.pow((rise - idealRise) / 11, 2), -2, 1);
      // the arc bottom (anchor height − rope length) should sweep low between the buildings, not
      // scrape the street or stay up at roof level: this is what keeps a chain at a steady altitude
      const bottom = cand.point.y - dist;
      terms.bottom = clamp(1 - Math.pow((bottom - targetBottom) / 10, 2), -2, 1);
      // long webs make slow, floaty arcs
      terms.length = -smoothstep(50, 90, dist);
      terms.prop = w.kind[cand.box] & Kind.Building ? 0 : -1;
      // a sideways offset of about half a street is free; beyond that the swing gets harder to steer
      const latFree = 6 + 0.2 * Math.max(0, fwd);
      terms.side = Math.exp(-Math.pow(Math.max(0, lat - latFree) / 10, 2)) * 2 - 1;
      terms.tall = smoothstep(pos.y + 5, pos.y + 90, w.maxY[cand.box]);
      terms.direction = 0.5 + 0.5 * vdir;
      const cdir = (to.x * q.camForward.x + to.y * q.camForward.y + to.z * q.camForward.z) / (dist + 1e-6);
      terms.camera = 0.5 + 0.5 * cdir;
      terms.input = hasInput ? 0.5 + 0.5 * (hx * desired.x + hz * desired.z) : 0.5;
      // turning: prefer anchors on the side we're turning to (the rope pulls us round the corner)
      const side = Math.sign(tdir.x * to.z - tdir.z * to.x);
      terms.turn = turnAmt > 0.15 ? (side === lateralSign ? turnAmt : -turnAmt * 0.5) : 0;
      // continuity: don't re-use the same point
      if (q.prevAnchor) {
        const dp = cand.point.distanceTo(q.prevAnchor);
        terms.continuity = dp < 6 ? -1 : Math.min(1, dp / 30);
      } else terms.continuity = 0.5;
      terms.visibility = cand.source === 'ray' ? 1 : 0.85;
      terms.plane = hs > 4 ? (Math.exp(-Math.pow(Math.max(0, planeDeg - 12) / 16, 2)) * 2 - 1) * (0.6 + 0.8 * Math.min(1, (hs - 4) / 16)) : 0;
      cand.score =
        A.wAhead * terms.ahead + A.wHeight * terms.height + A.wSide * terms.side * Math.max(0.3, 1 - turnAmt) +
        A.wBottom * terms.bottom + A.wLength * terms.length + A.wProp * terms.prop +
        A.wTall * terms.tall + A.wDirection * terms.direction + A.wCamera * terms.camera + A.wInput * terms.input +
        A.wTurn * terms.turn + A.wContinuity * terms.continuity + A.wVisibility * terms.visibility +
        A.wPlane * terms.plane * Math.max(0.15, 1 - 1.6 * turnAmt);
    }

    // --- 4. trajectory prediction for the top candidates --------------------
    const order: number[] = [];
    for (let c = 0; c < this.count; c++) if (this.candidates[c].valid) order.push(c);
    order.sort((a, b) => this.candidates[b].score - this.candidates[a].score);
    const topK = Math.min(8, order.length);
    const stick = q.stick ?? hasInput;
    for (let k = 0; k < topK; k++) {
      const cand = this.candidates[order[k]];
      const pr = this.predictions[Math.min(this.predictions.length - 1, this.predictionCount)];
      predict(pos, vel, cand.point, pos.distanceTo(cand.point), stick ? q.input : null, T.assist.predictHorizon, 1 / 30, w, desired, pr);
      if (this.predictionCount < this.predictions.length) this.predictionCount++;
      cand.predicted = true;
      cand.minClearance = pr.minClearance;
      cand.collided = pr.collided;
      cand.collideTime = pr.collideTime;
      // a web that slams you into geometry almost immediately is never the right answer
      if (pr.collided && pr.collideTime < 0.5) { cand.valid = false; cand.reason = 'immediate collision'; }
      const terms = cand.terms;
      terms.clearance = pr.collided ? -2 + Math.min(1, pr.collideTime / T.assist.predictHorizon) : Math.min(1, pr.minClearance / T.assist.groundClearance) - 0.2;
      const gain = (pr.endSpeed - speed) / 20;
      const prog = pr.progress / (Math.max(8, speed) * T.assist.predictHorizon);
      terms.speedGain = clamp(gain * 0.5 + prog * 0.5, -1, 1);
      cand.score += A.wClearance * terms.clearance + A.wSpeedGain * terms.speedGain;
    }
    // un-predicted candidates can't beat a predicted safe one
    for (let k = topK; k < order.length; k++) this.candidates[order[k]].score -= 1.5;

    let best: AnchorCandidate | null = null;
    for (const c of order) {
      const cand = this.candidates[c];
      if (!cand.valid) continue;
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
