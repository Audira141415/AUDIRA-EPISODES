// COLLAGE motion: pieces are placed by hand on twelves (stop motion), the camera stays smooth.
// Pure functions of film time; no wall clock, no unseeded randomness.

import { paperJitter, stepTime } from "../../../core/film/craft.ts";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Stop-motion rate of the hand-placed pieces. */
export const PLACE_FPS = 12;
/** A piece takes this long to land (three or four stop-motion frames). */
export const PLACE_DUR = 0.3;

export type Placement = {
  /** false before the piece is placed */
  shown: boolean;
  /** offset from the resting position, world units */
  dx: number;
  dy: number;
  /** lift off the board while it is being placed (it comes from the camera side) */
  lift: number;
  /** extra rotation (radians) while it is being placed */
  rot: number;
  /** press: 1 → 1.04 → 1 as the hand flattens it */
  press: number;
};

/**
 * Where a piece is at film time t when its hand starts placing it at t0. It slides in from
 * `from` (unit direction) on twelves, overshoots a hair, is pressed flat, then boils in place.
 */
export function place(t: number, t0: number, i: number, from: [number, number] = [0.6, 0.4]): Placement {
  const ts = stepTime(t, PLACE_FPS);
  if (ts < t0) return { shown: false, dx: 0, dy: 0, lift: 0, rot: 0, press: 1 };
  const k = clamp01((ts - t0) / PLACE_DUR);
  const e = easeOutCubic(k);
  const travel = (1 - e) * 0.9;
  const [jx, jy, jr] = paperJitter(t, i, { boilFps: PLACE_FPS, px: 1, deg: 0.2, seed: 31 });
  const pressK = clamp01((ts - t0 - PLACE_DUR) / 0.17);
  const press = 1 + 0.04 * Math.sin(pressK * Math.PI);
  return {
    shown: true,
    dx: from[0] * travel + jx * 0.003,
    dy: from[1] * travel + jy * 0.003,
    lift: (1 - e) * 0.35,
    rot: (1 - e) * 0.28 * Math.sign(from[0] || 1) + (jr * Math.PI) / 180,
    press,
  };
}
