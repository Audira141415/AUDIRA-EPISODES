// Closed-form motion for thousands of sand grains (pure functions of t, seeded):
//   pour    - while the sculpture forms, grains lift off the heap and arc inward onto the rising lid,
//             then merge into it;
//   trickle - while it erodes, clumps break off the crumbling walls (avalanches) and single grains
//             trickle down, fall, land on a ledge or the apron, and slide a little downhill;
//   veil    - wind strips a fine veil of dust off the crumbling tops and carries it away.

import { PARTS, ledgeAt, type Part } from "../lib/sculpture.ts";
import { beachSlope, heapHeight, pileHeight, rippleHeight, rng, type V3 } from "../lib/noise.ts";
import { FORM, ERODE, ceilingAt, heapAt, pileAt, easeOut, seg } from "./motion.ts";

const G = 9.8;
const surfaceAt = (x: number, z: number, t: number) => heapHeight(x, z, heapAt(t)) + pileHeight(x, z, pileAt(t)) + rippleHeight(x, z) + beachSlope(z);

/** Parts whose height band contains y (being formed or crumbled at that height). */
function partsAt(y: number, band: number): Part[] {
  return PARTS.filter((p) => {
    const bottom = p.c[1] - p.h[1];
    const top = p.c[1] + p.h[1];
    return bottom < y && top > y - band;
  });
}
function pick<T>(list: T[], w: (x: T) => number, r: number): T {
  const total = list.reduce((s, x) => s + w(x), 0);
  let acc = r * total;
  for (const x of list) {
    acc -= w(x);
    if (acc <= 0) return x;
  }
  return list[list.length - 1];
}

// --- Pour ---------------------------------------------------------------------------------------
export type PourGrain = { t0: number; t1: number; from: V3; via: V3; to: V3; s: number; c: number };

export function makePour(n = 7000): PourGrain[] {
  const r = rng(1701);
  const out: PourGrain[] = [];
  for (let i = 0; i < n; i++) {
    // Front-loaded: the hook is dense with grains lifting off the heap.
    const t1 = FORM.start + 0.12 + (FORM.end - FORM.start - 0.05) * Math.pow((i + r()) / n, 1.35);
    const cy = ceilingAt(t1).y;
    const cands = partsAt(Math.max(cy, 0.02), 0.03);
    const part = cands.length ? pick(cands, (p) => p.h[0] * p.h[2], r()) : PARTS[0];
    const u = (r() - 0.5) * 2, v = (r() - 0.5) * 2;
    const k = part.kind === "ell" ? 0.7 : 0.96;
    const to: V3 = [part.c[0] + u * part.h[0] * k, Math.min(Math.max(cy, 0.01), part.c[1] + part.h[1]), part.c[2] + v * part.h[2] * k];
    const dur = 0.7 + r() * 0.45;
    const t0 = t1 - dur;
    // Lift off the heap, out where it is low, on the side the grain is heading to.
    const a = Math.atan2(to[2], to[0]) + (r() - 0.5) * 1.6;
    const rad = 0.75 + r() * 0.22;
    const fx = Math.cos(a) * 2.3 * rad, fz = Math.sin(a) * 1.9 * rad;
    const from: V3 = [fx, surfaceAt(fx, fz, Math.max(0, t0)) + 0.01, fz];
    // Arc control point: above the midpoint, swirled sideways.
    const sw = (r() - 0.5) * 0.9;
    const via: V3 = [(from[0] + to[0]) / 2 - Math.sin(a) * sw, Math.max(from[1], to[1]) + 0.45 + r() * 0.75, (from[2] + to[2]) / 2 + Math.cos(a) * sw];
    out.push({ t0, t1, from, via, to, s: 0.0035 + r() * 0.006, c: r() });
  }
  return out;
}

/** Position and scale of a pour grain (scale 0 = hidden). */
export function pourAt(g: PourGrain, t: number): { p: V3; s: number } {
  if (t < g.t0 || t > g.t1 + 0.45) return { p: g.to, s: 0 };
  if (t < g.t1) {
    const k = (t - g.t0) / (g.t1 - g.t0);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, c = e * e;
    const p: V3 = [
      a * g.from[0] + b * g.via[0] + c * g.to[0],
      a * g.from[1] + b * g.via[1] + c * g.to[1],
      a * g.from[2] + b * g.via[2] + c * g.to[2],
    ];
    return { p, s: g.s * Math.min(1, k * 8) };
  }
  // Landed on the lid: settle and merge into the surface as it rises past.
  const k = (t - g.t1) / 0.45;
  const lid = Math.min(ceilingAt(t).y, g.to[1] + 0.05);
  return { p: [g.to[0], Math.max(g.to[1], lid - 0.004), g.to[2]], s: g.s * (1 - k) };
}

// --- Trickle and avalanche -------------------------------------------------------------------------
export type FallGrain = {
  t0: number;
  o: V3;
  v: V3;
  s: number;
  c: number;
  /** Landing: time after t0, position, and whether it landed on a ledge (stays put). */
  tl: number;
  land: V3;
  ledge: boolean;
  slide: [number, number];
};

function originOn(part: Part, y: number, r: () => number): { o: V3; n: V3 } {
  const [cx, , cz] = part.c;
  const [hx, , hz] = part.h;
  if (part.kind === "ell") {
    const a = r() * Math.PI * 2;
    return { o: [cx + Math.cos(a) * hx * 0.85, y, cz + Math.sin(a) * hz * 0.85], n: [Math.cos(a), 0, Math.sin(a)] };
  }
  const face = Math.floor(r() * 4);
  const u = (r() - 0.5) * 1.8;
  if (face === 0) return { o: [cx + hx * 0.97, y, cz + u * hz], n: [1, 0, 0] };
  if (face === 1) return { o: [cx - hx * 0.97, y, cz + u * hz], n: [-1, 0, 0] };
  if (face === 2) return { o: [cx + u * hx, y, cz + hz * 0.97], n: [0, 0, 1] };
  return { o: [cx + u * hx, y, cz - hz * 0.97], n: [0, 0, -1] };
}

function solveFall(o: V3, v: V3, t0: number): { tl: number; land: V3; ledge: boolean } {
  // First guess: the beach; then check whether a ledge catches it on the way down.
  const fallTo = (y: number) => {
    const a = 0.5 * G, b = -v[1], c = y - o[1];
    return (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
  };
  let tl = fallTo(0);
  for (let i = 0; i < 3; i++) {
    const x = o[0] + v[0] * tl, z = o[2] + v[2] * tl;
    tl = fallTo(surfaceAt(x, z, t0 + tl));
  }
  let x = o[0] + v[0] * tl, z = o[2] + v[2] * tl;
  // A ledge under the fall path (tested at a few heights) catches the grain.
  for (const frac of [0.25, 0.5, 0.75, 1]) {
    const tt = tl * frac;
    const px = o[0] + v[0] * tt, pz = o[2] + v[2] * tt, py = o[1] + v[1] * tt - 0.5 * G * tt * tt;
    const lg = ledgeAt(px, pz, o[1] - 0.02);
    if (lg > 0 && py <= lg + 0.002) {
      const tlg = fallTo(lg);
      x = o[0] + v[0] * tlg;
      z = o[2] + v[2] * tlg;
      return { tl: tlg, land: [x, lg, z], ledge: true };
    }
  }
  return { tl, land: [x, surfaceAt(x, z, t0 + tl), z], ledge: false };
}

export function makeTrickle(events = 190, perEvent = 20, singles = 1100): FallGrain[] {
  const r = rng(2903);
  const out: FallGrain[] = [];
  const span = ERODE.end + 0.3 - (ERODE.start + 0.35);
  const spawn = (t0: number, clumpO: V3 | null, clumpN: V3 | null, big: boolean) => {
    const cy = ceilingAt(t0);
    let o: V3, n: V3;
    if (clumpO && clumpN) {
      o = [clumpO[0] + (r() - 0.5) * 0.08, clumpO[1] - r() * 0.07, clumpO[2] + (r() - 0.5) * 0.08];
      n = clumpN;
    } else {
      const y = cy.y - r() * 0.35;
      const cands = partsAt(y, 0.2);
      const part = cands.length ? pick(cands, (p) => p.h[0] + p.h[2], r()) : PARTS[4];
      const top = part.c[1] + part.h[1];
      const on = originOn(part, Math.min(top, y), r);
      o = on.o;
      n = on.n;
    }
    const sp = big ? 0.12 + r() * 0.35 : 0.05 + r() * 0.2;
    const v: V3 = [n[0] * sp + (r() - 0.5) * 0.12, big ? r() * 0.25 : -r() * 0.1, n[2] * sp + (r() - 0.5) * 0.12];
    const f = solveFall(o, v, t0);
    const dir = Math.hypot(v[0], v[2]) || 1;
    const slideLen = f.ledge ? 0.01 + r() * 0.03 : 0.04 + r() * 0.2;
    out.push({ t0, o, v, s: (big ? 0.006 : 0.0045) + r() * 0.008, c: r(), tl: f.tl, land: f.land, ledge: f.ledge, slide: [(v[0] / dir) * slideLen, (v[2] / dir) * slideLen] });
  };
  for (let e = 0; e < events; e++) {
    // Avalanches come faster as the form weakens.
    const t0 = ERODE.start + 0.35 + span * Math.pow((e + r()) / events, 0.8);
    const cy = ceilingAt(t0).y - r() * 0.25;
    const cands = partsAt(cy, 0.2);
    const part = cands.length ? pick(cands, (p) => p.h[0] + p.h[2], r()) : PARTS[4];
    const on = originOn(part, Math.min(part.c[1] + part.h[1], cy), r);
    for (let i = 0; i < perEvent; i++) spawn(t0 + r() * 0.12, on.o, on.n, true);
  }
  for (let i = 0; i < singles; i++) spawn(ERODE.start + 0.2 + span * ((i + r()) / singles), null, null, false);
  return out;
}

export function fallAt(g: FallGrain, t: number): { p: V3; s: number } {
  const tau = t - g.t0;
  if (tau < 0) return { p: g.o, s: 0 };
  const grow = Math.min(1, tau * 12);
  if (tau < g.tl) {
    return { p: [g.o[0] + g.v[0] * tau, g.o[1] + g.v[1] * tau - 0.5 * G * tau * tau, g.o[2] + g.v[2] * tau], s: g.s * grow };
  }
  // Slide down the slope a little, then rest on the (growing) apron or on the ledge.
  const k = easeOut(seg(tau, g.tl, g.tl + 0.55));
  const x = g.land[0] + g.slide[0] * k, z = g.land[2] + g.slide[1] * k;
  const y = g.ledge ? g.land[1] : surfaceAt(x, z, t);
  return { p: [x, y + g.s * 0.4, z], s: g.s };
}

// --- Wind veil ------------------------------------------------------------------------------------
export type VeilGrain = { t0: number; life: number; o: V3; sp: number; ph: number; s: number };
/** Wind blows toward +x and a little away from camera. */
export const WIND: V3 = [0.93, 0.0, -0.37];

export function makeVeil(n = 4200): VeilGrain[] {
  const r = rng(3307);
  const out: VeilGrain[] = [];
  const a = ERODE.start + 0.9, b = 12.2;
  for (let i = 0; i < n; i++) {
    const t0 = a + (b - a) * ((i + r()) / n) - 1.2;
    const cy = ceilingAt(Math.max(a, t0)).y;
    const cands = partsAt(cy, 0.3);
    const part = cands.length ? pick(cands, (p) => p.h[0] * p.h[2] + 0.02, r()) : PARTS[4];
    const top = part.c[1] + part.h[1];
    const o: V3 = [part.c[0] + (r() - 0.5) * 2 * part.h[0], Math.min(top, cy) - r() * 0.04, part.c[2] + (r() - 0.5) * 2 * part.h[2]];
    out.push({ t0, life: 1.3 + r() * 1.3, o, sp: 0.55 + r() * 1.0, ph: r() * 6.28, s: 0.0018 + r() * 0.0028 });
  }
  return out;
}

export function veilAt(g: VeilGrain, t: number): { p: V3; s: number } {
  const tau = t - g.t0;
  if (tau < 0 || tau > g.life) return { p: g.o, s: 0 };
  const d = g.sp * tau;
  const p: V3 = [
    g.o[0] + WIND[0] * d + Math.sin(tau * 3.1 + g.ph) * 0.05,
    g.o[1] + 0.16 * tau + Math.sin(tau * 2.3 + g.ph * 1.7) * 0.06,
    g.o[2] + WIND[2] * d + Math.cos(tau * 2.7 + g.ph) * 0.05,
  ];
  return { p, s: g.s * Math.sin((Math.PI * tau) / g.life) };
}
