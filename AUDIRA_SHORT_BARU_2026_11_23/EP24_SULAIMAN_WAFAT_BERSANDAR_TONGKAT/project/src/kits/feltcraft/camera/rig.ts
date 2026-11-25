// FELTCRAFT Camera Rig — smooth motion-control diorama camera over stop-motion puppets.
//
// One continuous shot list (core/camera/moves.ts) instead of two eased lerps: the old rig eased to
// a stop at 9 s (end of the lateral arc) while the push-in was only starting, and parked for the
// final 0.2 s. Same framings: a slow lateral arc following the fox from the hillock to the yarn
// tree, then a gentle push-in on the hug-the-apple payoff. `alive` replaces the hand-made sway.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface FeltcraftCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// Seconds on the 60 fps film clock:
//  0–8.8 s   lateral arc: the fox pops up, hops the stitched path, bumps the yarn tree
//  8.8–12 s  push-in on the apple catch and the hearts
const RIG = shotPlan(FILM_FPS, framingFrom([-0.9, 2.4, 8.2], [-0.4, 1.2, 0], 42), [
  { at: 4.5, move: frame(framingFrom([-0.1, 2.25, 7.8], [0.25, 1.2, 0], 42)) },
  { at: 8.8, move: frame(framingFrom([0.65, 2.1, 7.4], [0.88, 1.2, 0], 42)) },
  { at: 12.0, move: frame(framingFrom([0.7, 1.75, 4.6], [0.9, 1.05, 0], 42)) },
  { at: 12.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getFeltcraftCamera = (f: number): FeltcraftCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
