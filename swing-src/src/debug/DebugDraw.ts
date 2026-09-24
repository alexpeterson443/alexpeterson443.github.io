import { BufferAttribute, BufferGeometry, Color, LineBasicMaterial, LineSegments, Vector3, type Camera, type Scene } from 'three';

const MAX = 24000;

/**
 * Immediate-mode debug lines (cleared every frame) plus pooled DOM text labels projected to
 * screen. One draw call for all lines.
 */
export class DebugDraw {
  private pos = new Float32Array(MAX * 2 * 3);
  private col = new Float32Array(MAX * 2 * 3);
  private n = 0;
  private geo = new BufferGeometry();
  readonly lines: LineSegments;
  private labels: HTMLDivElement[] = [];
  private labelN = 0;
  private readonly c = new Color();
  private readonly _p = new Vector3();
  enabled = false;

  constructor(scene: Scene, private overlay: HTMLElement) {
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new BufferAttribute(this.col, 3));
    this.lines = new LineSegments(this.geo, new LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, toneMapped: false }));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 10;
    scene.add(this.lines);
  }

  begin(): void {
    this.n = 0;
    this.labelN = 0;
  }

  line(a: Vector3, b: Vector3, color: number | Color): void {
    if (this.n >= MAX) return;
    const c = typeof color === 'number' ? this.c.setHex(color) : color;
    const o = this.n * 6;
    this.pos[o] = a.x; this.pos[o + 1] = a.y; this.pos[o + 2] = a.z;
    this.pos[o + 3] = b.x; this.pos[o + 4] = b.y; this.pos[o + 5] = b.z;
    this.col[o] = c.r; this.col[o + 1] = c.g; this.col[o + 2] = c.b;
    this.col[o + 3] = c.r; this.col[o + 4] = c.g; this.col[o + 5] = c.b;
    this.n++;
  }

  lineXYZ(ax: number, ay: number, az: number, bx: number, by: number, bz: number, color: number | Color): void {
    this.line(this._a.set(ax, ay, az), this._b.set(bx, by, bz), color);
  }
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();

  arrow(from: Vector3, vec: Vector3, scale: number, color: number | Color): void {
    const to = this._p.copy(from).addScaledVector(vec, scale);
    this.line(from, to, color);
    this.cross(to, 0.12, color);
  }

  cross(p: Vector3, s: number, color: number | Color): void {
    this.lineXYZ(p.x - s, p.y, p.z, p.x + s, p.y, p.z, color);
    this.lineXYZ(p.x, p.y - s, p.z, p.x, p.y + s, p.z, color);
    this.lineXYZ(p.x, p.y, p.z - s, p.x, p.y, p.z + s, color);
  }

  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number | Color): void {
    const L = (a: number, b: number, c: number, d: number, e: number, f: number) => this.lineXYZ(a, b, c, d, e, f, color);
    L(x0, y0, z0, x1, y0, z0); L(x1, y0, z0, x1, y0, z1); L(x1, y0, z1, x0, y0, z1); L(x0, y0, z1, x0, y0, z0);
    L(x0, y1, z0, x1, y1, z0); L(x1, y1, z0, x1, y1, z1); L(x1, y1, z1, x0, y1, z1); L(x0, y1, z1, x0, y1, z0);
    L(x0, y0, z0, x0, y1, z0); L(x1, y0, z0, x1, y1, z0); L(x1, y0, z1, x1, y1, z1); L(x0, y0, z1, x0, y1, z1);
  }

  circle(c: Vector3, r: number, color: number | Color, seg = 16): void {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      this.lineXYZ(c.x + Math.cos(a0) * r, c.y, c.z + Math.sin(a0) * r, c.x + Math.cos(a1) * r, c.y, c.z + Math.sin(a1) * r, color);
    }
  }

  label(p: Vector3, text: string, camera: Camera, color = '#fff'): void {
    const v = this._p.copy(p).project(camera);
    if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) return;
    let el = this.labels[this.labelN];
    if (!el) {
      el = document.createElement('div');
      el.className = 'dbg-label';
      this.overlay.appendChild(el);
      this.labels.push(el);
    }
    this.labelN++;
    el.style.display = 'block';
    el.style.transform = `translate(${((v.x + 1) / 2) * this.overlay.clientWidth}px, ${((1 - v.y) / 2) * this.overlay.clientHeight}px)`;
    if (el.textContent !== text) el.textContent = text;
    el.style.color = color;
  }

  end(): void {
    this.geo.setDrawRange(0, this.n * 2);
    (this.geo.attributes.position as BufferAttribute).needsUpdate = true;
    (this.geo.attributes.color as BufferAttribute).needsUpdate = true;
    this.lines.visible = this.enabled && this.n > 0;
    for (let i = this.labelN; i < this.labels.length; i++) this.labels[i].style.display = 'none';
  }
}
