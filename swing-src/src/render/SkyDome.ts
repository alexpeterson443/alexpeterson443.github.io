import { BackSide, BoxGeometry, Mesh, ShaderMaterial } from 'three';
import { ATMO_PARS, atmoUniform } from './Atmosphere';

/**
 * Analytic sky: zenith→horizon gradient with a sun-side horizon tint, forward-scattering glow, a
 * limb-darkened sun disc, an anti-solar band at dusk, stars and a moon at night. It uses the same
 * GLSL as the fog, so fully fogged geometry lands exactly on the sky colour behind it.
 *
 * `uEnvMode = 1` is used when capturing the image-based lighting environment: no disc/stars/moon,
 * and the lower hemisphere becomes ground bounce instead of horizon haze.
 * Drawn last among opaques at the far plane, so only uncovered sky pixels are shaded.
 */
export class SkyDome {
  readonly mesh: Mesh;
  readonly material: ShaderMaterial;

  constructor(time: { value: number }) {
    this.material = new ShaderMaterial({
      name: 'StrandSky',
      uniforms: { uAtmo: atmoUniform, uEnvMode: { value: 0 }, uTime: time },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vec4 wp = modelMatrix * vec4( position, 1.0 );
          vDir = wp.xyz - cameraPosition;
          gl_Position = projectionMatrix * viewMatrix * wp;
          gl_Position.z = gl_Position.w;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uEnvMode;
        uniform float uTime;
        varying vec3 vDir;
        ${ATMO_PARS}
        float h13( vec3 p ) {
          uvec3 q = uvec3( ivec3( p ) + 32768 ) * uvec3( 1597334673u, 3812015801u, 2798796415u );
          uint n = ( q.x ^ q.y ^ q.z ) * 1597334673u;
          n ^= n >> 16u;
          return float( n ) * ( 1.0 / 4294967295.0 );
        }
        float h12( vec2 p ) { return h13( vec3( p, 17.0 ) ); }
        float vnoise( vec2 p ) {
          vec2 i = floor( p ), f = fract( p );
          vec2 u = f * f * ( 3.0 - 2.0 * f );
          return mix( mix( h12( i ), h12( i + vec2( 1, 0 ) ), u.x ), mix( h12( i + vec2( 0, 1 ) ), h12( i + vec2( 1, 1 ) ), u.x ), u.y );
        }
        vec3 stars( vec3 d ) {
          vec3 p = d * 240.0;
          vec3 id = floor( p );
          float h = h13( id );
          if ( h < 0.955 ) return vec3( 0.0 );
          vec3 o = vec3( h13( id + 11.0 ), h13( id + 23.0 ), h13( id + 37.0 ) ) - 0.5;
          vec3 f = fract( p ) - 0.5 - o * 0.6;
          float px = max( length( fwidth( p ) ), 1e-4 );
          float core = exp( - dot( f, f ) / ( px * px * 0.55 ) );
          float b = pow( h13( id + 5.0 ), 9.0 ) * 5.0 + 0.12;
          float tw = 0.72 + 0.28 * sin( uTime * ( 1.5 + 3.0 * h13( id + 3.0 ) ) + h * 91.0 );
          vec3 tint = mix( vec3( 0.72, 0.82, 1.0 ), vec3( 1.0, 0.86, 0.72 ), h13( id + 9.0 ) );
          return tint * core * b * tw;
        }
        void main() {
          vec3 d = normalize( vDir );
          vec3 s = uAtmo[ 0 ].xyz;
          float mu = dot( d, s );
          vec3 col;
          if ( d.y >= 0.0 ) {
            col = strandSkyBase( d ) + uAtmo[ 4 ].rgb * strandHG( mu, uAtmo[ 4 ].w );
          } else {
            vec3 hd = vec3( d.x, 0.0, d.z );
            hd = dot( hd, hd ) > 1e-8 ? normalize( hd ) : vec3( 1.0, 0.0, 0.0 );
            vec3 atH = strandSkyBase( hd ) + uAtmo[ 4 ].rgb * strandHG( dot( hd, s ), uAtmo[ 4 ].w );
            col = mix( atH, strandFogColor( hd ), smoothstep( 0.0, 0.04, - d.y ) );
            if ( uEnvMode > 0.5 ) col = mix( col, uAtmo[ 7 ].rgb, smoothstep( 0.0, 0.22, - d.y ) );
          }
          if ( uEnvMode < 0.5 ) {
            // sun disc: ~2x the real angular size, anti-aliased, limb-darkened
            float r = 0.0095;
            float x2 = 2.0 * ( 1.0 - mu ) / ( r * r );
            float fw = fwidth( x2 ) + 1e-4;
            float disc = 1.0 - smoothstep( 1.0 - fw, 1.0 + fw, x2 );
            float limb = 1.0 - 0.5 * ( 1.0 - sqrt( max( 1.0 - x2, 0.0 ) ) );
            col += uAtmo[ 9 ].rgb * uAtmo[ 0 ].w * disc * limb * smoothstep( -0.02, 0.01, d.y );
            // moon
            float moonDisc = 0.0;
            if ( uAtmo[ 7 ].w > 0.001 ) {
              vec3 m = uAtmo[ 8 ].xyz;
              vec3 tu = normalize( cross( m, vec3( 0.0, 1.0, 0.0 ) ) );
              vec3 tv = cross( tu, m );
              float mr = 0.021;
              vec2 q = vec2( dot( d, tu ), dot( d, tv ) ) / mr;
              float rq = length( q );
              float front = step( 0.0, dot( d, m ) );
              float fq = fwidth( rq ) + 1e-4;
              moonDisc = ( 1.0 - smoothstep( 1.0 - fq, 1.0 + fq, rq ) ) * front * uAtmo[ 7 ].w;
              float maria = vnoise( q * 2.3 + 4.0 ) * 0.6 + vnoise( q * 5.1 + 9.0 ) * 0.4;
              float alb = 0.62 + 0.38 * ( 1.0 - smoothstep( 0.38, 0.62, maria ) );
              float limbM = 0.7 + 0.3 * sqrt( max( 1.0 - rq * rq, 0.0 ) );
              col = mix( col, vec3( 1.0, 0.97, 0.9 ) * uAtmo[ 8 ].w * alb * limbM, moonDisc );
              col += vec3( 0.55, 0.66, 1.0 ) * uAtmo[ 7 ].w * ( 0.012 * strandHG( dot( d, m ), 0.93 ) + 0.004 * strandHG( dot( d, m ), 0.6 ) ) * front;
            }
            if ( uAtmo[ 6 ].w > 0.001 && d.y > 0.0 ) {
              col += stars( d ) * uAtmo[ 6 ].w * 0.22 * smoothstep( 0.02, 0.3, d.y ) * ( 1.0 - moonDisc );
            }
          }
          gl_FragColor = vec4( clamp( col, 0.0, 16384.0 ), 1.0 );
        }`,
      side: BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    this.mesh = new Mesh(new BoxGeometry(1, 1, 1), this.material);
    this.mesh.name = 'sky';
    this.mesh.scale.setScalar(2000);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1e6; // after every opaque: early-z rejects covered pixels
    this.mesh.onBeforeRender = (_r, _s, cam) => {
      this.mesh.position.copy(cam.position);
      this.mesh.updateMatrixWorld();
    };
  }

  set envMode(on: boolean) {
    this.material.uniforms.uEnvMode.value = on ? 1 : 0;
  }
}
