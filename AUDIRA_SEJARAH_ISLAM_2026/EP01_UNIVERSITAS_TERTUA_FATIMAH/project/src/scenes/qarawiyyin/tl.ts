// EP01 timing: every beat is anchored to a word of the locked voice (audio/timeline.json, copied
// here). W("kunci") = start second of the first "kunci"; W("empat", 2) = the third "empat".
import TLJ from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };
export type Part = { id: string; start: number; end: number };
export const TL = TLJ as unknown as { lead: number; voEnd: number; total: number; parts: Part[]; lines: Line[] };

const norm = (s: string) => s.toLowerCase().replace(/[.,:;?!]/g, "");

/** Start second of the nth occurrence (0-based) of `word` (punctuation and case ignored). */
export const W = (word: string, nth = 0): number => {
  const want = norm(word);
  let k = 0;
  for (const l of TL.lines)
    for (const x of l.words)
      if (norm(x.w) === want) {
        if (k === nth) return x.s;
        k++;
      }
  throw new Error(`word not in timeline: ${word} #${nth}`);
};
/** End second of the nth occurrence of `word`. */
export const WE = (word: string, nth = 0): number => {
  const want = norm(word);
  let k = 0;
  for (const l of TL.lines)
    for (const x of l.words)
      if (norm(x.w) === want) {
        if (k === nth) return x.e;
        k++;
      }
  throw new Error(`word not in timeline: ${word} #${nth}`);
};
export const PART = (id: string): Part => {
  const p = TL.parts.find((x) => x.id === id);
  if (!p) throw new Error(`part ${id}`);
  return p;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
/** 0 before a, eased 0..1 between a and b, 1 after. */
export const ramp = (t: number, a: number, b: number) => ease((t - a) / Math.max(1e-6, b - a));
/** In over [a, a+fi], out over [b-fo, b]. */
export const win = (t: number, a: number, b: number, fi = 0.5, fo = 0.5) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Outro card window. */
export const OUTRO_AT = TL.voEnd + 0.6;
