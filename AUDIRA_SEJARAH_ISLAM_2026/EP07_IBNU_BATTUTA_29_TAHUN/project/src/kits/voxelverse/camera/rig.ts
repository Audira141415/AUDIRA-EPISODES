// Camera language for VOXELVERSE films. A film is a list of shots; each shot is a list of timed keys
// (position, aim, lens). Each shot compiles into the shared shot list (core/camera/moves.ts): every key
// becomes a framing on one C1 track, so speed carries through a key instead of stopping, and the
// shot's first and last keys ease in and out (as the old per-axis Hermite spline did). The seeded
// `alive` drift and the shot's handheld aim drift sit on top. Focus is a world point per frame.
// `cameraAt(shots, f)` is pure: any frame renders alone.
// Frames here are film frames on a 60 fps clock (pass `frame / fps * 60`).

import { shotPlan, cameraAt as cameraShot, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { fbm1 } from "../core/noise.ts";
import type { V3 } from "../lib/voxel";

export type CamKey = {
  f: number;
  pos: V3;
  at: V3;
  /** vertical field of view, degrees */
  fov: number;
};

export type Shot = {
  name: string;
  from: number;
  to: number;
  keys: CamKey[];
  /** what the lens focuses on (world point), as a function of frame */
  focus: (f: number) => V3;
  /** bokeh strength: blur per unit of depth away from the focus plane */
  aperture: number | ((f: number) => number);
  /** largest blur radius, as a fraction of the frame */
  maxBlur?: number;
  /** exposure multiplier (1 = neutral) */
  exposure: number;
  /** exponential fog density for this shot (thicker at street level, thinner for wides) */
  fog: number;
  /** handheld drift amplitude on the aim point (fraction of the aim distance) */
  handheld?: number;
};

export type CamState = { pos: V3; at: V3; fov: number; focusDist: number; aperture: number; maxBlur: number; exposure: number; fog: number; shot: Shot };

const FILM_FPS = 60;
const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/** One shot's keys as a shot plan, timed from its first key (compiled once per shot object). */
const plans = new WeakMap<Shot, ReturnType<typeof shotPlan>>();
const planFor = (sh: Shot) => {
  let plan = plans.get(sh);
  if (!plan) {
    const [k0, ...rest] = sh.keys;
    const last = sh.keys[sh.keys.length - 1];
    plan = shotPlan(FILM_FPS, framingFrom(k0.pos, k0.at, k0.fov), [
      ...rest.map((k) => ({ at: (k.f - k0.f) / FILM_FPS, move: frame(framingFrom(k.pos, k.at, k.fov)) })),
      { at: (last.f - k0.f) / FILM_FPS, move: settle() },
    ]);
    plans.set(sh, plan);
  }
  return plan;
};

export const shotAt = (shots: Shot[], f: number) => shots.find((sh) => f >= sh.from && f < sh.to) ?? shots[shots.length - 1];

export const cameraAt = (shots: Shot[], f: number): CamState => {
  const sh = shotAt(shots, f);
  const cam = cameraShot(planFor(sh), f - sh.keys[0].f, FILM_FPS, { lens: LENS, alive: true });
  const pos: V3 = cam.pos;
  const at: V3 = [cam.target[0], cam.target[1], cam.target[2]];
  const hh = sh.handheld ?? 0;
  if (hh) {
    // operator drift: slow, low-amplitude, never a loop
    const d = Math.hypot(at[0] - pos[0], at[1] - pos[1], at[2] - pos[2]);
    at[0] += fbm1(f / 70, 11) * hh * d;
    at[1] += fbm1(f / 80, 12) * hh * d * 0.7;
  }
  const fv = sh.focus(f);
  const dir = [at[0] - pos[0], at[1] - pos[1], at[2] - pos[2]];
  const dl = Math.hypot(dir[0], dir[1], dir[2]);
  const focusDist = Math.max(0.1, ((fv[0] - pos[0]) * dir[0] + (fv[1] - pos[1]) * dir[1] + (fv[2] - pos[2]) * dir[2]) / dl);
  const aperture = typeof sh.aperture === "number" ? sh.aperture : sh.aperture(f);
  return { pos, at, fov: cam.fov, focusDist, aperture, maxBlur: sh.maxBlur ?? 0.01, exposure: sh.exposure, fog: sh.fog, shot: sh };
};
