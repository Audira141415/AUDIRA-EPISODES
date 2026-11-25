// EP042 valley model: one river basin from storm-covered headwaters (hulu, far -Z) down to the city
// on the lowland (hilir, near +Z). Pure functions only, so the cover and the film sample the same ground.

export const X0 = -7.5, X1 = 7.5;
export const Z0 = -10.5, Z1 = 8; // Z0 = hulu (far), Z1 = kota (near)

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const fbm = (x: number, y: number, oct = 5) => {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += vnoise(x * f, y * f) * amp;
    f *= 2.03;
    amp *= 0.5;
  }
  return s;
};

const ridged = (x: number, y: number) => {
  let s = 0, amp = 0.55, f = 1;
  for (let i = 0; i < 5; i++) {
    const n = 1 - Math.abs(vnoise(x * f, y * f) * 2 - 1);
    s += n * n * amp;
    f *= 2.1;
    amp *= 0.5;
  }
  return s;
};

/** River centreline: meanders more on the lowland than in the steep gorge. */
export const riverX = (z: number) => {
  const low = smooth(-3, 5, z);
  return Math.sin(z * 0.33 + 0.6) * (0.7 + low * 1.1) + Math.sin(z * 0.85 + 2.0) * 0.25 - 0.4 + low * 0.6;
};

/** 0 at the city edge, 1 at the headwaters. */
export const upstream = (z: number) => clamp((Z1 - z) / (Z1 - Z0));

export const CITY_Z = 4.8;

export const height = (x: number, z: number) => {
  const u = upstream(z);
  const d = Math.abs(x - riverX(z));
  const floor = 0.05 + Math.pow(u, 1.8) * 2.2;
  // valley flanks steepen upstream
  const flank = smooth(0.3, 3.2 + (1 - u) * 2.5, d) * (0.2 + Math.pow(u, 1.2) * 2.6) + smooth(3, 7, d) * u * 1.2;
  // mountain massif at the head of the valley
  const massif = smooth(-2.5, -9.2, z) * (0.8 + ridged(x * 0.35 + 3.1, z * 0.35) * 3.2) * smooth(0.2, 2.2, d + smooth(-7.6, -10.2, z) * 2.5);
  // lowland plain is almost flat, with soft hummocks
  const hum = (fbm(x * 0.6, z * 0.6, 4) - 0.5) * (0.12 + u * 0.9);
  const channel = -0.22 * Math.exp(-Math.pow(d / (0.18 + (1 - u) * 0.22), 2));
  // city platform: keep flat ground under the blocks
  const city = smooth(CITY_Z - 1.6, CITY_Z, z);
  return (floor + flank + massif + hum) * (1 - city * 0.55) + channel;
};

export const riverY = (z: number) => height(riverX(z), z) + 0.05;

/** Arc-length parametrised river path from hulu (s=0) to the city (s=1). */
export const RIVER_Z_START = -8.4;
export const RIVER_Z_END = 7.7;
export const riverPoint = (s: number): [number, number, number] => {
  const z = RIVER_Z_START + (RIVER_Z_END - RIVER_Z_START) * s;
  return [riverX(z), riverY(z), z];
};

/** Water-level stations along the river, upstream first. */
export const POSTS = [0.18, 0.5, 0.86];
export const POST_NAMES = ["Katulampa", "Depok", "Manggarai"];
