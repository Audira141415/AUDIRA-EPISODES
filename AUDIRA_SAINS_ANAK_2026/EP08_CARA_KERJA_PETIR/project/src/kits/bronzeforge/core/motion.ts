// BRONZEFORGE timing and layout. Everything is a pure function of film time t (seconds), so every
// frame renders the same in any order (parallel segments, stills).
//
//   0.0–2.75  pour: the crucible tilts, a molten stream falls into the sprue, sparks spit, the seam glows
//   2.75–3.4  the crucible lifts away; the stream's tail falls
//   3.25–4.15 the sand mould splits and falls away: the casting glows white-orange inside
//   4.2–6.2   it cools (thin wings first, thick body last) to a dark as-cast skin; embers rise
//   6.0–7.6   a polishing front sweeps down the statue: raw oxide becomes bright bronze
//   7.7–10.3  it ages: the body browns, verdigris spreads from the crevices; raised edges stay rubbed gold
//   10.3–12   monument: heroic low three-quarter reveal, the AUDIRA plaque on the plinth

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
export const easeIn = (k: number) => k * k * k;
export const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

type V3 = [number, number, number];

// --- Layout (world units, y up, statue faces +z) -----------------------------------------------
export const PLINTH = { w: 0.96, d: 0.96, h: 0.84, base: 0.08, cap: 0.05 };
/** Plinth top (where the statue's base stands). */
export const TOP_Y = PLINTH.base + PLINTH.h + PLINTH.cap;
export const MOULD = { w: 1.1, h: 1.12, d: 0.8 };
export const MOULD_TOP = TOP_Y + MOULD.h;
/** Pouring cup on top of the mould (right half). */
export const SPRUE: V3 = [0.24, MOULD_TOP + 0.07, 0.12];
/** Crucible lip where the stream leaves. */
export const LIP: V3 = [SPRUE[0] - 0.24, SPRUE[1] + 0.62, SPRUE[2]];
/** Statue scale on the plinth, its local height (sculpture units) and world height (for framing). */
export const STATUE_SCALE = 0.86;
export const STATUE_LOCAL_H = 1.19;
export const STATUE_H = STATUE_LOCAL_H * STATUE_SCALE;

// --- Pour ---------------------------------------------------------------------------------------
export const POUR = { end: 2.7, tailEnd: 3.0 };
/** Fill of the mould 0..1 (seam glow, cup level). */
export const fillAt = (t: number) => smooth(seg(t, 0.05, 2.8));
/** Crucible tilt (radians about z, positive tips the lip toward the sprue). */
export const crucibleTilt = (t: number) => 1.0 + 0.45 * smooth(seg(t, 0, POUR.end)) - 0.9 * smooth(seg(t, 2.75, 3.5));
/** Crucible lifts out of frame after the pour. */
export const crucibleLift = (t: number) => easeIn(seg(t, 2.8, 3.7)) * 1.8;
/** Stream visibility: fraction of the stream (from the lip) already gone as the tail falls. */
export const streamCut = (t: number) => smooth(seg(t, POUR.end - 0.05, POUR.tailEnd));
/** Stream thickness multiplier (thins as the crucible empties). */
export const streamWidth = (t: number) => (0.85 + 0.15 * Math.sin(t * 9.0) * Math.sin(t * 3.3)) * (1 - 0.45 * seg(t, 2.2, POUR.end));

// --- Mould break-out ----------------------------------------------------------------------------
export const OPEN = { start: 3.25, end: 4.15 };
/** 0..1: halves split, swing out and fall. */
export const openAt = (t: number) => seg(t, OPEN.start, OPEN.end);
export function mouldHalf(side: -1 | 1, t: number): { pos: V3; rotZ: number; rotY: number; visible: boolean } {
  const k = openAt(t);
  const slide = easeOut(seg(k, 0, 0.45)) * 0.22;
  const fall = easeIn(seg(k, 0.25, 1));
  return {
    pos: [side * (slide + fall * 0.9), -fall * 2.4, fall * 0.25],
    rotZ: side * -fall * 0.9,
    rotY: side * fall * 0.35,
    visible: k < 0.999,
  };
}

// --- Heat, polish, patina -----------------------------------------------------------------------
/** Casting heat 0..1 (1 = white-orange). Stays full until the mould is off, then cools. */
export const heatAt = (t: number) => 1 - smooth(seg(t, 4.15, 6.25));
/** Temperature for the HUD (°C): 1100 at the pour, ~40 cold. */
export const tempAt = (t: number) => Math.round(40 + 1060 * Math.pow(heatAt(t), 1.6));
export const POLISH = { start: 6.0, end: 7.6 };
export const polishAt = (t: number) => smooth(seg(t, POLISH.start, POLISH.end));
/** Height (statue local y) of the polishing front; polished above it. */
export const polishFront = (t: number) => STATUE_LOCAL_H + 0.08 - (STATUE_LOCAL_H + 0.2) * polishAt(t);
export const PATINA = { start: 7.7, end: 10.3 };
export const patinaAt = (t: number) => smooth(seg(t, PATINA.start, PATINA.end));
export const MONUMENT = 10.3;

export type Stage = "COR PERUNGGU" | "BONGKAR CETAKAN" | "PENDINGINAN" | "POLES" | "PATINA" | "MONUMEN";
export function stageAt(t: number): Stage {
  if (t < OPEN.start) return "COR PERUNGGU";
  if (t < 4.2) return "BONGKAR CETAKAN";
  if (t < POLISH.start) return "PENDINGINAN";
  if (t < PATINA.start - 0.1) return "POLES";
  if (t < MONUMENT + 0.2) return "PATINA";
  return "MONUMEN";
}

// --- Particles (closed-form ballistics) ---------------------------------------------------------
export type Particle = { t0: number; life: number; p0: V3; v: V3; g: number; s: number; heat: number };

/** Sparks spitting from the sprue cup while the metal goes in. */
export function makeSparks(): Particle[] {
  const r = rng(4021);
  const out: Particle[] = [];
  const N = 150;
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2;
    const sp = 0.5 + r() * 1.3;
    out.push({
      t0: (i / N) * POUR.end + r() * 0.02 - 0.3,
      life: 0.35 + r() * 0.55,
      p0: [SPRUE[0] + (r() - 0.5) * 0.04, SPRUE[1] + 0.01, SPRUE[2] + (r() - 0.5) * 0.04],
      v: [Math.cos(a) * sp * 0.7, 0.7 + r() * 1.6, Math.sin(a) * sp * 0.7],
      g: 5.5,
      s: 0.5 + r() * 0.8,
      heat: 0.7 + r() * 0.3,
    });
  }
  return out;
}

/** Embers lifting off the hot casting once it is exposed. */
export function makeEmbers(): Particle[] {
  const r = rng(733);
  const out: Particle[] = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    out.push({
      t0: OPEN.start + 0.3 + r() * 2.6,
      life: 1.0 + r() * 1.4,
      p0: [(r() - 0.5) * 0.7, TOP_Y + 0.15 + r() * 0.85, (r() - 0.5) * 0.4],
      v: [(r() - 0.5) * 0.15, 0.25 + r() * 0.35, (r() - 0.5) * 0.15],
      g: -0.05,
      s: 0.4 + r() * 0.7,
      heat: 0.5 + r() * 0.5,
    });
  }
  return out;
}

/** Sand crumbs shaken off the casting as the mould breaks. */
export function makeCrumbs(): Particle[] {
  const r = rng(977);
  const out: Particle[] = [];
  const N = 110;
  for (let i = 0; i < N; i++) {
    const side = r() < 0.5 ? -1 : 1;
    out.push({
      t0: OPEN.start + r() * 0.5,
      life: 0.9,
      p0: [side * (0.05 + r() * 0.4), TOP_Y + 0.1 + r() * 1.0, (r() - 0.5) * 0.6],
      v: [side * (0.2 + r() * 0.5), r() * 0.4, (r() - 0.3) * 0.4],
      g: 6.5,
      s: 0.6 + r() * 1.0,
      heat: 0,
    });
  }
  return out;
}

/** Position, velocity and age 0..1 of a particle at t (null when not alive). */
export function particleAt(p: Particle, t: number): { p: V3; v: V3; age: number } | null {
  const tau = t - p.t0;
  if (tau < 0 || tau > p.life) return null;
  return {
    p: [p.p0[0] + p.v[0] * tau, p.p0[1] + p.v[1] * tau - 0.5 * p.g * tau * tau, p.p0[2] + p.v[2] * tau],
    v: [p.v[0], p.v[1] - p.g * tau, p.v[2]],
    age: tau / p.life,
  };
}
