import { hold, pushIn, orbit, reveal, pullOut, type Move } from "../core/camera/moves.ts";
import type { BeatName, Beats } from "./types.ts";

/** Default camera move per beat — cinematic, no parked camera. */
export const DEFAULT_MOVES: Record<BeatName, Move> = {
  hook: hold(),
  context: orbit(-25),
  main: pushIn(0.65),
  explanation: orbit(20),
  payoff: reveal(1.5, 8),
  outro: pullOut(1.3),
};

export const DEFAULT_LENS = { aperture: 2.8, maxBlur: 0.004, exposure: 1 };

/**
 * Generate standard 6-beat timings from VO duration. Hook is always 3 s;
 * the middle four beats follow AUDIRA's standard proportions; outro fills
 * the pad. No need to hand-time beats for a typical episode.
 */
export function quickBeats(voDuration: number, outroPad = 3): Beats {
  const total = voDuration + outroPad;
  const hook = 3;
  const outro = Math.min(5, outroPad + 2);
  const mid = total - hook - outro;
  const r = (n: number) => Math.round(n * 10) / 10;
  const at = (frac: number) => r(hook + mid * frac);
  return {
    hook:        { start: 0,        end: r(hook) },
    context:     { start: r(hook),  end: at(0.17) },
    main:        { start: at(0.17), end: at(0.55) },
    explanation: { start: at(0.55), end: at(0.80) },
    payoff:      { start: at(0.80), end: r(hook + mid) },
    outro:       { start: r(hook + mid), end: r(total) },
  };
}
