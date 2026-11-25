// MEMPHISDIORAMA Camera Rig — a wide lateral sway across the Memphis diorama.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system.
// The old rig was already one smooth function (a slow sinusoidal drift); its path is sampled into
// framing keys every 1.5 s, so the look is unchanged and `alive` adds the seeded drift.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export interface MemphisDioramaCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;

/** The original drift path at second t. */
const legacyFraming = (t: number) => framingFrom([Math.sin(t * 0.25) * 1.1, 2.35, 5.8], [0, 0.45, 0], 36);

const STEP = 1.5;
const RIG = shotPlan(
  FILM_FPS,
  legacyFraming(0),
  Array.from({ length: FILM_SECONDS / STEP }, (_, i) => (i + 1) * STEP).map((at) => ({ at, move: frame(legacyFraming(at)) })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getMemphisDioramaCamera = (f: number): MemphisDioramaCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
