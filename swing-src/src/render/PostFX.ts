import { HalfFloatType, Vector2, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

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
      float vig = smoothstep(0.85, 0.25, r * (1.0 + uVignette * 0.6 + uAmount * 0.25));
      col *= mix(1.0 - uVignette, 1.0, vig);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

/** Post-processing chain: scene (HDR) → bloom → speed blur/vignette → tone map + sRGB → SMAA. */
export class PostFX {
  composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private speed: ShaderPass;
  private smaa: SMAAPass;
  enabled = true;

  constructor(private renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const size = renderer.getDrawingBufferSize(new Vector2());
    const rt = new WebGLRenderTarget(size.x, size.y, { type: HalfFloatType, samples: 0 });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new Vector2(size.x, size.y), 0.55, 0.55, 0.92);
    this.composer.addPass(this.bloom);
    this.speed = new ShaderPass(SpeedShader);
    this.composer.addPass(this.speed);
    this.composer.addPass(new OutputPass());
    this.smaa = new SMAAPass();
    this.composer.addPass(this.smaa);
  }

  setQuality(q: Quality): void {
    this.enabled = q !== 'low';
    this.bloom.enabled = q !== 'low';
    this.smaa.enabled = q === 'high' || q === 'ultra';
    this.bloom.resolution.set(q === 'ultra' ? 1 : 0.5, q === 'ultra' ? 1 : 0.5);
  }

  setSpeed(amount: number): void {
    this.speed.uniforms.uAmount.value = amount;
  }

  setBloom(strength: number): void {
    this.bloom.strength = strength;
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h);
  }

  render(scene: Scene, camera: Camera, dt: number): void {
    if (this.enabled) this.composer.render(dt);
    else this.renderer.render(scene, camera);
  }
}
