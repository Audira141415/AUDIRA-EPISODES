// PRECISION Camera Rig — Physically motivated macro lens trajectory with focal pull.
//
// One continuous shot list (core/camera/moves.ts) instead of three smoothstep segments: the old rig
// stopped dead at 2.33 s and 5.33 s and jumped its lens (fov 30 -> 32) at 5.33 s; the lens now
// opens back to 32 during the final glide into the packshot. The macro glance lands at 2 s instead
// of 2.33 s, so the orbital glide has longer to cover its 35° and brakes gently into the turn back.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface PrecisionCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// Act 1: 0–2 s     -> Macro glance on acoustic seam
// Act 2: 2–5.33 s  -> Wide 3/4 orbital glide around exploded parts
// Act 3: 5.33–8 s  -> Smooth magnetic reassembly into hero packshot
const RIG = shotPlan(FILM_FPS, framingFrom([1.2, 0.4, 2.8], [0, 0, 0], 32), [
  { at: 2.0, move: frame(framingFrom([0.6, 0.2, 3.4], [0, 0, 0], 30)) },
  { at: 5.33, move: frame(framingFrom([-2.4, 0.8, 5.2], [0, 0, 0], 30)) },
  { at: 8.0, move: frame(framingFrom([0, 0.1, 4.8], [0, 0, 0], 32)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getPrecisionCameraPose = (f: number, _totalFrames = 480): PrecisionCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
