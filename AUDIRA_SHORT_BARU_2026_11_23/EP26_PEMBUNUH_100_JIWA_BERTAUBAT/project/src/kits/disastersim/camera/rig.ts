// DISASTERSIM camera — starts nose-to-nose with the locked fault on the cut face, pulls back to a 3/4
// overview at the rupture, then travels with the wave toward the coastal town. Small damped shake at the slip.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was a
// Catmull-Rom spline whose half-smoothstep timing halved the speed at every key; the same keys now
// sit on one C1 track. The left/right swings at 5 s and 7.8 s are a little narrower (azimuth -16°
// and 12° instead of -22° and 17°) so the turns at the far sides do not brake and re-accelerate
// hard. The slip shake is still added on top, after the plan.
import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { clamp, shake } from "../core/motion.ts";

export type DisasterPose = { position: [number, number, number]; target: [number, number, number]; fov: number };

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds

//  0 s     nose-to-nose with the locked fault on the cut face
//  2.6 s   the slip: pulled back, shake starts
//  5 s     3/4 overview from the left
//  7.8 s   swing to the right as the wave travels
//  10.2 s  travelling with the wave toward the coast
//  12 s    the coastal town, eased to rest
const RIG = shotPlan(CLOCK, framingFrom([1.6, -0.8, 7.6], [0.9, -1.45, 1.8], 40), [
  { at: 2.6, move: frame(framingFrom([0.6, -0.3, 10.6], [0.6, -1.5, 0.6], 40)) },
  { at: 5.0, move: frame({ ...framingFrom([-5.2, 4.6, 13.5], [0.3, -1.1, 0.0], 40), az: -16 }) },
  { at: 7.8, move: frame({ ...framingFrom([5.0, 4.2, 11.5], [1.5, -0.5, 0.0], 40), az: 12 }) },
  { at: 10.2, move: frame(framingFrom([0.4, 2.3, 8.2], [2.2, -0.1, 0.0], 40)) },
  { at: 12, move: frame(framingFrom([-0.4, 2.9, 7.2], [2.5, 0.0, -0.2], 40)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getDisasterCamera = (t: number): DisasterPose => {
  const shot = cameraAt(RIG, clamp(t, 0, 12) * CLOCK, CLOCK, { lens: LENS, alive: true });
  const [sx, sy] = shake(t);
  return { position: [shot.pos[0] + sx, shot.pos[1] + sy, shot.pos[2]], target: shot.target, fov: shot.fov };
};
