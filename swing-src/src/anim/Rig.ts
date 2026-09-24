import {
  CapsuleGeometry, Group, Mesh, MeshStandardMaterial, Object3D, SphereGeometry, BoxGeometry, Color,
  type BufferGeometry, type Material,
} from 'three';

/**
 * Procedural humanoid: a 19-joint hierarchy of Object3D "bones" with primitive meshes attached.
 * Local frame: +Z forward, +Y up, +X = character's left. Limbs rest pointing down (−Y).
 * Height ≈ 1.8 m with the root at the centre of mass (feet 0.9 m below).
 */
export class Rig {
  readonly root = new Group();
  readonly hips = new Object3D();
  readonly spine = new Object3D();
  readonly chest = new Object3D();
  readonly neck = new Object3D();
  readonly head = new Object3D();
  readonly shoulderL = new Object3D();
  readonly upperArmL = new Object3D();
  readonly foreArmL = new Object3D();
  readonly handL = new Object3D();
  readonly shoulderR = new Object3D();
  readonly upperArmR = new Object3D();
  readonly foreArmR = new Object3D();
  readonly handR = new Object3D();
  readonly thighL = new Object3D();
  readonly shinL = new Object3D();
  readonly footL = new Object3D();
  readonly thighR = new Object3D();
  readonly shinR = new Object3D();
  readonly footR = new Object3D();

  static readonly UPPER_ARM = 0.29;
  static readonly FORE_ARM = 0.27;
  static readonly THIGH = 0.44;
  static readonly SHIN = 0.43;

  private readonly materials: Material[] = [];

  constructor() {
    const suit = new MeshStandardMaterial({ color: new Color(0.07, 0.08, 0.11), roughness: 0.55, metalness: 0.15 });
    const accent = new MeshStandardMaterial({ color: new Color(0.02, 0.35, 0.42), emissive: new Color(0.0, 0.55, 0.7), emissiveIntensity: 0.9, roughness: 0.35 });
    const panel = new MeshStandardMaterial({ color: new Color(0.16, 0.18, 0.22), roughness: 0.4, metalness: 0.35 });
    const lens = new MeshStandardMaterial({ color: 0xffffff, emissive: 0xe8fbff, emissiveIntensity: 1.6, roughness: 0.1 });
    const glove = new MeshStandardMaterial({ color: new Color(0.03, 0.03, 0.04), roughness: 0.6 });
    this.materials.push(suit, accent, panel, lens, glove);

    const link = (parent: Object3D, child: Object3D, x: number, y: number, z: number) => {
      child.position.set(x, y, z);
      parent.add(child);
    };
    this.root.add(this.hips);
    this.hips.position.set(0, 0.02, 0);
    link(this.hips, this.spine, 0, 0.1, 0);
    link(this.spine, this.chest, 0, 0.18, 0);
    link(this.chest, this.neck, 0, 0.24, 0);
    link(this.neck, this.head, 0, 0.08, 0);
    link(this.chest, this.shoulderL, 0.17, 0.17, 0);
    link(this.shoulderL, this.upperArmL, 0.05, 0, 0);
    link(this.upperArmL, this.foreArmL, 0, -Rig.UPPER_ARM, 0);
    link(this.foreArmL, this.handL, 0, -Rig.FORE_ARM, 0);
    link(this.chest, this.shoulderR, -0.17, 0.17, 0);
    link(this.shoulderR, this.upperArmR, -0.05, 0, 0);
    link(this.upperArmR, this.foreArmR, 0, -Rig.UPPER_ARM, 0);
    link(this.foreArmR, this.handR, 0, -Rig.FORE_ARM, 0);
    link(this.hips, this.thighL, 0.1, -0.05, 0);
    link(this.thighL, this.shinL, 0, -Rig.THIGH, 0);
    link(this.shinL, this.footL, 0, -Rig.SHIN, 0);
    link(this.hips, this.thighR, -0.1, -0.05, 0);
    link(this.thighR, this.shinR, 0, -Rig.THIGH, 0);
    link(this.shinR, this.footR, 0, -Rig.SHIN, 0);

    const cap = (r: number, len: number) => new CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 6, 12);
    const attach = (bone: Object3D, geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
      const m = new Mesh(geo, mat);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      m.castShadow = true;
      bone.add(m);
      return m;
    };
    // torso: pelvis, abdomen, chest (with a V-shaped accent), shoulders
    attach(this.hips, new SphereGeometry(0.15, 16, 12), suit, 0, 0, 0, 1.15, 0.8, 0.85);
    attach(this.spine, cap(0.13, 0.3), suit, 0, 0.08, 0, 1.05, 1, 0.8);
    attach(this.chest, cap(0.17, 0.36), suit, 0, 0.1, 0, 1.2, 1, 0.8);
    attach(this.chest, new BoxGeometry(0.2, 0.04, 0.02), accent, 0.07, 0.14, 0.13).rotation.z = -0.6;
    attach(this.chest, new BoxGeometry(0.2, 0.04, 0.02), accent, -0.07, 0.14, 0.13).rotation.z = 0.6;
    attach(this.chest, new BoxGeometry(0.12, 0.18, 0.05), panel, 0, 0.02, -0.12);
    attach(this.neck, cap(0.055, 0.12), suit, 0, 0.03, 0);
    // head with two lenses
    attach(this.head, new SphereGeometry(0.115, 20, 16), suit, 0, 0.1, 0, 0.92, 1.08, 1);
    attach(this.head, new SphereGeometry(0.04, 12, 8), lens, 0.045, 0.12, 0.095, 1.1, 0.7, 0.4).rotation.z = 0.35;
    attach(this.head, new SphereGeometry(0.04, 12, 8), lens, -0.045, 0.12, 0.095, 1.1, 0.7, 0.4).rotation.z = -0.35;
    // limbs: accent bands on forearms and shins make motion readable at speed
    for (const [ua, fa, h, s] of [[this.upperArmL, this.foreArmL, this.handL, 1], [this.upperArmR, this.foreArmR, this.handR, -1]] as const) {
      attach(s > 0 ? this.shoulderL : this.shoulderR, new SphereGeometry(0.075, 12, 10), suit, 0.03 * s, 0, 0);
      attach(ua, cap(0.065, Rig.UPPER_ARM), suit, 0, -Rig.UPPER_ARM / 2, 0);
      attach(fa, cap(0.055, Rig.FORE_ARM), suit, 0, -Rig.FORE_ARM / 2, 0);
      attach(fa, new CapsuleGeometry(0.058, 0.06, 4, 10), accent, 0, -Rig.FORE_ARM * 0.7, 0);
      attach(h, new BoxGeometry(0.07, 0.1, 0.04), glove, 0, -0.04, 0.01);
    }
    for (const [th, sh, ft] of [[this.thighL, this.shinL, this.footL], [this.thighR, this.shinR, this.footR]] as const) {
      attach(th, cap(0.085, Rig.THIGH), suit, 0, -Rig.THIGH / 2, 0);
      attach(sh, cap(0.065, Rig.SHIN), suit, 0, -Rig.SHIN / 2, 0);
      attach(sh, new CapsuleGeometry(0.068, 0.08, 4, 10), accent, 0, -Rig.SHIN * 0.25, 0);
      attach(ft, new BoxGeometry(0.1, 0.07, 0.24), glove, 0, -0.02, 0.06);
    }
  }

  dispose(): void {
    this.root.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
    for (const m of this.materials) m.dispose();
  }
}
