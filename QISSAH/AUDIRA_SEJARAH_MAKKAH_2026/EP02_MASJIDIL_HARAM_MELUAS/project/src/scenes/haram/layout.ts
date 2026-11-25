// Plan of the maquette (units ~43 m, Ka'bah at the origin, north = -z, east = +x).
import type { Rect } from "./parts.tsx";
import { clamp01 } from "./tl.ts";

// Courtyard footprints era by era (areas roughly proportional to the research figures for the early eras).
export const FP: Rect[] = [
  { x0: -0.8, x1: 0.8, z0: -0.75, z1: 0.75 }, // 0 initial courtyard (±1.500 m²)
  { x0: -1.0, x1: 1.0, z0: -0.95, z1: 0.95 }, // 1 Umar 17 H
  { x0: -1.3, x1: 1.3, z0: -1.25, z1: 1.2 }, // 2 Utsman
  { x0: -1.65, x1: 1.65, z0: -1.55, z1: 1.45 }, // 3 Ibn Zubair (±7.500 m²)
  { x0: -2.4, x1: 1.75, z0: -2.6, z1: 1.5 }, // 4 al-Mansur (north + west)
  { x0: -2.9, x1: 2.3, z0: -3.3, z1: 1.6 }, // 5 al-Mahdi, Ka'bah off-centre
  { x0: -2.9, x1: 2.9, z0: -3.3, z1: 3.15 }, // 6 after the wadi moved: final Abbasid / Ottoman
];
export const OTT = FP[6];
export const BAND = 0.55; // final arcade depth
export const GAP = 0.8; // open band between the Ottoman riwaq and the Saudi I ring
export const S1 = { x0: -4.5, x1: 5.75, z0: -4.9, z1: 4.6 };
export const S1_IN = { x0: OTT.x0 - GAP, x1: OTT.x1 + GAP, z0: OTT.z0 - GAP, z1: OTT.z1 + GAP };
export const MASA = { x: 4.85, z0: -4.55, z1: 4.25 }; // Safa (south) to Marwah (north)
export const FAHD = { x0: -7.3, x1: -4.5, z0: -2.6, z1: 2.4 };
export const S3 = { x0: -7.3, x1: 6.6, z0: -12.5, z1: -4.9 };
export const OLD_ZONE = { x0: -5.9, x1: 5.9, z0: -5.4, z1: 5.0 };
export const ALL = { x0: -8.0, x1: 7.2, z0: -13.1, z1: 5.3 };
export const AJYAD: [number, number] = [-1.6, 7.3];
export const PLAQUE: [number, number, number] = [0, 0.16, 6.45];

export function rectAt(fp: number): Rect {
  const i = Math.min(FP.length - 2, Math.max(0, Math.floor(fp)));
  const k = clamp01(fp - i);
  const a = FP[i], b = FP[i + 1];
  return { x0: a.x0 + (b.x0 - a.x0) * k, x1: a.x1 + (b.x1 - a.x1) * k, z0: a.z0 + (b.z0 - a.z0) * k, z1: a.z1 + (b.z1 - a.z1) * k };
}

export const bandAt = (fp: number) => 0.28 + (BAND - 0.28) * clamp01((fp - 2) / 4);

export const HILLS = [
  { x: 8.9, z: -0.6, r: 2.7, layers: 7, seed: 3 }, // Jabal Abu Qubais (east)
  { x: -12.5, z: 5.5, r: 4.2, layers: 6, seed: 5 },
  { x: 12.5, z: -12.5, r: 4.6, layers: 8, seed: 9 },
  { x: -13.5, z: -16.5, r: 5.2, layers: 8, seed: 11 },
  { x: 3.5, z: 12.5, r: 3.6, layers: 6, seed: 13 },
  { x: -3.0, z: -23.0, r: 6.0, layers: 9, seed: 17 },
  { x: 16.5, z: 6.5, r: 5.0, layers: 7, seed: 19 },
];
export const HILL_LAYER = 0.11;
