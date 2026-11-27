// Shot list for EP20. Each set is its own small diorama at the origin; the film mounts one set per
// segment and every set change is a cut under a short lantern veil, placed in the breath between
// two VO lines. Every key sits on a word time (W) or a line edge. Camera always on the +z side.
// Channels: pos x y z, target x y z, fov.

import { sample, type Key } from "../../core/motion/track.ts";
import { W, LS, LE, TOTAL } from "./time.ts";

type V3 = [number, number, number];
type Pose = { t: number; pos: V3; tgt: V3; fov: number; hold?: boolean; stay?: number };

const H = (t: number, pos: V3, tgt: V3, fov: number, stay = 0): Pose => ({ t, pos, tgt, fov, hold: true, stay });
/** Pass-through key: the camera flows through it instead of stopping (G14 rig audit). */
const M = (t: number, pos: V3, tgt: V3, fov: number): Pose => ({ t, pos, tgt, fov });
const gap = (a: string, b: string) => (LE(a) + LS(b)) / 2;

export type SetId = "hallNight" | "gate" | "roof" | "store" | "hallDay" | "hallLow" | "road" | "book" | "hill";

export const CUTS: number[] = [
  gap("l04", "l05"), // hall at night -> city gate
  gap("l06", "l07"), // gate -> Kanaan rooftop (the dream)
  gap("l08", "l09"), // roof -> grain store
  gap("l11", "l12"), // store -> hall at midday (the reveal)
  gap("l15", "l16"), // reveal -> low floor (forgiveness)
  gap("l17", "l18"), // forgiveness -> desert road (the shirt)
  gap("l18", "l19"), // road -> tafsir desk (why he waited)
  gap("l22", "l23"), // desk -> dawn hill (payoff)
];
const [C1, C2, C3, C4, C5, C6, C7, C8] = CUTS;

export const SETS: SetId[] = ["hallNight", "gate", "roof", "store", "hallDay", "hallLow", "road", "book", "hill"];

/** Hook framing from behind the throne = the topic cover. */
export const COVER = { pos: [-0.85, 1.0, 2.7] as V3, target: [-0.62, 0.56, 0.75] as V3, fov: 36 };

export const SEGMENTS: Pose[][] = [
  [
    // HOOK: behind Yusuf in focus (throne off frame right), then rack past his shoulder to the eleven brothers
    H(0, COVER.pos, COVER.target, COVER.fov),
    M(W("berdiri"), [-0.6, 0.98, 2.3], [-0.35, 0.42, -0.6], 34),
    H(C1, [-0.35, 0.95, 2.0], [-0.3, 0.38, -1.2], 32),
  ],
  [
    // KONTEKS: crane down behind the brothers and camels (in focus), then tilt up to the AUDIRA board
    H(C1, [0.4, 2.0, 5.4], [0, 0.6, -0.5], 38),
    M(W("ayat"), [0.35, 1.35, 4.3], [0.05, 0.4, 0.7], 35),
    M(W("ini") - 1.1, [0.25, 1.2, 3.8], [0.05, 0.35, 0.5], 33),
    M(W("audira") - 0.3, [0.15, 1.05, 3.4], [0, 1.3, -1.4], 35),
    H(C2, [0.1, 1.1, 3.3], [0, 1.45, -1.4], 35),
  ],
  [
    // MIMPI: the sky first (stars, sun, moon bowing), tilt down and push in to father and son
    H(C2, [0, 1.6, 2.0], [0, 2.6, -5], 38),
    M(W("bersujud"), [0, 1.2, 1.8], [0, 1.6, -4], 36),
    H(W("ayahnya"), [0.2, 0.85, 1.9], [0, 0.3, -0.25], 34),
    H(C3, [0.15, 0.75, 1.6], [0, 0.3, -0.25], 33),
  ],
  [
    // GUDANG: side track along the sacks, rack to the cup, end behind Yusuf in focus with the cup beyond him
    H(C3, [1.6, 1.2, 2.4], [0.4, 0.35, -0.6], 36),
    M(W("langsung"), [0.9, 1.0, 2.0], [-0.4, 0.4, 0.2], 34),
    M(W("dituduh"), [0.6, 0.9, 1.65], [0.62, 0.35, 0.15], 32),
    H(C4, [-1.8, 0.5, 3.25], [0.0, 0.22, 1.0], 33),
  ],
  [
    // UNGKAP: side orbit inside the colonnade, from the brothers to Yusuf in the beam; hold before "aku"
    H(C4, [1.15, 1.35, 2.6], [-0.1, 0.4, -1.4], 36),
    M(W("bertanya"), [1.15, 1.1, 1.9], [-0.1, 0.4, -1.0], 34),
    M(W("terkejut"), [1.1, 0.95, 1.5], [0, 0.4, -0.6], 34),
    H(W("aku") - 0.5, [1.0, 1.15, 2.2], [0, 0.42, 0.55], 32, 0.4),
    M(W("saudaraku") + 0.3, [1.05, 1.1, 2.3], [0.15, 0.42, 0.45], 33),
    H(C5, [1.1, 1.05, 2.4], [0.15, 0.42, 0.4], 33),
  ],
  [
    // MAAF: low on the floor behind the kneeling brothers, push in to the offered hand
    H(C5, [0, 0.5, 2.2], [0, 0.4, -0.8], 36),
    M(W("cercaan"), [0.1, 0.45, 1.75], [0, 0.45, -0.9], 34),
    H(W("mengampuni"), [0.05, 0.35, 1.15], [0, 0.55, -1], 32),
    H(C6, [0, 0.4, 1.05], [0, 0.55, -1], 32),
  ],
  [
    // MAAF tail: track with the runner carrying the shirt to the caravan
    H(C6, [-1.2, 0.6, 2.0], [-1.2, 0.35, 0], 34),
    H(C7, [0.6, 0.65, 2.0], [0.7, 0.35, 0], 34),
  ],
  [
    // TUNGGU: top-down onto the tafsir, pan to the hourglass, ease back
    H(C7, [0, 1.6, 0.6], [0, 0.5, -0.05], 38),
    M(W("alasannya"), [0.3, 1.2, 0.8], [0.35, 0.55, -0.1], 34),
    H(W("katsir"), [0.4, 0.95, 0.95], [0.45, 0.6, -0.1], 32),
    M(W("riwayat"), [-0.1, 1.0, 1.2], [0.05, 0.55, -0.2], 34),
    H(C8, [-0.15, 1.1, 1.4], [0, 0.55, -0.25], 35),
  ],
  [
    // PAYOFF: crane up and back from the family walking into the dawn, to the panorama
    H(C8, [0.25, 0.75, 1.6], [0, 0.45, -0.4], 34),
    M(W("mulia"), [0.3, 1.2, 2.4], [0, 0.5, -1.4], 36),
    H(W("sabar"), [0.2, 1.7, 3.0], [0, 0.6, -2.5], 38),
    H(TOTAL, [0.1, 2.2, 3.6], [0, 0.7, -4], 40),
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
