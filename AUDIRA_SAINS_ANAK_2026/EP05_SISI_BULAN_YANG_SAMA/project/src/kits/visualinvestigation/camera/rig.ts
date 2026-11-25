// VISUALINVESTIGATION Camera Rig — a slow push in over the evidence desk.
//
// One shot list (core/camera/moves.ts). The old push (deskZoomZ) ran 5.4 -> 4.75 in the first
// 5.4 s and then parked the camera for the rest of the film; the same push now runs across all
// 12 s and `alive` keeps the held desk breathing.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface VisualInvestigationCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const TARGET: [number, number, number] = [0.45, -0.3, -0.1];

// High forensic angle over the whole table (floorplan left, dossier right), then a slow push and
// lateral drift onto the highlighted clause. Framed for 9:16 with the HUD bands clear.
//  0 s     wide table
//  6 s     drifted right, closer
//  12 s    closest framing on the dossier, eased to rest
const RIG = shotPlan(FILM_FPS, framingFrom([-0.6, 6.4, 4.6], TARGET, 40), [
  { at: 6, move: frame(framingFrom([0.9, 5.6, 4.0], [0.6, -0.3, -0.1], 40)) },
  { at: 12, move: frame(framingFrom([1.3, 4.9, 3.4], [0.85, -0.3, -0.05], 40)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getVisualInvestigationCamera = (f: number): VisualInvestigationCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
