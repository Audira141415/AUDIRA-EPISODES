// URBANFORGE Camera Rig — rooftop glide, crane rise over the data wash, high isometric masterplan.
//
// One continuous shot list (core/camera/moves.ts) instead of three smoothstep segments: the old rig
// stopped dead at each segment boundary and jumped its lens (36 -> 40 -> 42) between shots. The
// rooftop glide crosses less far (azimuth -4° instead of -12°) so the turn into the crane does not
// brake and re-launch, and the crane gets a little more time (2.6–5.8 s) with an in-between key at
// the geometric mean distance, so the pull-back grows at an even rate on screen.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface UrbanCameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes a 0..1 progress; the plan runs on a fixed 8 s clock at 60 units per second.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

// 1. 0–2.6 s (progress 0–0.33): macro rooftop glide at building height
// 2. 2.6–5.8 s (0.33–0.73): crane rise revealing the data wash and dynamic sun shadows
// 3. 5.8–8 s (0.73–1): high isometric masterplan pull-back overlooking the whole model
const ROOFTOP = { ...framingFrom([-0.8, 5.4, 3.2], [0, 4.0, -0.5], 38), az: -4 };
const CRANE_TOP = framingFrom([4.5, 8.5, 7.5], [0, 1.5, 0], 41);
const mid = (a: number, b: number) => (a + b) / 2;
const CRANE_MID = {
  target: ROOFTOP.target.map((v, i) => mid(v, CRANE_TOP.target[i])) as [number, number, number],
  az: mid(ROOFTOP.az, CRANE_TOP.az),
  el: mid(ROOFTOP.el, CRANE_TOP.el),
  dist: Math.sqrt(ROOFTOP.dist * CRANE_TOP.dist),
  fov: mid(ROOFTOP.fov, CRANE_TOP.fov),
};

const RIG = shotPlan(CLOCK_FPS, framingFrom([1.2, 4.9, 4.5], [0, 4.2, 0], 36), [
  { at: 2.6, move: frame(ROOFTOP) },
  { at: 4.2, move: frame(CRANE_MID) },
  { at: 5.8, move: frame(CRANE_TOP) },
  { at: 8.0, move: frame(framingFrom([7.5, 12.0, 11.5], [0, 0.5, 0], 42)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/**
 * Computes smooth architectural camera movements for URBANFORGE scenes.
 */
export function getUrbanCamera(progress: number): UrbanCameraState {
  const p = Math.max(0, Math.min(1, progress));
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
