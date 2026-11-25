// EP09 shot list. One continuous move per station, joined by hard cuts in the breath gaps between
// sentences (the stations sit 2-2.5 units apart on the table: travelling between them at phone framing
// distance reads as a whip pan, measured "too fast" by audit:camera). Every key and every cut sits on a
// spoken word or a line gap from timeline.json (time.ts), never on an absolute second. The film opens
// on the approved cover framing. Keys inside a shot stay >= ~1.5 s apart.
import { shotPlan, cameraAt, coverPose, frame, settle, type Framing } from "../../core/camera/moves.ts";
import type { Key } from "../../core/motion/track.ts";
import type { Shot } from "../../core/render/Post.tsx";
import { COVER } from "./framing.ts";
import { ST } from "./Stations.tsx";
import { TIMELINE, W, WE, TOTAL } from "./time.ts";

const FPS = 60;
type V3 = [number, number, number];
const at = (s: keyof typeof ST, o: V3 = [0, 0, 0]): V3 => [ST[s][0] + o[0], ST[s][1] + o[1], ST[s][2] + o[2]];
const f = (target: V3, az: number, el: number, dist: number, fov = 36): Framing => ({ target, az, el, dist, fov, roll: 0 });

/** Middle of the silence after a line (cut point). */
const gapAfter = (lineId: string) => {
  const i = TIMELINE.lines.findIndex((l) => l.id === lineId);
  const a = TIMELINE.lines[i].end;
  const b = i + 1 < TIMELINE.lines.length ? TIMELINE.lines[i + 1].start : a + 0.6;
  return (a + b) / 2;
};

type Seg = { from: number; start: Framing; keys: [number, Framing][] };

const SEGS: Seg[] = [
  // Hook: the cover framing on the cup, slow push
  {
    from: 0,
    start: coverPose(COVER),
    keys: [
      [1.6, f([0.02, 0.25, -0.05], -11, 16, 1.68)],
      [W("makkah"), f([0.02, 0.24, -0.05], -5, 18, 1.6)],
    ],
  },
  // Context: the Red Sea map (Yemen, Ethiopia, the Kaldi legend)
  {
    from: gapAfter("l01"),
    start: f(at("M", [0.02, 0, 0.0]), -10, 56, 3.05),
    keys: [
      [W("yaman"), f(at("M", [0.04, 0, 0.08]), -6, 58, 2.85)],
      [W("etiopia"), f(at("M", [0.04, 0, 0.44]), -4, 55, 2.5)],
      [W("kaldi"), f(at("M", [-0.06, 0.02, 0.52]), -10, 52, 2.3)],
      [W("kemudian"), f(at("M", [-0.04, 0.02, 0.4]), -6, 54, 2.5)],
    ],
  },
  // Main: the zawiyah (al-Jaziri, al-Shadhili, the circle, the pour, the bowls, dhikr). Kept wide and
  // high enough that the whole circle reads as one subject (no seat crowding the bottom of frame).
  {
    from: gapAfter("l04"),
    start: f(at("Z", [0, 0.06, -0.02]), -12, 42, 3.25),
    keys: [
      [W("al-jaziri"), f(at("Z", [0, 0.06, -0.02]), -8, 42, 3.15)],
      [W("versi"), f(at("Z", [0, 0.06, -0.02]), 10, 40, 3.1)],
      [W("kantuk"), f(at("Z", [0, 0.06, -0.02]), 4, 42, 2.95)],
      [W("melingkar"), f(at("Z", [0, 0.06, -0.02]), -8, 38, 3.05)],
      [W("dibagikan"), f(at("Z", [0, 0.06, -0.02]), 2, 44, 2.9)],
      [W("berzikir"), f(at("Z", [0, 0.06, -0.02]), 10, 42, 3.1)],
    ],
  },
  // Explanation 1: the spread on the map
  {
    from: gapAfter("l07"),
    start: f(at("M", [-0.12, 0, 0.1]), -6, 60, 2.75),
    keys: [[W("istanbul"), f(at("M", [-0.2, 0, -0.18]), -2, 62, 2.55)]],
  },
  // Explanation 2: the council table (1511), the ban, the burning, the Cairo decree
  {
    from: gapAfter("l08"),
    start: f(at("C", [0, 0.05, -0.05]), -12, 42, 2.15),
    keys: [
      [W("mengumpulkan"), f(at("C", [0, 0.05, -0.05]), -6, 43, 2.0)],
      [W("musik"), f(at("C", [0, 0.02, 0.18]), 4, 47, 1.7)],
      [W("dilarang"), f(at("C", [0.0, 0.03, 0.04]), 4, 52, 1.5)],
      [W("dibakar"), f(at("C", [0.2, 0.08, -0.08]), 14, 42, 1.55)],
      [W("kairo", 2), f(at("C", [0, 0.02, 0]), 8, 50, 1.75)],
      [W("dibatalkan") + 0.4, f(at("C", [-0.04, 0.02, 0.02]), -2, 48, 1.85)],
    ],
  },
  // Payoff 1: the word tiles, lying flat in a column (no tile covers another's word)
  {
    from: gapAfter("l11"),
    start: f(at("W", [0, 0.02, -0.3]), -8, 54, 1.95),
    keys: [
      [W("qahwa"), f(at("W", [0, 0.02, -0.2]), -6, 56, 2.05)],
      [W("kopi", 6), f(at("W", [0, 0.02, 0.24]), 2, 62, 2.7)],
    ],
  },
  // Payoff 2a: Java map + route, then the 1696 pot floods (one subject at a time)
  {
    from: gapAfter("l12"),
    start: f(at("J", [0, 0, -0.12]), -6, 58, 3.45),
    keys: [
      [W("bibit"), f(at("J", [0, 0, -0.12]), -2, 58, 3.35)],
      [W("banjir"), f(at("J", [-0.01, 0.07, 0.65]), -6, 26, 1.75)],
    ],
  },
  // Payoff 2b: the 1699 pot grows
  {
    from: gapAfter("l13"),
    start: f(at("J", [-0.02, 0.07, 0.65]), 2, 26, 1.9),
    keys: [[W("tumbuh", 2), f(at("J", [-0.01, 0.08, 0.65]), 6, 25, 1.85)]],
  },
  // Payoff 2c: the AUDIRA crate (1711), then back to the map as the ship sails west
  {
    from: (WE("tumbuh", 2) + W("dan", 5)) / 2,
    start: f(at("J", [0.05, 0.1, -1.25]), -8, 20, 1.55),
    keys: [
      [W("1711") + 0.4, f(at("J", [0.05, 0.1, -1.25]), -2, 20, 1.5)],
      [W("eropa"), f(at("J", [0, 0, -0.12]), -2, 56, 3.45)],
    ],
  },
  // Outro: back to the cup, a tubruk glass lands beside it
  {
    from: gapAfter("l14"),
    start: f([0.22, 0.16, 0.08], -12, 24, 2.4),
    keys: [
      [W("pagimu"), f([0.22, 0.16, 0.08], -8, 24, 2.3)],
      [W("kamu"), f([0.22, 0.16, 0.08], 8, 22, 2.05)],
      [TOTAL, f([0.22, 0.16, 0.08], 16, 20, 1.9)],
    ],
  },
];

const RIGS: { from: number; rig: Key[] }[] = SEGS.map((s) => ({
  from: s.from,
  rig: shotPlan(FPS, s.start, [
    ...s.keys.map(([k, fr]) => ({ at: k - s.from, move: frame(fr) })),
    { at: s.keys[s.keys.length - 1][0] - s.from, move: settle() },
  ]),
}));
const LENS = { aperture: 0, maxBlur: 0, exposure: 0.9 };

export const shotAt = (t: number): Shot => {
  let i = 0;
  while (i + 1 < RIGS.length && t >= RIGS[i + 1].from) i++;
  return cameraAt(RIGS[i].rig, (t - RIGS[i].from) * FPS, FPS, { lens: LENS, alive: true });
};
export const CUTS = SEGS.slice(1).map((s) => s.from);
export const CAMERA_KEYS = SEGS.flatMap((s) => s.keys.map(([k]) => k));
