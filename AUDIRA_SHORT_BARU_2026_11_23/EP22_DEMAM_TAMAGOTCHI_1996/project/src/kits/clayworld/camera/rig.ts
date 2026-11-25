// CLAYWORLD Camera Rig — miniature tabletop camera trajectory.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and jumped in target height and lens between segments.
// The camera is no longer stepped (stepFrame): a camera that holds for 4 frames and then jumps reads
// as judder, not stop-motion. The puppets in the example keep their stepped 15 fps animation, which
// is where the stop-motion look comes from; `alive` replaces the old stepped micro-drift.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface ClayCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Miniature Narrative (seconds on the 60 fps film clock):
// 1. 0–2.5 s: ground-level macro close-up on the clay creature
// 2. 2.5–5.33 s: camera pulls back and rises as the creature hops
// 3. 5.33–8 s: tabletop wide hero framing character and diorama
const RIG = shotPlan(FILM_FPS, framingFrom([-1.2, 1.2, 4.2], [0, 0.7, 0], 36), [
  { at: 2.5, move: frame(framingFrom([0.4, 1.4, 3.8], [0, 0.65, 0], 34)) },
  { at: 5.33, move: frame(framingFrom([1.8, 2.2, 5.2], [0, 0.55, 0], 34.5)) },
  { at: 8.0, move: frame(framingFrom([0, 1.8, 5.8], [0, 0.5, 0], 35)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getClayCameraPose = (f: number, _totalFrames = 480): ClayCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
