import {
  Color, DirectionalLight, FogExp2, HemisphereLight, MathUtils, PMREMGenerator, Scene, Vector3,
  type Texture, type WebGLRenderer, type WebGLRenderTarget,
} from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { clamp, lerp, smoothstep } from '../core/math';

/** Shared uniforms read by city shaders (window lights, street-lamp pools…). */
export const envUniforms = {
  uNight: { value: 0 },
  uTime: { value: 0 },
};

/**
 * Physical sky (atmospheric scattering), sun + sky lighting, height-tinted fog and an image-based
 * lighting environment regenerated when the time of day changes.
 */
export class Environment {
  readonly sky = new Sky();
  readonly sun = new DirectionalLight(0xffffff, 3);
  readonly hemi = new HemisphereLight(0xbfd6ff, 0x3a3530, 0.6);
  readonly sunDir = new Vector3();
  private pmrem: PMREMGenerator;
  private envRT: WebGLRenderTarget | null = null;
  private skyScene = new Scene();
  private lastEnvTime = -1;
  timeOfDay = 0.71; // 0..1 (0.5 = noon); default golden hour
  shadowSize = 2048;
  shadowExtent = 90;

  constructor(private scene: Scene, private renderer: WebGLRenderer) {
    this.sky.scale.setScalar(4500);
    const u = this.sky.material.uniforms;
    u.turbidity.value = 4.5;
    u.rayleigh.value = 1.6;
    u.mieCoefficient.value = 0.004;
    u.mieDirectionalG.value = 0.85;
    scene.add(this.sky);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(this.shadowSize, this.shadowSize);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.6;
    const c = this.sun.shadow.camera;
    c.left = -this.shadowExtent; c.right = this.shadowExtent; c.top = this.shadowExtent; c.bottom = -this.shadowExtent;
    c.near = 1; c.far = 1400;
    scene.add(this.sun, this.sun.target, this.hemi);
    scene.fog = new FogExp2(0x9fb4c8, 0.0011);
    this.pmrem = new PMREMGenerator(renderer);
    this.apply();
  }

  setShadowQuality(size: number, enabled: boolean): void {
    this.sun.castShadow = enabled;
    if (size !== this.shadowSize) {
      this.shadowSize = size;
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null as never;
    }
  }

  /** Recompute sun, sky, fog and light colours for the current time of day. */
  apply(): void {
    const t = this.timeOfDay;
    // sun path: rises at 0.25, sets at 0.75
    const elev = Math.sin((t - 0.25) * Math.PI * 2) * 62; // degrees
    const azim = 200 + (t - 0.5) * 140;
    const phi = MathUtils.degToRad(90 - elev);
    const theta = MathUtils.degToRad(azim);
    this.sunDir.setFromSphericalCoords(1, phi, theta);
    this.sky.material.uniforms.sunPosition.value.copy(this.sunDir);
    const day = smoothstep(-6, 12, elev);
    const golden = smoothstep(35, 5, elev) * day;
    envUniforms.uNight.value = clamp(1 - smoothstep(-4, 14, elev), 0, 1) * 0.85 + 0.15 * golden;
    const sunCol = new Color().setRGB(1, lerp(0.95, 0.62, golden), lerp(0.9, 0.38, golden));
    this.sun.color.copy(sunCol);
    this.sun.intensity = lerp(0.0, 3.4, day);
    this.hemi.intensity = lerp(0.12, 0.75, day);
    this.hemi.color.setRGB(lerp(0.25, 0.72, day), lerp(0.3, 0.8, day), lerp(0.5, 0.95, day));
    this.hemi.groundColor.setRGB(lerp(0.08, 0.3, day), lerp(0.07, 0.26, day), lerp(0.08, 0.22, day));
    const fog = this.scene.fog as FogExp2;
    fog.color.setRGB(lerp(0.05, 0.7, day) * lerp(1, 1.12, golden), lerp(0.07, 0.72, day), lerp(0.12, 0.8, day) * lerp(1, 0.78, golden));
    fog.density = lerp(0.0016, 0.001, day);
    this.renderer.toneMappingExposure = lerp(0.55, 0.62, day);
    if (Math.abs(this.lastEnvTime - t) > 0.004) this.rebuildEnv();
  }

  private rebuildEnv(): void {
    this.lastEnvTime = this.timeOfDay;
    this.scene.remove(this.sky);
    this.skyScene.add(this.sky);
    const rt = this.pmrem.fromScene(this.skyScene, 0, 0.1, 5000);
    this.skyScene.remove(this.sky);
    this.scene.add(this.sky);
    this.envRT?.dispose();
    this.envRT = rt;
    this.scene.environment = rt.texture as Texture;
    this.scene.environmentIntensity = 0.9;
  }

  /** Keep the shadow frustum centred on the player, snapped to texels to avoid shimmer. */
  followShadow(focus: Vector3): void {
    const ext = this.shadowExtent;
    const texel = (2 * ext) / this.shadowSize;
    const d = this.sunDir;
    const cx = Math.round(focus.x / texel) * texel;
    const cy = Math.round(focus.y / texel) * texel;
    const cz = Math.round(focus.z / texel) * texel;
    this.sun.target.position.set(cx, cy, cz);
    this.sun.position.set(cx + d.x * 600, cy + Math.max(0.05, d.y) * 600, cz + d.z * 600);
    this.sun.target.updateMatrixWorld();
  }

  update(dt: number): void {
    envUniforms.uTime.value += dt;
  }
}
