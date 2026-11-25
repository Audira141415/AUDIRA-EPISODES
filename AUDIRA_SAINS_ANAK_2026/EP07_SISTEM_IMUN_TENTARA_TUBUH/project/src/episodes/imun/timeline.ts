// EP07 Sistem Imun — scene clock locked to the Cartesia VO (public/audio/vo-words.json, 79.18 s).
export const VO_END = 79.18;
export const OUTRO_SECONDS = 3.2;
export const IMUN_SECONDS = 82.6;

export type SceneId = "hook" | "patrol" | "wound" | "macro" | "attack" | "memory" | "outro";

/** [start, end) in film seconds. Cuts sit in VO pauses between sentences. */
export const SCENES: { id: SceneId; start: number; end: number }[] = [
  { id: "hook", start: 0, end: 6.23 }, // "Detik ini juga ... tidak merasakannya."
  { id: "patrol", start: 6.23, end: 19.28 }, // 100 miliar neutrofil, separuh lebih, berpatroli
  { id: "wound", start: 19.28, end: 34.61 }, // kulit tergores, neutrofil menelan, nanah
  { id: "macro", start: 34.61, end: 47.63 }, // makrofag 1884, sel T pembantu, perintah
  { id: "attack", start: 47.63, end: 57.62 }, // sel T pembunuh, sel B + antibodi
  { id: "memory", start: 57.62, end: 71.12 }, // sel memori, cacar air, langsung siap
  { id: "outro", start: 71.12, end: IMUN_SECONDS }, // malam ini ... Ikuti Audira Sains + outro card
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
export type V3 = [number, number, number];
export const lerp3 = (a: readonly number[], b: readonly number[], k: number) =>
  [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] as V3;
/** 0 → 1.12 → 1 pop starting at `at`. */
export const pop = (t: number, at: number, d = 0.4) => {
  if (t <= at) return 0;
  const k = (t - at) / d;
  if (k >= 1) return 1;
  return k < 0.6 ? (k / 0.6) * 1.12 : 1.12 - ((k - 0.6) / 0.4) * 0.12;
};
