// GLITCHFORGE Camera Rig — a calm, expensive product orbit that never stops: the camera stays smooth
// while the image breaks. Only the signal-lost beat adds a tiny stepped "frame drop" jitter; the
// snap-back lands on a hero push-in.
//
// One continuous shot list (core/camera/moves.ts) instead of a formula. The old orbit ran the full
// 72° on one ease-in-out across the film, so it crept for three seconds and then crossed the middle
// at nearly a frame width a second; the keys now space the orbit evenly, with
// the same push-in to the snap (8.45 s), the descent and the lift of the aim after the snap.
// 2026-11-18: the orbit was widened to ~14° a second (2.9 rad over 12 s) with a deeper push and
// crane-down. On a white cyclorama a 6°/s orbit measured as parked (median 0.019) once the glitch
// stopped being constant; the test card and light stand now sweep past and carry the parallax.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import type { GlitchState, V3 } from "../core/motion.ts";

export interface GlitchCameraConfig {
  position: V3;
  target: V3;
  fov: number;
  roll: number;
}

const FILM_FPS = 60;
const SNAP = 8.45; // BEAT.snap in ../core/motion.ts: the image snaps back clean
const END = 12;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** The product framing at second t: linear orbit, push-in to the snap, lower camera, aim lift after the snap. */
const product = (t: number) => {
  const orbit = -1.25 + (t / END) * 2.9;
  const after = smooth(clamp01((t - SNAP) / (END - SNAP)));
  // steady (near-linear) push so the zoom never parks at either end, plus a slow lateral drift of the
  // aim: the hero itself travels a little across the frame instead of sitting locked at centre
  const dist = 11.4 - 3.2 * (0.2 * easeInOut(clamp01(t / SNAP)) + 0.8 * clamp01(t / SNAP)) - 1.0 * after;
  const h = 3.6 - 1.0 * smooth(clamp01((t - 1) / 8));
  const aimX = 0.75 - 1.5 * (t / END);
  return framingFrom([Math.sin(orbit) * dist, h, Math.cos(orbit) * dist], [aimX, 2.1 + 0.12 * (t / END) + 0.15 * after, 0], 38 - 6 * (t / END));
};

const RIG = shotPlan(FILM_FPS, product(0), [
  ...[2, 4, 6, SNAP, 10.2, END].map((at) => ({ at, move: frame(product(at)) })),
  { at: END, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getGlitchCamera = (s: GlitchState): GlitchCameraConfig => {
  const t = s.t;
  const shot = cameraAt(RIG, t * FILM_FPS, FILM_FPS, { lens: LENS, alive: true });
  // signal lost: the camera drops frames on a 12 Hz step (a deliberate, tiny stutter; 0.035 units
  // instead of 0.05, so each step stays under a frame width a second)
  const drop = s.lost > 0 ? Math.floor(t * 12) % 2 : 0;
  const position: V3 = [shot.pos[0] + drop * 0.035, shot.pos[1] - drop * 0.02, shot.pos[2]];
  return { position, target: shot.target, fov: shot.fov, roll: s.slice * 0.02 * Math.sin(t * 40) };
};
