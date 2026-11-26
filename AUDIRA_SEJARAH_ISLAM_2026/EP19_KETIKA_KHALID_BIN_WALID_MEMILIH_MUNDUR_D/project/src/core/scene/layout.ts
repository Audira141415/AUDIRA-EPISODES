// Pure layout functions — position N objects so they never stack at the origin.
// Every function returns [x, y, z] tuples; pass them as `position={...}` on a mesh or group.

import { Z_GAP } from "./constants.ts";

export type Vec3 = [number, number, number];

/** Spread N items along one axis with equal spacing.
 *  `axis`: 'x' | 'y' | 'z'. `span`: total distance from first to last. `center`: midpoint. */
export function spreadLine(
  count: number,
  axis: "x" | "y" | "z" = "x",
  span = 24,
  center: Vec3 = [0, 0, 0],
): Vec3[] {
  if (count <= 0) return [];
  if (count === 1) return [[...center]];
  const step = span / (count - 1);
  const half = span / 2;
  const ai = axis === "x" ? 0 : axis === "y" ? 1 : 2;
  return Array.from({ length: count }, (_, i) => {
    const p: Vec3 = [...center];
    p[ai] = center[ai] - half + i * step;
    return p;
  });
}

/** Arrange N items in a grid on the XY plane. `cols` defaults to ceil(sqrt(N)). */
export function grid(
  count: number,
  cols?: number,
  gapX = 8,
  gapY = 8,
  center: Vec3 = [0, 0, 0],
): Vec3[] {
  if (count <= 0) return [];
  const c = cols ?? Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / c);
  const totalW = (c - 1) * gapX;
  const totalH = (rows - 1) * gapY;
  return Array.from({ length: count }, (_, i) => {
    const col = i % c;
    const row = Math.floor(i / c);
    return [
      center[0] - totalW / 2 + col * gapX,
      center[1] + totalH / 2 - row * gapY,
      center[2],
    ] as Vec3;
  });
}

/** Place N items on a circle in the XZ plane (turntable). */
export function arc(
  count: number,
  radius = 12,
  startAngle = 0,
  sweep = Math.PI * 2,
  center: Vec3 = [0, 0, 0],
): Vec3[] {
  if (count <= 0) return [];
  const full = Math.abs(sweep - Math.PI * 2) < 0.001;
  const step = full ? sweep / count : sweep / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, i) => {
    const a = startAngle + i * step;
    return [
      center[0] + Math.sin(a) * radius,
      center[1],
      center[2] + Math.cos(a) * radius,
    ] as Vec3;
  });
}

/** Stack N items along the Z axis with Z_GAP offset (avoids z-fighting for labels/decals). */
export function zStack(count: number, base: Vec3 = [0, 0, 0], gap = Z_GAP): Vec3[] {
  return Array.from({ length: count }, (_, i) => [base[0], base[1], base[2] + i * gap] as Vec3);
}

/** Scatter N items randomly within a box. Seed for determinism. */
export function scatter(
  count: number,
  bounds: { x: number; y: number; z: number } = { x: 20, y: 20, z: 10 },
  seed = 42,
): Vec3[] {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  return Array.from({ length: count }, () => [
    (rng() - 0.5) * bounds.x,
    (rng() - 0.5) * bounds.y,
    (rng() - 0.5) * bounds.z,
  ] as Vec3);
}
