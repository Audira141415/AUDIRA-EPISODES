// EP10 Kucing Mendarat — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 90.93 s).
export const VO_END = 90.93;
export const OUTRO_SECONDS = 3.2;
export const CAT_SECONDS = 94.4;

export type SceneId = "hook" | "marey" | "ear" | "spine" | "momentum" | "landing" | "outro";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 8.6 }, // "Kucing jatuh ... Ini Audira Sains."
  { id: "marey", start: 8.6, end: 27.5 }, // 1894 Marey ... 3–4 minggu
  { id: "ear", start: 27.5, end: 40.7 }, // langkah pertama: vestibular, mata
  { id: "spine", start: 40.7, end: 53.6 }, // langkah kedua: tulang punggung, selangka
  { id: "momentum", start: 53.6, end: 74.6 }, // momentum sudut 90° / 10°, gantian, berbalik
  { id: "landing", start: 74.6, end: 82.4 }, // kaki dijulurkan, punggung melengkung, pegas
  { id: "outro", start: 82.4, end: CAT_SECONDS }, // jangan dicoba + ikuti + outro card
];

export const sceneAt = (t: number) => SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];
export const span = (id: SceneId) => SCENES.find((s) => s.id === id)!;
export const prog = (t: number, id: SceneId) => {
  const s = span(id);
  return Math.min(1, Math.max(0, (t - s.start) / (s.end - s.start)));
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
/** 0→1 between a and b (film seconds), smoothstep. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
