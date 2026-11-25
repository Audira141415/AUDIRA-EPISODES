// EP09 film timing: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** Start time of the nth occurrence (0-based) of `word` in clip `id`. Throws if missing (catches script drift). */
export const at = (id: string, word: string, nth = 0) => {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) throw new Error(`EP09 timing: no clip ${id}`);
  const hits = c.words.filter((x) => norm(x.w) === norm(word));
  if (!hits[nth]) throw new Error(`EP09 timing: no "${word}"#${nth} in ${id}`);
  return hits[nth].s;
};
export const endOf = (id: string, word: string, nth = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  return c.words.filter((x) => norm(x.w) === norm(word))[nth].e;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 -> 1 between a and b (smoothstep). */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** Linear 0 -> 1. */
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.32) => {
  const x = clamp01((t - a) / dur);
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// ---- beats (seconds) ----
export const T = {
  // hook
  empat: at("hook", "empat"),
  curang: at("hook", "curang"),
  terindah: at("hook", "satu", 1),
  hookEnd: SEC.HOOK[1],
  // konteks
  tanggal: at("konteks", "dua"),
  perempat: at("konteks", "perempat"),
  stadion: at("konteks", "stadion"),
  argentina: at("konteks", "argentina"),
  empatTahun: at("konteks", "empat"),
  falklands: at("konteks", "kepulauan"),
  malvinas: at("konteks", "malvinas"),
  perang: at("konteks", "perang"),
  // pengembangan
  babak: at("pengembangan", "babak"),
  menit51: at("pengembangan", "menit"),
  salah: at("pengembangan", "salah"),
  melambung: at("pengembangan", "melambung"),
  shilton: at("pengembangan", "peter"),
  maradona: at("pengembangan", "maradona"),
  pendek: at("pengembangan", "lebih"),
  melompat: at("pengembangan", "melompat"),
  kepalan: at("pengembangan", "kepalan"),
  gol1: at("pengembangan", "gol"),
  wasit: at("pengembangan", "wasit"),
  sah: at("pengembangan", "mengesahkannya"),
  hakim: at("pengembangan", "hakim"),
  diam: at("pengembangan", "diam"),
  belum: at("pengembangan", "belum"),
  varW: at("pengembangan", "var"),
  // penjelasan
  kemudian: at("penjelasan", "empat"),
  menit55: at("penjelasan", "menit", 1),
  menerima: at("penjelasan", "maradona"),
  sekitar: at("penjelasan", "sekitar"),
  sepuluh: at("penjelasan", "sepuluh"),
  melewati: at("penjelasan", "melewati"),
  termasuk: at("penjelasan", "termasuk"),
  gol2: at("penjelasan", "mencetak"),
  lineker: at("penjelasan", "lineker"),
  m81: at("penjelasan", "delapan"),
  menang21: at("penjelasan", "argentina"),
  // payoff
  usai: at("payoff", "usai"),
  kepala: at("payoff", "sedikit"),
  tuhan: at("payoff", "sedikit", 1),
  y2005: at("payoff", "baru"),
  mengaku: at("payoff", "mengaku"),
  abad: at("payoff", "keduanya"),
  polling: at("payoff", "polling"),
  golAbad: at("payoff", "abad"),
  seminggu: at("payoff", "seminggu"),
  juara: at("payoff", "argentina"),
  tigaDua: at("payoff", "tiga-dua"),
  // outro
  audira: at("outro", "ini"),
  berikut: at("outro", "episode"),
  outroCard: TOTAL - 3.8,
};
