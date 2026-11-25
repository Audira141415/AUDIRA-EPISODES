// AE-058 timing: every cut and beat comes from timeline.json (Audio Master Clock, VO seconds).
import * as THREE from "three";
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALL: Word[] = TIMELINE.clips.flatMap((c) => c.words);
/** Start of the n-th (0-based) occurrence of a word. Throws if missing so a script change fails loudly. */
export const at = (word: string, n = 0): number => {
  const hits = ALL.filter((x) => norm(x.w) === norm(word));
  if (!hits[n]) throw new Error(`word not in timeline: ${word}#${n}`);
  return hits[n].s;
};
export const endOf = (word: string, n = 0): number => {
  const hits = ALL.filter((x) => norm(x.w) === norm(word));
  if (!hits[n]) throw new Error(`word not in timeline: ${word}#${n}`);
  return hits[n].e;
};
const clipStart = (id: string) => TIMELINE.clips.find((c) => c.id === id)!.start;

export const B = {
  jarang: at("jarang"),
  l02: clipStart("l02"),
  dibongkar: at("dibongkar"),
  dari: at("dari", 0),
  atas: at("atas"),
  konteks: SEC.KONTEKS[0],
  persetujuan: at("persetujuan"),
  pemda: at("pemda"),
  rencana: at("rencana"),
  warga: at("warga"),
  tahu: at("tahu"),
  mekanisme: SEC.MEKANISME[0],
  memetakan: at("memetakan"),
  struktur: at("struktur"),
  bahan: at("bahan"),
  berbahaya: at("berbahaya"),
  asbes: at("asbes"),
  listrik: at("listrik"),
  air: at("air", 0),
  gas: at("gas"),
  diputus: at("diputus"),
  isi: at("isi"),
  dikosongkan: at("dikosongkan"),
  lalu: at("lalu"),
  dibungkus: at("dibungkus"),
  jaring: at("jaring"),
  terpal: at("terpal"),
  alat: at("alat"),
  dinaikkan: at("dinaikkan"),
  teratas: at("teratas", 0),
  meremukkan: at("meremukkan"),
  beton: at("beton"),
  demi: at("demi"),
  air2: at("air", 1),
  debu: at("debu"),
  dan7: at("dan", 6),
  getaran: at("getaran"),
  tetangga: at("tetangga"),
  dipantau: at("dipantau"),
  reveal: SEC.REVEAL[0],
  jepang: at("jepang"),
  cara: at("cara"),
  lantai3: clipStart("l09"),
  topi: at("topi"),
  tertutup: at("tertutup"),
  diturunkan: at("diturunkan"),
  selesai: at("selesai"),
  dariLuar: clipStart("l10"),
  menyusut: at("menyusut"),
  payoff: SEC.PAYOFF[0],
  implosi: at("implosi"),
  muatan: at("muatan"),
  memutus: at("memutus"),
  kolom: at("kolom"),
  tertentu: at("tertentu"),
  jeda: at("jeda"),
  detik: at("detik"),
  berat2: at("berat", 1),
  merobohkannya: at("merobohkannya"),
  outro: SEC.OUTRO[0],
  kendali: at("kendali"),
  bukan: at("bukan"),
  ini: at("ini"),
  outroCard: SEC.OUTRO[1] + 0.2,
};

// ---------- easing ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const backOut = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const win = (t: number, a: number, b: number, d = 0.3) => Math.min(smooth(ramp(t, a, a + d)), 1 - smooth(ramp(t, b - d, b)));

// ---------- camera shots ----------
// Three sites, only the active one is mounted (each sits at the origin):
//   A = city block (tower 8 x 8, 10 floors = 26 m, neighbours 10.4 / 13 m),
//   B = Japan (16-floor tower with a closed "hat"), C = open lot (implosion).
// 9:16 framing check: fov 40 -> visible height = 0.728 d, width = 0.41 d.
export type V3 = [number, number, number];
export type Site = "A" | "B" | "C";
export type Shot = { name: string; site: Site; a: number; b: number; p0: V3; p1: V3; t0: V3; t1: V3; fov0: number; fov1: number; ease?: (x: number) => number };

export const SHOTS: Shot[] = [
  // HOOK: wide 3/4 of the intact tower in its tight block (tower ~60% of frame height).
  { name: "hook", site: "A", a: 0, b: B.l02, p0: [30, 7, 60], p1: [24, 11, 54], t0: [0, 14, 2], t1: [0, 14.5, 2], fov0: 40, fov1: 40 },
  // "dibongkar pelan-pelan, dari atas": crane up to the roof while the top floors are eaten.
  { name: "hookTop", site: "A", a: B.l02, b: B.konteks, p0: [24, 22, 50], p1: [18, 34, 40], t0: [0, 16, 1], t1: [0, 19, 0], fov0: 40, fov1: 40 },
  // KONTEKS: the paperwork card floats in front of the building, envelopes fly to neighbours.
  { name: "docs", site: "A", a: B.konteks, b: B.mekanisme, p0: [9, 11, 52], p1: [3, 12, 46], t0: [0, 11.5, 10], t1: [0, 11.5, 10], fov0: 40, fov1: 40 },
  // scan: X-ray tower, scan plane sweeps down, asbestos found.
  { name: "scan", site: "A", a: B.mekanisme, b: B.listrik, p0: [40, 20, 50], p1: [48, 22, 32], t0: [0, 14, 0], t1: [0, 13, 0], fov0: 40, fov1: 40 },
  // utilities cut at the street cabinet.
  { name: "utility", site: "A", a: B.listrik, b: B.isi, p0: [-16, 13, 25], p1: [-13, 12, 22], t0: [3.6, 4.6, 6.8], t1: [3.8, 5.0, 6.8], fov0: 40, fov1: 40 },
  // empty: furniture leaves floor by floor, crates down the chute into the truck.
  { name: "empty", site: "A", a: B.isi, b: B.lalu, p0: [-16, 12, 44], p1: [-20, 14, 48], t0: [-1, 10, 5], t1: [-1, 11, 5], fov0: 40, fov1: 40 },
  // wrap: scaffold + net + tarp grow up the tower, pull back wide.
  { name: "wrap", site: "A", a: B.lalu, b: B.alat, p0: [-22, 14, 50], p1: [-26, 20, 60], t0: [0, 12, 2], t1: [0, 14, 2], fov0: 40, fov1: 40 },
  // lift: whole crane truck in frame, excavator rises to the roof.
  { name: "lift", site: "A", a: B.alat, b: B.meremukkan, p0: [-30, 16, 70], p1: [-26, 24, 72], t0: [4, 14, 4], t1: [3, 17, 4], fov0: 40, fov1: 40 },
  // crush: down onto the work level, floor by floor.
  { name: "crush", site: "A", a: B.meremukkan, b: B.air2, p0: [-24, 38, 44], p1: [-21, 33, 40], t0: [0, 20, 0], t1: [0, 18.5, 0], fov0: 40, fov1: 40 },
  // spray: mist cannon arc from the street to the work level.
  { name: "spray", site: "A", a: B.air2, b: B.dan7, p0: [-24, 10, 46], p1: [-20, 14, 42], t0: [-2, 12, 4], t1: [-2, 13, 3], fov0: 40, fov1: 40 },
  // vibration: neighbour wall sensor, building still being taken down behind.
  { name: "vibe", site: "A", a: B.dan7, b: B.reveal, p0: [-21, 8, 32], p1: [-18, 9, 28], t0: [-4.5, 7.5, 3], t1: [-4.5, 8.5, 3], fov0: 40, fov1: 40 },
  // REVEAL: Japan, establishing the tower with its hat.
  { name: "japan", site: "B", a: B.reveal, b: B.lantai3, p0: [40, 26, 80], p1: [34, 30, 74], t0: [0, 22, 0], t1: [0, 24, 0], fov0: 40, fov1: 40 },
  // hat: closer on the top, hat closes, lowers one floor.
  { name: "hat", site: "B", a: B.lantai3, b: B.dariLuar, p0: [26, 46, 40], p1: [22, 42, 34], t0: [0, 38, 0], t1: [0, 36, 0], fov0: 40, fov1: 40 },
  // shrink: wide time-lapse, the tower looks like it shrinks.
  { name: "shrink", site: "B", a: B.dariLuar, b: B.payoff, p0: [46, 22, 84], p1: [50, 20, 90], t0: [0, 20, 0], t1: [0, 18, 0], fov0: 40, fov1: 40 },
  // PAYOFF: open lot, aerial with the exclusion ring.
  { name: "lot", site: "C", a: B.payoff, b: B.muatan, p0: [62, 58, 96], p1: [54, 50, 86], t0: [0, 6, 4], t1: [0, 8, 2], fov0: 40, fov1: 40 },
  // columns: low on the wrapped ground-floor columns, small sequential flashes.
  { name: "columns", site: "C", a: B.muatan, b: B.berat2, p0: [17, 7, 32], p1: [13, 6, 27], t0: [0, 5, 0], t1: [0, 4.6, 0], fov0: 40, fov1: 40 },
  // collapse: straight down under its own weight, dust cloud.
  { name: "collapse", site: "C", a: B.berat2, b: B.outro, p0: [38, 18, 62], p1: [44, 20, 70], t0: [0, 13, 0], t1: [0, 9, 0], fov0: 40, fov1: 40 },
  // OUTRO: back to the city block, cleared lot, dolly in to the AUDIRA hoarding board.
  { name: "outro", site: "A", a: B.outro, b: B.ini, p0: [14, 13, 46], p1: [3.4, 5.6, 25], t0: [-0.4, 6, 2], t1: [-0.4, 2.9, 6], fov0: 40, fov1: 40, ease: inOut },
  { name: "outro", site: "A", a: B.ini, b: TOTAL + 1, p0: [3.4, 5.6, 25], p1: [2.6, 5.2, 23], t0: [-0.4, 2.9, 6], t1: [-0.4, 2.8, 6], fov0: 40, fov1: 40, ease: (x) => x },
];

export const shotAt = (t: number) => {
  const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  const e = s.ease ?? smooth;
  const k = e(clamp01((t - s.a) / (s.b - s.a)));
  const lerp3 = (a: V3, b: V3): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  return { name: s.name, site: s.site, pos: lerp3(s.p0, s.p1), target: lerp3(s.t0, s.t1), fov: mix(s.fov0, s.fov1, k) };
};

/** Project a world point to pixels for the HUD, with the same camera as the 3D frame. */
export const project = (t: number, p: V3, w: number, h: number) => {
  const pose = shotAt(t);
  const c = new THREE.PerspectiveCamera(pose.fov, w / h, 1, 600);
  c.position.set(...pose.pos);
  c.lookAt(...pose.target);
  c.updateMatrixWorld(true);
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1 };
};

// ---------- story state ----------
export const FLOOR = 2.6;
export const A_FLOORS = 10;

/** Site A tower: remaining floors (continuous; fraction = the work level being eaten). */
export const floorsA = (t: number) => {
  if (t < B.l02) return A_FLOORS;
  if (t < B.konteks) return A_FLOORS - 3 * smooth(ramp(t, B.dibongkar - 0.2, B.atas + 0.6));
  if (t < B.meremukkan) return A_FLOORS;
  if (t < B.outro) {
    const s1 = smooth(ramp(t, B.beton - 0.15, B.demi - 0.1));
    const s2 = smooth(ramp(t, B.demi - 0.05, B.demi + 0.75));
    const slow = ramp(t, B.air2, B.reveal) * 0.9;
    return A_FLOORS - 0.25 * smooth(ramp(t, B.meremukkan, B.beton)) - 0.75 * s1 - s2 - slow;
  }
  return 0;
};

/** Site B (Japan): floors under the hat. */
export const B_FLOORS = 16;
export const floorsB = (t: number) => {
  let n = B_FLOORS - 1; // top floor became the hat
  // one cycle on "diturunkan ... satu lantai selesai"
  n -= smooth(ramp(t, B.diturunkan + 0.4, B.selesai + 0.3));
  // time-lapse: five more floors, stepwise
  for (let i = 0; i < 5; i++) {
    const a = B.dariLuar + 0.3 + i * 0.5;
    n -= smooth(ramp(t, a, a + 0.38));
  }
  return n;
};

/** Site C: implosion clock (seconds since columns are cut), sequential flash times. */
export const FLASH_T = Array.from({ length: 6 }, (_, i) => B.jeda + i * ((B.detik + 0.35 - B.jeda) / 6));
export const COLLAPSE_T0 = B.berat2 - 0.15;
