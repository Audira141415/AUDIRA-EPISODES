// TACTICBOARD camera — broadcast-analysis sweep: high tactical overhead -> low pitch-side angle at the goal.
//
// One continuous shot list (core/camera/moves.ts). The old hand-made Catmull-Rom re-eased every span
// on its own (a speed dip at each key) and its last two seconds swung 70° round the goal (about two
// frame widths a second). Now the overhead-to-pitch sweep is one swoop (the 5.6 s key, which the
// spherical path passes close to, is gone), and the finish slides a shorter way along the goal line
// (ending just right of centre instead of left of it, without the 9.8 s pause).
import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export type TacticPose = { position: [number, number, number]; target: [number, number, number]; fov: number };

type V = [number, number, number];
const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds

//  0–3 s     high tactical overhead, drifting toward the attacking side
//  3–7.8 s   one swoop down from the overhead to a low angle beside the box
//  7.8–12 s  pitch-side at the goal, sliding along the goal line for the finish
const KEYS: [number, V, V, number][] = [
  [3.0, [1.6, 10.4, 5.4], [0.9, 0, -1.2], 42],
  [7.8, [2.9, 1.55, -1.6], [0.1, 0.35, -4.7], 40],
  [12, [0.3, 1.75, -2.1], [0.05, 0.15, -4.6], 40],
];
const RIG = shotPlan(CLOCK, framingFrom([0.4, 12.6, 6.2], [0.2, 0, -0.4], 44), [
  ...KEYS.map(([at, pos, aim, fov]) => ({ at, move: frame(framingFrom(pos, aim, fov)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getTacticCamera = (t: number): TacticPose => {
  const shot = cameraAt(RIG, Math.max(0, Math.min(12, t)) * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
