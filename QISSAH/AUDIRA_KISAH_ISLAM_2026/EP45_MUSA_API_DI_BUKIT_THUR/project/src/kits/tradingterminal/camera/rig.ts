// TRADINGTERMINAL Camera Rig — a slow drift in front of the terminal, pushing onto the breakout.
//
// One shot list (core/camera/moves.ts), keys every 1.5 s. Distance is set for 9:16: at fov 34 and
// 10.6 units the frame is ~3.6 units wide, so the whole candle history (x −1.6…1.6) fits. Over the
// payoff (7.5–11 s) the camera pushes in and the target slides to the live candle. The drift stays
// small: the screen must stay readable.

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export interface TradingTerminalCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const SECONDS = 12;

const ease = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** The terminal framing at second t. */
const deskFraming = (t: number) => {
  const push = ease(7.5, 11, t);
  // Hook crane: start high + far, descend onto the terminal in the first 3 s.
  const crane = 1 - ease(0, 3.0, t);
  const target: [number, number, number] = [push * 0.35, 0.15 + push * 0.3, 0];
  // hook: a slow truck along the candle history (time axis) + steady creep in, then the payoff push
  const truck = -1.0 + 1.5 * ease(0, 7.5, t);
  return framingFrom(
    [truck + Math.sin(t * 0.7) * 0.9 + push * 0.35, 0.45 + Math.cos(t * 0.5) * 0.4 + push * 0.3 + crane * 1.4, 11.4 - 1.6 * (t / SECONDS) - push * 0.9 + crane * 1.0],
    target,
    34,
  );
};

const STEP = 1.5;
const RIG = shotPlan(
  FILM_FPS,
  deskFraming(0),
  Array.from({ length: SECONDS / STEP }, (_, i) => (i + 1) * STEP).map((at) => ({ at, move: frame(deskFraming(at)) })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getTradingTerminalCamera = (f: number): TradingTerminalCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 1.2 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
