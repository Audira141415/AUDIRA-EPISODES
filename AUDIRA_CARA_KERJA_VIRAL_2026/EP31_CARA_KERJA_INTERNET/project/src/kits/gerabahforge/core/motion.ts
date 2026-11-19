// GERABAHFORGE timing. A lump of wet clay is centred on the wheel (it wobbles off-centre, then runs
// true), opened, and pulled up into a vase in three pulls; the wheel spins down, the piece dries to
// leather-hard, a teal glaze is poured over the shoulder and runs down in drips while the wheel turns
// slowly, AUDIRA is brushed on in cream slip, the kiln fires (the piece glows, then cools glossy), and
// the camera rises to a three-quarter reveal of the studio and the terracotta rack.
// Everything is a pure function of film time t (seconds): safe for parallel renders.

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// --- Throwing ----------------------------------------------------------------------------------
export const THROW = {
  centre: [0.0, 1.0] as const,
  open: [1.0, 1.8] as const,
  pulls: [
    [1.9, 2.6, 0.55],
    [2.65, 3.35, 0.8],
    [3.4, 4.1, 1.0],
  ] as const,
};

/** Shape progress 0 (lump) .. 0.5 (opened cylinder) .. 1 (finished vase). */
export function throwK(t: number): number {
  let k = 0.3 * easeInOut(seg(t, THROW.open[0], THROW.open[1]));
  let from = 0.3;
  for (const [a, b, to] of THROW.pulls) {
    k += (to - from) * easeInOut(seg(t, a, b));
    from = to;
  }
  return k;
}
/** How far the potter's thumbs have opened the lump (0 = solid, 1 = hollow with a floor). */
export const openK = (t: number) => smooth(seg(t, THROW.open[0], THROW.open[0] + 0.55));
/** Off-centre wobble of the lump while it is being centred (world units). */
export const wobble = (t: number) => 0.012 * Math.exp(-t * 3.2) * (1 - seg(t, 0.7, 1.0));

/** Wheel speed in revolutions per second. 240 rpm while throwing, banding speed while glazing. */
export function wheelRps(t: number): number {
  if (t < 4.1) return 4 * (0.85 + 0.15 * smooth(seg(t, 0, 0.3)));
  if (t < 4.8) return 4 * (1 - seg(t, 4.1, 4.8));
  if (t < 4.95) return 0;
  if (t < 6.5) return 0.32 * smooth(seg(t, 4.95, 5.25));
  return 0.32 * (1 - smooth(seg(t, 6.5, 7.0)));
}
export const wheelRpm = (t: number) => Math.round(wheelRps(t) * 60);

// Angle table (integrated speed), built once; wheelAngle is 0 at rest so the lettering faces +z+az.
const DT = 1 / 600;
const TABLE: number[] = (() => {
  const out = [0];
  let a = 0;
  for (let i = 1; i <= 12.5 / DT; i++) {
    a += wheelRps((i - 0.5) * DT) * Math.PI * 2 * DT;
    out.push(a);
  }
  return out;
})();
const A_END = TABLE[TABLE.length - 1];
/** Wheel and piece rotation (radians), 0 once the wheel has stopped for good. */
export function wheelAngle(t: number): number {
  const x = Math.min(TABLE.length - 1.001, Math.max(0, t / DT));
  const i = Math.floor(x), f = x - i;
  return TABLE[i] + (TABLE[i + 1] - TABLE[i]) * f - A_END;
}

/** The wooden rib: height on the wall (0..1 of the piece) and how hard it presses (0..1). */
export function ribState(t: number): { h: number; on: number } {
  if (t < THROW.open[0]) return { h: 0.45, on: smooth(seg(t, 0.15, 0.45)) };
  if (t < THROW.pulls[0][0]) return { h: 0.6, on: 0.6 };
  for (const [a, b] of THROW.pulls) {
    if (t <= b + 0.04) {
      const k = seg(t, a, b);
      return { h: 0.08 + 0.86 * easeInOut(k), on: 1 };
    }
  }
  return { h: 0.94, on: 1 - smooth(seg(t, 4.12, 4.5)) };
}

// --- Drying, glazing, lettering, firing --------------------------------------------------------
export const STAGE = { dry: [4.3, 5.0], glaze: [5.05, 6.6], paint: [6.9, 7.85], fire: [7.95, 9.7], reveal: 9.7 } as const;

/** 0 = wet and glossy, 1 = leather-hard and matte. */
export const dryAt = (t: number) => smooth(seg(t, STAGE.dry[0], STAGE.dry[1]));
/** Glaze front from the rim down (0..1 of the pour), plus how far the drips have crept. */
export const glazeAt = (t: number) => easeOut(seg(t, STAGE.glaze[0], STAGE.glaze[1] - 0.3));
export const dripAt = (t: number) => smooth(seg(t, STAGE.glaze[0] + 0.5, STAGE.glaze[1] + 0.5));
/** The pouring jug: 0 = away, 1 = tipped over the rim. */
export const jugAt = (t: number) => smooth(seg(t, STAGE.glaze[0] - 0.35, STAGE.glaze[0] + 0.15)) * (1 - smooth(seg(t, STAGE.glaze[1] - 0.35, STAGE.glaze[1] + 0.2)));
/** Lettering reveal 0..1 (brushed letter by letter, left to right). */
export const paintAt = (t: number) => seg(t, STAGE.paint[0], STAGE.paint[1]);
/** Kiln heat 0..1 (glow on the piece and the kiln mouth). */
export const heatAt = (t: number) => smooth(seg(t, STAGE.fire[0], STAGE.fire[0] + 0.7)) * (1 - smooth(seg(t, STAGE.fire[1] - 0.9, STAGE.fire[1])));
/** 0 = raw (chalky glaze, buff clay), 1 = fired (glossy glaze, red terracotta foot). */
export const firedAt = (t: number) => smooth(seg(t, STAGE.fire[0] + 0.6, STAGE.fire[1] - 0.3));

export type Stage = "PUTAR" | "KERING" | "GLASIR" | "LUKIS" | "BAKAR" | "JADI";
export function stageAt(t: number): Stage {
  if (t < STAGE.dry[0]) return "PUTAR";
  if (t < STAGE.glaze[0]) return "KERING";
  if (t < STAGE.paint[0]) return "GLASIR";
  if (t < STAGE.fire[0]) return "LUKIS";
  if (t < STAGE.reveal) return "BAKAR";
  return "JADI";
}
/** Kiln temperature for the HUD (°C), peaks at 1200. */
export const kilnTemp = (t: number) => Math.round(30 + 1170 * smooth(seg(t, STAGE.fire[0], STAGE.fire[0] + 1.0)));
