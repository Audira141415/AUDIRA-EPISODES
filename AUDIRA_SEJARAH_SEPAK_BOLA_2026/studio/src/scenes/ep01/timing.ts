// EP01 film: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

/** Start of word i of clip id. */
export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
/** 0 -> 1 between a and b (smoothstep). */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with a small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = Math.min(1, Math.max(0, (t - a) / dur));
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---- beats ----
export const T = {
  // hook
  hookEnd: SEC.HOOK[1],
  // konteks
  sejak: W("konteks", 0),
  uruguay: W("konteks", 3),
  n84: W("konteks", 4),
  n13: W("konteks", 10),
  final: W("konteks", 14),
  n8: W("konteks", 17),
  trofi: W("konteks", 21),
  // pengembangan
  eng: W("pengembangan", 0),
  eng1966: W("pengembangan", 7),
  uru: W("pengembangan", 8),
  fra: W("pengembangan", 10),
  dua1: W("pengembangan", 12),
  esp: W("pengembangan", 13),
  kedua: W("pengembangan", 18),
  juli: W("pengembangan", 20),
  menang: W("pengembangan", 22),
  argOpp: W("pengembangan", 25),
  ferran: W("pengembangan", 28),
  menit: W("pengembangan", 31),
  arg: W("pengembangan", 34),
  argTiga: W("pengembangan", 35),
  ita: W("pengembangan", 36),
  ger: W("pengembangan", 38),
  empat: W("pengembangan", 40),
  jerBarat: W("pengembangan", 46),
  puncak: W("pengembangan", 48),
  bra: W("pengembangan", 51),
  lima: W("pengembangan", 52),
  // penjelasan
  lihat: W("penjelasan", 0),
  benua: W("penjelasan", 3),
  eropa: W("penjelasan", 10),
  amsel: W("penjelasan", 14),
  belum: W("penjelasan", 17),
  afrika: W("penjelasan", 21),
  asia: W("penjelasan", 22),
  amut: W("penjelasan", 24),
  tuan: W("penjelasan", 30),
  enam: W("penjelasan", 33),
  terakhir: W("penjelasan", 36),
  y1998: W("penjelasan", 39),
  // payoff
  drama: W("payoff", 0),
  pertama: W("payoff", 5),
  dicuri1: W("payoff", 7),
  ditemukan: W("payoff", 11),
  pickles: W("payoff", 15),
  y1983: W("payoff", 16),
  dicuri2: W("payoff", 20),
  kembali: W("payoff", 26),
  kini: W("payoff", 29),
  spanyolKini: W("payoff", 33),
  sejak1974: W("payoff", 36),
  // outro
  audira: W("outro", 0),
  berikut: W("outro", 5),
  brasilNext: W("outro", 8),
  outroCard: SEC.OUTRO[1] + 0.2,
};
