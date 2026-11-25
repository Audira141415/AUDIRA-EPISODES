// EP03 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-22).
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
  delapan: W("hook", 3, "delapan"),
  menit: W("hook", 6, "menit"),
  papan: W("hook", 7, "Papan"),
  menyerah: W("hook", 10, "menyerah"),
  ini: W("hook", 11, "Ini"),
  audira: W("hook", 12, "AUDIRA"),
  // konteks
  wimbledon: W("konteks", 0, "Wimbledon"),
  juni: W("konteks", 1, "Juni"),
  lapangan: W("konteks", 5, "Lapangan"),
  john: W("konteks", 8, "John"),
  unggulan: W("konteks", 10, "unggulan"),
  melawan: W("konteks", 16, "melawan"),
  mahut: W("konteks", 18, "Mahut"),
  kualifikasi: W("konteks", 20, "kualifikasi"),
  saat: W("konteks", 23, "Saat"),
  tiebreak: W("konteks", 30, "tie-break"),
  pemenang: W("konteks", 31, "Pemenangnya"),
  // pengembangan
  hari1: W("pengembangan", 0, "Hari"),
  gelap1: W("pengembangan", 2, "gelap"),
  hari2: W("pengembangan", 5, "Hari"),
  tak: W("pengembangan", 11, "tak"),
  di47: W("pengembangan", 18, "Di"),
  sama47: W("pengembangan", 22, "sama"),
  papanSkor: W("pengembangan", 23, "papan"),
  macet: W("pengembangan", 29, "macet"),
  mati: W("pengembangan", 31, "mati"),
  program: W("pengembangan", 32, "Programnya"),
  di59: W("pengembangan", 37, "Di"),
  sama59: W("pengembangan", 41, "sama"),
  gelap2: W("pengembangan", 42, "gelap"),
  dihentikan: W("pengembangan", 44, "Dihentikan"),
  kedua: W("pengembangan", 47, "kedua"),
  // penjelasan
  kenapa: W("penjelasan", 0, "Kenapa"),
  servis: W("penjelasan", 3, "Servis"),
  isnerAce: W("penjelasan", 8, "Isner"),
  ace113: W("penjelasan", 10, "seratus"),
  mahut103: W("penjelasan", 14, "Mahut"),
  bahkan: W("penjelasan", 17, "Mahut"),
  poin: W("penjelasan", 22, "poin"),
  p502: W("penjelasan", 23, "lima"),
  p478: W("penjelasan", 27, "empat"),
  tapi: W("penjelasan", 32, "Tapi"),
  dihitung: W("penjelasan", 34, "dihitung"),
  bukan: W("penjelasan", 37, "bukan"),
  // payoff
  hari3: W("payoff", 0, "Hari"),
  match: W("payoff", 2, "match"),
  backhand: W("payoff", 5, "backhand"),
  tujuhPuluh: W("payoff", 8, "Tujuh"),
  sebelas: W("payoff", 13, "Sebelas"),
  g183: W("payoff", 17, "seratus"),
  babak: W("payoff", 22, "Di"),
  kalah: W("payoff", 26, "kalah"),
  m74: W("payoff", 29, "tujuh"),
  tanpa: W("payoff", 33, "tanpa"),
  delapanTahun: W("payoff", 37, "Delapan"),
  mengumumkan: W("payoff", 41, "mengumumkan"),
  // outro
  laga: W("outro", 0, "Laga"),
  terulang: W("outro", 7, "terulang"),
  berikutnya: W("outro", 8, "Berikutnya"),
  pit: W("outro", 11, "pit"),
  ikuti: W("outro", 19, "Ikuti"),
};

/** Payoff impact: the passing shot lands, score bug slams "70–68". */
export const IMPACT = T.tujuhPuluh - 0.12;

export const CUT = {
  S2: T.wimbledon - 0.25,
  S3: T.hari1 - 0.2,
  S4a: T.di47 - 0.15,
  S4b: T.di59 - 0.15,
  S5a: T.kenapa - 0.2,
  S5b: T.bahkan - 0.15,
  S6: T.hari3 - 0.2,
  S7: T.babak - 0.15,
  S8: T.laga - 0.25,
};
export type SceneId = "S1" | keyof typeof CUT;
const ORDER = Object.entries(CUT) as [SceneId, number][];
export const sceneAt = (t: number): SceneId => {
  let s: SceneId = "S1";
  for (const [id, at] of ORDER) if (t >= at) s = id;
  return s;
};
export const CUTS = ORDER.map(([, at]) => at);
