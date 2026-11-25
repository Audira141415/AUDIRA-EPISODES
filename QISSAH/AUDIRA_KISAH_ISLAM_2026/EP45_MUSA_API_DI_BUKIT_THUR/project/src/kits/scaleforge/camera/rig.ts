// SCALEFORGE camera — the zoom itself happens in the world transform (core/motion zoomAt), so the lens can
// stay in a steady, slowly orbiting 3/4 product shot: continuous yaw, gentle rise, slight push.
//
// One shot list (core/camera/moves.ts) like every other kit. The framings are the old formula sampled
// every 3 s (yaw −0.24 → 0.22 rad, horizontal distance 10.4 → 9.6, height 1 → 1.6 → 1); `alive`
// replaces the small yaw wobble.
import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export type ScalePose = { position: [number, number, number]; target: [number, number, number]; fov: number };

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const AIM: [number, number, number] = [0, 0.1, 0];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** The product framing at film progress k (0..1). */
const product = (k: number) => {
  const yaw = -0.24 + k * 0.46;
  const dist = 10.4 - k * 0.8;
  return framingFrom([Math.sin(yaw) * dist, 1.0 + Math.sin(k * Math.PI) * 0.6, Math.cos(yaw) * dist], AIM, 36);
};

const RIG = shotPlan(CLOCK, product(0), [
  ...[3, 6, 9, 12].map((at) => ({ at, move: frame(product(at / 12)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getScaleCamera = (t: number): ScalePose => {
  const shot = cameraAt(RIG, Math.max(0, Math.min(12, t)) * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};

/** Visible frame height in render units at the target distance (for the HUD exponent). */
export const frameHeightUnits = (t: number) => {
  const dist = 10.4 - clamp01(t / 12) * 0.8;
  return 2 * dist * Math.tan((36 * Math.PI) / 360);
};
