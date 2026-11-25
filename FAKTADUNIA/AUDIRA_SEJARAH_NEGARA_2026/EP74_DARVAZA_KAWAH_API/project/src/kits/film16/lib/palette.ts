// 16mm documentary: an afternoon kitchen, warm window light, teal shadows, lifted film blacks.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

export const FILM16_PALETTE = {
  bg: "#17130F",
  wall: "#B9A585",
  wallShade: "#7E6C55",
  wood: "#6E4A2E",
  woodLight: "#9A6B43",
  cloth: "#C9B28E",
  radio: "#5A3A22",
  grille: "#C8B48F",
  dial: "#EFE0BD",
  dialInk: "#3B2A1C",
  needle: "#B0281E",
  cup: "#EDE6D8",
  tea: "#6B3A17",
  curtain: "#E8DCC2",
  sun: "#FFD9A3",
  sky: "#FFF2D6",
  leaf: "#7E9A5B",
  halation: "#FF6A3D",

  hud: "#FBEFD9",
  hudDim: "rgba(251,239,217,0.62)",
  chip: "rgba(23,19,15,0.7)",
  accent: "#FFB35C",
};

/** Kodak-ish grade: warm highlights, teal shadows, soft S, a little lens fringe. */
export const FILM16_GRADE: ColorGradeProfile = {
  name: "16mm Documentary",
  vignette: 0.32,
  grain: 0.018,
  chromaticAberration: 0.002,
  contrastCurve: 0.24,
  saturation: 0.85,
  highlightTint: [0.035, 0.012, -0.02],
  shadowTint: [-0.01, 0.012, 0.022],
};
