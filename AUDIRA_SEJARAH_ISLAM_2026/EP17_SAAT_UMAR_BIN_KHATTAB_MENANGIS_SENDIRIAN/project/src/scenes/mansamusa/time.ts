// Audio master clock for EP04. Every camera key and timed event is a word time from timeline.json
// (seconds of vo.wav), looked up by text (nth occurrence when a word repeats), never a fixed second.

import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };

export const TIMELINE = TL as unknown as {
  lead: number;
  voEnd: number;
  total: number;
  parts: { id: string; start: number; end: number }[];
  lines: Line[];
};

export const WORDS: Word[] = TIMELINE.lines.flatMap((l) => l.words);

const norm = (s: string) => s.toLowerCase().replace(/[.,!?;:"“”]/g, "");

/** Start time (s) of the nth occurrence (1-based) of `word` in the whole narration. */
export function W(word: string, nth = 1): number {
  const key = norm(word);
  let n = 0;
  for (const w of WORDS) {
    if (norm(w.w) === key && ++n === nth) return w.s;
  }
  throw new Error(`word not found in timeline: ${word} #${nth}`);
}

/** End time (s) of the nth occurrence of `word`. */
export function WE(word: string, nth = 1): number {
  const key = norm(word);
  let n = 0;
  for (const w of WORDS) {
    if (norm(w.w) === key && ++n === nth) return w.e;
  }
  throw new Error(`word not found in timeline: ${word} #${nth}`);
}

export const PART = Object.fromEntries(TIMELINE.parts.map((p) => [p.id, p])) as Record<string, { start: number; end: number }>;

export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;
/** Outro card: from voEnd + 0.6 s to the end. */
export const OUTRO_AT = VO_END + 0.6;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
/** 0 → 1 between a and b (smoothstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** Visible window with soft edges: fades in over `fi` after a, out over `fo` before b. */
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
