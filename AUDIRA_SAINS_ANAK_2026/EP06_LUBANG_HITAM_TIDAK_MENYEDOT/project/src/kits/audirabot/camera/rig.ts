// AUDIRABOT Camera Rig — low-angle hero entrance, companion close-up, wide 3/4 pull-back.
//
// One continuous shot list (core/camera/moves.ts) instead of three linear segments: the old rig
// changed speed abruptly at each act boundary and jumped sideways (x 1.29 -> 0.6) and in lens
// (36 -> 32 -> 35) when an act began. The handheld breathing drift is replaced by the library's
// seeded `alive` drift. The camera swings right, back left, then right again; the swings are
// narrower (18° / -6° / 10° instead of 25° / -12° / 17°) so each turn-around eases instead of
// lurching.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface BotCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The plan runs on a fixed 8 s clock at 60 units per second; `f` is mapped onto it through
// `totalFrames`, so the acts keep their share of the film as before.
const CLOCK_FPS = 60;
const CLOCK_FRAMES = 8 * CLOCK_FPS;

// 3-Act Mascot Choreography:
// Act 1 (0–2.6 s): dramatic low-angle orbital hero entrance
// Act 2 (2.6–5.5 s): medium close-up companion dialogue tracking
// Act 3 (5.5–8 s): wide pull-back with dynamic 3/4 framing
// Heights, distances and lenses come from the old rig's framings; azimuths are narrowed.
const RIG = shotPlan(CLOCK_FPS, framingFrom([0, 0.3, 3.2], [0, 0.1, 0], 36), [
  { at: 2.6, move: frame({ ...framingFrom([1.29, 0.8, 2.8], [0, 0.12, 0], 34), az: 18 }) },
  { at: 5.5, move: frame({ ...framingFrom([-0.6, 0.8, 2.7], [0, 0.15, 0], 33), az: -6 }) },
  { at: 8.0, move: frame({ ...framingFrom([1.2, 1.4, 3.9], [0, 0.1, 0], 35), az: 10 }) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getBotCameraPose(f: number, totalFrames: number): BotCameraPose {
  const p = Math.min(Math.max(f / totalFrames, 0), 1);
  const shot = cameraAt(RIG, p * CLOCK_FRAMES, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
