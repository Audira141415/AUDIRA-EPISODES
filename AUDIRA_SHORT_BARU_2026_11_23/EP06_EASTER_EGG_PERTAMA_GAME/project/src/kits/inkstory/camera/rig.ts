// INKSTORY Camera Rig — Meditative horizontal scroll pan & vertical mountain ascent.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and snapped its look-at target from the mountain heights
// back to the scroll centre when the final act began.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface InkCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Zen Scroll Unfolding (seconds on the 60 fps film clock):
// 1. 0–2.5 s: slow rightward pan tracking the fresh ink stroke
// 2. 2.5–5.33 s: vertical rising tilt revealing the misty mountain heights
// 3. 5.33–8 s: broad, peaceful contemplative hero framing of the full painting
const RIG = shotPlan(FILM_FPS, framingFrom([-1.8, -0.4, 4.4], [-0.8, 0, 0], 36), [
  { at: 2.5, move: frame(framingFrom([0.4, 0.2, 4.8], [0.2, 0, 0], 35.5)) },
  { at: 5.33, move: frame(framingFrom([1.2, 1.4, 5.8], [0.2, 0.6, 0], 35)) },
  { at: 8.0, move: frame(framingFrom([0, 0.2, 6.6], [0, 0, 0], 34)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getInkCameraPose = (f: number, _totalFrames = 480): InkCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
