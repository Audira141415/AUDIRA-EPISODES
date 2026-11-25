// EP74 Darvaza — Karakum desert world with the gas crater at the origin (1 unit = 1 m).
// One analytic height function on two graded grids (WORLDFORGE kit), sun visibility + AO baked once.
import { clamp01, fbm, lerp, ridged, smooth } from "../kits/worldforge/noise.ts";
import { bakeAO, bakeSun, expAxis, gridNormals, inside, lookup, makeGrid, makeWorldHeight, type Grid } from "../kits/worldforge/heightfield.ts";

type V3 = [number, number, number];
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** Crater: ~70 m across, ~30 m deep. */
export const R = 35;
export const DEPTH = 30;
export const FLOOR_R = 20;
/** Low sun behind-left of the usual camera (raking light, long dune shadows). */
export const SUN: V3 = norm([-0.62, 0.34, -0.7]);

const desert = (x: number, z: number) => {
  let h = 4 * fbm(x / 260 + 3, z / 260, 4) + 1.8 * ridged(x / 70, z / 36 + 1, 3) + 0.22 * fbm(x / 9, z / 9, 2);
  const r = Math.hypot(x, z);
  if (r > 900) h += smooth(900, 3500, r) * 90 * ridged(x / 1500, z / 1500 + 4, 4);
  return h;
};

/** Crater bowl blend for radius r: 0 at the floor, 1 at the rim. */
export const bowl = (r: number) => Math.pow(clamp01((r - FLOOR_R) / (R * 1.03 - FLOOR_R)), 2.2);

export const height = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  let h = desert(x, z);
  // the flat clay plain around the crater
  h = lerp(h, 0.15 * fbm(x / 12, z / 12, 2), 1 - smooth(R * 1.3, R * 3.2, r));
  if (r < R * 1.03) {
    const b = bowl(r);
    h = lerp(-DEPTH + 0.9 * fbm(x / 6, z / 6, 3), h, b);
    // rugged rock wall: ledges and boulders between floor and rim
    const wallMask = smooth(0.02, 0.12, b) * (1 - smooth(0.85, 1.0, b));
    h += wallMask * (1.6 * ridged(x / 5 + 7, z / 5, 3) + 0.9 * fbm(x / 2.2, z / 2.2, 2) - 1.2);
  }
  return h;
};

const lin = (hex: number) =>
  [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
const SAND = lin(0xcdae7e), SAND2 = lin(0xb48e5c), ROCK = lin(0x8c7a66), DARK = lin(0x4a3b31), CHAR = lin(0x2b211c), RIM = lin(0x9e8c76);

const albedo = (x: number, z: number, h: number, ny: number, out: number[]) => {
  const v = 0.5 + 0.5 * fbm(x / 120, z / 120, 3);
  for (let c = 0; c < 3; c++) out[c] = lerp(SAND[c], SAND2[c], v);
  const mix = (col: number[], t: number) => {
    for (let c = 0; c < 3; c++) out[c] += (col[c] - out[c]) * clamp01(t);
  };
  const r = Math.hypot(x, z);
  mix(RIM, (1 - smooth(R * 1.02, R * 1.35, r)) * 0.55);
  if (r < R * 1.05 && h < -0.8) {
    // layered strata in the crater wall
    const band = 0.5 + 0.5 * Math.sin(h * 1.25 + 2.2 * fbm(x / 14, z / 14, 2));
    const wall = [0, 1, 2].map((c) => lerp(ROCK[c], DARK[c], band * 0.8));
    mix(wall, smooth(-0.8, -4, h));
    // blotchy rock and vertical soot streaks
    const blot = fbm(x / 2.6 + 11, z / 2.6, 3);
    mix(DARK, smooth(0.05, 0.45, blot) * 0.55 * smooth(-0.8, -4, h));
    const soot = fbm(Math.atan2(z, x) * 14, h / 9, 2);
    mix(CHAR, smooth(0.1, 0.5, soot) * 0.5 * smooth(-0.8, -6, h));
    mix(CHAR, smooth(-DEPTH + 6, -DEPTH + 1.5, h));
  }
  mix(ROCK, smooth(0.25, 0.55, 1 - ny) * 0.6);
  return out;
};

export type Part = { grid: Grid; normals: Float32Array; color: Float32Array; shade: Float32Array };
let cache: { near: Part; far: Part; heightAt: (x: number, z: number) => number } | null = null;

export const getDesert = () => {
  if (cache) return cache;
  const near = makeGrid(expAxis(-420, 420, 0.7, 0.01), expAxis(-420, 420, 0.7, 0.01), height);
  const fa = expAxis(-9000, 9000, 12, 0.012);
  const far = makeGrid(fa, fa, height);
  const world = makeWorldHeight(near, far);
  let maxH = -1e9;
  for (const v of far.h) maxH = Math.max(maxH, v);
  const opts = { sun: SUN, maxH: maxH + 2, maxDist: 2500, soft: 0.03 };
  const part = (g: Grid, aoR: number): Part => {
    const sun = bakeSun(g, world, opts), ao = bakeAO(g, world, aoR, 0.7), normals = gridNormals(g);
    const n = g.ax.n * g.az.n;
    const color = new Float32Array(n * 3), shade = new Float32Array(n * 2), c = [0, 0, 0];
    for (let j = 0; j < g.az.n; j++)
      for (let i = 0; i < g.ax.n; i++) {
        const k = j * g.ax.n + i;
        const x = g.ax.coord[i], z = g.az.coord[j];
        albedo(x, z, g.h[k], normals[k * 3 + 1], c);
        color.set(c, k * 3);
        // inside the crater the fire lights everything: never cut the direct light there
        shade[k * 2] = Math.hypot(x, z) < R * 1.08 ? 1 : sun[k];
        shade[k * 2 + 1] = Math.max(ao[k], Math.hypot(x, z) < R * 1.05 ? 0.55 : 0);
      }
    return { grid: g, normals, color, shade };
  };
  const nearP = part(near, 30), farP = part(far, 400);
  for (let j = 0; j < far.az.n; j++)
    for (let i = 0; i < far.ax.n; i++) if (inside(near, far.ax.coord[i], far.az.coord[j], 0.5)) far.h[j * far.ax.n + i] -= 3;
  cache = { near: nearP, far: farP, heightAt: (x, z) => (inside(near, x, z) ? lookup(near, x, z) : lookup(far, x, z) + 3) };
  return cache;
};

// ---------- map world (scene B): 1 unit ≈ 2.6 km, north = −z ----------
export const ASHGABAT: V3 = [0, 0, 38];
export const DARVAZA: V3 = [-4, 0, -55];
export const mapHeight = (x: number, z: number) => {
  let h = 0.9 * fbm(x / 30, z / 30, 4) + 0.5 * ridged(x / 9, z / 5 + 2, 3);
  // Kopet Dag range south of Ashgabat
  h += smooth(44, 58, z) * 9 * Math.pow(ridged(x / 14 + 5, z / 10, 4), 1.3);
  return h;
};
let mapCache: Part | null = null;
export const getMap = () => {
  if (mapCache) return mapCache;
  const g = makeGrid(expAxis(-70, 70, 0.4, 0.004), expAxis(-110, 90, 0.4, 0.004), mapHeight);
  const ao = bakeAO(g, mapHeight, 8, 0.8), normals = gridNormals(g);
  const n = g.ax.n * g.az.n;
  const color = new Float32Array(n * 3), shade = new Float32Array(n * 2);
  const MOUNT = lin(0x8a7258), OASIS = lin(0x7f8a52);
  for (let j = 0; j < g.az.n; j++)
    for (let i = 0; i < g.ax.n; i++) {
      const k = j * g.ax.n + i;
      const x = g.ax.coord[i], z = g.az.coord[j];
      const v = 0.5 + 0.5 * fbm(x / 20, z / 20, 3);
      const c = [0, 1, 2].map((q) => lerp(SAND[q], SAND2[q], v));
      const m = smooth(1.5, 5, g.h[k]);
      const o = Math.exp(-(((z - 41) / 4) ** 2)) * 0.7;
      for (let q = 0; q < 3; q++) c[q] = lerp(lerp(c[q], OASIS[q], o), MOUNT[q], m);
      color.set(c, k * 3);
      shade[k * 2] = 1;
      shade[k * 2 + 1] = ao[k];
    }
  mapCache = { grid: g, normals, color, shade };
  return mapCache;
};
