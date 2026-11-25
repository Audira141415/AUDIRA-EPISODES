// Y2KCHROME Camera Rig — playful orbit around the chrome blob.
//
// One continuous shot list (core/camera/moves.ts) instead of three overlapping eased windows: the
// old rig swept 92° around the blob (peaking near 2.3 frame widths per second), then reversed hard
// back to front-on during the morph. Same shot: starts tilted up following the falling drop, swings
// around the blob with a light bob, then pushes in on the sparkle morph and settles front-on; the
// swing is now 75° and the swing-back 28° over 3.2 s, so the blob stays readable.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { DROP_HIT, MORPH_A } from "../core/motion.ts";

export interface Y2kchromeCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const D = Math.PI / 180;

/** Camera on the old orbit: azimuth in degrees, ground radius, height, and the target height. */
const orbitAt = (azDeg: number, radius: number, h: number, ty: number) =>
  framingFrom([Math.sin(azDeg * D) * radius, h, Math.cos(azDeg * D) * radius], [0, ty, 0], 42);

// Seconds on the 60 fps film clock (DROP_HIT 1.05 s, MORPH_A 8.6 s):
//  0–1.85 s   tilted up on the falling drop, then tilt down to the blob as it splashes
//  1.85–7.6 s swing around the blob while the satellite droplets merge
//  7.6–10.8 s push in on the sparkle morph and come round to front-on
const RIG = shotPlan(FILM_FPS, orbitAt(-40, 8.6, 0.9, 1.35), [
  { at: DROP_HIT - 0.2, move: frame(orbitAt(-39, 8.6, 0.92, 1.35)) },
  { at: DROP_HIT + 0.8, move: frame(orbitAt(-36.5, 8.6, 1.3, 0.45)) },
  { at: 4.6, move: frame(orbitAt(0, 8.6, 1.3, 0.45)) },
  { at: MORPH_A - 1.0, move: frame(orbitAt(35, 8.4, 1.25, 0.45)) },
  { at: MORPH_A + 2.2, move: frame(orbitAt(6.9, 7.2, 0.8, 0.45)) },
  { at: 12, move: frame(orbitAt(5, 7.15, 0.8, 0.45)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getY2kchromeCamera = (f: number): Y2kchromeCameraConfig => {
  const t = f / 60;
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  // the kit's light bob: a little radius breathing and a vertical bounce
  const k = 1 + (Math.sin(t * 1.1) * 0.12) / shot.focus;
  const position = shot.pos.map((v, i) => shot.target[i] + (v - shot.target[i]) * k) as [number, number, number];
  position[1] += Math.sin(t * 1.7) * 0.12;
  return { position, target: shot.target, fov: shot.fov };
};
