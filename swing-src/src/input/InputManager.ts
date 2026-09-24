import type { Intent } from './Intent';

/**
 * Keyboard + mouse (pointer lock) + standard gamepad → Intent and camera look deltas.
 *
 * Default bindings
 *   WASD / arrows  move          Mouse / right stick   camera
 *   Space / A      jump          Shift / RMB / RT      swing & parkour (hold)
 *   E / LMB / RB   web zip · point launch                Q / LB   dive (hold)
 *   F / Y          trick         C / B                 drop off wall/perch
 *   R              reel in web
 */
export class InputManager {
  private keys = new Set<string>();
  private mouseButtons = 0;
  lookDX = 0;
  lookDY = 0;
  locked = false;
  gamepadActive = false;
  /** one-shot UI keys consumed by the game (debug toggles etc.) */
  readonly pressedOnce = new Set<string>();
  private listeners: [EventTarget, string, EventListener][] = [];

  constructor(el: HTMLElement) {
    const on = (t: EventTarget, ev: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      t.addEventListener(ev, fn, opts);
      this.listeners.push([t, ev, fn]);
    };
    on(window, 'keydown', (e) => {
      const k = (e as KeyboardEvent).code;
      if (!this.keys.has(k)) this.pressedOnce.add(k);
      this.keys.add(k);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1', 'F2', 'F3'].includes(k)) e.preventDefault();
    });
    on(window, 'keyup', (e) => this.keys.delete((e as KeyboardEvent).code));
    on(window, 'blur', () => { this.keys.clear(); this.mouseButtons = 0; });
    on(el, 'mousedown', (e) => {
      const me = e as MouseEvent;
      this.mouseButtons |= 1 << me.button;
      if (!this.locked) el.requestPointerLock?.();
    });
    on(window, 'mouseup', (e) => { this.mouseButtons &= ~(1 << (e as MouseEvent).button); });
    on(el, 'contextmenu', (e) => e.preventDefault());
    on(document, 'pointerlockchange', () => { this.locked = document.pointerLockElement === el; });
    on(window, 'mousemove', (e) => {
      const me = e as MouseEvent;
      // without pointer lock (some embedded views refuse it) the cursor over the game still turns the camera
      if (!this.locked && me.target !== el) return;
      this.lookDX += me.movementX;
      this.lookDY += me.movementY;
    });
  }

  key(code: string): boolean {
    return this.keys.has(code);
  }

  consume(code: string): boolean {
    const had = this.pressedOnce.has(code);
    this.pressedOnce.delete(code);
    return had;
  }

  /** Fill held-state fields of the intent. Edges are computed by Intent.latch() per fixed step. */
  fill(intent: Intent): { padLookX: number; padLookY: number } {
    const k = (c: string) => this.keys.has(c);
    let mx = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0);
    let my = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
    const walk = k('AltLeft') || k('KeyX');
    const scale = walk ? 0.35 : 1;
    let jump = k('Space');
    let traverse = k('ShiftLeft') || k('ShiftRight') || (this.mouseButtons & 4) !== 0;
    let zip = k('KeyE') || (this.mouseButtons & 2) !== 0 || (this.locked && (this.mouseButtons & 1) !== 0);
    let dive = k('KeyQ');
    let trick = k('KeyF');
    let drop = k('KeyC');
    const reel = k('KeyR');
    let padLookX = 0, padLookY = 0;
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || gp.mapping !== 'standard') continue;
      const dz = (v: number) => (Math.abs(v) < 0.15 ? 0 : (v - Math.sign(v) * 0.15) / 0.85);
      const lx = dz(gp.axes[0]), ly = dz(gp.axes[1]);
      const rx = dz(gp.axes[2]), ry = dz(gp.axes[3]);
      const b = (i: number) => !!gp.buttons[i]?.pressed;
      const any = Math.abs(lx) + Math.abs(ly) + Math.abs(rx) + Math.abs(ry) > 0 || gp.buttons.some((x) => x.pressed);
      if (any) this.gamepadActive = true;
      if (Math.abs(lx) + Math.abs(ly) > 0) { mx = lx; my = -ly; }
      padLookX = rx;
      padLookY = ry;
      jump ||= b(0);
      drop ||= b(1);
      trick ||= b(3);
      dive ||= b(4);
      zip ||= b(5);
      traverse ||= (gp.buttons[7]?.value ?? 0) > 0.3;
      break;
    }
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    intent.moveX = mx * scale;
    intent.moveY = my * scale;
    intent.jump = jump;
    intent.traverse = traverse;
    intent.zip = zip;
    intent.dive = dive;
    intent.trick = trick;
    intent.drop = drop;
    intent.reel = reel;
    return { padLookX, padLookY };
  }

  dispose(): void {
    for (const [t, ev, fn] of this.listeners) t.removeEventListener(ev, fn);
  }
}
