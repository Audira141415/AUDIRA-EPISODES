// PAINTERLY world layout and motion: pure functions of film time t (seconds). No Math.random, no Date.
//
// Layout (world units, +z towards the opening camera, -z out to sea):
//   a grassy hill rises from the camera to a crest at z = CREST.z; the lone tree stands on it,
//   the AUDIRA sign post stands beside the path near the start, the traveller walks the path up.
//   Behind the crest the hill falls to the bay (SEA_Y); across it the cliff village and the
//   lighthouse sit on a mesa, distant islands further out, painted clouds drift in the sky.

export const SEA_Y = -2.6;
export const CREST = { z: -4.6, y: 1.32 };
export const TREE = { x: -0.95, z: -4.9 };
export const SIGN = { x: 0.78, z: -0.95 };
export const MESA = { x: 6.2, z: -21, top: 1.6, rx: 4.0, rz: 3.4 };
export const LIGHTHOUSE = { x: 3.0, z: -19.6 };

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const ease = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Small deterministic value noise (2-D), for terrain lumps. */
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export function vnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export const fbm = (x: number, y: number) => vnoise(x, y) * 0.55 + vnoise(x * 2.1 + 5.3, y * 2.1 + 1.7) * 0.3 + vnoise(x * 4.3 + 9.1, y * 4.3 + 3.3) * 0.15;

/** Height of the foreground hill at (x, z). Falls to the sea behind the crest. */
export function hillY(x: number, z: number) {
  const dz = z - CREST.z;
  let y: number;
  if (dz >= 0) y = CREST.y - 0.052 * dz * dz;
  else y = CREST.y - 0.55 * Math.pow(-dz, 1.45);
  // the ridge is broad and curves down to both sides
  y -= 0.022 * x * x + 0.004 * x * x * Math.max(0, -dz);
  y += (fbm(x * 0.35 + 3, z * 0.35 + 1) - 0.5) * 0.45;
  return Math.max(y, SEA_Y - 0.6);
}

/** Height of the mesa top at (x, z): a gentle dome. */
export function mesaTopY(x: number, z: number) {
  const rr = ((x - MESA.x) / MESA.rx) ** 2 + ((z - MESA.z) / MESA.rz) ** 2;
  return MESA.top + 0.22 * Math.max(0, 1 - rr);
}

/** The path the traveller walks: a few control points (x, z), resampled with a Catmull-Rom spline. */
const PATH: [number, number][] = [
  [0.5, 1.4],
  [0.42, 0.2],
  [0.22, -1.1],
  [0.02, -2.4],
  [-0.14, -3.5],
  [-0.22, -4.25],
];
export function pathPoint(s: number): [number, number] {
  const n = PATH.length - 1;
  const x = clamp01(s) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const u = x - i;
  const p0 = PATH[Math.max(0, i - 1)], p1 = PATH[i], p2 = PATH[i + 1], p3 = PATH[Math.min(n, i + 2)];
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
}
/** Distance from (x, z) to the path (approximate, sampled). */
export function pathDistance(x: number, z: number) {
  let best = 1e9;
  for (let k = 0; k <= 40; k++) {
    const [px, pz] = pathPoint(k / 40);
    best = Math.min(best, Math.hypot(x - px, z - pz));
  }
  return best;
}

/** The traveller: walks from WALK.from to WALK.to seconds, then stands on the crest facing the sea. */
export const WALK = { from: 0.0, to: 8.4, s0: 0.24, s1: 1 };
export function walkerAt(t: number) {
  const u = clamp01((t - WALK.from) / (WALK.to - WALK.from));
  // walk at a steady pace, ease only the very end
  const s = WALK.s0 + (WALK.s1 - WALK.s0) * (u < 0.88 ? u / 0.94 : 0.88 / 0.94 + (1 - 0.88 / 0.94) * ease((u - 0.88) / 0.12));
  const [x, z] = pathPoint(s);
  const [x2, z2] = pathPoint(Math.min(1, s + 0.01));
  const heading = Math.atan2(x2 - x, z2 - z);
  const walking = t < WALK.to - 0.15;
  // once on the crest, turn a little towards the lighthouse across the bay
  const turn = walking ? 0 : -0.45 * ease((t - WALK.to) / 1.4);
  return { x, z, y: hillY(x, z), heading: heading + turn, walking, phase: (t - WALK.from) * 1.55, s };
}

/** Wind: a slow gust envelope used by grass, leaves, cloak and scarf. */
export const gust = (t: number) => 0.55 + 0.3 * Math.sin(t * 0.7) + 0.15 * Math.sin(t * 1.9 + 1.3);

/** Clouds drift slowly to +x. */
export const cloudDrift = (t: number) => t * 0.55;

/** Lighthouse lamp rotation (radians). */
export const beamAngle = (t: number) => t * 1.1 + 0.6;

/** Painter's layers named on the HUD, one every 2.4 s. */
export const LAYERS = ["SKETSA", "WARNA DASAR", "BAYANGAN DINGIN", "CAHAYA HANGAT", "SENTUHAN AKHIR"] as const;
export function layerAt(t: number) {
  const i = Math.min(LAYERS.length - 1, Math.floor(t / 2.4));
  return { index: i, name: LAYERS[i], fill: clamp01(t / 11.6) };
}

export { smooth, clamp01 };
