// POLYVERSE Camera Rig — majestic isometric telephoto orbit around low-poly floating islands.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and jumped between the approach and the orbit.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface PolyCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Aerial Odyssey (seconds on the 60 fps film clock):
// 1. 0–2.5 s: low 3/4 isometric approach from the pine grove side
// 2. 2.5–5.3 s: rising orbital arc passing above the river
// 3. 5.3–8 s: wide telephoto hero framing of the island and the subterranean cone
// The orbit sweeps 45° instead of 80°: at fov 29 the wider sweep slid the island across more than
// half the frame per second ("too fast" in audit:camera).
const RIG = shotPlan(FILM_FPS, framingFrom([7.0, 3.2, 6.0], [0, 0.4, 0], 32), [
  { at: 2.5, move: frame(framingFrom([6.62, 4.2, 6.81], [0, 0.3, 0], 30)) },
  { at: 5.33, move: frame({ az: 12, el: 24, dist: 11.2, fov: 29, target: [0, 0.0, 0] }) },
  { at: 8.0, move: frame({ az: -2, el: 22, dist: 12.4, fov: 30, target: [0, -0.2, 0] }) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getPolyCameraPose = (f: number, _totalFrames = 480): PolyCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
