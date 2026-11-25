// EP05 timing helpers: every event is anchored to a word of the locked voice (timeline.json).
import timeline from "./timeline.json";

export const TL = timeline;
type Word = { w: string; s: number; e: number };
type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };
export const LINES = timeline.lines as Line[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9%-]/g, "");

/** Start time of `text` in line `lineId` (nth occurrence inside that line, 1-based). Throws if missing. */
export function w(lineId: string, text: string, nth = 1): number {
  const line = LINES.find((l) => l.id === lineId);
  if (!line) throw new Error(`EP05 timing: no line ${lineId}`);
  const hits = line.words.filter((x) => norm(x.w) === norm(text));
  const hit = hits[nth - 1];
  if (!hit) throw new Error(`EP05 timing: no word "${text}" #${nth} in ${lineId}`);
  return hit.s;
}

/** End time of a word (same lookup as w). */
export function we(lineId: string, text: string, nth = 1): number {
  const line = LINES.find((l) => l.id === lineId)!;
  const hits = line.words.filter((x) => norm(x.w) === norm(text));
  return hits[nth - 1].e;
}

export const lineStart = (id: string) => LINES.find((l) => l.id === id)!.start;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeOutBack = (x: number) => {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** 0→1 ramp starting at `a` over `d` seconds (eased in-out). */
export const ramp = (t: number, a: number, d = 0.5) => easeInOut(clamp01((t - a) / d));
/** 0→1→0 window: in at a, out at b. */
export const win = (t: number, a: number, b: number, d = 0.45) => Math.min(ramp(t, a, d), 1 - ramp(t, b, d));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
