// MOSAICFORGE Camera Rig — low glide across the bed behind the settling wave, then a rise to an
// almost-overhead view that reveals the whole picture at the payoff.
//
// One continuous shot list (core/camera/moves.ts) instead of separate position and target tracks.
// The rise now starts at 1.8 s so the finished picture (seated by ~3.8 s) is already readable in a
// high three-quarter view at 5 s; the rest of the film climbs slowly towards the overhead payoff.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import type { MosaicShot } from "../lib/post.tsx";

type V = [number, number, number];

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

// [second, camera, aim, fov]
//  0–1.8 s   hook: low glide across the near bed, tiles rain past the lens
//  1.8–5 s   pull back and rise while the settling wave finishes (picture complete ~3.8 s)
//  5–10.2 s  slow climb with a gentle lateral drift: the whole picture reads in three-quarter view
//  10.2–12 s payoff: the finished picture, almost straight down
const KEYS: [number, V, V, number][] = [
  [1.8, [0.35, 0.75, 4.4], [0, 0.05, 1.2], 52],
  [3.4, [0.6, 3.6, 7.4], [0, 0, 0.4], 51],
  [5, [0.5, 8.0, 9.4], [0, 0, -0.1], 50],
  [7.6, [-0.6, 10.6, 8.0], [0, 0, -0.3], 50],
  [10.2, [-0.2, 12.6, 4.8], [0, 0, -0.25], 50],
  [12, [0.15, 13.4, 3.2], [0, 0, -0.15], 50],
];
const RIG = shotPlan(CLOCK, framingFrom([0.5, 0.6, 6.4], [0, 0.0, 3.6], 52), [
  ...KEYS.map(([at, pos, aim, fov]) => ({ at, move: frame(framingFrom(pos, aim, fov)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 0.95 };

export const getMosaicCamera = (t: number): MosaicShot => {
  const shot = cameraAt(RIG, t * CLOCK, CLOCK, { lens: LENS, alive: true });
  return {
    pos: shot.pos,
    target: shot.target,
    fov: shot.fov,
    // the low glide keeps its slight hand-held lean, fading out as the camera rises
    roll: (shot.roll ?? 0) + Math.sin(t * 0.5) * 0.02 * (1 - smooth(2, 4.5, t)),
    exposure: LENS.exposure,
  };
};
