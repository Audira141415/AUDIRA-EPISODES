// Shot list for EP17. Each set is its own small diorama at the origin; the film mounts one set per
// segment and every set change is a cut under a short lantern veil, placed in the breath between
// two VO lines. Every key sits on a word time (W). Channels: pos x y z, target x y z, fov.

import { sample, type Key } from "../../core/motion/track.ts";
import { W, WE, TOTAL } from "./time.ts";

type V3 = [number, number, number];
type Pose = { t: number; pos: V3; tgt: V3; fov: number; hold?: boolean; stay?: number };

const H = (t: number, pos: V3, tgt: V3, fov: number, stay = 0): Pose => ({ t, pos, tgt, fov, hold: true, stay });
/** Pass-through key: the camera flows through it instead of stopping (G14 rig audit). */
const M = (t: number, pos: V3, tgt: V3, fov: number): Pose => ({ t, pos, tgt, fov });
const mid = (a: number, b: number) => (a + b) / 2;

export type SetId = "map" | "camp" | "madinah" | "harrah" | "store" | "ramadah" | "room" | "mosque";

export const CUTS: number[] = [
  mid(WE("gentar"), W("tapi")), // map -> pot (hard cut on "Tapi")
  mid(WE("air", 1), W("namanya")), // pot -> Madinah
  mid(WE("masehi"), W("pelayannya")), // Madinah -> Harrah road
  mid(WE("kecil"), W("di", 2)), // Harrah -> the camp
  mid(WE("menangis", 2), W("ia", 2)), // camp -> flour store
  mid(WE("kiamat?"), W("ia", 3)), // store -> cooking at the camp
  mid(WE("kenyang"), W("saat")), // camp -> Ramadah famine
  mid(WE("lapar"), W("lalu", 2)), // Ramadah -> the last room
  mid(WE("dengan-nya"), W("isak")), // room -> dawn mosque
  mid(WE("itu", 4), W("dan", 4)), // mosque -> back to the pot (payoff)
];
const [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10] = CUTS;

export const SETS: SetId[] = ["map", "camp", "madinah", "harrah", "camp", "store", "camp", "ramadah", "room", "mosque", "camp"];

/** Hook framing of the pot = the topic cover. */
export const COVER = { pos: [0.8, 1.3, 3.0] as V3, target: [-0.1, 0.3, 0.0] as V3, fov: 34 };

export const SEGMENTS: Pose[][] = [
  [
    // HOOK: the war map of Persia and Rome, push in while the borders crack
    H(0, [0, 6.4, 3.7], [0, 0, 0.15], 44),
    H(C1, [0, 4.9, 2.9], [0, 0, 0.05], 42),
  ],
  [
    // HOOK: the pot on a small fire, crane down to the rim ("isinya cuma air")
    H(C1, COVER.pos, COVER.target, COVER.fov),
    M(W("periuk") + 0.1, [0.72, 1.08, 2.2], [0.05, 0.28, 0.04], 33),
    H(C2, [0.42, 0.88, 1.3], [0.0, 0.25, 0.0], 32),
  ],
  [
    // INTRO: Madinah from above, crane down behind Umar walking the lane
    H(C2, [0.0, 4.4, 3.4], [0.0, 0.3, -1.2], 36),
    H(W("amirul") + 0.2, [0.12, 1.25, 2.1], [0.0, 0.35, -0.4], 34),
    H(W("644"), [0.12, 1.0, 0.1], [0.0, 0.3, -2.1], 34),
    H(C3, [0.12, 0.98, -0.3], [0.0, 0.3, -2.5], 34),
  ],
  [
    // RONDA: low side track beside the two walkers, then rack to the distant fire
    H(C3, [1.7, 1.15, 3.2], [0.05, 0.3, 0.55], 34),
    H(W("pinggiran"), [1.6, 1.1, 1.4], [0.05, 0.28, -0.9], 34),
    H(W("api"), [0.35, 1.35, 0.9], [0.3, 0.2, -3.8], 34),
    H(C4, [0.35, 1.35, 0.75], [0.3, 0.2, -3.8], 34),
  ],
  [
    // PERIUK: the mother, the children, the pot, then the man at the edge of the light
    H(C4, [-0.2, 1.65, 2.7], [-0.2, 0.25, -0.15], 34),
    M(W("anak-anak") + 0.5, [-0.95, 1.05, 1.45], [-0.5, 0.2, -0.2], 32),
    M(W("periuk", 2), [0.4, 0.95, 1.05], [0.0, 0.25, 0.0], 32),
    M(W("berkata") + 0.8, [-0.6, 1.25, 2.3], [-0.2, 0.25, 0.0], 34),
    M(W("berdiri"), [0.05, 1.05, 2.6], [0.6, 0.28, 0.35], 34),
    M(W("menangis", 2), [0.55, 0.75, 2.2], [0.85, 0.3, 0.5], 32),
    H(C5, [0.56, 0.74, 2.15], [0.85, 0.3, 0.5], 32),
  ],
  [
    // KARUNG: the flour store, the stamped sack, Umar carrying it out
    H(C5, [0.2, 1.3, 2.4], [0.0, 0.4, -0.6], 34),
    H(W("karung"), [0.5, 0.95, 1.55], [0.3, 0.32, -0.4], 32),
    H(W("aslam", 2), [0.05, 0.95, 1.95], [0.1, 0.32, 0.0], 34),
    H(W("kamu"), [1.15, 1.0, 2.6], [0.95, 0.3, 0.2], 34),
    H(C6, [1.4, 1.0, 2.5], [1.2, 0.3, 0.3], 34),
  ],
  [
    // KARUNG: cooking at the camp until the children are full
    H(C6, [-0.35, 1.2, 2.1], [0.1, 0.22, 0.0], 34),
    H(C7, [-0.25, 1.0, 1.7], [0.05, 0.22, 0.0], 32),
  ],
  [
    // RAMADAH: high over the cracked plain and the caravan, down to the table of bread and oil
    H(C7, [0.0, 4.4, 4.0], [0.0, 0.0, -1.5], 38),
    H(W("sembilan"), [0.0, 3.0, 3.6], [0.0, 0.2, -1.4], 37),
    H(W("minyak"), [0.2, 1.45, 2.2], [0.02, 0.2, 0.35], 32),
    H(W("katanya") + 0.5, [0.1, 1.75, 1.75], [0.0, 0.15, 0.3], 32),
    H(C8, [0.1, 1.8, 1.7], [0.0, 0.15, 0.3], 32),
  ],
  [
    // HISAB: into the dim room, tilt to the balance, hold before the gold crumbles
    H(C8, [0.2, 1.35, 2.9], [-0.3, 0.45, -0.6], 34),
    H(W("sahih"), [0.0, 1.15, 2.3], [-0.4, 0.4, -0.7], 34),
    H(W("seandainya"), [0.55, 1.2, 3.0], [0.4, 0.48, 0.35], 32),
    H(W("azab"), [0.5, 1.1, 2.8], [0.4, 0.45, 0.35], 32),
    H(C9, [0.5, 1.1, 2.75], [0.4, 0.45, 0.35], 32),
  ],
  [
    // PAYOFF: from the front rows back to the last row as the ripple of light travels
    H(C9, [0.0, 0.8, -0.85], [0.0, 0.35, -2.6], 36),
    H(W("belakang") + 0.4, [0.0, 1.7, 2.6], [0.0, 0.2, -1.4], 38),
    H(C10, [0.0, 1.75, 2.75], [0.0, 0.2, -1.4], 38),
  ],
  [
    // PAYOFF: back to the pot, now warm porridge, the children asleep; pull out to the outro
    H(C10, [0.38, 0.72, 0.95], [0.0, 0.25, 0.0], 32),
    H(W("ditanya"), [0.45, 1.3, 2.3], [0.15, 0.25, 0.0], 34),
    H(TOTAL, [0.6, 2.4, 4.0], [0.15, 0.2, -0.2], 38),
  ],
];

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

export const segmentAt = (t: number) => CUTS.filter((c) => t >= c).length;
export const setAt = (t: number): SetId => SETS[segmentAt(t)];

export function camAt(segs: Key[][], frame: number, fps: number): Cam {
  const t = frame / fps;
  const v = sample(segs[segmentAt(t)], frame);
  const b = 0.03 * Math.sin(t * 0.42 + 1.3);
  const c = 0.02 * Math.sin(t * 0.29 + 0.4);
  return { pos: [v[0] + b, v[1] + c, v[2]], target: [v[3], v[4], v[5]], fov: v[6] };
}

/** Lantern veil around each cut: full at the cut, soft 0.4 s edges. */
export function veilAt(t: number): number {
  let v = 0;
  for (const c of CUTS) {
    const d = Math.abs(t - c);
    if (d >= 0.42) continue;
    const k = d <= 0.1 ? 1 : 1 - (d - 0.1) / 0.32;
    v = Math.max(v, k * k * (3 - 2 * k));
  }
  return v;
}
