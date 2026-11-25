// EP06 subject: the Vice President's chair through six moments (1945 → 2026). One parameter tree
// holds every part of every era; parts that an era lacks are parked (scaled to 0).
// Units: world units (~1 = 7 cm). Object origin = centre of the seat; front = +z, top = +y.

import type { MatState } from "../../../core/materials/sweep.ts";

export type Chair = {
  /** Seat cushion (engine Slab, horizontal: hh = half thickness, d = depth). */
  seat: { hw: number; hh: number; d: number; rc: number; reF: number; reB: number };
  /** Backrest (engine Slab, vertical) and its lean in degrees. */
  back: { hw: number; hh: number; d: number; rc: number; reF: number; reB: number; tilt: number };
  /** Armrests: block height above the seat (0 = none), width, length. */
  arm: { h: number; w: number; len: number };
  /** Legs: height under the seat, leg radius, four-leg weight (0..1), pedestal weight (0..1). */
  legs: { h: number; r: number; four: number; ped: number };
  /** "KOSONG" tape across the chair (0 = rolled up, 1 = full). */
  tape: { k: number };
  mats: { cushion: MatState; frame: MatState; tape: MatState };
};

/** Story props keyed to the VO (0 = hidden, 1 = fully in): letter on the seat, two candidate
 *  boards, the 60-day ring, and the DPR / MK / MPR pillars. */
export type ChairFx = { env: number; cards: number; ring: number; dpr: number; mk: number; mpr: number };
export const NO_FX = { env: [{ f: 0, v: [0] }], cards: [{ f: 0, v: [0] }], ring: [{ f: 0, v: [0] }], dpr: [{ f: 0, v: [0] }], mk: [{ f: 0, v: [0] }], mpr: [{ f: 0, v: [0] }] };
