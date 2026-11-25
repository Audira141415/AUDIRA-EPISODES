// GERABAHFORGE camera: opens close and low on the spinning lump, tips down into the opening, rises
// with the walls as they are pulled, swings round as the wheel slows, looks down over the shoulder
// while the glaze is poured, slides in on the drips and the brushed lettering, pulls back so the
// glowing kiln sits behind the piece while it fires, then a three-quarter reveal of the studio.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { LETTER_AZ } from "../scene/Studio3D.tsx";

const FPS = 60;
export const GERABAHFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 32): Framing => ({ target, az, el, dist, fov });

const RIG = shotPlan(FPS, f([0, 0.6, 0], 0.95, 20, 16), [
  { at: 1.6, move: frame(f([0, 0.62, 0], 1.0, 8, 32)) }, // thumbs open the lump: look into it
  { at: 3.2, move: frame(f([0, 0.7, 0], 1.25, -6, 14)) }, // the walls rise
  { at: 4.5, move: frame(f([0, 0.72, 0], 1.45, -16, 10, 33)) }, // the full vase, wheel spinning down
  { at: 5.8, move: frame(f([0, 0.78, 0], 1.3, 6, 24)) }, // the pour, from above the shoulder
  { at: 6.8, move: frame(f([0, 0.72, 0], 1.15, LETTER_AZ - 8, 8)) }, // drips running down
  { at: 7.9, move: frame(f([0, 0.74, 0], 1.08, LETTER_AZ, 6)) }, // AUDIRA brushed on
  { at: 9.2, move: frame(f([-0.3, 0.78, -0.6], 2.3, LETTER_AZ - 14, 8, 33)) }, // the kiln fires behind
  { at: 11.0, move: frame(f([-0.15, 0.86, -0.5], 2.5, LETTER_AZ - 4, 10, 34)) }, // three-quarter reveal
  { at: GERABAHFORGE_SECONDS, move: frame(f([-0.15, 0.86, -0.5], 2.62, LETTER_AZ, 12, 34)) },
  { at: GERABAHFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getGerabahforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.2, breath: 0.01, seed: 11 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
