// EP02 timing: every event is anchored to a word of the locked voice (timeline.json), never to
// absolute seconds. W("word", n) = start of the nth occurrence; WE = its end.
import timeline from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };

export const TL = timeline as unknown as { lead: number; voEnd: number; total: number; lines: Line[] };

const norm = (w: string) => w.toLowerCase().replace(/[.,:;!?]+$/, "");
const ALL: Word[] = TL.lines.flatMap((l) => l.words);

const find = (text: string, n = 1): Word => {
  const key = norm(text);
  let k = 0;
  for (const w of ALL) {
    if (norm(w.w) === key && ++k === n) return w;
  }
  throw new Error(`EP02 timing: word "${text}" #${n} not found`);
};
export const W = (text: string, n = 1) => find(text, n).s;
export const WE = (text: string, n = 1) => find(text, n).e;
export const LINE = (id: string) => {
  const l = TL.lines.find((x) => x.id === id);
  if (!l) throw new Error(`EP02 timing: line ${id} not found`);
  return l;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * k * (k * (k * 6 - 15) + 10);
};
/** 0..1 ramp between a and b (smootherstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** Ease-out growth with a tiny settle (no overshoot above 1). */
export const grow = (t: number, a: number, b: number) => {
  const k = clamp01((t - a) / (b - a));
  return 1 - Math.pow(1 - k, 3);
};
