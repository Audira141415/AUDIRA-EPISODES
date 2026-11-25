// ORIGAMIFORGE camera: opens close and high on the first fold (the diagonal lifting off the mat),
// rises to read the kite folds from above, drops to a low three-quarter as the paper stands up and
// the tail, neck and head reverse-fold, circles the wings opening, takes in the tent card, then a
// high three-quarter reveal of the studio as the crane lifts off.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { craneFlight, T } from "../core/motion.ts";

const FPS = 60;
export const ORIGAMIFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });

const fly = (t: number): [number, number, number] => {
  const p = craneFlight(t).pos;
  return [p[0] + 0.05, p[1] - 0.05, p[2] + 0.1];
};

const RIG = shotPlan(FPS, f([0.02, 0.1, 0.1], 1.3, 18, 46, 32), [
  { at: T.precrease[1], move: frame(f([0.0, 0.06, 0.06], 1.5, 10, 54, 32)) }, // the diagonal folds over
  { at: T.unfold[1], move: frame(f([-0.05, 0.0, 0.0], 1.7, 0, 66, 32)) }, // opened: the crease stays
  { at: T.kiteB[1], move: frame(f([-0.1, 0.0, 0.0], 1.75, -12, 62, 32)) }, // the kite
  { at: T.half[1], move: frame(f([-0.05, 0.03, -0.12], 1.6, 8, 46, 33)) }, // folded in half
  { at: T.stand[1], move: frame(f([0.0, 0.12, 0.0], 1.6, 30, 20, 34)) }, // it stands up
  { at: T.tail[1], move: frame(f([0.08, 0.14, 0.0], 1.5, 40, 16, 34)) }, // tail
  { at: T.head[1], move: frame(f([-0.08, 0.16, 0.0], 1.5, 18, 14, 34)) }, // neck and head
  { at: T.wings[1], move: frame(f([0.0, 0.12, 0.0], 1.75, -10, 28, 34)) }, // wings open
  { at: T.card[1], move: frame(f([0.2, 0.1, 0.15], 2.1, 12, 24, 34)) }, // the AUDIRA card stands up
  { at: T.lift[0], move: frame(f([0.12, 0.12, 0.1], 2.2, 20, 22, 34)) },
  { at: 11.0, move: frame(f(fly(11.0), 2.6, 28, 16, 34)) }, // lift-off, the studio opens up
  { at: ORIGAMIFORGE_SECONDS, move: frame(f(fly(12), 3.0, 36, 18, 34)) }, // three-quarter reveal
  { at: ORIGAMIFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getOrigamiforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.3, breath: 0.012, seed: 11 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
