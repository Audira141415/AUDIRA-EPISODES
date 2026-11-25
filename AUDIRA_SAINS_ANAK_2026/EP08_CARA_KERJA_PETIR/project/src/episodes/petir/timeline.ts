// EP08 Petir — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 84.10 s, speed 1.04).
export const VO_END = 84.1;
export const OUTRO_SECONDS = 3.2;
export const PETIR_SECONDS = 87.3;

export type SceneId = "hook" | "cloud" | "charges" | "leader" | "stroke" | "heat" | "distance" | "safety";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 8.45 }, // "Kilat menyambar ... Kok bisa? Halo, ini Audira Sains."
  { id: "cloud", start: 8.45, end: 12.2 }, // "Semuanya dimulai di dalam awan badai ... kumulonimbus."
  { id: "charges", start: 12.2, end: 26.6 }, // es + graupel bertabrakan, + atas, − bawah, tanah +
  { id: "leader", start: 26.6, end: 40.0 }, // pemimpin bertingkat ±50 m, streamer dari pohon/antena/gedung
  { id: "stroke", start: 40.0, end: 51.0 }, // tersambung, arus balik 1/3 c, berkedip 3–4×
  { id: "heat", start: 51.0, end: 63.8 }, // 28.000 °C, 5× Matahari, mengembang → guntur
  { id: "distance", start: 63.8, end: 76.9 }, // cahaya vs suara, hitung detik ÷ 3
  { id: "safety", start: 76.9, end: PETIR_SECONDS }, // masuk rumah + outro card
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

/** Lightning flash envelope: main stroke at `at` plus re-strikes (sec offsets), each a fast decay. */
export const flash = (t: number, at: number, restrikes: number[] = [0, 0.07, 0.16]) =>
  Math.min(1.4, restrikes.reduce((s, d) => (t >= at + d ? s + Math.exp(-(t - at - d) * 22) : s), 0));

/** Stepped-leader progress 0..1, advancing in discrete jumps (pause, then a quick step). */
export const stepped = (t: number, a: number, b: number, steps: number) => {
  const k = clamp01((t - a) / (b - a)) * steps;
  const i = Math.floor(k);
  const f = k - i;
  return Math.min(1, (i + smooth(f / 0.25)) / steps);
};
