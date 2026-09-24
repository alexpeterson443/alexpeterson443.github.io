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
    maxNormalSpeed: 58,
    maxDiveSpeed: 95,
    speedLimitSoftness: 6.0, // 1/s rate at which excess speed bleeds off
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
    catchRedirect: 0.7, // fraction of outward radial speed redirected tangentially during catch
    swingGravityScale: 1.2,
    pumpForce: 1100, // N tangential, full on down-swing
    upswingPumpScale: 0.3,
    swingSteerForce: 1150, // N lateral (out of swing plane) steering
    reelRate: 14, // m/s manual/auto retraction
    releaseBoost: 5.5, // m/s along velocity, scaled by timing quality
    releaseUpBoost: 4.5,
    jumpReleaseUpBoost: 7,
    idealReleaseAngleMin: 12, // degrees past bottom of arc
    idealReleaseAngleMax: 55,
    swingSpeedPreservation: 0.75, // 0..1 fraction of air drag removed while swinging
    fireCooldown: 0.12,
    detachAboveAnchor: 0.5, // m above anchor → auto release (rope would go slack)
    attachConeDeg: 70,
    minAnchorHeightAbovePlayer: 6,
    idealAnchorDistance: 38,
    idealAnchorElevationDeg: 50,
    minAnchorElevationDeg: 24,
  },
  assist: {
    enabled: 1,
    groundClearance: 4.5, // desired min clearance at arc bottom
    minSwingAltitude: 3.0,
    groundAvoidForce: 1600, // N max predictive lift
    autoShorten: 1,
    autoExtend: 1,
    cornerAvoidForce: 1200,
    turnAssist: 0.6,
    swingPlaneAssist: 0.85,
    forwardAssistForce: 280, // N along desired direction when input pressed
    predictHorizon: 1.6,
  },
  anchor: {
    rayCount: 40,
    wDistance: 1.0,
    wHeight: 1.0,
    wDirection: 1.6,
    wCamera: 0.8,
    wInput: 1.3,
    wClearance: 2.2,
    wVisibility: 1.0,
    wContinuity: 0.5,
    wTurn: 1.2,
    wStreet: 0.5,
    wSpeedGain: 1.4,
    wPlane: 1.8,
  },
  zip: {
    zipSpeed: 48,
    zipAccel: 220,
    zipForwardDistance: 45,
    zipForwardImpulse: 20,
    pointLaunchUp: 21,
    pointLaunchForward: 17,
    pointLaunchWindow: 0.35,
    pointMaxDistance: 70,
    pointConeDeg: 26,
  },
  wall: {
    wallRunSpeed: 16,
    wallRunUpSpeed: 17,
    wallRunDuration: 3.5,
    wallCrawlSpeed: 4.5,
    wallJumpOut: 10,
    wallJumpUp: 11,
    stickForce: 30,
    minEntrySpeed: 4,
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
  'assist.enabled': { min: 0, max: 1, step: 1 },
  'assist.autoShorten': { min: 0, max: 1, step: 1 },
  'assist.autoExtend': { min: 0, max: 1, step: 1 },
  'assist.turnAssist': { min: 0, max: 1, step: 0.01 },
  'assist.swingPlaneAssist': { min: 0, max: 1, step: 0.01 },
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
