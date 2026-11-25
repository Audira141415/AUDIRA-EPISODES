// WATERCOLOR Camera Rig — a gentle, floating storybook camera (like turning an illustrated page).
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system. The
// old rig was already one smooth sine float (x ±0.1, y ±0.05 around [0, 1.6, 5.8]); that float is
// sampled every 1.5 s into keys on one C1 track, with the seeded `alive` drift on top.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface WatercolorCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;

const float = (t: number) =>
  framingFrom([Math.sin(t * 0.4) * 0.1, 1.6 + Math.cos(t * 0.5) * 0.05, 5.8], [0, 1.25, 0], 34);

const RIG = shotPlan(FILM_FPS, float(0), [
  ...Array.from({ length: SECONDS / 1.5 }, (_, i) => (i + 1) * 1.5).map((at) => ({ at, move: frame(float(at)) })),
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getWatercolorCamera = (f: number): WatercolorCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
