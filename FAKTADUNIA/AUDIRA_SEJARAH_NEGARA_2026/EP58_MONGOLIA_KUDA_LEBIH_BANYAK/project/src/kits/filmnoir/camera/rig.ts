// FILM NOIR Camera Rig — slow, ominous low tracking shot (classic 1940s RKO / John Alton angle).
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system.
// The old rig was already one smooth function (a slow sway while creeping in); its path is sampled
// into framing keys every 1.5 s, so the look is unchanged and `alive` adds the seeded drift.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export interface FilmNoirCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;

/** The original noir tracking path at second t (sway left/right, creeping in). */
const noirFraming = (t: number) =>
  framingFrom([0.4 + Math.sin(t * 0.25) * 0.15, 1.45, 5.2 - t * 0.05], [0.1, 1.35, 0], 34); // intimate cinema lens

const STEP = 1.5;
const RIG = shotPlan(
  FILM_FPS,
  noirFraming(0),
  Array.from({ length: FILM_SECONDS / STEP }, (_, i) => (i + 1) * STEP).map((at) => ({ at, move: frame(noirFraming(at)) })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getFilmNoirCamera = (f: number): FilmNoirCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
