// BRONZEFORGE camera: opens close on the molten stream between the crucible lip and the sprue cup,
// slides down to the glowing cup and seam, pulls back as the mould splits and falls, circles the
// cooling casting, pushes in on the head while it is polished, studies the wing crevices as the
// verdigris spreads, then lands on a heroic low three-quarter view of the monument and its plaque.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { LIP, SPRUE, STATUE_H, TOP_Y } from "../core/motion.ts";

const FPS = 60;
export const BRONZEFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });
const mid = (k: number): [number, number, number] => [LIP[0] + (SPRUE[0] - LIP[0]) * k, LIP[1] + (SPRUE[1] - LIP[1]) * k, LIP[2] + (SPRUE[2] - LIP[2]) * k];
const S = (y: number, x = 0, z = 0): [number, number, number] => [x, TOP_Y + y * STATUE_H, z];

const RIG = shotPlan(FPS, f(mid(0.42), 1.05, 24, 4, 34), [
  { at: 1.4, move: frame(f(mid(0.75), 1.05, 12, 12, 34)) }, // down the stream to the cup
  { at: 2.6, move: frame(f([0.08, SPRUE[1] - 0.25, 0.1], 1.6, 2, 16, 34)) }, // cup + glowing seam
  { at: 3.6, move: frame(f(S(0.55), 3.5, -24, 16, 34)) }, // the whole mould as it splits
  { at: 4.7, move: frame(f(S(0.55), 2.4, 8, 6, 34)) }, // the casting glowing white-orange
  { at: 6.0, move: frame(f(S(0.62, 0.12), 1.7, 30, 10, 34)) }, // circling while it cools
  { at: 7.3, move: frame(f(S(0.78, 0.0, 0.08), 1.1, 46, 6, 32)) }, // the head as the polish passes
  { at: 8.8, move: frame(f(S(0.7, -0.2, -0.02), 1.2, -38, 16, 32)) }, // verdigris in the wing crevices
  { at: 10.2, move: frame(f(S(0.35), 2.9, -26, 6, 34)) }, // pull back to the monument
  { at: 11.5, move: frame(f(S(0.18), 3.7, -34, -5, 34)) }, // heroic low three-quarter
  { at: BRONZEFORGE_SECONDS, move: frame(f(S(0.18), 3.75, -37, -5.5, 34)) },
  { at: BRONZEFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getBronzeforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.3, breath: 0.012, seed: 11 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
