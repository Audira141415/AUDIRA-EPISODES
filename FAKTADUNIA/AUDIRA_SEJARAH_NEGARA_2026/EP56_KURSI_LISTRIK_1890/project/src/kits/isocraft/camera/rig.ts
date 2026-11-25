// ISOCRAFT Camera Rig — a slow arc across the isometric diorama and back, one continuous move.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system. The
// old rig was already one smooth sine arc (x = 2·sin(πp), y = 2 + 0.5·cos(πp)); its framings at
// progress 0, 0.25, 0.5, 0.75 and 1 are now keys on one C1 track that eases in and out at the ends.
// The isometric look wants a near-locked camera, so the seeded drift is a third of the default.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes (frame, totalFrames); the plan runs on a fixed 8 s clock at 60 units per second.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

// Near-orthographic isometric orbit (long lens, 30° elevation) sweeping 25° → 65° azimuth.
const ISO_TARGET: [number, number, number] = [0, 1.15, 0];
const arc = (p: number) => {
  const az = ((25 + 40 * p) * Math.PI) / 180;
  const el = (30 * Math.PI) / 180;
  const d = 25 - Math.sin(p * Math.PI) * 2;
  return framingFrom(
    [Math.sin(az) * Math.cos(el) * d, ISO_TARGET[1] + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d],
    ISO_TARGET,
    24,
  );
};

const RIG = shotPlan(CLOCK_FPS, arc(0), [
  ...[0.25, 0.5, 0.75, 1].map((p) => ({ at: p * CLOCK_SECONDS, move: frame(arc(p)) })),
  { at: CLOCK_SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  const p = Math.max(0, Math.min(1, f / totalFrames));
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: { deg: 0.6, breath: 0.004 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
