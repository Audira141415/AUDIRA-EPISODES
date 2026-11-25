// BRICKCRAFT Camera Rig — low macro close-up, crane over the snapping bricks, wide tabletop pull-back.
//
// One continuous shot list (core/camera/moves.ts) instead of three smoothstep segments: the old rig
// stopped dead at each segment boundary and jumped its lens (34 -> 38 -> 42) between shots.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface BrickCameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes a 0..1 progress; the plan runs on a fixed 8 s clock at 60 units per second.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

// 1. 0–3.2 s (progress 0–0.4): low-angle macro close-up tracking the toy character
// 2. 3.2–6 s (0.4–0.75): medium crane pan watching the building bricks snap together
// 3. 6–8 s (0.75–1): high wide tabletop pull-back revealing the entire miniature diorama
const RIG = shotPlan(CLOCK_FPS, framingFrom([1.5, 2.2, 6.5], [0, 1.2, 0], 34), [
  { at: 3.2, move: frame(framingFrom([0.5, 2.8, 5.2], [0.2, 1.4, 0], 35)) },
  { at: 6.0, move: frame(framingFrom([4.0, 5.0, 6.5], [1.5, 2.0, -0.5], 39)) },
  { at: 8.0, move: frame(framingFrom([6.0, 8.5, 11.0], [0, 1.0, 0], 42)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/**
 * Computes smooth 60 FPS camera motion for BRICKCRAFT scenes.
 */
export function getBrickCamera(progress: number): BrickCameraState {
  const p = Math.max(0, Math.min(1, progress));
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
