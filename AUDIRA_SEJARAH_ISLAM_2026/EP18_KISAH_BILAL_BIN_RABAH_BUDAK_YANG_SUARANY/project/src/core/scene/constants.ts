// Canonical scene constants for the AUDIRA camera setup.
// Stage3D default: camera at z=60, fov 24. These keep objects in the sweet spot.

/** Objects should be 5–20 world units across for the default camera (z=60, fov 24). */
export const SCALE = { min: 2, ideal: 10, max: 25 } as const;

/** Default camera distance and fov (matches Stage3D). */
export const CAM = { z: 60, fov: 24, near: 1, far: 900 } as const;

/** Minimum Z gap between coplanar surfaces to avoid z-fighting. */
export const Z_GAP = 0.02;

/** Safe area margins in world units at z=0 for the default camera.
 *  Approximate visible rect at z=0 with fov=24, camera z=60: ±12.7 horizontal, ±22.6 vertical (9:16). */
export const WORLD_BOUNDS = {
  halfW: 12.5,
  halfH: 22,
} as const;
