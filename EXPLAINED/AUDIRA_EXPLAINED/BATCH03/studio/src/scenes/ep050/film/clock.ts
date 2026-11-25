// Audio Master Clock helpers for EP050: every beat comes from timeline.json (VO seconds).
import TL from "../timeline.json";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };

export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;
export const CLIPS = TIMELINE.clips;

/** Start time of word `i` of clip `id`. */
export const W = (id: string, i: number) => {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) throw new Error(`clip ${id}`);
  return c.words[Math.min(i, c.words.length - 1)].s;
};
export const CLIP = (id: string) => CLIPS.find((x) => x.id === id)!;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeOutBack = (x: number, k = 1.5) => {
  const t = clamp01(x) - 1;
  return 1 + (k + 1) * t * t * t + k * t * t;
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const settle = (t: number, at: number, amp = 0.03, freq = 18, damp = 8) => {
  const a = t - at;
  return a > 0 ? Math.sin(a * freq) * Math.exp(-a * damp) * amp : 0;
};

// ---- shot cuts (VO seconds) ----
export const CUT = {
  checkin: SEC.KONTEKS[0] - 0.35, // 5.0
  tag: SEC.MEKANISME[0] - 0.1, // 8.5
  wall: W("l06", 0) - 0.15, // 16.35
  behind: W("l06", 3) - 0.25, // 17.5 zoom through the hatch
  xray: SEC.REVEAL[0] - 0.3, // 22.8
  sorter: W("l07", 4) - 0.3, // 24.5
  recon: W("l08", 0) - 0.25, // 27.4
  fail: SEC.PAYOFF[0] - 0.3, // 31.7
  pile: W("l10", 0) - 0.25, // 34.1
  claim: SEC.OUTRO[0] - 0.3, // 41.5
};
export const CUT_TIMES = Object.values(CUT);

export type V3 = [number, number, number];
export type Key = { t: number; p: V3; l: V3; fov?: number };

/** Camera through keyframes with cubic easing per segment (never fully stops: add sway outside). */
export const camAt = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const k = ease((t - a.t) / (b.t - a.t));
      const m = (x: V3, y: V3) => [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)] as V3;
      return { t, p: m(a.p, b.p), l: m(a.l, b.l), fov: lerp(a.fov ?? 36, b.fov ?? 36, k) };
    }
  }
  return keys[keys.length - 1];
};
