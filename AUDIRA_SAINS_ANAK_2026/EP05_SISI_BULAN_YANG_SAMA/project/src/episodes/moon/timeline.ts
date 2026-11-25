// EP05 Sisi Bulan — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 84.10 s).
export const VO_END = 84.1;
export const OUTRO_SECONDS = 3.2;
export const MOON_SECONDS = 87.5;

export type SceneId = "hook" | "nights" | "orbit" | "bulge" | "wobble" | "farside" | "missions" | "laser" | "outro";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 4.75 }, // "Sampai tahun 1959 ... punggung Bulan."
  { id: "nights", start: 4.75, end: 12.5 }, // "Padahal setiap malam ... Itu keliru."
  { id: "orbit", start: 12.5, end: 26.1 }, // "Bulan berputar ... penguncian pasang surut."
  { id: "bulge", start: 26.1, end: 39.3 }, // "Kenapa bisa begitu? ... lalu terkunci."
  { id: "wobble", start: 39.3, end: 46.1 }, // "Tapi Bulan juga sedikit bergoyang ... 59 persen"
  { id: "farside", start: 46.1, end: 51.7 }, // "Dan sisi jauh itu tidak gelap ..."
  { id: "missions", start: 51.7, end: 64.2 }, // Luna 3, Chang'e 4, Chang'e 6
  { id: "laser", start: 64.2, end: 75.35 }, // laser Apollo, 3,8 cm, 620 juta tahun, 21,5 jam
  { id: "outro", start: 75.35, end: MOON_SECONDS }, // "Hampir semua bulan besar ..." + outro card
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
