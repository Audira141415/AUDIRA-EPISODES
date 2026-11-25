// One coordinate + timing module for EP05. Everything keys to clip ids from timeline.json,
// so the film re-times itself when the real Cartesia voice replaces the estimate.
import tl from "./timeline.json";

export const FILM_FPS = 60;
export const TOTAL_SECONDS: number = tl.total;
export const VO_END: number = tl.voEnd;

export type Who = "narator" | "kura" | "kalajengking";
export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

/** Start time of the first word in clip `id` that begins with `prefix` (case-insensitive). */
export const W = (id: string, prefix: string): number => {
  const c = CLIPS.find((k) => k.id === id);
  if (!c) return 0;
  const w = c.words.find((x) => x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return w ? w.s : c.start;
};

/* ---------- world coordinates (water surface at y = 0, scroll runs along +x) ---------- */
export const ROCK = { x: -4.55, z: 0.85, top: 0.56 };     // the scorpion's rock on the near bank
export const STONE = { x: -3.3, z: -0.35, top: 0.13 };    // flat sunning stone at the water's edge
export const MID_X = 11.5;                                  // the middle of the river: the sting
export const FAR_BANK_X = 30;

/** Mouth / gesture drive 0..1 for a speaker, from the word timestamps. */
export const mouthOf = (who: Who, t: number) => {
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
/** 1 while `who` has a clip running (with soft edges), for posture. */
export const speaking = (who: Who, t: number) => {
  let k = 0;
  for (const c of CLIPS) {
    if (c.who !== who) continue;
    const a = Math.min(1, Math.max(0, (t - c.start + 0.25) / 0.3)) * Math.min(1, Math.max(0, (c.end + 0.3 - t) / 0.3));
    k = Math.max(k, a);
  }
  return k;
};

/* ---------- small math ---------- */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const ramp = (t: number, a: number, b: number, e: (k: number) => number = smooth) => e(clamp((t - a) / (b - a)));
/** Piecewise keyframes [time, value], smoothstep between keys. */
export const kv = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, smooth(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
  }
  return keys[keys.length - 1][1];
};
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
