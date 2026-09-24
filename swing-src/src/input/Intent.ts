import { Vector3 } from 'three';

/**
 * Abstract player intent for one simulation step. Devices (keyboard, gamepad, bench scripts)
 * all write into this, so gameplay code never touches raw input.
 */
export class Intent {
  /** Stick/WASD in camera space: x = right, y = forward, magnitude 0..1. */
  moveX = 0;
  moveY = 0;
  /** Camera yaw (rad, 0 = looking toward -Z) and pitch. */
  camYaw = 0;
  camPitch = 0;
  /** Normalised full 3D camera look direction. */
  camForward = new Vector3(0, 0, -1);

  jump = false;
  traverse = false; // swing / parkour
  zip = false;
  dive = false;
  trick = false;
  drop = false;
  reel = false;

  // edges, computed by `latch`
  jumpPressed = false;
  jumpReleased = false;
  traversePressed = false;
  traverseReleased = false;
  zipPressed = false;
  trickPressed = false;
  dropPressed = false;

  private prev = { jump: false, traverse: false, zip: false, trick: false, drop: false };

  /** Compute edge flags from current vs previous held state. Call once per fixed step. */
  latch(): void {
    const p = this.prev;
    this.jumpPressed = this.jump && !p.jump;
    this.jumpReleased = !this.jump && p.jump;
    this.traversePressed = this.traverse && !p.traverse;
    this.traverseReleased = !this.traverse && p.traverse;
    this.zipPressed = this.zip && !p.zip;
    this.trickPressed = this.trick && !p.trick;
    this.dropPressed = this.drop && !p.drop;
    p.jump = this.jump; p.traverse = this.traverse; p.zip = this.zip; p.trick = this.trick; p.drop = this.drop;
  }

  get moveMag(): number {
    return Math.min(1, Math.hypot(this.moveX, this.moveY));
  }

  /** World-space horizontal move direction scaled by stick magnitude. */
  moveWorld(out: Vector3): Vector3 {
    const s = Math.sin(this.camYaw), c = Math.cos(this.camYaw);
    // forward = (-sin, 0, -cos), right = (cos, 0, -sin)
    out.set(-s * this.moveY + c * this.moveX, 0, -c * this.moveY - s * this.moveX);
    const m = out.length();
    if (m > 1) out.multiplyScalar(1 / m);
    return out;
  }

  camForwardFlat(out: Vector3): Vector3 {
    return out.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
  }
}
