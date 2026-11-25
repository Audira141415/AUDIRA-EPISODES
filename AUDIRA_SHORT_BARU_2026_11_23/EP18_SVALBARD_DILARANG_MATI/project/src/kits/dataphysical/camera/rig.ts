// DATAPHYSICAL Camera Rig — low hero angle on the rising columns, crane up and out to the whole
// sculpture, then a push toward the orange hero column as it breaks the benchmark (payoff 7.4–9.2 s).
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system; `alive` adds a small
// seeded drift. The old rig sat 5.2 units away at fov 28 and only showed ~1.5 of the 3.8-unit plinth
// in 9:16; the plan now frames the full sculpture (fitDistance at fov 34).

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface DataPhysicalCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;
const FOV = 34;

//  0 s     low macro, three-quarter on the first columns rising (diversity: G13 wants ≥ 30)
//  4 s     craned up and out: the whole plinth, benchmark settled
//  7.4 s   slow arc to the other side, hero column centred
//  9.2 s   pushed in close on the hero top as it breaks through (payoff)
//  12 s    pulls back to the whole sculpture, eased to rest
const RIG = shotPlan(FILM_FPS, framingFrom([1.9, 1.15, 5.2], [0.2, 0.35, 0], FOV), [
  { at: 4, move: frame(framingFrom([-3.0, 3.4, 11.8], [0, 0.4, 0], FOV)) },
  { at: 7.4, move: frame(framingFrom([0.2, 2.5, 10.8], [0.4, 0.7, 0], FOV)) },
  { at: 9.2, move: frame(framingFrom([1.5, 2.6, 6.2], [0.8, 1.55, 0], FOV)) },
  { at: SECONDS, move: frame(framingFrom([2.8, 4.4, 12.0], [0.5, 0.8, 0], FOV)) },
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getDataPhysicalCamera = (f: number): DataPhysicalCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
