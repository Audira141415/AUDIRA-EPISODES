// BRUTALFORGE Camera Rig — a slow arc across the subject and back, one continuous move.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system. The
// old rig was one smooth sine arc out and back; it now sweeps left to right across the stage. Its framings at
// progress 0, 0.25, 0.5, 0.75 and 1 are now keys on one C1 track that eases in and out at the ends.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes (frame, totalFrames); the plan runs on a fixed 8 s clock at 60 units per second.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

// Arc across the boombox stage (~5 units wide), framed for 9:16 with room for the overlay boxes.
const arc = (p: number) =>
  framingFrom([-Math.cos(p * Math.PI) * 3.0, 3.4 + Math.sin(p * Math.PI) * 0.6, 9.2 - Math.sin(p * Math.PI) * 0.9], [0, 1.25, 0], 40);

const RIG = shotPlan(CLOCK_FPS, arc(0), [
  ...[0.25, 0.5, 0.75, 1].map((p) => ({ at: p * CLOCK_SECONDS, move: frame(arc(p)) })),
  { at: CLOCK_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  const p = Math.max(0, Math.min(1, f / totalFrames));
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
