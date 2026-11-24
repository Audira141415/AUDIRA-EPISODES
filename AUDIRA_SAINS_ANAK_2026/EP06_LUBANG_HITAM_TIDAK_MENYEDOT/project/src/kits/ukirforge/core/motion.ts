// UKIRFORGE timing: mallet strikes drive the carving (the relief advances in steps, one per strike),
// wood chips fly from the chisel on every strike (closed-form ballistics, then rest), a spinning top
// (gasing) drops and precesses, a wooden car rolls in, and six letter blocks drop and settle.
// Everything is a pure function of film time t (seconds): safe for parallel renders.

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);

// --- Carving -----------------------------------------------------------------------------------
export const CARVE = { start: 0.3, end: 4.4, every: 0.3 };
export const HITS: number[] = (() => {
  const out: number[] = [];
  for (let h = CARVE.start; h <= CARVE.end + 1e-6; h += CARVE.every) out.push(+h.toFixed(3));
  return out;
})();

/** 0..1: carve progress. Each strike pushes the front forward quickly, then it holds. */
export function carveReveal(t: number): number {
  let done = 0;
  for (const h of HITS) done += easeOut(seg(t, h, h + 0.09));
  return Math.min(1, done / HITS.length);
}

/** Mallet: 0 = resting on the chisel, 1 = raised. Raises between strikes, snaps down on each hit. */
export function malletLift(t: number): number {
  if (t < CARVE.start - 0.25 || t > CARVE.end + 0.35) return t > CARVE.end ? smooth(seg(t, CARVE.end + 0.05, CARVE.end + 0.5)) * 1.4 : 0.9;
  const prev = HITS.filter((h) => h <= t).pop() ?? CARVE.start - CARVE.every;
  const k = (t - prev) / CARVE.every; // 0 at the strike
  if (k < 0.12) return 0; // contact
  if (k < 0.75) return smooth((k - 0.12) / 0.63);
  return 1 - Math.pow((k - 0.75) / 0.25, 2) * 1.0; // the downswing accelerates
}
/** Impact flash 0..1 right after each strike (camera micro-shake, dust puff). */
export function impact(t: number): number {
  let v = 0;
  for (const h of HITS) if (t >= h) v = Math.max(v, Math.exp(-(t - h) * 22));
  return v;
}

/** Chisel tip on the panel in uv (u = carve front, v sweeps up and down along the front). */
export function chiselUv(t: number): [number, number] {
  const u = 0.05 + carveReveal(t) * 0.9;
  const v = 0.5 + 0.36 * Math.sin(t * 2.4 + 0.6) * (0.75 + 0.25 * Math.sin(t * 0.7));
  return [u, v];
}

// --- Chips -------------------------------------------------------------------------------------
export type Chip = { t0: number; p0: [number, number, number]; v: [number, number, number]; spin: [number, number, number]; s: number; restY: number };
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/** Chips for every strike; `tipAt(t)` gives the chisel tip in world space at that strike. */
export function makeChips(tipAt: (t: number) => [number, number, number], restY: (x: number, z: number) => number, perHit = 7): Chip[] {
  const r = rng(91);
  const chips: Chip[] = [];
  for (const h of HITS) {
    const p0 = tipAt(h);
    for (let i = 0; i < perHit; i++) {
      const a = r() * Math.PI * 2;
      const sp = 0.35 + r() * 0.75;
      const v: [number, number, number] = [Math.cos(a) * sp * 0.8 + 0.25, 0.9 + r() * 1.3, Math.sin(a) * sp * 0.8];
      const spin: [number, number, number] = [(r() - 0.5) * 30, (r() - 0.5) * 30, (r() - 0.5) * 30];
      chips.push({ t0: h + r() * 0.03, p0, v, spin, s: 0.6 + r() * 0.8, restY: 0 });
    }
  }
  // Rest height where each chip lands.
  for (const c of chips) {
    const tl = landTime(c, 0);
    c.restY = restY(c.p0[0] + c.v[0] * tl, c.p0[2] + c.v[2] * tl);
  }
  return chips;
}
const G = 6.5;
const landTime = (c: Chip, y: number) => {
  // p0.y + v.y τ − ½Gτ² = y  →  positive root.
  const a = 0.5 * G, b = -c.v[1], cc = y - c.p0[1];
  return (-b + Math.sqrt(Math.max(0, b * b - 4 * a * cc))) / (2 * a);
};

/** Chip position and rotation at time t (null before it is cut). */
export function chipAt(c: Chip, t: number): { p: [number, number, number]; r: [number, number, number] } | null {
  if (t < c.t0) return null;
  const tl = landTime(c, c.restY + 0.004);
  const tau = Math.min(t - c.t0, tl);
  const p: [number, number, number] = [c.p0[0] + c.v[0] * tau, c.p0[1] + c.v[1] * tau - 0.5 * G * tau * tau, c.p0[2] + c.v[2] * tau];
  const landed = t - c.t0 >= tl;
  const r: [number, number, number] = landed ? [Math.PI / 2, c.spin[1] * tl, 0] : [c.spin[0] * tau, c.spin[1] * tau, c.spin[2] * tau];
  return { p, r };
}

// --- Toys --------------------------------------------------------------------------------------
export const TOP = { drop: 4.75, land: 5.05, home: [0.95, 0, 0.55] as [number, number, number] };

/** Spinning top: height above the bench, spin angle, tilt (precession) and a slow orbit. */
export function topState(t: number) {
  const fall = seg(t, TOP.drop, TOP.land);
  const y = t < TOP.land ? 0.55 * (1 - fall * fall) : Math.abs(Math.sin((t - TOP.land) * 18)) * 0.03 * Math.exp(-(t - TOP.land) * 7);
  const spin = t * 38;
  const tilt = 0.06 + 0.1 * smooth(seg(t, 8.5, 12));
  const prec = (t - TOP.land) * 3.2;
  const orbit = Math.max(0, t - TOP.land) * 0.55;
  const x = TOP.home[0] + Math.cos(orbit) * 0.08 - 0.08;
  const z = TOP.home[2] + Math.sin(orbit) * 0.08;
  return { pos: [x, y, z] as [number, number, number], spin, tilt, prec };
}

export const CAR = { start: 5.35, stop: 6.9, from: 2.1, to: 1.25, z: 0.05 };
export function carState(t: number) {
  const k = easeOut(seg(t, CAR.start, CAR.stop));
  const x = CAR.from + (CAR.to - CAR.from) * k;
  return { x, roll: (CAR.from - x) / 0.05 };
}

// --- Letter blocks -----------------------------------------------------------------------------
export const WORD = "AUDIRA";
export const BLOCK = { size: 0.2, gap: 0.035, first: 7.1, every: 0.33, z: 0.82, dropH: 0.9 };
export const blockX = (i: number) => (i - (WORD.length - 1) / 2) * (BLOCK.size + BLOCK.gap);
export const blockAt = (i: number) => BLOCK.first + i * BLOCK.every;

/** Drop with two decaying bounces, a tumble that lands face-forward, and a squash-free settle. */
export function blockState(i: number, t: number) {
  const t0 = blockAt(i);
  const fallT = Math.sqrt((2 * BLOCK.dropH) / 9.8);
  const tt = t - t0;
  let y: number;
  if (tt < 0) y = BLOCK.dropH + 2;
  else if (tt < fallT) y = BLOCK.dropH - 0.5 * 9.8 * tt * tt;
  else {
    const v0 = 9.8 * fallT * 0.32;
    const b1 = (2 * v0) / 9.8;
    const u = tt - fallT;
    if (u < b1) y = v0 * u - 0.5 * 9.8 * u * u;
    else {
      const v1 = v0 * 0.3, b2 = (2 * v1) / 9.8, w = u - b1;
      y = w < b2 ? v1 * w - 0.5 * 9.8 * w * w : 0;
    }
  }
  const tumble = (1 - smooth(seg(tt, 0, fallT + 0.18))) * (i % 2 ? 1.6 : -1.4);
  const wiggle = Math.sin(tt * 26) * 0.08 * Math.exp(-Math.max(0, tt - fallT) * 9) * (tt > fallT ? 1 : 0);
  return { y: Math.max(0, y) + BLOCK.size / 2, rx: tumble, rz: wiggle, visible: tt > -0.05 };
}

// --- Finish ------------------------------------------------------------------------------------
/** Oil rubbed in over the whole panel at the end (darker, satin). */
export const oilAt = (t: number) => smooth(seg(t, 9.4, 11.2));
