// EP46 2D camera (G13): whole-set elliptical drift (never parks) + slow push-in, applied per scene in Film.tsx.
// Small margins on purpose: s0 1.045 covers the ±22 px / ±34 px drift without exposing the paper edge.
// No imports, so `npm run audit:rig -- src/ep46/camera2d.ts rigPose` runs it directly (G14).

export type Cam2D = { s: number; px: number; py: number };

/** lt = seconds since the scene started, dir = ±1 (alternates per scene). Units: 1080-wide stage pixels. */
export const cam2d = (lt: number, dir = 1): Cam2D => ({
  s: 1.045 + 0.006 * lt,
  px: dir * 22 * Math.sin(1.3 * lt),
  py: 34 * Math.cos(1.3 * lt),
});

/** Equivalent 3D pose for the rig audit (60 fps): pan = camera opposite the set, zoom = dolly (distance 1000 / s). */
export const rigPose = (f: number) => {
  const c = cam2d(f / 60);
  return { position: [-c.px, c.py, 1000 / c.s], target: [-c.px, c.py, 0], fov: 40 };
};
