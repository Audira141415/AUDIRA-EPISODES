// EP45 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-22).
// Map of cuts: EP45_DENMARK_JUARA_TANPA_LOLOS_1992/docs/TIMING.md.
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
  piala: W("hook", 6, "Piala"),
  juara: W("hook", 11, "juara"),
  audira: W("hook", 12, "Ini"),
  // konteks
  tahun: W("konteks", 0, "Tahun"),
  yugo: W("konteks", 6, "Yugoslavia"),
  dicoret: W("konteks", 11, "dicoret"),
  pbb: W("konteks", 14, "PBB"),
  pengganti: W("konteks", 17, "Penggantinya"),
  denmark: W("konteks", 18, "Denmark"),
  runnerUp: W("konteks", 19, "runner"),
  kabar: W("konteks", 24, "Kabar"),
  mei31: W("konteks", 27, "tiga"),
  hari10: W("konteks", 32, "sepuluh"),
  turnamen: W("konteks", 35, "turnamen"),
  swedia: W("konteks", 41, "Swedia"),
  // pengembangan
  pelatih: W("pengembangan", 0, "Pelatih"),
  nielsen: W("pengembangan", 1, "Richard"),
  laga: W("pengembangan", 7, "Laga"),
  nolnol: W("pengembangan", 10, "nol-nol"),
  lalu: W("pengembangan", 13, "Lalu"),
  nolsatu: W("pengembangan", 15, "nol-satu"),
  kesempatan: W("pengembangan", 20, "Kesempatan"),
  prancis: W("pengembangan", 26, "Prancis"),
  duasatu: W("pengembangan", 29, "dua-satu"),
  lolos: W("pengembangan", 31, "lolos"),
  // penjelasan
  semifinal: W("penjelasan", 0, "Di"),
  belanda: W("penjelasan", 2, "Belanda"),
  duadua: W("penjelasan", 5, "dua-dua"),
  perpanjangan: W("penjelasan", 7, "perpanjangan"),
  adu: W("penjelasan", 10, "Adu"),
  satu: W("penjelasan", 12, "Satu"),
  kiper: W("penjelasan", 18, "Kiper"),
  schmeichel: W("penjelasan", 20, "Schmeichel"),
  menepis: W("penjelasan", 21, "menepis"),
  vanBasten: W("penjelasan", 23, "Marco"),
  limaempat: W("penjelasan", 29, "lima-empat"),
  // payoff
  final: W("payoff", 0, "Final"),
  juni26: W("payoff", 1, "dua"),
  goteborg: W("payoff", 6, "G"),
  penonton: W("payoff", 9, "tiga"),
  jerman: W("payoff", 17, "Jerman"),
  menit18: W("payoff", 18, "Menit"),
  jensen: W("payoff", 21, "John"),
  menit78: W("payoff", 25, "Menit"),
  vilfort: W("payoff", 29, "Kim"),
  putri: W("payoff", 31, "yang"),
  mengunci: W("payoff", 39, "mengunci"),
  duanol: W("payoff", 40, "dua-nol"),
  timYang: W("payoff", 41, "Tim"),
  juaraEropa: W("payoff", 47, "juara"),
  // outro
  kadang: W("outro", 0, "Kadang"),
  siap: W("outro", 5, "Siap"),
  menurutmu: W("outro", 9, "Menurutmu"),
  tulis: W("outro", 19, "Tulis"),
  ikuti: W("outro", 23, "ikuti"),
};

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B1: T.tahun,
  B2: T.kabar,
  C1: T.pelatih,
  C2: T.lalu,
  C3: T.prancis - 0.35, // level 3 opens just before "Prancis"
  D: T.semifinal - 0.19,
  E1: T.final,
  E2: T.menit18,
  E3: T.timYang,
  OUT: T.kadang,
};
export type SceneId = "A" | "B1" | "B2" | "C1" | "C2" | "C3" | "D" | "E1" | "E2" | "E3" | "OUT";
export const sceneAt = (t: number): SceneId =>
  t < CUT.B1 ? "A"
  : t < CUT.B2 ? "B1"
  : t < CUT.C1 ? "B2"
  : t < CUT.C2 ? "C1"
  : t < CUT.C3 ? "C2"
  : t < CUT.D ? "C3"
  : t < CUT.E1 ? "D"
  : t < CUT.E2 ? "E1"
  : t < CUT.E3 ? "E2"
  : t < CUT.OUT ? "E3"
  : "OUT";
/** Pixel-wipe direction per cut: the exit vector of one scene is the entry vector of the next. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B1, dir: "down" },
  { at: CUT.B2, dir: "right" },
  { at: CUT.C1, dir: "right" },
  { at: CUT.C2, dir: "right" },
  { at: CUT.C3, dir: "right" },
  { at: CUT.D, dir: "up" },
  { at: CUT.E1, dir: "down" },
  { at: CUT.E2, dir: "right" },
  { at: CUT.E3, dir: "up" },
];
