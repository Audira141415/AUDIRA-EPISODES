// EP08 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-24).
// Map of cuts: EP08_OWI_BUTET_EMAS_17_AGUSTUS_2016/docs/STORYBOARD.md.
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const VO_END: number = tl.voEnd;
/** AudiraOutro (Root.tsx) covers the last 3.8 s of the composition. */
export const OUTRO_AT = TOTAL - 3.8;

/** Start (s) of word i in clip id; `expect` guards against index drift (prefix, case-insensitive). */
export const W = (id: string, i: number, expect: string) => {
  const w = CLIPS.find((c) => c.id === id)!.words[i];
  if (!w || !w.w.toLowerCase().startsWith(expect.toLowerCase())) throw new Error(`timing drift: ${id}[${i}] = ${w?.w} (expected ${expect})`);
  return w.s;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
/** 0→1 between a and b, smoothstep. */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** 0→1 over [a, a+fi], 1→0 over [b-fo, b]. */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Pop-in scale: 0 → 1.08 → 1 over 0.28 s from a. */
export const pop = (t: number, a: number) => {
  const k = clamp((t - a) / 0.28);
  if (k <= 0) return 0;
  return k < 0.6 ? (k / 0.6) * 1.08 : 1.08 - ((k - 0.6) / 0.4) * 0.08;
};

// ---------------------------------------------------------------- beats (VO seconds)
export const T = {
  // hook
  pukul: W("hook", 7, "pukul"),
  wib: W("hook", 14, "WIB"),
  tigaMenit: W("hook", 15, "Tiga"),
  indonesia: W("hook", 21, "Indonesia"),
  emas: W("hook", 23, "emas"),
  audira: W("hook", 25, "Ini"),
  // konteks
  sejak: W("konteks", 0, "Sejak"),
  selalu: W("konteks", 8, "selalu"),
  tradisi: W("konteks", 12, "Tradisi"),
  london: W("konteks", 16, "London"),
  owi: W("konteks", 21, "Owi"),
  gagal: W("konteks", 24, "gagal"),
  lalu: W("konteks", 27, "lalu"),
  // pengembangan
  rio: W("pengembangan", 4, "Rio"),
  takGim: W("pengembangan", 6, "tak"),
  semifinal: W("pengembangan", 12, "semifinal"),
  unggulan: W("pengembangan", 13, "unggulan"),
  zhang: W("pengembangan", 18, "Zhang"),
  disingkirkan: W("pengembangan", 25, "disingkirkan"),
  pagi: W("pengembangan", 29, "Pagi"),
  upacara: W("pengembangan", 33, "upacara"),
  doa: W("pengembangan", 37, "doa"),
  // penjelasan
  final: W("penjelasan", 0, "Final"),
  chan: W("penjelasan", 2, "Chan"),
  sekali: W("penjelasan", 11, "yang"),
  butet: W("penjelasan", 18, "Butet"),
  owiBelakang: W("penjelasan", 22, "Owi"),
  tujuhDua: W("penjelasan", 26, "Tujuh"),
  sebelasEmpat: W("penjelasan", 27, "sebelas"),
  gim1: W("penjelasan", 28, "gim"),
  empatBelas: W("penjelasan", 33, "belas"),
  gim2: W("penjelasan", 34, "Gim"),
  mengejar: W("penjelasan", 36, "Malaysia"),
  sepuluh: W("penjelasan", 39, "sepuluh"),
  // payoff
  melaju: W("payoff", 0, "Lalu"),
  duaSatu: W("payoff", 7, "satu"),
  menit: W("payoff", 11, "menit"),
  empatLima: W("payoff", 15, "Empat"),
  proklamasi: W("payoff", 19, "proklamasi"),
  emasGanda: W("payoff", 20, "Emas"),
  satuSatunya: W("payoff", 24, "satu"),
  ketujuh: W("payoff", 29, "emas"),
  kata: W("payoff", 37, "Kata"),
  hadiah: W("payoff", 40, "hadiah"),
  // outro
  perempuan: W("outro", 0, "Butet"),
  susy: W("outro", 8, "setelah"),
  berikutnya: W("outro", 11, "Berikutnya"),
  ikuti: W("outro", 26, "Ikuti"),
};

/** 21-12: the last point lands on "satu-dua belas". */
export const MATCH_POINT = T.duaSatu + 0.1;
/** Hook smash: Owi swings just before "Ini AUDIRA". */
export const SMASH = T.audira - 0.25;

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B: T.sejak,
  C: W("pengembangan", 0, "Empat"),
  C2: T.pagi,
  D: T.final,
  E1: T.melaju,
  E2: T.emasGanda,
  OUT: T.perempuan,
};
export type SceneId = "A" | "B" | "C" | "C2" | "D" | "E1" | "E2" | "OUT";
export const sceneAt = (t: number): SceneId =>
  t < CUT.B ? "A"
  : t < CUT.C ? "B"
  : t < CUT.C2 ? "C"
  : t < CUT.D ? "C2"
  : t < CUT.E1 ? "D"
  : t < CUT.E2 ? "E1"
  : t < CUT.OUT ? "E2"
  : "OUT";
/** Pixel-wipe direction per cut: the shuttle's exit vector of one scene is the entry vector of the next. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C, dir: "right" },
  { at: CUT.C2, dir: "up" },
  { at: CUT.D, dir: "right" },
  { at: CUT.E1, dir: "left" },
  { at: CUT.E2, dir: "up" },
  { at: CUT.OUT, dir: "down" },
];
