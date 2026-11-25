// EP03 Ibnu al-Haitsam: the locked voice is the master clock. Every camera key and timed event is
// anchored to a word of timeline.json (seconds of vo.wav), never to absolute seconds.

import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };
export type Part = { id: string; start: number; end: number };

export const TIMELINE = TL as unknown as { lead: number; voEnd: number; total: number; parts: Part[]; lines: Line[] };
export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;
/** Outro card window: from voEnd + 0.6 s to the end. */
export const OUTRO_AT = VO_END + 0.6;
export const ALL_WORDS: Word[] = TIMELINE.lines.flatMap((l) => l.words);

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const TOKS = ALL_WORDS.map((w) => norm(w.w));

export const part = (id: string): Part => {
  const p = TIMELINE.parts.find((x) => x.id === id);
  if (!p) throw new Error(`part ${id}`);
  return p;
};

/** Start (or end) time of the nth occurrence of `phrase` (one or more words) in the whole voice. Throws if missing. */
export function at(phrase: string, nth = 0, which: "s" | "e" = "s"): number {
  const p = phrase.split(/\s+/).map(norm);
  let hit = 0;
  for (let i = 0; i + p.length <= TOKS.length; i++) {
    if (p.every((x, k) => TOKS[i + k] === x)) {
      if (hit === nth) return which === "s" ? ALL_WORDS[i].s : ALL_WORDS[i + p.length - 1].e;
      hit++;
    }
  }
  throw new Error(`anchor not found: "${phrase}" #${nth}`);
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0..1 progress of t across [a, b]. */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Fade in from a (over d s), fade out ending at b. */
export const window01 = (t: number, a: number, b: number, d = 0.5) => Math.min(prog(t, a, a + d), 1 - prog(t, b - d, b));
