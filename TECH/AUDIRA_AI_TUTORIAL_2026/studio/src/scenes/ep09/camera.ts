// EP09 camera track over the LIDAR survey field. Keys are VO seconds (timeline.json); between keys
// the camera eases (short glides) or runs linear (long drifts), so it never parks. `cut: true` = hard cut.
import * as THREE from "three";

export type V3 = [number, number, number];
type Key = { t: number; pos: V3; target: V3; fov: number; cut?: boolean };

// world refs: report (0,-0.15,0) facing n=(-0.52,0.06,0.85); SEARCH (-1.55,-0.05,-1.7); GMAIL (1.35,1.25,-1.8)
// DRIVE (-1.2,-0.85,1.4); FILE (1.22,-0.8,1.5); NOTEBOOKLM (1.85,0.05,-2.9); tab tunnel z +8..-12
const N: V3 = [-0.52, 0.06, 0.85];
const R: V3 = [0, -0.15, 0];
const along = (d: number): V3 => [R[0] + N[0] * d, R[1] + N[1] * d, R[2] + N[2] * d];

export const KEYS: Key[] = [
  // HOOK: fly down the tunnel of open tabs, then pull back and crane up as they collapse into one report
  { t: 0.0, pos: [0.5, 1.5, 12.5], target: [0.1, 1.3, 0], fov: 46 },
  { t: 6.6, pos: [0.0, 1.2, 4.8], target: [0, 0.6, -3], fov: 48 },
  { t: 11.4, pos: [0, 2.3, 7.8], target: [0, 0.42, 0], fov: 50 },
  // KONTEKS: orbit the report, whip to SEARCH (bawaan), crane high over all sources
  { t: 16.0, pos: [3.6, 1.8, 6.6], target: [0, 0.3, 0], fov: 48 },
  { t: 16.9, pos: [-3.3, 0.9, 1.4], target: [-1.55, 0.0, -1.7], fov: 40 },
  { t: 18.25, pos: [-3.0, 1.05, 0.9], target: [-1.55, 0.0, -1.7], fov: 38 },
  { t: 19.6, pos: [0.2, 5.2, 6.8], target: [0, -0.2, -0.6], fov: 48 },
  { t: 24.2, pos: [-1.8, 4.6, 7.0], target: [0.1, -0.1, -0.8], fov: 48 },
  // LANGKAH: slow low drift behind the tutorial panel
  { t: 47.0, pos: [3.2, 2.2, 7.2], target: [0, 0.2, -0.5], fov: 46 },
  // PENJELASAN: research running -> high crane over the field, descend toward the report, dolly into it
  { t: 48.6, pos: [0, 7.0, 9.5], target: [0, -0.6, -2.5], fov: 50 },
  { t: 55.0, pos: [-3.5, 4.5, 7.5], target: [0, 0, -1.5], fov: 48 },
  { t: 59.7, pos: [-1.6, 1.0, 5.6], target: [0, 0, 0], fov: 46 },
  { t: 60.5, pos: along(3.6), target: R, fov: 44 },
  { t: 61.9, pos: along(0.9), target: R, fov: 40 },
  // PAYOFF: report open (2D panel) over a slow orbit; then wide for the info cards
  { t: 62.0, pos: [2.6, 0.6, 4.4], target: [0, 0.2, 0], fov: 46, cut: true },
  { t: 73.9, pos: [-2.6, 1.6, 4.8], target: [0, 0.2, 0], fov: 46 },
  { t: 74.0, pos: [0, 3.6, 7.6], target: [0, 0.1, -1], fov: 50, cut: true },
  { t: 80.3, pos: [1.5, 3.0, 6.4], target: [0, 0.2, -0.5], fov: 48 },
  // OUTRO: crane up over the whole survey
  { t: 90.3, pos: [0, 9.0, 10.0], target: [0, -0.5, -2], fov: 50 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ease2 = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const raw = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const k = b.cut ? 0 : b.t - a.t <= 1.6 ? ease(raw) : ease2(raw);
  const w: V3 = [Math.sin(t * 0.7) * 0.02, Math.sin(t * 0.53 + 1) * 0.015, 0];
  const p = l3(a.pos, b.pos, k);
  return { pos: [p[0] + w[0], p[1] + w[1], p[2]] as V3, target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
};

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
