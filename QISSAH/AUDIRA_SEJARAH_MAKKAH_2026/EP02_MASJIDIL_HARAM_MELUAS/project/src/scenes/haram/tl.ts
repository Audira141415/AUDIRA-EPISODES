// Timeline helpers: every time in the film comes from timeline.json (vo.wav seconds).
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

export const CH = Object.fromEntries(TIMELINE.chapters.map((c) => [c.id, c])) as Record<string, Chapter>;
export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;

const clean = (w: string) => w.toLowerCase().replace(/[.,;:?!"“”]/g, "");

/** Start time of the nth occurrence of `word` in chapter `ch` (throws if missing, so anchors stay honest). */
export function w(ch: string, word: string, nth = 0, edge: "s" | "e" = "s"): number {
  const target = clean(word);
  const hits = TIMELINE.clips.filter((c) => c.chapter === ch).flatMap((c) => c.words.filter((x) => clean(x.w) === target));
  const hit = hits[nth];
  if (!hit) throw new Error(`timeline anchor missing: ${ch} "${word}" #${nth}`);
  return hit[edge];
}

/** Start of the nth clip (sentence group) of a chapter. */
export const clipStart = (ch: string, n: number) => TIMELINE.clips.filter((c) => c.chapter === ch)[n].start;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(1e-6, b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Piecewise smooth track through [time, value] keys. */
export function track(t: number, keys: [number, number][]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return lerp(v0, v1, smooth((t - t0) / Math.max(1e-6, t1 - t0)));
  }
  return keys[keys.length - 1][1];
}

/** Which chapter is playing at time t (end screen = "end"). */
export function chapterAt(t: number): string {
  if (t >= VO_END) return "end";
  let id = TIMELINE.chapters[0].id;
  for (const c of TIMELINE.chapters) if (t >= c.start - 0.6) id = c.id;
  return id;
}

/** The clip being spoken at t (or the last one before it). */
export function clipAt(t: number, clips: Clip[] = TIMELINE.clips): Clip | null {
  let cur: Clip | null = null;
  for (const c of clips) if (t >= c.start - 0.05) cur = c;
  if (cur && t > cur.end + 1.2) return null;
  return cur;
}
