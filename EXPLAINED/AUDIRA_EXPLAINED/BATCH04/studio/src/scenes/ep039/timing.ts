// AE-039 film timing: every cut and beat is read from timeline.json (Audio Master Clock).

import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

export const TIMELINE = TL as unknown as { total: number; voEnd: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const TOTAL = TIMELINE.total;
export const SEC = TIMELINE.sections;

const clip = (id: string) => {
  const c = TIMELINE.clips.find((k) => k.id === id);
  if (!c) throw new Error(`clip ${id} missing`);
  return c;
};
export const S = (id: string) => clip(id).start;
export const E = (id: string) => clip(id).end;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** Start time of the first word in clip `id` that starts with `prefix` (word end if `end`). */
export const W = (id: string, prefix: string, end = false) => {
  const w = clip(id).words.find((k) => norm(k.w).startsWith(norm(prefix)));
  if (!w) throw new Error(`word ${prefix} not in ${id}`);
  return end ? w.e : w.s;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (t: number, a: number, b: number) => {
  const x = ramp(t, a, b);
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export type SceneId = "pipe" | "overview" | "launcher";
export type ShotDef = {
  id: string;
  t0: number;
  t1: number;
  scene: SceneId;
  from: { pos: [number, number, number]; target: [number, number, number]; fov: number };
  to: { pos: [number, number, number]; target: [number, number, number]; fov: number };
};

/** Shot boundaries, each tied to a VO clip/word. */
export const CUT = {
  A: 0,
  B: S("l02") - 0.06,
  C: S("l03") - 0.2,
  D: S("l04") - 0.15,
  E: S("l05") - 0.2,
  F: S("l06") - 0.15,
  G: S("l07") - 0.15,
  H: S("l08") - 0.2,
  I: S("l09") - 0.1,
  J: W("l09", "didorong") - 0.1,
  K: S("l10") - 0.15,
  L: S("l11") - 0.2,
  M: S("l12") - 0.2,
  END: TOTAL,
};
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;
