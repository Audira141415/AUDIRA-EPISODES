// FILM16 camera: a documentary operator with a zoom lens, shoulder-mounted. Macro on the radio dial,
// a drift along the table to the cup, one crash zoom into the steam (the 16mm documentary move), a
// tilt up to the window, then a wide of the whole corner. Sampled on film time (24 steps a second)
// so the camera moves at the same cadence as the picture.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { filmTime } from "../core/film.ts";

const FPS = 60;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov: number): Framing => ({ target, az, el, dist, fov });

export const DIAL: [number, number, number] = [-0.28, 0.96, 0.12];
export const CUP: [number, number, number] = [0.3, 0.93, 0.22];
export const SILL: [number, number, number] = [0.32, 1.42, -1.0];
export const FILM16_SECONDS = 12;
export const RUN_OUT = 10.9;

const RIG = shotPlan(FPS, f(DIAL, 0.55, 22, 4, 30), [
  { at: 2.4, move: frame(f(DIAL, 0.72, 6, 6, 30)) }, // the dial lights, the needle finds the station
  { at: 4.2, move: frame(f(CUP, 0.95, -10, 9, 30)) }, // drift along the table to the tea
  { at: 4.9, move: frame(f(CUP, 0.95, -12, 9, 29)) },
  { at: 5.25, move: frame(f([0.3, 1.02, 0.22], 0.95, -13, 9, 19)) }, // crash zoom into the steam
  { at: 6.2, move: frame(f([0.3, 1.08, 0.22], 1.0, -14, 9, 19)) },
  { at: 7.6, move: frame(f(SILL, 2.1, -6, 2, 28)) }, // tilt up to the window
  { at: 9.2, move: frame(f(SILL, 2.35, 6, 3, 28)) },
  { at: 11.2, move: frame(f([0.05, 1.18, -0.4], 3.5, -12, 8, 34)) }, // the whole corner
  { at: FILM16_SECONDS, move: frame(f([0.05, 1.18, -0.4], 3.6, -14, 8, 34)) },
  { at: FILM16_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getFilm16Camera(t: number) {
  const tf = filmTime(t);
  const shot = cameraAt(RIG, tf * FPS, FPS, {
    lens: LENS,
    handheld: { posIntensity: 0.004, rotIntensity: 0.0025, seed: 16 },
  });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
