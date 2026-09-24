import {
  Box3, DirectionalLight, NoToneMapping, OrthographicCamera, PerspectiveCamera, ShaderChunk, Vector3,
  WebGLRenderTarget, type Object3D, type Scene, type WebGLRenderer,
} from 'three';

/** Layer carried by static city meshes (and the far-cascade light) so the far map can be baked from them alone. */
export const STATIC_LAYER = 7;

/**
 * Replacement for three's directional-light block in `lights_fragment_begin`.
 * Light 0 is the key light (sun or moon). Its shadow is the camera-following near map (slot 0), faded
 * into a static whole-city far map (slot 1) toward the near map's edge. Slot 1 belongs to a
 * zero-intensity carrier light, which the generic loop skips, so it never adds light itself.
 */
const CASCADE_BLOCK = /* glsl */ `
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	directionalLight = directionalLights[ 0 ];
	getDirectionalLightInfo( directionalLight, directLight );
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	if ( directLight.visible && receiveShadow ) {
		directionalLightShadow = directionalLightShadows[ 0 ];
		vec2 strandEdge = abs( vDirectionalShadowCoord[ 0 ].xy / vDirectionalShadowCoord[ 0 ].w - 0.5 ) * 2.0;
		float strandFar = smoothstep( 0.8, 0.98, max( strandEdge.x, strandEdge.y ) );
		float strandSh = 1.0;
		if ( strandFar < 1.0 ) strandSh = getShadow( directionalShadowMap[ 0 ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ 0 ] );
		#if NUM_DIR_LIGHT_SHADOWS > 1
		if ( strandFar > 0.0 && dot( directionalLights[ 1 ].color, vec3( 1.0 ) ) == 0.0 ) {
			directionalLightShadow = directionalLightShadows[ 1 ];
			float strandShF = getShadow( directionalShadowMap[ 1 ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ 1 ] );
			strandSh = mix( strandSh, strandShF, strandFar );
		}
		#endif
		directLight.color *= strandSh;
	}
	#endif
	RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	#if NUM_DIR_LIGHTS > 1
	#pragma unroll_loop_start
	for ( int i = 1; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		if ( dot( directionalLight.color, vec3( 1.0 ) ) > 0.0 ) {
			getDirectionalLightInfo( directionalLight, directLight );
			#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
			directionalLightShadow = directionalLightShadows[ i ];
			directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
			#endif
			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
		}
	}
	#pragma unroll_loop_end
	#endif

#endif
`;

let patched: boolean | null = null;

/** Swap the directional-light loop for the cascaded version. Returns false if three's chunk changed shape. */
export function installCascadeChunk(): boolean {
  if (patched !== null) return patched;
  const src = ShaderChunk.lights_fragment_begin;
  const a = src.indexOf('#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )');
  const b = a < 0 ? -1 : src.indexOf('#pragma unroll_loop_end', a);
  const c = b < 0 ? -1 : src.indexOf('#endif', b);
  patched = c >= 0;
  if (patched) ShaderChunk.lights_fragment_begin = src.slice(0, a) + CASCADE_BLOCK + src.slice(c + '#endif'.length);
  else console.warn('[strand] lights_fragment_begin changed shape; far shadow cascade disabled');
  return patched;
}

const UP = new Vector3(0, 1, 0);

/**
 * Key light (sun by day, moon by night) with two shadow cascades:
 *  - near: follows the player, texel-snapped in light space so it never shimmers;
 *  - far: covers the whole city, baked once per light-direction change from static meshes only,
 *    so the long golden-hour shadows reach across distant streets at almost no per-frame cost.
 */
export class SunShadows {
  readonly key = new DirectionalLight(0xffffff, 1);
  readonly far = new DirectionalLight(0xffffff, 0);
  readonly dir = new Vector3(0, 1, 0);
  nearExtent = 90;
  nearSize = 2048;
  farSize = 2048;
  private farEnabled = true;
  private farDirty = true;
  private staticRoot: Object3D | null = null;
  private readonly bounds = new Box3();
  private readonly staticCam = new PerspectiveCamera(10, 1, 0.1, 1);
  private readonly bakeRT = new WebGLRenderTarget(1, 1);
  private readonly _a = new Vector3();
  private readonly _b = new Vector3();
  private readonly _c = new Vector3();
  private readonly cascade: boolean;

  constructor(scene: Scene) {
    this.cascade = installCascadeChunk();
    const k = this.key;
    k.castShadow = true;
    k.shadow.mapSize.set(this.nearSize, this.nearSize);
    k.shadow.bias = -0.0003;
    k.shadow.normalBias = 0.45;
    const c = k.shadow.camera;
    c.left = -this.nearExtent; c.right = this.nearExtent; c.top = this.nearExtent; c.bottom = -this.nearExtent;
    c.near = 1; c.far = 2600;
    const f = this.far;
    f.castShadow = this.cascade;
    f.shadow.autoUpdate = false;
    f.shadow.mapSize.set(this.farSize, this.farSize);
    f.shadow.bias = -0.0006;
    f.shadow.normalBias = 1.1;
    f.layers.enable(STATIC_LAYER);
    // the static bake camera sees only static meshes, and looks at nothing so its colour pass is empty
    this.staticCam.layers.set(STATIC_LAYER);
    this.staticCam.position.set(0, -1e5, 0);
    this.staticCam.lookAt(0, -2e5, 0);
    this.staticCam.updateMatrixWorld();
    scene.add(k, k.target, f, f.target);
  }

  /** Meshes under `root` become far-cascade casters. Call once the city exists. */
  setStaticCasters(root: Object3D): void {
    this.staticRoot = root;
    root.traverse((o) => o.layers.enable(STATIC_LAYER));
    this.bounds.setFromObject(root);
    this.farDirty = true;
  }

  setQuality(nearSize: number, farSize: number, enabled: boolean, farEnabled: boolean): void {
    this.key.castShadow = enabled;
    const far = enabled && farEnabled && this.cascade;
    if (far !== this.farEnabled || far !== this.far.castShadow) this.farDirty = true;
    this.farEnabled = far;
    this.far.castShadow = far;
    if (nearSize !== this.nearSize) {
      this.nearSize = nearSize;
      this.key.shadow.mapSize.set(nearSize, nearSize);
      this.key.shadow.map?.dispose();
      this.key.shadow.map = null;
    }
    if (farSize !== this.farSize) {
      this.farSize = farSize;
      this.far.shadow.mapSize.set(farSize, farSize);
      this.far.shadow.map?.dispose();
      this.far.shadow.map = null;
      this.farDirty = true;
    }
  }

  /** New key-light direction (unit vector toward the light). Re-bakes the far cascade when it moves. */
  setDirection(d: Vector3): void {
    if (this.dir.distanceToSquared(d) > 1e-8) this.farDirty = true;
    this.dir.copy(d);
  }

  /** Keep the near frustum centred on the focus, snapped to whole texels in light space. */
  follow(focus: Vector3): void {
    const d = this.dir;
    const right = this._a.crossVectors(UP, d);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = this._b.crossVectors(d, right);
    const texel = (2 * this.nearExtent) / this.nearSize;
    const fx = Math.round(focus.dot(right) / texel) * texel;
    const fy = Math.round(focus.dot(up) / texel) * texel;
    const fz = focus.dot(d);
    const c = this._c.set(0, 0, 0).addScaledVector(right, fx).addScaledVector(up, fy).addScaledVector(d, fz);
    this.key.target.position.copy(c);
    this.key.position.copy(c).addScaledVector(d, 1100);
    this.key.target.updateMatrixWorld();
    this.key.updateMatrixWorld();
  }

  /** Bake the far cascade if the light moved or quality changed (before the frame's main render). */
  bake(renderer: WebGLRenderer, scene: Scene): void {
    if (!this.farDirty || !this.staticRoot) return;
    this.farDirty = false;
    if (!this.far.castShadow || !renderer.shadowMap.enabled) return;
    this.fitFar();
    this.far.shadow.needsUpdate = true;
    const prev = renderer.getRenderTarget();
    const tm = renderer.toneMapping;
    renderer.toneMapping = NoToneMapping;
    renderer.setRenderTarget(this.bakeRT);
    renderer.render(scene, this.staticCam);
    renderer.setRenderTarget(prev);
    renderer.toneMapping = tm;
  }

  /** Fit the far cascade's ortho frustum around the city (plus room for long shadows) as seen from the light. */
  private fitFar(): void {
    const b = this.bounds;
    const m = 160;
    const d = this.dir;
    const center = b.getCenter(this._a);
    const f = this.far;
    f.target.position.copy(center);
    f.position.copy(center).addScaledVector(d, 2500);
    f.target.updateMatrixWorld();
    f.updateMatrixWorld();
    const cam = f.shadow.camera as OrthographicCamera;
    cam.position.copy(f.position);
    cam.lookAt(center);
    cam.updateMatrixWorld();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    const p = this._b;
    for (let i = 0; i < 8; i++) {
      p.set(i & 1 ? b.max.x + m : b.min.x - m, i & 2 ? b.max.y : 0, i & 4 ? b.max.z + m : b.min.z - m).applyMatrix4(cam.matrixWorldInverse);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
    }
    cam.left = x0; cam.right = x1; cam.bottom = y0; cam.top = y1;
    cam.near = Math.max(1, -z1 - 20);
    cam.far = -z0 + 20;
    cam.updateProjectionMatrix();
  }

  get farTexel(): number {
    const cam = this.far.shadow.camera as OrthographicCamera;
    return Math.max(cam.right - cam.left, cam.top - cam.bottom) / this.farSize;
  }
}
