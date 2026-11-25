// PERSAUDARAAN: one coordinate module. Timing comes only from timeline.json (estimate now, real voice later).
import tl from "./timeline.json";

export const TOTAL_SECONDS: number = tl.total;

export type Who = "narator" | "kakak" | "adik";
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

/** Mouth opening 0..1 for a speaker, driven by the word timestamps of that speaker's own lines. */
export const mouthOf = (who: Who, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start || t > c.end) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const u = (t - w.s) / Math.max(0.05, w.e - w.s);
        return 0.35 + 0.65 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.17))));
      }
    }
  }
  return 0;
};

/* ---------- the village (scene units; a puppet is 6.3 tall) ---------- */

/** Top of the raised earthen path (pematang) the brothers walk on; it runs along x at z = 0. */
export const PATH_Y = 0.3;
export const PATH_X = 21;
/** Barns: adik's at the west end (-x), kakak's at the east end (+x). Ridge along x, door facing +z. */
export const BARN_A: [number, number] = [-25.5, -7];
export const BARN_B: [number, number] = [25.5, -7];
/** Sack stacks stand on a plank between the path and each barn. */
export const STACK_A: [number, number, number] = [-22.6, PATH_Y + 0.2, -2.6];
export const STACK_B: [number, number, number] = [22.6, PATH_Y + 0.2, -2.6];
/** Where a brother stands to take from / add to a stack (path side, toward the middle). */
export const STAND_X = 18.4;
export const HOUSE_A: [number, number] = [-34, -10.5];
export const HOUSE_B: [number, number] = [34.5, -10.5];
export const BENCH_A: [number, number, number] = [-29.5, 0, -3.4];
export const BASE_SACKS = 10;
