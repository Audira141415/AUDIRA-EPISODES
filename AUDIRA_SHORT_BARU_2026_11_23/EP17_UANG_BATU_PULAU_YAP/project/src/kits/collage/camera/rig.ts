// COLLAGE camera: close on each piece as the hand places it, drifting down the board with the build,
// then a pull back to the whole poster once the ransom letters spell the title. One continuous shot
// list (core/camera/moves.ts); the pieces move on twelves, the camera never does.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { LETTERS_T0, LETTERS_Y, LETTER_STEP, LETTERS } from "../scene/Collage3D.tsx";

const FPS = 60;
const FOV = 34;
const at = (target: [number, number, number], dist: number, az = 0, el = 3): Framing => ({ target, az, el, dist, fov: FOV });

const LETTERS_END = LETTERS_T0 + LETTERS.length * LETTER_STEP + 0.3;
export const REVEAL_AT = LETTERS_END + 0.2;
export const COLLAGE_SECONDS = 12;

const RIG = shotPlan(FPS, at([0.1, 4.95, 0], 3.4, -9, 4), [
  { at: 0.9, move: frame(at([0.45, 5.05, 0], 3.1, -6, 5)) }, // the sun lands on the sky
  { at: 2.0, move: frame(at([0.0, 3.9, 0], 3.6, 4, 3)) }, // the city strip
  { at: 3.3, move: frame(at([0.0, 2.5, 0], 3.9, 8, 2)) }, // headline and crowd side by side
  { at: 4.7, move: frame(at([0.35, 3.0, 0], 3.3, -4, 4)) }, // tape pressed on
  { at: LETTERS_T0, move: frame(at([0.0, LETTERS_Y + 0.12, 0], 3.3, -5, 2)) }, // letters
  { at: LETTERS_END, move: frame(at([0.0, LETTERS_Y + 0.2, 0], 3.7, 4, 2)) },
  { at: REVEAL_AT + 1.9, move: frame(at([0.0, 2.65, 0], 12.0, -6, 3)) }, // the whole poster
  { at: COLLAGE_SECONDS, move: frame(at([0.0, 2.6, 0], 11.5, -2, 3)) },
  { at: COLLAGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCollageCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.2, breath: 0.01, seed: 4 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
