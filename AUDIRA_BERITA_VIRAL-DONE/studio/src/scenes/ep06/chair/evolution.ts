// One morph per era change. Vacancies: the tape rolls out and the cushion fades; refills: the
// tape rolls back first, then the chair rebuilds (legs → seat → back).

import { placeMorphs, type MorphDef, type MorphWindow } from "../../../kits/timeforge/morph/eraTimeline.ts";
import type { Rule } from "../../../kits/timeforge/morph/lerpTree.ts";
import { ease } from "../../../core/motion/easing.ts";
import { ERA_ORDER, ERAS } from "./eras.ts";
import type { Chair } from "./params.ts";

const r = (match: Rule["match"], start: number, end: number): Rule => ({ match, start, end });
const vacate = [r("mats.cushion", 0, 0.6), r("tape.", 0.3, 1)];
const rebuild = [r("tape.", 0, 0.3), r("legs.", 0.15, 0.6), r("seat.", 0.3, 0.75), r("arm.", 0.35, 0.8), r("back.", 0.45, 1), r("mats.", 0.3, 0.9)];

export const MORPHS = {
  m1: { from: "e1945", to: "e1956", rules: vacate },
  m2: { from: "e1956", to: "e1973", rules: rebuild },
  m3: { from: "e1973", to: "e1998", rules: vacate },
  m4: { from: "e1998", to: "e2001", rules: rebuild },
  m5: { from: "e2001", to: "e2026", rules: [r("legs.", 0, 0.5), r("seat.", 0.2, 0.7), r("arm.", 0.2, 0.7), r("back.", 0.35, 0.9), r("mats.", 0.2, 0.9), r("tape.", 0.6, 1)] },
} satisfies Record<string, MorphDef>;

export type MorphId = keyof typeof MORPHS;
export const SWEEP: Record<string, [number, number]> = { e1956: [0.25, 0.85], e1998: [0.25, 0.85], e2001: [0.2, 0.8] };

export const makeEvolution = (windows: MorphWindow<MorphId>[]) => placeMorphs<Chair, MorphId>(ERAS, ERA_ORDER, MORPHS, windows, ease.inOut);
