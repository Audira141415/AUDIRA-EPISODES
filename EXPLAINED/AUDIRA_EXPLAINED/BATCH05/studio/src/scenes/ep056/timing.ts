// AE-056 timing: every cut and beat comes from timeline.json (Audio Master Clock, VO seconds).
import * as THREE from "three";
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;
export const TOTAL = TIMELINE.total;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALL: Word[] = TIMELINE.clips.flatMap((c) => c.words);
/** Start of the n-th (0-based) occurrence of a word. Throws when missing so a script change fails loudly. */
export const at = (word: string, n = 0): number => {
  const hits = ALL.filter((x) => norm(x.w) === norm(word));
  if (!hits[n]) throw new Error(`word not in timeline: ${word}#${n}`);
  return hits[n].s;
};
const clipStart = (id: string) => TIMELINE.clips.find((c) => c.id === id)!.start;

// ---------- beats ----------
export const B = {
  otot: at("otot"),
  air: at("air", 0),
  angin: at("angin"),
  lalu: at("lalu", 0),
  berubah: at("berubah"),
  dulu: at("dulu"),
  tahun1771: at("tahun", 1),
  cromford: at("cromford"),
  mesinPintal: at("mesin", 0),
  digerakkan: at("digerakkan"),
  kini: at("kini"),
  datang: at("datang"),
  newcomen: SEC.MEKANISME[0],
  memompa: at("memompa"),
  tambang: at("tambang"),
  james: at("james"),
  hemat: at("hemat"),
  memutar: at("memutar"),
  pabrik1: at("pabrik", 0),
  sungai: at("sungai"),
  rel: at("rel"),
  tahun1830: at("tahun", 2),
  kereta: at("kereta"),
  liverpool: at("liverpool"),
  manchester: at("manchester"),
  perubahan: at("perubahan"),
  orang: at("orang"),
  jam: at("jam"),
  anak: at("anakanak"),
  aturan: at("aturan"),
  dunia: at("dunia"),
  rodaAir2: at("roda", 2),
  ini: at("ini"),
  l14: clipStart("l14"),
  outroCard: SEC.OUTRO[1] + 0.2,
};

// ---------- easing ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const backOut = (x: number, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- world anchors (diorama units) ----------
export type V3 = [number, number, number];
export const Y = { front: 0.35, mid: 1.1, back: 1.9 };
export const TRACK_A: [number, number] = [0.8, -6.6]; // Liverpool end (west)
export const TRACK_B: [number, number] = [6.6, -2.5]; // Manchester end (east)
const TL_LEN = Math.hypot(TRACK_B[0] - TRACK_A[0], TRACK_B[1] - TRACK_A[1]);
export const trackPoint = (s: number): [number, number] => [TRACK_A[0] + ((TRACK_B[0] - TRACK_A[0]) * s) / TL_LEN, TRACK_A[1] + ((TRACK_B[1] - TRACK_A[1]) * s) / TL_LEN];
/** Train front distance along the track (units); it waits, then rolls a -> b. */
export const trainS = (t: number) => 2.4 + 3.1 * smooth(ramp(t, B.tahun1830 - 0.2, SEC.REVEAL[1] + 0.6));

export const P = {
  horse: [3.25, Y.front, 5.45] as V3,
  wheel: [2.25, 0.62, 2.78] as V3,
  windmill: [-3.7, Y.front, 4.3] as V3,
  spin: [-0.75, Y.front, 5.25] as V3,
  mill: [-1.3, Y.mid, -0.55] as V3,
  millWheel: [0.5, Y.mid + 0.72, -0.67] as V3,
  newcomen: [-4.3, Y.mid, -0.95] as V3,
  watt: [-0.15, Y.back, -3.35] as V3,
  board: [3.44, Y.back + 1.19, -3.0] as V3,
  works: [-3.0, Y.back, -4.1] as V3,
  clock: [-3.0, Y.back + 2.38, -3.58] as V3,
  gate: [-3.0, Y.back, -2.75] as V3,
};

// ---------- camera ----------
// Each shot holds keys {t, p (position), g (look target), fov}. Inside a shot the path is a cubic
// Hermite spline in time whose end tangents are secants, so the camera never stops. Shots cut.
type Key = { t: number; p: V3; g: V3; fov: number };
type Shot = { name: string; keys: Key[] };
const k = (t: number, p: V3, g: V3, fov = 30): Key => ({ t, p, g, fov });

const HOOK_END = B.lalu - 0.1;
export const SHOTS: Shot[] = [
  // HOOK 1: diagonal establishing along windmill -> wheel -> horse, horse in the foreground.
  { name: "farm", keys: [k(0, [8.4, 2.4, 10.2], [0.2, 0.9, 4.0], 30), k(B.otot - 0.08, [7.6, 2.1, 9.4], [0.4, 0.85, 4.1], 30)] },
  // HOOK 2: muscle - horse and ploughman.
  { name: "horse", keys: [k(B.otot - 0.08, [6.3, 1.7, 9.9], [3.3, 0.7, 5.45], 30), k(B.air - 0.12, [5.9, 1.6, 9.7], [3.1, 0.7, 5.45], 30)] },
  // HOOK 3: water - the river wheel, low over the water.
  { name: "wheel", keys: [k(B.air - 0.12, [5.0, 1.25, 6.9], [2.25, 0.62, 2.78], 32), k(B.angin - 0.12, [4.5, 1.15, 6.7], [2.2, 0.62, 2.78], 32)] },
  // HOOK 4: wind - the windmill, slight push-in and tilt up.
  { name: "windmill", keys: [k(B.angin - 0.12, [-1.4, 1.5, 10.6], [-3.6, 1.5, 4.3], 32), k(HOOK_END, [-1.8, 1.7, 9.8], [-3.65, 1.7, 4.3], 32)] },
  // HOOK 5: "satu abad": crane up and back over the plinth to reveal the whole timeline diorama.
  { name: "reveal", keys: [k(HOOK_END, [-1.8, 2.6, 12.0], [-1.5, 1.6, 3.5], 32), k(B.berubah, [-2.6, 13, 27], [0, 2.2, -0.6], 30), k(SEC.KONTEKS[0], [-3.0, 15.5, 31], [0, 2.4, -0.6], 29)] },
  // KONTEKS 1: home spinning beside the cottage.
  { name: "spin", keys: [k(SEC.KONTEKS[0], [1.0, 1.25, 8.4], [-0.6, 0.62, 5.25], 30), k(B.tahun1771 - 0.05, [0.6, 1.2, 8.0], [-0.65, 0.62, 5.25], 30)] },
  // KONTEKS 2: crane from the cottage over the river and up the terrace to the mill (1771).
  { name: "toMill", keys: [k(B.tahun1771 - 0.05, [0.2, 1.8, 9.4], [-0.8, 0.9, 4.8], 31), k(B.cromford, [1.0, 4.0, 11.5], [-0.9, 1.7, 1.2], 31), k(B.mesinPintal - 0.1, [1.7, 4.4, 12.0], [-0.7, 2.2, -0.5], 31)] },
  // KONTEKS 3: facade lifts, machines inside, wheel drives the shafts.
  { name: "millIn", keys: [k(B.mesinPintal - 0.1, [-0.4, 2.7, 7.6], [-1.0, 2.2, -0.5], 33), k(B.digerakkan, [0.3, 2.6, 7.2], [-0.5, 2.0, -0.55], 33), k(B.kini - 0.1, [1.6, 2.4, 7.0], [0.1, 1.85, -0.6], 33)] },
  // KONTEKS 4: workers walk from their row houses to the mill.
  { name: "workers", keys: [k(B.kini - 0.1, [3.6, 2.5, 7.2], [1.4, 1.45, 0.8], 32), k(SEC.MEKANISME[0], [2.8, 2.4, 7.0], [0.9, 1.45, 0.75], 32)] },
  // MEKANISME 1: Newcomen beam engine pumping the mine.
  { name: "newcomen", keys: [k(SEC.MEKANISME[0], [-2.0, 6.0, 6.9], [-4.7, 1.9, -0.9], 32), k(B.james - 0.1, [-2.6, 5.8, 6.5], [-4.8, 1.9, -0.9], 32)] },
  // MEKANISME 2: Watt engine, beam and flywheel.
  { name: "watt", keys: [k(B.james - 0.1, [3.6, 4.0, 3.0], [0.55, 2.95, -3.1], 32), k(B.hemat - 0.15, [3.1, 3.8, 2.6], [0.5, 2.85, -3.1], 32)] },
  // MEKANISME 3: from above the mill, down to the separate condenser, then the sun-and-planet gear.
  { name: "condenser", keys: [k(B.hemat - 0.15, [1.9, 4.7, 3.4], [-0.2, 2.5, -2.6], 32), k(B.memutar, [2.7, 4.5, 3.0], [0.5, 2.6, -2.9], 32), k(B.pabrik1 - 0.1, [3.3, 4.4, 2.6], [0.9, 2.7, -3.0], 32)] },
  // MEKANISME 4: pull up and back - river at the front, smoking steam works away at the back.
  { name: "awayRiver", keys: [k(B.pabrik1 - 0.1, [-0.4, 3.4, 11.0], [-1.0, 1.0, 2.9], 32), k(SEC.REVEAL[0], [-2.4, 10.0, 13.5], [-2.0, 1.6, -2.2], 32)] },
  // REVEAL 1: the locomotive waits under steam (side-on, from outside the plinth).
  { name: "loco", keys: [k(SEC.REVEAL[0], [5.6, 2.9, -9.3], [2.6, 2.5, -5.1], 30), k(B.tahun1830 - 0.05, [5.2, 2.8, -9.1], [2.8, 2.5, -5.0], 30)] },
  // REVEAL 2: AUDIRA station board in the foreground, train rolls behind it.
  { name: "board", keys: [k(B.tahun1830 - 0.05, [2.2, 3.35, 3.4], [3.3, 2.95, -3.6], 30), k(B.kereta + 0.6, [2.8, 3.45, 3.2], [3.55, 3.0, -3.6], 30)] },
  // REVEAL 3: look down the line, Liverpool far, Manchester near; train comes toward us.
  { name: "line", keys: [k(B.kereta + 0.6, [10.8, 6.4, 2.6], [3.0, 2.0, -5.0], 32), k(SEC.PAYOFF[0], [10.2, 6.8, 2.0], [2.8, 2.0, -5.1], 32)] },
  // PAYOFF 1: high orbit, the town swells.
  { name: "city", keys: [k(SEC.PAYOFF[0], [9.5, 12.5, 17.5], [0.5, 1.4, -0.6], 30), k(B.orang - 0.05, [5.0, 11.5, 20.0], [0.2, 1.4, -0.6], 30)] },
  // PAYOFF 2: people move to town along the street.
  { name: "move", keys: [k(B.orang - 0.05, [-2.6, 2.6, 7.4], [0.2, 1.45, 0.8], 32), k(B.jam - 0.1, [-2.0, 2.5, 7.1], [0.8, 1.45, 0.8], 32)] },
  // PAYOFF 3: the factory clock sets the shift.
  { name: "clock", keys: [k(B.jam - 0.1, [-3.5, 5.0, 0.5], [-3.0, 4.35, -3.5], 30), k(B.anak - 0.15, [-3.35, 4.95, 0.1], [-3.0, 4.3, -3.5], 30)] },
  // PAYOFF 4: crane over the mill roof down to the gate - children walk in, the factory rule goes up.
  { name: "gate", keys: [k(B.anak - 0.15, [-4.1, 5.6, 1.4], [-3.55, 2.3, -2.7], 32), k(B.aturan, [-4.25, 5.45, 1.15], [-3.65, 2.3, -2.7], 32), k(SEC.OUTRO[0], [-4.35, 5.4, 1.0], [-3.7, 2.35, -2.7], 32)] },
  // OUTRO 1: fly from the city back to the river wheel where it all began.
  { name: "back", keys: [k(SEC.OUTRO[0], [-1.0, 9.0, 8.0], [-1.5, 2.0, -2.0], 32), k(B.rodaAir2, [3.6, 2.0, 7.8], [2.25, 0.8, 2.8], 32), k(B.l14, [4.4, 1.3, 6.8], [2.25, 0.66, 2.78], 32)] },
  // OUTRO 2: final pull back over the whole diorama.
  { name: "final", keys: [k(B.l14, [4.0, 4.0, 12.0], [0.5, 1.6, 1.5], 30), k(TOTAL, [-2.0, 15.0, 29.0], [0, 2.3, -0.6], 30)] },
];

const lerp3 = (a: V3, b: V3, u: number): V3 => [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
function hermite(keys: Key[], t: number, get: (q: Key) => V3): V3 {
  const n = keys.length;
  if (t <= keys[0].t) return get(keys[0]);
  if (t >= keys[n - 1].t) return get(keys[n - 1]);
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const dt = b.t - a.t;
  const u = (t - a.t) / dt;
  const tan = (j: number): V3 => {
    const p = keys[Math.max(0, j - 1)], q = keys[Math.min(n - 1, j + 1)];
    const d = q.t - p.t;
    const P0 = get(p), P1 = get(q);
    return [(P1[0] - P0[0]) / d, (P1[1] - P0[1]) / d, (P1[2] - P0[2]) / d];
  };
  const m0 = tan(i), m1 = tan(i + 1);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const A = get(a), Bp = get(b);
  return [0, 1, 2].map((c) => h00 * A[c] + h10 * dt * m0[c] + h01 * Bp[c] + h11 * dt * m1[c]) as V3;
}

export const shotIndex = (t: number) => {
  let i = 0;
  for (let j = 0; j < SHOTS.length; j++) if (t >= SHOTS[j].keys[0].t) i = j;
  return i;
};

export const camAt = (t: number) => {
  const s = SHOTS[shotIndex(t)];
  const keys = s.keys;
  const pos = hermite(keys, t, (q) => q.p);
  const target = hermite(keys, t, (q) => q.g);
  const kk = keys.length > 1 ? clamp01((t - keys[0].t) / (keys[keys.length - 1].t - keys[0].t)) : 0;
  const fov = mix(keys[0].fov, keys[keys.length - 1].fov, kk);
  return { name: s.name, pos, target, fov };
};
export { lerp3 };

/** Project a world point to pixels for the HUD, with the same camera as the 3D frame. */
export const project = (t: number, p: V3, w: number, h: number) => {
  const pose = camAt(t);
  const c = new THREE.PerspectiveCamera(pose.fov, w / h, 0.3, 400);
  c.position.set(...pose.pos);
  c.lookAt(...pose.target);
  c.updateMatrixWorld(true);
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1 };
};
