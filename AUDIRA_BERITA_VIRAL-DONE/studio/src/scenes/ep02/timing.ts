// EP02 Audio Master Clock: every beat comes from timeline.json word times.
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const SEC = tl.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
export const sm = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
export const seg = (t: number, a: number, b: number) => sm((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

export const T = {
  // HOOK
  tidur: W("hook", 12),
  patung: W("hook", 14),
  hoegeng: W("hook", 17),
  hariIni: W("hook", 18),
  resmi: W("hook", 22),
  // KONTEKS
  selasa: W("konteks", 0),
  prabowo: W("konteks", 6),
  sembilanBelas: W("konteks", 13),
  provinsi: W("konteks", 16),
  keppres: W("konteks", 19),
  fadli: W("konteks", 25),
  rekor: W("konteks", 30),
  // PENGEMBANGAN
  siapa: W("pengembangan", 0),
  hoegeng2: W("pengembangan", 3),
  suap: W("pengembangan", 8),
  sadikin: W("pengembangan", 10),
  roem: W("pengembangan", 16),
  sastro: W("pengembangan", 21),
  takdir: W("pengembangan", 29),
  wasyid: W("pengembangan", 34),
  // PENJELASAN
  gelar: W("penjelasan", 0),
  usulan: W("penjelasan", 6),
  kabupaten: W("penjelasan", 12),
  prov: W("penjelasan", 17),
  kemensos: W("penjelasan", 20),
  dewan: W("penjelasan", 23),
  presiden: W("penjelasan", 28),
  // PAYOFF
  satuNama: W("payoff", 0),
  margono: W("payoff", 4),
  bni: W("payoff", 7),
  kakek: W("payoff", 9),
  pemerintah: W("payoff", 12),
  sejarawan: W("payoff", 20),
  cucu: W("payoff", 27),
  tamu: W("payoff", 31),
  buku: W("payoff", 38),
  jamDatang: W("payoff", 40),
  jamPulang: W("payoff", 42),
  // OUTRO
  sembilan: W("outro", 0),
  tokoh: W("outro", 6),
  tulis: W("outro", 12),
};

/** Ladder landing times (token reaches step j). */
export const STEP_T = [T.kabupaten, T.prov, T.kemensos, T.dewan, T.presiden - 0.4];
