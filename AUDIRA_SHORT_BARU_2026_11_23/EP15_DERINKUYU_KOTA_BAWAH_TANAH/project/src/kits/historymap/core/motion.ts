// HISTORYMAP motion — Trajan's conquest of Dacia, 101–106 AD, as one 12 s map-table beat.
//   0.5–4.0 s  Roman territory floods north up to the Danube
//   2.4–4.2 s  legion camps (tents) drop onto the Roman bank one by one
//   4.4–8.6 s  two pincer arrows cross the river and curve onto Sarmizegetusa
//   8.6–9.8 s  payoff: the pincers close, the fortress pin flares and Dacia turns Roman
//   year counter 101 → 106 AD across the campaign
export interface HistoryMapState {
  territoryWipe: number;
  /** 0…1 drop-in for each legion camp. */
  camps: number[];
  arrowProgress: number;
  /** 0…1 payoff: pincers closed, fortress flare. */
  clash: number;
  yearTick: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const computeHistoryMapState = (f: number): HistoryMapState => {
  const t = f / 60;
  const arrowProgress = easeInOut((t - 4.4) / 4.2);
  return {
    territoryWipe: easeInOut((t - 0.5) / 3.5),
    camps: [0, 1, 2].map((i) => easeOut((t - 2.4 - i * 0.45) / 0.5)),
    arrowProgress,
    clash: easeOut((t - 8.6) / 1.2),
    yearTick: Math.round(101 + 5 * clamp01((t - 0.5) / 9.3)),
  };
};
