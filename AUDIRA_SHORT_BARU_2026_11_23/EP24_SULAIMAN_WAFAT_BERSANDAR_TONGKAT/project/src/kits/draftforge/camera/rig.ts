// DRAFTFORGE Camera Rig — isometric and orthographic-style trajectory for architectural drafting review.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at 2.5 s and 5.5 s, and jumped its aim point and lens (fov 34 -> 35) at 5.5 s.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface DraftCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Engineering Review (seconds on the 60 fps film clock):
// 1. 0–2.5 s: Top-Down orthographic draft view (looking down at the drafting board)
// 2. 2.5–5.5 s: Smooth 3D tilt and arc into the 30-degree isometric drafting angle
// 3. 5.5–8 s: Heroic exploded assembly inspection, a slow drift outward
const RIG = shotPlan(FILM_FPS, framingFrom([0.5, 8.5, 1.5], [0, 0, 0], 38), [
  { at: 2.5, move: frame(framingFrom([0, 7.0, 3.5], [0, 0, 0], 35)) },
  { at: 5.5, move: frame(framingFrom([5.5, 4.2, 5.5], [0, 0.2, 0], 35)) },
  { at: 8.0, move: frame(framingFrom([6.2, 4.6, 6.2], [0, 0.2, 0], 35)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getDraftCameraPose = (f: number, _totalFrames = 480): DraftCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
