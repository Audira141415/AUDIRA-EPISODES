// ISLAMICDOCUMENTARY Camera Rig — opens close on the turning girih star, pulls back as the dome and
// minarets rise, then lowers to a heroic low angle for the dawn payoff (8.4–9.8 s).
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system; `alive` adds a small
// seeded drift. The old rig sat 5.2 units away and only showed ~1.8 units of the portal in 9:16;
// the plan now frames the whole facade (wall 4.2 wide, minarets at ±1.45).

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface IslamicDocumentaryCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;
const FOV = 34;

//  0 s     close on the star in its niche
//  3.0 s   pulled back: the whole arch, the inlay lit
//  7.0 s   wide, a little to the left: dome and minarets risen
//  9.8 s   low and right: the facade against the dawn (payoff)
//  12 s    drifts on, eased to rest
const RIG = shotPlan(FILM_FPS, framingFrom([0.2, 2.3, 4.0], [0, 2.2, -0.6], FOV), [
  { at: 3.0, move: frame(framingFrom([-0.8, 2.2, 8.0], [0, 1.9, -0.3], FOV)) },
  { at: 7.0, move: frame(framingFrom([-1.6, 1.9, 13.4], [0, 1.45, 0], FOV)) },
  { at: 9.8, move: frame(framingFrom([1.1, 0.9, 13.4], [0, 1.45, 0], FOV)) },
  { at: FILM_SECONDS, move: frame(framingFrom([1.8, 1.0, 13.0], [0, 1.45, 0], FOV)) },
  { at: FILM_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getIslamicDocumentaryCamera = (f: number): IslamicDocumentaryCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
