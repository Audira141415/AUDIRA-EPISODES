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

// 0 s: high centre behind the car; 4 s: swung right and lower; 8 s: low chase hero on the sun.
// Framed for 9:16: the 3.3-unit car sits in the lower third, the sun in the upper half.
// Low chase camera: each target sits on the line from the camera through the car, 12 units past
// it, pitched ~3° down, so the horizon and the sun sit in the middle of the frame and the car rides
// just above the title block while the camera drifts sideways.
const ahead = (x: number, y: number, z: number): [number, number, number] => [x * (1 - (z + 12) / z), y - (z + 12) * 0.055, -12];
const key = (x: number, y: number, z: number, fov: number) => framingFrom([x, y, z], ahead(x, y, z), fov);
const RIG = shotPlan(FILM_FPS, key(0, 2.3, 8.6, 44), [
  { at: 4.0, move: frame(key(1.1, 1.85, 7.9, 44)) },
  { at: 8.0, move: frame(key(-0.5, 1.55, 7.6, 42)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  // The shot list is authored for 8 s; a longer or shorter film stretches it to fit.
  const ff = totalFrames > 0 ? (f * FILM_FRAMES) / totalFrames : f;
  const shot = cameraAt(RIG, ff, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
