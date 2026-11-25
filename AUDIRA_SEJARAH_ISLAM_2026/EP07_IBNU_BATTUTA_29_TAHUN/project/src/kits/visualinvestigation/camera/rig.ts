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
const TARGET: [number, number, number] = [0, 0.25, 0];

//  0 s     the desk framing of the cover
//  5.4 s   most of the push done (where the old rig stopped)
//  12 s    closest framing, eased to rest
const RIG = shotPlan(FILM_FPS, framingFrom([0, 2.15, 5.4], TARGET, 30), [
  { at: 5.4, move: frame(framingFrom([0, 2.15, 4.95], TARGET, 30)) },
  { at: 12, move: frame(framingFrom([0, 2.15, 4.75], TARGET, 30)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getVisualInvestigationCamera = (f: number): VisualInvestigationCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
