// EP09 clock: every beat is keyed to word times in timeline.json (Audio Master Clock).
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
export const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
export const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;
export const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
/** Overdamped-ish spring settle (toy props spring in, slight overshoot). */
export const backOut = (x: number, s = 1.4) => {
  const u = clamp01(x) - 1;
  return 1 + u * u * ((s + 1) * u + s);
};
export const spring = (t: number, a: number, dur = 0.7) => backOut((t - a) / dur);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const T = {
  hilang: W("hook", 12),
  ini: W("hook", 13),
  kamis: W("konteks", 0),
  gibran: W("konteks", 3),
  menyerahkan: W("konteks", 8),
  pakar: W("konteks", 12),
  sah: W("konteks", 17),
  lalu: W("konteks", 23),
  aturan: W("pengembangan", 0),
  uu: W("pengembangan", 1),
  pasal6: W("pengembangan", 6),
  hormat: W("pengembangan", 12),
  besarnya: W("pengembangan", 17),
  gaji: W("pengembangan", 23),
  empat: W("pengembangan", 26),
  yaitu: W("pengembangan", 33),
  rp: W("pengembangan", 34),
  pensiunIni: W("pengembangan", 38),
  pasal7: W("penjelasan", 0),
  kesehatan: W("penjelasan", 4),
  air: W("penjelasan", 10),
  listrik: W("penjelasan", 11),
  telepon: W("penjelasan", 13),
  pasal8: W("penjelasan", 14),
  rumah: W("penjelasan", 18),
  perlengkapan: W("penjelasan", 22),
  kendaraan: W("penjelasan", 24),
  pengemudi: W("penjelasan", 28),
  perpres: W("penjelasan", 30),
  satuKali: W("penjelasan", 38),
  pajak: W("penjelasan", 41),
  pengamanan: W("payoff", 0),
  pp: W("payoff", 3),
  seumur: W("payoff", 10),
  mantan: W("payoff", 13),
  kata: W("payoff", 17),
  berhenti: W("payoff", 21),
  uuTidak: W("payoff", 24),
  tapi: W("payoff", 28),
  mahfud: W("payoff", 29),
  sama: W("payoff", 39),
  jadi: W("outro", 0),
  menurutmu: W("outro", 6),
  ikuti: W("outro", 13),
};
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;
