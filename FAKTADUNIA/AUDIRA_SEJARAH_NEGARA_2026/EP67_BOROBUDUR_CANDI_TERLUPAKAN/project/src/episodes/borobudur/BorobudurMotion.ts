// EP67 Borobudur — custom timing for 95-second film.
// Three acts: FORM (0–14s building), STAND (14–44s peak), ERODE (44–64s burial),
// REVEAL (66–81s rediscovery/Raffles 1814), OUTRO (81–95s final).

import { clamp01 } from "../../kits/pasirforge/lib/noise.ts";

export const BSECONDS = 95;

const seg  = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (k: number) => k * k * (3 - 2 * k);
const easeOut  = (k: number) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export const BFORM   = { start: 0.05, end: 14.0 };
export const BERODE  = { start: 44.0, end: 64.0 };
export const BREVEAL = { start: 66.0, end: 81.0 };
export const BSWASH  = { start: 63.0, peak: 65.5, reach: -0.95, shore: -3.4 };

/** Highest point of Borobudur sculpture (main stupa top). */
export const BH_TOP = 3.14;

export const bformAt  = (t: number) => {
  const k = seg(t, BFORM.start, BFORM.end);
  return 0.45 * k + 0.55 * easeInOut(k);
};
export const berodeAt = (t: number) => {
  if (t < BERODE.start) return 0;
  if (t > BREVEAL.start) return 1 - smooth(seg(t, BREVEAL.start, BREVEAL.end));
  return smooth(seg(t, BERODE.start, BERODE.end));
};
export const bheapAt  = (t: number) => 1 - smooth(seg(t, 0.2, 12.0));
export const bpileAt  = (t: number) => {
  const grow = smooth(seg(t, BERODE.start + 2, BERODE.end));
  const clear = smooth(seg(t, BREVEAL.start, BREVEAL.end));
  return grow * (1 - clear * 0.7);
};

export function bceilingAt(t: number): { y: number; amp: number } {
  if (t < BERODE.start) {
    // Formation phase
    return { y: -0.08 + (BH_TOP + 0.13) * bformAt(t), amp: 0.045 };
  }
  if (t < BREVEAL.start) {
    // Erosion phase: ceiling sinks, ragged front
    const e = smooth(seg(t, BERODE.start, BERODE.end));
    return { y: BH_TOP + 0.05 - e * 1.4, amp: 0.045 + 0.45 * e };
  }
  // Reveal phase: Raffles uncovers the monument — ceiling sweeps back up
  const r = smooth(seg(t, BREVEAL.start, BREVEAL.end));
  const frozenE = 1.0;
  const buriedY = BH_TOP + 0.05 - frozenE * 1.4;
  return {
    y: buriedY + (BH_TOP + 0.08 - buriedY) * r,
    amp: 0.045 + 0.45 * (1 - r * 0.85),
  };
}

export const bseaLevel = (t: number) => -3.1 + 0.012 * Math.sin(t * 1.25);

export function bswashFront(t: number): number {
  if (t < BSWASH.start) return -99;
  const up   = easeOut(seg(t, BSWASH.start, BSWASH.peak));
  const back = smooth(seg(t, BSWASH.peak + 0.1, BSWASH.peak + 1.8)) * 0.55;
  return BSWASH.shore + (BSWASH.reach - BSWASH.shore) * (up - back);
}
export const bwetFront = (t: number) =>
  t < BSWASH.start ? -99 : BSWASH.shore + (BSWASH.reach - BSWASH.shore) * easeOut(seg(t, BSWASH.start, BSWASH.peak));

export function bstageAt(t: number): { label: string; pct: number; eroding: boolean } {
  if (t < BERODE.start)  return { label: "TERBENTUK",   pct: bformAt(t),  eroding: false };
  if (t < BREVEAL.start) return { label: "TERKIKIS",    pct: berodeAt(t), eroding: true  };
  if (t < BREVEAL.end)   return { label: "TERSINGKAP",  pct: 1 - berodeAt(t), eroding: false };
  return { label: "TEGAK KEMBALI", pct: 1,  eroding: false };
}
