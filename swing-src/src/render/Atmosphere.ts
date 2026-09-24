import { ShaderChunk, ShaderLib, UniformsLib, type Vector3 } from 'three';
import type { Look } from './look';

/**
 * Atmosphere shared by the sky dome and every lit material's fog.
 *
 * All parameters live in one `vec4 uAtmo[ATMO_N]` array backed by a single Float32Array. three.js
 * clones material uniforms per program but keeps typed-array values by reference, so registering the
 * uniform on ShaderLib makes every built-in material (and every `onBeforeCompile` variant of one,
 * like the facade and ground shaders) read the same live numbers without per-material wiring.
 *
 * Fog model: aerial-perspective extinction (uniform) plus exponential height fog, integrated
 * analytically along the view ray. The in-scattered colour is the sky's own horizon colour in that
 * azimuth, including the sun's forward-scattering glow, so distance reads as depth that melts into
 * the sky instead of a flat white haze.
 */
export const ATMO_N = 12;
export const atmoData = new Float32Array(ATMO_N * 4);
export const atmoUniform = { value: atmoData };

// uAtmo layout (vec4 index):
//  0 sunDir.xyz, sunDisc radiance        1 zenith.rgb, horizonExp        2 horizon.rgb, sunSpread
//  3 horizonSun.rgb, fogSunScatter        4 glow.rgb, glowG               5 haze.rgb, hazeG
//  6 antiSun.rgb, stars                   7 ground.rgb, moon              8 moonDir.xyz, moon radiance
//  9 sunColor.rgb, -                     10 fog: extinction, heightDensity, heightFalloff, heightBase
// 11 fog: maxOpacity, elevation, -, -

export const ATMO_PARS = /* glsl */ `
#ifndef STRAND_ATMO
#define STRAND_ATMO
uniform vec4 uAtmo[ ${ATMO_N} ];

float strandHG( float mu, float g ) {
	float g2 = g * g;
	return ( 1.0 - g2 ) / ( 12.5663706 * pow( max( 1.0 + g2 - 2.0 * g * mu, 1e-4 ), 1.5 ) );
}

// Sky radiance without the sun disc and tight glow. d normalised, above the horizon.
vec3 strandSkyBase( vec3 d ) {
	vec3 s = uAtmo[ 0 ].xyz;
	float h = max( d.y, 0.0 );
	float t = pow( 1.0 - h, uAtmo[ 1 ].w );
	vec2 dh = d.xz * inversesqrt( max( dot( d.xz, d.xz ), 1e-8 ) );
	vec2 sh = s.xz * inversesqrt( max( dot( s.xz, s.xz ), 1e-8 ) );
	float az = dot( dh, sh ) * 0.5 + 0.5;
	vec3 hor = mix( uAtmo[ 2 ].rgb, uAtmo[ 3 ].rgb, pow( az, uAtmo[ 2 ].w ) );
	vec3 col = mix( uAtmo[ 1 ].rgb, hor, t );
	float mu = dot( d, s );
	col += uAtmo[ 5 ].rgb * strandHG( mu, uAtmo[ 5 ].w ) * ( 0.3 + 0.7 * t );
	// pink anti-solar band just above the horizon when the sun is low
	col += uAtmo[ 6 ].rgb * ( 1.0 - az ) * ( 1.0 - az ) * smoothstep( 0.0, 0.08, h ) * ( 1.0 - smoothstep( 0.1, 0.42, h ) );
	return col;
}

// In-scattered colour for a view direction: the sky near the horizon in that azimuth.
vec3 strandFogColor( vec3 dir ) {
	vec3 d = dir * inversesqrt( max( dot( dir, dir ), 1e-12 ) );
	// looking straight down there is no horizon azimuth: any direction gives the same answer, but a
	// zero vector would normalise to NaN and bloom would smear it across the frame
	vec3 fd = vec3( d.x, clamp( d.y, 0.0, 1.0 ) * uAtmo[ 11 ].y, d.z );
	float fl = dot( fd, fd );
	fd = fl > 1e-8 ? fd * inversesqrt( fl ) : vec3( 1.0, 0.0, 0.0 );
	vec3 c = strandSkyBase( fd );
	c += uAtmo[ 4 ].rgb * strandHG( dot( fd, uAtmo[ 0 ].xyz ), uAtmo[ 4 ].w ) * uAtmo[ 3 ].w;
	return c;
}

// Opacity of the atmosphere between the camera (height camY) and a point at camera-relative rel.
float strandFogAmount( vec3 rel, float camY ) {
	vec4 f = uAtmo[ 10 ];
	float L = length( rel );
	float yc = camY - f.w;
	float yp = yc + rel.y;
	float ec = exp( clamp( - f.z * yc, - 60.0, 60.0 ) );
	float ep = exp( clamp( - f.z * yp, - 60.0, 60.0 ) );
	float bdy = f.z * rel.y;
	float hterm = abs( bdy ) > 1e-3 ? ( ec - ep ) / bdy : 0.5 * ( ec + ep );
	float tau = L * ( f.x + f.y * hterm );
	return min( 1.0 - exp( - tau ), uAtmo[ 11 ].x );
}
#endif
`;

const FOG_PARS_VERTEX = /* glsl */ `
#ifdef USE_FOG
	varying float vFogDepth;
	varying vec3 vFogRel;
#endif
`;

const FOG_VERTEX = /* glsl */ `
#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
	vFogRel = mvPosition.xyz * mat3( viewMatrix );
#endif
`;

const FOG_PARS_FRAGMENT = /* glsl */ `
#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	varying vec3 vFogRel;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	${ATMO_PARS}
#endif
`;

const FOG_FRAGMENT = /* glsl */ `
#ifdef USE_FOG
	float fogFactor = strandFogAmount( vFogRel, cameraPosition.y );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, strandFogColor( vFogRel ), fogFactor );
	if ( any( isnan( gl_FragColor.rgb ) ) || any( isinf( gl_FragColor.rgb ) ) ) gl_FragColor.rgb = vec3( 0.0 );
#endif
`;

let installed = false;

/** Replace three's fog chunks with the atmosphere fog and register the shared uniform. Idempotent. */
export function installAtmosphere(): void {
  if (installed) return;
  installed = true;
  for (const lib of Object.values(ShaderLib)) {
    if (lib.uniforms && 'fogColor' in lib.uniforms) lib.uniforms.uAtmo = atmoUniform;
  }
  (UniformsLib.fog as Record<string, unknown>).uAtmo = atmoUniform;
  ShaderChunk.fog_pars_vertex = FOG_PARS_VERTEX;
  ShaderChunk.fog_vertex = FOG_VERTEX;
  ShaderChunk.fog_pars_fragment = FOG_PARS_FRAGMENT;
  ShaderChunk.fog_fragment = FOG_FRAGMENT;
  // Every lit material writes into a half-float target. A near-mirror glass highlight under the sun
  // can exceed half-float range (→ Inf), and bloom turns one Inf pixel into a black screen; keep
  // shading finite at the source.
  const OUT = 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );';
  if (ShaderChunk.opaque_fragment.includes(OUT)) {
    ShaderChunk.opaque_fragment = ShaderChunk.opaque_fragment.replace(OUT,
      'if ( any( isnan( outgoingLight ) ) ) outgoingLight = vec3( 0.0 );\n' +
      'outgoingLight = clamp( outgoingLight, 0.0, 16384.0 );\n' + OUT);
  } else console.warn('[strand] opaque_fragment changed shape; HDR clamp not installed');
}

export interface AtmoScales {
  fog: number;
  heightFog: number;
  heightFalloff: number;
  stars: number;
  sky: number;
}

/** Write a look (plus live dev-panel scales) into the shared uniform array. */
export function writeAtmosphere(look: Look, sunDir: Vector3, moonDir: Vector3, sc: AtmoScales): void {
  const a = atmoData;
  const k = sc.sky;
  const set = (i: number, x: number, y: number, z: number, w: number) => {
    a[i * 4] = x; a[i * 4 + 1] = y; a[i * 4 + 2] = z; a[i * 4 + 3] = w;
  };
  set(0, sunDir.x, sunDir.y, sunDir.z, look.sunDisc);
  set(1, look.zenith[0] * k, look.zenith[1] * k, look.zenith[2] * k, look.horizonExp);
  set(2, look.horizon[0] * k, look.horizon[1] * k, look.horizon[2] * k, look.sunSpread);
  set(3, look.horizonSun[0] * k, look.horizonSun[1] * k, look.horizonSun[2] * k, look.fogSunScatter);
  set(4, look.glow[0] * k, look.glow[1] * k, look.glow[2] * k, look.glowG);
  set(5, look.haze[0] * k, look.haze[1] * k, look.haze[2] * k, look.hazeG);
  set(6, look.antiSun[0] * k, look.antiSun[1] * k, look.antiSun[2] * k, look.stars * sc.stars);
  set(7, look.ground[0], look.ground[1], look.ground[2], look.moon);
  set(8, moonDir.x, moonDir.y, moonDir.z, 2.6);
  set(9, look.sunColor[0], look.sunColor[1], look.sunColor[2], 0);
  set(10, look.fogExtinction * sc.fog, look.fogHeightDensity * sc.heightFog, look.fogHeightFalloff * sc.heightFalloff, 0);
  set(11, look.fogMaxOpacity, look.fogElevation, 0, 0);
}
