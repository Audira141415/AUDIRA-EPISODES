// DEVFORGE Camera Rig — wide studio establishing shot, macro punch-in on the code line, pull-back
// revealing the spawned game reward.
//
// One continuous shot list (core/camera/moves.ts) instead of three linear segments: the old rig
// kinked at 35 % and 70 % and jumped its aim point and lens there (fov 38 -> 32 -> 36). The
// punch-in now tightens the lens and moves the aim onto the code line as one move, and the seeded
// `alive` drift replaces the sine breathing.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface DevCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes (frame, totalFrames); the plan runs on a fixed 8 s clock at 60 units per second.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

// 3-Act Cinematic Pacing (progress -> seconds on the 8 s clock):
// Act 1 (0–35 %, 0–2.8 s): Wide 3D isometric studio establishing shot
// Act 2 (35–70 %, 2.8–5.6 s): Dramatic macro punch-in to code syntax line
// Act 3 (70–100 %, 5.6–8 s): Dynamic pull-back revealing the 3D spawned game reward
const RIG = shotPlan(CLOCK_FPS, framingFrom([0.8, 0.4, 4.2], [0, 0, 0], 38), [
  { at: 2.8, move: frame(framingFrom([0.4, 0.6, 3.4], [0, 0, 0], 38)) },
  { at: 5.6, move: frame(framingFrom([-0.2, 0.3, 2.8], [-0.3, 0.1, 0], 32)) },
  { at: 8.0, move: frame(framingFrom([1.0, 0.6, 4.2], [0.3, 0, 0], 36)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getDevCameraPose(f: number, totalFrames: number): DevCameraPose {
  const p = Math.min(Math.max(f / totalFrames, 0), 1);
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
