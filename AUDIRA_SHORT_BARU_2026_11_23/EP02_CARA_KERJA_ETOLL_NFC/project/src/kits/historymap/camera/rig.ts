// HISTORYMAP Camera Rig — a commander's view over the war table: high over the Roman bank, a slow
// crane north along the pincers, then a push onto Sarmizegetusa for the payoff (8.6–9.8 s).
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The map sheet is laid
// out portrait (3.6 × 5.6, north = −z), so a high three-quarter view fills the 9:16 frame; the old
// rig looked across a landscape sheet and only showed ~2 of its 7.2 units. A map table reads best
// nearly locked off, so `alive` drifts less than the default.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface HistoryMapCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;
const FOV = 34;

//  0 s     low oblique over the Roman bank, the whole sheet in perspective (distance ≈ 9)
//  4.4 s   craned to near top-down: the river line, camps and fortress as a plan
//  6.5 s   low oblique from east: the arrows crossing the river (diversity boost)
//  8.6 s   pushed north onto the Carpathian arc as the pincers close
//  12 s    settles over the fallen fortress
const RIG = shotPlan(FILM_FPS, framingFrom([2.4, 4.4, 8.4], [0, 0, 0.6], FOV), [
  { at: 4.4, move: frame(framingFrom([-0.4, 11.4, 3.0], [0, 0, 0.1], FOV)) },
  { at: 6.5, move: frame(framingFrom([2.8, 3.2, 2.0], [0.1, 0, -0.3], FOV)) },
  { at: 8.6, move: frame(framingFrom([0.6, 6.2, 2.4], [0.15, 0, -0.8], FOV)) },
  { at: FILM_SECONDS, move: frame(framingFrom([1.8, 5.4, 2.6], [0.15, 0, -0.85], FOV)) },
  { at: FILM_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getHistoryMapCamera = (f: number): HistoryMapCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.6, breath: 0.006 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
