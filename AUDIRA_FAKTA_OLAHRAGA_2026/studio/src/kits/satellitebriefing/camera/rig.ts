// SATELLITEBRIEFING Camera Rig — descent from high orbit to the tactical nadir view, then a slow scan.
//
// One shot list (core/camera/moves.ts). The old descent (computeSatelliteBriefingState) started at
// full speed on frame 0 and braked to a dead stop at 2 s; the same altitudes are now keys on one
// C1 track that eases in and hands over to the slow lateral scan. The drift is kept small: the map
// below must stay readable.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface SatelliteBriefingCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;
const DESCENT = 2; // seconds from high orbit to the nadir altitude

/** The orbit framing at second t: logarithmic descent 6.8 -> 3.54, lateral scan sway. */
const orbitFraming = (t: number) => {
  const altitude = 6.8 * Math.pow(0.52, Math.min(1, t / DESCENT));
  return framingFrom([Math.sin(t * 0.4) * 0.6, altitude, 2.2], [0, 0, 0], 42);
};

const RIG = shotPlan(FILM_FPS, orbitFraming(0), [
  ...[1, DESCENT, 4.5, 7, 9.5, SECONDS].map((t) => ({ at: t, move: frame(orbitFraming(t)) })),
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getSatelliteBriefingCamera = (f: number): SatelliteBriefingCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.6 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
