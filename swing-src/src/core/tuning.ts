/**
 * Central registry of every gameplay tuning value. The dev panel builds itself from the
 * metadata here, so a new parameter only needs to be added in one place.
 * All values are SI (m, s, kg, N) unless noted.
 */

export interface ParamMeta {
  min: number;
  max: number;
  step?: number;
  label?: string;
}

export const Tuning = {
  physics: {
    gravity: 19.6, // stylised ~2g: superhero scale feels floaty at 9.81
    mass: 80,
    airDrag: 0.3, // ½ρ·Cd·A for an upright body (kg/m)
    diveDrag: 0.11, // streamlined dive
    maxNormalSpeed: 42, // soft cap for swings and flight (strong chains sit just under it)
    maxDiveSpeed: 56, // dive terminal speed (soft)
    speedLimitSoftness: 6.0, // 1/s rate at which excess speed bleeds off in flight (grows with the excess)
    swingSpeedSoftness: 1.6, // 1/s gentler bleed while swinging, so dive speed carries through arcs
    fixedHz: 120,
  },
  ground: {
    walkSpeed: 2.2,
    jogSpeed: 6.5,
    sprintSpeed: 15,
    accel: 38,
    sprintAccel: 22,
    decel: 30,
    turnRate: 12, // rad/s of heading response
    jumpSpeed: 9.5,
    jumpHoldGravityScale: 0.55, // gravity while jump held and rising → variable height
    superJumpSpeed: 26,
    superJumpChargeTime: 0.45,
    coyoteTime: 0.12,
    jumpBuffer: 0.12,
    stepHeight: 0.55,
  },
  air: {
    airSteerAccel: 11,
    airSteerMaxSpeedGain: 2.0, // steering may add at most this much speed along input
    diveAccel: 14,
    fastDiveAccel: 30,
    trickDuration: 0.55,
  },
  web: {
    maxLength: 95,
    minLength: 7,
    elasticity: 0.6, // 0 = rigid rope, 1 = fully spring-limited
    stiffness: 9000, // N/m when stretched
    damping: 900, // N·s/m on outward radial velocity
    maxStretch: 1.2, // m
    restitution: 0.04,
    catchWindow: 0.3, // s after attach where catch redirection applies
    catchRedirect: 0.55, // fraction of outward radial speed redirected tangentially during catch
    swingGravityScale: 1.2,
    downswingPull: 0.4, // extra gravity fraction while dropping forward into the arc: the swing pulls
    upswingLift: 0.08, // gravity reduction on the up-swing so the arc carries over the top
    pumpForce: 420, // N tangential, full on down-swing
    upswingPumpScale: 0.25,
    noStickPump: 0.45, // pump strength when holding swing with no stick (keeps the heading)
    swingSteerForce: 1150, // N lateral (out of swing plane) steering
    steerBrakeForce: 1500, // N: pulling against the motion costs speed
    turnSpeedCost: 0.22, // fraction of lateral turning force paid back as speed
    reelRate: 14, // m/s manual/auto retraction
    releaseBoost: 4.5, // m/s horizontal forward throw, scaled by release timing
    releaseUpBoost: 2.0,
    autoReleaseScale: 0.6, // throw strength of the automatic end-of-arc release (manual timing earns more)
    autoReleasePhase: 0.96, // arc phase at which a held swing lets go and chains
    chainDelay: 0.1, // s between an automatic release and the next web while swing is still held
    refireDelay: 0.3, // s after a release before a held swing fires again (re-press is faster)
    swingJumpSpeed: 8.5, // m/s launch added by a swing jump
    swingJumpHop: 3.5, // m/s up for a jump on the down-swing
    swingJumpPitchBottom: 12, // deg above horizontal for a jump at the bottom of the arc
    swingJumpPitchLate: 76, // deg for a jump at the end of the arc
    swingJumpTuckPhase: 0.5, // arc phase of the leg tuck (the ideal jump moment)
    swingJumpPerfectWindow: 0.13, // s, centred on the tuck
    swingJumpPerfectBonus: 0.5, // extra launch fraction for a perfect jump
    swingSpeedPreservation: 0.75, // 0..1 fraction of air drag removed while swinging
    fireCooldown: 0.12,
    detachAboveAnchor: 0.5, // m above anchor → auto release (rope would go slack)
    attachConeDeg: 70,
    minAnchorHeightAbovePlayer: 6,
    idealAnchorAhead: 28, // m forward along the heading (20–40)
    idealAnchorRise: 21, // m above the player (15–30)
    idealArcDrop: 16, // m the arc bottom should sit below the height the web is fired at
    minAnchorElevationDeg: 24,
  },
  assist: {
    strength: 10, // Swing Assist 0–10: 0 = raw rope physics (ground and walls hurt), 10 = full help
    groundClearance: 4.5, // desired min clearance at arc bottom
    minSwingAltitude: 3.0,
    groundAvoidForce: 1600, // N max predictive lift
    autoShorten: 1,
    autoExtend: 1,
    cornerAvoidForce: 1200, // wall-slam protection: push off walls ahead
    arcCorrection: 2.2, // 1/s: damps drift away from the held heading
    arcCorrectionMaxAccel: 13, // m/s²
    swingPlaneAssist: 0.85, // share of the rope's sideways pull cancelled
    streetCentering: 9, // m/s² push away from a facade that is close beside the swing
    streetCenterRange: 11, // m
    wallSlamBelow: 3, // assist strength below which swinging into a wall is a slam, not a wall run
    forwardAssistForce: 200, // N along desired direction when input pressed
    predictHorizon: 1.6,
  },
  anchor: {
    rayCount: 56,
    wAhead: 1.3, // forward distance along the heading near idealAnchorAhead
    wHeight: 1.1, // rise above the player near idealAnchorRise
    wSide: 1.0, // sideways offset beyond about half a street is penalised
    wBottom: 0.8, // arc bottom sweeps low between buildings (keeps chains at a steady altitude)
    wLength: 1.5, // long webs make slow, floaty arcs
    wTall: 0.4, // prefer taller buildings
    wProp: 0.6, // rooftop structures (tanks, billboards) only when no building edge will do
    wDirection: 1.0,
    wCamera: 0.6,
    wInput: 1.3,
    wClearance: 2.2,
    wVisibility: 0.4,
    wContinuity: 0.5,
    wTurn: 1.2,
    wSpeedGain: 0.5,
    wPlane: 0.9,
  },
  zip: {
    zipSpeed: 48,
    zipAccel: 220,
    zipForwardDistance: 45,
    zipBurst: 11, // m/s added along the aim by a forward zip
    zipMinSpeed: 22,
    zipMaxSpeed: 40,
    zipBurstTime: 0.2, // s
    maxAirZips: 1, // forward zips per air phase (a swing, landing or wall resets it)
    pointLaunchUp: 21,
    pointLaunchForward: 17,
    pointLaunchWindow: 0.35,
    pointPerfectWindow: 0.12, // s either side of landing on the point
    pointPerfectBonus: 0.3,
    pointMaxDistance: 70,
    pointConeDeg: 26,
  },
  wall: {
    wallRunSpeed: 16,
    wallRunMaxSpeed: 40,
    wallRunUpSpeed: 17,
    wallRunDuration: 3.5,
    wallCrawlSpeed: 4.5,
    wallJumpOut: 10,
    wallJumpUp: 11,
    wallLaunchOut: 7, // jump off a horizontal run: out from the wall, keeping the run speed
    wallLaunchUp: 9.5,
    stickForce: 30,
    minEntrySpeed: 4,
    slamSpeed: 9, // m/s into the wall that counts as a slam when assist is low
  },
  landing: {
    rollSpeed: 18, // vertical impact speed (m/s) that triggers roll when moving
    hardSpeed: 28,
    recoveryTime: 0.35,
    rollTime: 0.5,
  },
  camera: {
    distance: 5.2,
    distanceAtSpeed: 7.5,
    height: 1.4,
    fov: 62,
    fovAtSpeed: 84,
    fovSpeedRef: 60,
    lag: 9,
    lookAhead: 0.35,
    rollAmount: 0.55,
    shake: 0.4,
    autoRecenter: 1.6,
    sensitivity: 0.0022,
  },
} satisfies Record<string, Record<string, number>>;

export type TuningT = { [G in keyof typeof Tuning]: { [K in keyof (typeof Tuning)[G]]: number } };
/** Mutable view used everywhere at runtime. */
export const T = Tuning as unknown as TuningT;

/** Ranges for the dev panel. Missing entries get an automatic range. */
export const TuningMeta: Record<string, ParamMeta> = {
  'physics.gravity': { min: 5, max: 40, step: 0.1 },
  'physics.mass': { min: 30, max: 200, step: 1 },
  'web.elasticity': { min: 0, max: 1, step: 0.01 },
  'web.swingGravityScale': { min: 0.5, max: 2.5, step: 0.01 },
  'web.catchRedirect': { min: 0, max: 1, step: 0.01 },
  'web.swingSpeedPreservation': { min: 0, max: 1, step: 0.01 },
  'web.downswingPull': { min: 0, max: 1.5, step: 0.01 },
  'web.upswingLift': { min: 0, max: 0.5, step: 0.01 },
  'web.swingJumpTuckPhase': { min: 0.1, max: 0.95, step: 0.01 },
  'web.swingJumpPerfectWindow': { min: 0.02, max: 0.5, step: 0.01 },
  'web.autoReleasePhase': { min: 0.5, max: 1, step: 0.01 },
  'assist.strength': { min: 0, max: 10, step: 1, label: 'Swing Assist (0 raw rope – 10 full)' },
  'assist.autoShorten': { min: 0, max: 1, step: 1 },
  'assist.autoExtend': { min: 0, max: 1, step: 1 },
  'assist.swingPlaneAssist': { min: 0, max: 1, step: 0.01 },
  'assist.wallSlamBelow': { min: 0, max: 10, step: 1 },
  'zip.maxAirZips': { min: 0, max: 5, step: 1 },
  'physics.fixedHz': { min: 30, max: 240, step: 1 },
};

export function metaFor(path: string, value: number): ParamMeta {
  const m = TuningMeta[path];
  if (m) return m;
  const mag = Math.max(1, Math.abs(value));
  return { min: 0, max: mag * 3, step: mag >= 10 ? 1 : 0.01 };
}

const defaults = JSON.parse(JSON.stringify(Tuning));
export function resetTuning(): void {
  const t = T as unknown as Record<string, Record<string, number>>;
  for (const g of Object.keys(defaults)) for (const k of Object.keys(defaults[g])) t[g][k] = defaults[g][k];
}
