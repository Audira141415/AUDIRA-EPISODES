// EP12 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-24).
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

// ---- beats (VO seconds)
export const T = {
  // hook
  belakang: W("hook", 2, "belakang"),
  lalu: W("hook", 3, "lalu"),
  jatuh: W("hook", 6, "jatuh"),
  dia: W("hook", 8, "dia"),
  juara: W("hook", 10, "juara"),
  // konteks
  steven: W("konteks", 1, "steven"),
  bradbury: W("konteks", 2, "bradbury"),
  dibayar: W("konteks", 12, "dibayar"),
  mahal: W("konteks", 14, "mahal"),
  montreal: W("konteks", 19, "montreal"),
  pisau: W("konteks", 20, "pisau"),
  menembus: W("konteks", 23, "menembus"),
  liter: W("konteks", 28, "4"),
  jahitan: W("konteks", 33, "111"),
  tahun2000: W("konteks", 36, "2000"),
  kepala: W("konteks", 39, "kepala"),
  hantam: W("konteks", 41, "pembatas"),
  tulang: W("konteks", 42, "Dua"),
  patah: W("konteks", 45, "patah"),
  dokter: W("konteks", 46, "dokter"),
  tidak: W("konteks", 49, "tidak"),
  es: W("konteks", 53, "es"),
  // pengembangan
  februari: W("pengembangan", 2, "februari"),
  salt: W("pengembangan", 7, "salt"),
  ketiga: W("pengembangan", 16, "ketiga"),
  tersingkir: W("pengembangan", 18, "tersingkir"),
  tapiDq: W("pengembangan", 19, "Tapi"),
  dq: W("pengembangan", 22, "didisk"),
  lolos: W("pengembangan", 25, "lolos"),
  // penjelasan
  kalah: W("penjelasan", 2, "kalah"),
  pelatih: W("penjelasan", 6, "pelatih"),
  strategi: W("penjelasan", 10, "strategi"),
  tetap: W("penjelasan", 11, "tetap"),
  hindari: W("penjelasan", 14, "hindari"),
  tunggu: W("penjelasan", 17, "tunggu"),
  lawanSemi: W("penjelasan", 20, "lawan"),
  jatuhSemi: W("penjelasan", 23, "jatuh"),
  lolosLagi: W("penjelasan", 25, "lolos"),
  // payoff
  lima: W("payoff", 1, "lima"),
  tertinggal: W("payoff", 4, "tertinggal"),
  meter15: W("payoff", 6, "15"),
  tikungan: W("payoff", 9, "tikungan"),
  ohno: W("payoff", 11, "ohno"),
  li: W("payoff", 13, "li"),
  senggol: W("payoff", 14, "bersenggolan"),
  keempat: W("payoff", 16, "keempat"),
  seret: W("payoff", 18, "terseret"),
  jatuhFinal: W("payoff", 19, "jatuh"),
  pembatas: W("payoff", 21, "pembatas"),
  meluncur: W("payoff", 23, "meluncur"),
  garis: W("payoff", 26, "garis"),
  pertama: W("payoff", 31, "pertama"),
  australia: W("payoff", 33, "australia"),
  selatan: W("payoff", 38, "selatan"),
  // outro
  setengah: W("outro", 6, "setengah"),
  menit: W("outro", 7, "menit"),
  sepuluh: W("outro", 11, "sepuluh"),
  kerja: W("outro", 13, "kerja"),
  beruntung: W("outro", 18, "beruntung"),
  pantas: W("outro", 20, "pantas"),
  tulis: W("outro", 21, "tulis"),
  ikuti: W("outro", 24, "ikuti"),
};

// ---- scenes: cut = first word of the next beat
export const CUT = {
  B: W("konteks", 0, "Namanya"),
  C1: W("konteks", 15, "Dalam"),
  C2: W("konteks", 26, "Ia"),
  D1: W("konteks", 35, "Tahun"),
  D2: W("konteks", 42, "Dua"),
  E: W("pengembangan", 0, "Tapi"),
  F: W("pengembangan", 10, "Di"),
  G: W("penjelasan", 0, "Ia"),
  H: W("penjelasan", 18, "Di"),
  I1: W("payoff", 0, "Final"),
  I2: W("payoff", 8, "Di"),
  I3: W("payoff", 22, "Bradbury"),
  J: W("payoff", 27, "Emas"),
  K: W("outro", 0, "Katanya"),
  L: W("outro", 16, "Jadi"),
};
export type SceneId = "A" | "B" | "C1" | "C2" | "D1" | "D2" | "E" | "F" | "G" | "H" | "I1" | "I2" | "I3" | "J" | "K" | "L";
export const ORDER: SceneId[] = ["A", "B", "C1", "C2", "D1", "D2", "E", "F", "G", "H", "I1", "I2", "I3", "J", "K", "L"];
export const sceneAt = (t: number): SceneId => ORDER.reduce<SceneId>((a, s) => (s !== "A" && t >= CUT[s] ? s : a), "A");
export const WIPES: { at: number; dir: "down" | "right" | "left" | "up" }[] = [
  { at: CUT.B, dir: "right" },
  { at: CUT.C1, dir: "right" },
  { at: CUT.C2, dir: "down" },
  { at: CUT.D1, dir: "right" },
  { at: CUT.D2, dir: "left" },
  { at: CUT.E, dir: "up" },
  { at: CUT.F, dir: "right" },
  { at: CUT.G, dir: "left" },
  { at: CUT.H, dir: "right" },
  { at: CUT.I1, dir: "right" },
  { at: CUT.I2, dir: "right" },
  { at: CUT.I3, dir: "right" },
  { at: CUT.J, dir: "up" },
  { at: CUT.K, dir: "down" },
  { at: CUT.L, dir: "left" },
];
