// EP01 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-22).
// Map of cuts: EP01_SUSI_SUSANTI_EMAS_PERTAMA_1992/docs/TIMING.md.
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
  limaSebelasHook: W("hook", 1, "lima"),
  final: W("hook", 5, "final"),
  umur: W("hook", 9, "dua"),
  emasPertama: W("hook", 16, "emas"),
  audira: W("hook", 19, "Ini"),
  // konteks
  barcelona: W("konteks", 0, "Barcelona"),
  buluTangkis: W("konteks", 6, "Bulu"),
  resmi: W("konteks", 14, "resmi"),
  indonesia: W("konteks", 16, "Indonesia"),
  sejak: W("konteks", 19, "sejak"),
  empatPuluh: W("konteks", 25, "empat"),
  tanpaEmas: W("konteks", 28, "tanpa"),
  susi: W("konteks", 32, "Susi"),
  instruksi: W("konteks", 35, "instruksi"),
  pulangBawa: W("konteks", 39, "pulang"),
  malam: W("konteks", 42, "Malam"),
  takBisa: W("konteks", 45, "ia"),
  // pengembangan
  unggulan1: W("pengembangan", 1, "unggulan"),
  tanpaGim: W("pengembangan", 6, "tanpa"),
  agustus: W("pengembangan", 11, "Empat"),
  bang: W("pengembangan", 14, "Bang"),
  unggulan4: W("pengembangan", 19, "unggulan"),
  semifinal: W("pengembangan", 23, "semifinal"),
  lalu: W("pengembangan", 27, "Lalu"),
  kalah: W("pengembangan", 33, "kalah"),
  limaSebelas: W("pengembangan", 34, "lima"),
  // penjelasan
  satuGim: W("penjelasan", 0, "Satu"),
  lepas: W("penjelasan", 6, "lepas"),
  tapi: W("penjelasan", 7, "Tapi"),
  bangkit: W("penjelasan", 9, "bangkit"),
  gim2: W("penjelasan", 10, "Gim"),
  sebelasLima: W("penjelasan", 14, "sebelas"),
  gim3: W("penjelasan", 15, "Gim"),
  sebelasTiga: W("penjelasan", 17, "sebelas"),
  karena: W("penjelasan", 18, "Karena"),
  emasnya: W("penjelasan", 25, "emasnya"),
  dunia: W("penjelasan", 32, "pertama"),
  // payoff
  podium: W("payoff", 0, "Di"),
  raya: W("payoff", 2, "Indonesia"),
  menangis: W("payoff", 7, "menangis"),
  hari: W("payoff", 8, "Hari"),
  alan: W("payoff", 12, "Alan"),
  duaEmas: W("payoff", 17, "Dua"),
  pulang: W("payoff", 21, "Pulang"),
  mobil: W("payoff", 27, "mobil"),
  sejuta: W("payoff", 30, "hingga"),
  menikah: W("payoff", 34, "Lima"),
  // outro
  kalahAwal: W("outro", 0, "Kalah"),
  berikutnya: W("outro", 6, "Berikutnya"),
  maraton: W("outro", 9, "maraton"),
  ikuti: W("outro", 19, "Ikuti"),
};

/** Moment the third game's last point lands (impact, payoff). */
export const MATCH_POINT = T.sebelasTiga;
/** Hook smash: the hero swings just before "Ini AUDIRA". */
export const SMASH = T.audira - 0.25;

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B: T.barcelona,
  C: W("pengembangan", 0, "Susi"),
  D: T.satuGim,
  E1: T.podium,
  E2: T.hari,
  F: T.pulang,
  OUT: T.kalahAwal,
};
export type SceneId = "A" | "B" | "C" | "D" | "E1" | "E2" | "F" | "OUT";
export const sceneAt = (t: number): SceneId =>
  t < CUT.B ? "A"
  : t < CUT.C ? "B"
  : t < CUT.D ? "C"
  : t < CUT.E1 ? "D"
  : t < CUT.E2 ? "E1"
  : t < CUT.F ? "E2"
  : t < CUT.OUT ? "F"
  : "OUT";
/** Pixel-wipe direction per cut: the shuttle's exit vector of one scene is the entry vector of the next. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C, dir: "right" },
  { at: CUT.D, dir: "right" },
  { at: CUT.E1, dir: "up" },
  { at: CUT.E2, dir: "right" },
  { at: CUT.F, dir: "right" },
  { at: CUT.OUT, dir: "down" },
];
