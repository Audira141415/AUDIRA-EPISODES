// EP05 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-22).
// Map of cuts: EP05_RUMBLE_IN_THE_JUNGLE_1974/docs/TIMING.md.
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const VO_END: number = tl.voEnd;
/** AudiraOutro (Root.tsx) covers the last 3.8 s of the composition. */
export const OUTRO_AT = TOTAL - 3.8;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** Start (s) of the nth word in clip `id` that starts with `prefix` (throws on drift). */
export const W = (id: string, prefix: string, nth = 0) => {
  const ws = CLIPS.find((c) => c.id === id)!.words.filter((w) => norm(w.w).startsWith(norm(prefix)));
  if (!ws[nth]) throw new Error(`timing drift: ${id} "${prefix}"#${nth}`);
  return ws[nth].s;
};
const S = (id: string) => CLIPS.find((c) => c.id === id)!;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pop = (t: number, a: number) => {
  const k = clamp((t - a) / 0.28);
  if (k <= 0) return 0;
  return k < 0.6 ? (k / 0.6) * 1.08 : 1.08 - ((k - 0.6) / 0.4) * 0.08;
};

// ---------------------------------------------------------------- beats (VO seconds)
export const T = {
  // hook
  tigaPuluhTujuh: W("hook", "tiga"),
  belumPernah: W("hook", "belum"),
  subuh: W("hook", "subuh"),
  audira: W("hook", "audira"),
  // konteks
  kinshasa: S("konteks").start,
  tanggal: W("konteks", "tiga"),
  foreman: W("konteks", "george"),
  juara: W("konteks", "juara"),
  ali: W("konteks", "penantangnya"),
  dicabut: W("konteks", "dicabut"),
  bursa: W("konteks", "bursa"),
  empatBanding: W("konteks", "empat", 1),
  // pengembangan
  ditunda: S("pengembangan").start,
  sebulan: W("pengembangan", "sebulan"),
  mata: W("pengembangan", "mata"),
  robek: W("pengembangan", "robek"),
  lalu: W("pengembangan", "lalu"),
  jamEmpat: W("pengembangan", "jam"),
  tayang: W("pengembangan", "tayang"),
  televisi: W("pengembangan", "televisi"),
  hampir: W("pengembangan", "hampir"),
  meneriakkan: W("pengembangan", "meneriakkan"),
  bomaye: W("pengembangan", "ali", 0),
  bunuh: W("pengembangan", "ali", 1),
  // penjelasan
  tapi: S("penjelasan").start,
  bersandar: W("penjelasan", "bersandar"),
  kendur: W("penjelasan", "kendur"),
  memukul: W("penjelasan", "memukul"),
  ronde: W("penjelasan", "ronde"),
  menyerah: W("penjelasan", "menyerah"),
  jebakan: W("penjelasan", "jebakan"),
  ropeADope: W("penjelasan", "rope"),
  menguras: W("penjelasan", "menguras"),
  // payoff
  ronde8: S("payoff").start,
  limbung: W("payoff", "limbung"),
  rentetan: W("payoff", "ali"),
  roboh: W("payoff", "roboh"),
  wasit: W("payoff", "wasit"),
  duaMenit: W("payoff", "dua"),
  takLama: W("payoff", "tak", 1),
  fajar: W("payoff", "fajar"),
  badai: W("payoff", "badai"),
  // outro
  outro: S("outro").start,
  kadang: W("outro", "kadang"),
  episode: W("outro", "episode"),
  ikuti: W("outro", "ikuti"),
};

/** Scene cuts (s). */
export const CUT = {
  map: T.kinshasa,
  faceoff: T.foreman - 0.2,
  camp: T.ditunda,
  stadium: T.lalu,
  ropes: T.tapi,
  ko: T.ronde8,
  dawn: T.takLama,
  out: T.outro,
};
