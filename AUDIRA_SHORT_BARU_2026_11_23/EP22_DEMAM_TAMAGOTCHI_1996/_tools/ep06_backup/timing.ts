// EP06 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-23).
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
  piksel: W("hook", 5, "piksel"),
  nama: W("hook", 7, "nama"),
  dilarang: W("hook", 9, "dilarang"),
  audira: W("hook", 14, "Ini"),
  // konteks
  akhir: W("konteks", 0, "Akhir"),
  atari: W("konteks", 4, "Atari"),
  menghapus: W("konteks", 5, "menghapus"),
  kotaknya: W("konteks", 11, "kotaknya"),
  namaMereka: W("konteks", 12, "Nama"),
  alasannya: W("konteks", 17, "Alasannya"),
  dibajak: W("konteks", 22, "dibajak"),
  gajinya: W("konteks", 24, "Gajinya"),
  tanpa: W("konteks", 32, "tanpa"),
  // pengembangan
  salah: W("pengembangan", 0, "Salah"),
  warren: W("pengembangan", 2, "Warren"),
  hampir: W("pengembangan", 4, "Hampir"),
  adventure: W("pengembangan", 8, "Adventure"),
  diamDiam: W("pengembangan", 10, "Diam"),
  ruang: W("pengembangan", 14, "ruang"),
  tanpaMemberi: W("pengembangan", 18, "tanpa"),
  game: W("pengembangan", 23, "Game"),
  maret: W("pengembangan", 26, "Maret"),
  terjual: W("pengembangan", 33, "terjual"),
  sejuta: W("pengembangan", 36, "satu"),
  // penjelasan
  caranya: W("penjelasan", 0, "Caranya"),
  ambil: W("penjelasan", 2, "Ambil"),
  katakombe: W("penjelasan", 6, "katakombe"),
  ukurannya: W("penjelasan", 9, "Ukurannya"),
  bawa: W("penjelasan", 16, "Bawa"),
  kastilEmas: W("penjelasan", 22, "kastil"),
  dinding: W("penjelasan", 24, "Dindingnya"),
  ditembus: W("penjelasan", 26, "ditembus"),
  di: W("penjelasan", 27, "Di"),
  tulisan: W("penjelasan", 29, "tulisan"),
  dibuat: W("penjelasan", 32, "dibuat"),
  // payoff
  penemunya: W("payoff", 0, "Penemunya"),
  remaja: W("payoff", 1, "remaja"),
  salt: W("payoff", 6, "Salt"),
  menyurati: W("payoff", 11, "menyurati"),
  menghapusnya: W("payoff", 13, "Menghapusnya"),
  sepuluh: W("payoff", 16, "sepuluh"),
  jadi: W("payoff", 22, "Jadi"),
  steve: W("payoff", 23, "Steve"),
  membiarkan: W("payoff", 26, "membiarkannya"),
  easter: W("payoff", 29, "easter"),
  telur: W("payoff", 33, "telur"),
  atariKebijakan: W("payoff", 35, "Atari"),
  bukan: W("payoff", 39, "Bukan"),
  tapi: W("payoff", 44, "tapi"),
  istilah: W("payoff", 47, "istilah"),
  // outro
  kamu: W("outro", 0, "Kamu"),
  tulis: W("outro", 5, "Tulis"),
  ikuti: W("outro", 8, "Ikuti"),
};

/** The wall in the corridor breaks open (riser → impact). */
export const BREAK = T.ditembus - 0.15;
/** Payoff impact: the "EASTER EGG" stamp. */
export const EGG_STAMP = T.easter;

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B: T.akhir,
  C: T.salah,
  D: T.caranya,
  D2: T.di,
  E1: T.penemunya,
  E2: T.jadi,
  F: T.bukan,
  OUT: T.kamu,
};
export type SceneId = "A" | "B" | "C" | "D" | "D2" | "E1" | "E2" | "F" | "OUT";
export const sceneAt = (t: number): SceneId =>
  t < CUT.B ? "A"
  : t < CUT.C ? "B"
  : t < CUT.D ? "C"
  : t < CUT.D2 ? "D"
  : t < CUT.E1 ? "D2"
  : t < CUT.E2 ? "E1"
  : t < CUT.F ? "E2"
  : t < CUT.OUT ? "F"
  : "OUT";
/** Pixel-wipe direction per cut. D → D2 is a hard flash (the wall breaks), so no wipe there. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C, dir: "down" },
  { at: CUT.D, dir: "right" },
  { at: CUT.E1, dir: "up" },
  { at: CUT.E2, dir: "right" },
  { at: CUT.F, dir: "left" },
  { at: CUT.OUT, dir: "down" },
];
