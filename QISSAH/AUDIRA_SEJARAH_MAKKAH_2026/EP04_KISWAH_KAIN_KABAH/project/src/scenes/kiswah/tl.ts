// Timeline helpers. Every timed event in the film is anchored to a word or a chapter time of the
// locked voice (timeline.json, seconds of vo.wav); nothing uses absolute seconds.
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
export const CHAPTERS = TIMELINE.chapters;
export const CLIPS = TIMELINE.clips;

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const CH = (id: string): Chapter => {
  const c = CHAPTERS.find((x) => x.id === id);
  if (!c) throw new Error(`chapter missing: ${id}`);
  return c;
};

const wordsOf = (ch: string) => CLIPS.filter((c) => c.chapter === ch).flatMap((c) => c.words);

/** Start time of the nth occurrence (0-based) of `word` in chapter `ch`. Throws if it does not exist. */
export const W = (ch: string, word: string, nth = 0): number => {
  const k = norm(word);
  const hits = wordsOf(ch).filter((x) => norm(x.w) === k);
  if (!hits[nth]) throw new Error(`anchor missing: ${ch} "${word}" #${nth}`);
  return hits[nth].s;
};
/** End time of that word. */
export const WE = (ch: string, word: string, nth = 0): number => {
  const k = norm(word);
  const hits = wordsOf(ch).filter((x) => norm(x.w) === k);
  if (!hits[nth]) throw new Error(`anchor missing: ${ch} "${word}" #${nth}`);
  return hits[nth].e;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / Math.max(1e-6, b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Eased 0..1 over [a, a+d]. */
export const ease = (t: number, a: number, d = 0.8) => smoother(ramp(t, a, a + d));
/** Back-out pop 0..1 (overshoot ≤ 4%). */
export const pop = (t: number, a: number, d = 0.5) => {
  const x = ramp(t, a, a + d);
  const c = 1.2;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

/** Station spacing along the runner (world x). */
export const STATION = 12;
export const SX = (i: number) => i * STATION;

/** Which chapter is playing at t (or the nearest previous). */
export const chapterAt = (t: number): Chapter => {
  let cur = CHAPTERS[0];
  for (const c of CHAPTERS) if (t >= c.start - 1.0) cur = c;
  return cur;
};
