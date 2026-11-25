// EP11 timing + camera. Every beat is read from the locked VO (timeline.json, Audio Master Clock).
// Hero through-line: seven European crowns rise one by one on the board's centre line
// (1963, 1969 | 1989, 1990, 1994 | 2003, 2007), and Sacchi's 25 m block is demonstrated live.
import * as THREE from "three";
import tl from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const TOTAL: number = tl.total;
export const SEC = tl.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

/** Start (s) of word i in clip id; `expect` guards against index drift (prefix of the word, case-insensitive). */
export const W = (id: string, i: number, expect: string) => {
  const w = CLIPS.find((c) => c.id === id)!.words[i];
  if (!w || !w.w.toLowerCase().startsWith(expect.toLowerCase())) throw new Error(`timing drift: ${id}[${i}] = ${w?.w} (expected ${expect})`);
  return w.s;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** 0→1 over [a, a+fi], 1→0 over [b-fo, b]. */
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- beats
export const T = {
  // hook
  milan25: W("hook", 9, "dua"),
  audira: W("hook", 13, "Ini"),
  // konteks
  lahir: W("konteks", 3, "delapan"),
  kilpin: W("konteks", 12, "Herbert"),
  merah: W("konteks", 14, "Merah"),
  wembley: W("konteks", 27, "Wembley"),
  juaraEropa: W("konteks", 34, "juara"),
  kedua: W("konteks", 40, "kedua"),
  // pengembangan (Sacchi)
  sacchi: W("pengembangan", 2, "Arrigo"),
  sepatu: W("pengembangan", 13, "penjual"),
  jarak: W("pengembangan", 19, "jarak"),
  m25: W("pengembangan", 27, "dua"),
  m25end: W("pengembangan", 30, "meter"),
  blok: W("pengembangan", 31, "Sepuluh"),
  rebut: W("pengembangan", 38, "merebut"),
  // penjelasan
  belanda: W("penjelasan", 1, "tiga"),
  ballon: W("penjelasan", 8, "Ballon"),
  d88: W("penjelasan", 10, "delapan"),
  steaua: W("penjelasan", 17, "Steaua"),
  steauaGoal: W("penjelasan", 19, "empat"),
  benfica: W("penjelasan", 22, "Benfica"),
  benficaDown: W("penjelasan", 23, "ditumbangkan"),
  y27: W("penjelasan", 26, "dua"),
  capello: W("penjelasan", 39, "Fabio"),
  l58: W("penjelasan", 43, "lima"),
  barca: W("penjelasan", 53, "Barcelona"),
  barcaGoal: W("penjelasan", 54, "empat"),
  // payoff
  ancelotti: W("payoff", 1, "Carlo"),
  penalti: W("payoff", 7, "adu"),
  tiga2003: W("payoff", 12, "tiga"),
  istanbul: W("payoff", 15, "Istanbul"),
  n30: W("payoff", 18, "tiga-nol"),
  athena: W("payoff", 23, "Athena"),
  inzaghi: W("payoff", 29, "Inzaghi"),
  ketujuh: W("payoff", 31, "ketujuh"),
  // outro
  tujuh: W("outro", 0, "Tujuh"),
  menurut: W("outro", 7, "Menurutmu"),
  penerus: W("outro", 13, "penerus"),
};

// When each of the seven crowns rises on the centre line.
export const TROPHY_AT: number[] = [
  T.juaraEropa - 0.1, // 1963
  T.kedua - 0.15, // 1969
  T.steauaGoal + 0.1, // 1989
  T.benficaDown - 0.1, // 1990
  T.barcaGoal + 0.15, // 1994
  T.tiga2003 + 0.05, // 2003
  T.inzaghi + 0.5, // 2007 (hero, gold glow)
];
export const TROPHY_YEAR = ["'63", "'69", "'89", "'90", "'94", "'03", "'07"];

// ---------------------------------------------------------------- camera
// Keys on beats; positions run through a centripetal Catmull-Rom so the camera never parks.
type Key = { t: number; pos: [number, number, number]; tgt: [number, number, number] };
// Must equal Cover.CAM so the film opens on the approved cover (audit:cover).
export const COVER_CAM = { pos: [-0.1, 9.5, 8.1] as [number, number, number], tgt: [-0.35, 0, -0.75] as [number, number, number], fov: 40 };
const K: Key[] = [
  { t: 0, pos: COVER_CAM.pos, tgt: COVER_CAM.tgt },
  { t: 3.0, pos: [-0.1, 9.0, 7.7], tgt: [-0.3, 0.1, -0.72] },
  { t: 7.4, pos: [0.12, 8.5, 7.7], tgt: [-0.2, 0.12, -0.95] },
  { t: 12.0, pos: [0.22, 8.3, 7.9], tgt: [-0.12, 0.16, -1.05] },
  { t: 17.5, pos: [0.1, 8.1, 7.7], tgt: [-0.05, 0.22, -1.2] },
  { t: 22.3, pos: [0.0, 7.9, 7.5], tgt: [0, 0.26, -1.3] },
  { t: 25.0, pos: [0.12, 6.7, 6.7], tgt: [0, 0.16, -0.4] },
  { t: 30.8, pos: [0.06, 5.7, 6.3], tgt: [0, 0.2, -0.32] },
  { t: 34.3, pos: [0.12, 5.5, 5.9], tgt: [0.08, 0.22, -0.62] },
  { t: 38.2, pos: [0.0, 7.6, 7.6], tgt: [-0.08, 0.3, -1.22] },
  { t: 43.0, pos: [0.12, 7.9, 7.6], tgt: [0, 0.36, -1.32] },
  { t: 48.0, pos: [0.0, 8.0, 7.5], tgt: [0, 0.4, -1.42] },
  { t: 53.0, pos: [-0.06, 8.05, 7.6], tgt: [0, 0.4, -1.5] },
  { t: 58.0, pos: [0.06, 7.9, 7.4], tgt: [0.05, 0.4, -1.42] },
  { t: 61.6, pos: [0.0, 7.8, 7.3], tgt: [0, 0.46, -1.52] },
  { t: 66.0, pos: [0.06, 7.6, 7.1], tgt: [0.05, 0.5, -1.6] },
  { t: 71.0, pos: [0.0, 7.6, 7.0], tgt: [0, 0.54, -1.68] },
  { t: 74.2, pos: [0.0, 9.2, 8.2], tgt: [-0.18, 0.2, -1.0] },
  { t: 80.0, pos: [0.0, 9.6, 8.6], tgt: [-0.2, 0.2, -1.02] },
  { t: TOTAL, pos: [0.0, 9.8, 8.8], tgt: [-0.2, 0.2, -1.04] },
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

/** World → screen pixels for the current camera. */
export const projector = (cam: Cam, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.1, 120);
  c.position.copy(cam.pos);
  c.lookAt(cam.tgt);
  c.updateMatrixWorld();
  return (p: [number, number, number]): [number, number, number] => {
    const v = new THREE.Vector3(...p).project(c);
    return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, v.z];
  };
};
