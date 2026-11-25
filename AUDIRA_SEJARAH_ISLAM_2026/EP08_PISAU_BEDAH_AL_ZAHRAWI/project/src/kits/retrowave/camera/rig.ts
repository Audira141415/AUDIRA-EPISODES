// RETROWAVE Camera Rig — slow lateral arc over the neon grid toward the sun.
//
// One continuous shot list (core/camera/moves.ts) instead of a raw sine sweep: the old rig started
// and ended at full lateral speed, so the camera snapped into motion on frame 0 and stopped dead on
// the last frame. Same three framings (high centre, right of centre, low centre), eased on one track.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_FRAMES = 8 * FILM_FPS;

// 0 s: high centre over the grid; 4 s: swung right and lower; 8 s: low centre hero on the sun.
const RIG = shotPlan(FILM_FPS, framingFrom([0, 2.5, 4.5], [0, 0, 0], 34), [
  { at: 4.0, move: frame(framingFrom([2, 2, 4.5], [0, 0, 0], 34)) },
  { at: 8.0, move: frame(framingFrom([0, 1.5, 4.5], [0, 0, 0], 34)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  // The shot list is authored for 8 s; a longer or shorter film stretches it to fit.
  const ff = totalFrames > 0 ? (f * FILM_FRAMES) / totalFrames : f;
  const shot = cameraAt(RIG, ff, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
