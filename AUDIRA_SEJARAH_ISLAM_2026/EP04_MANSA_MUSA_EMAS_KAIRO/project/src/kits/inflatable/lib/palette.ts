// Inflatable vinyl toys in a candy studio: glossy saturated pastels on a soft pink sweep.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Clean studio grade with a real vignette and S-curve: a pastel set must not read as a flat fill. */
export const INFLATABLE_GRADE: ColorGradeProfile = {
  name: "Candy Studio",
  vignette: 0.26,
  grain: 0.006,
  chromaticAberration: 0,
  contrastCurve: 0.32,
  highlightTint: [0.01, 0.0, 0.01],
  shadowTint: [0.02, -0.01, 0.03],
};

export const INFLATABLE_PALETTE = {
  bg: "#EFC6DA",
  sweep: "#F2CCDF",
  sweepFar: "#B98FC4",

  star: "#FFD23F",
  heart: "#FF5D8F",
  ball: "#3EC1D3",
  ring: "#9B5DE5",
  cloud: "#FBFAFF",
  pill: "#00C49A",
  letters: ["#FF5D8F", "#FFD23F", "#3EC1D3", "#9B5DE5", "#00C49A", "#FF8C42"],

  key: "#FFF4EC",
  fill: "#D9E4FF",

  hud: "#3A2340",
  hudDim: "rgba(58,35,64,0.6)",
  chip: "rgba(255,255,255,0.78)",
  accent: "#FF5D8F",
};
