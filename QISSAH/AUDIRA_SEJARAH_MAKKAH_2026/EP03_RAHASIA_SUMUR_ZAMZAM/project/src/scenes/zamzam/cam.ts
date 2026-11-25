// EP03 Zamzam camera: one continuous path through every set piece. Keys are anchored to words
// (time.ts `at`) and interpolated with Hermite curves whose tangents are clamped, so the camera never
// stops dead at a key and never overshoots on the long flights between sets.
//
// Fov is given as the REAL 16:9 vertical fov (`wf`); the rig writes the portrait-equivalent value and
// FormatFov converts it for wide renders. In 9:16 the same key shows a narrower, taller slice.

import * as THREE from "three";
import { wideFov } from "../../core/film/format.ts";
import { at, chapter, TOTAL, VO_END } from "./time.ts";

export type V3 = [number, number, number];
export type Key = { t: number; pos: V3; tgt: V3; wf: number; cut?: boolean };

/** Set-piece origins (1 unit = 1 m). The hero cutaway is at the origin. */
export const SET = {
  H: [0, 0, 0] as V3,
  V: [-760, 0, 0] as V3, // c02 valley diorama
  B: [-520, 0, 0] as V3, // c03 buried well
  E: [-290, 0, 0] as V3, // c04 well head through the eras
  P: [360, 0, 0] as V3, // c06 Kudai plant (+ Makkah–Madinah map to its right)
  L: [660, 0, 0] as V3, // c07 laboratory bench
  X: [920, 0, 0] as V3, // c08 export: globe, X-ray, cups
};
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const { H, V, B, E, P, L, X } = SET;

/** Portrait fov that FormatFov turns into the real wide fov `wf`. */
export function portraitFov(wf: number) {
  let lo = 1, hi = 170;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (wideFov(m) < wf) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

const COVER: Omit<Key, "t"> = { pos: [30, 9, 100], tgt: [-15, -11.8, -2], wf: 30 };
const k = (t: number, o: V3, pos: V3, tgt: V3, wf = 32): Key => ({ t, pos: add(o, pos), tgt: add(o, tgt), wf });
/** A hard cut: the camera jumps to this key (between far-apart sets, on a chapter card + whoosh). */
const cut = (t: number, o: V3, pos: V3, tgt: V3, wf = 32): Key => ({ ...k(t, o, pos, tgt, wf), cut: true });
const c = (id: string) => chapter(id);

const KEYS: Key[] = [
  // ---- c00 hook: from the tawaf crowd down through the floor into the cutaway ----
  k(0, H, [52, 42, 70], [11, 4, -46], 34),
  k(at("c00_hook", "Dan hanya sekitar"), H, [34, 14, 52], [6, 0, -22], 34),
  k(at("c00_hook", "tepat di bawah kaki"), H, [22, 3, 34], [2, -3, -6], 36),
  k(at("c00_hook", "ada sebuah sumur"), H, [16, -8, 40], [0, -13, 0], 34),
  k(at("c00_hook", "Pernah ditimba"), H, [9, -11, 26], [0, -14, 0], 32),
  k(at("c00_hook", "Lalu pelan-pelan turun"), H, [7, -1.5, 16], [-1, -2, -2], 40),
  k(at("c00_hook", "diawasi sensor"), H, [7, -10, 18], [0, -12, 0], 36),
  k(at("c00_hook", "menempuh perjalanan"), H, [26, -1, 26], [16, -1.6, -1], 36),
  k(at("c00_hook", "Inilah rahasia"), H, COVER.pos, COVER.tgt, COVER.wf),
  // ---- c01 intro ----
  k(c("c01_intro").start + 0.6, H, [-12, 5, 98], [-6, -13, -2], 30),
  k(at("c01_intro", "Dari celah batu"), H, [14, -11, 40], [0, -14, 0], 34),
  k(at("c01_intro", "tiba di tangan"), H, [15, 4, 30], [0, 0, -6], 36),
  k(at("c01_intro", "Di Audira"), H, [0, 24, 84], [0, -6, -12], 34),
  k(c("c02_lembah").start - 0.3, H, [-6, 34, 104], [-2, -4, -14], 34),
  // ---- c02 valley (cut) ----
  cut(c("c02_lembah").start - 0.25, V, [-10, 58, 140], [0, 6, -4], 34),
  k(c("c02_lembah").start + 1.6, V, [0, 46, 120], [0, 4, 0], 34),
  k(at("c02_lembah", "Nabi Ibrahim meninggalkan"), V, [-14, 18, 66], [-6, 2, -12], 34),
  k(at("c02_lembah", "Hajar naik ke"), V, [-58, 22, 52], [-38, 8, -12], 34),
  k(at("c02_lembah", "Lalu berlari ke"), V, [12, 28, 86], [2, 3, -10], 34),
  k(at("c02_lembah", "Lalu air muncul"), V, [12, 9, 34], [8, 0, -4], 34),
  k(at("c02_lembah", "seandainya Hajar membiarkannya"), V, [44, 24, 62], [14, 0, -4], 34),
  k(at("c02_lembah", "kabilah Jurhum"), V, [-18, 30, 74], [6, 9, -6], 34),
  k(at("c02_lembah", "Mereka datang"), V, [6, 24, 66], [4, 2, -10], 34),
  k(at("c02_lembah", "Soal nama Zamzam"), V, [16, 8, 30], [8, 0, -4], 34),
  k(c("c03_hilang").start - 0.3, V, [34, 18, 54], [8, 0, -4], 34),
  // ---- c03 buried well (cut) ----
  cut(c("c03_hilang").start - 0.25, B, [32, 16, 76], [0, -5, 0], 32),
  k(c("c03_hilang").start + 0.4, B, [26, 12, 66], [0, -6, 0], 32),
  k(at("c03_hilang", "dua patung kijang"), B, [12, -3, 38], [0, -8, 0], 34),
  k(at("c03_hilang", "Lokasi sumur itu"), B, [0, 22, 72], [-4, -2, -10], 32),
  k(at("c03_hilang", "Lama kemudian"), B, [-30, 16, 20], [-55, 5, -58], 32),
  k(at("c03_hilang", "Empat malam"), B, [-40, 10, -18], [-58, 5, -60], 34),
  k(at("c03_hilang", "Petunjuknya aneh"), B, [10, 6, 28], [3, 0, -5], 34),
  k(at("c03_hilang", "Abdul Muthalib menggali"), B, [16, 1, 40], [0, -6, 0], 32),
  k(at("c03_hilang", "Bersama air"), B, [7, 3.6, 15], [0, 1.2, -2.6], 38),
  k(at("c03_hilang", "undian anak panah"), B, [-8, 4, 14], [-5, 1.8, -3], 38),
  k(at("c03_hilang", "pedang-pedang itu"), B, [2, 3.6, 13], [-2, 2.4, -3.4], 38),
  k(at("c03_hilang", "Sejak itu"), B, [14, 6, 22], [8, 1.2, -5], 36),
  k(c("c04_timba").start - 0.3, B, [22, 11, 44], [6, 1, -3], 34),
  // ---- c04 well head through the eras (cut) ----
  cut(c("c04_timba").start - 0.25, E, [2.5, 14.4, 44.6], [0, 2, 0], 32),
  k(c("c04_timba").start + 0.6, E, [0.0, 11.9, 39.7], [0, 2, 0], 32),
  k(at("c04_timba", "Al-Azraqi menggambarkan"), E, [7.4, 6.0, 19.1], [0, 1, -2], 34),
  k(at("c04_timba", "Khalifah al-Mansur"), E, [-8.7, 9.7, 27.8], [0, 1, -2], 32),
  k(at("c04_timba", "kubah bermosaik"), E, [1.2, 8.1, 24.4], [0, 5, -1], 32),
  k(at("c04_timba", "Sultan Qaitbay"), E, [-5.0, 8.0, 23.2], [0, 5, -1], 32),
  k(at("c04_timba", "Ottoman memberinya"), E, [6.2, 8.0, 23.2], [0, 5, -1], 32),
  k(at("c04_timba", "dipagari sangkar besi"), E, [3.7, 5.0, 12.4], [0, 2, 0], 36),
  k(at("c04_timba", "disebut Zamzami"), E, [-13.3, 5.1, 15.8], [-9, 2, -4], 36),
  k(at("c04_timba", "Tahun seribu sembilan ratus lima puluh tiga"), E, [-4.8, 6.3, 20.3], [2, 2, -2], 34),
  k(at("c04_timba", "bangunan sumur dibongkar"), E, [0.0, 12.4, 37.2], [0, 0, 0], 32),
  k(at("c04_timba", "Mulut sumur diturunkan") - 0.05, E, [0.0, 14.9, 42.2], [0, 0, 0], 32),
  // cut to the hero cutaway basement
  cut(at("c04_timba", "Mulut sumur diturunkan"), H, [-10, 3, 26], [-2, -2, -2], 38),
  k(at("c04_timba", "Jemaah turun tangga"), H, [-1, -1.3, 10], [-2, -2.1, -2], 42),
  k(at("c04_timba", "ruang bawah tanah kedua"), H, [4, -1.4, 11], [1.5, -2, -3], 42),
  k(at("c04_timba", "tahun dua ribu tiga"), H, [-5, 0.4, 11], [-4.2, -1.2, -2], 40),
  k(at("c04_timba", "Pelataran tawaf bertambah"), H, [-12, 10, 26], [-4, 0, -6], 38),
  k(at("c04_timba", "berdinding kaca"), H, [2.5, -1.6, 8.5], [0, -2.2, -1.6], 42),
  k(at("c04_timba", "Bibir sumur lamanya"), H, [-18, 7.5, 2], [-26, 2.2, -12], 36),
  k(c("c05_anatomi").start - 0.3, H, [-16, 8, 4], [-26, 2.2, -12], 36),
  // ---- c05 anatomy (cut to the cover framing) ----
  cut(c("c05_anatomi").start - 0.25, H, [34, 10, 106], COVER.tgt, COVER.wf),
  k(c("c05_anatomi").start + 2.5, H, COVER.pos, COVER.tgt, COVER.wf),
  k(at("c05_anatomi", "digali dengan tangan"), H, [12, -8, 38], [0, -15, 0], 32),
  k(at("c05_anatomi", "Sekitar tiga belas"), H, [13, -5, 24], [0, -8, 0], 34),
  k(at("c05_anatomi", "tujuh belas meter"), H, [13, -24, 26], [0, -22, 0], 34),
  k(at("c05_anatomi", "lapisan batuan lapuk"), H, [7, -12.6, 13], [0, -13.8, -0.5], 36),
  k(at("c05_anatomi", "Menurut catatan Yahya"), H, [2.2, -13.4, 6.5], [0, -13.8, -1.2], 42),
  k(at("c05_anatomi", "Dari mana airnya"), H, [44, 12, 84], [0, -6, -10], 32),
  k(at("c05_anatomi", "airnya dijatah"), H, [22, -4, 42], [0, -10, 0], 32),
  k(at("c05_anatomi", "Pompa menarik"), H, [4.5, -18.4, 10], [0.4, -19.6, -0.6], 40),
  k(at("c05_anatomi", "Sensor memantau"), H, [6, -8, 14], [0, -9, -0.5], 38),
  k(at("c05_anatomi", "Kalau muka air"), H, [8, -10, 17], [0, -10.5, -0.5], 36),
  k(at("c05_anatomi", "terowongan drainase"), H, [-14, -5, 40], [-9, -7, 0], 34),
  k(at("c05_anatomi", "fondasi gedung"), H, [-44, 12, 72], [-30, -3, -10], 32),
  k(c("c06_perjalanan").start - 0.3, H, [-46, 13, 76], [-30, -3, -10], 32),
  // ---- c06 journey of one drop (cut into the pump pipe) ----
  cut(c("c06_perjalanan").start - 0.25, H, [3, -14, 9], [0.4, -12, -0.6], 44),
  k(c("c06_perjalanan").start + 5, H, [8, -4, 20], [5, -2.6, -0.8], 42),
  k(at("c06_perjalanan", "Pompa listrik mendorong"), H, [22, 0.5, 16], [36, -1.5, -0.8], 42),
  k(at("c06_perjalanan", "ke kawasan Kudai") - 0.05, H, [60, 1, 16], [80, -1.5, -0.8], 42),
  cut(at("c06_perjalanan", "ke kawasan Kudai"), P, [-46, 46, 136], [0, 4, 0], 34),
  k(at("c06_perjalanan", "ke kawasan Kudai") + 3, P, [-40, 40, 124], [-10, 4, 0], 34),
  k(at("c06_perjalanan", "Air baku ditampung"), P, [-40, 14, 46], [-40, 5, -8], 34),
  k(at("c06_perjalanan", "saringan pasir"), P, [-16, 10, 34], [-16, 4, -6], 34),
  k(at("c06_perjalanan", "sinar ultraviolet"), P, [4, 5, 16], [4, 3, -6], 38),
  k(at("c06_perjalanan", "Seluruh alurnya"), P, [20, 8, 30], [20, 3, -14], 36),
  k(at("c06_perjalanan", "dua tangki besar"), P, [40, 16, 52], [40, 6, -8], 34),
  k(at("c06_perjalanan", "dialirkan kembali"), P, [-6, 46, 126], [-30, 2, 0], 36),
  k(at("c06_perjalanan", "dibawa ke Madinah"), P, [110, 50, 70], [110, 0, -10], 36),
  k(at("c06_perjalanan", "Truk tangki"), P, [104, 30, 52], [108, 0, -14], 36),
  k(at("c06_perjalanan", "Di Madinah"), P, [122, 10, 8], [124, 1, -26], 38),
  k(at("c06_perjalanan", "Untuk dibawa pulang"), P, [62, 7, 22], [62, 2, -4], 38),
  k(at("c06_perjalanan", "sampel air diuji"), P, [60, 12, 40], [56, 2, -6], 36),
  k(c("c07_sains").start - 0.3, P, [70, 16, 50], [56, 2, -6], 36),
  // ---- c07 laboratory (cut) ----
  cut(c("c07_sains").start - 0.25, L, [-4, 15, 38], [0, 4, -3], 32),
  k(c("c07_sains").start + 2.5, L, [0, 13, 34], [0, 4, -3], 32),
  k(at("c07_sains", "Edward Frankland"), L, [-8, 8, 18], [-8, 3.6, 0.5], 38),
  k(at("c07_sains", "Tim Ottoman"), L, [-3, 7, 14], [-3.5, 3.6, 0.5], 38),
  k(at("c07_sains", "investigasi BBC"), L, [6, 7, 14], [6.8, 3.6, 0.5], 38),
  k(at("c07_sains", "Pihak Saudi membantah"), L, [10, 7, 16], [9.5, 3.6, 0.5], 36),
  k(at("c07_sains", "apa kata jurnal"), L, [0, 11, 27], [0, 8, -5], 34),
  k(at("c07_sains", "Satu studi tahun"), L, [-6, 11, 24], [-6.5, 8, -6], 34),
  k(at("c07_sains", "Studi tahun dua ribu dua puluh satu"), L, [6, 11, 24], [6.2, 7.5, -6], 34),
  k(at("c07_sains", "sedikit basa"), L, [14.5, 5, 13], [14.5, 2.6, 2.4], 40),
  k(at("c07_sains", "hewan atau sel"), L, [-15, 5, 13], [-15, 2.5, 2.4], 40),
  k(at("c07_sains", "Bagi umat Islam"), L, [1.5, 4.2, 10.5], [0, 2.8, 3], 42),
  k(c("c07_sains").end, L, [0, 4.6, 9.5], [0, 2.8, 3], 42),
  k(c("c08_ekspor").start - 0.3, L, [-1.2, 5.2, 11.5], [0, 2.8, 3], 42),
  // ---- c08 export (cut) ----
  cut(c("c08_ekspor").start - 0.25, X, [-6, 18, 60], [0, 10, 0], 34),
  k(at("c08_ekspor", "melarang Zamzam diekspor"), X, [10, 18, 44], [0, 10, 0], 34),
  k(at("c08_ekspor", "Jadi air berlabel"), X, [-12, 14, 40], [0, 9, 0], 34),
  k(at("c08_ekspor", "Di Malaysia"), X, [16, 8, 36], [4, 8, 0], 34),
  k(at("c08_ekspor", "Untuk jemaah Indonesia"), X, [40, 7, 21], [42, 3, -2], 36),
  k(at("c08_ekspor", "koper bisa dibongkar"), X, [48, 5.5, 14], [48, 2.6, -2], 38),
  k(at("c08_ekspor", "Sebagai gantinya"), X, [60, 5.5, 15], [62, 2, -2], 38),
  k(at("c08_ekspor", "Sementara di Makkah"), X, [-40, 20, 50], [-44, 0, -10], 34),
  k(at("c08_ekspor", "Itu lebih dari"), X, [-44, 34, 70], [-44, 0, -14], 36),
  k(c("c09_penutup").start - 0.3, X, [-48, 38, 76], [-44, 0, -14], 36),
  // cut home to the hero cutaway
  cut(c("c09_penutup").start - 0.25, H, [48, 28, 84], [8, 0, -26], 34),
  // ---- c09 payoff ----
  k(c("c09_penutup").start + 2.2, H, [40, 22, 70], [8, 0, -26], 34),
  k(at("c09_penutup", "Sebuah sumur sekitar"), H, [20, -6, 48], [0, -14, 0], 32),
  k(at("c09_penutup", "Airnya masuk"), H, [8, -12.5, 14], [0, -13.8, -0.5], 36),
  k(at("c09_penutup", "Sumur kecil"), H, COVER.pos, COVER.tgt, COVER.wf),
  k(at("c09_penutup", "Tulis di kolom"), H, [36, 20, 70], [6, 2, -30], 34),
  // ---- end screen: quiet tawaf plaza, slow drift ----
  k(VO_END + 0.5, H, [44, 26, 40], [11, 5, -48], 36),
  k(TOTAL, H, [24, 22, 30], [11, 5, -48], 36),
];
KEYS.sort((a, b) => a.t - b.t);
export const CAMERA_KEYS = KEYS;
export const CUT_TIMES = KEYS.filter((q) => q.cut).map((q) => q.t);

const v = (p: V3) => new THREE.Vector3(...p);
function tangent(i: number, sel: (k: Key) => V3) {
  const p = v(sel(KEYS[i]));
  // a cut ends a shot: no neighbour across it
  const prev = i > 0 && !KEYS[i].cut ? v(sel(KEYS[i - 1])) : p;
  const next = i < KEYS.length - 1 && !KEYS[i + 1].cut ? v(sel(KEYS[i + 1])) : p;
  const tg = next.clone().sub(prev).multiplyScalar(0.5);
  // clamp so long flights next to short moves cannot overshoot
  const dp = p.distanceTo(prev), dn = p.distanceTo(next);
  const lim = Math.min(dp > 1e-6 ? dp : Infinity, dn > 1e-6 ? dn : Infinity);
  if (Number.isFinite(lim) && tg.length() > lim) tg.setLength(lim);
  return tg;
}
const TAN_P = KEYS.map((_, i) => tangent(i, (q) => q.pos));
const TAN_T = KEYS.map((_, i) => tangent(i, (q) => q.tgt));

function hermite(a: THREE.Vector3, ta: THREE.Vector3, b: THREE.Vector3, tb: THREE.Vector3, u: number) {
  const u2 = u * u, u3 = u2 * u;
  return a.clone().multiplyScalar(2 * u3 - 3 * u2 + 1)
    .add(ta.clone().multiplyScalar(u3 - 2 * u2 + u))
    .add(b.clone().multiplyScalar(-2 * u3 + 3 * u2))
    .add(tb.clone().multiplyScalar(u3 - u2));
}

export type Pose = { pos: V3; tgt: V3; wf: number };
export function camAt(t: number): Pose {
  if (t <= KEYS[0].t) return KEYS[0];
  const last = KEYS[KEYS.length - 1];
  if (t >= last.t) return last;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  if (b.cut) return a; // the previous shot holds its last key until the cut (keys sit 0.05 s before it)
  const raw = (t - a.t) / Math.max(1e-6, b.t - a.t);
  // half linear, half smoothstep: velocity never drops to zero at a key, but starts gently
  const u = 0.5 * raw + 0.5 * raw * raw * (3 - 2 * raw);
  const p = hermite(v(a.pos), TAN_P[i], v(b.pos), TAN_P[i + 1], u);
  const g = hermite(v(a.tgt), TAN_T[i], v(b.tgt), TAN_T[i + 1], u);
  return { pos: [p.x, p.y, p.z], tgt: [g.x, g.y, g.z], wf: a.wf + (b.wf - a.wf) * u };
}

/** Which set the camera is looking at (for shadow framing and set mounting). */
export function nearestSet(p: V3): keyof typeof SET {
  let best: keyof typeof SET = "H", d = Infinity;
  for (const [name, o] of Object.entries(SET) as [keyof typeof SET, V3][]) {
    const dd = Math.hypot(p[0] - o[0], p[2] - o[2]);
    if (dd < d) { d = dd; best = name; }
  }
  return best;
}

/** Screen projection with the exact camera the canvas uses this frame. */
export function projector(pose: Pose, width: number, height: number) {
  const wide = width > height;
  const fov = wide ? pose.wf : portraitFov(pose.wf);
  const cam = new THREE.PerspectiveCamera(fov, width / height, 0.3, 2000);
  cam.position.set(...pose.pos);
  cam.lookAt(v(pose.tgt));
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (p: V3) => {
    const q = v(p).project(cam);
    return { x: ((q.x + 1) / 2) * width, y: ((1 - q.y) / 2) * height, front: q.z < 1 };
  };
}
