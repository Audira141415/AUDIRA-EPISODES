// DATAPHYSICAL Camera Rig — a slow drift and pull back across the physical data sculpture.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was one
// smooth function of time (a slow sway and pull back); its framing is sampled into keys every 3 s,
// so the look stays the same, and `alive` adds a small seeded drift.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface DataPhysicalCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;

/** The sculpture framing at second t. */
const tableFraming = (t: number) => framingFrom([0.6 + Math.sin(t * 0.2) * 0.4, 1.65, 5.2 + t * 0.05], [0, 0.55, 0], 28);

const RIG = shotPlan(FILM_FPS, tableFraming(0), [
  ...[3, 6, 9, 12].map((t) => ({ at: t, move: frame(tableFraming(t)) })),
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getDataPhysicalCamera = (f: number): DataPhysicalCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
