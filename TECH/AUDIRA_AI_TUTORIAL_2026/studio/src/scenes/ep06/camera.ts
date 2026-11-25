// EP06 camera track over the synthwave stage. Keys are VO seconds (timeline.json, Audio Master Clock).
// Between keys the camera glides (short glides ease, long ones run linear) so it never parks.
// `cut: true` = hard cut at that key. World refs (from Cover.tsx): prompt window (0, 2.12, -0.7) 2.86 wide,
// AUDIRA plate (0, 0.49, 0.25), keyboard (-0.62, 0.22, 4.7), cassette (0.6, 0.58, 4.8), sun (0, 5.2, -44).
import * as THREE from "three";

export type V3 = [number, number, number];
type Key = { t: number; pos: V3; target: V3; fov: number; cut?: boolean };

export const KEYS: Key[] = [
  // HOOK: inside the waveforms, dolly back to reveal the whole stage
  { t: 0.0, pos: [0.8, 1.2, 3.3], target: [0.0, 1.55, 0.2], fov: 40 },
  { t: 5.25, pos: [0.0, 1.45, 7.6], target: [0.0, 1.85, 0.0], fov: 42 },
  // HOOK 2: brand shot, lateral truck across the AUDIRA neon plate
  { t: 5.35, pos: [-0.75, 0.82, 2.3], target: [0.0, 0.55, 0.25], fov: 36, cut: true },
  { t: 9.45, pos: [0.75, 0.86, 2.15], target: [0.0, 0.55, 0.25], fov: 36 },
  // KONTEKS: on the prompt window (Create music), then crane up wide while Lyria builds notes + lyrics
  { t: 9.6, pos: [-1.5, 2.5, 3.3], target: [0.0, 2.1, -0.7], fov: 40, cut: true },
  { t: 12.4, pos: [-0.5, 2.3, 3.0], target: [0.0, 2.05, -0.7], fov: 40 },
  { t: 12.5, pos: [1.6, 4.4, 8.6], target: [0.0, 1.5, 0.0], fov: 42, cut: true },
  { t: 17.4, pos: [0.0, 2.6, 6.4], target: [0.0, 1.9, -0.3], fov: 42 },
  // zoom-through: dive into the prompt window; the 2D panel grows out of it
  { t: 18.55, pos: [0.0, 2.14, 0.35], target: [0.0, 2.12, -0.7], fov: 40 },
  // LANGKAH: slow orbit behind the UI panel (sun, grid, stage stay alive)
  { t: 18.6, pos: [2.6, 3.2, 7.8], target: [0.0, 1.7, 0.0], fov: 42, cut: true },
  { t: 46.8, pos: [-2.4, 2.4, 7.2], target: [0.0, 1.6, 0.0], fov: 42 },
  // PENJELASAN: low and wide under the options panel
  { t: 47.2, pos: [-2.2, 1.1, 6.6], target: [0.0, 1.9, -1.0], fov: 44 },
  { t: 59.0, pos: [1.2, 1.0, 6.8], target: [0.0, 1.9, -1.0], fov: 44 },
  // result = AUDIRA MIX cassette close-up (the "file")
  { t: 59.2, pos: [1.25, 1.45, 6.5], target: [0.45, 0.6, 4.8], fov: 34, cut: true },
  { t: 63.6, pos: [0.4, 1.35, 6.3], target: [0.5, 0.6, 4.8], fov: 34 },
  // retry: back in front of the prompt window
  { t: 63.75, pos: [0.9, 2.3, 4.0], target: [0.0, 2.0, -0.7], fov: 40, cut: true },
  { t: 67.3, pos: [-0.6, 2.25, 3.4], target: [0.0, 2.0, -0.7], fov: 40 },
  // PAYOFF: high crane while the requirements list builds
  { t: 67.45, pos: [0.0, 5.6, 10.2], target: [0.0, 1.4, -0.5], fov: 42, cut: true },
  { t: 74.0, pos: [0.0, 4.4, 8.8], target: [0.0, 1.5, -0.5], fov: 42 },
  // watermark: track along the waveforms
  { t: 74.15, pos: [-2.6, 1.6, 4.6], target: [0.2, 1.2, 0.8], fov: 40, cut: true },
  { t: 78.9, pos: [2.4, 1.6, 4.6], target: [-0.2, 1.2, 0.8], fov: 40 },
  // "jujurlah": wide hero of the stage
  { t: 79.0, pos: [0.0, 1.3, 8.2], target: [0.0, 1.9, 0.0], fov: 42, cut: true },
  { t: 81.5, pos: [0.0, 1.5, 7.2], target: [0.0, 1.95, 0.0], fov: 42 },
  // OUTRO: tilt up toward the striped sun, then settle on the AUDIRA plate
  { t: 81.6, pos: [0.0, 1.0, 9.5], target: [0.0, 3.6, -30], fov: 42, cut: true },
  { t: 84.9, pos: [0.0, 1.4, 7.0], target: [0.0, 4.2, -30], fov: 42 },
  { t: 85.0, pos: [-0.35, 0.9, 2.6], target: [0.0, 0.6, 0.25], fov: 38, cut: true },
  { t: 90.3, pos: [0.35, 1.0, 2.3], target: [0.0, 0.6, 0.25], fov: 38 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const raw = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const k = b.cut ? 0 : b.t - a.t <= 1.2 ? ease(raw) : smooth(raw);
  const w: V3 = [Math.sin(t * 0.7) * 0.02, Math.sin(t * 0.53 + 1) * 0.015, 0];
  const p = l3(a.pos, b.pos, k);
  return { pos: [p[0] + w[0], p[1] + w[1], p[2]] as V3, target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
};

/** World point to screen pixels with the same camera maths as the rig. */
export const project = (t: number, p: V3, width: number, height: number) => {
  const c = camAt(t);
  const cam = new THREE.PerspectiveCamera(c.fov, width / height, 0.1, 120);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, behind: v.z > 1 };
};
