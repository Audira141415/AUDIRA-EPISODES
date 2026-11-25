// TRADINGTERMINAL motion: every value derives from the 60 fps film clock f (t = f / 60).
// Beats: 0–4.7 s the candle history prints one candle at a time; 5–8 s the live candle tests the
// amber resistance line and is rejected twice; 8–10 s breakout (the ask wall is absorbed); 10–12 s hold.

export const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** Historical candles in chart units (y): open, close, low, high. */
export const CANDLES = [
  { o: 0.4, c: 0.65, lo: 0.3, hi: 0.75 },
  { o: 0.65, c: 0.5, lo: 0.42, hi: 0.72 },
  { o: 0.5, c: 0.85, lo: 0.45, hi: 0.95 },
  { o: 0.85, c: 1.1, lo: 0.8, hi: 1.2 },
  { o: 1.1, c: 0.95, lo: 0.9, hi: 1.18 },
  { o: 0.95, c: 1.3, lo: 0.92, hi: 1.4 },
  { o: 1.3, c: 1.2, lo: 1.15, hi: 1.42 },
  { o: 1.2, c: 1.45, lo: 1.18, hi: 1.52 },
] as const;

export const CANDLE_PITCH = 0.4;
export const candleX = (i: number) => -1.6 + i * CANDLE_PITCH;
/** Time (s) at which candle i starts to print. */
export const candleAt = (i: number) => 0.3 + i * 0.55;
export const RESISTANCE_Y = 1.55;
export const LIVE_OPEN = 1.45;

/** Chart y → BTC price, so HUD numbers and geometry always agree. */
export const priceAt = (y: number) => 89000 + y * 3500;

export interface TradingTerminalState {
  t: number;
  /** 0…1 print progress per historical candle. */
  print: number[];
  /** Live candle close in chart units. */
  liveClose: number;
  liveHigh: number;
  liveIn: number;
  /** 0 → 1 breakout (8–10 s). */
  breakout: number;
  /** Flash on the resistance line when the price crosses it. */
  crossFlash: number;
  depthPulse: number;
  currentPrice: number;
}

export const computeTradingTerminalState = (f: number): TradingTerminalState => {
  const t = f / 60;
  const print = CANDLES.map((_, i) => smooth(candleAt(i), candleAt(i) + 0.45, t));
  const liveIn = smooth(4.9, 5.4, t);
  // two rejected tests of the resistance (around 6 s and 7.2 s), then the breakout
  const test = Math.max(0, Math.sin(((t - 5.4) / 1.2) * Math.PI)) * smooth(5.4, 5.8, t) * (1 - smooth(7.6, 8.0, t));
  const breakout = smooth(8, 10, t);
  const jitter = Math.sin(t * 8) * 0.012 * liveIn;
  const liveClose = LIVE_OPEN + liveIn * 0.04 + test * 0.07 + breakout * 0.5 + jitter;
  const crossFlash = smooth(8.55, 8.75, t) * (1 - smooth(8.9, 9.9, t));
  return {
    t,
    print,
    liveClose,
    liveHigh: Math.max(liveClose + 0.06, LIVE_OPEN + 0.12 + test * 0.08),
    liveIn,
    breakout,
    crossFlash,
    depthPulse: 1 + Math.sin(t * 5.0) * 0.06,
    currentPrice: priceAt(liveClose),
  };
};
