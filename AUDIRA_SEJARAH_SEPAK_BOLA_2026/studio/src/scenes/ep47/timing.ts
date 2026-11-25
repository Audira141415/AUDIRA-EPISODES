// EP47 timing. Every beat is read from the locked VO (timeline.json, Audio Master Clock).
// VO: _tools/vo.py build --tempo 0.94 → speech 83.00 s, film 87.00 s (outro card after the last word).
// Camera: one Catmull-Rom per visual scene; scenes meet at fog-wipe cuts (CUTS). Opens on the cover pose.
import * as THREE from "three";
import tl from "./timeline.json";
import { CAM_POS, CAM_TARGET } from "./world.ts";
import { LISBON, M, P, S, TURIN, type V3 } from "./set.ts";

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

// ---------------------------------------------------------------- beats (storyboard → VO word)
export const T = {
  // hook — fog over Superga, chip "4 MEI 1949"
  mei1949: W("hook", 0, "Empat"),
  terbaik: W("hook", 7, "tim"),
  kabut: W("hook", 13, "kabut"),
  audira: W("hook", 17, "Ini"),
  // konteks — valley pitch, five shields, 11 figures
  grande: W("konteks", 1, "Grande"),
  limaKali: W("konteks", 7, "lima"),
  perang: W("konteks", 13, "terhenti"),
  y47: W("konteks", 16, "Tahun"),
  hungaria: W("konteks", 22, "Hungaria"),
  sepuluh: W("konteks", 24, "sepuluh"),
  kiper: W("konteks", 30, "kipernya"),
  // pengembangan — Mazzola card, map Turin → Lisbon
  mazzola: W("pengembangan", 3, "Valentino"),
  topSkor: W("pengembangan", 5, "top"),
  awalMei: W("pengembangan", 17, "Awal"),
  terbang: W("pengembangan", 23, "terbang"),
  lisbon: W("pengembangan", 25, "Lisbon"),
  benfica: W("pengembangan", 30, "Benfica"),
  ferreira: W("pengembangan", 35, "Francisco"),
  // penjelasan — back to Superga, fog thickens, HUD, basilica, counter 31 (no aircraft on screen)
  pulang: W("penjelasan", 0, "Dalam"),
  kabutTebal: W("penjelasan", 3, "kabut"),
  jarak: W("penjelasan", 7, "Jarak"),
  m40: W("penjelasan", 11, "empat"),
  dugaan: W("penjelasan", 14, "Dugaan"),
  altimeter: W("penjelasan", 19, "altimeter"),
  jam1703: W("penjelasan", 22, "Pukul"),
  basilika: W("penjelasan", 32, "Basilika"),
  n31: W("penjelasan", 34, "Tiga"),
  n18: W("penjelasan", 44, "delapan"),
  // payoff — champions board, junior teams, mourners, Tomà / Novo
  duaHari: W("payoff", 0, "Dua"),
  juara: W("payoff", 5, "juara"),
  junior: W("payoff", 6, "Empat"),
  lawanJunior: W("payoff", 12, "dan"),
  ratusanRibu: W("payoff", 19, "Ratusan"),
  toma: W("payoff", 25, "Sauro"),
  novo: W("payoff", 36, "Presiden"),
  // outro — memorial, 18 candles, basilica golden hour, AUDIRA card
  limaGelar: W("outro", 0, "Lima"),
  delapanBelas: W("outro", 3, "delapan"),
  bukit: W("outro", 6, "satu"),
  menurut: W("outro", 9, "Menurutmu"),
  ikuti: W("outro", 23, "ikuti"),
};

// ---------------------------------------------------------------- scenes + cuts
// Seven visual scenes; each cut is hidden in a fog veil (Stage haze) — the film's own motif.
export type SceneId = "hook" | "pitch" | "map" | "fog" | "dusk" | "street" | "memorial";
const mid = (a: number, b: number) => (a + b) / 2;
export const CUTS: { t: number; to: SceneId }[] = [
  { t: mid(SEC.HOOK[1], SEC.KONTEKS[0]), to: "pitch" },
  { t: T.awalMei - 0.12, to: "map" },
  { t: mid(SEC.PENGEMBANGAN[1], SEC.PENJELASAN[0]), to: "fog" },
  { t: mid(SEC.PENJELASAN[1], SEC.PAYOFF[0]), to: "dusk" },
  { t: T.ratusanRibu - 0.12, to: "street" },
  { t: mid(SEC.PAYOFF[1], SEC.OUTRO[0]), to: "memorial" },
];
export const sceneAt = (t: number): SceneId => {
  let s: SceneId = "hook";
  for (const c of CUTS) if (t >= c.t) s = c.to;
  return s;
};
/** Fog veil 0..1 around each cut (full at the cut itself). */
export const veilAt = (t: number) => CUTS.reduce((m, c) => Math.max(m, 1 - smooth(Math.abs(t - c.t) / 0.34)), 0);

// ---------------------------------------------------------------- camera
// Must equal the Cover camera so the film opens on the approved cover (audit:cover).
export const COVER_CAM = { pos: CAM_POS, tgt: CAM_TARGET, fov: 40 };
type Key = { t: number; pos: V3; tgt: V3; fov?: number };
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const C = CUTS.map((c) => c.t);
const mapY = 0;
const turin: V3 = [TURIN[0], mapY, TURIN[1]];
const lisbon: V3 = [LISBON[0], mapY, LISBON[1]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const SHOTS: Record<SceneId, Key[]> = {
  // 1 Hook: the cover, a slow dolly in while the mist climbs
  hook: [
    { t: 0, pos: CAM_POS, tgt: CAM_TARGET },
    { t: C[0], pos: lerp3(CAM_POS, CAM_TARGET, 0.13), tgt: add(CAM_TARGET, [0, -2, 0]) },
  ],
  // 2 Context + Mazzola: orbit left → right past the shields, then push in on No. 10
  pitch: [
    { t: C[0], pos: P(-21, 7.5, 27), tgt: P(0, 2.4, -8) },
    { t: T.limaKali + 1.0, pos: P(-13, 3.0, 2), tgt: P(1.5, 2.3, -9) },
    { t: T.y47, pos: P(-5, 3.4, 17), tgt: P(0, 2.0, -4) },
    { t: T.kiper, pos: P(6, 2.4, 13.5), tgt: P(-1, 1.4, 0) },
    { t: T.mazzola + 0.4, pos: P(0, 1.95, 7.8), tgt: P(0, 1.5, 0) },
    { t: T.topSkor + 2.2, pos: P(0, 1.8, 4.6), tgt: P(0, 1.55, 0) },
    { t: C[1], pos: P(0.3, 9.5, 7.5), tgt: P(0, 1.4, -5) },
  ],
  // 3 Route: over Turin, follow the arc to Lisbon, settle on Lisbon
  map: [
    { t: C[1], pos: add(turin, [12, 46, 22]), tgt: add(turin, [0, 0, -2]) },
    { t: T.lisbon + 0.2, pos: [8, 118, 92], tgt: [0, 0, 6] },
    { t: T.benfica + 0.3, pos: add(lisbon, [26, 58, 62]), tgt: add(lisbon, [2, 0, 0]) },
    { t: C[2], pos: add(lisbon, [18, 40, 46]), tgt: add(lisbon, [0, 0, -1]) },
  ],
  // 4 Fog: back on Superga, a slow approach to the basilica as the fog closes in
  fog: [
    { t: C[2], pos: S(300, -120, 172), tgt: [0, 128, 0] },
    { t: T.jarak, pos: S(262, -108, 160), tgt: [0, 130, 0] },
    { t: T.jam1703, pos: S(205, -90, 148), tgt: [0, 132, 0] },
    { t: T.n31, pos: S(158, -72, 140), tgt: [0, 134, 0] },
    { t: C[3], pos: S(128, -60, 137), tgt: [0, 135, 0] },
  ],
  // 5 Payoff pitch at dusk: champions board, the two junior lines
  dusk: [
    { t: C[3], pos: P(-7, 3.2, 9), tgt: P(0, 4.2, -15) },
    { t: T.juara + 0.5, pos: P(-4.5, 2.8, 7.5), tgt: P(0, 4.0, -15) },
    { t: T.junior + 0.6, pos: P(-8, 2.8, 10.5), tgt: P(0, 1.4, -2) },
    { t: T.lawanJunior + 0.8, pos: P(6, 3.0, 10), tgt: P(0, 1.2, -1) },
    { t: C[4], pos: P(10, 9, 15), tgt: P(0, 2, -6) },
  ],
  // 6 Turin avenue: a slow track forward over the sea of mourners, Superga at the end of the street
  street: [
    { t: C[4], pos: P(0, 17, 352), tgt: P(0, 4, 255) },
    { t: T.toma, pos: P(1.5, 14, 330), tgt: P(0, 5, 220) },
    { t: C[5], pos: P(2.5, 11.5, 306), tgt: P(0, 8, 150) },
  ],
  // 7 Outro: the candles, then crane back up to the cover pose
  memorial: [
    { t: C[5], pos: M(2.6, 2.6, 13.5), tgt: M(0, 1.7, -0.6) },
    { t: T.bukit, pos: M(-1.8, 3.4, 15.5), tgt: M(0, 2.0, -1.0) },
    { t: T.menurut + 1.6, pos: M(-3.5, 9, 22), tgt: M(0, 7, -30) },
    { t: T.menurut + 3.4, pos: CAM_POS, tgt: CAM_TARGET },
    { t: OUTRO_AT, pos: add(CAM_POS, [0, 3.5, 7]), tgt: CAM_TARGET },
    { t: TOTAL, pos: add(CAM_POS, [0, 6, 13]), tgt: CAM_TARGET },
  ],
};

const curves = Object.fromEntries(
  (Object.keys(SHOTS) as SceneId[]).map((id) => {
    const K = SHOTS[id];
    const v = (p: V3) => new THREE.Vector3(...p);
    const mk = (pts: THREE.Vector3[]) => (pts.length > 2 ? new THREE.CatmullRomCurve3(pts, false, "centripetal") : null);
    return [id, { K, pos: mk(K.map((k) => v(k.pos))), tgt: mk(K.map((k) => v(k.tgt))) }];
  }),
) as Record<SceneId, { K: Key[]; pos: THREE.CatmullRomCurve3 | null; tgt: THREE.CatmullRomCurve3 | null }>;

export type Cam = { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number; scene: SceneId };
export const camAt = (t: number): Cam => {
  const scene = sceneAt(t);
  const { K, pos, tgt } = curves[scene];
  if (t <= 0) return { pos: new THREE.Vector3(...CAM_POS), tgt: new THREE.Vector3(...CAM_TARGET), fov: 40, scene };
  const n = K.length - 1;
  let i = 0;
  while (i < n - 1 && t > K[i + 1].t) i++;
  const k = clamp((t - K[i].t) / (K[i + 1].t - K[i].t));
  const e = 0.35 * k + 0.65 * smooth(k);
  if (!pos || !tgt) {
    const a = K[0], b = K[1];
    return { pos: new THREE.Vector3(...lerp3(a.pos, b.pos, e)), tgt: new THREE.Vector3(...lerp3(a.tgt, b.tgt, e)), fov: 40, scene };
  }
  const u = (i + e) / n;
  return { pos: pos.getPoint(u), tgt: tgt.getPoint(u), fov: 40, scene };
};

/** World → design pixels for the current camera. */
export const projector = (cam: Cam, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.5, 30000);
  c.position.copy(cam.pos);
  c.lookAt(cam.tgt);
  c.updateMatrixWorld();
  return (p: V3): [number, number, number] => {
    const v = new THREE.Vector3(...p).project(c);
    return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, v.z];
  };
};
