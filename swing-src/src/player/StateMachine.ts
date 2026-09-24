import type { Intent } from '../input/Intent';
import type { Player } from './Player';

export type StateId =
  | 'Grounded' | 'Airborne' | 'Landing' | 'Recovery' | 'Trick'
  | 'Swinging' | 'WebZip' | 'PointLaunch' | 'Perching'
  | 'WallRunning' | 'WallCrawling' | 'Vaulting' | 'Mantling';

/** High-level grouping used by animation/camera (the hierarchy's parent states). */
export type StateGroup = 'Locomotion' | 'Air' | 'Web' | 'Wall' | 'Parkour';

export interface MoveState {
  readonly id: StateId;
  readonly group: StateGroup;
  enter?(p: Player, from: StateId | null, input: Intent | null): void;
  exit?(p: Player, to: StateId): void;
  /** Advance one fixed step. Return a state id to transition (after this step), or null. */
  step(p: Player, dt: number, input: Intent): StateId | null;
}

const registry = new Map<StateId, MoveState>();
export function registerState(s: MoveState): void {
  registry.set(s.id, s);
}
export function getState(id: StateId): MoveState {
  const s = registry.get(id);
  if (!s) throw new Error(`state ${id} not registered`);
  return s;
}

/**
 * Hierarchical FSM driver. States are stateless singletons; per-player data lives on Player.
 * Any state may request any transition; interruptions are expressed in each state's step so
 * priorities are explicit and local.
 */
export class StateMachine {
  current: MoveState;
  previous: StateId | null = null;
  time = 0;
  /** Recent transitions (for tests and the debug HUD). */
  readonly history: { from: StateId; to: StateId; t: number }[] = [];
  private lastInput: Intent | null = null;

  constructor(private p: Player) {
    this.current = getState('Airborne');
  }

  reset(id: StateId): void {
    this.current = getState(id);
    this.previous = null;
    this.time = 0;
    this.current.enter?.(this.p, null, this.lastInput);
  }

  step(dt: number, input: Intent): void {
    this.lastInput = input;
    this.time += dt;
    let next = this.current.step(this.p, dt, input);
    // allow a few immediate chained transitions (e.g. Airborne → Swinging → WallRunning) per step
    for (let guard = 0; next && guard < 3; guard++) {
      if (next === this.current.id) break;
      next = this.transition(next, input);
    }
  }

  /** Performs a transition. Returns an optional follow-up transition requested by enter(). */
  transition(to: StateId, input: Intent | null): StateId | null {
    const from = this.current;
    from.exit?.(this.p, to);
    this.previous = from.id;
    this.current = getState(to);
    this.time = 0;
    this.history.push({ from: from.id, to, t: this.p.simTime });
    if (this.history.length > 200) this.history.shift();
    this.p.emit('state');
    this.pendingRedirect = null;
    this.current.enter?.(this.p, from.id, input);
    const r = this.pendingRedirect;
    this.pendingRedirect = null;
    return r;
  }

  /** Called from enter() to immediately redirect to another state. */
  redirect(to: StateId): void {
    this.pendingRedirect = to;
  }
  private pendingRedirect: StateId | null = null;
}
