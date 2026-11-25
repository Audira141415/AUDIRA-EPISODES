// CHALKCRAFT Camera Rig — a slow lateral arc in front of the subject, sinking gently from above.
//
// One continuous shot list (core/camera/moves.ts) instead of a bare sine formula, so every kit
// shares one camera system. The framings are the old arc sampled every quarter of the film
// (x = sin(p·π)·2, y = 2 + cos(p·π)·0.5, z = 4.5, looking at the origin, fov 34); `alive` adds
// the slow seeded drift. The ends now ease in and out instead of starting at full speed.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// The public API takes a film frame and the film length; the plan runs on a fixed 8 s clock at
// 60 units per second, and f / totalFrames maps onto it.
const CLOCK_FPS = 60;
const CLOCK_SECONDS = 8;

const ORIGIN: [number, number, number] = [0, 0, 0];
const arc = (p: number) =>
  framingFrom([Math.sin(p * Math.PI) * 2, 2 + Math.cos(p * Math.PI) * 0.5, 4.5], ORIGIN, 34);

// 0–2 s rise into the arc · 2–6 s pass across the front · 6–8 s settle low on the other side
const RIG = shotPlan(CLOCK_FPS, arc(0), [
  { at: 2, move: frame(arc(0.25)) },
  { at: 4, move: frame(arc(0.5)) },
  { at: 6, move: frame(arc(0.75)) },
  { at: 8, move: frame(arc(1)) },
  { at: 8, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  const p = Math.max(0, Math.min(1, f / totalFrames));
  const shot = cameraAt(RIG, p * CLOCK_SECONDS * CLOCK_FPS, CLOCK_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
