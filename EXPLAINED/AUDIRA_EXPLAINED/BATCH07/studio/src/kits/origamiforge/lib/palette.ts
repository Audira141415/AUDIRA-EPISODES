// ORIGAMIFORGE: origami as real 3D geometry. A square sheet folds along creases (rigid panels
// rotating about crease lines, real paper thickness) into a crane that flaps and flies, on a
// calm studio table with washi-coloured sheets.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Calm studio grade: warm paper highlights, cool slate shadows, gentle S-curve, soft vignette. */
export const ORIGAMI_GRADE: ColorGradeProfile = {
  name: "Washi Studio",
  vignette: 0.3,
  grain: 0.011,
  chromaticAberration: 0,
  contrastCurve: 0.34,
  saturation: 1.0,
  highlightTint: [0.022, 0.01, -0.012],
  shadowTint: [-0.012, 0.004, 0.02],
};

/**
 * Washi sheets: `face` is the printed (outside) side, `back` the plain inside, `ink` the print
 * colour of the pattern on the face, `core` the cut edge (paper fibre seen edge-on).
 */
export const WASHI = {
  shu: { face: "#C7402C", back: "#F2E8D5", ink: "#F3D7B8", core: "#F6EEDF", pattern: "seigaiha" },
  ai: { face: "#2C4C7E", back: "#EFE9DC", ink: "#C9D6EA", core: "#F3EFE6", pattern: "asanoha" },
  matcha: { face: "#6F8F43", back: "#F1EEDD", ink: "#DCE6C2", core: "#F5F2E4", pattern: "kikko" },
  kincha: { face: "#D29A35", back: "#F4ECD8", ink: "#FBE6B5", core: "#F8F0DF", pattern: "seigaiha" },
  sakura: { face: "#E39AA8", back: "#F6EEE6", ink: "#FBE0E5", core: "#FAF4EE", pattern: "asanoha" },
  sumi: { face: "#2E2C2B", back: "#ECE6DA", ink: "#8C8478", core: "#F1ECE2", pattern: "kikko" },
} as const;
export type Washi = keyof typeof WASHI;
export type Pattern = "seigaiha" | "asanoha" | "kikko";

export const ORIGAMI_PALETTE = {
  bg: "#1A1D1F",
  wall: "#3A3631",
  mat: "#3F5A5E",
  matLine: "#B9D6D2",
  table: "#B89A78",
  key: "#FFE1BC",
  rim: "#B8D2FF",
  fill: "#9FB4C8",
  print: "#22365E",
  hud: "#F5EEE2",
  hudDim: "rgba(245,238,226,0.62)",
  chip: "rgba(24,28,30,0.78)",
  accent: "#E0573F",
};
