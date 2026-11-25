// EP05 timing + camera. Every beat is read from the locked VO (timeline.json, Audio Master Clock).
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
  real0: W("hook", 8, "Real"),
  bayern0: W("hook", 11, "Bayern"),
  linfield0: W("hook", 13, "Linfield"),
  // konteks
  linfield1: W("konteks", 0, "Linfield"),
  belfast: W("konteks", 3, "Belfast"),
  lima57: W("konteks", 6, "Lima"),
  rekor1: W("konteks", 11, "rekor"),
  real1: W("konteks", 13, "Real"),
  tiga36: W("konteks", 17, "tiga"),
  enam36: W("konteks", 19, "enam"),
  // pengembangan
  tepat: W("pengembangan", 0, "Tepat"),
  glasgow: W("pengembangan", 8, "Glasgow"),
  celtic: W("pengembangan", 9, "Celtic"),
  rangers: W("pengembangan", 11, "Rangers"),
  seratus: W("pengembangan", 16, "seratus"),
  mei: W("pengembangan", 18, "Mei"),
  menyalip: W("pengembangan", 24, "menyalip"),
  skornya: W("pengembangan", 26, "Skornya"),
  tinggal: W("pengembangan", 37, "tinggal"),
  satu: W("pengembangan", 38, "satu"),
  // penjelasan
  lalu: W("penjelasan", 0, "Lalu"),
  bayern1: W("penjelasan", 8, "Bayern"),
  y2013: W("penjelasan", 14, "2013"),
  y2023: W("penjelasan", 16, "2023"),
  rekorTop: W("penjelasan", 17, "Rekor"),
  bukan: W("penjelasan", 22, "bukan"),
  skonto: W("penjelasan", 25, "Skonto"),
  lincoln: W("penjelasan", 29, "Lincoln"),
  ludo: W("penjelasan", 35, "Ludogorets"),
  masing: W("penjelasan", 38, "masing"),
  tetangga: W("penjelasan", 45, "tetangga"),
  johor: W("penjelasan", 47, "Johor"),
  duaBelas: W("penjelasan", 52, "dua"),
  masih: W("penjelasan", 60, "masih"),
  // payoff
  tapi: W("payoff", 0, "Tapi"),
  rentetan1: W("payoff", 6, "Rentetan"),
  dipatahkan: W("payoff", 8, "dipatahkan"),
  leverkusen: W("payoff", 9, "Leverkusen"),
  tanpaKalah: W("payoff", 12, "tanpa"),
  rentetan2: W("payoff", 16, "Rentetan"),
  ludo2: W("payoff", 17, "Ludogorets"),
  berhenti: W("payoff", 18, "berhenti"),
  sekali: W("payoff", 21, "Juara"),
  terus: W("payoff", 25, "Juara"),
  dinasti: W("payoff", 28, "dinasti"),
  // outro
  ini: W("outro", 0, "Ini"),
  episode: W("outro", 5, "Episode"),
  lahirnya: W("outro", 7, "lahirnya"),
  y1863: W("outro", 12, "1863"),
};

// ---------------------------------------------------------------- camera
// Keys are placed on beats; positions run through centripetal Catmull-Rom so the camera never parks.
type Key = { t: number; pos: [number, number, number]; tgt: [number, number, number] };
export const COVER_CAM = { pos: [0, 4.1, 10.6] as [number, number, number], tgt: [0, 1.3, 0.6] as [number, number, number], fov: 38 };
const K: Key[] = [
  { t: 0, pos: COVER_CAM.pos, tgt: COVER_CAM.tgt },
  { t: 2.6, pos: [0, 3.95, 9.7], tgt: [0, 1.36, 0.6] },
  { t: 5.4, pos: [0.05, 3.45, 7.9], tgt: [0, 1.52, 0.6] },
  { t: 8.2, pos: [0.5, 3.5, 7.4], tgt: [0.45, 1.6, 0.6] },
  { t: 11.4, pos: [0.6, 3.7, 7.9], tgt: [0.55, 1.65, 0.6] },
  { t: 14.3, pos: [0.65, 3.6, 7.9], tgt: [0.62, 1.6, 0.6] },
  { t: 17.4, pos: [0.05, 3.5, 8.5], tgt: [0, 1.45, 0.25] },
  { t: 22.5, pos: [-0.1, 3.5, 8.6], tgt: [0, 1.55, 0.35] },
  { t: 26.2, pos: [-0.15, 3.4, 8.2], tgt: [0, 1.75, 0.4] },
  { t: 31.2, pos: [-0.1, 3.5, 7.6], tgt: [0, 2.05, 0.35] },
  { t: 33.8, pos: [-0.8, 7.3, 5.3], tgt: [-1.0, 0, -0.5] },
  { t: 38.0, pos: [-1.0, 6.9, 4.6], tgt: [-1.15, 0, -0.8] },
  { t: 41.2, pos: [-0.5, 7.2, 4.4], tgt: [-0.45, 0, -1.1] },
  { t: 45.2, pos: [0.05, 6.6, 3.15], tgt: [0, 0, -1.7] },
  { t: 48.9, pos: [0.15, 6.7, 3.25], tgt: [0.1, 0, -1.7] },
  { t: 51.0, pos: [0.85, 6.9, 3.9], tgt: [0.9, 0, -1.2] },
  { t: 54.4, pos: [0.95, 7.1, 4.0], tgt: [1.0, 0, -1.3] },
  // 55–66 s: one continuous move on the near side of the board (no key closer than 1.5 s):
  // crane down-left onto Bayern's lane end, drift right to Levski, sink low behind the JDT lane.
  { t: 56.4, pos: [-0.9, 5.8, 4.6], tgt: [-0.9, 0, -1.0] },
  { t: 57.9, pos: [-1.8, 4.7, 4.4], tgt: [-1.2, 0.05, -1.4] },
  { t: 60.4, pos: [-1.7, 4.5, 4.1], tgt: [-1.15, 0.05, -1.6] },
  { t: 61.9, pos: [-0.2, 4.6, 3.9], tgt: [-0.1, 0.05, -2.0] },
  { t: 63.4, pos: [0.4, 4.2, 3.9], tgt: [0.2, 0.05, -2.1] },
  { t: 66.4, pos: [1.35, 1.25, 4.3], tgt: [1.2, 0.35, -1.8] },
  { t: 70.0, pos: [0.4, 4.2, 7.8], tgt: [0, 2.5, 0.6] },
  { t: 74.4, pos: [0.25, 4.1, 7.2], tgt: [0, 2.55, 0.6] },
  { t: 78.6, pos: [0.15, 4.0, 6.9], tgt: [0, 2.55, 0.6] },
];
const posCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
const tgtCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.tgt)), false, "centripetal");
const uOf = (t: number) => {
  const n = K.length - 1;
  if (t <= K[0].t) return 0;
  for (let i = 0; i < n; i++) {
    if (t <= K[i + 1].t) {
      // ease inside each span a little so speed changes are soft, but never reaches zero
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
  // Catmull-Rom getPoint is parameterised per point when using getPoint (not arc-length) — matches key index.
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
