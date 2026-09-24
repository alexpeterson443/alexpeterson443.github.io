/**
 * Body dimensions shared by the player and its states. Kept in their own module so the state
 * files do not import constants from Player.ts, which imports them (a cycle that throws in dev).
 */

/** Capsule approximated by three spheres (offsets from body centre). */
export const CAPSULE_R = 0.4;
export const CAPSULE_OFFSETS = [-0.5, 0, 0.45];
export const FEET = 0.9; // body centre height above feet
