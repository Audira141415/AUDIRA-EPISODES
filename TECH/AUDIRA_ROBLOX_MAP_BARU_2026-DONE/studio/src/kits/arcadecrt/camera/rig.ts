// ARCADECRT Camera Rig — wide on the glowing cabinet, a push into the CRT glass, a cut (the dive
// flash at BEAT.dive), then a side-scroller follow inside the pixel world.
//
// Two continuous shot lists (core/camera/moves.ts), one per side of the dive cut, instead of eased
// lerp segments. Outside: the push closes the distance at a constant rate (keys on a geometric
// series), so it still reads as accelerating into the glass without the last-second rush. Inside:
// the target runs with the hero at his constant speed but ignores his jumps, and the camera starts
// further back, so the world no longer whips past at the first frame after the flash.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";
import { BEAT, type ArcadeState, type V3 } from "../core/motion.ts";

export interface ArcadeCameraConfig {
  position: V3;
  target: V3;
  fov: number;
  roll: number;
}

// Mirrors SCREEN.center / screenNormal() in ../scene/CrtCabinet3D.tsx and heroX in
// ../core/game.ts (modules node cannot load: a .tsx scene and an extensionless import).
const SCREEN_CENTER: V3 = [0, 1.575, 0.255];
const SCREEN_EL = (0.158 * 180) / Math.PI; // the glass faces up by its tilt
const heroX = (t: number) => 1.5 + 3.25 * t;

const CLOCK = 60; // keys on a 60-units-per-second clock; ArcadeState carries seconds

// Outside, 0–7.3 s: slow drift on the wide, then a constant-rate push into the glass.
// The 8.25 s key lies past the cut, so the camera is still moving when the flash hits.
const PUSH = [
  [2.55, 2.45, -11, 3, 39],
  [3.5, 1.42, -8, 5, 37.5],
  [4.45, 0.83, -5, 6.5, 36],
  [5.4, 0.48, -2.5, 7.8, 35],
  [6.35, 0.28, -1, 8.6, 34],
  [7.3, 0.16, 0, 9, 34],
  [8.25, 0.09, 0, 9, 34],
] as const;
const OUTSIDE = shotPlan(CLOCK, framingFrom([-1.7, 1.75, 4.9], [0, 1.4, 0], 40, -2.3), [
  { at: 1.6, move: frame(framingFrom([-1.1, 1.65, 4.3], [0, 1.47, 0.1], 40, -1.8)) },
  ...PUSH.map(([at, dist, az, el, fov]) => ({
    at,
    move: frame({ target: SCREEN_CENTER, dist, az, el: Math.min(el, SCREEN_EL), fov, roll: at < 5.4 ? -1 : 0 }),
  })),
]);

// Inside, 7.3–12 s: the target runs with the hero (x keys on his straight-line run); its height
// glides between ledges instead of hopping with every jump. Keys at 6.3 s and 13 s lie outside the
// shown range so the follow is already at speed after the cut and does not brake at the end.
const inside = (t: number, y: number, dist: number, az: number, el: number, fov: number, roll: number) => ({
  at: t,
  move: frame({ target: [heroX(t) + 0.5, y, 0], dist, az, el, fov, roll }),
});
// (The start framing sits on the same straight run at 0 s, so x keeps one slope through 6.3 s.)
const INSIDE = shotPlan(CLOCK, { target: [heroX(0) + 0.5, 5.6, 0], dist: 4.2, az: -6, el: 4, fov: 44, roll: 1.5 }, [
  inside(6.3, 5.6, 4.2, -6, 4, 44, 1.5),
  inside(7.3, 5.4, 5.2, -10, 5, 44, 2),
  inside(8.8, 4.0, 9.5, -17, 6, 43, -1.5), // wide enough for the drop to the pit floor
  inside(BEAT.grab, 5.2, 8.3, -19, -5, 40, 1.5), // low hero angle on the star grab
  inside(12, 4.9, 12.5, -20, 6, 41, 0),
  inside(13, 4.8, 13.5, -20, 6.5, 41, 0),
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getArcadeCamera = (s: ArcadeState): ArcadeCameraConfig => {
  const shot = cameraAt(s.inside ? INSIDE : OUTSIDE, s.t * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll ?? 0 };
};
