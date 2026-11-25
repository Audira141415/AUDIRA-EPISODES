// EP07 film timing: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

/** Start of word i of clip id. */
export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
/** End of word i of clip id. */
export const WE = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].e;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 -> 1 between a and b (smoothstep). */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with a small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = clamp01((t - a) / dur);
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---- beats (word indices counted in timeline.json) ----
export const T = {
  hookEnd: SEC.HOOK[1],
  // konteks
  tahun: W("konteks", 0),
  uruguay: W("konteks", 2),
  alasan: W("konteks", 6),
  juara: W("konteks", 9),
  y1924: W("konteks", 13),
  y1928: W("konteks", 15),
  dan2: W("konteks", 16),
  seratus: W("konteks", 21),
  konstitusi: W("konteks", 23),
  // pengembangan
  masalah: W("pengembangan", 0),
  belum: W("pengembangan", 5),
  eropa: W("pengembangan", 9),
  perjalanan: W("pengembangan", 11),
  montevideo: W("pengembangan", 14),
  duaMinggu: W("pengembangan", 18),
  akhirnya: W("pengembangan", 20),
  empat: W("pengembangan", 22),
  prancis: W("pengembangan", 27),
  belgia: W("pengembangan", 28),
  rumania: W("pengembangan", 30),
  kapal: W("pengembangan", 32),
  conte: W("pengembangan", 35),
  bersama: W("pengembangan", 37),
  jules: W("pengembangan", 40),
  trofi: W("pengembangan", 43),
  totalnya: W("pengembangan", 44),
  tigaBelas: W("pengembangan", 46),
  tanpa: W("pengembangan", 49),
  // penjelasan
  juli13: W("penjelasan", 0),
  lucien: W("penjelasan", 4),
  gol: W("penjelasan", 9),
  menit: W("penjelasan", 13),
  meksiko: W("penjelasan", 17),
  stadion: W("penjelasan", 18),
  centenario: W("penjelasan", 20),
  telat: W("penjelasan", 21),
  hujan: W("penjelasan", 24),
  baru: W("penjelasan", 26),
  lima: W("penjelasan", 28),
  tepat: W("penjelasan", 31),
  konst2: W("penjelasan", 34),
  // payoff
  final: W("payoff", 0),
  tigaPuluh: W("payoff", 1),
  uru: W("payoff", 4),
  arg: W("payoff", 6),
  kedua: W("payoff", 7),
  bolaSendiri: W("payoff", 11),
  jalan: W("payoff", 13),
  babak1: W("payoff", 15),
  bolaArg: W("payoff", 18),
  argUnggul: W("payoff", 21),
  duaSatu: W("payoff", 23),
  babak2: W("payoff", 24),
  bolaUru: W("payoff", 27),
  uruBalik: W("payoff", 30),
  empatDua: W("payoff", 34),
  juaraDunia: W("payoff", 35),
  besoknya: W("payoff", 39),
  libur: W("payoff", 42),
  // outro
  audira: W("outro", 0),
  berikut: W("outro", 5),
  maracanazo: W("outro", 7),
  outroCard: TOTAL - 3.8,
};

/** Hard cuts between sets, each hidden under a paper-sheet wipe. */
export const CUTS = {
  toMap: SEC.KONTEKS[0] - 0.06,
  toCal: SEC.PENGEMBANGAN[0] - 0.08,
  toSea: T.perjalanan - 0.22,
  toPocitos: SEC.PENJELASAN[0] - 0.1,
  toBuild: T.stadion - 0.25,
};
export const CUT_LIST = Object.values(CUTS);

export type SetId = "stadium" | "map" | "cal" | "sea" | "pocitos";
export const setAt = (t: number): SetId =>
  t < CUTS.toMap ? "stadium" : t < CUTS.toCal ? "map" : t < CUTS.toSea ? "cal" : t < CUTS.toPocitos ? "sea" : t < CUTS.toBuild ? "pocitos" : "stadium";
