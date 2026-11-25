// SULAMFORGE Camera Rig — macro embroidery camera.
//  0–2 s    hook: extreme macro on the needle laying the first satin petal
//  2–6.2 s  rise and arc: the flower fills stitch by stitch
//  6.2–9.2 s reveal the hoop, the gold diamond ring and the songket cloth
//  9.2–12 s payoff: a light sweep makes every gold float glint; slow push-in
//
// One continuous shot list (core/camera/moves.ts) instead of blended ramps: the old macro hook
// re-aimed at the needle tip every frame, so the 0.8-unit-close camera jerked with each stitch
// (several frame widths a second) and snapped back at 2.4 s when the tracking stopped; the reveal
// then rose in under two seconds. The hook now glides along the petal the needle is working
// (framings sampled from the old tip track at 0 and 2 s), and the rise and reveal each take about
// three seconds. `alive` replaces the hand-made micro drift.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface SulamCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

type V3 = [number, number, number];
const FILM_FPS = 60;

/**
 * The macro framing: 0.3 right, 0.36 up and 0.62 toward the viewer from the aim point on the petal;
 * `lift` already starts the rise (a little higher and further) so the hook hands over without a stop.
 */
const macro = (aim: V3, lift = 0) =>
  framingFrom([aim[0] + 0.3 * (1 + lift), 0.46 + lift * 0.8, aim[2] + 0.62 * (1 + lift)], aim, 30 + lift * 6);

const RIG = shotPlan(FILM_FPS, macro([0.04, 0.1, -0.19]), [
  { at: 2.0, move: frame(macro([0.11, 0.1, -0.4], 0.08)) },
  { at: 6.2, move: frame(framingFrom([0.9, 1.5, 1.7], [0.05, 0.1, -0.05], 36)) },
  { at: 9.2, move: frame(framingFrom([-0.35, 3.1, 2.5], [0, 0, -0.1], 34)) },
  { at: 12, move: frame(framingFrom([0.1, 2.6, 1.95], [0, 0, -0.1], 34)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getSulamCamera = (f: number): SulamCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
