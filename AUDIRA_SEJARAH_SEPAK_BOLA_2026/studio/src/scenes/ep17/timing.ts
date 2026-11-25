import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const CLIPS = TIMELINE.clips;
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");
export const W = (id: string, word: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  const hits = c.words.filter((x) => norm(x.w).startsWith(norm(word)));
  if (!hits[n]) throw new Error(`ep17 timing: no word "${word}" #${n} in ${id}`);
  return hits[n].s;
};
export const WE = (id: string, word: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  return c.words.filter((x) => norm(x.w).startsWith(norm(word)))[n].e;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const pop = (t: number, a: number, dur = 0.35) => {
  const x = clamp01((t - a) / dur);
  const c = 1.70158;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

export const T = {
  // hook
  bek: W("hook", "bek"),
  penyerang: W("hook", "penyerang"),
  mengubah: W("ubah", "mengubah"),
  sepakbola: W("ubah", "sepak"),
  audira1: W("audira1", "Ini"),
  hookEnd: SEC.HOOK[1],
  // konteks
  y1965: W("michels", "1965"),
  ajax1: W("michels", "Ajax"),
  michels: W("michels", "Michels"),
  pelatih: W("michels", "pelatih"),
  remaja: W("cruyff", "remaja"),
  cruyff1: W("cruyff", "Cruyff"),
  totalFb: W("totalfb", "Total"),
  football: W("totalfb", "Football"),
  menukar: W("totalfb", "menukar"),
  bolong: W("totalfb", "bolong"),
  kontEnd: SEC.KONTEKS[1],
  // pengembangan
  ajax2: W("akar", "Ajax"),
  penemu: W("akar", "penemu"),
  ajaxLah: W("akar", "Ajax-lah"),
  sistem: W("akar", "sistem"),
  y1971: W("piala71", "1971"),
  pialaEropa: W("piala71", "Piala"),
  duaNol: W("piala71", "dua-nol"),
  panathinaikos: W("piala71", "Panathinaikos"),
  cruyff2: W("piala71", "Cruyff"),
  terbaik: W("piala71", "Terbaik"),
  michels2: W("kovacs", "Michels"),
  barcelona1: W("kovacs", "Barcelona"),
  kovacs: W("kovacs", "Kovács"),
  treble: W("kovacs", "treble"),
  y1972: W("kovacs", "1972"),
  y1973: W("kovacs", "1973"),
  tigaTrofi: W("kovacs", "tiga"),
  realMadrid: W("kovacs", "Real"),
  pengEnd: SEC.PENGEMBANGAN[1],
  // penjelasan
  akademi: W("akademi", "akademi"),
  toekomst: W("akademi", "Toekomst"),
  masaDepan: W("akademi", "Masa"),
  filosofi: W("akademi", "Filosofi"),
  tips: W("akademi", "TIPS"),
  technique: W("akademi", "Technique"),
  speed: W("akademi", "Speed"),
  pabrik: W("bintang", "pabrik"),
  cruyff3: W("bintang", "Cruyff"),
  vanBasten: W("bintang", "Van"),
  bergkamp: W("bintang", "Bergkamp"),
  kluivert: W("bintang", "Kluivert"),
  jelasEnd: SEC.PENJELASAN[1],
  // payoff
  menyeberang: W("seberang", "menyeberang"),
  michels3: W("seberang", "Michels"),
  cruyff4: W("seberang", "Cruyff"),
  barcelona2: W("seberang", "Barcelona"),
  tikiTaka: W("seberang", "tiki-taka"),
  amsterdam: W("dna", "Amsterdam"),
  dna: W("dna", "DNA"),
  modern: W("dna", "modern"),
  kiblat: W("dna", "kiblat"),
  payEnd: SEC.PAYOFF[1],
  // outro
  ini: W("outro", "Ini"),
  audira2: W("outro", "AUDIRA"),
  episode: W("outro", "Episode"),
  boca: W("outro", "Boca"),
  outroCard: TOTAL - 3.8,
};

export const CUT = {
  context:  T.hookEnd + 0.12,
  triumph:  T.kontEnd + 0.1,
  kovacs:   T.michels2 - 0.1,
  academy:  T.pengEnd + 0.08,
  export:   T.jelasEnd + 0.1,
  outro:    T.payEnd + 0.1,
};
export type SetName = "hook" | "context" | "triumph" | "kovacs" | "academy" | "export" | "outro";
export const setAt = (t: number): SetName =>
  t < CUT.context ? "hook" : t < CUT.triumph ? "context" : t < CUT.kovacs ? "triumph" :
  t < CUT.academy ? "kovacs" : t < CUT.export ? "academy" : t < CUT.outro ? "export" : "outro";
