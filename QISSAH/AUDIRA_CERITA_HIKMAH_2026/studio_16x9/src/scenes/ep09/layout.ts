// EP09 timing helpers: every beat is keyed to the real voice timeline (clip ids), never to raw seconds.
import timeline from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: Word[] };

export const CLIPS = timeline.clips as Clip[];
export const TOTAL_SECONDS: number = timeline.total;
export const VO_END: number = timeline.voEnd;
/** Clip start / end by id: T.s3a, E.s3a. */
export const T: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.start]));
export const E: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.end]));

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
/** 0 → 1 between a and b (smoothstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export type V3 = [number, number, number];
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Piecewise-smooth keyframes [[time, value], ...]. */
export const kv = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0] || 1)));
  }
  return keys[keys.length - 1][1];
};

/** Mouth opening 0..1 for a speaker at time t, from that speaker's word times. */
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start - 0.05 || t > c.end + 0.05) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const syl = Math.max(1, Math.round(w.w.replace(/[^\p{L}]/gu, "").length / 2.6));
        return 0.25 + 0.75 * Math.abs(Math.sin((Math.PI * syl * (t - w.s)) / Math.max(0.05, w.e - w.s)));
      }
    }
  }
  return 0;
};

/** The clip being heard (or the last one, held through short gaps) for captions. */
export const captionAt = (t: number): Clip | null => {
  let last: Clip | null = null;
  for (const c of CLIPS) {
    if (t >= c.start - 0.15 && t <= c.end + 0.5) return c;
    if (c.end < t) last = c;
  }
  if (last) {
    const next = CLIPS.find((c) => c.start > t);
    if (next && next.start - t < 0.4 && t - last.end < 1.2) return last;
  }
  return null;
};
