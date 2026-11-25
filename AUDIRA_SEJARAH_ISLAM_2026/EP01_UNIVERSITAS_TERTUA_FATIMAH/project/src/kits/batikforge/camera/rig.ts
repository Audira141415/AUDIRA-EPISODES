// BATIKFORGE camera: a macro that rides along with the canting tip, a pull back to the whole kain while
// the wax spreads, a slow push while the indigo climbs, then a crane up beside the mega mendung clouds
// as they lift off the cloth toward the lens.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { CLOTH_Y, tipAt } from "../scene/Cloth3D.tsx";

const FPS = 60;
export const BATIK_SECONDS = 12;
/** Beat times (seconds). */
export const BEAT = { drawEnd: 3.0, waxEnd: 5.8, dyeStart: 6.0, dyeEnd: 8.0, sogaEnd: 8.4, lift: 8.6 };

const f = (target: [number, number, number], dist: number, az: number, el: number, fov: number): Framing => ({ target, az, el, dist, fov });

function buildRig() {
  // follow the tip: a key every 0.5 s on the drawn line
  const follow = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((at) => ({ at, move: frame(f(tipAt(at / BEAT.drawEnd), 0.46, -36, 16, 30)) }));
  return shotPlan(FPS, f(tipAt(0), 0.42, -32, 18, 30), [
    ...follow,
    { at: 3.6, move: frame(f([0.0, CLOTH_Y + 0.1, 0], 1.6, 8, 6, 32)) },
    { at: BEAT.waxEnd, move: frame(f([0, CLOTH_Y, 0], 3.7, -8, 4, 34)) }, // the whole kain
    { at: BEAT.dyeEnd, move: frame(f([0, CLOTH_Y, 0], 3.3, 6, 4, 34)) },
    { at: 10.4, move: frame(f([0.05, CLOTH_Y + 0.3, 0.5], 2.5, 24, 14, 34)) }, // clouds lift: crane beside them
    { at: BATIK_SECONDS, move: frame(f([0.05, CLOTH_Y + 0.32, 0.55], 2.7, 32, 16, 34)) },
    { at: BATIK_SECONDS, move: settle() },
  ]);
}

let RIG: ReturnType<typeof buildRig> | null = null;
const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getBatikCamera(t: number) {
  RIG ??= buildRig();
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1, breath: 0.008, seed: 9 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
