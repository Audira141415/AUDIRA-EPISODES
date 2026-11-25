// TOYDIORAMA: Static Theatrical Camera Rig
// Consistent eye-level / slightly elevated macro perspective
// STRICT RULE: No pan, no tilt, no zoom, consistent framing
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system. The
// camera is deliberately locked off (a theatre proscenium): one held framing, no drift (`alive` off).

import { shotPlan, cameraAt, framingFrom, hold } from "../../../core/camera/moves.ts";

export interface ToyDioramaCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const CLOCK = 60;
// Macro cinema lens feel (fov 32), eye level just above the stage floor
const RIG = shotPlan(CLOCK, framingFrom([0, 1.75, 6.4], [0, 1.35, 0], 32), [{ at: 0, move: hold() }]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getToyDioramaCamera = (): ToyDioramaCameraConfig => {
  const shot = cameraAt(RIG, 0, CLOCK, { lens: LENS, alive: false });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
