// BACKROOMS Camera Rig — a slow found-footage walk down the yellow corridor toward the far wall.
//
// One shot list (core/camera/moves.ts). The old walk looped (z = (t * 0.55) % 3), so the camera
// teleported back 3 units every 5.5 s; it is now one continuous walk over the same 3 units across
// the whole film. The walk bob and sway stay on top of the plan; the bob is sin² instead of |sin|
// so each step is soft instead of a velocity kink.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface BackroomsCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;
const TARGET: [number, number, number] = [0, 1.3, -4.0];

//  0 s    standing in the corridor (z 4.8)
//  12 s   3 units further in (z 1.8), eased to rest
const RIG = shotPlan(FILM_FPS, framingFrom([0, 1.35, 4.8], TARGET, 58), [
  { at: 4, move: frame(framingFrom([0, 1.35, 3.85], TARGET, 58)) },
  { at: 8, move: frame(framingFrom([0, 1.35, 2.75], TARGET, 58)) },
  { at: SECONDS, move: frame(framingFrom([0, 1.35, 1.8], TARGET, 58)) },
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getBackroomsCamera = (f: number): BackroomsCameraConfig => {
  const t = f / FILM_FPS;
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  const sway = Math.sin(t * 2.1) * 0.08;
  const bob = Math.sin(t * 4.2) ** 2 * 0.06;
  return {
    position: [shot.pos[0] + sway, shot.pos[1] + bob, shot.pos[2]],
    target: [shot.target[0] + sway * 0.5, shot.target[1], shot.target[2]],
    fov: shot.fov,
  };
};
