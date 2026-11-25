// PLUSHFORGE: plush / stuffed fabric toys (boneka kain) on a cosy bed.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Bedtime grade: honey highlights from the lamp, plum-blue shadows from the window, soft S-curve. */
export const PLUSH_GRADE: ColorGradeProfile = {
  name: "Bedtime Plush",
  vignette: 0.3,
  grain: 0.01,
  chromaticAberration: 0,
  contrastCurve: 0.3,
  saturation: 1.2,
  highlightTint: [0.025, 0.012, -0.015],
  shadowTint: [-0.005, -0.01, 0.025],
};

/** Plush fabrics: base colour, sheen colour (the bright rim of the pile), seam thread. */
export const PLUSH = {
  honey: { base: "#B47A45", sheen: "#FFE0B8", thread: "#5A3620" },
  cream: { base: "#EFD8B6", sheen: "#FFF6E6", thread: "#8A6448" },
  lilac: { base: "#E6DDEC", sheen: "#FFFFFF", thread: "#9A8AA6" },
  snow: { base: "#F7F2EA", sheen: "#FFFFFF", thread: "#B9AFA2" },
  velvet: { base: "#5E4A6E", sheen: "#C9B4E0", thread: "#3A2C46" },
} as const;
export type PlushName = keyof typeof PLUSH;

/** Felt for patches, pads, noses and cheeks: matte, no pile sheen. */
export const FELT = {
  rose: "#E2A08F",
  pink: "#F2A2B2",
  heart: "#C9403A",
  cocoa: "#3B2419",
  berry: "#D9708A",
} as const;

export const PLUSH_PALETTE = {
  bg: "#1B1622",
  wall: "#2C2336",
  stripe: "#352A41",
  key: "#FFD6A6",
  rim: "#9FB6FF",
  fill: "#C9D3FF",
  bulb: "#FFC979",
  wire: "#2B2420",
  wood: "#4A2F24",
  sheet: "#EDE6DA",
  quilt: ["#86A08B", "#D8B15A", "#EADFCB", "#7290B4", "#C98A73"],
  quiltThread: "#FBF3E4",
  pillow: "#2D5C63",
  pillowDot: "#F3E6CC",
  embroidery: "#F2C35C",
  embroideryShade: "#B8862C",
  threadCream: "#F7EBD6",
  buttonDark: "#1E1513",
  steel: "#C9CED4",
  hud: "#3A2A3E",
  hudDim: "rgba(58,42,62,0.62)",
  chip: "rgba(250,241,226,0.92)",
  accent: "#C9403A",
};
