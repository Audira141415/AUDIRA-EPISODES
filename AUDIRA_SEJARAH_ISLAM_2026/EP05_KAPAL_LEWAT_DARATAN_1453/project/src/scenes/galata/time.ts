// Word-anchored timing for EP05 Galata. Every camera key and timed event comes from the locked voice
// timeline (audio/timeline.json, copied here). Look words up by text inside a line, nth occurrence.
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Line = { id: string; part: string; display: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { lead: number; voEnd: number; total: number; parts: { id: string; start: number; end: number }[]; lines: Line[] };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9-]/g, "");

/** Start time (s) of `text` in line `lineId` (nth occurrence, 1-based). Throws when missing so a typo never fails silently. */
export const W = (lineId: string, text: string, nth = 1, edge: "s" | "e" = "s"): number => {
  const line = TIMELINE.lines.find((l) => l.id === lineId);
  if (!line) throw new Error(`no line ${lineId}`);
  const hits = line.words.filter((w) => norm(w.w) === norm(text));
  const hit = hits[nth - 1];
  if (!hit) throw new Error(`no word "${text}" #${nth} in ${lineId}`);
  return hit[edge];
};
export const WE = (lineId: string, text: string, nth = 1) => W(lineId, text, nth, "e");
export const PART = (id: string) => TIMELINE.parts.find((p) => p.id === id)!;
export const TOTAL = TIMELINE.total;
export const VO_END = TIMELINE.voEnd;
export const OUTRO_AT = VO_END + 0.6;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** 0→1 ramp between times a and b (smootherstep). */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** Window: rises a→a+fade, falls b→b+fade. */
export const win = (t: number, a: number, b: number, fade = 0.5) => ramp(t, a, a + fade) * (1 - ramp(t, b, b + fade));
