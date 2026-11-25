// RAJUTFORGE: crochet / amigurumi. Thick wool yarn, readable single-crochet stitches, a cosy
// craft table under a warm window light with a cool back rim that lights the fibre fuzz.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Cosy yarn grade: warm highlights, plum-brown shadows, soft vignette and a gentle S-curve. */
export const RAJUT_GRADE: ColorGradeProfile = {
  name: "Cosy Yarn",
  vignette: 0.3,
  grain: 0.01,
  chromaticAberration: 0,
  contrastCurve: 0.3,
  saturation: 1.0,
  highlightTint: [0.025, 0.012, -0.012],
  shadowTint: [0.006, -0.004, 0.014],
};

/** Yarn colours (wool, slightly dusty so the stitch shading carries the read). */
export const YARN = {
  oyen: "#E07B39", // ginger cat ("kucing oyen")
  oyenDark: "#B45321",
  cream: "#F1E2C6",
  rose: "#E58C8F",
  teal: "#1F8A84",
  mustard: "#D9A33A",
  sage: "#8DAA7C",
  turtle: "#4F8F4A",
  turtleLight: "#A9C97A",
  plum: "#7A4A6B",
  brown: "#3A2620",
  white: "#FBF6EC",
} as const;
export type YarnName = keyof typeof YARN;

export const RAJUT_PALETTE = {
  bg: "#22160F",
  wall: "#5A4034",
  table: "#7A4E33",
  key: "#FFD3A1",
  rim: "#BFD4FF",
  fill: "#B9A3C9",
  hookMetal: "#C2476E",
  hookGrip: "#F2D9C4",
  hud: "#FBF1E1",
  hudDim: "rgba(251,241,225,0.66)",
  chip: "rgba(58,38,32,0.84)",
  accent: "#F2A65A",
  stitch: "rgba(242,166,90,0.85)",
};
