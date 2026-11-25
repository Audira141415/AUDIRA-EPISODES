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
  if (!hits[n]) throw new Error(`ep16 timing: no word "${word}" #${n} in ${id}`);
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
  tiga: W("hook", "Tiga"),
  beruntun: W("hook", "beruntun"),
  klub: W("hook", "klub"),
  eropa: W("hook", "Eropa"),
  audira1: W("audira1", "Ini"),
  hookEnd: SEC.HOOK[1],
  // konteks
  bayern: W("lahir", "Bayern"),
  y1900: W("lahir", "1900"),
  bavaria: W("lahir", "Bavaria"),
  puluhan: W("awal", "Puluhan"),
  raksasa: W("awal", "raksasa"),
  nazi: W("nazi", "Nazi"),
  landauer: W("nazi", "Landauer"),
  dipaksa: W("nazi", "dipaksa"),
  terusir: W("nazi", "terusir"),
  emas: W("emas", "emas"),
  beckenbauer: W("emas", "Beckenbauer"),
  muller: W("emas", "Müller"),
  maier: W("emas", "Maier"),
  kontEnd: SEC.KONTEKS[1],
  // pengembangan
  kapten: W("champions", "kapten"),
  juaraCL: W("champions", "juara"),
  y1974: W("champions", "1974"),
  y1975: W("champions", "1975"),
  y1976: W("champions", "1976"),
  final74: W("final74", "Final"),
  imbang: W("final74", "imbang"),
  brussel: W("final74", "Brussel"),
  empatNol: W("final74", "empat-nol"),
  atletico: W("final74", "Atlético"),
  derKaiser: W("kaiser", "Der"),
  sangKaisar: W("kaiser", "Sang"),
  libero: W("kaiser", "libero"),
  bek: W("kaiser", "bek"),
  serangan: W("kaiser", "serangan"),
  belakang: W("kaiser", "belakang"),
  pengEnd: SEC.PENGEMBANGAN[1],
  // penjelasan
  domestik: W("domestik", "Di"),
  tertandingi: W("domestik", "tertandingi"),
  rekor: W("domestik", "rekor"),
  jerman1: W("domestik", "Jerman"),
  sebelas: W("bundesliga", "sebelas"),
  bundesliga: W("bundesliga", "Bundesliga"),
  y2013: W("bundesliga", "2013"),
  y2023: W("bundesliga", "2023"),
  terputus: W("bundesliga", "terputus"),
  leverkusen: W("bundesliga", "Leverkusen"),
  jelasEnd: SEC.PENJELASAN[1],
  // payoff
  puncak: W("puncak", "puncaknya"),
  musim2019: W("puncak", "2019"),
  enam: W("puncak", "Enam"),
  sextuple: W("puncak", "sextuple"),
  dikunci: W("puncak", "dikunci"),
  y2021: W("puncak", "2021"),
  kedua: W("kedua", "kedua"),
  dunia: W("kedua", "dunia"),
  barcelona: W("kedua", "Barcelona"),
  keenam: W("kedua", "keenam"),
  jerman2: W("kedua", "Jerman"),
  payEnd: SEC.PAYOFF[1],
  // outro
  ini: W("outro", "Ini"),
  audira2: W("outro", "AUDIRA"),
  episode: W("outro", "Episode"),
  ajax: W("outro", "Ajax"),
  outroCard: TOTAL - 3.8,
};

export const CUT = {
  birth:     T.hookEnd + 0.12,
  dark:      T.nazi - 0.1,
  golden:    T.emas - 0.1,
  champ:     T.kontEnd + 0.1,
  kaiser:    T.derKaiser - 0.1,
  domestic:  T.pengEnd + 0.08,
  sextuple:  T.puncak - 0.1,
  outro:     T.payEnd + 0.1,
};
export type SetName = "hook" | "birth" | "dark" | "golden" | "champ" | "kaiser" | "domestic" | "sextuple" | "outro";
export const setAt = (t: number): SetName =>
  t < CUT.birth ? "hook" : t < CUT.dark ? "birth" : t < CUT.golden ? "dark" :
  t < CUT.champ ? "golden" : t < CUT.kaiser ? "champ" : t < CUT.domestic ? "kaiser" :
  t < CUT.sextuple ? "domestic" : t < CUT.outro ? "sextuple" : "outro";
