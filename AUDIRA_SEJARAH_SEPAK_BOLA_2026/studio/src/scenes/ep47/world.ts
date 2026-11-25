// EP47 world: Superga hill above the Turin plain, a near ridge (the memorial overlook) and the
// Alps far behind. Same recipe as kits/worldforge/example/world.ts (two graded grids, baked sun
// + AO, vertex albedo); pure TS, no three.js.

import { clamp01, fbm, lerp, ridged, smooth } from "../../kits/worldforge/noise.ts";
import { bakeAO, bakeSun, expAxis, gridNormals, inside, lookup, makeGrid, makeWorldHeight, type Grid } from "../../kits/worldforge/heightfield.ts";

type V3 = [number, number, number];
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** Camera (3/4 from the side, slightly above the summit) and its basis on the ground plane. */
export const CAM_POS: V3 = [-175, 175, 185];
export const CAM_TARGET: V3 = [0, 134.7, 0];
const fl = Math.hypot(CAM_TARGET[0] - CAM_POS[0], CAM_TARGET[2] - CAM_POS[2]);
export const FWD = { x: (CAM_TARGET[0] - CAM_POS[0]) / fl, z: (CAM_TARGET[2] - CAM_POS[2]) / fl };
export const RIGHT = { x: -FWD.z, z: FWD.x };
/** Group yaw that maps local +x to RIGHT and local -z to FWD (local +z faces the camera). */
export const FACE_YAW = Math.atan2(-FWD.x, -FWD.z);

/** Late-afternoon sun, low, from the front-left of the camera. */
export const SUN: V3 = norm([-0.8 * RIGHT.x - 0.3 * FWD.x, 0.36, -0.8 * RIGHT.z - 0.3 * FWD.z]);

export const SUMMIT = { x: 0, z: 0, h: 110, r: 26 };
/** Memorial spot on a small spur 45 units ahead, left of the line of sight (frame bottom-left). */
export const MEMORIAL = { x: CAM_POS[0] + FWD.x * 41 - RIGHT.x * 1, z: CAM_POS[2] + FWD.z * 41 - RIGHT.z * 1 };
const SPUR = { x: MEMORIAL.x, z: MEMORIAL.z, h: 158 };

export const height = (x: number, z: number) => {
  // Turin plain, gently rolling
  let h = 5 * fbm(x / 500, z / 500, 4) + 1.2 * fbm(x / 60, z / 60, 3);
  // the Alps ring on the horizon
  const R = Math.hypot(x, z);
  if (R > 1400) h += smooth(1700, 4200, R) * 620 * Math.pow(ridged(x / 1300 + 3, z / 1300, 6), 1.35);
  // Superga: a wooded dome with lumpy shoulders
  const ds = Math.hypot(x - SUMMIT.x, z - SUMMIT.z);
  const hill = SUMMIT.h * Math.exp(-((ds / 190) ** 2)) * (0.92 + 0.16 * fbm(x / 70, z / 70, 3));
  h = Math.max(h, hill);
  // flattened summit for the basilica
  h = lerp(h, SUMMIT.h + 0.15 * fbm(x / 12, z / 12, 2), 1 - smooth(SUMMIT.r, SUMMIT.r * 1.8, ds));
  // the spur (overlook) carrying the memorial, bottom-left of frame
  const dr = Math.hypot(x - SPUR.x, z - SPUR.z);
  const spur = SPUR.h * (1 - smooth(12, 62, dr)) + 0.3 * fbm(x / 9, z / 9, 3);
  return Math.max(h, spur);
};

const lin = (hex: number) =>
  [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
const GRASS = lin(0x6f7a3e), MEADOW = lin(0x8d8c4c), WOOD = lin(0x4a5a2c), ROCK = lin(0x8a8276), PAVE = lin(0xc2b49a), SNOW = lin(0xe4e2dc), FIELD = lin(0x9a9256);

const albedo = (x: number, z: number, h: number, ny: number, out: number[]) => {
  const v = 0.5 + 0.5 * fbm(x / 120, z / 120, 3);
  for (let c = 0; c < 3; c++) out[c] = lerp(GRASS[c], MEADOW[c], v);
  const mix = (col: number[], t: number) => {
    for (let c = 0; c < 3; c++) out[c] += (col[c] - out[c]) * clamp01(t);
  };
  const ds = Math.hypot(x - SUMMIT.x, z - SUMMIT.z);
  // wooded flanks of Superga
  mix(WOOD, smooth(25, 55, h) * (1 - smooth(140, 175, h)) * smooth(SUMMIT.r * 1.4, SUMMIT.r * 2.4, ds) * 0.85);
  // patchwork fields on the plain
  mix(FIELD, (1 - smooth(10, 25, h)) * (0.5 + 0.5 * Math.sign(Math.sin(x / 37) * Math.sin(z / 29))) * 0.45);
  mix(ROCK, smooth(0.2, 0.5, 1 - ny));
  mix(PAVE, (1 - smooth(SUMMIT.r * 0.7, SUMMIT.r * 1.2, ds)) * 0.85);
  mix(SNOW, smooth(300, 460, h) * 0.9);
  return out;
};

export type Part = { grid: Grid; normals: Float32Array; color: Float32Array; shade: Float32Array };
let cache: { near: Part; far: Part; heightAt: (x: number, z: number) => number } | null = null;

export const getTerrain = () => {
  if (cache) return cache;
  const near = makeGrid(expAxis(-600, 600, 1.0, 0.006), expAxis(-600, 600, 1.0, 0.006), height);
  const fa = expAxis(-9000, 9000, 14, 0.009);
  const far = makeGrid(fa, fa, height);
  const world = makeWorldHeight(near, far);
  let maxH = -1e9;
  for (const v of far.h) maxH = Math.max(maxH, v);
  const opts = { sun: SUN, maxH: maxH + 2, maxDist: 3500, soft: 0.03 };
  const part = (g: Grid, aoR: number): Part => {
    const sun = bakeSun(g, world, opts), ao = bakeAO(g, world, aoR, 0.8), normals = gridNormals(g);
    const n = g.ax.n * g.az.n;
    const color = new Float32Array(n * 3), shade = new Float32Array(n * 2), c = [0, 0, 0];
    for (let j = 0; j < g.az.n; j++)
      for (let i = 0; i < g.ax.n; i++) {
        const k = j * g.ax.n + i;
        albedo(g.ax.coord[i], g.az.coord[j], g.h[k], normals[k * 3 + 1], c);
        color.set(c, k * 3);
        shade[k * 2] = sun[k];
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
