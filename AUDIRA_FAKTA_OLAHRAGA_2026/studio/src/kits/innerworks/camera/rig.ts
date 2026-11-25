// INNERWORKS Camera Rig — cinematic technical zoom and cross-section inspection.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and the look-at point snapped to the gear teeth at 2.17 s
// and back to centre at 5.33 s. Here the aim drifts onto the gears during the dive and back out.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface InnerworksCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// Seconds on the 60 fps film clock:
// 1. 0–2.17 s: outside approach to the industrial enclosure
// 2. 2.17–4.9 s: cutaway dive into the interlocking gear teeth
// 3. 4.9–8 s: broad diagonal cross-section reveal (more time than before: it reverses the dive)
const RIG = shotPlan(FILM_FPS, framingFrom([0, 0, 6.2], [0, 0, 0], 38), [
  { at: 2.17, move: frame(framingFrom([0, 0, 5.0], [-0.15, 0.05, 0], 37)) },
  { at: 4.9, move: frame(framingFrom([-1.2, 0.4, 3.2], [-0.6, 0.2, 0], 32)) },
  { at: 8.0, move: frame(framingFrom([1.8, 0.8, 5.4], [0, 0, 0], 36)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getInnerworksCameraPose = (f: number, _totalFrames = 480): InnerworksCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
