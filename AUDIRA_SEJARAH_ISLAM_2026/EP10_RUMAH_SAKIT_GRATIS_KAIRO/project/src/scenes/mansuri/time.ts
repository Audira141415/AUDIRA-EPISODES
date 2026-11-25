// EP10 Mansuri: the locked voice (audio/vo.wav) is the master clock. Every camera key and timed
// event is anchored to a word of timeline.json (seconds of vo.wav), never to absolute seconds.
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };
export type Part = { id: string; start: number; end: number };

export const TIMELINE = TL as unknown as { lead: number; voEnd: number; total: number; parts: Part[]; lines: Line[] };
export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;
/** Outro card window: voEnd + 0.6 s to the end. */
export const OUTRO_AT = VO_END + 0.6;
export const ALL_WORDS: Word[] = TIMELINE.lines.flatMap((l) => l.words);

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const byPart = new Map<string, Word[]>();
for (const l of TIMELINE.lines) {
  const arr = byPart.get(l.part) ?? [];
  arr.push(...l.words);
  byPart.set(l.part, arr);
}

export const part = (id: string): Part => {
  const p = TIMELINE.parts.find((x) => x.id === id);
  if (!p) throw new Error(`part ${id}`);
  return p;
};

/** Start (or end) time of the nth occurrence of `phrase` in part `pid`. Throws if missing. */
export function at(pid: string, phrase: string, nth = 0, which: "s" | "e" = "s"): number {
  const ws = byPart.get(pid) ?? [];
  const toks = ws.map((w) => norm(w.w));
  const p = phrase.split(/\s+/).map(norm);
  let hit = 0;
  for (let i = 0; i + p.length <= toks.length; i++) {
    if (p.every((x, k) => toks[i + k] === x)) {
      if (hit === nth) return which === "s" ? ws[i].s : ws[i + p.length - 1].e;
      hit++;
    }
  }
  throw new Error(`anchor not found: ${pid} "${phrase}" #${nth}`);
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Fade in over `d` s from a, fade out over `d` s before b. */
export const win = (t: number, a: number, b: number, d = 0.5) => Math.min(prog(t, a, a + d), 1 - prog(t, b - d, b));
