import { shotPlan, cameraAt, frame, pushIn, orbit, crane, settle, reveal, framingFrom } from "../../core/camera/moves.ts";

export const FILM_FPS = 60;
export const EPISODE_SECONDS = 85;

export interface InternetCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const RIG = shotPlan(FILM_FPS,
  { target: [-20, 0.3, 0], az: -15, el: 38, dist: 8, fov: 30 },
  [
    { at: 1.5, move: pushIn(0.55) },
    { at: 3.5, move: frame({ az: -5, el: 20, dist: 3.8, fov: 28 }) },
    { at: 8, move: frame({ target: [-10, 0.4, 0], az: 22, el: 30, dist: 6, fov: 34 }) },
    { at: 15, move: orbit(-30) },
    { at: 23, move: frame({ target: [0, 0.3, 0], az: 15, el: 25, dist: 7, fov: 36 }) },
    { at: 32, move: crane(18, 0.5) },
    { at: 42, move: frame({ target: [8, 0.2, 0], az: 5, el: 18, dist: 4.5, fov: 30 }) },
    { at: 50, move: frame({ target: [18, 0.5, 0], az: -18, el: 26, dist: 6, fov: 33 }) },
    { at: 58, move: orbit(28) },
    { at: 66, move: frame({ target: [18, 0.5, 0], az: 10, el: 35, dist: 5.5, fov: 33 }) },
    { at: 72, move: reveal(3.0, 22) },
    { at: 78, move: frame(framingFrom([0, 30, 10], [0, 0, 0], 42)) },
    { at: 80, move: settle() },
    { at: 85, move: settle() },
  ]
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getInternetCameraPose = (f: number): InternetCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
