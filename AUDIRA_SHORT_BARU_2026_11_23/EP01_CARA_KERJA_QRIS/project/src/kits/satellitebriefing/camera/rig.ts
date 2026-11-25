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

/** Scene units per displayed km: the 9:16 frame is narrow (horizontal fov ≈ 24°), so the camera
 * flies 2.5× higher than the altitude readout to keep the whole 4-unit strait in frame. */
export const ALT_SCALE = 2.5;

/** The orbit framing at second t: logarithmic descent 6.8 -> 3.54 km (readout), lateral scan sway. */
const orbitFraming = (t: number) => {
  // Payoff push: after 7 s the orbit closes in on TARGET ALPHA by 25 %.
  const u = Math.min(1, Math.max(0, (t - 7) / 4));
  const push = 1 - 0.18 * u * u * (3 - 2 * u);
  const altitude = 6.8 * Math.pow(0.52, Math.min(1, t / DESCENT)) * ALT_SCALE * push;
  // Oblique orbit view: reduced sway (≤1.0) keeps all 3 target labels inside x 60…1020. Larger z
  // offset (1.3) ensures the horizon haze band stays in frame as the orbit descends.
  // sway ≤ 0.5 and no target-x payoff shift keeps CHARLIE label (at world x ≈ -2.24) inside x 60…1020.
  return framingFrom([Math.sin(t * 0.4) * 0.5, altitude, altitude * (1.3 - 0.02 * t)], [0, 0.2, -1.2 + 0.9 * u], 42);
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
