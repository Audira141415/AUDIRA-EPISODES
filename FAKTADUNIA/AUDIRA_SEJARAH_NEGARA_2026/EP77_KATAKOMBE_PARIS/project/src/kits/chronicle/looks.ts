// CHRONICLE mood presets. Every set is lit by ONE dominant source low in the sky (or a fire), so the people
// read as black cut-outs against a bright background — the core of the look.
import type { Look } from "./Stage.tsx";

/** Golden hour, sun low behind the subject (back-lit silhouettes, long shadows toward camera). */
export const GOLDEN: Look = {
  key: { pos: [-20, 9, -60], color: "#ffc787", intensity: 2.6, shadow: { box: 30, at: [0, 0, 0], far: 200 } },
  hemi: { sky: "#f0b98a", ground: "#3a2a22", intensity: 0.9 },
  fog: { color: "#d9976a", density: 0.012 },
  sky: { zenith: "#5a6a86", horizon: "#f2b07a", ground: "#5d4030", sunDir: [-0.3, 0.07, -1], sunColor: "#ffd7a0", sunSize: 0.45, glow: 1.0 },
  exposure: 1.0,
  bloom: { strength: 0.16, radius: 0.35, threshold: 0.9 },
  grade: { shadow: "#173039", high: "#ffbf7c", amount: 0.14, contrast: 0.18, vignette: 0.34, grain: 0.02 },
  outline: { width: 1, halo: 0.35, gain: 1.6 },
};

/** Dusk over water: blue hour above, last amber line on the horizon. */
export const DUSK: Look = {
  key: { pos: [30, 10, -60], color: "#ffb27a", intensity: 1.2, shadow: { box: 25, at: [0, 0, 0], far: 200 } },
  hemi: { sky: "#6f7fa8", ground: "#1d1a22", intensity: 0.75 },
  fog: { color: "#4f5674", density: 0.006 },
  sky: { zenith: "#16203d", horizon: "#e38f5b", ground: "#1a1a24", sunDir: [0.45, 0.02, -1], sunColor: "#ff9a5c", sunSize: 0.0, glow: 1.1, stars: 0.2 },
  exposure: 1.0,
  bloom: { strength: 0.16, radius: 0.35, threshold: 0.9 },
  grade: { shadow: "#132744", high: "#ffb070", amount: 0.16, contrast: 0.2, vignette: 0.38, grain: 0.022 },
  outline: { width: 1, halo: 0.35, gain: 1.6 },
};

/** Night lit by an eruption / burning city: red glow from one side, ash-brown sky. */
export const INFERNO: Look = {
  key: { pos: [10, 25, -60], color: "#ff6a2a", intensity: 2.2, shadow: { box: 30, at: [0, 0, 0], far: 220 } },
  hemi: { sky: "#7a3a2c", ground: "#120c0c", intensity: 0.65 },
  fog: { color: "#5a2a22", density: 0.0055 },
  sky: { zenith: "#120c12", horizon: "#8a3a22", ground: "#1a0f0d", sunDir: [0.05, 0.25, -1], sunColor: "#ff5a1e", sunSize: 0.0, glow: 1.4 },
  exposure: 1.0,
  bloom: { strength: 0.24, radius: 0.4, threshold: 0.85 },
  grade: { shadow: "#1d1426", high: "#ff9a52", amount: 0.16, contrast: 0.22, vignette: 0.42, grain: 0.024 },
  outline: { width: 1, halo: 0.45, gain: 1.8 },
};

/** The relief map table: cool sea, warm low sun raking across the mountains. */
export const MAPROOM: Look = {
  key: { pos: [-260, 250, -190], color: "#fff1e0", intensity: 2.0 },
  hemi: { sky: "#b4cbd1", ground: "#1d2f35", intensity: 0.7 },
  fog: { color: "#18394a", density: 0.0009 },
  sky: { zenith: "#0d222b", horizon: "#1b3d4a", ground: "#122a33", sunDir: [0, 1, 0], sunColor: "#000000", sunSize: 0, glow: 0 },
  exposure: 1.08,
  bloom: { strength: 0.2, radius: 0.4, threshold: 0.9 },
  grade: { shadow: "#123241", high: "#ffe2bd", amount: 0.08, contrast: 0.12, vignette: 0.4, grain: 0.016 },
  outline: { width: 1, halo: 0.3, gain: 1.6 },
  near: 0.5,
  far: 4000,
};

/** Contour colours: one meaning each, keep them consistent across a film. */
export const INK = {
  hero: "#ffb547", // amber — the protagonist
  ally: "#5fe0d2", // cyan — friends, allies
  foe: "#ff4b3a", // crimson — the enemy, danger
  grief: "#b98cff", // violet — death, tragedy, the fallen
  neutral: "#f3e3c6", // ivory — a named figure without a side
};

/** Moonlit night: cool blue key from behind, deep blue sky with stars and a moon. */
export const NIGHT: Look = {
  key: { pos: [-25, 30, -60], color: "#9fb6ff", intensity: 1.1, shadow: { box: 30, at: [0, 0, 0], far: 200 } },
  hemi: { sky: "#3d4f80", ground: "#0b0d14", intensity: 0.55 },
  fill: { pos: [10, 8, 30], color: "#5a6aa0", intensity: 0.35 },
  fog: { color: "#1b2440", density: 0.008 },
  sky: { zenith: "#070b1a", horizon: "#2d3e6e", ground: "#0b0e18", sunDir: [-0.35, 0.32, -1], sunColor: "#dfe6ff", sunSize: 0.18, glow: 0.45, stars: 0.9 },
  exposure: 1.0,
  bloom: { strength: 0.2, radius: 0.4, threshold: 0.85 },
  grade: { shadow: "#0e1a3a", high: "#d9e2ff", amount: 0.14, contrast: 0.18, vignette: 0.42, grain: 0.024 },
  outline: { width: 1, halo: 0.4, gain: 1.7 },
};

/** Misty morning: pale low sun behind the trees, cool haze. */
export const MORNING: Look = {
  key: { pos: [15, 12, -60], color: "#ffe2b8", intensity: 2.2, shadow: { box: 30, at: [0, 0, 0], far: 200 } },
  hemi: { sky: "#c9d6dc", ground: "#3a3a32", intensity: 0.9 },
  fill: { pos: [10, 8, 30], color: "#b8c6d6", intensity: 0.35 },
  fog: { color: "#b9c4c4", density: 0.02 },
  sky: { zenith: "#7f97a8", horizon: "#e2cdb0", ground: "#5a5a50", sunDir: [0.25, 0.12, -1], sunColor: "#fff0d0", sunSize: 0.35, glow: 0.9 },
  exposure: 1.0,
  bloom: { strength: 0.18, radius: 0.45, threshold: 0.88 },
  grade: { shadow: "#24363a", high: "#ffe2bd", amount: 0.1, contrast: 0.14, vignette: 0.32, grain: 0.018 },
  outline: { width: 1, halo: 0.3, gain: 1.6 },
};

/** Hot hazy day, sun high-ish behind the stage. */
export const DAY: Look = {
  key: { pos: [-15, 30, -60], color: "#fff0d6", intensity: 2.6, shadow: { box: 30, at: [0, 0, 0], far: 200 } },
  hemi: { sky: "#d9e3e8", ground: "#5a4a3a", intensity: 1.0 },
  fill: { pos: [10, 8, 30], color: "#d0d8e0", intensity: 0.3 },
  fog: { color: "#e3d9c4", density: 0.008 },
  sky: { zenith: "#7f9bb4", horizon: "#f3e6cc", ground: "#6a5a48", sunDir: [-0.2, 0.35, -1], sunColor: "#fff6e0", sunSize: 0.3, glow: 1.0 },
  exposure: 1.0,
  bloom: { strength: 0.16, radius: 0.4, threshold: 0.9 },
  grade: { shadow: "#2a3438", high: "#ffe7c2", amount: 0.1, contrast: 0.16, vignette: 0.3, grain: 0.018 },
  outline: { width: 1, halo: 0.3, gain: 1.6 },
};

/** Interior by day: dim warm room, blinding doorway / window at the back. */
export const ROOM_DAY: Look = {
  key: { pos: [2, 7, -26], color: "#ffd9a6", intensity: 2.6, shadow: { box: 12, at: [0, 0, -2], far: 80, bias: -0.0006 } },
  hemi: { sky: "#8a6a50", ground: "#1c120c", intensity: 0.55 },
  fill: { pos: [6, 6, 20], color: "#7a6a5a", intensity: 0.25 },
  fog: { color: "#5a3a26", density: 0.012 },
  sky: { zenith: "#e8c896", horizon: "#f3dcb4", ground: "#c8a878", sunDir: [0, 0.2, -1], sunColor: "#fff2d8", sunSize: 0, glow: 0.4 },
  exposure: 0.95,
  bloom: { strength: 0.18, radius: 0.4, threshold: 0.9 },
  grade: { shadow: "#2a1c18", high: "#ffcf8f", amount: 0.14, contrast: 0.2, vignette: 0.42, grain: 0.022 },
  outline: { width: 1, halo: 0.35, gain: 1.6 },
};

/** Interior at night: candle / lamp light only, cold window. */
export const ROOM_NIGHT: Look = {
  key: { pos: [3, 8, -24], color: "#7f93c8", intensity: 0.5, shadow: { box: 12, at: [0, 0, -2], far: 80, bias: -0.0006 } },
  hemi: { sky: "#3a2a20", ground: "#0c0806", intensity: 0.35 },
  fog: { color: "#20140e", density: 0.03 },
  sky: { zenith: "#0b1022", horizon: "#24304e", ground: "#0b0b12", sunDir: [0, 0.3, -1], sunColor: "#cfd8ff", sunSize: 0.12, glow: 0.3, stars: 0.6 },
  exposure: 1.0,
  bloom: { strength: 0.32, radius: 0.5, threshold: 0.8 },
  grade: { shadow: "#1a1220", high: "#ffbf73", amount: 0.16, contrast: 0.2, vignette: 0.48, grain: 0.026 },
  outline: { width: 1, halo: 0.4, gain: 1.7 },
};
