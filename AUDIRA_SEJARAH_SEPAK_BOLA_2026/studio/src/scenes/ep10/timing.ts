// EP10 film: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
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
/** linear 0 -> 1 between a and b. */
export const lin = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with a small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = Math.min(1, Math.max(0, (t - a) / dur));
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---- beats (all word times) ----
export const T = {
  // hook
  gol4: W("hook", 0),
  enam: W("hook", 2),
  kandang: W("hook", 5),
  hookEnd: SEC.HOOK[1],
  // konteks
  semifinal: W("konteks", 0),
  juli: W("konteks", 3),
  belo: W("konteks", 6),
  tuan: W("konteks", 8),
  neymar: W("konteks", 13),
  cedera: W("konteks", 15),
  kapten: W("konteks", 20),
  thiago: W("konteks", 21),
  akumulasi: W("konteks", 25),
  kontEnd: SEC.KONTEKS[1],
  // pengembangan
  m11: W("pengembangan", 0),
  muller: W("pengembangan", 2),
  m23: W("pengembangan", 6),
  klose: W("pengembangan", 10),
  rekor: W("pengembangan", 17),
  m24: W("pengembangan", 20),
  m26: W("pengembangan", 25),
  kroos: W("pengembangan", 28),
  berselang: W("pengembangan", 33),
  m29: W("pengembangan", 39),
  khedira: W("pengembangan", 43),
  limaNol: W("pengembangan", 45),
  empatGol: W("pengembangan", 49),
  tercepat: W("pengembangan", 54),
  pengEnd: SEC.PENGEMBANGAN[1],
  // penjelasan
  babak2: W("penjelasan", 0),
  pengganti: W("penjelasan", 3),
  schurrle: W("penjelasan", 5),
  duaGol: W("penjelasan", 7),
  oscar: W("penjelasan", 9),
  m90: W("penjelasan", 12),
  tujuhSatu: W("penjelasan", 15),
  anehnya: W("penjelasan", 16),
  menguasai: W("penjelasan", 21),
  p52: W("penjelasan", 23),
  menembak: W("penjelasan", 28),
  s18: W("penjelasan", 31),
  s14: W("penjelasan", 34),
  jelEnd: SEC.PENJELASAN[1],
  // payoff
  kekalahan: W("payoff", 0),
  memutus: W("payoff", 2),
  n62: W("payoff", 3),
  sejak1975: W("payoff", 12),
  orang: W("payoff", 14),
  mineirazo: W("payoff", 16),
  maracanazo: W("payoff", 20),
  limaHari: W("payoff", 21),
  jerman: W("payoff", 24),
  satuNol: W("payoff", 27),
  argentina: W("payoff", 29),
  gotze: W("payoff", 32),
  m113: W("payoff", 35),
  payEnd: SEC.PAYOFF[1],
  // outro
  audira: W("outro", 1),
  berikut: W("outro", 5),
  cuju: W("outro", 10),
  outroCard: TOTAL - 3.8,
};
