import {
  BufferGeometry, ClampToEdgeWrapping, DataTexture, Float32BufferAttribute, FloatType, LinearFilter,
  Mesh, RGBAFormat, RepeatWrapping, ShaderMaterial,
} from 'three';
import { HORIZON_GLSL, hUniforms } from './HorizonShared';
import { PANO_BINS, WATER_Y, type HorizonLayout } from './HorizonLayout';

/**
 * Harbour and river water on the layout's water cells. The surface normal is a sum of wind waves
 * that calm with distance (so it never aliases); the colour is a Fresnel blend of the deep water
 * body and a reflection of the sky, with the far shores' skyline reflected from the layout's
 * panorama (height and distance per azimuth), a sun glint, and at night broken streaks of city light.
 */
export class Water {
  readonly mesh: Mesh;

  constructor(layout: HorizonLayout) {
    const { xs, zs, cells } = layout;
    const nx = xs.length - 1;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j < zs.length - 1; j++) {
      for (let i = 0; i < nx; i++) {
        if (cells[i + j * nx] !== 0) continue;
        const b = pos.length / 3;
        pos.push(xs[i], WATER_Y, zs[j], xs[i + 1], WATER_Y, zs[j], xs[i + 1], WATER_Y, zs[j + 1], xs[i], WATER_Y, zs[j + 1]);
        idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeBoundingSphere();

    const pano = new DataTexture(new Float32Array(layout.pano), PANO_BINS, 1, RGBAFormat, FloatType);
    pano.wrapS = RepeatWrapping;
    pano.wrapT = ClampToEdgeWrapping;
    pano.magFilter = pano.minFilter = LinearFilter;
    pano.needsUpdate = true;

    const mat = new ShaderMaterial({
      uniforms: { ...hUniforms, uPano: { value: pano }, uCentre: { value: [layout.centre.x, layout.centre.z] } },
      vertexShader: /* glsl */ `
        varying vec3 vW;
        varying float vDepth;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mv = viewMatrix * w;
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        ${HORIZON_GLSL}
        uniform sampler2D uPano;
        uniform vec2 uCentre;
        varying vec3 vW;
        varying float vDepth;
        // one directional wave: returns d(height)/d(xz)
        vec2 wave(vec2 p, vec2 dir, float len, float amp, float speed) {
          float k = 6.2831853 / len;
          float ph = dot(p, dir) * k - hTime * speed * k;
          return dir * (amp * k * cos(ph));
        }
        void main() {
          vec3 rel = vW - cameraPosition;
          float dist = length(rel);
          vec3 V = -rel / dist;
          vec2 p = vW.xz;
          // wind waves: detail fades with distance (pixel footprint), leaving a calm, glassy far bay
          float fp = dist / 900.0;
          vec2 g = vec2(0.0);
          g += wave(p, normalize(vec2(0.8, 0.6)), 23.0, 0.20, 3.2) * (1.0 - smoothstep(0.6, 2.5, fp));
          g += wave(p, normalize(vec2(-0.4, 0.9)), 9.0, 0.08, 2.4) * (1.0 - smoothstep(0.25, 1.1, fp));
          g += wave(p, normalize(vec2(0.95, -0.3)), 3.7, 0.035, 1.6) * (1.0 - smoothstep(0.1, 0.45, fp));
          g += (vec2(hNoise(p * 0.9 + hTime * 0.6), hNoise(p.yx * 0.9 - hTime * 0.5)) - 0.5) * 0.18 * (1.0 - smoothstep(0.03, 0.18, fp));
          vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
          float ndv = max(dot(n, V), 0.0);
          float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
          vec3 R = reflect(-V, n);
          R.y = max(R.y, 0.001);
          vec3 refl = hSky(R);
          // far shores: does the reflected ray hit the skyline in that direction?
          vec2 fromC = vW.xz - uCentre;
          float az = atan(R.z, R.x) / 6.2831853 + 0.5;
          vec4 pn = texture2D(uPano, vec2(az, 0.5));
          float shoreDist = max(pn.y - dot(normalize(R.xz), fromC), 50.0);
          float elevSky = atan(pn.x - ${WATER_Y.toFixed(1)}, shoreDist);
          float elevR = asin(clamp(R.y, 0.0, 1.0));
          float hit = 1.0 - smoothstep(elevSky - 0.004, elevSky + 0.004, elevR);
          vec3 shore = hAtmosColor(vec3(R.x, 0.02, R.z)) * mix(0.55, 0.25, hNight);
          // night: broken vertical streaks of city light across the water
          float streak = hNoise(vec2(az * 900.0, vW.x * 0.05 + vW.z * 0.05 + hTime * 0.4)) * hNoise(vec2(az * 311.0, hTime * 0.8));
          shore += vec3(1.0, 0.75, 0.45) * pn.z * hNight * (0.25 + 1.4 * streak);
          refl = mix(refl, shore, hit);
          // the water body: deep teal, lit by the sky
          vec3 body = vec3(0.012, 0.03, 0.035) * (hAmbUp * 2.0 + hSunColor * 0.04);
          vec3 col = mix(body, refl, F);
          // sun (or moon) glint
          float spec = pow(max(dot(R, hSunDir), 0.0), 900.0) * 60.0 + pow(max(dot(R, hSunDir), 0.0), 60.0) * 0.4;
          col += hSunColor * spec * F * (1.0 - hit);
          // atmosphere
          float fog = hFogAmount(rel, vDepth);
          col = mix(col, hAtmosColor(rel), fog);
          if (any(isnan(col))) col = vec3(0.0);
          gl_FragColor = vec4(clamp(col, 0.0, 4096.0), 1.0);
        }`,
    });
    this.mesh = new Mesh(geo, mat);
    this.mesh.name = 'water';
    this.mesh.frustumCulled = false;
  }
}
