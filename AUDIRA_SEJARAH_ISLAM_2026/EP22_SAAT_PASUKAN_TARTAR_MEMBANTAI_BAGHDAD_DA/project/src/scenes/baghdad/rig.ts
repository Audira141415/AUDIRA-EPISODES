// EP22 camera: one continuous flight over the war table (no cuts, so audit:rig sees no jumps).
// Keys are framings {target, az, el, dist, fov}; az 0 = camera south (+z) looking north, az -pi/2 = camera west.
// Interpolated with cubic Hermite (Catmull-Rom tangents) per channel, dist in log space.
//   npm run audit:rig -- src/scenes/baghdad/rig.ts rigPose --frames=5700 --fps=60
import { BAGHDAD, CARPET, DOCK, HAMADAN, LETTER } from "./geo.ts";

type V3 = [number, number, number];
type Key = { t: number; tg: V3; az: number; el: number; dist: number; fov: number };

const at = (p: [number, number], dx: number, y: number, dz: number): V3 => [p[0] + dx, y, p[1] + dz];
// mirrors City.tsx (CITY, landmark line LX) without importing it (City -> World -> rig cycle)
const CITY: [number, number] = [BAGHDAD[0] - 0.25, BAGHDAD[1]];
const LX = CITY[0] - 0.18;

const KEYS: Key[] = [
  // s1 hook: low oblique on the Round City, dolly toward the palace
  { t: 0, tg: at(CITY, 0.05, 0.14, 0.02), az: -0.38, el: 0.32, dist: 7.2, fov: 34 },
  { t: 5.0, tg: at(CITY, -0.06, 0.15, -0.03), az: -0.31, el: 0.3, dist: 6.1, fov: 34 },
  { t: 9.6, tg: [LX, 0.18, CITY[1] - 0.06], az: -0.24, el: 0.28, dist: 5.0, fov: 34 },
  // s2 rise to near top-down, follow the route east to Hamadan
  { t: 11.7, tg: at(CITY, 0.5, 0, -0.3), az: 0.45, el: 1.0, dist: 9.6, fov: 35 },
  { t: 14.6, tg: at(CITY, 0.45, 0, -0.3), az: 0.62, el: 1.18, dist: 11.4, fov: 36 },
  { t: 19.2, tg: [-0.4, 0, -0.75], az: 0.7, el: 1.2, dist: 12.6, fov: 36 },
  { t: 22.0, tg: [1.9, 0, -1.55], az: 0.68, el: 1.12, dist: 11.4, fov: 35 },
  { t: 23.4, tg: at(HAMADAN, -0.2, 0.1, 0.05), az: 0.6, el: 1.0, dist: 9, fov: 35 },
  // flight east to the letters tray, then s3 macro orbit ~25 deg
  { t: 24.7, tg: at(LETTER, -1.4, 0.2, 0.3), az: 0.48, el: 0.85, dist: 6.8, fov: 33 },
  { t: 25.8, tg: at(LETTER, 0.1, 0.12, 0.05), az: 0.36, el: 0.8, dist: 4.4, fov: 32 },
  { t: 29.4, tg: at(LETTER, 0, 0.12, 0.1), az: 0.12, el: 0.74, dist: 4.0, fov: 32 },
  { t: 33.6, tg: at(LETTER, -0.2, 0.12, 0.12), az: -0.08, el: 0.68, dist: 3.7, fov: 32 },
  // flight back west to Baghdad, high and far
  { t: 35.0, tg: [4.3, 0.2, -1.9], az: -0.12, el: 0.95, dist: 10, fov: 34 },
  // s4 tilted top-down, push in toward the levee, then the south gate
  { t: 36.5, tg: at(CITY, 0.2, 0, 0.25), az: -0.2, el: 1.05, dist: 9.0, fov: 35 },
  { t: 40.6, tg: [-1.1, 0, 0.42], az: -0.2, el: 1.02, dist: 8.3, fov: 35 },
  { t: 43.6, tg: at(CITY, 0, 0.05, 0.55), az: -0.16, el: 0.95, dist: 7.8, fov: 35 },
  { t: 45.4, tg: at(CITY, -0.1, 0.1, 0.2), az: -0.75, el: 0.6, dist: 5.0, fov: 34 },
  // s5 eye level from the west, tracking sideways past the four landmarks, then rise for the toll
  { t: 46.7, tg: [LX, 0.12, CITY[1] - 0.42], az: -1.45, el: 0.18, dist: 2.6, fov: 34 },
  { t: 49.4, tg: [LX, 0.12, CITY[1] - 0.32], az: -1.57, el: 0.12, dist: 2.2, fov: 34 },
  { t: 53.0, tg: [LX, 0.12, CITY[1] + 0.36], az: -1.57, el: 0.12, dist: 2.2, fov: 34 },
  { t: 55.6, tg: at(CITY, -0.1, 0.15, 0.02), az: -1.4, el: 0.45, dist: 4.5, fov: 34 },
  { t: 59.2, tg: at(CITY, -0.05, 0.15, -0.04), az: -1.28, el: 0.5, dist: 4.9, fov: 34 },
  // flight east to the carpet tray; s6 high angle coming down
  { t: 60.7, tg: [3.0, 0.2, 0.6], az: -0.6, el: 0.95, dist: 9.5, fov: 34 },
  { t: 62.2, tg: at(CARPET, -0.1, 0.1, -0.05), az: -0.3, el: 1.05, dist: 4.2, fov: 33 },
  { t: 66.0, tg: at(CARPET, 0, 0.1, 0), az: -0.15, el: 0.85, dist: 3.3, fov: 33 },
  { t: 68.0, tg: at(CARPET, 0, 0.1, 0.05), az: 0, el: 0.75, dist: 3.2, fov: 33 },
  // s7 dock: low angle on the river, crane up to the shelves
  { t: 69.4, tg: at(DOCK, 0, 0.15, -0.2), az: 0.25, el: 0.3, dist: 3.6, fov: 33 },
  { t: 72.0, tg: at(DOCK, 0, 0.15, 0), az: 0.15, el: 0.25, dist: 3.0, fov: 33 },
  { t: 74.6, tg: at(DOCK, 0, 0.3, -0.6), az: 0.05, el: 0.35, dist: 3.0, fov: 33 },
  { t: 77.0, tg: at(DOCK, 0, 0.42, -0.6), az: -0.05, el: 0.32, dist: 3.3, fov: 33 },
  { t: 79.6, tg: at(DOCK, 0, 0.5, -0.55), az: -0.1, el: 0.34, dist: 3.7, fov: 33 },
  // s8 pull back high over the whole map from the north-west (s2 looked from the south-east), dawn from the east
  { t: 81.8, tg: [3.0, 0.2, 2.5], az: -1.0, el: 0.75, dist: 10, fov: 35 },
  { t: 84.0, tg: [-0.5, 0, 0.2], az: -2.0, el: 0.88, dist: 15, fov: 36 },
  { t: 88.0, tg: [-0.2, 0, 0], az: -2.3, el: 0.9, dist: 17.5, fov: 36 },
  { t: 92.0, tg: [0, 0, 0], az: -2.4, el: 0.92, dist: 19, fov: 36 },
];

type Ch = (k: Key) => number;
const hermite = (t: number, ch: Ch) => {
  const K = KEYS;
  if (t <= K[0].t) return ch(K[0]);
  if (t >= K[K.length - 1].t) return ch(K[K.length - 1]);
  let i = 0;
  while (K[i + 1].t < t) i++;
  const a = K[i], b = K[i + 1];
  const slope = (j: number) => {
    const p = K[Math.max(0, j - 1)], n = K[Math.min(K.length - 1, j + 1)];
    if (j === 0 || j === K.length - 1) return 0;
    return ((ch(n) - ch(K[j])) / (n.t - K[j].t) + (ch(K[j]) - ch(p)) / (K[j].t - p.t)) / 2;
  };
  const h = b.t - a.t;
  const u = (t - a.t) / h;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * ch(a) + (u3 - 2 * u2 + u) * h * slope(i) + (-2 * u3 + 3 * u2) * ch(b) + (u3 - u2) * h * slope(i + 1);
};

export type Pose = { pos: V3; target: V3; fov: number };
export const poseAt = (t: number): Pose => {
  const tg: V3 = [hermite(t, (k) => k.tg[0]), hermite(t, (k) => k.tg[1]), hermite(t, (k) => k.tg[2])];
  const az = hermite(t, (k) => k.az);
  const el = hermite(t, (k) => k.el);
  const dist = Math.exp(hermite(t, (k) => Math.log(k.dist)));
  const fov = hermite(t, (k) => k.fov);
  const pos: V3 = [tg[0] + dist * Math.sin(az) * Math.cos(el), tg[1] + dist * Math.sin(el), tg[2] + dist * Math.cos(az) * Math.cos(el)];
  return { pos, target: tg, fov };
};
/** Pose by frame for audit:rig (60 fps film clock by default). */
export const rigPose = (f: number, fps = 60) => {
  const p = poseAt(f / fps);
  return { position: p.pos, target: p.target, fov: p.fov };
};
export const camDist = (p: Pose) => Math.hypot(p.pos[0] - p.target[0], p.pos[1] - p.target[1], p.pos[2] - p.target[2]);

/** World point -> 1080x1920 layout px (null when behind the camera). */
export const project = (p: Pose, w: V3, aspect = 1080 / 1920): { x: number; y: number; depth: number } | null => {
  const f = [p.target[0] - p.pos[0], p.target[1] - p.pos[1], p.target[2] - p.pos[2]];
  const fl = Math.hypot(f[0], f[1], f[2]);
  f[0] /= fl; f[1] /= fl; f[2] /= fl;
  // right = f x up(0,1,0)
  let r = [-f[2], 0, f[0]];
  const rl = Math.hypot(r[0], r[2]) || 1;
  r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const d = [w[0] - p.pos[0], w[1] - p.pos[1], w[2] - p.pos[2]];
  const zc = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  if (zc <= 0.05) return null;
  const xc = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
  const yc = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
  const th = Math.tan(((p.fov * Math.PI) / 180) / 2);
  const nx = xc / (zc * th * aspect), ny = yc / (zc * th);
  return { x: ((nx + 1) / 2) * 1080, y: ((1 - ny) / 2) * 1920, depth: zc };
};
