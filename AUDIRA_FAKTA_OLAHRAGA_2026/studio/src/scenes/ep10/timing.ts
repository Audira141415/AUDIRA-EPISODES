// EP10 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-24).
// Map of cuts: EP10_WILT_CHAMBERLAIN_100_POIN_1962/docs/TIMING.md.
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
  seratus: W("hook", 0, "100"),
  satuPemain: W("hook", 2, "Satu"),
  dan: W("hook", 6, "Dan"),
  rekaman: W("hook", 12, "rekaman"),
  ini: W("hook", 14, "Ini"),
  audira: W("hook", 15, "AUDIRA"),
  // konteks
  hershey: W("konteks", 0, "Hershey"),
  tanggal: W("konteks", 2, "2"),
  kota: W("konteks", 5, "Kota"),
  penonton: W("konteks", 10, "4.000"),
  philadelphia: W("konteks", 12, "Philadelphia"),
  tv: W("konteks", 18, "Tak"),
  wartawan: W("konteks", 22, "tak"),
  radio: W("konteks", 27, "Hanya"),
  // pengembangan
  wilt: W("pengembangan", 0, "Wilt"),
  tinggi: W("pengembangan", 3, "2,16"),
  kuarter: W("pengembangan", 5, "Kuarter"),
  q1: W("pengembangan", 7, "23"),
  minum: W("pengembangan", 9, "Turun"),
  ht: W("pengembangan", 11, "41"),
  setelah: W("pengembangan", 12, "Setelah"),
  q3: W("pengembangan", 15, "69"),
  tribun: W("pengembangan", 16, "Penonton"),
  give: W("pengembangan", 19, "Give"),
  kasih: W("pengembangan", 23, "Kasih"),
  // penjelasan
  anehnya: W("penjelasan", 0, "Anehnya"),
  karier: W("penjelasan", 6, "Sepanjang"),
  persen: W("penjelasan", 9, "51"),
  malam: W("penjelasan", 12, "Malam"),
  ft28: W("penjelasan", 14, "28"),
  ft32: W("penjelasan", 16, "32"),
  knicks: W("penjelasan", 20, "Knicks"),
  sengaja: W("penjelasan", 22, "sengaja"),
  warriors: W("penjelasan", 32, "Warriors"),
  ikut: W("penjelasan", 34, "ikut"),
  // payoff
  detik46: W("payoff", 0, "46"),
  umpan: W("payoff", 3, "Umpan"),
  joe: W("payoff", 4, "Joe"),
  wiltMasuk: W("payoff", 6, "Wilt"),
  poin100: W("payoff", 12, "100"),
  ruangGanti: W("payoff", 13, "Di"),
  humas: W("payoff", 16, "humas"),
  angka: W("payoff", 19, "angka"),
  foto: W("payoff", 24, "Foto"),
  rekamanRadio: W("payoff", 27, "rekaman"),
  diabadikan: W("payoff", 31, "diabadikan"),
  bukti: W("payoff", 35, "jadi"),
  // outro
  enam: W("outro", 0, "Enam"),
  rekor: W("outro", 5, "Rekor"),
  r83: W("outro", 8, "83"),
  bam: W("outro", 11, "Bam"),
  angka100: W("outro", 13, "Angka"),
  belum: W("outro", 15, "masih"),
  ikuti: W("outro", 18, "Ikuti"),
};

/** Payoff impact: the ball drops through the ring and the board flips to 100. */
export const IMPACT = T.poin100;

export const CUT = {
  B1: T.hershey,
  B2: T.philadelphia,
  C1: T.wilt,
  C2: T.tribun,
  D1: T.anehnya,
  D2: T.knicks,
  E1: T.detik46,
  E2: T.ruangGanti,
  E3: T.foto,
  OUT: T.enam,
};
export type SceneId = "A" | keyof typeof CUT;
const ORDER: [SceneId, number][] = (Object.keys(CUT) as (keyof typeof CUT)[]).map((k) => [k, CUT[k]]);
export const sceneAt = (t: number): SceneId => {
  let s: SceneId = "A";
  for (const [id, at] of ORDER) if (t >= at) s = id;
  return s;
};
export const CUTS = ORDER.map(([, at]) => at);
