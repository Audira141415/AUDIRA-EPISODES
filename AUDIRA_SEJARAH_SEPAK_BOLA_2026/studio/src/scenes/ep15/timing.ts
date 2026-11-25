// EP15 timing + camera. Juventus: La Vecchia Signora.
// FILM16: documentary camera, warm kitchen set with jersey form + scudetto discs.
import * as THREE from "three";
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const SEC = tl.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

export const W = (id: string, i: number, expect: string) => {
  const w = CLIPS.find((c) => c.id === id)!.words[i];
  if (!w || !w.w.toLowerCase().startsWith(expect.toLowerCase())) throw new Error(`timing drift: ${id}[${i}] = ${w?.w} (expected ${expect})`);
  return w.s;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => { const x = clamp(k); return x * x * (3 - 2 * x); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- beats
export const T = {
  // hook
  klub: W("hook", 0, "Klub"),
  justru: W("hook", 6, "justru"),
  nyonyaTua: W("hook", 11, "Nyonya"),
  iniAudira: W("hook", 13, "Ini"),
  // konteks
  juventus: W("konteks", 0, "Yuventus"),
  y1897: W("konteks", 3, "1897"),
  turin: W("konteks", 5, "Turin"),
  pelajar: W("konteks", 8, "pelajar"),
  namaLatin: W("konteks", 9, "Namanya"),
  masaMuda: W("konteks", 14, "masa"),
  seragam: W("konteks", 16, "Seragam"),
  y1903: W("konteks", 22, "1903"),
  hitamPutih: W("konteks", 25, "hitam"),
  nottsCounty: W("konteks", 29, "Nots"),
  // pengembangan
  agnelli: W("pengembangan", 8, "Any"),
  fiat: W("pengembangan", 12, "Fiat"),
  lapangan: W("pengembangan", 13, "Di"),
  serieA: W("pengembangan", 18, "Seri"),
  tigaPuluhEnam: W("pengembangan", 23, "tiga"),
  sembilan: W("pengembangan", 29, "sembilan"),
  skudeto: W("pengembangan", 30, "skudeto"),
  y2012: W("pengembangan", 33, "2012"),
  rekor: W("pengembangan", 36, "Rekor"),
  // penjelasan
  y1985: W("penjelasan", 1, "1985"),
  klubPertama: W("penjelasan", 4, "klub"),
  ketigaEropa: W("penjelasan", 9, "ketiga"),
  lukaEropa: W("penjelasan", 17, "luka"),
  duaJuara: W("penjelasan", 19, "hanya"),
  tujuhFinal: W("penjelasan", 26, "tujuh"),
  beruntun: W("penjelasan", 35, "beruntun"),
  // payoff
  lukaTerbesar: W("payoff", 0, "Luka"),
  y2006: W("payoff", 4, "2006"),
  calciopoli: W("payoff", 6, "Kalchopoli"),
  kastaKedua: W("payoff", 10, "kasta"),
  dicabut: W("payoff", 19, "dicabut"),
  akhir: W("payoff", 24, "akhir"),
  tapiHanya: W("payoff", 25, "Tapi"),
  nyonyaTua2: W("payoff", 30, "Nyonya"),
  juaraB: W("payoff", 32, "juara"),
  empatKali: W("payoff", 35, "hanya"),
  kembali: W("payoff", 45, "langsung"),
  // outro
  iniAudira2: W("outro", 0, "Ini"),
  berikut: W("outro", 5, "Episode"),
};

// ---------------------------------------------------------------- camera
// Must match Cover.tsx opening frame exactly (audit:cover).
export const COVER_CAM = { pos: [0.3, 1.5, 3.1] as [number, number, number], tgt: [0.1, 0.3, 0] as [number, number, number], fov: 36 };

type Key = { t: number; pos: [number, number, number]; tgt: [number, number, number] };
const K: Key[] = [
  { t: 0, pos: COVER_CAM.pos, tgt: COVER_CAM.tgt },
  { t: 3.5, pos: [0.3, 1.5, 3.1], tgt: [0.1, 0.35, 0] },
  { t: 7.0, pos: [0.5, 1.45, 3.0], tgt: [0.15, 0.3, -0.2] },
  { t: 11.0, pos: [0.1, 1.4, 2.9], tgt: [0.05, 0.3, -0.3] },
  { t: 16.0, pos: [-0.1, 1.35, 2.8], tgt: [0, 0.35, -0.4] },
  { t: 21.0, pos: [0.2, 1.3, 2.7], tgt: [0.1, 0.3, -0.5] },
  { t: 26.0, pos: [0.4, 1.25, 2.6], tgt: [0.15, 0.35, -0.6] },
  { t: 32.0, pos: [0.1, 1.3, 2.8], tgt: [0.05, 0.3, -0.4] },
  { t: 38.0, pos: [-0.2, 1.25, 2.6], tgt: [0, 0.35, -0.5] },
  { t: 44.0, pos: [0.3, 1.2, 2.5], tgt: [0.1, 0.3, -0.6] },
  { t: 50.0, pos: [0, 1.25, 2.7], tgt: [0.05, 0.35, -0.5] },
  { t: 55.0, pos: [-0.1, 1.3, 2.8], tgt: [0, 0.3, -0.4] },
  { t: 62.0, pos: [0.2, 1.2, 2.6], tgt: [0.1, 0.35, -0.5] },
  { t: 68.0, pos: [0.1, 1.35, 2.9], tgt: [0.05, 0.3, -0.3] },
  { t: 74.0, pos: [0.25, 1.4, 3.0], tgt: [0.1, 0.3, -0.2] },
  { t: 78.0, pos: [0.3, 1.45, 3.05], tgt: [0.1, 0.3, -0.1] },
  { t: TOTAL, pos: [0.3, 1.5, 3.1], tgt: [0.1, 0.3, 0] },
];
const posCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
const tgtCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.tgt)), false, "centripetal");
const uOf = (t: number) => {
  const n = K.length - 1;
  if (t <= K[0].t) return 0;
  for (let i = 0; i < n; i++) {
    if (t <= K[i + 1].t) {
      const k = (t - K[i].t) / (K[i + 1].t - K[i].t);
      const e = 0.35 * k + 0.65 * smooth(k);
      return (i + e) / n;
    }
  }
  return 1;
};
export type Cam = { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number };
export const camAt = (t: number): Cam => {
  if (t <= 0) return { pos: new THREE.Vector3(...COVER_CAM.pos), tgt: new THREE.Vector3(...COVER_CAM.tgt), fov: COVER_CAM.fov };
  const u = uOf(t);
  return { pos: posCurve.getPoint(u), tgt: tgtCurve.getPoint(u), fov: COVER_CAM.fov };
};
