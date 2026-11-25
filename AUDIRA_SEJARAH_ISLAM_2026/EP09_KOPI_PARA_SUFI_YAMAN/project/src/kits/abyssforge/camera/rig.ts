// ABYSSFORGE Camera Rig — a slow descent through the water column that locks onto the lure.
//
// One continuous shot list (core/camera/moves.ts). The descent height still comes from
// cameraDepthY (the depth HUD reads the same clock), sampled into framing keys every 1.5 s; the
// lazy helix is gentler than before (±0.9 instead of ±1.3 units) so the column does not swing
// across the frame, and the lock onto the lure is one move instead of a target lerp on top.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";
import { cameraDepthY } from "../core/motion.ts";
import type { AbyssShot } from "../lib/post.tsx";

// Mirrors ANGLER_POS in ../scene/Lanternmaw3D.tsx (a .tsx scene module node cannot load).
const ANGLER_POS: [number, number, number] = [0.5, -37.9, -1.6];
const LURE: [number, number, number] = [ANGLER_POS[0], ANGLER_POS[1] + 0.55, ANGLER_POS[2]];

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** The descent framing at second t: free look down the column, blending into the lure lock. */
const descentFraming = (t: number) => {
  const y = cameraDepthY(t);
  const x = Math.sin(t * 0.32) * 0.9;
  const pos: [number, number, number] = [x, y, 5.4 - t * 0.09];
  const free: [number, number, number] = [x * 0.3, y - 3.0, -0.8]; // a little steeper than before (jellies spawn at y - 2.4): more of the descent reads as travel into the frame
  const lock = smooth(7.8, 10.2, t);
  const target = free.map((v, i) => v + (LURE[i] - v) * lock) as [number, number, number];
  const fov = 46 - 8 * smooth(8, 12, t);
  return framingFrom(pos, target, fov, Math.sin(t * 0.4) * 1.7);
};

//  0–7.5 s   hook + descent: sunlight, twilight, midnight zones drift past on a lazy helix
//  7.5–10.5 s the lure appears below and the camera turns onto it
//  10.5–12 s payoff: framed on the lure, still sinking gently
// [film second, descent second]: the last key lands on the 11.4 s framing, so the camera eases to
// rest on the lure instead of braking hard from full descent speed in the final beat.
const BEATS: [number, number][] = [[1.5, 1.5], [3, 3], [4.5, 4.5], [6, 6], [7.5, 7.5], [9, 9], [10.5, 10.5], [12, 11.4]];
const RIG = shotPlan(CLOCK, descentFraming(0), BEATS.map(([at, d]) => ({ at, move: frame(descentFraming(d)) })));

const LENS = { aperture: 0, maxBlur: 0, exposure: 1.15 };

/** Slow descending camera: drifts in a lazy helix, looks down the water column, then locks onto the lure. */
export const getAbyssCamera = (t: number): AbyssShot => {
  const shot = cameraAt(RIG, t * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll, exposure: LENS.exposure };
};
