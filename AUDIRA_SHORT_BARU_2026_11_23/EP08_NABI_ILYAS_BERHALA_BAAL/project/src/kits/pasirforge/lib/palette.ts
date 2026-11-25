// PASIRFORGE: an original sand sculpture on a beach at golden hour. It forms out of a pile of sand,
// stands carved and crisp, then erodes back into sand with time (wind, avalanches, a wave).
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Golden-hour beach grade: honey highlights, cool blue-violet shadows, soft vignette, fine grain. */
export const PASIR_GRADE: ColorGradeProfile = {
  name: "Golden Hour Beach",
  vignette: 0.3,
  grain: 0.014,
  chromaticAberration: 0,
  contrastCurve: 0.34,
  saturation: 0.9,
  highlightTint: [0.035, 0.014, -0.028],
  shadowTint: [-0.018, -0.004, 0.026],
};

/** Sand tones (linear-ish sRGB hex). Dry sand is light and grainy; wet sand darker and smoother. */
export const SAND = {
  dry: "#E6C690",
  dryLight: "#F3DDB0",
  dryDark: "#C9A26C",
  packed: "#D8B47C",
  wet: "#9F7C51",
  wetDeep: "#7A5C3A",
  mineral: "#5B4636",
  shell: "#F6EEE2",
} as const;

export const PASIR_PALETTE = {
  bg: "#E7A779",
  skyTop: "#47679A",
  skyMid: "#C98C79",
  horizon: "#FFC48A",
  sunGlow: "#FFE3AE",
  sun: "#FFB86E",
  seaDeep: "#24485C",
  seaNear: "#3D7480",
  foam: "#FFF3E2",
  fill: "#8FAED6",
  hud: "#FFF4E2",
  hudDim: "rgba(255,244,226,0.66)",
  chip: "rgba(58,36,20,0.66)",
  accent: "#FFB86E",
  erode: "#F07B4A",
};

/**
 * Sun direction (unit vector toward the sun) at film time t: low in the west, to the left of the
 * sculpture (raking across its front), sinking from ~19° to ~10° over the film so the light warms and the shadows lengthen.
 */
export function sunDir(t: number): [number, number, number] {
  const el = ((19 - (t / 12) * 9) * Math.PI) / 180;
  const az = (-76 * Math.PI) / 180; // degrees around +y from +z: from the left, a little in front
  const x = Math.cos(el) * Math.sin(az), y = Math.sin(el), z = Math.cos(el) * Math.cos(az);
  return [x, y, z];
}
