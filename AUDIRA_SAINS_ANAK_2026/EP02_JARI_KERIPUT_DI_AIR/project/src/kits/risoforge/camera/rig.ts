// RISOFORGE Camera Rig — top-down over the zine spread, swing down to the page edge, dolly low
// through the paper layers toward the sun, gentle rise on the payoff.
//
// One continuous shot list (core/camera/moves.ts) instead of four overlapping eased ramps: the old
// rig eased to rest and restarted between the swing and the dolly, and its hand-held breath is now
// the seeded `alive` drift. The framings are sampled from the old ramps at each beat; the up vector
// still turns from "spine at the top of the frame" (top-down) to world up as before.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { BEAT, type V3, easeInOut, lerp3, ramp, smooth } from "../core/motion.ts";

export interface RisoCameraConfig {
  position: V3;
  target: V3;
  up: V3;
  fov: number;
}

const FILM_FPS = 60;

/** The old ramps (without the hand-held breath) at second t, used to place the keys. */
const framingAt = (t: number) => {
  const top: V3 = lerp3([0.15, 11.5, 4.6], [0.1, 10.2, 4.4], smooth(ramp(t, 0, 1.8)));
  const swingK = easeInOut(ramp(t, 1.6, BEAT.dollyStart + 0.4));
  const dollyK = easeInOut(ramp(t, BEAT.dollyStart, 10.6));
  const riseK = smooth(ramp(t, 10.0, BEAT.end));
  let position = lerp3(lerp3(top, [-0.25, 2.3, 14.2], swingK), [-0.2, 1.5, 9.8], dollyK);
  position = [position[0] + 0.15 * riseK, position[1] + 0.45 * riseK, position[2] + 0.4 * riseK];
  const target = lerp3(lerp3([0, 0, 3.9], [0, 1.7, 2.2], swingK), [0.35, 2.4, 0], dollyK);
  return framingFrom(position, target, 34 + 6 * dollyK);
};

// (1) 0–1.5 s top-down over the printed zine spread, the tilt only beginning, (2) to 6 s swing down
// to the page edge as the layers pop up, (3) 6–10.6 s dolly low through the paper layers toward the
// sun, (4) gentle rise on the payoff. The swing now spans 0–6 s and blends into the dolly without
// braking: the old cubic ramp turned the view 83° in about 2 s, far faster than the eye can follow.
const RIG = shotPlan(FILM_FPS, framingAt(0), [
  { at: 6.0, move: frame(framingAt(6.0)) },
  { at: 10.6, move: frame(framingAt(10.6)) },
  { at: BEAT.end, move: frame(framingAt(BEAT.end)) },
  { at: BEAT.end, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getRisoCamera = (f: number): RisoCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  // up vector: screen-up points at the spine while top-down, then world-up (driven by the camera's
  // elevation, so it turns with the swing whatever its timing)
  const d = shot.target.map((v, i) => shot.pos[i] - v);
  const el = (Math.asin(d[1] / Math.hypot(d[0], d[1], d[2])) * 180) / Math.PI;
  const upK = smooth(ramp(el, 86, 30));
  const up: V3 = [0, upK, -(1 - upK)];
  return { position: shot.pos, target: shot.target, up, fov: shot.fov };
};
