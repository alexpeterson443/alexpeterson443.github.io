import {
  FogExp2, HemisphereLight, MathUtils, PMREMGenerator, Scene, Vector3,
  type Object3D, type Texture, type WebGLRenderer, type WebGLRenderTarget,
} from 'three';
import { clamp, smoothstep } from '../core/math';
import { installAtmosphere, writeAtmosphere, type AtmoScales } from './Atmosphere';
import { SkyDome } from './SkyDome';
import { SunShadows } from './SunShadows';
import { lookAt, sunAngles, type Look } from './look';

/** Shared uniforms read by city shaders (window lights, street-lamp pools…). */
export const envUniforms = {
  uNight: { value: 0 },
  uTime: { value: 0 },
};

/** Live multipliers on the authored look, exposed in the dev panel. */
export const atmoScales: AtmoScales = { fog: 1, heightFog: 1, heightFalloff: 1, stars: 1, sky: 1 };

/**
 * Time-of-day environment: an art-directed look (sky, fog, lights, exposure, grade) interpolated from
 * keyframes, an analytic sky dome sharing its GLSL with the height/aerial-perspective fog, a key light
 * (sun by day, moon by night) with a near + far shadow cascade, and an image-based lighting
 * environment captured from the sky whenever the time of day changes.
 */
export class Environment {
  readonly skyTime = { value: 0 };
  readonly sky = new SkyDome(this.skyTime);
  readonly shadows: SunShadows;
  readonly hemi = new HemisphereLight(0xbfd6ff, 0x3a3530, 0.6);
  readonly sunDir = new Vector3();
  readonly moonDir = new Vector3();
  /** The look for the current time of day (read by post-processing). */
  readonly look: Look = lookAt(0.71);
  private pmrem: PMREMGenerator;
  private envRT: WebGLRenderTarget | null = null;
  private skyScene = new Scene();
  private lastEnvTime = -1;
  timeOfDay = 0.71; // 0..1 (0.5 = noon); default golden hour

  constructor(private scene: Scene, private renderer: WebGLRenderer) {
    installAtmosphere();
    this.shadows = new SunShadows(scene);
    scene.add(this.sky.mesh, this.hemi);
    // three only compiles the fog chunks when a scene has fog; the atmosphere ignores its values
    scene.fog = new FogExp2(0x000000, 0);
    this.pmrem = new PMREMGenerator(renderer);
    this.apply();
  }

  /** The key light (sun by day, moon by night). */
  get sun() { return this.shadows.key; }

  setShadowQuality(size: number, enabled: boolean, far = enabled): void {
    this.shadows.setQuality(size, size, enabled, far);
  }

  /** City meshes that cast into the static far cascade. */
  setStaticCasters(root: Object3D): void {
    this.shadows.setStaticCasters(root);
  }

  /** Recompute sky, fog, lights and exposure for the current time of day. */
  apply(): void {
    const t = this.timeOfDay;
    const L = lookAt(t, this.look);
    const { elev, azim } = sunAngles(t);
    this.sunDir.setFromSphericalCoords(1, MathUtils.degToRad(90 - elev), MathUtils.degToRad(azim));
    // the moon rides roughly opposite the sun, a little higher so it clears the skyline
    const mElev = Math.max(18, -elev * 0.8 + 12);
    this.moonDir.setFromSphericalCoords(1, MathUtils.degToRad(90 - mElev), MathUtils.degToRad(azim + 160));
    writeAtmosphere(L, this.sunDir, this.moonDir, atmoScales);

    // key light: the sun while it is up, handing over to the moon through twilight
    const sunUp = smoothstep(-3, 4, elev);
    const key = this.shadows.key;
    if (sunUp > 0.02) {
      this.shadows.setDirection(this._dir.copy(this.sunDir).setY(Math.max(0.04, this.sunDir.y)).normalize());
      key.color.setRGB(L.sunColor[0], L.sunColor[1], L.sunColor[2]);
      key.intensity = L.sunIntensity * sunUp;
    } else {
      this.shadows.setDirection(this.moonDir);
      key.color.setRGB(L.moonColor[0], L.moonColor[1], L.moonColor[2]);
      key.intensity = L.moonIntensity;
    }
    this.hemi.color.setRGB(L.hemiSky[0], L.hemiSky[1], L.hemiSky[2]);
    this.hemi.groundColor.setRGB(L.hemiGround[0], L.hemiGround[1], L.hemiGround[2]);
    this.hemi.intensity = L.hemiIntensity;
    this.renderer.toneMappingExposure = L.exposure;
    envUniforms.uNight.value = clamp(1 - smoothstep(-4, 14, elev), 0, 1) * 0.85 + 0.15 * smoothstep(35, 5, elev) * smoothstep(-6, 12, elev);
    if (Math.abs(this.lastEnvTime - t) > 0.004) this.rebuildEnv(L);
  }
  private readonly _dir = new Vector3();

  private rebuildEnv(L: Look): void {
    this.lastEnvTime = this.timeOfDay;
    this.scene.remove(this.sky.mesh);
    this.skyScene.add(this.sky.mesh);
    this.sky.envMode = true;
    const rt = this.pmrem.fromScene(this.skyScene, 0, 0.1, 5000);
    this.sky.envMode = false;
    this.skyScene.remove(this.sky.mesh);
    this.scene.add(this.sky.mesh);
    this.envRT?.dispose();
    this.envRT = rt;
    this.scene.environment = rt.texture as Texture;
    this.scene.environmentIntensity = L.envIntensity;
  }

  /** Keep the near shadow frustum centred on the player (texel-snapped in light space). */
  followShadow(focus: Vector3): void {
    this.shadows.follow(focus);
  }

  /** Before the frame's main render: re-bake the far cascade if the light moved. */
  prepare(): void {
    this.shadows.bake(this.renderer, this.scene);
  }

  update(dt: number): void {
    envUniforms.uTime.value += dt;
    this.skyTime.value += dt;
  }
}
