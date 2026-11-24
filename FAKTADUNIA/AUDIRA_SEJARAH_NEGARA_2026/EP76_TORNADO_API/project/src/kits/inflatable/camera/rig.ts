// INFLATABLE camera: low and close on the star as it puffs up, a lift to catch the drops, a glide along
// the row of letters as each one fills, then a high three-quarter reveal of the whole playroom.
// The letter row is wide and a 9:16 frame is narrow, so the reveal sits at about 35° to the row.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { STAR, WORD, letterAt } from "../scene/Playroom3D.tsx";

const FPS = 60;
export const INFLATABLE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });

const ROW_Z = -0.35;
const rowX = (i: number) => -1.55 + (i / (WORD.length - 1)) * 3.1;

const RIG = shotPlan(FPS, f([STAR[0], 0.05, STAR[2]], 2.0, 10, 58), [
  { at: 1.3, move: frame(f([STAR[0] + 0.15, 0.5, STAR[2]], 2.5, 12, 16)) }, // the star fills and stands up
  { at: 2.7, move: frame(f([-0.3, 0.7, -1.7], 4.6, 6, 12)) }, // heart and ball drop in beside it
  ...WORD.split("").map((_, i) => ({ at: letterAt(i) + 0.35, move: frame(f([rowX(i), 0.42, ROW_Z], 2.2, 26, 10)) })),
  { at: 9.4, move: frame(f([0, 0.5, ROW_Z], 4.6, 18, 12)) }, // the wave along the word
  { at: 11.0, move: frame(f([0.1, 0.75, -0.1], 7.8, 34, 17)) }, // the whole playroom
  { at: INFLATABLE_SECONDS, move: frame(f([0.1, 0.75, -0.1], 8.0, 40, 18)) },
  { at: INFLATABLE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getInflatableCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.2, breath: 0.01, seed: 2 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
