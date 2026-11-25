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

const ease = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * Slow drift around the sculpture, pushing toward the core over the payoff (7.5–11 s). Distance is
 * set for 9:16: at fov 38 and 13.4 units the frame is ~5.2 units wide, so the 4.5-unit outer ring fits.
 */
const legacyFraming = (t: number) => {
  const push = ease(7.5, 11, t);
  return framingFrom([Math.sin(t * 0.3) * 1.6, 1.4 + Math.cos(t * 0.25) * 0.6 - push * 0.6, 13.4 - push * 3.4], [0, -0.3, 0], 38);
};

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
