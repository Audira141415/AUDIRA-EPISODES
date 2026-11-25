// STAINEDGLASS Camera Rig — reverent pull-back: starts nose-to-glass on the rose's golden heart while
// the first panes seat, glides back through the nave as the lancet assembles top-down, then sinks low
// so the coloured light pools on the floor lead the eye up to the finished window.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was a
// position/target spline with its own lens curve; the same keys (plus the start and end of the lens
// widening, 1.5 s and 9.5 s) become framing beats, so the look stays the same.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { lerp, smooth, track } from "../core/motion.ts";
import type { StainedShot } from "../lib/post.tsx";

const POS = [
  { t: 0, v: [0.25, 2.7, 3.1] as [number, number, number] },
  { t: 2.2, v: [0.6, 2.2, 4.4] as [number, number, number] },
  { t: 5, v: [1.5, 0.4, 8.2] as [number, number, number] },
  { t: 8, v: [0.8, -1.2, 10.8] as [number, number, number] },
  { t: 10.5, v: [-0.6, -1.8, 12.0] as [number, number, number] },
  { t: 12, v: [-1.0, -2.0, 12.4] as [number, number, number] },
];
const TARGET = [
  { t: 0, v: [0, 2.75, 0] as [number, number, number] },
  { t: 2.2, v: [0, 2.5, 0] as [number, number, number] },
  { t: 5, v: [0, 1.3, 0] as [number, number, number] },
  { t: 8, v: [0, -0.2, 0.8] as [number, number, number] },
  { t: 10.5, v: [0, -1.1, 1.0] as [number, number, number] },
  { t: 12, v: [0, -1.1, 1.0] as [number, number, number] },
];

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const DEG = 180 / Math.PI;

/** The nave framing at second t: the old spline, lens widening 38 -> 60 and a faint roll (degrees). */
const naveFraming = (t: number) =>
  framingFrom(track(POS, t), track(TARGET, t), lerp(38, 60, smooth(1.5, 9.5, t)), Math.sin(t * 0.35) * 0.012 * DEG);

const RIG = shotPlan(CLOCK, naveFraming(0), [
  ...[1.5, 2.2, 3.6, 5, 6.5, 8, 9.5, 10.5, 12].map((t) => ({ at: t, move: frame(naveFraming(t)) })),
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1.05 };

export const getStainedCamera = (t: number): StainedShot => {
  const shot = cameraAt(RIG, Math.max(0, Math.min(12, t)) * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll, exposure: LENS.exposure };
};
