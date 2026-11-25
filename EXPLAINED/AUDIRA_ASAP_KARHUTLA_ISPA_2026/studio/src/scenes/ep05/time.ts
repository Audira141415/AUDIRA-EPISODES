// EP05 timing: every beat is anchored to a word of the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

export const CLIPS = TL.clips as Clip[];
export const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
export const TOTAL: number = TL.total;
export const OUTRO_CARD = SEC.OUTRO[1] + 0.2;

const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;

export const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const backOut = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  const k = 1.70158;
  return 1 + (k + 1) * Math.pow(c - 1, 3) + k * Math.pow(c - 1, 2);
};

export const T = {
  // HOOK
  n56: W("hook", 0),
  padahal: W("hook", 5),
  bukan: W("hook", 8),
  // KONTEKS
  bmkg: W("konteks", 0),
  sumsel: W("konteks", 5),
  jambi: W("konteks", 7),
  bengkulu: W("konteks", 9),
  terbawa: W("konteks", 10),
  baratLaut: W("konteks", 13),
  pada18: W("konteks", 15),
  riau: W("konteks", 19),
  nol: W("konteks", 20),
  tapi: W("konteks", 23),
  dinkes: W("konteks", 27),
  n14: W("konteks", 31),
  // PENGEMBANGAN
  bergerak: W("pengembangan", 0),
  batam: W("pengembangan", 3),
  ispu: W("pengembangan", 6),
  n240: W("pengembangan", 7),
  sangat: W("pengembangan", 8),
  lalu: W("pengembangan", 11),
  sumatra: W("pengembangan", 14),
  kalimantan: W("pengembangan", 16),
  menyeberang: W("pengembangan", 17),
  malaysia: W("pengembangan", 19),
  sekolah: W("pengembangan", 20),
  johor: W("pengembangan", 22),
  kasus: W("pengembangan", 25),
  naik: W("pengembangan", 29),
  sepuluh: W("pengembangan", 31),
  kepada: W("pengembangan", 35),
  nor: W("pengembangan", 37),
  sulit: W("pengembangan", 45),
  // PENJELASAN
  indonesia: W("penjelasan", 0),
  perjanjian: W("penjelasan", 2),
  ratifikasi: W("penjelasan", 9),
  y2014: W("penjelasan", 11),
  myBawa: W("penjelasan", 12),
  menteri: W("penjelasan", 18),
  kemlu: W("penjelasan", 23),
  komit: W("penjelasan", 27),
  diTengah: W("penjelasan", 29),
  pejabat: W("penjelasan", 33),
  oksigen: W("penjelasan", 37),
  sindiran: W("penjelasan", 41),
  // PAYOFF
  dalamNegeri: W("payoff", 0),
  bareskrim: W("payoff", 3),
  n20: W("payoff", 5),
  tersangka: W("payoff", 7),
  empat: W("payoff", 8),
  sg: W("payoff", 14),
  my: W("payoff", 15),
  kor: W("payoff", 17),
  nama: W("payoff", 19),
  dibuka: W("payoff", 22),
  walhi: W("payoff", 23),
  isu: W("payoff", 25),
  lepas: W("payoff", 31),
  // OUTRO
  asapO: W("outro", 0),
  batasO: W("outro", 3),
  pantau: W("outro", 5),
  masker: W("outro", 9),
  ini: W("outro", 10),
};
