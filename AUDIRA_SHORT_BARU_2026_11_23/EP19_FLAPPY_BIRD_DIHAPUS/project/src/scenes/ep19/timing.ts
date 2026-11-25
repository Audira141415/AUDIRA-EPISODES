// EP19 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-23).
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
  usd: W("hook", 3, "US$50"),
  lalu: W("hook", 5, "Lalu"),
  hapus: W("hook", 9, "menghapus"),
  audira: W("hook", 10, "Ini"),
  // konteks
  namanya: W("konteks", 0, "Namanya"),
  flappy: W("konteks", 1, "Flappy"),
  dong: W("konteks", 4, "Dong"),
  hanoi: W("konteks", 8, "Hanoi"),
  gears: W("konteks", 13, ".Gears"),
  beberapa: W("konteks", 18, "beberapa"),
  rilis: W("konteks", 22, "rilis"),
  mei: W("konteks", 26, "24"),
  sepi: W("konteks", 30, "sepi"),
  // pengembangan
  januari: W("pengembangan", 0, "Januari"),
  meledak: W("pengembangan", 3, "meledak"),
  nomor: W("pengembangan", 9, "nomor"),
  amerika: W("pengembangan", 12, "Amerika"),
  tiongkok: W("pengembangan", 13, "Tiongkok"),
  inggris: W("pengembangan", 15, "Inggris"),
  aturannya: W("pengembangan", 16, "Aturannya"),
  ketuk: W("pengembangan", 18, "Ketuk"),
  lewati: W("pengembangan", 22, "Lewati"),
  dapat: W("pengembangan", 25, "dapat"),
  sepuluh: W("pengembangan", 28, "Sepuluh"),
  medali: W("pengembangan", 30, "medali"),
  empat: W("pengembangan", 32, "Empat"),
  platinum: W("pengembangan", 34, "platinum"),
  // penjelasan
  kepada: W("penjelasan", 0, "Kepada"),
  usdHari: W("penjelasan", 11, "US$50"),
  tapi: W("penjelasan", 14, "Tapi"),
  feb: W("penjelasan", 18, "8"),
  twitter: W("penjelasan", 23, "Twitter"),
  duaDua: W("penjelasan", 24, "22"),
  akuTidak: W("penjelasan", 32, "Aku"),
  katanya: W("penjelasan", 36, "Katanya"),
  bukan: W("penjelasan", 38, "bukan"),
  // payoff
  keesokan: W("payoff", 0, "Keesokan"),
  hilang: W("payoff", 5, "hilang"),
  forbes: W("payoff", 13, "Forbes"),
  dibuat: W("payoff", 18, "dibuat"),
  tapiMalah: W("payoff", 25, "tapi"),
  adiktif: W("payoff", 30, "adiktif"),
  masalah: W("payoff", 34, "masalah"),
  sementara: W("payoff", 35, "Sementara"),
  hp: W("payoff", 37, "HP"),
  ebay: W("payoff", 43, "eBay"),
  ditawar: W("payoff", 46, "ditawar"),
  usd90: W("payoff", 49, "US$90"),
  turun: W("payoff", 52, "menurunkan"),
  // outro
  lima: W("outro", 0, "Lima"),
  dilepas: W("outro", 5, "dilepas"),
  kalau: W("outro", 10, "Kalau"),
  hapusQ: W("outro", 13, "hapus"),
  ikuti: W("outro", 18, "ikuti"),
};

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B: T.namanya,
  C1: T.januari,
  C2: T.aturannya,
  D1: T.kepada,
  D2: T.feb,
  E1: T.keesokan,
  E2: T.sementara,
  OUT: T.lima,
};
export type SceneId = "A" | "B" | "C1" | "C2" | "D1" | "D2" | "E1" | "E2" | "OUT";
export const sceneAt = (t: number): SceneId =>
  t < CUT.B ? "A"
  : t < CUT.C1 ? "B"
  : t < CUT.C2 ? "C1"
  : t < CUT.D1 ? "C2"
  : t < CUT.D2 ? "D1"
  : t < CUT.E1 ? "D2"
  : t < CUT.E2 ? "E1"
  : t < CUT.OUT ? "E2"
  : "OUT";
/** Pixel-wipe direction per cut: the bird's flight (left → right) carries every cut. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C1, dir: "up" },
  { at: CUT.C2, dir: "right" },
  { at: CUT.D1, dir: "down" },
  { at: CUT.D2, dir: "right" },
  { at: CUT.E1, dir: "right" },
  { at: CUT.E2, dir: "up" },
  { at: CUT.OUT, dir: "down" },
];
