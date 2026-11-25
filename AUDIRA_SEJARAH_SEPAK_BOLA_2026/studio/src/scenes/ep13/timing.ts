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
  // HOOK (0.1 - 9.009)
  enamFeb: W("hook", "enam"),
  delapan1958: WE("hook", "delapan"),
  pesawat: W("hook", "pesawat"),
  salju: W("hook", "salju"),
  munich1: WE("hook", "munich"),
  delapanPemain: W("hook", "delapan", 1),
  manchesterUtd: W("hook", "manchester"),
  united1: WE("hook", "united"),
  audira1: W("hook", "audira"),
  hookEnd: WE("hook", "audira"),

  // KONTEKS (9.169 - 25.436)
  busbyBabes: W("konteks", "busby"),
  babesEnd: WE("konteks", "babes"),
  timBelia: W("konteks", "tim"),
  mattBusby1: W("konteks", "matt"),
  busby1End: WE("konteks", "busby"),
  perjalanan: W("konteks", "perjalanan"),
  pialaEropa: W("konteks", "piala"),
  beograd: W("konteks", "beograd"),
  singgahMunich: W("konteks", "singgah"),
  munichEnd2: WE("konteks", "munich"),
  percobaanKetiga: W("konteks", "percobaan"),
  gagalLepas: W("konteks", "gagal"),
  landasanSalju: W("konteks", "landasan"),
  saljuBasah: WE("konteks", "basah"),

  // PENGEMBANGAN (25.596 - 40.488)
  empatPuluhEmpat: W("pengembangan", "empat"),
  duaPuluhTiga: W("pengembangan", "dua"),
  tewas: W("pengembangan", "tewas"),
  tewasEnd: WE("pengembangan", "tewas"),
  delapanPemain2: W("pengembangan", "delapan"),
  pemainEnd: WE("pengembangan", "pemain"),
  duncanEdwards: W("pengembangan", "duncan"),
  edwardsEnd: WE("pengembangan", "edwards"),
  selamat: W("pengembangan", "selamat"),
  wafat: W("pengembangan", "wafat"),
  limaBelasHari: W("pengembangan", "lima"),
  kemudian: WE("pengembangan", "kemudian"),
  mattBusby2: W("pengembangan", "matt"),
  sakramen: W("pengembangan", "sakramen"),
  terakhir: WE("pengembangan", "terakhir"),
  bertahan: W("pengembangan", "bertahan"),
  bertahanEnd: WE("pengembangan", "bertahan"),

  // PENJELASAN (40.648 - 56.03)
  sepuluhTahun: W("penjelasan", "sepuluh"),
  membangunKembali: W("penjelasan", "membangun"),
  puing: WE("penjelasan", "puing"),
  duaPuluhSembilan: W("penjelasan", "dua"),
  mei1968: W("penjelasan", "mei"),
  wembley: W("penjelasan", "wembley"),
  manchesterUtd2: W("penjelasan", "manchester"),
  benfica: W("penjelasan", "benfica"),
  empatSatu: W("penjelasan", "empat-satu"),
  empatSatuEnd: WE("penjelasan", "empat-satu"),
  klubInggrisPertama: W("penjelasan", "klub"),
  juaraEropa: W("penjelasan", "juara"),
  juaraEropaEnd: WE("penjelasan", "eropa"),
  bobbyCharlton: W("penjelasan", "bobby"),
  charltonEnd: WE("penjelasan", "charlton"),
  penyintas: W("penjelasan", "penyintas"),
  duaGol: W("penjelasan", "dua"),
  malamItu: WE("penjelasan", "itu"),

  // PAYOFF (56.19 - 78.161)
  tigaPuluhSatu: W("payoff", "tiga"),
  kemudian2: WE("payoff", "kemudian"),
  alexFerguson: W("payoff", "alex"),
  fergusonEnd: WE("payoff", "ferguson"),
  treble: W("payoff", "treble"),
  trebleEnd: WE("payoff", "treble"),
  liga: W("payoff", "liga"),
  pialaFA: W("payoff", "piala"),
  ligaChampions: W("payoff", "liga", 1),
  champions: W("payoff", "champions"),
  satuMusim: WE("payoff", "musim"),
  finalnya: W("payoff", "finalnya"),
  bayern: W("payoff", "bayern"),
  campNou: W("payoff", "camp"),
  ulangTahun: W("payoff", "ulang"),
  busby90: W("payoff", "busby"),
  busby90End: WE("payoff", "busby"),
  tertinggal: W("payoff", "tertinggal"),
  menitSembilanPuluh: W("payoff", "menit"),
  sembilanPuluh: WE("payoff", "puluh", 1),
  duaGol2: W("payoff", "dua", 1),
  sheringham: W("payoff", "sheringham"),
  sheringhamEnd: WE("payoff", "sheringham"),
  solskjaer: W("payoff", "solskjaer"),
  solskjaerEnd: WE("payoff", "solskjaer"),
  membalik: W("payoff", "membalik"),
  segalanya: WE("payoff", "segalanya"),

  // OUTRO (78.321 - 84.536)
  iniAudira: W("outro", "ini"),
  sejarahSB: W("outro", "sejarah"),
  episode: W("outro", "episode"),
  liverpool: W("outro", "liverpool"),
  istanbul: WE("outro", "istanbul"),
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

type SetName = "hook" | "busbyBabes" | "disaster" | "rebuild" | "treble99" | "outro";
export const setAt = (t: number): SetName => {
  if (t < CUT.konteks + 0.2) return "hook";
  if (t < CUT.pengembangan + 0.2) return "busbyBabes";
  if (t < CUT.penjelasan + 0.2) return "disaster";
  if (t < CUT.payoff + 0.2) return "rebuild";
  if (t < CUT.outro + 0.2) return "treble99";
  return "outro";
};
