// HD2D motion: one 60 fps film clock f. Sprites live on the 8 fps step clock (floor(f / 7.5)),
// camera and lights stay smooth. Beats: 0.5–6 s the hero walks (stepped) from the left of the square
// to the lantern; 6–8.5 s the hero waits in the warm pool; 8.5–10 s payoff: the town wakes, windows
// light one by one and the embers burst; the camera pushes in.

export const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const HERO_START_X = -1.35;
export const HERO_END_X = 0.15;
export const HERO_Z = 0.55;

export interface Hd2dState {
  spriteStepFrame: number;
  lanternFlicker: number;
  heroBobY: number;
  emberRiseY: number;
  /** Hero x on the 8 fps step clock. */
  heroX: number;
  /** True while the hero is walking (legs alternate). */
  walking: boolean;
  /** 0…1 per window: guildhouse, tavern, back row (payoff). */
  windows: [number, number, number];
  /** 0 → 1 payoff (town wakes). */
  wake: number;
}

export const computeHd2dState = (f: number): Hd2dState => {
  // 8 fps stepped sprite cadence inside the 60 fps timeline
  const spriteStepFrame = Math.floor(f / 7.5);
  const t = f / 60;
  const ts = (spriteStepFrame * 7.5) / 60; // sprite time, stepped
  const walk = smooth(0.5, 6, ts);
  const walking = ts > 0.5 && ts < 5.9;
  return {
    spriteStepFrame,
    lanternFlicker: 1.8 + Math.sin(t * 7.0) * 0.2 + Math.cos(t * 13.0) * 0.1,
    heroBobY: walking ? (spriteStepFrame % 2) * 0.04 : 0,
    emberRiseY: (t * 0.6) % 2.4,
    heroX: HERO_START_X + (HERO_END_X - HERO_START_X) * walk,
    walking,
    windows: [0.1 + 0.9 * smooth(8.5, 8.8, t), 0.1 + 0.9 * smooth(9.0, 9.3, t), smooth(9.4, 9.8, t)],
    wake: smooth(8.5, 10, t),
  };
};
