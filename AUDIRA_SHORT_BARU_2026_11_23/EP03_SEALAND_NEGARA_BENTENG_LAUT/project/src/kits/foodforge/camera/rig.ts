// FOODFORGE Camera Rig — food-commercial camera: low slow orbit around the bowl, then a push-in
// that follows the chopstick lift.
//
// One continuous shot list (core/camera/moves.ts) instead of five overlapping eased windows (orbit,
// elevation, radius, target height, push), whose starts and ends made the camera change speed in
// steps. The framings at the old boundaries are kept: the orbit sweeps from the left (-36°) to the
// right (+31.5°) while the target drops from the suspended ingredients to the broth (1.8–6.5 s), and
// the push-in lifts the target with the noodles (8.6–11.6 s). The orbit is spread more evenly than
// the old cubic ease (which turned 30° in 2.3 s mid-film), so the bowl never slides fast.

import { shotPlan, cameraAt, frame, settle } from "../../../core/camera/moves.ts";

export interface FoodforgeCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const DEG = 180 / Math.PI;

// Seconds on the 60 fps film clock (az = orbit angle, el = elevation, both in degrees):
const RIG = shotPlan(FILM_FPS, { target: [0.03, 0.95, 0], az: -0.62 * DEG, el: 0.3 * DEG, dist: 4.6, fov: 40 }, [
  { at: 1.8, move: frame({ target: [0.03, 0.95, 0], az: -32, el: 18.4, dist: 4.54, fov: 40 }) },
  { at: 4.2, move: frame({ target: [0.03, 0.72, 0], az: -19, el: 24.1, dist: 4.33, fov: 40 }) },
  { at: 6.5, move: frame({ target: [0.03, 0.5, 0], az: 3, el: 28.5, dist: 4.15, fov: 40 }) },
  { at: 8.6, move: frame({ target: [0.03, 0.5, 0], az: 21, el: 28.6, dist: 4.1, fov: 40 }) },
  { at: 10.2, move: frame({ target: [0.03, 0.77, 0], az: 28.5, el: 25.9, dist: 3.18, fov: 40 }) },
  { at: 12.0, move: frame({ target: [0.03, 0.95, 0], az: 31.5, el: 24.1, dist: 2.55, fov: 40 }) },
  { at: 12.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getFoodforgeCamera = (f: number): FoodforgeCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
