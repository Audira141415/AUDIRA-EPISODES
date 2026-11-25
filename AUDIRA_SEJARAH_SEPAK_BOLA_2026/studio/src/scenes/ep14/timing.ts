// EP14 timing + camera. Liverpool: Boot Room → Istanbul 2005 comeback.
// RETROWAVE: camera arcs over synthwave grid with CRT TV hero prop.
import * as THREE from "three";
import TL from "./timeline.json";

type StdWord = { text: string; start: number; end: number; scene: string };
type Scene = { id: string; start: number; end: number };
interface Timeline { duration: number; speech_end: number; scenes: Scene[]; words: StdWord[] }

const T_RAW = TL as unknown as Timeline;
const wordsOf = (scene: string) => T_RAW.words.filter((w) => w.scene === scene);

// Clip format kept for Film.tsx caption system
export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

const SEC_MAP: Record<string, string> = {
  hook: "HOOK", konteks: "KONTEKS", pengembangan: "PENGEMBANGAN",
  penjelasan: "PENJELASAN", payoff: "PAYOFF", outro: "OUTRO",
};

export const CLIPS: Clip[] = T_RAW.scenes.map((s) => {
  const ws = wordsOf(s.id);
  return {
    id: s.id,
    section: SEC_MAP[s.id],
    text: ws.map((w) => w.text).join(" "),
    start: s.start,
    end: s.end,
    words: ws.map((w) => ({ w: w.text, s: w.start, e: w.end })),
  };
});

export const TOTAL = T_RAW.duration;
export const VO_END = T_RAW.speech_end;

export const SEC = {} as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
for (const s of T_RAW.scenes) (SEC as any)[SEC_MAP[s.id]] = [s.start, s.end];
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

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

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => { const x = clamp(k); return x * x * (3 - 2 * x); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- beats
export const T = {
  // hook
  bootRoom: W("hook", "Salah"),
  sepatu: W("hook", "sepatu"),
  audira: W("hook", "Ini"),
  // konteks
  namaBoot: W("konteks", "Namanya"),
  shankly: W("konteks", "Bill"),
  anfield: W("konteks", "Anfield"),
  y1959: W("konteks", "Desember"),
  ruangSempit: W("konteks", "Di"),
  meracik: W("konteks", "meracik"),
  // pengembangan
  lahir: W("pengembangan", "Dari"),
  paisley: W("pengembangan", "Bob"),
  fagan: W("pengembangan", "Joe"),
  evans: W("pengembangan", "Roy"),
  tigaPiala: W("pengembangan", "Paisley", 1),
  enamGelar: W("pengembangan", "enam"),
  raja: W("pengembangan", "Liverpool", 1),
  era70: W("pengembangan", "era"),
  // penjelasan (Istanbul 2005)
  budaya: W("penjelasan", "Budaya"),
  mei2005: W("penjelasan", "pada"),
  istanbul: W("penjelasan", "Istanbul"),
  acMilan: W("penjelasan", "AC"),
  maldini: W("penjelasan", "Paolo"),
  crespo: W("penjelasan", "Hern"),
  nolTiga: W("penjelasan", "nol-tiga"),
  // payoff (6-minute comeback)
  enamMenit: W("payoff", "Lalu"),
  gerrard: W("payoff", "Steven"),
  smicer: W("payoff", "Smicer"),
  alonso: W("payoff", "Xabi"),
  tigaTiga: W("payoff", "Tiga-tiga"),
  dudek: W("payoff", "Jerzy"),
  shevchenko: W("payoff", "Shevchenko"),
  penalti: W("payoff", "Lewat"),
  juara5: W("payoff", "Liverpool"),
  permanen: W("payoff", "permanen"),
  // outro
  iniAudira: W("outro", "Ini"),
  berikut: W("outro", "Episode"),
};

// ---------------------------------------------------------------- camera
// RETROWAVE: camera starts at cover position [0,2,4.5], arcs slowly down.
// Must match Cover.tsx opening frame exactly (audit:cover).
export const COVER_CAM = { pos: [0, 2, 4.5] as [number, number, number], tgt: [0, 0, 0] as [number, number, number], fov: 34 };

type Key = { t: number; pos: [number, number, number]; tgt: [number, number, number] };
const K: Key[] = [
  { t: 0, pos: COVER_CAM.pos, tgt: COVER_CAM.tgt },
  { t: 3.5, pos: [0, 2, 4.5], tgt: [0, 0.2, 0] },
  { t: 7.5, pos: [0.8, 1.9, 4.3], tgt: [0.2, 0.1, -0.5] },
  { t: 12.0, pos: [1.2, 1.7, 4.0], tgt: [0.3, 0.15, -0.3] },
  { t: 17.0, pos: [0.6, 1.8, 4.2], tgt: [0.1, 0.1, -0.2] },
  { t: 22.0, pos: [-0.3, 1.6, 4.0], tgt: [-0.1, 0.15, -0.4] },
  { t: 28.0, pos: [-0.8, 1.5, 3.8], tgt: [-0.2, 0.2, -0.6] },
  { t: 34.0, pos: [0, 1.7, 4.2], tgt: [0, 0.1, -0.3] },
  { t: 40.0, pos: [0.5, 1.5, 3.9], tgt: [0.1, 0.2, -0.5] },
  { t: 46.0, pos: [-0.4, 1.4, 3.7], tgt: [-0.1, 0.25, -0.6] },
  { t: 52.0, pos: [0.2, 1.3, 3.6], tgt: [0.05, 0.3, -0.7] },
  { t: 58.0, pos: [-0.2, 1.2, 3.5], tgt: [0, 0.35, -0.8] },
  { t: 64.0, pos: [0.3, 1.15, 3.5], tgt: [0.1, 0.3, -0.6] },
  { t: 70.0, pos: [0, 1.3, 3.7], tgt: [0, 0.2, -0.5] },
  { t: 76.0, pos: [-0.1, 1.5, 4.0], tgt: [0, 0.15, -0.3] },
  { t: 80.0, pos: [0, 1.8, 4.3], tgt: [0, 0.1, -0.1] },
  { t: TOTAL, pos: [0, 2.0, 4.5], tgt: [0, 0, 0] },
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
