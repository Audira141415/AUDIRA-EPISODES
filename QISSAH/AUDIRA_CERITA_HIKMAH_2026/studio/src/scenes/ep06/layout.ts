// EP06 JESSICA: one coordinate + timing module. Everything keys off the clip times in timeline.json,
// so the film re-times itself when the real Cartesia voice replaces the estimate.
import tl from "./timeline.json";

export const TOTAL_SECONDS: number = tl.total;
export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

export type V3 = [number, number, number];

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const ramp = (t: number, a: number, b: number) => smooth(clamp((t - a) / Math.max(1e-4, b - a)));
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** Piecewise value through [time, value] keys with eased segments. */
export const kv = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t < t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, smooth(clamp((t - t0) / Math.max(1e-4, t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
};
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const blinkAt = (t: number, seed: number) => {
  const period = 3.2 + hash(seed) * 1.7;
  const u = ((t + seed) % period) / 0.15;
  return u < 1 ? Math.sin(u * Math.PI) : 0;
};

/** Mouth opening 0..1 for a speaker, driven by the word timestamps of their own lines. */
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start || t > c.end) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const u = (t - w.s) / Math.max(0.05, w.e - w.s);
        return 0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.17))));
      }
    }
  }
  return 0;
};
export const speaking = (who: string, t: number) => CLIPS.some((c) => c.who === who && t >= c.start && t <= c.end);

/* ---------- the house (cutaway diorama), metres ---------- */
export const HOUSE = { x0: -3.2, x1: 3.2, z0: -2.4, z1: 0.6, h: 2.7, apex: 4.1, part: 0.5 };
export const DOOR_GAP = { z0: -0.85, z1: -0.05, top: 2.0 };
export const DESK = { x: -1.45, z: -1.0, w: 1.5, d: 0.7, h: 0.76 };
export const CHAIR_Z = -1.72;
export const LAMP: V3 = [-2.02, DESK.h, -1.18];
export const TOYS: V3 = [2.45, 0, -1.85];
export const GATE_X = 1.25;
export const FENCE_Z = 3.0;
export const STREET = { z0: 3.4, z1: 6.2 };
