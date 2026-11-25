// EP04 timing helpers. Every beat is read from timeline.json (Audio Master Clock), never guessed.
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const byId = new Map(TIMELINE.clips.map((c) => [c.id, c]));
export const C = (id: string): Clip => {
  const c = byId.get(id);
  if (!c) throw new Error(`EP04: no clip ${id}`);
  return c;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** First word of clip `id` whose text starts with `w` (after the `nth` match). */
export const W = (id: string, w: string, nth = 0): Word => {
  const hits = C(id).words.filter((x) => norm(x.w).startsWith(norm(w)));
  const hit = hits[nth];
  if (!hit) throw new Error(`EP04: no word "${w}" in ${id}`);
  return hit;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** 0..1..0 window with soft edges (fade in over `fi`, out over `fo`). */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) =>
  Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
/** Overshoot pop 0→1 (back-out). */
export const pop = (x: number) => {
  const c = 1.70158 * 1.4;
  const k = clamp01(x) - 1;
  return 1 + (c + 1) * k * k * k + c * k * k;
};
