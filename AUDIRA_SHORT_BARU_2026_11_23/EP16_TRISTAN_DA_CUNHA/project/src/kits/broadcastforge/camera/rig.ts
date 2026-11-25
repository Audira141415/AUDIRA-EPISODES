// BROADCASTFORGE Camera Rig — Ultimate Studio Pedestal, Jib & Multi-Cam Director.
//
// Supports two directorial operational modes:
// 1. Continuous C1 Hydraulic Jib (default): establishing wide crane descending smoothly into anchor frame.
// 2. Multi-Cam Director: switches cleanly between Wide Establishing (Cam 1), Anchor Tight (Cam 2),
//    OTS Video Wall Graphics (Cam 3), and Dynamic Low Angle Outro (Cam 4).

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface BroadcastForgeCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;

/** Dynamic broadcast camera framing at second t (Continuous Mode).
 *  Framed for 9:16: the 2.5-unit desk needs ~6.5 units of distance at fov 46 to fit the width with
 *  margin (the old 3.6-unit frame at fov 40 cropped the desk and pushed the camera into the set). */
const broadcastFraming = (t: number) => {
  // Jib descent from a high establishing wide to the anchor two-shot over the first 3.5 s.
  const progress = Math.min(1, t / 3.5);
  const smoothP = progress * progress * (3 - 2 * progress); // smoothstep

  const posX = Math.sin(t * 0.32) * 0.9;
  const posY = 3.4 - smoothP * 1.75; // 3.4 down to 1.65
  const posZ = 8.6 - smoothP * 2.0; // 8.6 in to 6.6

  const targetY = 1.2 - smoothP * 0.2; // desk and anchor sit above the lower third

  return framingFrom([posX, posY, posZ], [0, targetY, -0.4], 46 - smoothP * 4);
};

const CONTINUOUS_RIG = shotPlan(FILM_FPS, broadcastFraming(0), [
  ...[1, 3, 5.5, 8, 10, SECONDS].map((t) => ({ at: t, move: frame(broadcastFraming(t)) })),
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/** Continuous hydraulic studio jib rig */
export const getBroadcastForgeCamera = (f: number): BroadcastForgeCameraConfig => {
  const shot = cameraAt(CONTINUOUS_RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.4 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};

/** Multi-Cam television director switching rig */
export const getMultiCamBroadcastCamera = (f: number): BroadcastForgeCameraConfig => {
  const t = f / FILM_FPS;

  if (t < 3.0) {
    // Cam 1: Wide Studio Establishing Shot
    const subT = t / 3.0;
    const posX = Math.sin(subT * 0.4) * 0.3;
    const posY = 3.1 - subT * 0.3;
    return {
      position: [posX, posY, 8.4],
      target: [0, 1.25, -0.4],
      fov: 46,
    };
  } else if (t < 7.0) {
    // Cam 2: Anchor Tight & Lower-Third Focus
    const subT = (t - 3.0) / 4.0;
    const posX = Math.sin(subT * 0.3) * 0.15;
    return {
      position: [posX, 1.6, 5.2],
      target: [0, 1.25, 0],
      fov: 40,
    };
  } else if (t < 10.0) {
    // Cam 3: Over-The-Shoulder (OTS) Framing the Curved Video Wall Graphics
    const subT = (t - 7.0) / 3.0;
    const posX = -1.8 + subT * 0.3;
    return {
      position: [posX, 1.5, 5.4],
      target: [0.6, 1.9, -2.2],
      fov: 44,
    };
  } else {
    // Cam 4: Dynamic Sweeping Low-Angle Outro
    const subT = (t - 10.0) / 2.0;
    const posX = Math.sin(subT * 0.5) * 0.4;
    return {
      position: [posX, 0.9, 6.4],
      target: [0, 1.4, 0],
      fov: 44,
    };
  }
};
