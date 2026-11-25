// UKIRFORGE camera: starts low and close on the chisel as the mallet strikes, rises to read the
// panel while the relief grows, drops to the bench for the spinning top and the car, glides along
// the letter blocks as they land, then a warm high three-quarter reveal while the oil goes on.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { BLOCK, TOP, WORD, blockAt, blockX, chiselUv } from "../core/motion.ts";

const FPS = 60;
export const UKIRFORGE_SECONDS = 12;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing => ({ target, az, el, dist, fov });

const PANEL_Z = -0.12;
const tipAt = (t: number): [number, number, number] => {
  const [u, v] = chiselUv(t);
  return [(u - 0.5) * 1.6, 0.08, PANEL_Z - (v - 0.5) * 1.0];
};

const RIG = shotPlan(FPS, f(tipAt(0.3), 0.75, 28, 26, 32), [
  { at: 1.6, move: frame(f(tipAt(1.6), 1.0, 18, 34, 32)) }, // the relief rising under the chisel
  { at: 3.4, move: frame(f([0, 0.05, PANEL_Z], 2.0, 8, 56, 34)) }, // the panel reads as a whole
  { at: 4.5, move: frame(f([0, 0.05, PANEL_Z], 2.2, -6, 64, 34)) },
  { at: 5.4, move: frame(f([TOP.home[0] - 0.05, 0.08, TOP.home[2]], 0.85, 26, 16, 32)) }, // gasing lands and spins
  { at: 6.9, move: frame(f([1.15, 0.1, 0.3], 1.35, 40, 18, 34)) }, // the car rolls in beside it
  ...WORD.split("").map((_, i) => ({ at: blockAt(i) + 0.45, move: frame(f([blockX(i), 0.12, BLOCK.z], 0.95, 18 - i * 3, 14, 32)) })),
  { at: 9.9, move: frame(f([0, 0.12, BLOCK.z - 0.1], 1.75, 8, 18, 34)) }, // the word AUDIRA
  { at: 11.2, move: frame(f([0.1, 0.1, 0.15], 3.2, 22, 38, 34)) }, // the whole bench, oiled panel
  { at: UKIRFORGE_SECONDS, move: frame(f([0.1, 0.1, 0.15], 3.35, 28, 40, 34)) },
  { at: UKIRFORGE_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getUkirforgeCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 1.4, breath: 0.012, seed: 5 } });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { ...shot, focus };
}
