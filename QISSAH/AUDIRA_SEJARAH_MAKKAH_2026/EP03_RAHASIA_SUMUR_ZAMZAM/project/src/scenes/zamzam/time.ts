// EP03 Zamzam: the locked voice is the master clock. Every camera key and timed event is anchored
// to a word of timeline.json (seconds of vo.wav), never to absolute seconds.

import TL from "./timeline.json";
import S1 from "./short01.json";
import S2 from "./short02.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; chapter: string; display: string; start: number; end: number; words: Word[] };
export type Chapter = { id: string; title: string; start: number; end: number };

export const TIMELINE = TL as unknown as { lead: number; voEnd: number; total: number; chapters: Chapter[]; clips: Clip[] };
export const VO_END = TIMELINE.voEnd;
export const TOTAL = TIMELINE.total;

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const byChapter = new Map<string, Word[]>();
for (const c of TIMELINE.clips) {
  const arr = byChapter.get(c.chapter) ?? [];
  arr.push(...c.words);
  byChapter.set(c.chapter, arr);
}

export const chapter = (id: string): Chapter => {
  const c = TIMELINE.chapters.find((x) => x.id === id);
  if (!c) throw new Error(`chapter ${id}`);
  return c;
};

/** Start time of the nth occurrence of `phrase` (a few words) in chapter `cid`. Throws if missing. */
export function at(cid: string, phrase: string, nth = 0, which: "s" | "e" = "s"): number {
  const ws = byChapter.get(cid) ?? [];
  const toks = ws.map((w) => norm(w.w));
  const p = phrase.split(/\s+/).map(norm);
  let hit = 0;
  for (let i = 0; i + p.length <= toks.length; i++) {
    if (p.every((x, k) => toks[i + k] === x)) {
      if (hit === nth) return which === "s" ? ws[i].s : ws[i + p.length - 1].e;
      hit++;
    }
  }
  throw new Error(`anchor not found: ${cid} "${phrase}" #${nth}`);
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0..1 progress of t across [a, b]. */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Fade in at a (over `d` s), out at b. */
export const window01 = (t: number, a: number, b: number, d = 0.6) => Math.min(prog(t, a, a + d), 1 - prog(t, b - d, b));

// ---- short clocks: map short time to the long-form clock -----------------------------------
export type Seg = { kind: "hook" | "reuse" | "outro"; start: number; end: number; srcStart: number; srcEnd: number };
export type ShortDef = { id: string; title: string; duration: number; segments: Seg[]; words: Word[] };
export const SHORTS: Record<"short01" | "short02", ShortDef> = { short01: S1 as ShortDef, short02: S2 as ShortDef };

/** Which long-form moment a short's hook / outro shows. */
export const SHORT_VISUAL: Record<"short01" | "short02", { hook: number; outro: number }> = {
  short01: { hook: 3.0, outro: chapter("c09_penutup").start + 1 },
  short02: { hook: chapter("c08_ekspor").start + 0.5, outro: chapter("c09_penutup").start + 1 },
};

export type Mode = "long" | "short01" | "short02";

/** Film clock (long-form seconds) for a short at short time `ts`. */
export function srcTime(mode: Mode, ts: number): { t: number; seg: Seg["kind"] | "long" } {
  if (mode === "long") return { t: ts, seg: "long" };
  const sd = SHORTS[mode];
  const vis = SHORT_VISUAL[mode];
  const segs = sd.segments;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const nextStart = i + 1 < segs.length ? segs[i + 1].start : Infinity;
    if (ts < nextStart || i === segs.length - 1) {
      const local = Math.max(0, ts - s.start);
      if (s.kind === "hook") return { t: vis.hook + local, seg: "hook" };
      if (s.kind === "outro") return { t: vis.outro + local, seg: "outro" };
      return { t: s.srcStart + Math.min(local, s.srcEnd - s.srcStart + 0.39), seg: "reuse" };
    }
  }
  return { t: ts, seg: "long" };
}
