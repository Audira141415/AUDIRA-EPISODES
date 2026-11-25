// PASIRFORGE camera: opens close and low on grains lifting off the heap, pulls back as the gate rises
// out of the sand, settles on the carved name and the turtle, swings out for the finished monument in
// the low sun, pushes in on a crown as it crumbles, drops to the apron and the wind veil, and ends on a
// wide golden-hour reveal with the sea and the swash reaching the base.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";

const FPS = 60;
export const PASIRFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });

/** Opening pose (also the cover frame's pose at t = 0). */
export const PASIR_OPEN = f([1.15, 0.14, 1.05], 1.9, 38, 15, 32);

const RIG = shotPlan(FPS, PASIR_OPEN, [
  { at: 1.6, move: frame(f([0.55, 0.5, 0.55], 2.5, 22, 11, 32)) }, // the plinth climbs out of the heap
  { at: 3.2, move: frame(f([0, 1.15, -0.1], 5.6, -8, 10, 34)) }, // the gate rises: 70 %
  { at: 4.8, move: frame(f([0.1, 0.32, 1.1], 2.6, 12, 7, 32)) }, // carved name and the penyu, crisp
  { at: 6.4, move: frame(f([0, 1.35, -0.1], 8.2, 24, 7, 34)) }, // finished monument in the low sun
  { at: 8.0, move: frame(f([0.85, 2.15, -0.3], 2.6, 36, 3, 32)) }, // a crown crumbles, the veil lifts
  { at: 9.6, move: frame(f([0.25, 0.75, 0.2], 5.0, 14, 13, 34)) }, // grains avalanche into the apron
  { at: 11.5, move: frame(f([0, 1.3, -0.7], 11.6, 20, 9, 34)) }, // wide golden-hour reveal, the wave
  { at: PASIRFORGE_SECONDS, move: frame(f([0, 1.3, -0.7], 12.1, 22, 9, 34)) },
  { at: PASIRFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getPasirforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.2, breath: 0.01, seed: 11 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
