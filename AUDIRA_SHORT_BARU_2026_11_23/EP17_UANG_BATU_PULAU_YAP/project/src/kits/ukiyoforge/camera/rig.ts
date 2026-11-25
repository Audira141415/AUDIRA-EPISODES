// UKIYOFORGE Camera Rig — low in the wave trough, a long glide between the paper sheets, settle on
// the print eye where every sheet locks into one flat woodblock image, slow push while the seal stamps.
//
// One continuous shot list (core/camera/moves.ts) instead of overlapping eased ramps: the old rig sat
// still for the first 1.8 s and braked between the glide and the settle. The small hand drift stays
// and still fades out on the print eye (x), so the layers line up exactly when the image locks.

import { shotPlan, cameraAt, frame, framingFrom, settle } from "../../../core/camera/moves.ts";
import { PRINT_EYE, ramp, smooth } from "../core/motion.ts";

export interface UkiyoCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const FILM_FPS = 60;

/**
 * 0-2.5s   hook: low in the trough, looking up at the towering crest and its claws
 * 2.5-8.5s glide left and back between the paper sheets (parallax reveals the boats and mountain)
 * 8.5-10.5 payoff: settle onto the print eye, every sheet locks into one flat woodblock image
 * 10.5-12  slow breathing push-in while the seal stamps
 */
type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const HOOK = { pos: [1.5, -1.7, 2.9] as V3, tgt: [0.85, 0.6, -1.0] as V3, fov: 58 };
const GLIDE = { pos: [-1.2, -1.8, 4.4] as V3, tgt: [-0.5, -1.0, -8.5] as V3, fov: 50 };
const PRINT = { pos: [0, 0, PRINT_EYE] as V3, tgt: [0, 0, -6] as V3, fov: 46 };
/** g: hook -> glide, p: glide -> print (the old straight-line blends, sampled into keys). */
const blend = (g: number, p: number) =>
  framingFrom(
    mix(mix(HOOK.pos, GLIDE.pos, g), PRINT.pos, p),
    mix(mix(HOOK.tgt, GLIDE.tgt, g), PRINT.tgt, p),
    HOOK.fov + (GLIDE.fov - HOOK.fov) * g + (PRINT.fov - (HOOK.fov + (GLIDE.fov - HOOK.fov) * g)) * p,
  );

// The glide starts on the first frame and runs at one even pace to 8.4 s (keys every 2.1 s on the
// old straight line, so the camera stays at the trough's height instead of dipping on a curve).
const RIG = shotPlan(FILM_FPS, blend(0, 0), [
  ...[2.1, 4.2, 6.3, 8.4].map((at) => ({ at, move: frame(blend(at / 8.4, 0)) })),
  { at: 9.5, move: frame(blend(1, 0.5)) },
  { at: 10.6, move: frame(blend(1, 1)) },
  { at: 12, move: frame(framingFrom([0, 0, PRINT_EYE - 0.5], PRINT.tgt, PRINT.fov)) },
  { at: 12, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getUkiyoCamera = (f: number): UkiyoCameraConfig => {
  const t = f / FILM_FPS;
  // the print lock needs the exact eye point, so this rig keeps its own drift instead of `alive`
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: false });
  const p = smooth(ramp(t, 8.2, 10.6));
  const position: V3 = [
    shot.pos[0] + Math.sin(t * 0.7) * 0.05 * (1 - p),
    shot.pos[1] + Math.sin(t * 0.9) * 0.04,
    shot.pos[2],
  ];
  return { position, target: shot.target, fov: shot.fov };
};
