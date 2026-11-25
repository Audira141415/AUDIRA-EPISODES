// CHAINREACTION Camera Rig — establishing glide onto the chute, a calm follow down the machine,
// then a pull back to reveal the whole tower and the raised AUDIRA flag.
//
// One continuous shot list (core/camera/moves.ts) instead of a per-frame chase: the old rig
// trailed the action point at 1.7 m, so every zig-zag of the ball swung the frame (too fast) and
// the intro, flight and reveal blends stopped and restarted the camera. Here the follow is a key
// every second on a heavily smoothed, damped action point, framed a little wider so the machine
// moves inside the frame while the camera glides.

import { shotPlan, cameraAt, frame, settle, type Framing } from "../../../core/camera/moves.ts";
import { BUCKET_LAND, FLAG_UP, LAUNCH_M, MACHINE_END, actionPoint, filmTime, machineTime, type ChainTiming } from "../core/chain.ts";

export interface ChainCamera {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** distance camera → target, for the DOF focus */
  focus: number;
}

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const FOV = 34;
const D = 180 / Math.PI;
const MID_X = -0.2; // centre of the zig-zag; the follow only leans 28 % of the way toward the action

/** Old rig's framing: horizontal distance `dist`, height above the target rising with it. */
const view = (target: [number, number, number], dist: number, azRad: number, rise: number): Framing => {
  const h = rise * dist + 0.05;
  return { target, az: azRad * D, el: Math.atan2(h, dist) * D, dist: Math.hypot(dist, h), fov: FOV };
};

/** Action point averaged over ±0.8 s of machine time, pulled toward the middle of the tower. */
const calmPoint = (m: number): [number, number, number] => {
  let x = 0, y = 0, n = 0;
  for (let k = -16; k <= 16; k++) {
    const p = actionPoint(Math.min(MACHINE_END, Math.max(0, m + k * 0.05)));
    x += p[0]; y += p[1]; n++;
  }
  return [MID_X + (x / n - MID_X) * 0.28, y / n, 0];
};

function buildRig(tm: ChainTiming) {
  const intro = tm.start + 1.1; // the glide onto the chute lands as the marble reaches the shelf
  const reveal = filmTime(FLAG_UP, tm) + 0.15;
  const flight = (filmTime(LAUNCH_M, tm) + filmTime(BUCKET_LAND, tm)) / 2;
  // follow keys every 1.25 s from the end of the intro until the reveal starts
  const follow: number[] = [];
  for (let t = intro; t < reveal - 0.6; t += 1.25) follow.push(t);
  const beats = follow.map((t) => {
    const near = Math.abs(t - flight) < 0.8; // widen while the brass ball flies
    return { at: t, move: frame(view(calmPoint(machineTime(t, tm)), near ? 3.6 : 3.3, 0.4, near ? 0.17 : 0.16)) };
  });
  return shotPlan(CLOCK, view([0.62, 2.58, 0], 2.85, 0.47, 0.19), [
    ...beats,
    { at: reveal, move: frame(view(calmPoint(machineTime(reveal, tm)), 3.5, 0.5, 0.15)) },
    // the tower plus banner is ~3.5 m wide but a 9:16 frame is narrow: swing to the side for the
    // reveal so the width foreshortens (cos 0.75 ≈ 0.73) instead of backing off until it is tiny
    { at: reveal + 2.4, move: frame(view([0.5, 1.36, 0], 7.6, 0.72, 0.14)) },
    { at: reveal + 3.8, move: frame(view([0.5, 1.36, 0], 8.2, 0.78, 0.14)) },
    { at: reveal + 3.8, move: settle() },
  ]);
}

const RIGS = new Map<string, ReturnType<typeof buildRig>>();
const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/**
 * Follow-cam for one machine run.
 *  - before the run: establishing glide onto the chute;
 *  - during: a calm three-quarter follow of the action, a little wider while the brass ball flies;
 *  - after the flag is up: pulls back to reveal the whole tower and the glowing route.
 */
export function getChainCamera(t: number, tm: ChainTiming): ChainCamera {
  const key = `${tm.start}:${tm.scale}`;
  let rig = RIGS.get(key);
  if (!rig) RIGS.set(key, (rig = buildRig(tm)));
  const shot = cameraAt(rig, t * CLOCK, CLOCK, { lens: LENS, alive: true });
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return { position: shot.pos, target: shot.target, fov: shot.fov, focus };
}
