// Audio master clock: every cut and beat comes from timeline.json (VO seconds = film seconds).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export const TOTAL = TL.total;
export const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
export const WORDS: Word[] = TL.clips.flatMap((c) => c.words as Word[]);
export const CLIPS = TL.clips as { id: string; section: string; text: string; start: number; end: number; words: Word[] }[];
export const OUTRO_START = SEC.OUTRO[1] + 0.2;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** Start time of the first word matching `w` that starts at or after `after`. Throws if absent (keeps beats honest). */
export const W = (w: string, after = 0): number => {
  const hit = WORDS.find((x) => norm(x.w) === norm(w) && x.s >= after - 1e-6);
  if (!hit) throw new Error(`word not in timeline: ${w} after ${after}`);
  return hit.s;
};
/** End time of that word. */
export const WE = (w: string, after = 0): number => {
  const hit = WORDS.find((x) => norm(x.w) === norm(w) && x.s >= after - 1e-6);
  if (!hit) throw new Error(`word not in timeline: ${w} after ${after}`);
  return hit.e;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (k: number) => { const x = clamp(k); return x * x * (3 - 2 * x); };
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
/** Eased 0..1 between two times. */
export const ramp = (t: number, a: number, b: number, f: (k: number) => number = ease) => f((t - a) / (b - a));
export const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => lerp(v, b[i], k)) as [number, number, number];
