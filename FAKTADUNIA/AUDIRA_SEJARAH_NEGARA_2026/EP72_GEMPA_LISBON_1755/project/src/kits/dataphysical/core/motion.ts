// DATAPHYSICAL motion — one 12 s data-sculpture beat.
//   0.3–3.2 s  six aluminium columns rise one after another (ease-out back, small overshoot)
//   2.6–3.4 s  the teal acrylic benchmark plate settles at its mark
//   3.0–4.2 s  the orange hero column climbs to the benchmark and stops under it
//   7.4–9.2 s  payoff: the hero column pushes through the benchmark to its record height
//   whole film a slow turntable yaw so the sculpture always reads in 3D
export interface DataPhysicalState {
  /** Height of each of the 7 columns (index HERO is the hero). */
  heights: number[];
  heroBarHeight: number;
  brassMarkerY: number;
  /** 0…1 how far the hero column has broken through the benchmark (payoff). */
  breakthrough: number;
  turntableYaw: number;
}

export const SERIES = [0.65, 0.95, 1.25, 0.85, 1.4, 2.15, 1.1];
export const HERO = 5;
export const BENCHMARK_Y = 1.45;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeOutBack = (x: number) => {
  const c = 0.9;
  const p = clamp01(x) - 1;
  return 1 + (c + 1) * p * p * p + c * p * p;
};
const easeInOut = (x: number) => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const computeDataPhysicalState = (f: number): DataPhysicalState => {
  const t = f / 60;
  let order = 0;
  const heights = SERIES.map((h, i) => {
    if (i === HERO) return 0;
    const start = 0.3 + order++ * 0.48;
    return 0.04 + (h - 0.04) * easeOutBack((t - start) / 0.9);
  });
  const climb = easeOut((t - 3.0) / 1.2);
  const breakthrough = easeInOut((t - 7.4) / 1.8);
  const underBenchmark = BENCHMARK_Y - 0.07;
  heights[HERO] = 0.04 + (underBenchmark - 0.04) * climb + (SERIES[HERO] - underBenchmark) * breakthrough;
  return {
    heights,
    heroBarHeight: heights[HERO],
    brassMarkerY: 0.2 + (BENCHMARK_Y - 0.2) * easeOut((t - 2.6) / 0.8),
    breakthrough,
    turntableYaw: -0.4 + t * 0.075,
  };
};
