// COMICFORGE Camera Rig — push through the printed panels, hero on the roof, chase over the
// shoulder, impact shake, crane-back reveal.
//
// One continuous shot list (core/camera/moves.ts) instead of three blended segments: the old rig
// switched formulas at 3.6 s and 8.8 s (the speed changed abruptly there) and parked on the roof.
// The chase still follows the hero: the framing is sampled from the hero's flight arc into keys,
// and the impact punch-in and roll shudder stay on top.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { BEAT, computeComicState, easeInOut, lerp3, ramp, smooth, type ComicState, type V3 } from "../core/motion.ts";

export interface ComicCameraConfig {
  position: V3;
  target: V3;
  fov: number;
  roll: number;
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const FILM_FPS = 60;
const R2D = 180 / Math.PI;

// The push aims at the rooftop from the first frame (the old aim point [0, 2.4, 12] lies on almost
// the same line of sight, 2° away), so the camera closes on one subject instead of chasing a moving
// aim point, and the distance can shrink at one screen speed.
const PUSH_FROM = framingFrom([0.3, 2.5, 34], [-0.6, 1.1, 0.6], 40);
const PUSH_TO = framingFrom([-1.9, 1.5, 6.2], [-0.6, 1.1, 0.6], 40);

/** The intended framing at second t (no shake): the old segment maths, used to place the keys. */
const framingAt = (t: number) => {
  const s = computeComicState(t * FILM_FPS);
  const heroChest: V3 = add(s.heroPos, [0, 1.1, 0]);
  const chasePos = add(s.heroPos, [-3.4, 0.2, 4.4]);
  const chaseTgt = add(s.heroPos, [0.9, 1.0, -1.6]);
  if (t < BEAT.pushThroughPanels[1]) {
    // 1 — through the page panels (pages sit at z = 20 and z = 12.5). The distance shrinks
    // geometrically so the push keeps one screen speed instead of rushing through its middle.
    const u = smooth(ramp(t, 0, BEAT.pushThroughPanels[1]));
    const a = PUSH_FROM, b = PUSH_TO;
    return {
      target: b.target,
      az: a.az + (b.az - a.az) * u,
      el: a.el + (b.el - a.el) * u,
      dist: a.dist * Math.pow(b.dist / a.dist, u),
      fov: 40,
      roll: 0,
    };
  }
  if (t < BEAT.impact) {
    // 2 — rooftop slow arc, blending into 3 — chase over the shoulder
    const holdPos = lerp3([-1.9, 1.5, 6.2], [-2.8, 1.0, 5.4], smooth(ramp(t, BEAT.pushThroughPanels[1], BEAT.leap + 0.2)));
    const chaseK = smooth(ramp(t, BEAT.leap, BEAT.leap + 0.9));
    return framingFrom(lerp3(holdPos, chasePos, chaseK), lerp3(heroChest, chaseTgt, chaseK), 40 + 4 * chaseK, -0.12 * chaseK * R2D);
  }
  // 5 — crane back after the hit
  const craneK = easeInOut(ramp(t, BEAT.impact + 0.15, BEAT.end));
  const pos = lerp3(chasePos, [-3.4, 5.6, 3.6], craneK);
  const tgt = lerp3(chaseTgt, [2.0, 5.5, -4.8], smooth(ramp(t, BEAT.impact, BEAT.impact + 1.6)));
  return framingFrom(pos, tgt, 44, -0.12 * (1 - craneK) * R2D);
};

//  0–3.6 s   push through two panel borders onto the rooftop
//  3.6–4.7 s low hero angle on the roof, slow arc
//  4.7–8.8 s chase over the shoulder along the flight arc
//  8.8–12 s  impact, then a slow crane back to the reveal
const KEYS = [1.8, BEAT.pushThroughPanels[1], 4.3, 5.2, 6.2, 7.4, BEAT.impact, 10.4, BEAT.end];
const RIG = shotPlan(FILM_FPS, framingAt(0), [
  ...KEYS.map((at) => ({ at, move: frame(framingAt(at)) })),
  { at: BEAT.end, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

// Shot grammar: (1) push straight through two panel borders of the printed page, (2) low hero angle on the
// rooftop, (3) chase cam over the shoulder during the flight, (4) impact shake, (5) slow crane-back reveal.
export const getComicCamera = (s: ComicState): ComicCameraConfig => {
  const t = s.t;
  const shot = cameraAt(RIG, t * FILM_FPS, FILM_FPS, { lens: LENS, alive: true });
  // 4 — impact jolt (deterministic, decays in ~0.6 s): punch-in plus a roll shudder. The old
  // 14 Hz positional shake whipped the frame several widths per second (a jump in the rig audit);
  // the shudder now lives in the roll and the lens, so the hit reads without throwing the subject.
  const sh = s.shake;
  const hit = Math.max(0, t - BEAT.impact); // phase starts at 0 on the hit: no jump on its first frame
  const position = shot.pos;
  const fov = shot.fov - sh * 8;
  const roll = (shot.roll ?? 0) + Math.sin(hit * 40) * 0.045 * sh;
  return { position, target: shot.target, fov, roll };
};
