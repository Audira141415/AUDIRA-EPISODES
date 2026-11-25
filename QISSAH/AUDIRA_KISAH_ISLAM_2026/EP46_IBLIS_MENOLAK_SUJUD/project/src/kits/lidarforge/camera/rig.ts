// LIDARFORGE Camera Rig — Aerial survey drone flight trajectory with dynamic altitude changes.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and snapped its look-at target between acts. It also swept
// 209° of azimuth in 8 s (more than half the frame per second at the act 2 orbit); the sweep is now
// 110° (from straight behind the survey volume round to a 3/4 side view of the valley).

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface LidarCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// Drone survey (seconds on the 60 fps film clock):
// 1. 0–2.33 s: high nadir oblique survey glide
// 2. 2.33–5.33 s: low skimming canopy flythrough catching laser reflections
// 3. 5.33–8 s: ascending orbital pull-back revealing the full surveyed valley
// Distances, heights and lenses come from the old rig's framings; azimuths (degrees, one unwrapped
// direction so the camera never spins the long way round) are reduced to keep the sweep readable.
const RIG = shotPlan(FILM_FPS, { ...framingFrom([-2.5, 6.5, -8.5], [0, 0, -4], 38), az: 180 }, [
  { at: 2.33, move: frame({ ...framingFrom([0, 4.2, -3.5], [0, 0.2, 0], 37), az: 165 }) },
  { at: 5.33, move: frame({ ...framingFrom([3.8, 2.8, 4.2], [0, 0.3, 1.5], 37), az: 110 }) },
  { at: 8.0, move: frame({ ...framingFrom([0, 8.5, 9.5], [0, 0, 0], 40), az: 70 }) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getLidarCameraPose = (f: number, _totalFrames = 480): LidarCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
