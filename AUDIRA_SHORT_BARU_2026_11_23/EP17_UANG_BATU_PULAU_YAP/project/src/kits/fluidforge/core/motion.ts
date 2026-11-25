export interface FluidforgeState {
  corePulse: number;
  orbitAngle: number;
  waveOffset: number;
  ringTilt: number;
  /** 0 → 1 over the payoff (8–10.5 s): the droplets fall into the core and the core swells. */
  coalesce: number;
  /** Short flash right after the droplets merge (≈10.2–11.4 s). */
  shock: number;
}

export const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const computeFluidforgeState = (f: number): FluidforgeState => {
  const t = f / 60;
  const coalesce = smooth(8, 10.5, t);
  const shock = smooth(10, 10.4, t) * (1 - smooth(10.6, 11.6, t));
  return {
    corePulse: 1 + Math.sin(t * 2.4) * 0.08 * (1 - coalesce * 0.6),
    // the orbit spins up while the droplets fall inward (angular momentum)
    orbitAngle: t * 0.85 + coalesce * 2.4,
    waveOffset: Math.sin(t * 1.6) * 0.25 * (1 - coalesce),
    ringTilt: Math.sin(t * 0.9) * 0.35 * (1 - coalesce * 0.8),
    coalesce,
    shock,
  };
};
