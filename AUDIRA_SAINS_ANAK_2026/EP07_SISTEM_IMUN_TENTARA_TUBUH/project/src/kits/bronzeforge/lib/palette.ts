// BRONZEFORGE: bronze casting. A foundry pour into a sand mould, the hot casting revealed and
// cooling, polished, then aged into a verdigris patina and presented as a monument on a stone plinth.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Foundry grade: amber highlights, teal-green shadows (the patina's colour), a deep vignette. */
export const BRONZE_GRADE: ColorGradeProfile = {
  name: "Foundry Bronze",
  vignette: 0.36,
  grain: 0.012,
  chromaticAberration: 0,
  contrastCurve: 0.38,
  saturation: 0.95,
  highlightTint: [0.035, 0.014, -0.022],
  shadowTint: [-0.018, 0.006, 0.02],
};

/** Metal and patina colours (sRGB hex; THREE.Color converts them to linear). */
export const BRONZE = {
  /** Fresh polished bronze (copper-tin, warm gold-pink). */
  polished: "#D9A066",
  /** Polished highlight on the rubbed edges of an aged statue. */
  rubbed: "#E8B57A",
  /** As-cast skin: dark oxide and fire scale straight out of the sand. */
  raw: "#6E4E36",
  rawScale: "#3E2C22",
  /** Statuary brown patina (the body colour of an aged monument). */
  brown: "#5C3A22",
  /** Verdigris: blue-green copper carbonate, darker in the deepest crevices, pale where it crusts. */
  verdigris: "#4FA08A",
  verdigrisDeep: "#245E58",
  verdigrisCrust: "#A9D8C4",
};

export const BRONZE_PALETTE = {
  bg: "#100C0A",
  floor: "#2A2420",
  sand: "#7C6550",
  sandBurnt: "#3A2A20",
  iron: "#2C2A28",
  crucible: "#2B2826",
  granite: "#57524D",
  molten: "#FFB347",
  heat: "#FF7A2A",
  key: "#FFE0B8",
  rim: "#8FD0E0",
  hud: "#F4E6D2",
  hudDim: "rgba(244,230,210,0.62)",
  chip: "rgba(24,18,14,0.84)",
  accent: "#E2A15C",
  patina: "#6FC2A8",
};
