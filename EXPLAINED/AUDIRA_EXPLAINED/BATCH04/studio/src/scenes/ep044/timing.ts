// AE-044 timing: every beat and cut comes from timeline.json (Audio Master Clock, VO seconds).
import * as THREE from "three";
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALL: Word[] = TIMELINE.clips.flatMap((c) => c.words);
/** Start time of the n-th (0-based) occurrence of a word in the VO. Throws if missing so a script change fails loudly. */
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

// ---------- beats ----------
export const B = {
  hookSimTray: at("baki"),
  itulah: at("itulah"),
  esimTitle: at("esim", 0),
  chipnya: at("chipnya"),
  disolder: at("disolder"),
  pabrik: at("pabrik"),
  kosong: at("kosong"),
  mekanisme: SEC.MEKANISME[0],
  operator: at("operator", 0),
  profil1: at("profil", 0),
  server1: at("server", 0),
  qr: at("qr"),
  pindai1: at("pindai", 0),
  tidak1: at("tidak", 0),
  hanya1: at("hanya", 0),
  alamat: at("alamat"),
  kode: at("kode"),
  ponsel2: at("ponsel", 1),
  menjemput: at("menjemput"),
  chip2: at("chip", 0),
  sertifikat: at("sertifikat"),
  profil3: at("profil", 2),
  terenkripsi: at("terenkripsi"),
  masukChip: at("chip", 1),
  reveal: SEC.REVEAL[0],
  beberapa: at("beberapa"),
  hanya2: at("hanya", 1),
  satu2: at("satu", 1),
  dua: at("dua", 0),
  payoff: SEC.PAYOFF[0],
  imbauan: at("imbauan"),
  belum2: at("belum", 1),
  sejak2: at("sejak", 1),
  pelanggan: at("pelanggan"),
  wajah: at("wajah"),
  dan3: at("dan", 3),
  tidak2: at("tidak", 1),
  mendukung: at("mendukung"),
  outro: SEC.OUTRO[0],
  hilang: at("hilang"),
  nomormu2: at("nomormu", 1),
  ini: at("ini"),
  outroCard: SEC.OUTRO[1] + 0.2,
};

// ---------- easing ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const backOut = (x: number, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- camera shots (world units; phone sits at the origin, back facing +z) ----------
export type V3 = [number, number, number];
export type Shot = { name: string; a: number; b: number; p0: V3; p1: V3; t0: V3; t1: V3; fov0: number; fov1: number; ease?: (x: number) => number };

const CHIP_W: V3 = [-0.2, 0.42, 0.101];
const RACK: V3 = [-0.4, 3.25, -2.6];
export const QR_POS: V3 = [2.6, 1.6, 0.6];
export const LINEUP_POS: V3 = [9, 0, 0];

// HOOK: phone rolled diagonally with its left wall (SIM tray) turned toward the lens.
export const HOOK_ROT: V3 = [0, 1.1, 0.45];
const TRAY_LOCAL = new THREE.Vector3(-0.735, 0.62, 0);
export const TRAY_W: V3 = TRAY_LOCAL.clone().applyEuler(new THREE.Euler(...HOOK_ROT)).toArray() as V3;
const HT: V3 = [TRAY_W[0] + 0.1, TRAY_W[1] - 0.12, TRAY_W[2]];
export const HOOK_SIM: V3 = [TRAY_W[0] + 0.42, TRAY_W[1] + 0.2, TRAY_W[2] + 0.75];

export const SHOTS: Shot[] = [
  // HOOK: side view of the closed SIM tray, the card streams in through the closed wall.
  { name: "hook", a: 0, b: SEC.KONTEKS[0], p0: [HT[0] + 0.45, HT[1] + 0.4, HT[2] + 2.5], p1: [HT[0] + 0.75, HT[1] + 0.55, HT[2] + 3.2], t0: HT, t1: [HT[0], HT[1] - 0.05, HT[2]], fov0: 32, fov1: 32 },
  // "Itulah eSIM": orbit to the back while the back glass lifts away.
  { name: "open", a: SEC.KONTEKS[0], b: B.chipnya, p0: [-3.0, 1.3, 9.0], p1: [2.0, 1.0, 9.6], t0: [0, -0.55, 0], t1: [0.05, -0.6, 0], fov0: 32, fov1: 32 },
  // chip macro: dolly in, chip drops and is soldered, then the empty slot.
  { name: "chipMacro", a: B.chipnya, b: SEC.MEKANISME[0], p0: [0.55, 0.95, 1.9], p1: [0.2, 0.75, 1.3], t0: [-0.2, 0.36, 0.1], t1: [-0.2, 0.5, 0.12], fov0: 30, fov1: 30 },
  // server rack, profile is prepared
  { name: "server", a: SEC.MEKANISME[0], b: B.qr, p0: [1.4, 2.6, 2.6], p1: [0.9, 2.9, 1.9], t0: [RACK[0], RACK[1] + 0.1, RACK[2]], t1: [RACK[0], RACK[1], RACK[2]], fov0: 32, fov1: 32 },
  // QR card close-up
  { name: "qr", a: B.qr, b: B.ponsel2, p0: [QR_POS[0] + 0.2, QR_POS[1] + 0.1, QR_POS[2] + 4.5], p1: [QR_POS[0] + 0.05, QR_POS[1], QR_POS[2] + 4.0], t0: [QR_POS[0] - 0.02, QR_POS[1] - 0.35, QR_POS[2]], t1: [QR_POS[0] - 0.02, QR_POS[1] - 0.38, QR_POS[2]], fov0: 32, fov1: 32 },
  // wide: phone (bottom) fetches the profile from the rack (top)
  { name: "wide", a: B.ponsel2, b: B.profil3 - 0.2, p0: [1.6, 1.3, 10.5], p1: [1.1, 1.5, 9.6], t0: [-0.2, 1.35, -0.7], t1: [-0.25, 1.4, -0.8], fov0: 32, fov1: 32 },
  // follow the locked packet down into the chip
  { name: "follow", a: B.profil3 - 0.2, b: SEC.REVEAL[0], p0: [1.1, 1.6, 7.2], p1: [0.5, 0.85, 1.7], t0: [-0.25, 1.3, -0.4], t1: [-0.2, 0.47, 0.1], fov0: 32, fov1: 30, ease: inOut },
  // profile stack above the chip, slow orbit
  { name: "stack", a: SEC.REVEAL[0], b: SEC.PAYOFF[0], p0: [0.5, 2.1, 2.8], p1: [-0.3, 2.15, 2.9], t0: [-0.2, 0.7, 0.25], t1: [-0.2, 0.72, 0.27], fov0: 32, fov1: 32 },
  // phone turns to its screen: "imbauan"
  { name: "screen", a: SEC.PAYOFF[0], b: B.sejak2, p0: [0.6, 0.3, 10.2], p1: [0.4, 0.2, 9.4], t0: [0, -0.9, 0], t1: [0, -0.85, 0], fov0: 32, fov1: 32 },
  // face scan on screen
  { name: "face", a: B.sejak2, b: B.dan3, p0: [-0.3, 0.3, 8.0], p1: [-0.15, 0.25, 7.3], t0: [0, -0.4, 0], t1: [0, -0.35, 0], fov0: 32, fov1: 32 },
  // not every phone supports eSIM
  { name: "lineup", a: B.dan3, b: SEC.OUTRO[0], p0: [LINEUP_POS[0] + 0.5, 0.6, 9.4], p1: [LINEUP_POS[0] + 0.25, 0.45, 8.6], t0: [LINEUP_POS[0], -0.45, 0], t1: [LINEUP_POS[0], -0.45, 0], fov0: 32, fov1: 32 },
  // outro hero (cover composition), card disappears, number stays
  { name: "outro", a: SEC.OUTRO[0], b: TOTAL + 1, p0: [3.3, 1.15, 7.2], p1: [3.8, 1.35, 8.2], t0: [-0.05, -0.55, 0], t1: [0, -0.6, 0], fov0: 32, fov1: 32 },
];

export const RACK_POS = RACK;
export const CHIP_WORLD = CHIP_W;

export const shotAt = (t: number) => {
  const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  const e = s.ease ?? smooth;
  const k = e(clamp01((t - s.a) / (s.b - s.a)));
  const lerp3 = (a: V3, b: V3): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  return { name: s.name, pos: lerp3(s.p0, s.p1), target: lerp3(s.t0, s.t1), fov: mix(s.fov0, s.fov1, k) };
};

/** Project a world point to pixels for the HUD, using the same camera as the 3D frame. */
export const project = (t: number, p: V3, w: number, h: number) => {
  const pose = shotAt(t);
  const c = new THREE.PerspectiveCamera(pose.fov, w / h, 0.03, 100);
  c.position.set(...pose.pos);
  c.lookAt(...pose.target);
  c.updateMatrixWorld(true);
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1 };
};
