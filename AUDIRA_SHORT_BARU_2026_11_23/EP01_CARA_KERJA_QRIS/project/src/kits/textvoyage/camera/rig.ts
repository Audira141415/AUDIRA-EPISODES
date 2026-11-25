// TEXTVOYAGE Camera Rig — a slow flight down the corridor axis toward the giant words ahead.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was one
// smooth function of progress (a gentle sway and rise); its framing is sampled into keys every
// quarter of the film, so the look stays the same, and `alive` adds a small seeded drift.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

/** The corridor framing at progress p (0..1): sway and rise, always looking at the words far ahead. */
const corridorFraming = (p: number) =>
  framingFrom([Math.sin(p * Math.PI) * 0.6, 4.6 + p * 0.2, 4.5], [0, 2.4 + p * 0.6, -20], 40);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

// The plan depends on the film length, so it is compiled once per totalFrames.
const plans = new Map<number, ReturnType<typeof shotPlan>>();
const planFor = (totalFrames: number) => {
  let rig = plans.get(totalFrames);
  if (!rig) {
    const seconds = totalFrames / FILM_FPS;
    rig = shotPlan(FILM_FPS, corridorFraming(0), [
      ...[0.25, 0.5, 0.75, 1].map((p) => ({ at: p * seconds, move: frame(corridorFraming(p)) })),
      { at: seconds, move: settle() },
    ]);
    plans.set(totalFrames, rig);
  }
  return rig;
};

export function getCameraPose(f: number, totalFrames: number): CameraPose {
  // The target sits ~25 units ahead, so a smaller drift keeps the near words from swinging.
  const shot = cameraAt(planFor(totalFrames), f, FILM_FPS, { lens: LENS, alive: { deg: 0.8 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
}
