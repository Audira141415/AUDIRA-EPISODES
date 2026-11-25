// CYBERFORGE Camera Rig — low floor glide onto the core, rising orbital swoop, heroic front pull-back.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each boundary, teleported at 2.5 s (from the approach side to the front, az −27°
// to 0°) and at 5.5 s (from behind the core, az 135°, back to its right side, az 40°), and swept
// 135° in 3 s, several frame widths a second. The swoop is now one rising arc that keeps turning
// the same way (az −27° to −8°, climbing to 21° above the core) and hands over to the pull-back,
// which lands on the old front hero framing.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const CORE: [number, number, number] = [0, 0, 0];

// 3 cinematic acts (seconds on the 60 fps film clock, 8 s):
// 1. 0–2.5 s: low-angle floor glide approaching the core
// 2. 2.5–5.5 s: rising orbital swoop toward the front, high above the core
// 3. 5.5–8 s: heroic pull-back to the front, locked on the centre
const RIG = shotPlan(FILM_FPS, framingFrom([-4.5, -1.2, 7.0], CORE, 48), [
  { at: 2.5, move: frame(framingFrom([-2.5, 0.5, 5.0], [0, 0.1, 0], 44)) },
  { at: 5.5, move: frame({ target: [0, 0.1, 0], az: -8, el: 21, dist: 5.4, fov: 42 }) },
  { at: 8.0, move: frame(framingFrom([0, 0.8, 6.2], CORE, 45)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getCyberCameraPose = (f: number, _totalFrames = 480): CameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
