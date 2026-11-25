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

// word lookup: find word start/end by text prefix within a scene (n = occurrence index)
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
  // HOOK (0.1 - 6.834)
  dari: W("hook", "dari"),
  cruyff1: W("hook", "cruyff"),
  pep1: W("hook", "pep"),
  guardiola1: WE("hook", "guardiola"),
  bukan: W("hook", "bukan"),
  garisLurus: WE("hook", "lurus"),
  audira1: W("hook", "audira"),
  hookEnd: WE("hook", "audira"),

  // KONTEKS (6.994 - 22.704)
  tahun1973: W("konteks", "tahun"),
  cruyffDatang: W("konteks", "cruyff"),
  pemain: WE("konteks", "pemain"),
  musimPertama: W("konteks", "musim"),
  barcelona1: W("konteks", "barcelona"),
  limaNol1: W("konteks", "lima-nol"),
  kandang: W("konteks", "kandang"),
  pulang: W("konteks", "pulang"),
  gelarLiga: W("konteks", "gelar"),
  dinanti: WE("konteks", "dinanti"),
  gagasan: W("konteks", "gagasan"),
  kuasaiBola: W("konteks", "kuasai"),
  kuasaiRuang: W("konteks", "kuasai", 1),
  ruangEnd: WE("konteks", "ruang"),

  // PENGEMBANGAN (22.864 - 34.96)
  pelatih: W("pengembangan", "pelatih"),
  dreamTeam: W("pengembangan", "dream"),
  dreamTeamEnd: WE("pengembangan", "team"),
  empatGelar: W("pengembangan", "empat"),
  laLiga: W("pengembangan", "la"),
  beruntun: WE("pengembangan", "beruntun"),
  trofiPiala: W("pengembangan", "trofi"),
  pialaEropa: W("pengembangan", "piala"),
  barcelona2: W("pengembangan", "barcelona"),
  wembley: W("pengembangan", "wembley"),
  tendanganBebas: W("pengembangan", "tendangan"),
  koeman: W("pengembangan", "ronald"),
  koemanEnd: WE("pengembangan", "koeman"),
  akademi: W("pengembangan", "akademi"),
  laMasia1: W("pengembangan", "la"),
  laMasia1End: WE("pengembangan", "masia"),

  // PENJELASAN (35.12 - 54.791)
  tahun2008: W("penjelasan", "tahun"),
  lulusan: W("penjelasan", "lulusan"),
  cruyff3: W("penjelasan", "cruyff"),
  pepGuardiola: W("penjelasan", "pep"),
  pepEnd: WE("penjelasan", "guardiola"),
  tikiTaka: W("penjelasan", "tiki-taka"),
  tikiTakaEnd: WE("penjelasan", "tiki-taka"),
  musim0809: W("penjelasan", "musim"),
  treble1: W("penjelasan", "treble"),
  trebleEnd: WE("penjelasan", "spanyol"),
  manUtdFinal: W("penjelasan", "manchester"),
  finalRoma: W("penjelasan", "final"),
  enamTrofi: W("penjelasan", "enam"),
  satuTahun: W("penjelasan", "satu"),
  kalender: WE("penjelasan", "kalender"),
  belumPernah: W("penjelasan", "belum"),
  melakukannya: WE("penjelasan", "melakukannya"),

  // PAYOFF (54.951 - 70.695)
  tahun2010: W("payoff", "tahun"),
  tigaFinalis: W("payoff", "tiga"),
  ballonDor: W("payoff", "ballon"),
  laMasia2: W("payoff", "la"),
  messi: W("payoff", "messi"),
  iniesta: W("payoff", "iniesta"),
  xavi: W("payoff", "xavi"),
  xaviEnd: WE("payoff", "xavi"),
  diTahunSama: W("payoff", "di"),
  realMadrid2: W("payoff", "real"),
  limaNol2: W("payoff", "lima-nol"),
  limaNol2End: WE("payoff", "lima-nol"),
  skorSama: W("payoff", "skor"),
  eraCruyff: W("payoff", "era"),
  tigaPuluhEnam: W("payoff", "tiga", 1),
  filosofi: W("payoff", "filosofi"),
  filosofiEnd: WE("payoff", "sama"),

  // OUTRO (70.855 - 78.415)
  iniAudira: W("outro", "ini"),
  sejarahSB: W("outro", "sejarah"),
  episode: W("outro", "episode"),
  manchesterUtd: W("outro", "manchester"),
  tragedi: W("outro", "tragedi"),
  trebleEnd2: WE("outro", "treble"),
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

type SetName = "hook" | "cruyff73" | "dreamTeam" | "pepTiki" | "ballonDor" | "outro";
export const setAt = (t: number): SetName => {
  if (t < CUT.konteks + 0.2) return "hook";
  if (t < CUT.pengembangan + 0.2) return "cruyff73";
  if (t < CUT.penjelasan + 0.2) return "dreamTeam";
  if (t < CUT.payoff + 0.2) return "pepTiki";
  if (t < CUT.outro + 0.2) return "ballonDor";
  return "outro";
};
