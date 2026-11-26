// EP19 camera: one continuous flight over the war table (no cuts, so audit:rig sees no jumps).
// Keys are framings {target, az, el, dist, fov}; az 0 = camera south (+z) looking north.
// Interpolated with cubic Hermite (Catmull-Rom tangents) per channel, dist in log space.
//   npm run audit:rig -- src/scenes/khalid/rig.ts rigPose --frames=5460 --fps=60
import { BOOK, MADINAH, MUTAH, SAND, SYRIA } from "./geo.ts";

type V3 = [number, number, number];
type Key = { t: number; tg: V3; az: number; el: number; dist: number; fov: number };

const at = (p: [number, number], dx: number, y: number, dz: number): V3 => [p[0] + dx, y, p[1] + dz];

const KEYS: Key[] = [
  // s1 hook: low oblique close on the four banners at Mu'tah
  { t: 0, tg: at(MUTAH, -0.05, 0.62, 0.05), az: 0.58, el: 0.16, dist: 4.9, fov: 34 },
  { t: 3.2, tg: at(MUTAH, 0.05, 0.6, 0.05), az: 0.47, el: 0.19, dist: 4.3, fov: 34 },
  { t: 6.2, tg: at(MUTAH, 0.12, 0.52, 0.2), az: 0.38, el: 0.23, dist: 3.9, fov: 34 },
  // s2 rise to near top-down over the route, then descend to Mu'tah
  { t: 7.8, tg: at(MUTAH, 0.6, 0.3, 1.8), az: 0.27, el: 0.6, dist: 7.6, fov: 35 },
  { t: 10.4, tg: [0.7, 0, 1.7], az: 0.12, el: 1.2, dist: 16.6, fov: 36 },
  { t: 13.4, tg: [-0.3, 0, -0.5], az: 0.02, el: 1.16, dist: 14.4, fov: 36 },
  { t: 15.5, tg: at(MUTAH, 0.15, 0.2, -0.6), az: -0.1, el: 0.8, dist: 9.6, fov: 35 },
  // flight east to the book tray: travel happens high and far, then push in (low screen speed)
  { t: 16.9, tg: [1.5, 0.3, -2.4], az: 0.42, el: 0.9, dist: 12.5, fov: 34 },
  { t: 18.3, tg: at(BOOK, 0, 0.3, 0.1), az: 0.85, el: 0.75, dist: 9.0, fov: 33 },
  // s3 book, orbit + push in, end on the candle
  { t: 19.5, tg: at(BOOK, 0, 0.32, 0.1), az: 0.95, el: 0.6, dist: 4.6, fov: 32 },
  { t: 23.0, tg: at(BOOK, 0, 0.3, 0.05), az: 0.76, el: 0.55, dist: 3.9, fov: 32 },
  { t: 26.2, tg: at(BOOK, 0.3, 0.32, -0.1), az: 0.6, el: 0.5, dist: 3.5, fov: 32 },
  { t: 28.2, tg: at(BOOK, 1.05, 0.48, -0.5), az: 0.5, el: 0.44, dist: 3.15, fov: 32 },
  // flight south to the sand tray
  { t: 29.45, tg: at(BOOK, 0.9, 0.42, -0.4), az: 0.62, el: 0.62, dist: 6.2, fov: 32 },
  { t: 30.85, tg: at(SAND, 0, 0.38, -0.3), az: 0.95, el: 0.5, dist: 8.6, fov: 33 },
  // s4 swords: low angle level with the sand, sideways dolly, push in on the last sword
  { t: 32.2, tg: at(SAND, 0, 0.38, 0), az: 1.12, el: 0.22, dist: 4.7, fov: 33 },
  { t: 34.4, tg: at(SAND, 0, 0.34, 0), az: 0.96, el: 0.25, dist: 4.25, fov: 33 },
  { t: 37.6, tg: at(SAND, 0, 0.5, 0), az: 0.72, el: 0.22, dist: 3.7, fov: 33 },
  { t: 40.1, tg: at(SAND, 0, 0.62, 0), az: 0.55, el: 0.18, dist: 3.2, fov: 33 },
  // flight back to Mu'tah, s5 tilted top-down following the column south, map turns
  { t: 41.5, tg: at(SAND, 0, 0.55, 0), az: 0.5, el: 0.42, dist: 6.5, fov: 34 },
  { t: 43.0, tg: [2.4, 0.2, -0.6], az: 0.35, el: 0.85, dist: 10, fov: 35 },
  { t: 44.4, tg: at(MUTAH, 0.25, 0.1, 0.6), az: 0.2, el: 1.0, dist: 10.2, fov: 35 },
  { t: 48.0, tg: [-0.7, 0.1, 0.9], az: 0.85, el: 1.04, dist: 10.6, fov: 35 },
  { t: 52.2, tg: [0.6, 0.1, 2.7], az: 1.65, el: 0.98, dist: 10.0, fov: 35 },
  { t: 54.0, tg: [2.2, 0.2, 4.4], az: 2.15, el: 0.6, dist: 8.5, fov: 35 },
  // s6 Madinah eye level, dolly in past the palms
  { t: 55.6, tg: at(MADINAH, -0.3, 0.34, -0.9), az: 2.44, el: 0.22, dist: 5.8, fov: 34 },
  { t: 58.1, tg: at(MADINAH, -0.15, 0.33, -0.75), az: 2.55, el: 0.17, dist: 4.7, fov: 34 },
  { t: 60.4, tg: at(MADINAH, 0, 0.33, -0.6), az: 2.63, el: 0.16, dist: 4.1, fov: 34 },
  // flight north to Syria
  { t: 62.0, tg: at(MADINAH, 0, 0.33, -1.5), az: 2.7, el: 0.5, dist: 9.8, fov: 34 },
  { t: 63.9, tg: [-1.0, 0.75, -4.6], az: 2.95, el: 0.7, dist: 12.5, fov: 35 },
  // s7 Syria camp: crane up with the banners, down to the front row
  { t: 65.5, tg: at(SYRIA, 0, 1.05, 0), az: 3.0, el: 0.32, dist: 6.8, fov: 34 },
  { t: 67.6, tg: at(SYRIA, 0, 1.95, 0), az: 3.15, el: 0.42, dist: 5.7, fov: 34 },
  { t: 71.1, tg: at(SYRIA, 0, 1.75, 0.1), az: 3.3, el: 0.38, dist: 5.9, fov: 34 },
  { t: 75.0, tg: at(SYRIA, 0.1, 0.75, 0.55), az: 3.45, el: 0.22, dist: 5.0, fov: 34 },
  { t: 77.0, tg: at(SYRIA, 0.05, 0.7, 0.5), az: 3.5, el: 0.26, dist: 5.3, fov: 34 },
  // s8 pull back high over the whole map from the north (s2 looked from the south)
  { t: 79.6, tg: [-1.3, 0, -3.4], az: 3.25, el: 0.88, dist: 11, fov: 36 },
  { t: 84.0, tg: [0.4, 0, 0.2], az: 3.0, el: 0.95, dist: 17.4, fov: 36 },
  { t: 88.0, tg: [0.5, 0, 0.4], az: 2.86, el: 1.0, dist: 18.4, fov: 36 },
  { t: 91.2, tg: [0.55, 0, 0.5], az: 2.76, el: 1.03, dist: 19.1, fov: 36 },
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
