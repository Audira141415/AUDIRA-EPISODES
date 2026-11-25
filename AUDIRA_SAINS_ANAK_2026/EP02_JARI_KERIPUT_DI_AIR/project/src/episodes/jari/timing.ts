// EP02 Jari Keriput — scene cuts in VO seconds (public/audio/vo-words.json, Cartesia 84.66 s).
// Audio Master Clock: every cut sits on the first word of a new narrative beat.
export const CUTS = [0, 9.2, 16.4, 31.3, 42.1, 54.9, 70.8, 79.4] as const;
export const VO_END = 84.66;
export const OUTRO_SECONDS = 3;
export const TOTAL_SECONDS = 88;

/** Index of the scene playing at second t. */
export const sceneAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < CUTS.length; k++) if (t >= CUTS[k]) i = k;
  return i;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
/** 0 → 1 between seconds a and b, smoothstep. */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
