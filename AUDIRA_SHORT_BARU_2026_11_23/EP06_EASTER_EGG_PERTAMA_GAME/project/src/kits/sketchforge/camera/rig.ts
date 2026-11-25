// SKETCHFORGE Camera Rig — over-the-shoulder look at the page, orbit down, low hero angle.
//
// One continuous shot list (core/camera/moves.ts) instead of three chained eased lerps: the old
// rig stopped at 2.4–2.7 s where the draw lerp ended and the orbit lerp began, and its swing from
// the right to the left of the house peaked near 2 frame widths per second. Same framings:
// (1) looking down at the page while the pencil draws, (2) orbiting down to a 3/4 view as the lines
// extrude and the clay fills, (3) continuing around to a low hero angle as the coloured house
// lifts off; the swing is narrower (31° to -18° instead of 37° to -30°) so the house does not slide.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { BEAT, easeInOut, ramp, type V3 } from "../core/motion.ts";

export interface SketchCameraConfig {
  position: V3;
  target: V3;
  fov: number;
}

const FILM_FPS = 60;

// Seconds on the 60 fps film clock (BEAT.draw ends 2.7 s, colour 6.9–9.2 s, lift 9–10.6 s, end 12 s):
const RIG = shotPlan(FILM_FPS, framingFrom([0.9, 10.4, 5.4], [0.15, 0, -0.55], 36), [
  { at: BEAT.draw[1], move: frame(framingFrom([0.6, 9.3, 4.7], [0.1, 0, -0.4], 36)) },
  { at: 4.9, move: frame(framingFrom([3.4, 6.5, 6.2], [0.1, 0.56, -0.18], 33.8)) },
  { at: 7.0, move: frame({ target: [0.1, 1.0, 0], az: 31, el: 19.7, dist: 9.8, fov: 32 }) },
  { at: 9.4, move: frame({ target: [0.05, 1.125, 0], az: 6, el: 16.3, dist: 7.75, fov: 33 }) },
  { at: BEAT.end, move: frame({ target: [0, 1.25, 0], az: -18, el: 7, dist: 8.5, fov: 34 }) },
  { at: BEAT.end, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getSketchCamera = (f: number, liftY: number): SketchCameraConfig => {
  const t = f / 60;
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  // follow the house as it lifts off (the old rig's liftY term, weighted by the hero move)
  const follow = liftY * 0.8 * easeInOut(ramp(t, 6.8, BEAT.end));
  const target: V3 = [shot.target[0], shot.target[1] + follow, shot.target[2]];
  return { position: shot.pos, target, fov: shot.fov };
};
