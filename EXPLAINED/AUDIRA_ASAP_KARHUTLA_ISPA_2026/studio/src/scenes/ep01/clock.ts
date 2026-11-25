// EP01 Audio Master Clock: every beat, cut and camera key is read from timeline.json word times.
import * as THREE from "three";
import TL from "./timeline.json";
import { W, heightAt } from "./terrain.ts";
import { TIMIKA, MERAUKE } from "./world.ts";

export type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; words: Word[] };
export const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
export const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;

const word = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i];
export const Ws = (id: string, i: number) => word(id, i).s;
export const We = (id: string, i: number) => word(id, i).e;

export const sm = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};
export const seg = (t: number, a: number, b: number) => sm((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
export const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

// Named beats (word index into each clip)
export const T = {
  lebih: Ws("hook", 0),
  tapiH: Ws("hook", 8),
  dinas: Ws("hook", 9),
  bukanH: Ws("hook", 14),
  sejak: Ws("konteks", 0),
  timika: Ws("konteks", 3),
  apinya: Ws("konteks", 7),
  papuaS: Ws("konteks", 13),
  merauke: Ws("konteks", 16),
  pesawat: Ws("konteks", 17),
  sekolah: Ws("konteks", 23),
  angka: Ws("pengembangan", 0),
  agu1: Ws("pengembangan", 4),
  okt: Ws("pengembangan", 10),
  sejakJan: Ws("pengembangan", 16),
  tapiP: Ws("pengembangan", 19),
  agu2: Ws("pengembangan", 22),
  asapBelum: Ws("pengembangan", 24),
  dan: Ws("pengembangan", 27),
  tahunLalu: Ws("pengembangan", 28),
  angkanya: Ws("pengembangan", 33),
  kata: Ws("penjelasan", 0),
  ispa: Ws("penjelasan", 3),
  sepuluh: Ws("penjelasan", 7),
  kebanyakan: Ws("penjelasan", 12),
  batuk: Ws("penjelasan", 14),
  flu: Ws("penjelasan", 16),
  debu: Ws("penjelasan", 19),
  asapD: Ws("penjelasan", 22),
  memperberat: Ws("penjelasan", 25),
  asma: Ws("penjelasan", 29),
  tbc: Ws("penjelasan", 30),
  pneu: Ws("penjelasan", 31),
  jadi: Ws("penjelasan", 32),
  kasus: Ws("penjelasan", 35),
  bukanO: Ws("penjelasan", 36),
  tidak: Ws("penjelasan", 40),
  bupati: Ws("payoff", 0),
  johannes: Ws("payoff", 2),
  meminta: Ws("payoff", 4),
  memperhatikan: Ws("payoff", 13),
  awalNov: Ws("payoff", 17),
  membaik: Ws("payoff", 21),
  tapiT: Ws("payoff", 22),
  naik: Ws("payoff", 28),
  selama: Ws("payoff", 29),
  pakai: Ws("outro", 0),
  segera: Ws("outro", 5),
  ini: Ws("outro", 10),
};

// ---------------------------------------------------------------- chart frame (world units)
// A vertical briefing board standing over the Arafura Sea, south of Timika, facing south.
export const CHART = { x: -1.5, y: 0.55, z: 0.6, w: 3.0, h: 2.6, weeks: 44, vmax: 90000 };
export const chartX = (week: number) => -CHART.w / 2 + (week / CHART.weeks) * CHART.w;
export const chartY = (v: number) => (v / CHART.vmax) * CHART.h;
export const chartWorld = (week: number, v: number): [number, number, number] => [CHART.x + chartX(week), CHART.y + chartY(v), CHART.z];
// Data (Dinkes Mimika): cumulative ISPA cases 2026; week 35 = end of August; 14 Oct; 30 Oct.
export const D26: [number, number][] = [[0, 0], [35, 63856], [43.3, 81355]];
export const D25: [number, number][] = [[0, 0], [35, 61758]];
export const SMOKE_WEEK = 38.4; // smoke over Timika from late September

// "10 besar penyakit" tower near the Mimika coast, between the board and Timika.
export const TOWER = (() => {
  const [x, z] = W(136.75, -5.05);
  return { x, z, y: 0.3 };
})();

// ---------------------------------------------------------------- camera keys
type Key = { t: number; p: [number, number, number]; d: number; el: number; yaw: number };
const G = (lon: number, lat: number, lift = 0): [number, number, number] => {
  const [x, z] = W(lon, lat);
  return [x, Math.max(0, heightAt(lon, lat)) + lift, z];
};
const CH = (week: number, y: number): [number, number, number] => [CHART.x + chartX(week), y, CHART.z];
const TW = (y: number): [number, number, number] => [TOWER.x, y, TOWER.z];

const KEYS: Key[] = [
  // HOOK: cover framing, then a dolly down onto Mimika
  { t: 0, p: G(138.6, -6.05), d: 23.5, el: 62, yaw: -8 },
  { t: T.tapiH - 0.3, p: G(137.5, -5.1), d: 14, el: 56, yaw: -4 },
  { t: SEC.HOOK[1], p: G(...TIMIKA, 0.05), d: 6.6, el: 48, yaw: 4 },
  // KONTEKS: low in the haze, follow the plume upwind to Merauke, ride the wind back
  { t: T.apinya - 0.2, p: G(...TIMIKA, 0.05), d: 4.2, el: 34, yaw: 12 },
  { t: T.papuaS, p: G(138.3, -6.4), d: 8.5, el: 48, yaw: 6 },
  { t: T.merauke + 0.5, p: G(140.0, -8.0), d: 7.6, el: 50, yaw: -2 },
  { t: T.pesawat + 0.55, p: G(137.6, -5.4), d: 5.2, el: 40, yaw: -8 },
  { t: T.sekolah - 0.2, p: G(...TIMIKA, 0.12), d: 2.1, el: 33, yaw: -18 },
  { t: SEC.KONTEKS[1], p: [W(TIMIKA[0] - 0.02, TIMIKA[1] - 0.04)[0], 0.05, W(TIMIKA[0] - 0.02, TIMIKA[1] - 0.04)[1]], d: 1.15, el: 24, yaw: -28 },
  // PENGEMBANGAN: rise through the haze onto the board, track the curve
  { t: T.angka + 0.55, p: CH(22, 1.45), d: 16, el: 12, yaw: -7 },
  { t: T.agu1 + 0.2, p: CH(22, 1.5), d: 13, el: 6, yaw: -9.5 },
  { t: T.okt + 0.4, p: CH(24, 1.62), d: 11.8, el: 5, yaw: -6.5 },
  { t: T.sejakJan + 0.3, p: CH(22, 1.55), d: 12.4, el: 5, yaw: -11.5 },
  { t: T.tapiP + 0.4, p: CH(23, 1.52), d: 12.8, el: 5, yaw: -10 },
  { t: T.asapBelum + 0.6, p: CH(25, 1.62), d: 11.6, el: 4, yaw: -9 },
  { t: T.angkanya, p: CH(23, 1.55), d: 12.8, el: 6, yaw: -12.5 },
  { t: SEC.PENGEMBANGAN[1], p: CH(22, 1.52), d: 12, el: 7, yaw: -13 },
  // PENJELASAN: through the board to the ranking tower, slow orbit
  { t: T.kata + 0.3, p: TW(0.66), d: 7.0, el: 12, yaw: -20 },
  { t: T.kebanyakan, p: TW(0.65), d: 6.3, el: 14, yaw: -8 },
  { t: T.asapD, p: TW(0.65), d: 6.5, el: 11, yaw: 5 },
  { t: T.jadi, p: TW(0.6), d: 7.2, el: 12, yaw: 15 },
  { t: T.tidak, p: TW(0.55), d: 8.8, el: 20, yaw: 22 },
  // PAYOFF: crane out to orbit, Timika clears, Merauke flares, smoke flows again
  { t: T.johannes, p: G(138.0, -5.9), d: 15, el: 50, yaw: 10 },
  { t: T.memperhatikan, p: G(138.4, -6.3), d: 22, el: 60, yaw: -4 },
  { t: T.awalNov - 0.2, p: G(138.1, -6.1), d: 20.5, el: 58, yaw: 0 },
  { t: T.membaik, p: G(...TIMIKA, 0.05), d: 8, el: 46, yaw: 6 },
  { t: T.naik, p: G(...MERAUKE), d: 8.6, el: 50, yaw: -4 },
  { t: SEC.PAYOFF[1], p: G(138.6, -6.6), d: 14, el: 55, yaw: -10 },
  // OUTRO: high hold over Mimika and the in-world AUDIRA plate
  { t: OUTRO_AT, p: G(137.6, -6.3), d: 13.5, el: 60, yaw: -14 },
  { t: TOTAL + 0.5, p: G(137.6, -6.3), d: 12.8, el: 62, yaw: -16 },
];

// Cubic Hermite through the keys with damped Catmull-Rom tangents: never stops between keys.
const hermite = (t: number, get: (k: Key) => number) => {
  const n = KEYS.length;
  let i = 0;
  while (i < n - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const pa = KEYS[Math.max(0, i - 1)], pb = KEYS[Math.min(n - 1, i + 2)];
  const h = b.t - a.t;
  const u = Math.max(0, Math.min(1, (t - a.t) / h));
  const damp = 0.55;
  const m0 = i === 0 ? 0 : ((get(b) - get(pa)) / (b.t - pa.t)) * h * damp;
  const m1 = i + 1 === n - 1 ? 0 : ((get(pb) - get(a)) / (pb.t - a.t)) * h * damp;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * get(a) + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * get(b) + (u3 - u2) * m1;
};

export const FOV = 34;
export const camAt = (t: number) => {
  const tx = hermite(t, (k) => k.p[0]);
  const ty = hermite(t, (k) => k.p[1]);
  const tz = hermite(t, (k) => k.p[2]);
  const d = Math.max(0.6, hermite(t, (k) => k.d));
  const el = (hermite(t, (k) => k.el) * Math.PI) / 180;
  const yaw = ((hermite(t, (k) => k.yaw) + t * 0.35) * Math.PI) / 180; // constant slow drift
  const target = new THREE.Vector3(tx, ty, tz);
  const pos = new THREE.Vector3(tx + Math.sin(yaw) * Math.cos(el) * d, ty + Math.sin(el) * d, tz + Math.cos(yaw) * Math.cos(el) * d);
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.02, 80);
  cam.position.copy(pos);
  cam.lookAt(target);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return { pos, target, cam, d };
};

/** Project a world point into 1080x1920 overlay space; `z` > 1 means behind the camera. */
export const projW = (cam: THREE.PerspectiveCamera, x: number, y: number, z: number) => {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, z: v.z };
};
export const projG = (cam: THREE.PerspectiveCamera, lon: number, lat: number, lift = 0) => {
  const [x, z] = W(lon, lat);
  return projW(cam, x, Math.max(0, heightAt(lon, lat)) + lift, z);
};

// ---------------------------------------------------------------- world states
/** Smoke opacity and how far along the path it has flowed (0..1). */
export const smokeState = (t: number) => {
  let amt = 1;
  amt *= 1 - 0.95 * win(t, T.agu2 - 0.2, T.dan + 0.6, 0.7, 0.8); // "akhir Agustus, asap belum datang"
  amt *= 1 - 0.85 * seg(t, T.awalNov, T.membaik + 0.3); // early November: air clears
  const regrow = seg(t, T.selama - 0.4, SEC.OUTRO[0] + 1.5);
  const cleared = seg(t, T.awalNov, T.membaik + 0.3);
  const flow = cleared > 0 ? lerp(1, 0.22, cleared) + regrow * 0.58 : 1;
  // the fire-side smoke (t < 0.3) never fully clears; Timika's end does
  return { amt: Math.max(amt, regrow * 0.9), flow: Math.min(1, flow), src: Math.max(amt, 0.75 * cleared) };
};
/** Hotspot intensity: 1 = cover; dims in early November, flares above 1 when it rises again. */
export const hotState = (t: number) => 1 - 0.45 * seg(t, T.awalNov, T.membaik) + 0.95 * seg(t, T.tapiT, T.naik + 0.4);
