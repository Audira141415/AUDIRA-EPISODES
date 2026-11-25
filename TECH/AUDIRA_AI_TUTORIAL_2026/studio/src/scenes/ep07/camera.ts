// EP07 camera rig: orbit keys (target, azimuth, elevation, distance, fov) in VO seconds from
// timeline.json. Between keys the rig eases, so it never parks; `cut: true` = hard cut at that key.
// Long lens (fov 18-30) keeps the near-isometric ISOCRAFT look of the cover.
import * as THREE from "three";

export type V3 = [number, number, number];
type Key = { t: number; target: V3; az: number; el: number; dist: number; fov: number; cut?: boolean };

const PHONE_ROT = 0.42;
/** Local point of a group rotated by `rot` around y and placed at `o`, to world. */
export const toWorld = (p: V3, rot = PHONE_ROT, o: V3 = [0, 0, 0]): V3 => {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [o[0] + p[0] * c + p[2] * s, o[1] + p[1], o[2] - p[0] * s + p[2] * c];
};

// world refs
export const SET_B: V3 = [7.5, 0, -4.5]; // KONTEKS workshop (Canvas board + outputs), rotated 45°
export const SET_B_ROT = Math.PI / 4;
const B = (p: V3) => toWorld(p, SET_B_ROT, SET_B);
const PLATE = toWorld([-0.5, 0.2, 0.2]);
const OWNER = toWorld([-1.6, 1.1, 0.8]);
const RECEIPT = toWorld([0.45, 0.1, 1.15]);
export const DATA_BOX_LOCAL: V3 = [-2.1, 0, 2.05];
const DATA_BOX = toWorld([-2.1, 0.45, 2.05]);
const KEYPAD = toWorld([0, 1.75, 0.1]);
const GEARS = toWorld([0, 2.9, 0.0]);

export const KEYS: Key[] = [
  // HOOK: empty phone shell + owner, pull back; cut to the AUDIRA plate; crane up to the hopper
  { t: 0.0, target: [OWNER[0] + 0.6, 2.3, OWNER[2] - 0.3], az: 30, el: 16, dist: 16, fov: 22 },
  { t: 3.85, target: [-0.2, 3.1, 0.6], az: 42, el: 24, dist: 24, fov: 22 },
  { t: 3.9, target: [PLATE[0], PLATE[1] + 0.2, PLATE[2]], az: 36, el: 13, dist: 10, fov: 22, cut: true },
  { t: 5.95, target: [PLATE[0] + 0.1, PLATE[1] + 0.35, PLATE[2]], az: 18, el: 17, dist: 8.8, fov: 22 },
  { t: 8.1, target: [-0.3, 4.4, 0.5], az: 38, el: 26, dist: 21, fov: 20 },
  // KONTEKS: the Canvas workshop, truck along the outputs, push in on the little app
  { t: 8.15, target: B([0, 3.3, 0]), az: 52, el: 30, dist: 27, fov: 20, cut: true },
  { t: 10.75, target: B([0, 3.0, 0]), az: 46, el: 28, dist: 24, fov: 20 },
  { t: 12.9, target: B([-0.1, 0.75, 0.6]), az: 46, el: 26, dist: 30, fov: 20 },
  { t: 18.3, target: B([0.2, 0.75, 0.6]), az: 47, el: 26, dist: 29, fov: 20 },
  { t: 20.6, target: B([2.1, 0.6, 1.1]), az: 50, el: 22, dist: 11, fov: 20 },
  // LANGKAH: slow orbit around the empty shell behind the UI panel
  { t: 20.65, target: [0, 2.4, 0], az: 72, el: 28, dist: 26, fov: 20, cut: true },
  { t: 36.45, target: [0, 2.4, 0], az: 30, el: 26, dist: 24, fov: 20 },
  // "Kirim": the app is assembled inside the phone
  { t: 36.5, target: [0, 2.7, 0], az: 34, el: 22, dist: 20, fov: 22, cut: true },
  { t: 38.3, target: [0, 2.6, 0], az: 26, el: 20, dist: 16.5, fov: 22 },
  { t: 38.35, target: [0, 2.4, 0], az: 20, el: 25, dist: 24, fov: 20, cut: true },
  { t: 43.6, target: [0, 2.4, 0], az: -8, el: 25, dist: 24, fov: 20 },
  // PENJELASAN: zoom through the glass into the gears
  { t: 43.65, target: GEARS, az: 24, el: 10, dist: 13, fov: 22, cut: true },
  { t: 45.5, target: GEARS, az: 24, el: 8, dist: 3.4, fov: 30 },
  { t: 45.55, target: [GEARS[0], GEARS[1] + 0.6, GEARS[2]], az: 30, el: 15, dist: 13, fov: 24, cut: true },
  { t: 60.55, target: [GEARS[0], GEARS[1] + 0.6, GEARS[2]], az: -4, el: 18, dist: 14, fov: 24 },
  // updated app: bigger keys, owner tests it, receipt prints
  { t: 60.6, target: [(OWNER[0] + KEYPAD[0]) / 2, 2.0, (OWNER[2] + KEYPAD[2]) / 2], az: 52, el: 22, dist: 14.5, fov: 22, cut: true },
  { t: 65.55, target: [(OWNER[0] + KEYPAD[0]) / 2 + 0.3, 1.8, (OWNER[2] + KEYPAD[2]) / 2 + 0.3], az: 26, el: 26, dist: 13, fov: 22 },
  // PAYOFF: share panel over a wide orbit, then the two warnings
  { t: 65.6, target: [0, 2.3, 0.4], az: 64, el: 30, dist: 26, fov: 20, cut: true },
  { t: 71.45, target: [0, 2.3, 0.4], az: 44, el: 30, dist: 25, fov: 20 },
  { t: 71.5, target: RECEIPT, az: 18, el: 42, dist: 8, fov: 22, cut: true },
  { t: 76.45, target: [RECEIPT[0], RECEIPT[1] + 0.05, RECEIPT[2] + 0.1], az: 36, el: 36, dist: 6.6, fov: 22 },
  { t: 76.5, target: DATA_BOX, az: 40, el: 24, dist: 8.5, fov: 22, cut: true },
  { t: 81.3, target: DATA_BOX, az: 14, el: 22, dist: 7.4, fov: 22 },
  // OUTRO: crane up over the whole warung
  { t: 81.35, target: [-0.3, 3.6, 0.6], az: 52, el: 24, dist: 25, fov: 22, cut: true },
  { t: 90.3, target: [-0.3, 3.4, 0.6], az: 40, el: 36, dist: 32, fov: 22 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const raw = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const k = b.cut ? 0 : b.t - a.t <= 2.2 ? ease(raw) : sine(raw);
  const target: V3 = [lerp(a.target[0], b.target[0], k), lerp(a.target[1], b.target[1], k), lerp(a.target[2], b.target[2], k)];
  const az = (lerp(a.az, b.az, k) * Math.PI) / 180;
  const el = (lerp(a.el, b.el, k) * Math.PI) / 180;
  const dist = lerp(a.dist, b.dist, k);
  // tiny handheld breathing so holds stay alive
  const bx = Math.sin(t * 0.7) * 0.012, by = Math.sin(t * 0.53 + 1) * 0.01;
  const pos: V3 = [target[0] + dist * Math.cos(el) * Math.sin(az) + bx * dist * 0.1, target[1] + dist * Math.sin(el) + by * dist * 0.1, target[2] + dist * Math.cos(el) * Math.cos(az)];
  return { pos, target, fov: lerp(a.fov, b.fov, k) };
};

export const applyCam = (cam: THREE.PerspectiveCamera, t: number) => {
  const c = camAt(t);
  cam.position.set(...c.pos);
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 300;
  cam.lookAt(...c.target);
  cam.updateProjectionMatrix();
};
