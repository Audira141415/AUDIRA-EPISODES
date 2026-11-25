// EP58 Mongolia — steppe terrain: rolling grassland, a herd valley, a sunset ridge and a
// distant mountain ring. Same recipe as the WORLDFORGE starter (graded grids, baked sun + AO,
// vertex albedo). Pure TS.

import { clamp01, fbm, lerp, ridged, smooth } from "../../kits/worldforge/noise.ts";
import { bakeAO, bakeSun, expAxis, gridNormals, inside, lookup, makeGrid, makeWorldHeight, type Grid } from "../../kits/worldforge/heightfield.ts";

export type V3 = [number, number, number];
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** Bake sun: afternoon, from the south-west, 32° high. */
export const BAKE_SUN: V3 = norm([-0.55, 0.62, 0.55]);

/** Set locations (metres). */
export const LOC = {
  hook: { x: 0, z: 0 },
  valley: { x: -200, z: 150 },
  camp: { x: 150, z: -60 },
  lone: { x: 300, z: 250 },
  graze: { x: -80, z: -220 },
  war: { x: -300, z: -40 },
  race: { x: 0, z: 330 },
  finishX: 170,
  portrait: { x: 330, z: -250 },
  ridge: { z: -430 },
} as const;

export const height = (x: number, z: number) => {
  let h = 7 * fbm(x / 520, z / 520, 5) + 1.6 * fbm(x / 95, z / 95, 4) + 0.18 * fbm(x / 12, z / 12, 2);
  // the herd valley: a broad shallow trough running along x
  const vz = LOC.valley.z + 25 * Math.sin(x / 180);
  const dv = (z - vz) / 70;
  h -= 6 * Math.exp(-dv * dv) * (1 - smooth(200, 420, Math.abs(x - LOC.valley.x)));
  // the sunset ridge
  const dr = (z - LOC.ridge.z) / 38;
  h += 24 * Math.exp(-dr * dr) * (0.85 + 0.15 * fbm(x / 60, 3, 2));
  // flatten the camp, the race track and the hook meadow a little
  const flat = (cx: number, cz: number, r: number) => 1 - smooth(r * 0.5, r, Math.hypot(x - cx, z - cz));
  h = lerp(h, h * 0.35, flat(LOC.camp.x, LOC.camp.z, 70));
  h = lerp(h, h * 0.35, flat(LOC.hook.x, LOC.hook.z, 60));
  const tr = Math.abs(z - LOC.race.z);
  h = lerp(h, h * 0.25 + 0.8, (1 - smooth(18, 45, tr)) * (1 - smooth(260, 330, Math.abs(x))));
  // mountain ring on the horizon
  const R = Math.hypot(x, z);
  if (R > 1400) h += smooth(1700, 4200, R) * 620 * Math.pow(ridged(x / 1500 + 3, z / 1500, 6), 1.4);
  return h;
};

const lin = (hex: number) =>
  [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
const GREEN = lin(0x6f8a3c), GOLD = lin(0xa99a52), DEEP = lin(0x52692c), ROCK = lin(0x8a8276), TRACK = lin(0x9c8566), SNOWCAP = lin(0xdcdcd8);

const albedo = (x: number, z: number, h: number, ny: number, out: number[]) => {
  const v = 0.5 + 0.5 * fbm(x / 160, z / 160, 3);
  const w = 0.5 + 0.5 * fbm(x / 35 + 9, z / 35, 2);
  for (let c = 0; c < 3; c++) out[c] = lerp(lerp(GREEN[c], GOLD[c], v * 0.8), DEEP[c], w * 0.35);
  const mix = (col: number[], t: number) => {
    for (let c = 0; c < 3; c++) out[c] += (col[c] - out[c]) * clamp01(t);
  };
  // the race track: a worn dirt band
  mix(TRACK, (1 - smooth(3, 7, Math.abs(z - LOC.race.z))) * (1 - smooth(250, 300, Math.abs(x))) * 0.75);
  mix(ROCK, smooth(0.2, 0.5, 1 - ny));
  mix(SNOWCAP, smooth(300, 480, h) * 0.9);
  return out;
};

export type Part = { grid: Grid; normals: Float32Array; color: Float32Array; shade: Float32Array };
let cache: { near: Part; far: Part; heightAt: (x: number, z: number) => number } | null = null;

export const getSteppe = () => {
  if (cache) return cache;
  const near = makeGrid(expAxis(-520, 520, 1.1, 0.0055), expAxis(-520, 520, 1.1, 0.0055), height);
  const fa = expAxis(-9000, 9000, 14, 0.009);
  const far = makeGrid(fa, fa, height);
  const world = makeWorldHeight(near, far);
  let maxH = -1e9;
  for (const v of far.h) maxH = Math.max(maxH, v);
  const opts = { sun: BAKE_SUN, maxH: maxH + 2, maxDist: 3500, soft: 0.03 };
  const part = (g: Grid, aoR: number): Part => {
    const sun = bakeSun(g, world, opts), ao = bakeAO(g, world, aoR, 0.8), normals = gridNormals(g);
    const n = g.ax.n * g.az.n;
    const color = new Float32Array(n * 3), shade = new Float32Array(n * 2), c = [0, 0, 0];
    for (let j = 0; j < g.az.n; j++)
      for (let i = 0; i < g.ax.n; i++) {
        const k = j * g.ax.n + i;
        albedo(g.ax.coord[i], g.az.coord[j], g.h[k], normals[k * 3 + 1], c);
        color.set(c, k * 3);
        // the steppe is open: keep the baked sun soft so a sun from another side still reads
        shade[k * 2] = 0.55 + 0.45 * sun[k];
        shade[k * 2 + 1] = ao[k];
      }
    return { grid: g, normals, color, shade };
  };
  const nearP = part(near, 40), farP = part(far, 500);
  for (let j = 0; j < far.az.n; j++)
    for (let i = 0; i < far.ax.n; i++) if (inside(near, far.ax.coord[i], far.az.coord[j], 0.5)) far.h[j * far.ax.n + i] -= 3;
  cache = { near: nearP, far: farP, heightAt: (x, z) => (inside(near, x, z) ? lookup(near, x, z) : lookup(far, x, z) + 3) };
  return cache;
};

export const gy = (x: number, z: number) => getSteppe().heightAt(x, z);
