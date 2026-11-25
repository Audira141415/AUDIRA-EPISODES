// Rig module for `npm run audit:rig` — mirrors the shot list in src/episode/ParaguayFilm.tsx.
// Keep in sync with config.shots there if the camera changes.
import { shotPlan, cameraAt, framingFrom, lookAt, frame as frameTo, orbit, pullOut, hold, type Beat } from "../src/core/camera/moves.ts";

type V3 = [number, number, number];
const P = (lon: number, lat: number, y = 0): V3 => [(lon + 57) * 0.25, y, -(lat + 26) * 0.25];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const ARMY = P(-56.2, -25.4);
const COLUMN = P(-58.0, -23.4);
const FIELD = P(-57.0, -24.3);
const CERRO_CORA = P(-56.0, -22.6);
const FPS = 60;

const START = framingFrom([-0.2, 7.45, 4.35], [-0.2, 0, 0.05], 34);
const beats: Beat[] = [
  { at: 0, move: hold() },
  { at: 6, move: frameTo({ dist: 7.9, az: 6 }) },
  { at: 11.6, move: frameTo({ dist: 7.4, az: 9, el: 62 }) },
  { at: 13.37, move: lookAt([-0.35, 0, -0.55], { az: -12, el: 72, dist: 4.6 }) },
  { at: 19.5, move: frameTo({ dist: 4.0, az: -4 }) },
  { at: 22.8, move: lookAt([-0.15, 0, 0.35], { az: 4, el: 66, dist: 7.4 }) },
  { at: 27.2, move: frameTo({ dist: 7.0, az: 10 }) },
  { at: 32.2, move: lookAt(add(ARMY, [0, 0.08, 0]), { az: 28, el: 20, dist: 2.3, fov: 32 }) },
  { at: 36.6, move: orbit(-22) },
  { at: 40.5, move: frameTo({ dist: 1.95, el: 16 }) },
  { at: 42.8, move: orbit(-8) },
  { at: 45.6, move: lookAt([0.05, 0.05, -0.7], { az: -35, el: 42, dist: 3.2, fov: 34 }) },
  { at: 50.6, move: lookAt(add(CERRO_CORA, [0, 0.1, 0]), { az: -20, el: 34, dist: 2.0 }) },
  { at: 54.4, move: frameTo({ dist: 2.4, az: -5 }) },
  { at: 56.8, move: pullOut(1.15) },
  { at: 61.4, move: lookAt(add(COLUMN, [0.1, 0.65, 0]), { az: 55, el: 14, dist: 3.8, fov: 34 }) },
  { at: 66.6, move: frameTo({ az: 40, el: 18, dist: 3.2, target: add(COLUMN, [0.15, 0.35, 0]) }) },
  { at: 71.2, move: lookAt(add(FIELD, [0, 0.16, 0.05]), { az: 15, el: 24, dist: 2.4 }) },
  { at: 75.6, move: orbit(14) },
  { at: 80.4, move: lookAt([-0.3, 0, -0.1], { az: -8, el: 64, dist: 6.6, fov: 34 }) },
  { at: 84, move: frameTo({ dist: 7.4, az: 0 }) },
  { at: 93.6, move: frameTo({ dist: 8.6, el: 68 }) },
];
const rig = shotPlan(FPS, START, beats);
const lens = { aperture: 2.8, maxBlur: 0.002, exposure: 1 };

export const paraguayRig = (f: number) => {
  const s = cameraAt(rig, f, FPS, { lens, alive: true });
  return { position: s.pos, target: s.target, fov: s.fov };
};
