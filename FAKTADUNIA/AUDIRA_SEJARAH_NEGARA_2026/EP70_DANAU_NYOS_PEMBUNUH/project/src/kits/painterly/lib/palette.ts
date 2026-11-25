// PAINTERLY: stylised 3D that looks hand-painted in oil/gouache. Warm light, cool coloured shadows.
import type { ColorGradeProfile } from "../../../core/render/FinishingPresets.ts";

/** Golden-hour painted grade: warm highlights, violet-blue shadows, soft vignette, light canvas grain. */
export const PAINTERLY_GRADE: ColorGradeProfile = {
  name: "Painted Golden Hour",
  vignette: 0.26,
  grain: 0.018,
  chromaticAberration: 0,
  contrastCurve: 0.22,
  saturation: 1.15,
  highlightTint: [0.03, 0.012, -0.02],
  shadowTint: [-0.012, -0.004, 0.03],
};

/** Sun direction (towards the sun), shared by the lights and every painted shader. */
export const SUN_DIR: [number, number, number] = (() => {
  const v = [-0.78, 0.42, -0.46];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l] as [number, number, number];
})();

/** Aerial perspective: everything drifts towards this haze with distance from the camera. */
export const HAZE = { color: "#C9C3D6", near: 9, far: 95 };

export const PAINT = {
  bg: "#8FA6C8",
  // sky
  zenith: "#4F6FA6",
  skyMid: "#8FA9CE",
  horizon: "#F2C9A0",
  sunGlow: "#FFE3B0",
  cloudLight: "#FFF1DC",
  cloudMid: "#E7C6B8",
  cloudShadow: "#8C8FB4",
  // land
  grass: "#7FA04A",
  grassDeep: "#4E7A3C",
  grassWarm: "#C2B653",
  dirt: "#B88A5A",
  rock: "#C59766",
  rockDeep: "#94603F",
  bark: "#6B4A35",
  leafShadow: "#2F4F5C",
  leafMid: "#4F8A45",
  leafLight: "#C9CF62",
  // sea
  sea: "#3F7C9E",
  seaDeep: "#2D5679",
  seaLight: "#9CCBD2",
  glint: "#FFF0C8",
  // village
  wallCream: "#EFE0C2",
  wallOchre: "#E0B26A",
  wallRose: "#D99A86",
  roofRed: "#B9503A",
  roofBlue: "#3E6A8E",
  window: "#FFC46A",
  lighthouseRed: "#C2412F",
  lighthouseWhite: "#F3EBDD",
  // character
  cloak: "#B6452E",
  scarf: "#E6B24A",
  skin: "#E2AE86",
  boots: "#4A3328",
  // sign
  signBoard: "#2F5B66",
  signPaint: "#F6E6C4",
  signWood: "#7A5638",
  // HUD
  hudInk: "#2A2018",
  hudCanvas: "rgba(246,236,214,0.92)",
  hudDim: "rgba(42,32,24,0.6)",
  accent: "#C2412F",
};

/** Multipliers that turn a local colour into its painted shadow (cool) and light (warm) values. */
export const SHADOW_TINT: [number, number, number] = [0.42, 0.46, 0.7];
export const LIGHT_TINT: [number, number, number] = [1.22, 1.1, 0.88];
