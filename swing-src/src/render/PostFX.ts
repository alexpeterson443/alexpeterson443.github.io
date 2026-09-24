import { HalfFloatType, Vector2, Vector3, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import type { Look } from './look';

export type Quality = 'low' | 'medium' | 'high' | 'ultra';

/** Speed-driven radial blur + vignette + subtle chromatic fringe, applied in HDR before tone mapping. */
const SpeedShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0 },
    uVignette: { value: 0.35 },
    uCenter: { value: new Vector2(0.5, 0.52) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmount; uniform float uVignette; uniform vec2 uCenter;
    varying vec2 vUv;
    void main(){
      vec2 d = vUv - uCenter;
      float r = length(d);
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      if (uAmount > 0.001) {
        // blur only toward the edges so the hero at the centre stays crisp
        float k = uAmount * smoothstep(0.12, 0.7, r);
        vec3 acc = col; float wsum = 1.0;
        for (int i = 1; i <= 8; i++) {
          float s = float(i) / 8.0;
          vec2 uv = vUv - d * s * k * 0.12;
          acc += texture2D(tDiffuse, uv).rgb * (1.0 - s * 0.5);
          wsum += 1.0 - s * 0.5;
        }
        col = acc / wsum;
        float ca = k * 0.0015;
        col.r = mix(col.r, texture2D(tDiffuse, vUv + d * ca).r, 0.6);
        col.b = mix(col.b, texture2D(tDiffuse, vUv - d * ca).b, 0.6);
      }
      float vig = 1.0 - smoothstep(0.25, 0.85, r * (1.0 + uVignette * 0.6 + uAmount * 0.25));
      col *= mix(1.0 - uVignette, 1.0, vig);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

/**
 * Scene-referred grade, before tone mapping: contrast in log space around mid grey (so it never
 * clips), then saturation and vibrance (vibrance lifts muted colours more than saturated ones).
 */
const GradeHDRShader = {
  uniforms: {
    tDiffuse: { value: null },
    uContrast: { value: 1 },
    uSaturation: { value: 1 },
    uVibrance: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uContrast; uniform float uSaturation; uniform float uVibrance;
    varying vec2 vUv;
    void main(){
      vec3 c = max(texture2D(tDiffuse, vUv).rgb, vec3(0.0));
      c = 0.18 * pow(c / 0.18 + 1e-6, vec3(uContrast));
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
      float sat = (mx - mn) / max(mx, 1e-5);
      float k = uSaturation * (1.0 + uVibrance * (1.0 - sat));
      c = max(mix(vec3(l), c, k), vec3(0.0));
      gl_FragColor = vec4(c, 1.0);
    }`,
};

/**
 * Display-referred grade, after tone mapping: lift/gamma/gain per channel and split toning (cool
 * shadows, warm highlights around a movable pivot).
 */
const GradeLDRShader = {
  uniforms: {
    tDiffuse: { value: null },
    uLift: { value: new Vector3(0, 0, 0) },
    uGamma: { value: new Vector3(1, 1, 1) },
    uGain: { value: new Vector3(1, 1, 1) },
    uSplitShadows: { value: 0 },
    uSplitHighlights: { value: 0 },
    uSplitBalance: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec3 uLift; uniform vec3 uGamma; uniform vec3 uGain;
    uniform float uSplitShadows; uniform float uSplitHighlights; uniform float uSplitBalance;
    varying vec2 vUv;
    void main(){
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 c = clamp(src.rgb, 0.0, 1.0);
      c = clamp(c * uGain + uLift * (1.0 - c), 0.0, 1.0);
      c = pow(c, 1.0 / max(uGamma, vec3(0.01)));
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float pivot = 0.5 + uSplitBalance * 0.25;
      float sh = (1.0 - smoothstep(0.0, pivot, l)) * uSplitShadows;
      float hi = smoothstep(pivot, 1.0, l) * uSplitHighlights;
      c += (vec3(-0.035, 0.0, 0.05) * sh + vec3(0.045, 0.012, -0.04) * hi) * (1.0 - l * 0.5);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), src.a);
    }`,
};

/**
 * Post-processing chain: scene (HDR) → bloom → speed blur/vignette → HDR grade → tone map + sRGB →
 * display grade → SMAA. `setLook` drives bloom, vignette and both grades from the time-of-day look.
 */
export class PostFX {
  composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private speed: ShaderPass;
  private gradeHDR: ShaderPass;
  private gradeLDR: ShaderPass;
  private smaa: SMAAPass;
  enabled = true;
  /** Dev-panel multiplier on the look's bloom strength. */
  bloomScale = 1;
  private lookBloom = 0.6;

  constructor(private renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const size = renderer.getDrawingBufferSize(new Vector2());
    const rt = new WebGLRenderTarget(size.x, size.y, { type: HalfFloatType, samples: 0 });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new Vector2(size.x, size.y), 0.55, 0.5, 1.2);
    // one NaN/Inf texel in the bloom input is blurred across every mip into a black frame:
    // scrub the high-pass input so a single bad pixel stays a single bad pixel
    const hp = this.bloom.materialHighPassFilter;
    hp.fragmentShader = hp.fragmentShader.replace(
      'vec4 texel = texture2D( tDiffuse, vUv );',
      'vec4 texel = texture2D( tDiffuse, vUv );\n\t\t\tif ( any( isnan( texel ) ) || any( isinf( texel ) ) ) texel = vec4( 0.0 );\n\t\t\ttexel = min( texel, vec4( 4096.0 ) );',
    );
    hp.needsUpdate = true;
    this.composer.addPass(this.bloom);
    this.speed = new ShaderPass(SpeedShader);
    this.composer.addPass(this.speed);
    this.gradeHDR = new ShaderPass(GradeHDRShader);
    this.composer.addPass(this.gradeHDR);
    this.composer.addPass(new OutputPass());
    this.gradeLDR = new ShaderPass(GradeLDRShader);
    this.composer.addPass(this.gradeLDR);
    this.smaa = new SMAAPass();
    this.composer.addPass(this.smaa);
  }

  /** Bloom, vignette and grade for the current look. */
  setLook(L: Look): void {
    this.lookBloom = L.bloomStrength;
    this.bloom.strength = L.bloomStrength * this.bloomScale;
    // the look's threshold is in exposed units; bloom runs on the scene-referred image
    this.bloom.threshold = L.bloomThreshold / Math.max(0.05, L.exposure);
    this.speed.uniforms.uVignette.value = L.vignette;
    const h = this.gradeHDR.uniforms;
    h.uContrast.value = L.contrast;
    h.uSaturation.value = L.saturation;
    h.uVibrance.value = L.vibrance;
    const d = this.gradeLDR.uniforms;
    (d.uLift.value as Vector3).fromArray(L.lift);
    (d.uGamma.value as Vector3).fromArray(L.gamma);
    (d.uGain.value as Vector3).fromArray(L.gain);
    d.uSplitShadows.value = L.splitShadows;
    d.uSplitHighlights.value = L.splitHighlights;
    d.uSplitBalance.value = L.splitBalance;
  }

  setQuality(q: Quality): void {
    this.enabled = q !== 'low';
    this.bloom.enabled = q !== 'low';
    this.smaa.enabled = q === 'high' || q === 'ultra';
  }

  setSpeed(amount: number): void {
    this.speed.uniforms.uAmount.value = amount;
  }

  setBloom(scale: number): void {
    this.bloomScale = scale;
    this.bloom.strength = this.lookBloom * scale;
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h);
  }

  render(scene: Scene, camera: Camera, dt: number): void {
    if (this.enabled) this.composer.render(dt);
    else this.renderer.render(scene, camera);
  }
}
