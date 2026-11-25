// FLUIDFORGE Camera Rig — gentle floating sway around the liquid sculpture.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system.
// The old rig was already one smooth function (a slow sinusoidal drift); its path is sampled into
// framing keys every 1.5 s, so the look is unchanged and `alive` adds the seeded drift.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export interface FluidforgeCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;

/** The original drift path at second t. */
const legacyFraming = (t: number) => framingFrom([Math.sin(t * 0.3) * 0.8, 0.4 + Math.cos(t * 0.25) * 0.3, 5.4], [0, 0.1, 0], 34);

const STEP = 1.5;
const RIG = shotPlan(
  FILM_FPS,
  legacyFraming(0),
  Array.from({ length: FILM_SECONDS / STEP }, (_, i) => (i + 1) * STEP).map((at) => ({ at, move: frame(legacyFraming(at)) })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getFluidforgeCamera = (f: number): FluidforgeCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
