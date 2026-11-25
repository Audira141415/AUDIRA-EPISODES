// WAYANGFORGE Camera Rig — dalang side, around the frame post, to the shadow (audience) side.
//
// One continuous shot list (core/camera/moves.ts) instead of eased lerp segments: the old rig
// stopped dead between the pull-back, the arc and the orbit, and swung 157° round the screen in
// 3.6 s (too fast to read). Here the orbit starts as soon as the pull-back lands and keeps one
// steady pace, so it covers the same arc at about half the peak speed.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { BLENCONG } from "../core/motion.ts";

export interface WayangCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SCREEN: [number, number, number] = [0, 2.0, 0];

// Seconds on the 60 fps film clock:
//  0–4.2 s   hook: macro on the blencong flame, pull back to reveal the twirling gunungan
//  4.2–6.4 s slow arc on the colourful puppet side while the figures enter
//  6.4–10.6 s orbit around the screen edge (the frame post wipes the lens near 7.5 s)
//  10.6–12 s payoff on the shadow side: shadows swell, gunungan closes the scene
// The pull-back grows the distance by a constant ratio per beat (1.33 → 4.7 m), so it does not
// rush the first second; the orbit is spread over 7.8 s at under 25°/s.
const FLAME_CLOSE: [number, number, number] = [BLENCONG[0] + 0.55, BLENCONG[1] - 0.2, BLENCONG[2] + 1.2];
const RIG = shotPlan(FILM_FPS, framingFrom(FLAME_CLOSE, BLENCONG, 30), [
  { at: 1.4, move: frame({ target: [0, 2.6, 1.15], az: 20, el: -5, dist: 1.9, fov: 36 }) },
  { at: 2.8, move: frame({ target: SCREEN.map((v, i) => v + ([0, 2.85, 1.75][i] - v) * 0.3) as [number, number, number], az: 15, el: -1, dist: 2.95, fov: 43 }) },
  { at: 4.2, move: frame({ target: SCREEN, az: 12, el: 1, dist: 4.7, fov: 50 }) },
  { at: 6.4, move: frame({ az: 50, el: 3, dist: 5.1 }) },
  { at: 8.6, move: frame({ az: 105, el: 5, dist: 5.6 }) },
  { at: 10.6, move: frame({ az: 152, el: 2.5, dist: 4.8, fov: 47 }) },
  { at: 12.0, move: frame({ az: 170, el: 1, dist: 4.2, fov: 46 }) },
  { at: 12.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getWayangCamera = (f: number): WayangCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
