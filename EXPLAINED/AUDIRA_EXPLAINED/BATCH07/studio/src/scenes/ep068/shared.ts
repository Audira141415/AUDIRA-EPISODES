// AE-068 shared constants, VO-driven beat times, pipe-jacking state machine and camera interpolation.
// Everything is a pure function of the film time t (seconds, Audio Master Clock = timeline.json).
import * as THREE from "three";
import { CL, SEC, TOTAL, wordT } from "./timing.ts";

export { SEC, TOTAL };
export const OUTRO_START = SEC.OUTRO[1] + 0.2;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ss = (a: number, b: number, x: number) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export const win = (t: number, a: number, b: number, f = 0.3) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// ---------- beats (word onsets) ----------
export const T = {
  pipa: wordT(0, "pipa"), dua: wordT(0, "dua"), lewat: wordT(0, "lewat"), jalan0: wordT(0, "jalan"), tanpa: wordT(0, "tanpa"), aspal: wordT(0, "aspalnya"),
  jalan1: wordT(1, "jalan"), jakarta: wordT(1, "jakarta"), dari: wordT(1, "dari"), lubang1: wordT(1, "lubang"), diam: wordT(1, "diam"),
  padahal: wordT(2, "padahal"), pintu: wordT(2, "pintu"), masuk: wordT(2, "masuk"), keluar: wordT(2, "keluar"),
  teknik: wordT(3, "teknik"), pipe: wordT(3, "pipe"),
  depan: wordT(4, "depan"), mesin: wordT(4, "mesin"), mengikis: wordT(4, "mengikis"),
  lubangD: wordT(5, "lubang"), dongkrak: wordT(5, "dongkrak"), mendorong: wordT(5, "mendorong"), beton: wordT(5, "beton"), satu: wordT(5, "satu"), potong2: wordT(5, "potong."),
  laser: wordT(6, "laser"), lurus: wordT(6, "lurus"), menuju: wordT(6, "menuju"), terima: wordT(6, "terima"),
  proyek: wordT(7, "proyek"), panjangnya: wordT(7, "panjangnya"), duaK: wordT(7, "dua"), seratus: wordT(7, "seratus"), potong189: CL[7].words[17].s, didorong: wordT(7, "didorong"),
  sodetan: wordT(8, "sodetan"), selebar: wordT(8, "selebar"), empat: wordT(8, "empat"), sejauh: wordT(8, "sejauh"), lima: wordT(8, "lima"),
  ada: wordT(9, "ada"), pengeboran: wordT(9, "pengeboran"), horizontal: wordT(9, "horizontal"),
  lubangK: wordT(10, "lubang"), miring: wordT(10, "miring"), permukaan: wordT(10, "permukaan"), diperbesar: wordT(10, "diperbesar"), lalu: wordT(10, "lalu"), ditarik: wordT(10, "ditarik"), melewati: wordT(10, "melewati"),
  atas: wordT(11, "atas"), lintas: wordT(11, "lintas"), bawah: wordT(11, "bawah"), merayap: wordT(11, "merayap"),
  ini: wordT(12, "ini"), audira: wordT(12, "audira"),
};

// ---------- palette ----------
export const C = {
  bg: "#121318",
  plaster: "#E8E5DE",
  asphalt: "#2a2b2f",
  gravel: "#77716a",
  laterite: "#6e3d26",
  clay: "#4b3d31",
  silt: "#2a2520",
  concrete: "#9d988f",
  pipe: "#a19d94",
  steel: "#8d939b",
  orange: "#E2661F",
  yellow: "#F2B630",
  accent: "#FFB703",
  cyan: "#3EE6F2",
  red: "#FF3B30",
  white: "#FFFFFF",
  card: "rgba(16,18,24,0.86)",
};

// ---------- street-world geometry (metres) ----------
export const YP = -6; // pipe axis height
export const RP = 0.9; // pipe outer radius (Ø 1,8 m, DI Panjaitan)
export const RI = 0.72;
export const SEG = 2.43; // segment length
export const MLEN = 3.0; // boring machine length
export const RM = 0.95; // machine radius (slightly larger: overcut)
export const PIT_FLOOR = -7.6;
export const PIT_Z = -3.0; // pits open from z = -3 to the cut face z = 0
export const JP = { x0: -16, x1: -11 }; // jacking (launch) pit interior
export const RPIT = { x0: 12.75, x1: 16 }; // reception pit interior
export const WALL = 0.35;
export const XR0 = -13.72; // thrust ring position with the jacks retracted

// ---------- pipe-jacking schedule ----------
type Ev = { kind: "push" | "ins"; a: number; b: number; from?: number };
const EVS: Ev[] = [
  { kind: "push", a: 0.4, b: 5.6, from: 0.45 },
  { kind: "ins", a: 15.75, b: 18.3 },
  { kind: "push", a: 18.45, b: 21.3 },
  { kind: "ins", a: 21.4, b: 23.15 },
  { kind: "push", a: 23.3, b: 25.4 },
  { kind: "ins", a: 25.45, b: 26.95 },
  { kind: "push", a: 27.0, b: 28.7 },
  { kind: "ins", a: 28.75, b: 29.95 },
  { kind: "push", a: 30.0, b: 31.8 },
  { kind: "ins", a: 53.0, b: 54.6 },
  { kind: "push", a: 54.8, b: 60.6 },
];
const N0 = 4;
export type JackState = { s: number; n: number; lower: number; F: number; R: number; spin: number; pushing: number };
/** s = jack extension (m), n = segments in the string, lower = 0…1 height of the segment being lowered (1 = up, -1 none). */
export const jackState = (t: number): JackState => {
  let s = 0.45 * SEG, n = N0, lower = -1, pushing = 0;
  let adv = 0; // total advance of the string since t = 0
  for (const e of EVS) {
    if (t < e.a) break;
    const u = clamp01((t - e.a) / (e.b - e.a));
    if (e.kind === "push") {
      const s0 = (e.from ?? 0) * SEG;
      const k = u; // hydraulic push: steady
      const sNew = s0 + (SEG - s0) * k;
      adv += sNew - s;
      s = sNew;
      if (u < 1) pushing = 1;
    } else {
      // retract the jacks, then lower the next segment into the gap
      s = SEG * (1 - ss(0, 0.4, u));
      if (u < 1) lower = 1 - ss(0.25, 1, u);
      else { n += 1; s = 0; }
    }
  }
  const R = XR0 + s;
  const F = R + n * SEG + MLEN;
  return { s, n, lower, F, R, spin: t * 2.2, pushing };
};

// ---------- camera ----------
export type Key = { t: number; p: [number, number, number]; q: [number, number, number]; f: number };
const cr = (a: number, b: number, c: number, d: number, u: number) =>
  0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
export const poseFrom = (keys: Key[], t: number) => {
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const k1 = keys[i], k2 = keys[i + 1];
  // a key pair closer than 0.12 s is a cut: do not let the spline bend through the other shot
  let k0 = keys[Math.max(i - 1, 0)], k3 = keys[Math.min(i + 2, keys.length - 1)];
  if (k1.t - k0.t < 0.12) k0 = k1;
  if (k3.t - k2.t < 0.12) k3 = k2;
  const u = clamp01((t - k1.t) / (k2.t - k1.t));
  const ue = u * u * (3 - 2 * u) * 0.4 + u * 0.6;
  const v = (sel: "p" | "q") => new THREE.Vector3(...([0, 1, 2].map((j) => cr(k0[sel][j], k1[sel][j], k2[sel][j], k3[sel][j], ue)) as [number, number, number]));
  return { pos: v("p"), tgt: v("q"), fov: k1.f + (k2.f - k1.f) * ue };
};
export const camFromPose = (p: { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number }) => {
  const cam = new THREE.PerspectiveCamera(p.fov, 1080 / 1920, 0.1, 600);
  cam.position.copy(p.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(p.tgt);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
