// ANJING KECIL: one coordinate + timing module. Staging, cameras, captions and the mix all read these numbers.
import tl from "./timeline.json";

export const FILM_FPS = 60;
export const TOTAL_SECONDS: number = tl.total;

export type Clip = { id: string; who: string; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** 0 before a, 1 after b, smooth between. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1e-4, b - a));
/** 1 inside [a, b] with soft edges of width w. */
export const during = (t: number, a: number, b: number, w = 0.35) => ramp(t, a - w, a) * (1 - ramp(t, b, b + w));

/** Piecewise smooth interpolation through [time, value] keys. */
export const kv = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerp(v0, v1, smooth((t - t0) / Math.max(1e-4, t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};
export type V3 = [number, number, number];
export const kv3 = (t: number, keys: [number, V3][]): V3 => [
  kv(t, keys.map(([k, v]) => [k, v[0]])),
  kv(t, keys.map(([k, v]) => [k, v[1]])),
  kv(t, keys.map(([k, v]) => [k, v[2]])),
];

/** Stop-motion clock: poses change 12 times per second (step 5 on the 60 fps film clock). */
export const stepT = (t: number, step = 5) => Math.floor((t * FILM_FPS) / step) * step / FILM_FPS;

/** Mouth opening 0..1 for a speaker, driven by the word times of their own lines. */
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start || t > c.end) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const u = (t - w.s) / Math.max(0.05, w.e - w.s);
        return 0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.18))));
      }
    }
  }
  return 0;
};
/** 1 while `who` is inside one of their lines (with a small margin), for head/puff gestures. */
export const speaking = (who: string, t: number, pad = 0.25) =>
  CLIPS.some((c) => c.who === who && t >= c.start - pad && t <= c.end + pad) ? 1 : 0;

/* ---------- the diorama map (ground is y = 0, the table slab spans x -7..7, z -6.5..5.5) ---------- */
export const HOUSE: V3 = [0.9, 0, -5.0];
export const BARN: V3 = [-4.1, 0, -3.6];
export const HORSE: V3 = [-3.25, 0, -1.75];
export const SHED: V3 = [-1.05, 0, -3.25];
export const COW: V3 = [-0.95, 0, -1.95];
export const PEN: V3 = [2.75, 0, -2.25];
export const SHEEP: V3 = [2.35, 0, -1.65];
export const COOP: V3 = [4.75, 0, -0.35];
export const HEN: V3 = [4.05, 0, 0.25];
export const HAY: V3 = [4.15, 0, 1.75];
export const POND: V3 = [-3.25, 0, 2.95];
export const WILLOW: V3 = [-4.75, 0, 1.4];
export const KENNEL: V3 = [-5.55, 0, 0.25];
export const GATE: V3 = [5.6, 0, 3.4];
export const LANTERN: V3 = [4.95, 0, 2.55];
