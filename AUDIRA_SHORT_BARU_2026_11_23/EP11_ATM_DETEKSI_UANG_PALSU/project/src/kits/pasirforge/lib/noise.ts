// Seeded noise for PASIRFORGE: JS (sculpture erosion, pile heights, grain placement; all evaluated on
// the CPU so shadows and ambient occlusion see the real shape) and a GLSL chunk (grain-scale colour
// and bump on sand surfaces, sky and sea). Deterministic: no Math.random, no Date.

export type V3 = [number, number, number];

/** Park-Miller generator: same sequence in every render tab. */
export const rng = (seed: number) => {
  let s = Math.max(1, Math.floor(seed) % 2147483647);
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

const hash3 = (x: number, y: number, z: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 191.3 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
/** 3D value noise, 0..1. */
export function noise3(x: number, y: number, z: number, s = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, k: number) => a + (b - a) * k;
  const z0 = l(l(hash3(ix, iy, iz, s), hash3(ix + 1, iy, iz, s), ux), l(hash3(ix, iy + 1, iz, s), hash3(ix + 1, iy + 1, iz, s), ux), uy);
  const z1 = l(l(hash3(ix, iy, iz + 1, s), hash3(ix + 1, iy, iz + 1, s), ux), l(hash3(ix, iy + 1, iz + 1, s), hash3(ix + 1, iy + 1, iz + 1, s), ux), uy);
  return l(z0, z1, uz);
}
export const noise2 = (x: number, z: number, s = 0) => noise3(x, 0.37, z, s);
export function fbm3(x: number, y: number, z: number, s = 0, oct = 4): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise3(x * f, y * f, z * f, s + i * 13);
    f *= 2.03;
    a *= 0.5;
  }
  return v / (1 - Math.pow(0.5, oct));
}

// --- Ground shape ------------------------------------------------------------------------------
/** Plinth footprint (half extents in x and z) that the apron of fallen sand hugs. */
export const FOOT = { hx: 1.5, hz: 1.2 };
/** Water level of the sea; the beach slopes into it beyond z = -2. */
export const SEA_Y = -0.05;
export const beachSlope = (z: number) => -0.035 * Math.max(0, -z - 2);

const lobe = (x: number, z: number, s: number) =>
  0.5 + 0.25 * Math.sin(x * 4.1 + s * 1.3) * Math.sin(z * 3.7 + s * 0.4) + 0.25 * Math.sin(x * 2.3 - z * 3.1 + s * 2.0);

/** The initial pile the sculpture is built from (amount 1 = full heap, 0 = used up). */
export function heapHeight(x: number, z: number, amount: number): number {
  if (amount <= 0) return 0;
  const r = Math.hypot(x / 2.3, z / 1.9) + (lobe(x * 1.7, z * 1.7, 3) - 0.5) * 0.16;
  const k = Math.max(0, 1 - r * r);
  return amount * 0.46 * Math.pow(k, 1.25);
}

/** Apron of eroded sand around the base (amount 0..1 grows with erosion). */
export function pileHeight(x: number, z: number, amount: number): number {
  if (amount <= 0) return 0;
  const dx = Math.max(0, Math.abs(x) - FOOT.hx), dz = Math.max(0, Math.abs(z) - FOOT.hz);
  const d = Math.hypot(dx, dz);
  const lobes = 0.7 + 0.6 * lobe(x * 2.3, z * 2.3, 11);
  // Less sand in front of the carved name, so AUDIRA stays readable to the end.
  const front = z > 0 && Math.abs(x) < 0.95 ? 0.45 : 1;
  return amount * 0.21 * lobes * front * Math.exp(-d / 0.34) * Math.min(1, 0.55 + d * 3.5);
}

/** Wind ripples on the open beach, flattened near the sculpture where the sculptor smoothed it. */
export function rippleHeight(x: number, z: number): number {
  const dx = Math.max(0, Math.abs(x) - FOOT.hx), dz = Math.max(0, Math.abs(z) - FOOT.hz);
  const d = Math.hypot(dx, dz);
  const k = smoothstep(0.6, 2.2, d);
  const w = noise2(x * 0.9, z * 0.9, 21) * 3.2;
  return k * 0.0075 * Math.sin((x * 0.82 + z * 0.57) * 26 + w) * (0.6 + 0.4 * noise2(x * 2, z * 2, 4));
}

// --- GLSL --------------------------------------------------------------------------------------
export const GLSL_NOISE = /* glsl */ `
float pfHash3(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float pfNoise3(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(pfHash3(i), pfHash3(i + vec3(1,0,0)), f.x), mix(pfHash3(i + vec3(0,1,0)), pfHash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(pfHash3(i + vec3(0,0,1)), pfHash3(i + vec3(1,0,1)), f.x), mix(pfHash3(i + vec3(0,1,1)), pfHash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float pfFbm3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * pfNoise3(p); p = p * 2.03 + 7.1; a *= 0.5; } return v / 0.9375; }
/** Grain-scale relief (metres) that fades out once a cell is smaller than ~1.5 px (no shimmer). */
float pfGrain(vec3 p, float px){
  float fade1 = 1.0 - smoothstep(0.003, 0.009, px);
  float fade2 = 1.0 - smoothstep(0.0012, 0.004, px);
  float g = (pfNoise3(p * 70.0) - 0.5) * 0.5;
  g += (pfNoise3(p * 210.0) - 0.5) * 0.5 * fade1;
  g += (pfHash3(floor(p * 620.0)) - 0.5) * 0.5 * fade2;
  return g;
}
/** Bump a view-space normal by a scalar height field h (Mikkelsen's surface gradient). */
vec3 pfBump(vec3 n, vec3 viewPos, float h, float faceDir){
  vec3 sx = dFdx(viewPos), sy = dFdy(viewPos);
  vec3 r1 = cross(sy, n), r2 = cross(n, sx);
  float det = dot(sx, r1) * faceDir;
  vec2 dh = vec2(dFdx(h), dFdy(h));
  vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * n - grad);
}
`;

/** Golden-hour sky as a function of view direction; shared by the sky dome and the sea reflection. */
export const GLSL_SKY = /* glsl */ `
uniform vec3 uSun, uSkyTop, uSkyMid, uHorizon, uSunGlow, uSunCol;
vec3 pfSky(vec3 d){
  float y = max(d.y, 0.0);
  vec3 c = mix(uHorizon, uSkyMid, smoothstep(0.0, 0.16, y));
  c = mix(c, uSkyTop, smoothstep(0.12, 0.62, y));
  float s = max(dot(normalize(d), uSun), 0.0);
  c += uSunGlow * (pow(s, 6.0) * 0.55 + pow(s, 48.0) * 0.8) * (1.0 - smoothstep(0.0, 0.5, y) * 0.5);
  c += uSunCol * smoothstep(0.9993, 0.9997, s) * 6.0;
  // A low band of haze along the horizon.
  c = mix(c, uHorizon * 1.08, (1.0 - smoothstep(0.0, 0.05, y)) * 0.55);
  return c;
}
`;
