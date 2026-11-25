// TRADINGTERMINAL Camera Rig — a slow drift and push toward the terminal screens.
//
// One shot list (core/camera/moves.ts). The old push (0.5 units) finished at 6.25 s and left only a
// slow sway; the push now spans the whole 12 s with the same sway, sampled into keys every 3 s.
// The drift is kept small: the screens must stay readable.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface TradingTerminalCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;

/** The terminal framing at second t. */
const deskFraming = (t: number) =>
  framingFrom([0.2 + Math.sin(t * 0.2) * 0.3, 1.45, 5.2 - 0.5 * (t / SECONDS)], [0, 0.65, 0], 34);

const RIG = shotPlan(FILM_FPS, deskFraming(0), [
  ...[3, 6, 9, 12].map((t) => ({ at: t, move: frame(deskFraming(t)) })),
  { at: SECONDS, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getTradingTerminalCamera = (f: number): TradingTerminalCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.6 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
