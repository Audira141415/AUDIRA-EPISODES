// EP06 Lubang Hitam — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 85.50 s).
export const VO_END = 85.5;
export const OUTRO_SECONDS = 3.2;
export const BLACKHOLE_SECONDS = 89.0;

export type SceneId = "hook" | "squeeze" | "sunswap" | "horizon" | "disk" | "sgra" | "outro";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 5.4 }, // "Lubang hitam tidak menyedot apa pun ... membohongi kita."
  { id: "squeeze", start: 5.4, end: 16.4 }, // "bukan penyedot debu raksasa ... seperti bintang atau planet lain."
  { id: "sunswap", start: 16.4, end: 32.0 }, // "Bayangkan Matahari ... gelap dan dingin."
  { id: "horizon", start: 32.0, end: 47.4 }, // "Bahayanya ... horizon peristiwa ... seperti mi."
  { id: "disk", start: 47.4, end: 55.75 }, // "Benda yang jatuh ... bersinar terang."
  { id: "sgra", start: 55.75, end: 77.3 }, // pusat galaksi, Sgr A*, S2, Nobel 2020
  { id: "outro", start: 77.3, end: BLACKHOLE_SECONDS }, // "Jadi lubang hitam tidak menyedot ..." + outro card
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
export const lerp3 = (a: readonly number[], b: readonly number[], k: number) =>
  [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as [number, number, number];
