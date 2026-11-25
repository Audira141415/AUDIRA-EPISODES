// EP01 timing: every timed event is anchored to a word of the locked voice (timeline.json), never to
// absolute seconds. w("70.000", 2) = second occurrence of that display word.
import timeline from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };

export const LINES = timeline.lines as Line[];
export const VO_END = timeline.voEnd;
export const TOTAL = timeline.total;
export const ALL_WORDS: Word[] = LINES.flatMap((l) => l.words);

const norm = (s: string) => s.toLowerCase().replace(/[.,:;!?]+$/g, "");

/** Word by display text (punctuation ignored) and 1-based occurrence. Throws if missing so a typo fails loudly. */
export function w(text: string, nth = 1): Word {
  let n = 0;
  for (const x of ALL_WORDS) {
    if (norm(x.w) === norm(text) && ++n === nth) return x;
  }
  throw new Error(`timing: word "${text}" #${nth} not in timeline`);
}

export function line(id: string): Line {
  const l = LINES.find((x) => x.id === id);
  if (!l) throw new Error(`timing: line ${id} missing`);
  return l;
}

export const part = (id: string) => {
  const p = timeline.parts.find((x) => x.id === id);
  if (!p) throw new Error(`timing: part ${id} missing`);
  return p;
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** 0 → 1 between a and b (smootherstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** Snap-in pop: 0 before t0, overshoot to ~1.08 then settle at 1 over `dur`. */
export const pop = (t: number, t0: number, dur = 0.45) => {
  const x = (t - t0) / dur;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c = 1.70158 * 1.2;
  const y = x - 1;
  return 1 + (c + 1) * y * y * y + c * y * y;
};
