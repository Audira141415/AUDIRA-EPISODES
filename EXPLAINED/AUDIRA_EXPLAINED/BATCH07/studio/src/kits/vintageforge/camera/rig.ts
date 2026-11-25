// VINTAGEFORGE Camera Rig — a gentle arc across the subject, sinking slightly as it travels.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was one
// smooth function of progress (a half-sine arc); its framing is sampled into keys every quarter of
// the film, so the look stays the same, and `alive` adds a small seeded drift.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

/** The arc framing at progress p (0..1). */
// Sweeps across the scholar's desk; the armillary (≈3.2 units tall) stays centred in 9:16.
const arcFraming = (p: number) =>
  framingFrom([-Math.cos(p * Math.PI) * 2.6, 2.8 + Math.sin(p * Math.PI) * 0.6, 8.0 - Math.sin(p * Math.PI) * 0.9], [0, 1.45, -0.3], 40);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

// The plan depends on the film length, so it is compiled once per totalFrames.
const plans = new Map<number, ReturnType<typeof shotPlan>>();
const planFor = (totalFrames: number) => {
  let rig = plans.get(totalFrames);
  if (!rig) {
    const seconds = totalFrames / FILM_FPS;
    rig = shotPlan(FILM_FPS, arcFraming(0), [
      ...[0.25, 0.5, 0.75, 1].map((p) => ({ at: p * seconds, move: frame(arcFraming(p)) })),
      { at: seconds, move: settle() },
    ]);
    plans.set(totalFrames, rig);
  }
  return rig;
};

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  const shot = cameraAt(planFor(totalFrames), f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
