// AE-055 timing: every cut and beat is read from timeline.json (Audio Master Clock), never guessed.
import TL from "./timeline.json";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

export const TIMELINE = TL as unknown as {
  total: number;
  voEnd: number;
  sections: Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
  clips: Clip[];
};
export const SEC = TIMELINE.sections;
export const clip = (id: string) => {
  const c = TIMELINE.clips.find((x) => x.id === id);
  if (!c) throw new Error(`timeline clip ${id} missing`);
  return c;
};
/** Start time of the n-th occurrence of a word (punctuation ignored) inside a clip. */
export const word = (id: string, w: string, nth = 0) => {
  const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
  const hits = clip(id).words.filter((x) => norm(x.w) === norm(w));
  if (!hits[nth]) throw new Error(`word ${w} in ${id} missing`);
  return hits[nth];
};

export const OUTRO_START = SEC.OUTRO[1] + 0.2;

// Shot cuts (seconds of VO), each on a sentence or key word.
export const CUT = {
  hook: 0,
  crane: clip("l02").start - 0.1, // "Ia punya sekitar delapan belas ribu tabung"
  name: SEC.KONTEKS[0], // "Namanya ENIAC"
  overhead: clip("l04").start, // "Beratnya ... satu ruangan"
  tube: SEC.MEKANISME[0], // "Tiap tabung vakum ... saklar"
  ring: clip("l06").start, // "penghitung sepuluh posisi"
  decimal: clip("l07").start, // "desimal, bukan biner"
  carry: clip("l08").start, // pulses, carry, odometer
  question: SEC.REVEAL[0], // "Lalu bagaimana memprogramnya?"
  hands: clip("l10").start, // "Dengan tangan." + cables
  switches: word("l11", "lalu").s, // "lalu memutar ribuan saklar"
  days: clip("l12").start, // "berhari-hari"
  women: SEC.PAYOFF[0], // six programmers
  cable: SEC.OUTRO[0], // "kabel, bukan ketikan"
  plate: OUTRO_START - 2.3, // AUDIRA plate close-up (>= 2 s) under "Ini AUDIRA Explained."
  outro: OUTRO_START,
};
export type ShotName = keyof typeof CUT;
export const SHOTS = (Object.keys(CUT) as ShotName[]).sort((a, b) => CUT[a] - CUT[b]);
export const shotAt = (t: number) => {
  let cur: ShotName = "hook";
  for (const s of SHOTS) if (t >= CUT[s]) cur = s;
  const i = SHOTS.indexOf(cur);
  const end = i + 1 < SHOTS.length ? CUT[SHOTS[i + 1]] : TIMELINE.total;
  return { name: cur, start: CUT[cur], end, u: Math.min(1, Math.max(0, (t - CUT[cur]) / (end - CUT[cur]))), lt: t - CUT[cur] };
};
