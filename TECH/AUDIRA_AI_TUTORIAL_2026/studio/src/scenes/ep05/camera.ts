// EP05 camera track: one continuous rig over the study desk. Keys are in VO seconds (timeline.json);
// between keys the camera eases (smooth in-out), so it never parks. `cut: true` = hard cut at that key.
import * as THREE from "three";

export type V3 = [number, number, number];
type Key = { t: number; pos: V3; target: V3; fov: number; cut?: boolean };

// world refs (stairs group offset 0.15,0,-0.25): cheat sheet ~(-0.95,0.3,1.05), AUDIRA label (-1.55,0,-2.37),
// steps x 0.3/1.16/2.02 tops 0.46/0.92/1.38, bulb (2.0,2.55,-0.45), phone (-2.55,0,3.35)
export const KEYS: Key[] = [
  // HOOK: close on the cheat sheet, crane out to the stairs, glide to the AUDIRA label
  { t: 0.0, pos: [-0.35, 2.5, 4.9], target: [-0.45, 1.15, 0.7], fov: 38 },
  { t: 2.8, pos: [0.3, 3.3, 6.5], target: [0.05, 1.45, 0.3], fov: 39 },
  { t: 6.9, pos: [0.5, 3.9, 7.4], target: [0.55, 1.0, 0.2], fov: 40 },
  { t: 7.0, pos: [-0.9, 2.3, 0.9], target: [-1.55, 0.0, -2.35], fov: 36, cut: true },
  { t: 9.9, pos: [-1.35, 2.1, 0.6], target: [-1.55, 0.0, -2.35], fov: 36 },
  // KONTEKS: wide from the left, drift toward the cover angle, then track the stairs from the right
  { t: 10.1, pos: [-3.2, 5.2, 7.0], target: [1.15, 1.8, 0.0], fov: 42, cut: true },
  { t: 13.3, pos: [-1.6, 5.3, 9.0], target: [1.0, 1.8, 0.0], fov: 42 },
  { t: 17.4, pos: [-0.4, 4.9, 9.4], target: [1.2, 1.9, 0.1], fov: 42 },
  { t: 17.6, pos: [3.6, 2.4, 5.4], target: [0.9, 1.0, -0.2], fov: 40, cut: true },
  { t: 22.3, pos: [2.2, 3.2, 6.2], target: [1.0, 1.1, -0.2], fov: 40 },
  // LANGKAH: dive to an overhead of the right page; the UI sheet lies "on" the notebook
  { t: 23.3, pos: [1.3, 7.2, 2.2], target: [1.3, 0.0, 0.2], fov: 40 },
  { t: 42.7, pos: [1.8, 6.4, 2.6], target: [1.5, 0.0, 0.3], fov: 40 },
  // PENJELASAN: low behind the crossed-out sheet, then along the stairs while the student climbs
  { t: 42.8, pos: [-1.9, 1.45, 4.3], target: [0.1, 0.9, 0.3], fov: 40, cut: true },
  { t: 45.8, pos: [-1.3, 1.8, 4.9], target: [0.3, 1.0, 0.2], fov: 40 },
  { t: 46.0, pos: [-0.4, 2.6, 7.0], target: [1.0, 1.75, -0.1], fov: 40, cut: true },
  { t: 52.2, pos: [0.4, 3.1, 7.0], target: [1.2, 2.0, -0.2], fov: 40 },
  { t: 57.1, pos: [1.3, 3.5, 6.8], target: [1.5, 2.2, -0.3], fov: 40 },
  // PAYOFF: crane to the bulb as it lights, orbit, whip down the stairs, hero wide, phone on the desk
  { t: 59.2, pos: [3.4, 4.0, 6.6], target: [1.6, 2.4, -0.3], fov: 40 },
  { t: 64.3, pos: [4.2, 4.0, 3.6], target: [1.8, 2.4, -0.4], fov: 40 },
  { t: 64.5, pos: [2.6, 2.0, 5.0], target: [0.6, 0.7, 0.2], fov: 40, cut: true },
  { t: 66.5, pos: [1.8, 2.3, 5.6], target: [0.5, 0.6, 0.2], fov: 40 },
  { t: 66.7, pos: [-0.9, 5.3, 9.2], target: [0.9, 1.75, 0.2], fov: 42, cut: true },
  { t: 69.7, pos: [0.4, 5.7, 10.0], target: [0.9, 1.75, 0.2], fov: 42 },
  { t: 69.9, pos: [-1.6, 2.6, 6.4], target: [-2.5, 0.0, 3.3], fov: 38, cut: true },
  { t: 74.9, pos: [-2.2, 2.2, 5.8], target: [-2.5, 0.0, 3.3], fov: 38 },
  // OUTRO: rise high above the whole desk
  { t: 75.1, pos: [0.4, 7.0, 9.6], target: [1.4, 1.3, 0.3], fov: 42, cut: true },
  { t: 90.3, pos: [0.4, 10.5, 9.0], target: [1.4, 1.1, 0.3], fov: 42 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  // a segment ending in a cut holds the previous shot's last pose; short glides ease, long ones run linear
  const raw = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const k = b.cut ? 0 : b.t - a.t <= 1.2 ? ease(raw) : raw;
  // tiny handheld breathing so even holds are alive
  const w: V3 = [Math.sin(t * 0.7) * 0.02, Math.sin(t * 0.53 + 1) * 0.015, 0];
  const p = l3(a.pos, b.pos, k);
  return { pos: [p[0] + w[0], p[1] + w[1], p[2]] as V3, target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
};

/** World point to screen pixels with the same camera maths as the rig. */
export const project = (t: number, p: V3, width: number, height: number) => {
  const c = camAt(t);
  const cam = new THREE.PerspectiveCamera(c.fov, width / height, 0.05, 80);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, behind: v.z > 1 };
};
