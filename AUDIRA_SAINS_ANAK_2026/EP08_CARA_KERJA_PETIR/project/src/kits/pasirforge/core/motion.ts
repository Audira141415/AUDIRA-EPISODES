// PASIRFORGE timing. One story about time: the sculpture rises out of a heap of sand (a ceiling sweeps
// up through it), stands finished in the low sun, then erodes (edges round off, the crowns crumble,
// grains trickle and avalanche into an apron at the base, wind lifts a veil) until a wave reaches it.
// Everything is a pure function of film time t (seconds): safe for parallel renders.

import { clamp01, SEA_Y } from "../lib/noise.ts";

export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** Highest point of the sculpture (finials), world units. */
export const H_TOP = 2.9;

export const FORM = { start: 0.05, end: 5.0 };
export const ERODE = { start: 6.6, end: 11.7 };
export const SWASH = { start: 10.25, peak: 11.55, reach: -0.95, shore: -3.4 };

/** 0..1: how much of the sculpture has formed (HUD "TERBENTUK"). */
export const formAt = (t: number) => {
  const k = seg(t, FORM.start, FORM.end);
  // Starts moving at once (the hook shows the plinth breaking out of the heap), lands softly.
  return 0.45 * k + 0.55 * easeInOut(k);
};
/** 0..1: how far erosion has gone (HUD "TERKIKIS"). */
export const erodeAt = (t: number) => smooth(seg(t, ERODE.start, ERODE.end));
/** The heap the sculpture is made from: full at the start, used up as the form rises. */
export const heapAt = (t: number) => 1 - smooth(seg(t, 0.2, 4.2));
/** The apron of fallen sand at the base. */
export const pileAt = (t: number) => smooth(seg(t, 7.0, 11.95));

/**
 * The sculpting ceiling: everything above `y + noise × amp` is not (or no longer) there. It sweeps up
 * during formation with a tight front, then sinks during erosion with a ragged front (crowns go first).
 */
export function ceilingAt(t: number): { y: number; amp: number } {
  if (t < ERODE.start) return { y: -0.08 + (H_TOP + 0.13) * formAt(t), amp: 0.045 };
  const e = erodeAt(t);
  return { y: H_TOP + 0.05 - e * 1.15, amp: 0.045 + 0.4 * e };
}

/** Sea level with a slow swell (the idle shoreline breathes in and out). */
export const seaLevel = (t: number) => SEA_Y + 0.012 * Math.sin(t * 1.25);

/** Front of the final swash wave (world z), -Infinity when there is none. */
export function swashFront(t: number): number {
  if (t < SWASH.start) return -99;
  const up = easeOut(seg(t, SWASH.start, SWASH.peak));
  const back = smooth(seg(t, SWASH.peak + 0.1, SWASH.peak + 1.6)) * 0.55;
  return SWASH.shore + (SWASH.reach - SWASH.shore) * (up - back);
}
/** Furthest the swash has reached so far (sand behind it stays wet). */
export const wetFront = (t: number) => (t < SWASH.start ? -99 : SWASH.shore + (SWASH.reach - SWASH.shore) * easeOut(seg(t, SWASH.start, SWASH.peak)));

/** Stage label for the HUD. */
export function stageAt(t: number): { label: string; pct: number; eroding: boolean } {
  if (t < ERODE.start) return { label: "TERBENTUK", pct: formAt(t), eroding: false };
  return { label: t > SWASH.start + 0.4 ? "OMBAK DATANG" : "TERKIKIS", pct: erodeAt(t), eroding: true };
}

/** Beach clock for the HUD: the film compresses the last hour of daylight (16.58 → 17.54 WIB). */
export function clockAt(t: number): string {
  const m = 16 * 60 + 58 + Math.floor((t / 12) * 56);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")} WIB`;
}
