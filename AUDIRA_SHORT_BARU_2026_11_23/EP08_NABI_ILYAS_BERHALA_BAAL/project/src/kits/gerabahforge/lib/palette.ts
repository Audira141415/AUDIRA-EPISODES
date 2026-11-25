// GERABAHFORGE: Nusantara pottery (gerabah) in a potter's studio: wet clay thrown on a wheel,
// a flowing teal glaze, matte fired terracotta on the rack, and a wood-fired kiln glowing behind.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Warm kiln grade: ember highlights, slightly teal shadows (so the glaze reads), real S-curve. */
export const GERABAH_GRADE: ColorGradeProfile = {
  name: "Kiln Studio",
  vignette: 0.34,
  grain: 0.014,
  chromaticAberration: 0,
  contrastCurve: 0.38,
  saturation: 0.9,
  highlightTint: [0.035, 0.012, -0.022],
  shadowTint: [-0.012, 0.004, 0.016],
};

/** Clay bodies and glazes (linear-ish sRGB hex, used as material colours). */
export const CLAY = {
  /** Freshly thrown, water-soaked: dark, saturated, glossy. */
  wet: "#5E321F",
  /** Leather-hard / bisque: pale buff before the glaze goes on. */
  dry: "#C68D63",
  /** Fired terracotta (unglazed foot and the pieces on the rack): matte brick red. */
  fired: "#A9502C",
  /** Kasongan-style dark fired body (some rack pieces). */
  firedDark: "#7A3A22",
  /** Slip on the wheel head and in the splash pan. */
  slip: "#5E3220",
} as const;

export const GLAZE = {
  /** Raw (unfired) glaze: chalky, powdery, pale. */
  raw: "#A3AA9E",
  /** Fired glaze, thin where it breaks over ridges and rims. */
  thin: "#4E9E92",
  /** Fired glaze, thick where it pools and beads at the drip ends. */
  thick: "#0B3D3C",
  /** Cream slip-glaze for the brushed lettering. */
  paint: "#F2E2BE",
} as const;

export const GERABAH_PALETTE = {
  bg: "#160E0A",
  wall: "#4A3326",
  floor: "#3A2A20",
  key: "#FFD2A0",
  fill: "#9DB3C8",
  kiln: "#FF7A2A",
  ember: "#FFB050",
  wheelBody: "#2E3A3C",
  tray: "#55595A",
  steel: "#B9BDC0",
  shelf: "#5A3A24",
  hud: "#F8E9D6",
  hudDim: "rgba(248,233,214,0.62)",
  chip: "rgba(36,20,13,0.84)",
  accent: "#FF9A4A",
  glazeAccent: "#6FB7A6",
};
