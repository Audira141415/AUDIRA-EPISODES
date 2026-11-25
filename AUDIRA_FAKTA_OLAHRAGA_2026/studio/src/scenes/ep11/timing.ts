// EP11 timing. Every cut and beat is read from the locked VO (timeline.json, Audio Master Clock, 2026-11-24).
// Map of cuts: EP11_KANAKURI_MARATON_54_TAHUN/docs/BUILD_SHEET.md.
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

// ---------------------------------------------------------------- beats (VO seconds, locked 2026-11-24)
export const T = {
  hit54: 1.6, stockholm: 4.42, shizo: 7.67, duaAtlet: 11.18, delapanBelas: 15.66, kapal: 17.07, trans: 18.18, susahTidur: 21.15, malam: 22.27, terang: 23.32,
  pelari68: 26.86, tumbang: 30.13, lazaro: 31.91, kolaps: 33.33, meninggal: 34.14, km30: 35.92, menyerah: 37.17, rumah: 38.44, minum: 39.46, tertidur: 40.84, pagi: 42.03, malu: 42.99, pulang: 43.96,
  legenda: 47.87, hilang: 49.37, berlari: 51.05, y1920: 53.13, y1924: 54.18, hakone: 56.12, estafet: 57.77,
  y1967: 59.38, televisi: 61.07, usia75: 63.52, melintasi: 65.44, finis: 66.46, w54: 68.24, w8: 69.67, w6: 70.57, w5: 71.47, w32: 72.23, w20: 73.28,
  perjalanan: 75.45, menikah: 78.02, enam: 78.82, sepuluh: 79.97, menurutmu: 81.16, cepat: 82.83, kembali: 83.82, tulis: 84.64, ikuti: 85.83,
};

/** Scene cuts (s). */
export const CUT = { b1: 4.3, b2: 13.3, b3: 19.2, c1: 24.0, c1b: 30.8, c2: 34.9, c3: 37.8, c3b: 40.7, c3c: 42.7, d1: 46.2, d2: 49.9, d3: 55.4, e1: 58.5, e1b: 63.3, e2: 67.1, out: 74.7, out2: 81.1 };
