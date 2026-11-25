// NANOFORGE Camera Rig — microscopic approach, helical ascent along the strand, telephoto pull-back.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each boundary, teleported at 2.33 s (onto the helix start) and at 5.33 s (from
// behind the strand to the front), and swept a 250° helix in 3 s, far too fast to read. The helix is
// now a slow rising orbit (azimuth 19° to 8°; the strand spins on its own), and `alive` replaces
// the brownian micro-jitter.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface NanoCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// 3-Act Molecular Journey (seconds on the 60 fps film clock):
// 1. 0–2.33 s: macro close-up on nucleotide base pairing, rising from below
// 2. 2.33–5.33 s: helical ascending orbit along the major groove (target climbs with it)
// 3. 5.33–8 s: broad telephoto pull-back revealing the cellular cosmos
const RIG = shotPlan(FILM_FPS, framingFrom([1.8, -1.0, 2.8], [0, 0, 0], 35), [
  { at: 2.33, move: frame(framingFrom([1.2, 0.5, 3.4], [0, 0, 0], 33)) },
  { at: 5.33, move: frame({ target: [0, 1.2, 0], az: 8, el: 18, dist: 5.2, fov: 34 }) },
  { at: 8.0, move: frame(framingFrom([0, 1.0, 7.8], [0, 0, 0], 36)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getNanoCameraPose = (f: number, _totalFrames = 480): NanoCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
