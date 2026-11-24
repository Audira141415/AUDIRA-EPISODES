// BACKROOMS motion — found-footage walk with one payoff.
//   0–8.4 s    tubes hum; tube 1 stutters now and then (deterministic, frame-based)
//   8.4–9.3 s  payoff: the tubes die one by one from the far end toward the camera
//   9.3–12 s   only the red EXIT sign and a dim emergency glow remain; the nearest tube tries
//              to come back twice
export interface BackroomsState {
  walkBobY: number;
  walkSwayX: number;
  /** Intensity multiplier per tube (index 0 = farthest). */
  tubes: number[];
  /** 0…1 how far the blackout has gone (drives fill and the EXIT sign). */
  blackout: number;
  /** Kept for older callers: intensity of the stuttering tube. */
  tubeFlicker: number;
}

export const TUBES_Z = [-4.0, -1.5, 1.0, 3.5];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const computeBackroomsState = (f: number): BackroomsState => {
  const t = f / 60;
  const warmUp = Math.min(1, t / 1.0); // tubes ramp up over the first second
  const stutter = Math.sin(f * 1.9) > 0.88 ? 0.3 : 1;
  const tubes = TUBES_Z.map((_, i) => {
    const off = 8.4 + i * 0.28; // far tube first
    const dying = t > off - 0.18 && t < off ? (Math.floor(f / 3) % 2 ? 0.25 : 1) : 1;
    const base = t < off ? 1.3 * dying : 0;
    // the nearest tube tries to come back twice after the blackout
    const retry = i === 3 && ((t > 10.2 && t < 10.32) || (t > 10.6 && t < 10.68)) ? 0.9 : 0;
    return ((i === 1 ? base * stutter : base) + retry) * warmUp;
  });
  return {
    walkBobY: Math.sin(t * 4.2) ** 2 * 0.06,
    walkSwayX: Math.sin(t * 2.1) * 0.08,
    tubes,
    blackout: clamp01((t - 8.4) / 1.2),
    tubeFlicker: tubes[1],
  };
};
