// RAJUTFORGE camera: opens tight on the hook working the open rim of the head (stitches fill the
// frame), eases back while the rounds race up to the crown, settles on the cat's face as the ears and
// eyes pop on, glides along the label while AUDIRA is couched in cord, then a warm three-quarter
// reveal of the whole table.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { hookPose, labelToWorld, letterLocal, type V3 } from "../core/motion.ts";

const FPS = 60;
export const RAJUTFORGE_SECONDS = 12;
const f = (target: V3, dist: number, az: number, el: number, fov = 32): Framing => ({ target, az, el, dist, fov });
const tip = (t: number): V3 => hookPose(t).tip;
const onLabel = (letter: number, v = 0.45): V3 => labelToWorld(letterLocal(letter, 0.4, v, 0));

const RIG = shotPlan(FPS, f(tip(0.2), 0.8, -6, 26), [
  { at: 2.0, move: frame(f(tip(1.7), 1.15, -20, 30)) },        // stitch by stitch at the rim
  { at: 4.0, move: frame(f([0.0, 0.6, 0.05], 2.3, -10, 20, 34)) }, // rounds racing up the head
  { at: 6.0, move: frame(f([0, 0.76, 0.1], 2.0, 4, 12, 32)) },  // ears and eyes pop on
  { at: 8.0, move: frame(f(onLabel(2.5), 1.2, 15, 11, 32)) },    // label glide
  { at: 10.0, move: frame(f([0.3, 0.5, 0.5], 3.6, 22, 24, 36)) }, // pull back
  { at: RAJUTFORGE_SECONDS, move: frame(f([0.3, 0.5, 0.48], 4.0, 27, 27, 36)) },
  { at: RAJUTFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getRajutforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.3, breath: 0.012, seed: 9 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
