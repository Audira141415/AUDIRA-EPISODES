// Shot list for EP21 (Ratu Bilqis). Each set is its own small diorama at the origin; the film mounts
// one set per segment and every set change is a cut under a short veil, placed in the breath between
// two VO lines. Every key sits on a word time (W) or a line edge. Camera always on the +z side.
// Channels: pos x y z, target x y z, fov.

import { sample, type Key } from "../../core/motion/track.ts";
import { W, WL, LS, LE, TOTAL } from "./time.ts";

type V3 = [number, number, number];
type Pose = { t: number; pos: V3; tgt: V3; fov: number; hold?: boolean; stay?: number };

const H = (t: number, pos: V3, tgt: V3, fov: number, stay = 0): Pose => ({ t, pos, tgt, fov, hold: true, stay });
/** Pass-through key: the camera flows through it instead of stopping (G14 rig audit). */
const M = (t: number, pos: V3, tgt: V3, fov: number): Pose => ({ t, pos, tgt, fov });
const gap = (a: string, b: string) => (LE(a) + LS(b)) / 2;

export type SetId = "glassHook" | "saba" | "camp" | "temple" | "majelis" | "desert" | "hall" | "glassWide" | "hill";

export const CUTS: number[] = [
  gap("l02", "l03"), // glass floor hook -> Saba
  gap("l07", "l08"), // Saba -> Sulaiman's camp (the birds)
  gap("l08", "l09"), // camp -> sun temple at dusk (the news)
  gap("l09", "l10"), // temple -> council hall (the letter)
  gap("l14", "l15"), // council -> desert road (gift refused, the throne)
  gap("l17", "l18"), // desert -> marble hall (throne arrives, disguised)
  gap("l22", "l23"), // hall -> long glass corridor
  gap("l25", "l26"), // corridor -> dawn hill (payoff)
];
const [C1, C2, C3, C4, C5, C6, C7, C8] = CUTS;

export const SETS: SetId[] = ["glassHook", "saba", "camp", "temple", "majelis", "desert", "hall", "glassWide", "hill"];

/** Hook framing low over the glass floor = the topic cover. */
export const COVER = { pos: [0.25, 0.8, 2.3] as V3, target: [0, 0.3, -0.6] as V3, fov: 38 };

export const SEGMENTS: Pose[][] = [
  [
    // HOOK: low dolly skimming the glass over moving water toward the queen's hem
    H(0, COVER.pos, COVER.target, COVER.fov),
    M(W("menyingkap"), [0.2, 0.55, 1.85], [0, 0.08, -0.5], 36),
    H(W("betis") + 0.2, [0.16, 0.5, 1.7], [0, 0.06, -0.45], 36),
    M(W("salah") - 0.3, [0.1, 0.7, 2.1], [0, 0.18, -0.6], 36),
    H(C1, [0.06, 0.8, 2.3], [0, 0.2, -0.7], 37),
  ],
  [
    // SABA: crane over the city, push to the queen's back on the balcony, pan to temple and dam, tilt to the AUDIRA gate
    H(C1, [0.42, 1.75, 3.4], [0, 0.8, -0.4], 37),
    M(W("bilqis"), [0.35, 1.5, 3.0], [0, 0.85, 0.0], 36),
    M(W("al-quran"), [0.15, 1.55, 2.6], [-0.3, 0.7, -2.0], 38),
    M(W("surah"), [-0.35, 1.4, 2.6], [-1.3, 0.6, -3.2], 37),
    M(W("audira") - 0.3, [0.75, 1.3, 2.2], [1.2, 1.15, -1.6], 33),
    H(C2, [0.85, 1.25, 2.0], [1.2, 1.15, -1.6], 32),
  ],
  [
    // CAMP: track along the perched birds to the empty perch
    H(C2, [-0.55, 0.62, 1.45], [-0.35, 0.27, -0.5], 33),
    M(W("burung-burungnya"), [-0.2, 0.58, 1.35], [-0.1, 0.26, -0.5], 32),
    H(W("tidak") , [0.45, 0.46, 1.0], [0.42, 0.22, -0.5], 30),
    H(C3, [0.5, 0.44, 0.92], [0.42, 0.22, -0.5], 30),
  ],
  [
    // TEMPLE: follow the hoopoe in, settle on the queen before the crowd, tilt up to the sun
    H(C3, [1.1, 0.95, 2.3], [0.4, 0.6, -1.0], 34),
    M(W("perempuan", 2), [0.25, 0.8, 1.7], [0, 0.45, -1.5], 32),
    M(W("matahari"), [0.05, 0.7, 2.3], [0, 1.0, -6], 38),
    H(C4, [0, 0.72, 2.5], [0, 1.1, -6], 38),
  ],
  [
    // MAJELIS: top-close on the sealed letter, rise to the queen, side to the nobles, push in on the choice
    H(C4, [0, 0.95, 1.05], [0, 0.42, 0.3], 32),
    M(W("dibuka"), [0.12, 0.8, 1.15], [0, 0.42, 0.25], 30),
    M(WL("l11", "bilqis"), [0.3, 1.05, 2.4], [0, 0.5, -1.2], 36),
    M(W("bermusyawarah"), [-0.6, 1.2, 2.6], [0, 0.4, -0.6], 42),
    M(W("keputusan"), [0.15, 1.25, 2.8], [0, 0.4, -0.7], 40),
    H(W("hadiah"), [0.1, 1.2, 2.6], [0, 0.42, -0.8], 38),
    H(C5, [0.08, 1.18, 2.5], [0, 0.42, -0.8], 38),
  ],
  [
    // DESERT: follow the caravan turning back, open wide to the horizon, hold for the blink
    H(C5, [0.15, 0.74, 2.3], [0.4, 0.3, -0.45], 34),
    M(W("menolak"), [0.4, 0.7, 2.2], [0.6, 0.3, -0.4], 34),
    M(W("singgasana"), [0.2, 1.1, 3.2], [0, 0.6, -4], 38),
    M(W("ilmu"), [0, 0.95, 2.7], [0, 0.6, -3], 36),
    H(W("berkedip") - 0.2, [0, 0.85, 2.3], [0, 0.65, -2], 33, 0.2),
    H(C6, [0, 0.85, 2.05], [0, 0.7, -1.6], 31),
  ],
  [
    // HALL: the throne lands (hold), push to the gems, orbit 40 deg to behind the queen's shoulder
    H(C6, [0, 0.95, 2.5], [0, 0.5, -1.0], 34),
    H(W("tiba", 2) + 0.5, [0, 0.9, 2.2], [0, 0.5, -1.0], 33),
    M(W("disamarkan") + 0.3, [0.45, 0.78, 1.75], [0, 0.45, -1.0], 32),
    H(W("dicopot"), [0.42, 0.58, 0.9], [0, 0.5, -1.0], 30),
    M(W("serupa"), [0.9, 0.85, 1.7], [-0.2, 0.45, -0.6], 34),
    M(W("seakan-akan"), [0.25, 0.78, 1.45], [-0.1, 0.45, -0.9], 32),
    H(W("katsir"), [-0.05, 0.76, 1.3], [-0.1, 0.45, -0.9], 32),
    H(C7, [-0.1, 0.76, 1.25], [-0.1, 0.45, -0.9], 32),
  ],
  [
    // GLASS CORRIDOR: wide down the corridor, drop low to the floor at "kolam", rise to show the glass
    H(C7, [0, 1.3, 3.4], [0, 0.3, -3], 38),
    M(W("masuk"), [0.3, 0.95, 2.7], [0, 0.2, -1.5], 36),
    M(W("kolam", 2), [0.3, 0.6, 1.6], [0, 0.05, -1.0], 36),
    H(W("menyingkap", 2), [0.25, 0.55, 1.5], [0, 0.05, -0.8], 38),
    M(W("ini"), [0.4, 0.9, 1.6], [0, 0.2, -1.5], 34),
    H(C8, [0.5, 1.3, 1.8], [0, 0.1, -1.6], 36),
  ],
  [
    // PAYOFF: behind the queen on the dawn hill, crane up and back to the panorama
    H(C8, [0.2, 0.7, 1.5], [0, 0.45, -0.5], 34),
    M(W("berserah"), [0.25, 0.9, 2.0], [0, 0.55, -1.4], 36),
    H(W("ayat"), [0.2, 1.4, 2.8], [0, 0.6, -3], 38),
    H(TOTAL, [0.1, 2.0, 3.6], [0, 0.7, -5], 40),
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
