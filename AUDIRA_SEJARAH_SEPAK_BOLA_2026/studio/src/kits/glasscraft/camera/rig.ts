// GLASSCRAFT Camera Rig — fluid spatial computing camera trajectory.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and the look-at point jumped from y 0.2 to 0 at 2.5 s.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface GlassCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Spatial Computing Showcase (seconds on the 60 fps film clock):
// 1. 0–2.5 s: macro glance across the beveled frosted edge
// 2. 2.5–5.33 s: smooth arc into a 3/4 floating spatial card view
// 3. 5.33–8 s: wide telephoto hero pull-back on the full refractive sanctuary
const RIG = shotPlan(FILM_FPS, framingFrom([-1.8, 0.8, 3.2], [0, 0.2, 0], 36), [
  { at: 2.5, move: frame(framingFrom([-0.6, 0.4, 3.8], [0, 0.1, 0], 34)) },
  { at: 5.33, move: frame(framingFrom([2.2, 1.2, 5.2], [0, 0, 0], 34.5)) },
  { at: 8.0, move: frame(framingFrom([0, 0.8, 6.2], [0, 0, 0], 35)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getGlassCameraPose = (f: number, _totalFrames = 480): GlassCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
