import TL from "./timeline.json";

export type Word = { text: string; start: number; end: number; scene: string };
type Scene = { id: string; start: number; end: number };
interface Timeline { duration: number; speech_end: number; scenes: Scene[]; words: Word[] }

const T_RAW = TL as unknown as Timeline;
export const WORDS = T_RAW.words;
export const TOTAL = T_RAW.duration;
export const VO_END = T_RAW.speech_end;

export const SEC: Record<string, [number, number]> = {};
for (const s of T_RAW.scenes) SEC[s.id] = [s.start, s.end];

const wordsOf = (scene: string) => WORDS.filter((w) => w.scene === scene);
export const W = (scene: string, prefix: string, n = 0): number => {
  const ws = wordsOf(scene);
  let count = 0;
  for (const w of ws) {
    if (w.text.toLowerCase().startsWith(prefix.toLowerCase())) {
      if (count === n) return w.start;
      count++;
    }
  }
  return 0;
};
export const WE = (scene: string, prefix: string, n = 0): number => {
  const ws = wordsOf(scene);
  let count = 0;
  for (const w of ws) {
    if (w.text.toLowerCase().startsWith(prefix.toLowerCase())) {
      if (count === n) return w.end;
      count++;
    }
  }
  return 0;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const pop = (t: number, a: number, dur = 0.35) => {
  const p = clamp01((t - a) / dur);
  return p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
};

// ---------- named beat timestamps ----------
export const T = {
  // HOOK (0.15–7.2)
  juara: W("hook", "juara"),
  terdegradasi: W("hook", "terdegradasi"),
  rekaman: W("hook", "rekaman"),
  telepon1: WE("hook", "telepon"),
  iniAudira1: W("hook", "ini"),
  audira1End: WE("hook", "audira"),

  // KONTEKS (7.8–22.5)
  mei2006: W("konteks", "mei"),
  transkrip: W("konteks", "transkrip"),
  bocor: W("konteks", "bocor"),
  bocorEnd: WE("konteks", "italia"),
  direktur: W("konteks", "direktur"),
  moggi1: W("konteks", "moggi"),
  moggi1End: WE("konteks", "moggi"),
  wasit: W("konteks", "wasit"),
  serieA1: W("konteks", "serie"),
  serieA1End: WE("konteks", "a."),
  skandal: W("konteks", "skandal"),
  calciopoli: W("konteks", "calciopoli"),
  calciopoliEnd: WE("konteks", "calciopoli"),

  // PENGEMBANGAN (23.0–39.5)
  limaKlub: W("pengembangan", "lima"),
  juventus1: W("pengembangan", "juventus"),
  acMilan1: W("pengembangan", "ac"),
  reggina: WE("pengembangan", "reggina"),
  keruntuhan: W("pengembangan", "keruntuhan"),
  presiden: W("pengembangan", "presiden"),
  presidenEnd: WE("pengembangan", "mundur"),
  moggiMundur: W("pengembangan", "moggi"),
  juaraSA: W("pengembangan", "juara"),
  juaraSAEnd: WE("pengembangan", "a.", 1),
  empatKlub: W("pengembangan", "empat"),
  pengadilan: W("pengembangan", "pengadilan"),
  degradasi1: WE("pengembangan", "degradasi"),

  // PENJELASAN (40.0–67.5)
  hukuman: W("penjelasan", "hukuman"),
  juventus2: W("penjelasan", "juventus"),
  juventus2End: WE("penjelasan", "juventus"),
  satuSatunya: W("penjelasan", "satu-satunya"),
  serieB1: W("penjelasan", "serie"),
  serieB1End: WE("penjelasan", "b,"),
  dipotong: W("penjelasan", "dipotong"),
  duaGelar: W("penjelasan", "dua"),
  gelar0405: W("penjelasan", "2004-05"),
  gelar0506: WE("penjelasan", "2005-06"),
  interMilan: W("penjelasan", "inter"),
  kontroversial: WE("penjelasan", "kontroversial"),
  fiorentina: W("penjelasan", "fiorentina"),
  banding: W("penjelasan", "banding"),
  bandingEnd: WE("penjelasan", "poin.", 0),
  reggina2: W("penjelasan", "reggina"),
  reggina2End: WE("penjelasan", "poin.", 1),
  wasit2: W("penjelasan", "wasit"),
  dicoret: WE("penjelasan", "dicoret"),

  // PAYOFF (68.0–88.0)
  ironi: W("payoff", "ironinya"),
  ironiEnd: WE("payoff", "ironinya"),
  juli2006: W("payoff", "juli"),
  timnas: W("payoff", "timnas"),
  pialaDunia: W("payoff", "piala"),
  pialaDuniaEnd: WE("payoff", "dunia,"),
  tulangPunggung: W("payoff", "tulang"),
  juventus3: WE("payoff", "juventus"),
  acMilan2: W("payoff", "ac"),
  ligaChampions: W("payoff", "liga"),
  ligaChampionsEnd: WE("payoff", "champions"),
  danJuventus: W("payoff", "dan", 0),
  juaraSerieB: W("payoff", "juara"),
  kembali: W("payoff", "kembali"),
  satuMusim: WE("payoff", "musim"),

  // OUTRO (88.5–96.5)
  iniAudira2: W("outro", "ini"),
  sejarahSB: W("outro", "sejarah"),
  episode: W("outro", "episode"),
  nottingham: W("outro", "nottingham"),
  clough: WE("outro", "clough"),
  outroCard: W("outro", "episode"),
} as const;

// ---------- scene transitions ----------
export const CUT = {
  konteks: SEC.konteks[0],
  pengembangan: SEC.pengembangan[0],
  penjelasan: SEC.penjelasan[0],
  payoff: SEC.payoff[0],
  outro: SEC.outro[0],
} as const;

export const TOTAL_SECONDS = TOTAL;

type SetName = "hook" | "wiretaps" | "fiveClubs" | "verdict" | "irony" | "outro";
export const setAt = (t: number): SetName => {
  if (t < CUT.konteks + 0.2) return "hook";
  if (t < CUT.pengembangan + 0.2) return "wiretaps";
  if (t < CUT.penjelasan + 0.2) return "fiveClubs";
  if (t < CUT.payoff + 0.2) return "verdict";
  if (t < CUT.outro + 0.2) return "irony";
  return "outro";
};
