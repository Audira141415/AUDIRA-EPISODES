// PAINTERLY camera: opens low in the grass on the AUDIRA sign with the traveller setting off up the
// path, swings past the sign to follow the walker, climbs with them towards the tree, slides past
// the crown so the bay, cliff village and lighthouse open up behind it, then cranes up and back
// into a wide reveal of the whole painting: tree, traveller on the crest, sea, village, clouds.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { walkerAt } from "../core/motion.ts";

const FPS = 60;
export const PAINTERLY_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 36): Framing => ({ target, az, el, dist, fov });

const walkerTarget = (t: number, lift = 0.45): [number, number, number] => {
  const w = walkerAt(t);
  return [w.x, w.y + lift, w.z];
};

const RIG = shotPlan(FPS, f([0.4, 1.05, -1.6], 3.7, 14, -2, 38), [
  { at: 1.6, move: frame(f(walkerTarget(1.6, 0.4), 3.0, -10, 2, 38)) }, // past the sign, onto the walker
  { at: 3.2, move: frame(f(walkerTarget(3.2, 0.55), 2.5, 6, 6, 38)) }, // behind the traveller
  { at: 4.8, move: frame(f([-0.5, 2.5, -4.6], 5.4, 18, 6, 40)) }, // the whole tree ahead
  { at: 6.4, move: frame(f([4.0, 0.8, -17], 14, -14, 7, 40)) }, // past the crown: the bay opens
  { at: 8.0, move: frame(f([4.8, 1.6, -19.5], 14, -24, 9, 38)) }, // across the water to the village
  { at: 9.6, move: frame(f([3.0, 0.5, -15], 16, -2, 22, 40)) }, // crane up and back
  { at: 11.4, move: frame(f([1.6, 1.0, -12], 16.2, -6, 15, 42)) }, // wide reveal
  { at: PAINTERLY_SECONDS, move: frame(f([1.6, 1.0, -12], 16.6, -7, 15.5, 42)) },
  { at: PAINTERLY_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getPainterlyCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.2, breath: 0.01, seed: 9 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
