// EP09 Laut Dalam — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 83.36 s, speed 1.06).
export const VO_END = 83.36;
export const OUTRO_SECONDS = 3.2;
export const ABYSS_SECONDS = 86.6;

export type SceneId = "hook" | "surface" | "zones" | "pressure" | "trench" | "mapping" | "glow" | "outro";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 11.0 }, // "Manusia sudah berjalan di Bulan ... Kenapa?"
  { id: "surface", start: 11.0, end: 17.85 }, // "Ayo menyelam bareng Audira! Laut menutupi ..."
  { id: "zones", start: 17.85, end: 33.4 }, // "Masalah pertama: cahaya ... zona hadal di palung laut."
  { id: "pressure", start: 33.4, end: 39.5 }, // "Masalah kedua: tekanan ..."
  { id: "trench", start: 39.5, end: 53.0 }, // Challenger Deep, Everest, > 1000x
  { id: "mapping", start: 53.0, end: 67.9 }, // satelit, sonar, 29 persen
  { id: "glow", start: 67.9, end: 76.8 }, // 3 dari 4 hewan bercahaya, ikan pemancing
  { id: "outro", start: 76.8, end: ABYSS_SECONDS }, // "Luar angkasa memang jauh ..." + outro card
];

export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
/** 0→1 between a and b (film seconds), smoothstep. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Depth in metres during the "zones" descent (piecewise, keyed to the VO). */
const DEPTH_KEYS: [number, number][] = [
  [17.85, 0],
  [20.3, 60],
  [23.3, 200],
  [25.9, 700],
  [28.6, 1000],
  [30.2, 3200],
  [31.4, 4600],
  [32.4, 6300],
  [33.4, 7200],
];
export const depthAt = (t: number) => {
  if (t <= DEPTH_KEYS[0][0]) return 0;
  for (let i = 1; i < DEPTH_KEYS.length; i++) {
    const [t1, m1] = DEPTH_KEYS[i];
    const [t0, m0] = DEPTH_KEYS[i - 1];
    if (t <= t1) return lerp(m0, m1, (t - t0) / (t1 - t0));
  }
  return DEPTH_KEYS[DEPTH_KEYS.length - 1][1];
};
/** World units per metre in the zones scene (1 unit = 200 m). */
export const M2U = 1 / 200;
