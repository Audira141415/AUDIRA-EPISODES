// Shot list for EP04, one continuous camera over one world (market at the origin, the map table
// at x ≈ -11, Giza / Nile / Cairo palace at x ≈ +9..+16). Every key sits on a word time (W).
// Channels: pos x y z, target x y z, fov. Hold keys ease to rest before a big move (no overshoot).

import { sample, type Key } from "../../core/motion/track.ts";
import { COVER } from "./framing.ts";
import { W, WE, TOTAL } from "./time.ts";
import { mapX, mapZ } from "./layout.ts";

type V3 = [number, number, number];
type Pose = { t: number; pos: V3; tgt: V3; fov: number; hold?: boolean; stay?: number };

/** stay = seconds the camera rests on this framing before the next move starts (a second hold key). */
const P = (t: number, pos: V3, tgt: V3, fov: number, hold = false, stay = 0): Pose => ({ t, pos, tgt, fov, hold, stay });

// Zone changes are cuts hidden under a full-dark dusk veil (HD-2D zone fade): the camera never
// flies between sets, so there are no long fast legs. Each set is its own smooth track where every
// key is a hold (ease in and out on every leg, no overshoot, keys >= 1.5 s apart).
export const CUTS: number[] = [
  (W("musa") - 0.4 + W("mali") + 0.2) / 2, // market -> map table
  W("1324") + 0.5, // map table -> Giza camp
  (W("rombongannya") + 0.6 + W("sejarawan") + 1.6) / 2, // palace -> market desk
  W("tapi") - 0.5, // chronicler's desk -> the twist in the lane (fade on the sentence break)
  (WE("bekal") + W("raja")) / 2, // empty chest -> lender's table (lane-to-counter move was too fast)
  (W("eropa") - 0.5 + W("atlas") + 0.8) / 2, // lender's table -> Atlas vellum
];
const [C1, C2, C3, C6, C5, C4] = CUTS;

const H = (t: number, pos: V3, tgt: V3, fov: number, stay = 0) => P(t, pos, tgt, fov, true, stay);

export const SEGMENTS: Pose[][] = [
  [
    // HOOK: the approved cover framing, then a push that lifts the balance clear of the bottom band.
    H(0, COVER.pos, COVER.target, COVER.fov),
    H(W("jatuh") + 0.2, [0.12, 2.3, 6.1], [0, 0.72, -0.3], 34),
    H(C1, [0.12, 3.2, 7.0], [0, 0.9, -0.3], 36),
  ],
  [
    // CONTEXT: the map table of West Africa
    H(C1, [mapX(-2) - 1.8, 5.4, mapZ(14) + 4.4], [mapX(-2), 0.15, mapZ(17)], 36),
    H(W("mali") + 0.9, [mapX(-2) - 1.2, 4.2, mapZ(14) + 3.4], [mapX(-2), 0.15, mapZ(17)], 34),
    H(W("bambuk"), [mapX(-5) - 1.3, 3.5, mapZ(12) + 3.0], [mapX(-6), 0.15, mapZ(15)], 34),
    H(W("empat"), [mapX(-5) - 3.4, 5.8, mapZ(17) + 2.8], [mapX(7), 0.1, mapZ(21)], 38),
    H(W("rombongan") + 0.5, [mapX(1) - 2.6, 3.4, mapZ(23) + 2.2], [mapX(8), 0.15, mapZ(26)], 34),
    H(C2, [mapX(1) - 3.2, 4.3, mapZ(23) + 2.9], [mapX(8), 0.15, mapZ(26)], 36),
  ],
  [
    // MAIN: the camp beside the pyramids, the Nile, the palace
    H(C2, [10.6, 3.0, 5.0], [9.9, 0.9, -2.2], 36),
    H(W("berkemah") + 0.6, [10.4, 2.0, 3.6], [9.9, 0.9, -2.2], 34),
    H(W("giza"), [10.2, 2.9, 3.4], [9.4, 1.0, -5.6], 34),
    // the boat lands: framed on the crossing with the palace gate behind (subject centred, not cropped)
    H(W("kairo", 2) - 0.3, [12.4, 2.7, 4.3], [13.4, 0.35, 0.1], 34),
    H(W("ia", 2), [14.9, 2.3, 3.7], [16.0, 1.1, -1.9], 34),
    H(W("pejabat") + 0.15, [16.4, 1.9, 2.6], [16.3, 0.55, -1.7], 38),
    H(W("rombongannya") + 0.5, [15.7, 3.4, 5.4], [15.4, 0.6, -1.6], 40),
    H(C3, [15.6, 4.0, 6.2], [15.4, 0.6, -1.6], 40),
  ],
  [
    // EXPLANATION: the chronicler's desk, the balance, the flood of gold, the price slate
    H(C3, [3.0, 2.2, 5.3], [1.75, 0.78, 2.0], 34),
    H(W("mencatatnya") + 1.2, [2.5, 1.5, 4.0], [1.75, 0.78, 2.0], 32, W("pejabat", 2) - W("mencatatnya") - 0.9),
    H(W("satu", 2) + 0.1, [-0.4, 2.7, 4.1], [-0.6, 0.98, 0.75], 32, W("pernah") - W("satu", 2) - 1.3),
    H(W("dirham") + 0.9, [0.55, 2.5, 4.0], [0.66, 1.06, 0.75], 32, 0.8),
    H(W("turun") + 1.6, [1.1, 1.5, 2.45], [0.78, 1.0, 0.75], 32),
    // pass-through key (no ease to rest): the 53.9 -> 60.1 s move is one slow glide
    P(W("emas", 6), [0.2, 2.9, 7.0], [-0.1, 0.85, 0.3], 34),
    // shorter rest + a closer start pose so the legs either side stay slow (camera audit 58-76 s)
    H(W("al-umari", 2), [-0.2, 2.25, 5.6], [-1.9, 1.1, 1.0], 31),
    H(C6, [-0.35, 2.1, 5.2], [-1.9, 1.1, 1.0], 31),
  ],
  [
    // PAYOFF: over the balance to the lane and the empty chest, then the lender's table
    H(C6, [0.2, 2.85, 2.1], [-0.3, 0.35, -1.9], 34),
    // the empty chest as the single hero, centred, ~55% of the frame width
    H(W("dalam") + 0.6, [-0.05, 2.15, 0.9], [-0.3, 0.25, -1.9], 34),
    H(C5, [0.0, 2.05, 0.75], [-0.3, 0.25, -1.9], 34),
  ],
  [
    // PAYOFF: the lender's counter (its own set after the zone fade)
    H(C5, [4.3, 1.9, 2.4], [2.95, 0.55, -0.5], 33),
    H(W("berutang"), [3.85, 1.65, 1.75], [2.95, 0.55, -0.5], 32, 0.9),
    H(C4, [4.2, 2.3, 2.7], [2.95, 0.55, -0.5], 34),
  ],
  [
    // PAYOFF: the map becomes the Catalan Atlas vellum; OUTRO: rise off the map
    H(C4, [mapX(-12) - 3.8, 8.4, mapZ(24) + 0.1], [mapX(14), 0.0, mapZ(24)], 40),
    H(W("katalan") + 1.6, [mapX(-12) - 3.3, 7.4, mapZ(24) + 0.1], [mapX(14), 0.0, mapZ(24)], 38),
    H(W("bongkah") - 0.2, [mapX(-6) - 1.45, 1.45, mapZ(15) + 1.9], [mapX(-6) + 0.12, 0.36, mapZ(15)], 32),
    H(W("raja", 2) + 1.2, [mapX(-6) - 0.95, 1.35, mapZ(15) + 2.1], [mapX(-6) + 0.12, 0.38, mapZ(15)], 32),
    H(W("sejarah"), [mapX(-6) - 2.6, 3.4, mapZ(15) + 2.4], [mapX(5), 0.3, mapZ(18)], 36),
    H(TOTAL, [mapX(-6) - 2.9, 3.9, mapZ(15) + 2.7], [mapX(5), 0.3, mapZ(18)], 36),
  ],
];

/** Flat list (for docs / linting). */
export const SHOTS: Pose[] = SEGMENTS.flat();

export function rig(fps: number): Key[][] {
  return SEGMENTS.map((seg) =>
    seg.flatMap((s) => {
      const k = { f: Math.round(s.t * fps), v: [...s.pos, ...s.tgt, s.fov], hold: s.hold };
      return s.stay ? [k, { ...k, f: Math.round((s.t + s.stay) * fps), hold: true }] : [k];
    }),
  );
}

export type Cam = { pos: V3; target: V3; fov: number };

export function camAt(segs: Key[][], frame: number, fps: number): Cam {
  const t = frame / fps;
  const i = CUTS.filter((c) => t >= c).length;
  const v = sample(segs[i], frame);
  // slow seeded breathing so held keys keep a little parallax
  const b = 0.06 * Math.sin(t * 0.42 + 1.3);
  const c = 0.04 * Math.sin(t * 0.29 + 0.4);
  const fade = Math.min(1, t / 1.2); // the cover frame stays exact
  return { pos: [v[0] + b * fade, v[1] + c * fade, v[2]], target: [v[3], v[4], v[5]], fov: v[6] };
}

/** The dusk veil: full dark around each cut, soft 0.45 s edges. */
export function veilAt(t: number): number {
  let v = 0;
  for (const c of CUTS) {
    const d = Math.abs(t - c);
    if (d >= 0.95) continue;
    const k = d <= 0.4 ? 1 : 1 - (d - 0.4) / 0.55;
    v = Math.max(v, k * k * (3 - 2 * k));
  }
  return v;
}
