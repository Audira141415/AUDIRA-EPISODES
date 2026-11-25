// EP06 cuts. COVER_CUT holds the 2026 chair (frame 0 = topic cover / film opening framing).
// PREVIEW_CUT is a silent 14 s walk through all six eras, used until the VO is locked.

import type { Cut } from "../../kits/timeforge/film/cut.ts";
import { keys } from "../../core/motion/track.ts";
import { makeEvolution } from "./chair/evolution.ts";
import { NO_FX, type Chair, type ChairFx } from "./chair/params.ts";

export const COVER_RIG = [0, 0, 3.6, 0, 4, 9, 108, 24] as const;

export const COVER_CUT: Cut<Chair, ChairFx> = {
  seconds: 1,
  clock: (frame, fps) => frame / fps,
  evolution: makeEvolution([
    { id: "m1", t0: -50, t1: -49 },
    { id: "m2", t0: -48, t1: -47 },
    { id: "m3", t0: -46, t1: -45 },
    { id: "m4", t0: -44, t1: -43 },
    { id: "m5", t0: -42, t1: -41 },
  ]),
  yaw: keys([0, -26]),
  tilt: keys([0, 0, 0]),
  rig: keys([...COVER_RIG]),
  labels: keys([0, 1]),
  fx: NO_FX,
  title: { in: [-2, -1], out: [98, 99] },
};

export const PREVIEW_CUT: Cut<Chair, ChairFx> = {
  seconds: 14,
  clock: (frame, fps) => frame / fps,
  evolution: makeEvolution([
    { id: "m1", t0: 1.2, t1: 2.8 },
    { id: "m2", t0: 3.8, t1: 5.6 },
    { id: "m3", t0: 6.6, t1: 8.2 },
    { id: "m4", t0: 9.2, t1: 11.0 },
    { id: "m5", t0: 12.0, t1: 13.6 },
  ]),
  yaw: keys([0, -30], [14, 24]),
  tilt: keys([0, 0, 0]),
  rig: keys([0, 0, 1.0, 0, -6, 8, 90, 24], [14, 0, 1.4, 0, 8, 10, 86, 24]),
  labels: keys([0, 1]),
  fx: NO_FX,
  title: { in: [0, 0.5], out: [2.5, 3.2] },
};
