// INNERWORKS Camera Rig — closed gearbox, dive onto the drive/output tooth mesh, then a diagonal
// cross-section reveal of the whole train.
//
// One continuous shot list (core/camera/moves.ts). Distances fit the 4.8-unit casing inside the
// narrow 9:16 width (horizontal fov ≈ 20° at fov 34): ~17 units out for the full casing, ~7 for the
// tooth close-up.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface InnerworksCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
/** Contact point: aim slightly lower so gears clear the top HUD chips (y 180–420). */
const MESH: [number, number, number] = [-0.21, -0.5, 0.1];

// Seconds on the 60 fps film clock:
// 1. 0–2.2 s: slow push on the closed casing (the cover lifts from 1.3 s)
// 2. 2.2–4.5 s: dive onto the meshing teeth (ended earlier; cropped close-up was too long)
// 3. 4.5–5.5 s: pull back to a wider diagonal view — whole casing, plinth, output shaft visible
// 4. 5.5–8 s: continue pulling out to the full diagonal reveal
const RIG = shotPlan(FILM_FPS, framingFrom([0.4, -0.3, 17.5], [0, -0.5, 0], 34), [
  { at: 2.2, move: frame(framingFrom([0.2, -0.1, 15.0], [0, -0.3, 0], 34)) },
  { at: 4.5, move: frame(framingFrom([-1.6, 1.0, 9.4], MESH, 32)) },
  { at: 5.5, move: frame(framingFrom([2.8, 1.4, 14.5], [0.2, -0.8, 0], 36)) },
  { at: 8.0, move: frame(framingFrom([5.2, 2.4, 16.0], [0.1, -0.5, 0], 34)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getInnerworksCameraPose = (f: number, _totalFrames = 480): InnerworksCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
