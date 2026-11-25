// Lathe profiles. The thrown piece is one closed profile (outer wall up, rounded rim, inner wall
// down, floor to the axis) whose shape blends lump -> opened cylinder -> vase with `k`, so the
// geometry really grows on the wheel. Throwing rings are real ridges in the profile.
//
//   const { points, outerEnd, height } = thrownProfile(k, open);   // feed points to LatheGeometry
//   const r = outerRadius(k, h);                                   // radius at height h (0..1)

import * as THREE from "three";

/** Finished vase height and the radius keys (h, r) of each shape, in world units. */
export const VASE_H = 0.46;
type Key = [number, number];
const LUMP: Key[] = [[0, 0.165], [0.25, 0.17], [0.55, 0.15], [0.8, 0.11], [0.95, 0.05], [1, 0.0]];
const CYL: Key[] = [[0, 0.135], [0.1, 0.128], [0.4, 0.122], [0.8, 0.118], [1, 0.12]];
// Original vase: a full shoulder, a narrow neck and a flared lip (a Plered-style jambangan line).
const VASE: Key[] = [[0, 0.085], [0.06, 0.105], [0.22, 0.158], [0.38, 0.172], [0.55, 0.14], [0.7, 0.085], [0.82, 0.062], [0.92, 0.07], [1, 0.096]];
const H = { lump: 0.15, cyl: 0.25, vase: VASE_H };

const sampleKeys = (keys: Key[], h: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (h <= keys[i][0]) {
      const [h0, r0] = keys[i - 1], [h1, r1] = keys[i];
      const f = (h - h0) / (h1 - h0);
      // Cubic Hermite with zero end slopes reads as a thrown curve, not a polyline.
      const s = f * f * (3 - 2 * f);
      return r0 + (r1 - r0) * s;
    }
  }
  return keys[keys.length - 1][1];
};
// Catmull-like smoothing: average with neighbours so the Hermite plateaus do not show.
const smoothR = (keys: Key[], h: number) => (sampleKeys(keys, h) * 2 + sampleKeys(keys, Math.max(0, h - 0.04)) + sampleKeys(keys, Math.min(1, h + 0.04))) / 4;

/** Outer radius at normalised height h for shape progress k. */
export function outerRadius(k: number, h: number): number {
  if (k <= 0.5) {
    const f = k / 0.5;
    return smoothR(LUMP, h) * (1 - f) + smoothR(CYL, h) * f;
  }
  const f = (k - 0.5) / 0.5;
  return smoothR(CYL, h) * (1 - f) + smoothR(VASE, h) * f;
}
export function pieceHeight(k: number): number {
  if (k <= 0.5) return H.lump + (H.cyl - H.lump) * (k / 0.5);
  return H.cyl + (H.vase - H.cyl) * ((k - 0.5) / 0.5);
}

export const OUTER_N = 150;
const RIM_N = 10;
const INNER_N = 70;
const FLOOR_N = 10;

/**
 * The closed profile. `open` 0 = solid lump (inner wall collapsed onto the top), 1 = hollow.
 * `rings` scales the throwing ridges (wet clay shows them strongest).
 */
export function thrownProfile(k: number, open: number, rings = 1) {
  const Hh = pieceHeight(k);
  const wall = 0.011 + (1 - k) * 0.03;
  const floorY = 0.03;
  const pts: THREE.Vector2[] = [];
  const ringAmp = 0.0016 * rings * Math.min(1, k * 3);
  // Outer wall, bottom to top. Rings: ~11 ridges per 10 cm, slightly irregular.
  for (let i = 0; i < OUTER_N; i++) {
    const h = i / (OUTER_N - 1);
    const y = h * Hh;
    const ridge = Math.sin(y * 2 * Math.PI * 24 + Math.sin(y * 31) * 0.8) * ringAmp * Math.min(1, h * 6) * Math.min(1, (1 - h) * 8);
    // A small undercut at the foot so the piece sits on the wheel like a real thrown pot.
    const foot = h < 0.03 ? -0.012 * (1 - h / 0.03) * Math.min(1, k * 2) : 0;
    pts.push(new THREE.Vector2(Math.max(0.001, outerRadius(k, h) + ridge + foot), y));
  }
  const rTop = outerRadius(k, 1);
  const rInTop = Math.max(0.001, (rTop - wall) * open);
  // Rounded rim: a half circle from the outer to the inner lip (collapsed onto the axis when solid).
  for (let i = 1; i <= RIM_N; i++) {
    const a = (i / (RIM_N + 1)) * Math.PI;
    const cx = (rTop + rInTop) / 2, rr = (rTop - rInTop) / 2;
    pts.push(new THREE.Vector2(Math.max(0.001, cx + Math.cos(a) * rr), Hh + Math.sin(a) * Math.min(rr, wall * 0.6) * open));
  }
  // Inner wall, top to the floor (follows the outer wall at a constant thickness).
  const yIn0 = Hh, yIn1 = Hh + (floorY - Hh) * open;
  for (let i = 0; i < INNER_N; i++) {
    const f = i / (INNER_N - 1);
    const y = yIn0 + (yIn1 - yIn0) * f;
    const h = Math.min(1, Math.max(0, y / Hh));
    const r = Math.max(0.001, (outerRadius(k, h) - wall) * open);
    pts.push(new THREE.Vector2(r * (1 - Math.pow(f, 8) * 0.15), y));
  }
  // Floor to the axis.
  const rf = pts[pts.length - 1].x;
  for (let i = 1; i <= FLOOR_N; i++) pts.push(new THREE.Vector2(rf * (1 - i / FLOOR_N) + 0.0005, yIn1 - 0.002 * Math.sin((i / FLOOR_N) * Math.PI)));
  return { points: pts, outerEnd: (OUTER_N - 1) / (pts.length - 1), height: Hh };
}

/** Simple closed vessel from radius keys (h 0..1, r) for the rack pieces: outer wall, lip, inside. */
export function vesselPoints(keys: Key[], height: number, wall = 0.008, n = 64): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.0005, 0)];
  for (let i = 0; i < n; i++) {
    const h = i / (n - 1);
    pts.push(new THREE.Vector2(Math.max(0.001, smoothR(keys, h)), h * height));
  }
  const rTop = smoothR(keys, 1);
  pts.push(new THREE.Vector2(Math.max(0.001, rTop - wall * 0.5), height + wall * 0.4));
  for (let i = 0; i < 12; i++) {
    const h = 1 - (i / 11) * 0.35;
    pts.push(new THREE.Vector2(Math.max(0.001, smoothR(keys, h) - wall), h * height));
  }
  return pts;
}

/** Original rack shapes (h, r) with heights, in world units. */
export const SHAPES = {
  kendi: { keys: [[0, 0.05], [0.15, 0.075], [0.4, 0.09], [0.62, 0.07], [0.76, 0.03], [0.9, 0.022], [1, 0.03]] as Key[], h: 0.2 },
  gentong: { keys: [[0, 0.07], [0.2, 0.1], [0.5, 0.115], [0.8, 0.1], [0.92, 0.082], [1, 0.09]] as Key[], h: 0.19 },
  pot: { keys: [[0, 0.05], [0.3, 0.07], [0.75, 0.085], [0.92, 0.088], [1, 0.096]] as Key[], h: 0.12 },
  bowl: { keys: [[0, 0.035], [0.15, 0.06], [0.5, 0.09], [0.85, 0.11], [1, 0.115]] as Key[], h: 0.065 },
  vaseTall: { keys: [[0, 0.04], [0.25, 0.07], [0.45, 0.075], [0.7, 0.045], [0.88, 0.035], [1, 0.05]] as Key[], h: 0.3 },
  celengan: { keys: [[0, 0.04], [0.2, 0.075], [0.5, 0.085], [0.8, 0.06], [0.95, 0.025], [1, 0.0]] as Key[], h: 0.15 },
};
