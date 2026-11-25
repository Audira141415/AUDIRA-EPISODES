// EP08 film clock: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

/** Start of word i of clip id. */
export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 -> 1 between a and b (smoothstep). */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** 0 -> 1 between a and b, ease in-out (stronger than smoothstep). */
export const ease = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with a small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = clamp01((t - a) / dur);
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---- beats (word starts) ----
export const T = {
  // hook
  noFinal: W("hook", 3), // tidak
  hampir: W("hook", 10),
  terdiam: W("hook", 15),
  hookEnd: SEC.HOOK[1],
  // konteks
  grup: W("konteks", 2),
  laga: W("konteks", 5),
  juli: W("konteks", 7), // enam (belas Juli)
  maracana: W("konteks", 12),
  brasil4: W("konteks", 13),
  uruguay3: W("konteks", 16),
  cukup: W("konteks", 18), // Brasil cukup seri
  seri: W("konteks", 20),
  menghajar: W("konteks", 26),
  swedia: W("konteks", 27),
  spanyol: W("konteks", 30),
  // pengembangan
  tiket: W("pengembangan", 0),
  n173: W("pengembangan", 3),
  penonton: W("pengembangan", 9),
  hampir2: W("pengembangan", 13),
  babak: W("pengembangan", 18),
  nol: W("pengembangan", 20),
  m47: W("pengembangan", 21),
  friaca: W("pengembangan", 25),
  m66: W("pengembangan", 29),
  schiaffino: W("pengembangan", 33),
  satuSatu: W("pengembangan", 35),
  masihCukup: W("pengembangan", 36),
  lalu: W("pengembangan", 40),
  m79: W("pengembangan", 41),
  ghiggia: W("pengembangan", 45),
  menembak: W("pengembangan", 46),
  tiang: W("pengembangan", 49),
  kiper: W("pengembangan", 51),
  menduga: W("pengembangan", 53),
  gol: W("pengembangan", 56),
  // penjelasan
  uruMenang: W("penjelasan", 0),
  juara2: W("penjelasan", 4),
  stadion: W("penjelasan", 9),
  hening: W("penjelasan", 12),
  ghiggiaQ: W("penjelasan", 13),
  hanya: W("penjelasan", 16),
  sinatra: W("penjelasan", 23),
  paus: W("penjelasan", 25),
  dirinya: W("penjelasan", 27),
  // payoff
  luka: W("payoff", 0),
  barbosa: W("payoff", 2),
  kambing: W("payoff", 4),
  hukuman: W("payoff", 8),
  tiga: W("payoff", 12),
  tapi: W("payoff", 16),
  lima: W("payoff", 19),
  baju: W("payoff", 22),
  dicap: W("payoff", 25),
  tahun: W("payoff", 28),
  koran: W("payoff", 31),
  lomba: W("payoff", 33),
  pemenang: W("payoff", 36),
  remaja: W("payoff", 37),
  pendukung: W("payoff", 41),
  dari: W("payoff", 43),
  kuning: W("payoff", 48),
  // outro
  audira: W("outro", 1),
  berikut: W("outro", 5),
  outroCard: TOTAL - 3.8,
};

/** Set (location) cuts, each hidden behind a venetian-blind wipe or smoke. */
export const CUT = {
  board: SEC.KONTEKS[0] - 0.05, // 5.947
  ticket: SEC.PENGEMBANGAN[0] + 0.0,
  clock: T.babak - 0.12,
  goal: T.lalu - 0.1,
  board2: SEC.PENJELASAN[0] - 0.02,
  silence: T.stadion - 0.15,
  room: SEC.PAYOFF[0] + 0.0,
  outro: SEC.OUTRO[0] - 0.05,
};
