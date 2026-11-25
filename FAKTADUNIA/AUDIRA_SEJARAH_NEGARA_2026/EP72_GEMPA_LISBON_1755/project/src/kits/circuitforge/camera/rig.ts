// CIRCUITFORGE Camera Rig — Macro trace tracking, 3/4 orbital chip reveal & schematic pull-back.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased segments: the old rig
// stopped dead at each segment boundary and snapped its look-at target from the trace to the chip.
// The orbit swings 44° instead of 57° and starts higher (el 45), and the macro ends a little wider,
// so the pull-back to the top-down view stays under half the frame per second.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface CircuitCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

// Seconds on the 60 fps film clock:
// 1. 0–2 s: macro close-up tracking the power pulse along the copper trace
// 2. 2–5.4 s: 3/4 orbital sweep revealing the central BGA processor (wide enough for 9:16:
//    the 3.2-unit BGA package plus nearby traces stay in view)
// 3. 5.4–8 s: vertical pull-back into a crisp top-down engineering view (about 6 units across
//    in 9:16: chip, traces, test pads)
const RIG = shotPlan(FILM_FPS, { target: [-1.5, 0.1, 0], az: -26, el: 30, dist: 3.3, fov: 32 }, [
  { at: 2.0, move: frame({ target: [-1.1, 0.1, 0], az: -23, el: 31, dist: 3.6, fov: 31 }) },
  { at: 5.4, move: frame({ target: [0, 0.2, 0], az: -6, el: 40, dist: 6.0, fov: 37 }) },
  { at: 8.0, move: frame(framingFrom([0, 13.5, 4.0], [0, 0, 0.4], 40)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getCircuitCameraPose = (f: number, _totalFrames = 480): CircuitCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
