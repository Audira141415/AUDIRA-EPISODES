// PLUSHFORGE camera: opens low and close on the bear as it lands and squashes, widens as the bunny
// tumbles in, eases around the two through the hops and the wave, pushes in on the hug, then dives
// to the bear's heart patch while the needle sews the last seam, and pulls out to a warm, high
// three-quarter reveal of the whole bed (quilt, pillows, AUDIRA embroidery, fairy lights).

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { HUG, REVEAL, STITCH, STITCH_END } from "../core/motion.ts";

const FPS = 60;
export const PLUSHFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });

/** Where the bear's heart patch sits while it is being sewn (bear sitting close, leaning in). */
export const HEART_AT: [number, number, number] = [-0.14, 0.17, 0.25];

const RIG = shotPlan(FPS, f([-0.26, 0.36, 0.1], 1.5, 14, 9, 32), [
  { at: 1.1, move: frame(f([-0.22, 0.25, 0.1], 1.45, 22, 13, 32)) }, // the bear squashes and settles
  { at: 2.3, move: frame(f([0.0, 0.26, 0.12], 2.0, 10, 15, 34)) }, // the bunny tumbles in beside it
  { at: 3.9, move: frame(f([0.0, 0.28, 0.12], 1.95, -10, 18, 34)) }, // soft hops
  { at: 5.6, move: frame(f([0.0, 0.29, 0.12], 1.75, -3, 12, 34)) }, // both wave
  { at: HUG.out0, move: frame(f([0.0, 0.3, 0.1], 1.4, 16, 15, 33)) }, // the hug
  { at: STITCH.start + 0.2, move: frame(f([HEART_AT[0], HEART_AT[1] + 0.06, HEART_AT[2]], 0.78, 8, 12, 32)) }, // needle on the heart patch
  { at: STITCH_END, move: frame(f([HEART_AT[0], HEART_AT[1] + 0.05, HEART_AT[2]], 0.7, 14, 14, 32)) },
  { at: REVEAL + 1.0, move: frame(f([0.0, 0.2, -0.3], 3.35, 30, 30, 34)) }, // the whole bed
  { at: PLUSHFORGE_SECONDS, move: frame(f([0.0, 0.2, -0.3], 3.45, 34, 31, 34)) },
  { at: PLUSHFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getPlushforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.3, breath: 0.012, seed: 8 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
