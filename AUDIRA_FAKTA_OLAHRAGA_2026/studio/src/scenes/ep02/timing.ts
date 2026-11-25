// EP02 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-22).
// Map of cuts: EP02_MARATON_PALING_KACAU_1904/docs/TIMING.md.
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const VO_END: number = tl.voEnd;
/** AudiraOutro (Root.signed) covers the last 3.8 s. */
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
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const T = {
  // hook
  melambai: W("hook", 2, "melambai"),
  juaraHook: W("hook", 11, "juara"),
  olimpiade: W("hook", 13, "Olimpiade"),
  audira: W("hook", 14, "Ini"),
  // konteks
  stLouis: W("konteks", 0, "St"),
  tanggal: W("konteks", 2, "tiga"),
  pelari32: W("konteks", 9, "Tiga"),
  start: W("konteks", 13, "start"),
  sore: W("konteks", 15, "tiga"),
  suhu: W("konteks", 18, "suhu"),
  derajat: W("konteks", 20, "tiga"),
  km40: W("konteks", 24, "Empat"),
  bukit: W("konteks", 30, "tujuh"),
  air: W("konteks", 33, "air"),
  satuTitik: W("konteks", 37, "satu"),
  // pengembangan
  pelariItu: W("pengembangan", 0, "Pelari"),
  lorz: W("pengembangan", 3, "Fred"),
  kram: W("pengembangan", 5, "Kram"),
  mil9: W("pengembangan", 7, "mil"),
  menumpang: W("pengembangan", 10, "menumpang"),
  masuk: W("pengembangan", 13, "Ia"),
  disambut: W("pengembangan", 18, "disambut"),
  difoto: W("pengembangan", 22, "difoto"),
  roosevelt: W("pengembangan", 26, "Roosevelt"),
  bohong: W("pengembangan", 27, "Kebohongannya"),
  terbongkar: W("pengembangan", 29, "terbongkar"),
  larangan: W("pengembangan", 35, "larangan"),
  // penjelasan
  juaraAsli: W("penjelasan", 0, "Juara"),
  hicks: W("penjelasan", 2, "Thomas"),
  tumbang: W("penjelasan", 5, "tumbang"),
  strychnine: W("penjelasan", 8, "strychnine"),
  racun: W("penjelasan", 9, "racun"),
  telur: W("penjelasan", 12, "putih"),
  brandy: W("penjelasan", 15, "brandy"),
  halusinasi: W("penjelasan", 16, "Hicks"),
  dipapah: W("penjelasan", 24, "dipapah"),
  garis: W("penjelasan", 27, "garis"),
  waktu: W("penjelasan", 31, "tiga"),
  // payoff
  belakang: W("payoff", 0, "Di"),
  kuba: W("payoff", 2, "tukang"),
  carvajal: W("payoff", 6, "F"),
  apel: W("payoff", 8, "memetik"),
  kramPerut: W("payoff", 13, "kram"),
  keempat: W("payoff", 17, "finis"),
  afrika: W("payoff", 19, "Pelari"),
  taunyane: W("payoff", 22, "Len"),
  anjing: W("payoff", 24, "dikejar"),
  dari: W("payoff", 29, "Dari"),
  empatBelas: W("payoff", 37, "empat"),
  // outro
  danLorz: W("outro", 0, "Dan"),
  diringankan: W("outro", 3, "diringankan"),
  boston: W("outro", 10, "Boston"),
  berikutnya: W("outro", 12, "Berikutnya"),
  ikuti: W("outro", 19, "Ikuti"),
};

/** Payoff impact: the tape breaks for Hicks, then the pocket watch shows 3:28:53. */
export const IMPACT = T.waktu - 0.2;

export const CUT = {
  B1: T.stLouis,
  B2: T.km40,
  C1: T.pelariItu,
  C2: T.masuk,
  D1: T.juaraAsli,
  D2: T.halusinasi,
  Ea: T.belakang,
  Eb: T.afrika,
  Ec: T.dari,
  OUT: T.danLorz,
};
export type SceneId = "A" | "B1" | "B2" | "C1" | "C2" | "D1" | "D2" | "Ea" | "Eb" | "Ec" | "OUT";
const ORDER: [SceneId, number][] = [["B1", CUT.B1], ["B2", CUT.B2], ["C1", CUT.C1], ["C2", CUT.C2], ["D1", CUT.D1], ["D2", CUT.D2], ["Ea", CUT.Ea], ["Eb", CUT.Eb], ["Ec", CUT.Ec], ["OUT", CUT.OUT]];
export const sceneAt = (t: number): SceneId => {
  let s: SceneId = "A";
  for (const [id, at] of ORDER) if (t >= at) s = id;
  return s;
};
export const CUTS = ORDER.map(([, at]) => at);
