// MISTISFORGE Camera Rig — slow creeping dolly down the kampung path.
//
// Ported to the shared shot list (core/camera/moves.ts) so every kit runs on one camera system.
// The old rig was already one continuous dolly; its gaze path (lantern, foggy path, banyan roots)
// and the small involuntary push-in are sampled into framing keys every 0.6 s (the gaze swings
// between targets at very different depths, so sparser keys would bow the camera sideways). The
// low-frequency handheld "breath" is kept on top; `alive` adds a light shared seeded drift.
//  0-2s  hook: close on the swinging pelita, then the eye drifts down the foggy path
//  2-6s  development: creep forward, house window glows ahead
//  6-9s  the gaze is pulled left, toward the banyan roots
//  9-11s payoff: lamps gutter, a small involuntary push-in, lens tightens

import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";
import { easeInOut, ramp, smooth, vnoise } from "../core/motion.ts";

export interface MistisCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;
const FILM_SECONDS = 12;

type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const LANTERN: V3 = [0.82, 1.55, 6.0];
const PATH: V3 = [0.2, 1.75, -6];
const PRESENCE: V3 = [-0.85, 1.25, -3.3];

/** The original dolly framing at second t, without the handheld breath. */
const dollyFraming = (t: number) => {
  const dolly = easeInOut(Math.min(1, t / 12));
  const jolt = smooth(ramp(t, 9.0, 9.6)) * 0.45;
  const pos: V3 = [0.25 - dolly * 0.35, 1.5 - dolly * 0.1, 8.6 - dolly * 4.6 - jolt];
  let target = mix(LANTERN, PATH, smooth(ramp(t, 0.6, 3.2)));
  target = mix(target, PRESENCE, 0.75 * smooth(ramp(t, 5.8, 9.4)) * (1 - 0.6 * smooth(ramp(t, 11.0, 12))));
  return framingFrom(pos, target, 52 - 7 * smooth(ramp(t, 8.8, 10.2)));
};

const STEP = 0.6;
const RIG = shotPlan(
  FILM_FPS,
  dollyFraming(0),
  Array.from({ length: Math.round(FILM_SECONDS / STEP) }, (_, i) => +((i + 1) * STEP).toFixed(2)).map((at) => ({
    at,
    move: frame(dollyFraming(at)),
  })),
);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getMistisCamera = (f: number): MistisCameraConfig => {
  const t = f / 60;
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 0.8 } });
  // handheld "breath": low-frequency noise, never jittery
  const position: V3 = [
    shot.pos[0] + (vnoise(t * 0.6, 1) - 0.5) * 0.08,
    shot.pos[1] + (vnoise(t * 0.7, 2) - 0.5) * 0.05,
    shot.pos[2],
  ];
  return { position, target: shot.target, fov: shot.fov };
};
