// Camera moves for CHRONICLE shots: keyed in seconds, C1-smooth through the keys (Catmull-Rom tangents,
// zero speed at the first and last key), plus a deterministic handheld drift and impact shake.
// The same function drives the 3D camera and the 2D overlay projection (map labels, pins, lines).

import { PerspectiveCamera, Vector3 } from "three";
import { sample, type Key } from "../../../core/motion/track.ts";

export type V3 = [number, number, number];
export type Shot = { pos: V3; target: V3; fov: number; roll?: number };
export type CamKey = { t: number; pos: V3; target: V3; fov?: number; roll?: number; hold?: boolean };

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lin = (s: number, a: number, b: number) => clamp01((s - a) / (b - a));
export const sm = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const smoother = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

/** Smooth hash noise in 1D (deterministic). */
const h1 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return mix(h1(i + seed * 57.3), h1(i + 1 + seed * 57.3), u) * 2 - 1;
};

/** Sample a list of camera keys at time s (seconds, local to the shot). */
export const camAt = (keys: CamKey[], s: number): Shot => {
  const k: Key[] = keys.map((c) => ({ f: c.t, v: [...c.pos, ...c.target, c.fov ?? 32, c.roll ?? 0], hold: c.hold }));
  const v = sample(k, s);
  return { pos: [v[0], v[1], v[2]], target: [v[3], v[4], v[5]], fov: v[6], roll: v[7] };
};

/**
 * Handheld drift (always on, tiny) + impact shake (decaying bursts at `hits` seconds).
 * Amplitudes are in world units at the target distance, so they scale with the framing.
 */
export const handheld = (shot: Shot, s: number, o: { drift?: number; hits?: number[]; hit?: number; seed?: number } = {}): Shot => {
  const seed = o.seed ?? 1;
  const d = new Vector3(...shot.pos).distanceTo(new Vector3(...shot.target));
  let ax = noise1(s * 0.35, seed) * (o.drift ?? 0.004) * d;
  let ay = noise1(s * 0.31, seed + 3) * (o.drift ?? 0.004) * d * 0.7;
  let roll = shot.roll ?? 0;
  for (const t of o.hits ?? []) {
    const a = s - t;
    if (a < 0 || a > 1.6) continue;
    const env = Math.exp(-a * 3.2) * (o.hit ?? 0.012) * d;
    ax += noise1(a * 22, seed + t) * env;
    ay += noise1(a * 25, seed + t + 9) * env;
    roll += noise1(a * 18, seed + t + 4) * env * 0.02 / Math.max(d, 1e-3);
  }
  const target: V3 = [shot.target[0] + ax, shot.target[1] + ay, shot.target[2]];
  return { ...shot, target, roll };
};

const tmpCam = new PerspectiveCamera();
/** Project a world point to overlay space (0..1, y down). `vis` is false behind the camera. */
export const project = (shot: Shot, aspect: number, p: V3, near = 0.1, far = 5000) => {
  tmpCam.fov = shot.fov;
  tmpCam.aspect = aspect;
  tmpCam.near = near;
  tmpCam.far = far;
  tmpCam.position.set(...shot.pos);
  tmpCam.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
  tmpCam.lookAt(...shot.target);
  tmpCam.updateProjectionMatrix();
  tmpCam.updateMatrixWorld();
  const v = new Vector3(...p).project(tmpCam);
  return { x: (v.x + 1) / 2, y: (1 - v.y) / 2, vis: v.z < 1 && v.z > -1 };
};
