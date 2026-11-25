// GACHAREVEAL Camera Rig — anticipation push-in on the capsule, a swing around the burst, then a
// hero settle front-on to the revealed card. Every flash adds a small lens kick.
//
// One continuous shot list (core/camera/moves.ts) instead of a formula: the old rig spun a full
// 360° around the burst in about 1.7 s at its core (over ten frame widths a second, which read as a
// teleport) and shook the camera with a random jitter re-rolled 30 times a second. The camera now
// circles out to the left while the tiers charge (az −20° to −48°), swings back round the burst as
// it rises to the reveal (az −48° to −6°, the radius opening to 6 units on the way, as the old spin
// did), and settles front-on. The flash kick lives in the lens only (fov +2° per flash).

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { BURST, SPIN, flash } from "../core/motion.ts";

export interface GacharevealCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const D = Math.PI / 180;

/** Orbit framing around the capsule: azimuth in degrees, radius, camera height, aim height and depth. */
const ring = (az: number, r: number, h: number, ty: number, tz: number, fov: number) =>
  framingFrom([Math.sin(az * D) * r, h, Math.cos(az * D) * r], [0, ty, tz], fov);

//  0–5.6 s   anticipation: push in on the shaking capsule while the tiers charge (1.8, 3.4, 5.0 s)
//  5.6–9.6 s burst (6 s) and swing round as the card rises, opening the radius, then rising to it
//  9.6–12 s  hero settle front-on to the revealed card, still drifting in a little
const RIG = shotPlan(FILM_FPS, ring(-20, 5.2, 1.5, 1.25, 0, 46), [
  { at: SPIN[0] + 0.1, move: frame(ring(-48, 4.1, 1.2, 1.25, 0, 46)) },
  { at: BURST + 1.7, move: frame(ring(-26, 5.9, 1.85, 1.6, 0.1, 44)) },
  { at: SPIN[1] + 0.7, move: frame(ring(-6, 5.1, 2.25, 1.82, 0.2, 40)) },
  { at: 12, move: frame(ring(-1, 4.8, 2.2, 1.82, 0.2, 40)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getGacharevealCamera = (f: number): GacharevealCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov + flash(f / FILM_FPS) * 2 };
};
