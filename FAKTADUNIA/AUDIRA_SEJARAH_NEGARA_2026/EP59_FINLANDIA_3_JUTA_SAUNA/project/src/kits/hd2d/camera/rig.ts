// HD2D Camera Rig — elevated 3/4 tilt-shift diorama perspective, slow sway and creep in.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system.
// The path is one smooth function sampled into framing keys every 1.5 s; `alive` adds the seeded drift.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export interface Hd2dCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;

const ease = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * Elevated tilt-shift diorama view at second t. Distance is set for 9:16: at fov 34 and ~11.6 units
 * the frame is ~4 units wide, so the square, both facades and the lantern fit. A slow sway and creep
 * in; over the payoff (8.5–11 s) the camera pushes onto the hero at the lantern.
 */
const legacyFraming = (t: number) => {
  const push = ease(8.5, 11, t);
  const crane = 1 - ease(0, 4.5, t); // hook: high establishing view cranes down to the diorama angle
  return framingFrom([Math.sin(t * 0.2) * 0.6, 4.6 + crane * 2.2 - push * 0.5, 11.2 + crane * 1.6 - t * 0.06 - push * 2.0], [push * 0.12, 0.85 - push * 0.1, push * 0.25], 34);
};

const STEP = 1.5;
const RIG = shotPlan(
  FILM_FPS,
  legacyFraming(0),
  Array.from({ length: FILM_SECONDS / STEP }, (_, i) => (i + 1) * STEP).map((at) => ({ at, move: frame(legacyFraming(at)) })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getHd2dCamera = (f: number): Hd2dCameraConfig => {
  // An HD-2D diorama reads best nearly locked off: a smaller drift than the default.
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.6, breath: 0.006 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
