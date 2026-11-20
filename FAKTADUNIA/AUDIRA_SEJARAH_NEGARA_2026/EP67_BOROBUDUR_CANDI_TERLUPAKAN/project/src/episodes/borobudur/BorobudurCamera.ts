// EP67 Borobudur — 5-Act Multi-Scene Camera Choreography mapped to 95-second VO clock.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../core/camera/moves.ts";
import { BSECONDS } from "./BorobudurMotion.ts";

const FPS = 60;
const f = (target: [number, number, number], dist: number, az: number, el: number, fov = 34): Framing =>
  ({ target, az, el, dist, fov });

/** Opening pose — close-up stone interlocking in Kedu Valley */
export const BORO_OPEN = f([0, 0.4, 0.6], 2.8, 25, 14, 30);

const RIG = shotPlan(FPS, BORO_OPEN, [
  // ACT 1: Kedu Valley Foundation (0–16s)
  { at: 7.0,  move: frame(f([0, 0.9, 0], 6.5, 35, 20, 34)) },
  { at: 15.8, move: frame(f([0, 1.1, 0], 7.0, 38, 18, 34)) },

  // ACT 2: Mandala Architecture & 504 Buddha (16–43s)
  { at: 16.0, move: frame(f([0, 1.5, 0], 7.8, 15, 12, 34)) },
  { at: 25.5, move: frame(f([0.8, 1.4, 0.4], 3.2, 55, 8, 28)) },
  { at: 33.0, move: frame(f([0, 2.6, 0], 4.8, 90, 16, 32)) },
  { at: 42.8, move: frame(f([0, 2.2, 0], 7.2, 130, 24, 34)) },

  // ACT 3: Merapi Volcanic Eruption & 700 Years Jungle Burial (43–58s)
  { at: 43.0, move: frame(f([0, 2.2, -4], 10.5, -20, 14, 38)) },
  { at: 50.0, move: frame(f([0, 1.2, 0], 8.0, -10, 8, 34)) },
  { at: 57.8, move: frame(f([0, 0.8, 0], 7.5, 5, 6, 32)) },

  // ACT 4: Raffles 1814 Discovery & UNESCO Restoration (58–80s)
  { at: 58.0, move: frame(f([0, 1.4, 1.2], 5.8, 30, 12, 30)) },
  { at: 69.0, move: frame(f([0, 1.8, 0], 6.8, 45, 28, 32)) },
  { at: 79.8, move: frame(f([0, 2.2, 0], 6.5, 40, 18, 32)) },

  // ACT 5: Epic Golden Sunrise Over Kedu Valley (80–95s)
  { at: 80.0, move: frame(f([0, 2.8, 0], 5.2, 140, 14, 30)) },
  { at: 87.0, move: frame(f([0, 3.4, 0], 4.2, 180, 12, 28)) },
  { at: 94.0, move: frame(f([0, 3.6, 0], 4.0, 195, 10, 28)) },
  { at: BSECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getBorobudurCamera(t: number) {
  const shot = cameraAt(RIG, t * FPS, FPS, { lens: LENS, alive: { deg: 0.6, breath: 0.005, seed: 67 } });
  const focus = Math.hypot(
    shot.pos[0] - shot.target[0],
    shot.pos[1] - shot.target[1],
    shot.pos[2] - shot.target[2],
  );
  return { ...shot, focus };
}
