// MOSAICFORGE Camera Rig — low glide across the bed behind the settling wave, then a rise to an
// almost-overhead view that reveals the whole picture at the payoff.
//
// One continuous shot list (core/camera/moves.ts) instead of separate position and target tracks.
// The framings are the old keys (camera and aim at 0, 2.5, 5, 7, 9.2 and 12 s); the rise to the
// overhead view now runs 6.8–10.2 s instead of 7–9.2 s, because the old rise slid the picture by
// more than a frame width per second at its fastest.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import type { MosaicShot } from "../lib/post.tsx";

type V = [number, number, number];

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

// [second, camera, aim, fov]
//  0–5 s     hook + glide: low across the bed, tiles rain past the lens
//  5–6.8 s   slow down over the far edge and start to lift
//  6.8–10.2 s rise to the overhead reveal
//  10.2–12 s payoff: the finished picture, almost straight down
const KEYS: [number, V, V, number][] = [
  [2.5, [0.3, 0.5, 3.6], [0, 0.05, 0.2], 52],
  [5, [-0.4, 0.75, 0.9], [0, 0.0, -2.4], 52],
  [6.8, [-0.2, 2.6, 1.2], [0, 0, -2.2], 51.8],
  [10.2, [0, 10.4, 2.4], [0, 0, -0.2], 50.4],
  [12, [0, 12.6, 2.1], [0, 0, -0.1], 50],
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
    roll: (shot.roll ?? 0) + Math.sin(t * 0.5) * 0.02 * (1 - smooth(7, 9, t)),
    exposure: LENS.exposure,
  };
};
