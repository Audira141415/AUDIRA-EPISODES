// AE-068 Audio Master Clock helpers: everything reads timeline.json (VO seconds).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const SEC = TL.sections as unknown as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
export const CL = TL.clips as unknown as Clip[];
export const TOTAL: number = (TL as { total: number }).total;

/** Start time of the first word in clip `ci` that begins with `prefix` (case-insensitive). */
export const wordT = (ci: number, prefix: string): number => {
  const w = CL[ci].words.find((x) => x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!w) throw new Error(`ep068 timing: "${prefix}" not in clip ${ci}`);
  return w.s;
};
