// UKIRFORGE: Jepara-style wood carving and wooden toys in a warm workshop.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Warm workshop grade: amber highlights, brown-teal shadows, a real vignette and S-curve. */
export const UKIR_GRADE: ColorGradeProfile = {
  name: "Teak Workshop",
  vignette: 0.32,
  grain: 0.012,
  chromaticAberration: 0,
  contrastCurve: 0.36,
  saturation: 0.95,
  highlightTint: [0.03, 0.012, -0.02],
  shadowTint: [-0.01, 0.0, 0.015],
};

/** Wood species: light (early wood) and dark (late wood / ring) colours, grain scale. */
export const WOOD = {
  jati: { light: "#C48A4E", dark: "#8A5527", fresh: "#E2B47A", rings: 9 },
  sonokeling: { light: "#6A3D27", dark: "#2E1810", fresh: "#A8714A", rings: 13 },
  mahoni: { light: "#9C4A2C", dark: "#5E2615", fresh: "#C9784F", rings: 10 },
  pinus: { light: "#EBCB98", dark: "#C1925A", fresh: "#F6E2BC", rings: 6 },
  sawo: { light: "#B5734A", dark: "#7C4426", fresh: "#D9A275", rings: 11 },
} as const;
export type Species = keyof typeof WOOD;

export const UKIR_PALETTE = {
  bg: "#1C130D",
  wall: "#3B2618",
  key: "#FFC98A",
  fill: "#8FA7C4",
  steel: "#B9BEC4",
  paintRed: "#C8342B",
  paintGreen: "#2F7A4A",
  paintYellow: "#E8B030",
  paintBlue: "#2D5FA0",
  paintCream: "#F1E4C8",
  hud: "#F6E7CF",
  hudDim: "rgba(246,231,207,0.62)",
  chip: "rgba(42,26,16,0.82)",
  accent: "#E8B030",
};
