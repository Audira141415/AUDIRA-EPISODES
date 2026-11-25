// DREAMCORE Camera Rig — a slow floating camera through the pool rooms toward the stairs to nowhere.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system. The
// old rig was already one Catmull-Rom float through five position/target keys; the same keys (and
// the lens widening 48 -> 56 between 5 and 11 s) are now framings on one C1 track that eases in
// from the hook and settles on the lit door. The slow roll sway stays on top.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { lerp, smooth } from "../core/motion.ts";
import type { DreamShot } from "../lib/post";

type V = [number, number, number];

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds

/**
 * Slow floating camera: hovers just above the pool water watching a door open by itself, drifts
 * down the tiled room under the indoor clouds, passes through the great arch and rises toward
 * the stairs to nowhere as the door at the top lights up.
 */
const KEYS: { t: number; pos: V; target: V }[] = [
  { t: 0, pos: [-0.7, 1.0, 8.9], target: [1.0, 1.0, 4.6] },
  { t: 3, pos: [-0.3, 1.25, 6.2], target: [0.4, 1.6, 0] },
  { t: 6, pos: [0.2, 1.6, 2.2], target: [0.5, 2.0, -6] },
  { t: 9, pos: [0.4, 2.0, -1.8], target: [1.4, 2.6, -12] },
  { t: 12, pos: [0.7, 2.4, -4.6], target: [1.8, 3.1, -14.5] },
];
const fovAt = (t: number) => lerp(48, 56, smooth(5, 11, t));
const framingAt = (k: (typeof KEYS)[number]) => framingFrom(k.pos, k.target, fovAt(k.t));

const RIG = shotPlan(CLOCK, framingAt(KEYS[0]), [
  ...KEYS.slice(1).map((k) => ({ at: k.t, move: frame(framingAt(k)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 0.68 };

export const getDreamCamera = (t: number): DreamShot => {
  const shot = cameraAt(RIG, t * CLOCK, CLOCK, { lens: LENS, alive: true });
  return {
    pos: shot.pos,
    target: shot.target,
    fov: shot.fov,
    roll: Math.sin(t * 0.33) * 0.025,
    exposure: LENS.exposure,
  };
};
