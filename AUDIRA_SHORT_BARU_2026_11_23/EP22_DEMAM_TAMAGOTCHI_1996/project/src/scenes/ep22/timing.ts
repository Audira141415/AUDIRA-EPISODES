// EP22 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-23).
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
  jutaan: W("hook", 6, "jutaan"),
  menangis: W("hook", 8, "menangis"),
  piksel: W("hook", 16, "piksel"),
  ini: W("hook", 17, "Ini"),
  // konteks
  dua: W("konteks", 0, "Dua"),
  bandai: W("konteks", 10, "Bandai"),
  tamagotchi: W("konteks", 12, "Tamagotchi"),
  telur: W("konteks", 13, "telur"),
  gantungan: W("konteks", 16, "gantungan"),
  pencipta: W("konteks", 18, "Penciptanya"),
  aki: W("konteks", 19, "Aki"),
  akihiro: W("konteks", 22, "Akihiro"),
  namanya: W("konteks", 24, "Namanya"),
  tamago: W("konteks", 26, "tamago"),
  watch: W("konteks", 29, "watch"),
  jam: W("konteks", 30, "jam"),
  // pengembangan
  telurnya: W("pengembangan", 0, "Telurnya"),
  menetas: W("pengembangan", 1, "menetas"),
  dengan: W("pengembangan", 5, "Dengan"),
  tiga: W("pengembangan", 6, "tiga"),
  makan: W("pengembangan", 11, "makan"),
  bersihkan: W("pengembangan", 12, "membersihkan"),
  obati: W("pengembangan", 15, "mengobatinya"),
  telantarkan: W("pengembangan", 18, "Telantarkan"),
  kurang: W("pengembangan", 19, "kurang"),
  mati: W("pengembangan", 25, "mati"),
  versiJ: W("pengembangan", 26, "Versi"),
  hantu: W("pengembangan", 29, "hantu"),
  versiI: W("pengembangan", 33, "Versi"),
  malaikat: W("pengembangan", 37, "malaikat"),
  // penjelasan
  lalu: W("penjelasan", 0, "Lalu"),
  sekitar: W("penjelasan", 4, "Sekitar"),
  anak: W("penjelasan", 13, "Anak"),
  bunyi: W("penjelasan", 17, "bunyi"),
  melarang: W("penjelasan", 25, "melarang"),
  ada: W("penjelasan", 26, "Ada"),
  pemakaman: W("penjelasan", 32, "pemakaman"),
  bandaiPun: W("penjelasan", 34, "Bandai"),
  tombol: W("penjelasan", 37, "tombol"),
  fitur: W("penjelasan", 39, "lalu"),
  // payoff
  tahun: W("payoff", 0, "Tahun"),
  meraih: W("payoff", 7, "penciptanya"),
  ig: W("payoff", 9, "Ig"),
  karena: W("payoff", 12, "karena"),
  setahun: W("payoff", 21, "Setahun"),
  rugi: W("payoff", 27, "rugi"),
  tapi: W("payoff", 31, "Tapi"),
  efek: W("payoff", 35, "efek"),
  bukti: W("payoff", 37, "Bukti"),
  kini: W("payoff", 44, "Kini"),
  // outro
  kamu: W("outro", 0, "Kamu"),
  ceritakan: W("outro", 4, "Ceritakan"),
  ikuti: W("outro", 7, "Ikuti"),
};

// ---------------------------------------------------------------- scenes (cuts = first word of the next beat)
export const CUT = {
  B: T.dua,
  C: T.telurnya,
  D: T.lalu,
  D2: T.ada,
  E1: T.tahun,
  E2: T.setahun,
  F: T.tapi,
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
/** Pixel-wipe direction per cut. */
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C, dir: "down" },
  { at: CUT.D, dir: "right" },
  { at: CUT.D2, dir: "up" },
  { at: CUT.E1, dir: "right" },
  { at: CUT.E2, dir: "left" },
  { at: CUT.F, dir: "right" },
  { at: CUT.OUT, dir: "down" },
];
/** White flashes: the pet dies, the Ig Nobel stamp, the payoff impact. */
export const FLASHES = [T.mati, T.ig, T.efek];
