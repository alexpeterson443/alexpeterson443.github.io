import { Vector3 } from 'three';
import { CollisionWorld, Kind } from '../src/world/CollisionWorld';
import { Intent } from '../src/input/Intent';
import { Player } from '../src/player/Player';
import { generateCity } from '../src/city/CityGenerator';
import { buildCollision } from '../src/city/buildCollision';
import { resetTuning, T } from '../src/core/tuning';

/** A tiny hand-made test map: a street canyon between two long towers, plus a low box. */
export function canyonWorld(): CollisionWorld {
  const w = new CollisionWorld(16);
  // tower A (west side of the street): x ∈ [-40,-10], tower B (east): x ∈ [10,40]; street along -Z
  w.addBox(-40, 0, -400, -10, 80, 50, Kind.Building, 0);
  w.addBox(10, 0, -400, 40, 80, 50, Kind.Building, 1);
  // low obstacle in the street
  w.addBox(-2, 0, -30, 2, 1.1, -28, Kind.Prop | Kind.Low, -1);
  w.build();
  return w;
}

export function makePlayer(world: CollisionWorld): Player {
  resetTuning();
  return new Player(world, null);
}

export function stepN(p: Player, input: Intent, n: number, dt = 1 / 120, each?: (i: number) => void): void {
  for (let i = 0; i < n; i++) {
    input.latch();
    p.step(dt, input);
    each?.(i);
  }
}

export function cityPlayer(seed = 1337) {
  resetTuning();
  const city = generateCity({ seed });
  const world = buildCollision(city);
  const p = new Player(world, city);
  return { city, world, p };
}

export const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);
export { T };
