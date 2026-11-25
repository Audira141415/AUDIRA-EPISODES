// SATISFYFORGE Camera Rig — three-quarter studio dolly from station to station, then a gentle drop
// toward the board for the top-down payoff.
//
// One continuous shot list (core/camera/moves.ts) instead of a formula: the old dolly parked at
// each station and then crossed 3.2 units in one second on cubic easing (about 1.5 frame widths a
// second). Now the camera creeps toward the next station while the current one plays and leaves
// earlier, so each crossing takes about 1.4 s at a constant, gentle speed and still lands before
// the next station's action (liquid fill from 4.5 s, shape drops from 8.55 s). The slow side-sway
// is sampled into the keys, and `alive` keeps the held framings breathing.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface SatisfyforgeCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeInOutCubic = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};

/** The studio framing at second t with the dolly at x: slow side-sway, then the payoff drop. */
const studio = (t: number, x: number) => {
  const sway = Math.sin(t * 0.55) * 0.35;
  const payoff = easeInOutCubic((t - 9.4) / 2.2);
  return framingFrom(
    [x + sway, lerp(3.5, 4.6, payoff), lerp(5.6, 3.7, payoff)],
    [x + sway * 0.25, lerp(0.45, 0.1, payoff), lerp(0, -0.05, payoff)],
    36,
  );
};

// Stations sit at x = −3.2 (slicing, 0.35–3.15 s), 0 (liquid fill, 4.5–7.3 s), 3.2 (shape drop, 8.55–10.3 s).
// [second, dolly x]
const KEYS: [number, number][] = [
  [3.1, -2.75],
  [4.5, -0.15],
  [7.3, 0.55],
  [8.6, 3.05],
  [9.4, 3.2],
  [11.6, 3.3],
  [12, 3.3],
];
const RIG = shotPlan(FILM_FPS, studio(0, -3.45), [
  ...KEYS.map(([at, x]) => ({ at, move: frame(studio(at, x)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getSatisfyforgeCamera = (f: number): SatisfyforgeCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
