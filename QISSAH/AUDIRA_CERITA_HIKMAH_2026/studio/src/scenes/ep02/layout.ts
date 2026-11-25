// TEMPAYAN RETAK: one coordinate module. Geometry, staging, cameras and captions read the same numbers.
// All story beats key off clip ids from timeline.json (estimated now, measured after the voice).
import tl from "./timeline.json";

export const FILM_FPS = 60;
export const TOTAL_SECONDS: number = tl.total;

export type Clip = { id: string; who: string; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

export type V3 = [number, number, number];

/* ---------- small math ---------- */
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ss = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** 0..1 smoothstep ramp of t through [a, b]. */
export const ramp = (t: number, a: number, b: number) => ss((t - a) / Math.max(1e-6, b - a));
/** up between [a0,a1], down between [b0,b1] */
export const win = (t: number, a0: number, a1: number, b0: number, b1: number) => ramp(t, a0, a1) * (1 - ramp(t, b0, b1));
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Piecewise keys [time, value] with smoothstep between neighbours (holds at the ends). */
export const kv = (t: number, list: [number, number][]) => {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t < list[i][0]) {
      const [a, va] = list[i - 1], [b, vb] = list[i];
      return lerp(va, vb, ss((t - a) / Math.max(1e-6, b - a)));
    }
  }
  return list[list.length - 1][1];
};

/* ---------- the hill path: spring (u = 0) to the master's house (u = 1) ---------- */
export const PATH = { z0: -2.6, len: 46, rise: 7, wiggle: 3.0, half: 0.85 };
export const pathX = (u: number) => PATH.wiggle * Math.sin(1.6 * Math.PI * u);
export const pathY = (u: number) => PATH.rise * ss(u);
export const pathZ = (u: number) => PATH.z0 - PATH.len * u;
export const pathAt = (u: number): V3 => [pathX(u), pathY(u), pathZ(u)];
/** Walking heading (yaw, character front = +z) when climbing at u. */
export const pathYaw = (u: number) => {
  const a = pathAt(clamp(u - 0.004)), b = pathAt(clamp(u + 0.004));
  return Math.atan2(b[0] - a[0], b[2] - a[2]);
};
export const uOfZ = (z: number) => clamp((PATH.z0 - z) / PATH.len);

export const SPRING: V3 = [0, 0, 0.2];
export const POOL_R = 2.4;
export const POOL_Y = 0.06;
export const HOUSE: V3 = [-3.4, 7, -57.2];
export const ARRIVE_U = 1;
export const TABLE: V3 = [-4.6, 7.15, -53.9];

const vn = (x: number, z: number) => {
  // cheap smooth value noise (deterministic)
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const h = (a: number, b: number) => hash(a * 57.3 + b * 131.9);
  const sx = xf * xf * (3 - 2 * xf), sz = zf * zf * (3 - 2 * zf);
  return lerp(lerp(h(xi, zi), h(xi + 1, zi), sx), lerp(h(xi, zi + 1), h(xi + 1, zi + 1), sx), sz);
};
export const noise2 = (x: number, z: number) => vn(x * 0.18, z * 0.18) * 0.65 + vn(x * 0.5 + 9, z * 0.5 - 3) * 0.35;

/** Terrain height. The path rides the spine of a ridge; the spring sits in a basin at the foot. */
export const groundY = (x: number, z: number) => {
  const u = uOfZ(z);
  let base = pathY(u);
  if (z < PATH.z0 - PATH.len) base = PATH.rise; // house plateau
  const dx = Math.abs(x - pathX(u));
  const off = Math.max(0, dx - 1.3);
  const plateau = ss((-z - 49) / 3) * ss((8 - Math.abs(x - HOUSE[0])) / 3);
  let h = base - 0.018 * off * off * (1 - plateau) + (noise2(x, z) - 0.5) * 0.9 * ss(off / 3);
  // the far side of the hill falls away behind the house
  h -= ss((-z - 62) / 10) * 6;
  // spring basin
  const ds = Math.hypot(x - SPRING[0], z - SPRING[2]);
  h = lerp(-0.25, h, ss((ds - POOL_R + 0.2) / 1.4));
  // rock shelf behind the spring
  return h;
};
/** lateral offset from the path centre (negative = the cracked pot's side when climbing). */
export const pathDx = (x: number, z: number) => x - pathX(uOfZ(z));

/** Mouth opening 0..1 for a speaker, driven by the word timestamps. */
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start || t > c.end) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const u = (t - w.s) / Math.max(0.05, w.e - w.s);
        return 0.35 + 0.65 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.17))));
      }
    }
  }
  return 0;
};
/** 0..1 while `who` has a line running (for head/gesture energy). */
export const speaking = (who: string, t: number) => {
  let v = 0;
  for (const c of CLIPS) if (c.who === who) v = Math.max(v, win(t, c.start - 0.2, c.start + 0.1, c.end - 0.1, c.end + 0.3));
  return v;
};
