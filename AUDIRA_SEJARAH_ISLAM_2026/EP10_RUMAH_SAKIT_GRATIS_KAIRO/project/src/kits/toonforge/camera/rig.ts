// TOONFORGE Camera Rig — low hero close-up, snap-zoom into a 3/4 chase, high pull-back to the full silhouette.
//
// One continuous shot list (core/camera/moves.ts) instead of three snap-eased segments: the old rig
// raced through each segment in its first half second, stopped dead until the next one, teleported
// at 2.67 s (close-up to the chase framing) and at 5.33 s (the aim jumped from the thrusters back to
// the core), and its impact shake swung 0.45 units at about 13 Hz (dozens of frame widths a second).
// The snap now lives in the lens: the fov opens ~6° in 0.35 s at the ignition beat while the camera
// keeps travelling, then eases back onto the track's lens; the impact is one soft, decaying kick
// (1.5 Hz, 0.03 units). The close-up lands at 2.2 s and the chase framing at 5.6 s (was 2.67 and
// 5.33 s), so the long pull-out from the close-up to the chase gets 3.4 s instead of 2.7.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";

export interface ToonCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const IGNITE_S = 160 / FILM_FPS; // thruster ignite beat (frame 160 of the film clock)
const CORE: [number, number, number] = [0, 0, 0];
const THRUST: [number, number, number] = [0, 0.2, 0.5];

// 3-act anime action trajectory (seconds on the 60 fps film clock, 8 s):
// 1. 0–2.2 s: low dramatic close-up looking up at the mecha core
// 2. 2.2–5.6 s: ignition snap-zoom (2.67 s) into a dynamic 3/4 chase on the thrusters
// 3. 5.6–8 s: heroic high-angle pull-back into the full battle silhouette
const RIG = shotPlan(FILM_FPS, framingFrom([-1.8, -0.8, 3.2], CORE, 45), [
  { at: 2.2, move: frame(framingFrom([-0.6, -0.2, 2.5], [0, 0.05, 0.1], 40)) },
  { at: 5.6, move: frame(framingFrom([2.2, 1.4, 5.5], THRUST, 46)) },
  { at: 8.0, move: frame(framingFrom([0, 1.8, 6.8], CORE, 42)) },
  { at: 8.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

/** One soft camera kick after the ignition: a decaying 2.5 Hz bump, readable but not a jolt. */
const kick = (t: number) => {
  const a = t - IGNITE_S;
  if (a < 0 || a > 2) return 0;
  return Math.sin(a * Math.PI * 2 * 1.5) * 0.03 * Math.exp(-a * 2.5) * Math.min(1, a * 6);
};

/** Lens snap-zoom at the ignition: the fov opens ~6° in 0.35 s, then hands back to the track's lens. */
const snap = (t: number) => {
  const a = t - IGNITE_S;
  if (a <= 0) return 0;
  const up = Math.min(1, a / 0.35);
  return 6 * up * up * (3 - 2 * up) * Math.exp(-Math.max(0, a - 0.35) * 1.4);
};

export const getToonCameraPose = (f: number, _totalFrames = 480): ToonCameraPose => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: true });
  const k = kick(f / FILM_FPS);
  return { position: [shot.pos[0] + k * 0.6, shot.pos[1] + k, shot.pos[2]], target: shot.target, fov: shot.fov + snap(f / FILM_FPS) };
};
