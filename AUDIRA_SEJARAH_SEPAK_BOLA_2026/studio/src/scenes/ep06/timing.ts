// EP06 film timing: every beat is a word time from the locked VO (timeline.json = Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");
/** Start of the n-th word (0-based) of clip `id` whose text begins with `word`. */
export const W = (id: string, word: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  const hits = c.words.filter((x) => norm(x.w).startsWith(norm(word)));
  if (!hits[n]) throw new Error(`ep06 timing: no word "${word}" #${n} in ${id}`);
  return hits[n].s;
};
/** End of that word. */
export const WE = (id: string, word: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  return c.words.filter((x) => norm(x.w).startsWith(norm(word)))[n].e;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 -> 1 between a and b (smoothstep). */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** fade in at a, fade out ending at b. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Pop with a small overshoot (back-out), 0 before a. */
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = clamp01((t - a) / dur);
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---- beats ----
export const T = {
  // hook
  y1863: W("hook", "1863"),
  kick: W("hook", "menendang"),
  hit1: W("hook", "tulang"),
  hit2: W("hook", "bagian"),
  hookEnd: SEC.HOOK[1],
  // konteks
  waktu: W("konteks", "waktu"),
  sekolah: W("konteks", "sekolah"),
  rugby: W("konteks", "rugby"),
  dibawa: W("konteks", "dibawa"),
  eton: W("konteks", "eton"),
  tangan: W("konteks", "tangan"),
  dilarangK: W("konteks", "dilarang"),
  begitu: W("konteks", "begitu"),
  bertemu: W("konteks", "bertemu"),
  bingung: W("konteks", "bingung"),
  kontEnd: SEC.KONTEKS[1],
  // pengembangan
  dua26: W("pengembangan", "dua"),
  oktober: W("pengembangan", "oktober"),
  y1863b: W("pengembangan", "1863"),
  wakil: W("pengembangan", "wakil"),
  klub12: W("pengembangan", "klub"),
  berkumpul: W("pengembangan", "berkumpul"),
  freemasons: W("pengembangan", "freemasons"),
  penggagas: W("pengembangan", "penggagasnya"),
  ebenezer: W("pengembangan", "ebenezer"),
  barnes: W("pengembangan", "barnes"),
  malam: W("pengembangan", "malam"),
  the: W("pengembangan", "the"),
  association: W("pengembangan", "association"),
  lalu: W("pengembangan", "lalu"),
  bolehkah1: W("pengembangan", "bolehkah", 0),
  bolehkah2: W("pengembangan", "bolehkah", 1),
  kubu: W("pengembangan", "kubu", 0),
  morley2: W("pengembangan", "morley", 1),
  cambridge: W("pengembangan", "cambridge"),
  melarang: W("pengembangan", "melarang"),
  akhirnya: W("pengembangan", "akhirnya"),
  resmi: W("pengembangan", "resmi"),
  dilarangP: W("pengembangan", "dilarang"),
  blackheath: W("pengembangan", "blackheath"),
  rapat: W("pengembangan", "rapat"),
  y1871: W("pengembangan", "1871"),
  kubuRugby: W("pengembangan", "kubu", 1),
  mendirikan: W("pengembangan", "mendirikan"),
  pengEnd: SEC.PENGEMBANGAN[1],
  // penjelasan
  hasilnya: W("penjelasan", "hasilnya"),
  tigaBelas: W("penjelasan", "tiga"),
  aneh: W("penjelasan", "aneh"),
  gawang: W("penjelasan", "gawang"),
  mistar: W("penjelasan", "mistar"),
  setinggi: W("penjelasan", "setinggi"),
  gol1: W("penjelasan", "gol", 0),
  tim: W("penjelasan", "tim"),
  gol2: W("penjelasan", "gol", 1),
  bolaTangkap: W("penjelasan", "bola", 1),
  ditangkap: W("penjelasan", "ditangkap"),
  tidak: W("penjelasan", "tidak", 0),
  kiper: W("penjelasan", "kiper"),
  wasit: W("penjelasan", "wasit"),
  jelasEnd: SEC.PENJELASAN[1],
  // payoff
  tapi: W("payoff", "tapi"),
  hidup: W("payoff", "hidup"),
  lebar: W("payoff", "lebar"),
  delapan: W("payoff", "delapan"),
  tujuhKoma: W("payoff", "tujuh", 0),
  meter1: W("payoff", "meter", 0),
  jarak: W("payoff", "jarak"),
  sepuluh: W("payoff", "sepuluh"),
  sembilan: W("payoff", "sembilan"),
  meter2: W("payoff", "meter", 1),
  tigaBaris: W("payoff", "tiga", 1),
  tujuhBelas: W("payoff", "tujuh", 1),
  dunia: W("payoff", "dunia"),
  payEnd: SEC.PAYOFF[1],
  // outro
  ini: W("outro", "ini"),
  audira: W("outro", "audira"),
  episode: W("outro", "episode"),
  uruguay: W("outro", "uruguay"),
  outroCard: TOTAL - 3.8,
};

// ---- sets (one 3D set is mounted at a time; cuts hide behind page turns / light flashes) ----
export const CUT = {
  schools: T.hookEnd + 0.12, // page turn
  quill: T.kontEnd + 0.1, // page turn
  tavern: T.wakil - 0.1, // page turn
  room: T.penggagas - 0.02, // push through the lit window (flash)
  fork: T.y1871 - 0.32, // Blackheath's door light (flash)
  laws: T.pengEnd + 0.08, // page turn
  outro: T.payEnd + 0.1, // page turn
};
export type SetName = "table" | "schools" | "quill" | "tavern" | "room" | "fork" | "pitch" | "outro";
export const setAt = (t: number): SetName =>
  t < CUT.schools ? "table" : t < CUT.quill ? "schools" : t < CUT.tavern ? "quill" : t < CUT.room ? "tavern" : t < CUT.fork ? "room" : t < CUT.laws ? "fork" : t < CUT.outro ? "pitch" : "outro";
