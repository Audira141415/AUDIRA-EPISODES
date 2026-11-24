// MARBLEMUSEUM Camera Rig — slow reverent orbit around the bust.
//
// One continuous shot list (core/camera/moves.ts) instead of four eased windows that ended at
// different times (radius at 8.5 s, height and lens at 9 s, orbit at 12 s), so the pull-back
// braked while the orbit kept turning. Same framings: opens a hand's breadth from the carved eye,
// pulls back while circling from the bust's right to its left, and settles on a heroic
// three-quarter view as the sun lands.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import type { MarbleShot } from "../lib/post.tsx";

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds

// Seconds (the old rig's framings at 0, 3, 6, 9 and 12 s; BUST_HEAD is at y 2.58):
const RIG = shotPlan(CLOCK, framingFrom([0.649, 2.63, 1.625], [0, 2.6, 0], 30), [
  { at: 3, move: frame(framingFrom([0.722, 2.602, 2.197], [0, 2.558, 0], 30.9)) },
  { at: 6, move: frame(framingFrom([-0.442, 2.507, 3.669], [0, 2.341, 0], 34.1)) },
  { at: 9, move: frame(framingFrom([-2.275, 2.45, 3.649], [0, 2.2, 0], 36)) },
  { at: 12, move: frame(framingFrom([-2.498, 2.45, 3.5], [0, 2.2, 0], 36)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 0.85 };

/** Slow reverent orbit around the bust (t in seconds). */
export const getMarbleCamera = (t: number): MarbleShot => {
  const shot = cameraAt(RIG, t * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { pos: shot.pos, target: shot.target, fov: shot.fov, roll: 0, exposure: LENS.exposure };
};
