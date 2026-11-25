// EP04 film clock: every cut, beat and caption is keyed to word times in timeline.json (Audio Master Clock).
import TLJ from "./timeline.json";

export type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; words: Word[] };
const TLX = TLJ as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };

export const CLIPS = TLX.clips;
export const SEC = TLX.sections;
export const TOTAL = TLX.total;
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

/** Start time of word i of clip id. */
export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** 0 → 1 → 0 window with fade-in fi and fade-out fo. */
export const win = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);

/** Word anchors (seconds). */
export const T = {
  // HOOK
  n425: W("hook", 0),
  ribu: W("hook", 1),
  kasus: W("hook", 2),
  karhutla: W("hook", 6),
  hampir: W("hook", 7),
  lima: W("hook", 10),
  balitaH: W("hook", 12),
  // KONTEKS
  ini: W("konteks", 0),
  data: W("konteks", 1),
  sejak: W("konteks", 5),
  tujuh: W("konteks", 8),
  riau: W("konteks", 10),
  jambi: W("konteks", 11),
  sumsel: W("konteks", 12),
  empat: W("konteks", 15),
  kalimantan: W("konteks", 18),
  satuan: W("konteks", 19),
  bukan: W("konteks", 21),
  pada: W("konteks", 24),
  n96: W("konteks", 27),
  // PENGEMBANGAN
  pertengahan: W("pengembangan", 0),
  n283: W("pengembangan", 3),
  tigaMinggu: W("pengembangan", 5),
  n425b: W("pengembangan", 8),
  pemerintah: W("pengembangan", 10),
  turun: W("pengembangan", 15),
  sepuluh: W("pengembangan", 17),
  tigaRibu: W("pengembangan", 21),
  benar: W("pengembangan", 24),
  tapi: W("pengembangan", 25),
  bertambah: W("pengembangan", 30),
  bbc: W("pengembangan", 33),
  meninggal: W("pengembangan", 38),
  dokter: W("pengembangan", 43),
  memastikan: W("pengembangan", 46),
  // PENJELASAN
  kenapa: W("penjelasan", 0),
  partikel: W("penjelasan", 4),
  pm25: W("penjelasan", 6),
  lebihDari: W("penjelasan", 7),
  duaPuluh: W("penjelasan", 9),
  sehelai: W("penjelasan", 15),
  ia: W("penjelasan", 17),
  ujung: W("penjelasan", 20),
  balitaP: W("penjelasan", 23),
  cepat: W("penjelasan", 26),
  menghirup: W("penjelasan", 27),
  berat: W("penjelasan", 32),
  paru: W("penjelasan", 35),
  tumbuh: W("penjelasan", 37),
  // PAYOFF
  cara: W("payoff", 0),
  orang: W("payoff", 2),
  n95: W("payoff", 6),
  kain: W("payoff", 9),
  halus: W("payoff", 14),
  balitaY: W("payoff", 15),
  bermasker: W("payoff", 22),
  siapkan: W("payoff", 24),
  jendela: W("payoff", 28),
  penyaring: W("payoff", 30),
  ac: W("payoff", 32),
  bila: W("payoff", 35),
  sesak: W("payoff", 37),
  menyusu: W("payoff", 40),
  segera: W("payoff", 41),
  fasilitas: W("payoff", 44),
  // OUTRO
  kasusnya: W("outro", 0),
  belum: W("outro", 5),
  cek: W("outro", 7),
  ispu: W("outro", 8),
  iniA: W("outro", 10),
  audira: W("outro", 11),
};

/** Scene cuts (s). Hologram swaps happen on the projector; the two hair cuts go through smoke. */
export const CUT = {
  map: T.tujuh - 0.25,
  balita: T.pada - 0.25,
  chart: SEC.PENGEMBANGAN[0] - 0.05,
  daily: T.pemerintah - 0.15,
  stack: T.tapi - 0.15,
  memorial: T.bbc - 0.3,
  why: SEC.PENJELASAN[0] - 0.1,
  hairIn: T.partikel - 0.05,
  hairOut: T.ia - 0.2,
  compare: T.balitaP - 0.2,
  mask: SEC.PAYOFF[0] - 0.1,
  room: T.siapkan - 0.3,
  outro: SEC.OUTRO[0] - 0.1,
};
