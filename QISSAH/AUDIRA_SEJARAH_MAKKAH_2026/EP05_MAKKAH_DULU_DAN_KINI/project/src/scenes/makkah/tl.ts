// Timeline helpers. Every time in the film comes from timeline.json (seconds of vo.wav):
// chapter starts/ends and word starts. Never write absolute seconds in a chapter file.
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; chapter: string; display: string; start: number; end: number; words: Word[] };
export type Chapter = { id: string; title: string; start: number; end: number };

export const TIMELINE = TL as unknown as {
  lead: number;
  voEnd: number;
  total: number;
  endScreen: number;
  chapters: Chapter[];
  clips: Clip[];
};

export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;

const byId = new Map(TIMELINE.chapters.map((c) => [c.id, c]));
export const CH = (id: string): Chapter => {
  const c = byId.get(id);
  if (!c) throw new Error(`chapter ${id} not in timeline`);
  return c;
};

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const wordsOf = new Map<string, Word[]>();
for (const c of TIMELINE.clips) {
  const list = wordsOf.get(c.chapter) ?? [];
  list.push(...c.words);
  wordsOf.set(c.chapter, list);
}

/** Start time of the nth occurrence of `word` in a chapter (punctuation and case ignored). */
export function W(chapter: string, word: string, nth = 0): number {
  const key = norm(word);
  const hits = (wordsOf.get(chapter) ?? []).filter((x) => norm(x.w) === key);
  const hit = hits[Math.min(nth, hits.length - 1)];
  if (!hit) throw new Error(`word "${word}" not found in ${chapter}`);
  return hit.s;
}

/** End time of a word (same lookup as W). */
export function WE(chapter: string, word: string, nth = 0): number {
  const key = norm(word);
  const hits = (wordsOf.get(chapter) ?? []).filter((x) => norm(x.w) === key);
  const hit = hits[Math.min(nth, hits.length - 1)];
  if (!hit) throw new Error(`word "${word}" not found in ${chapter}`);
  return hit.e;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const smoother = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** 0 → 1 between a and b (smoothstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1e-6, b - a));
/** Fades in over `fin` after a, out over `fout` before b. */
export const window01 = (t: number, a: number, b: number, fin = 0.5, fout = 0.5) =>
  Math.min(ramp(t, a, a + fin), 1 - ramp(t, b - fout, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
