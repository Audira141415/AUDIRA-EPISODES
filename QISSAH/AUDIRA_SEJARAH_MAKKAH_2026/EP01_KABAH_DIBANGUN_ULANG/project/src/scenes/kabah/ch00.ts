// Hook (c00) and intro (c01): the approved cover frame, a fast tour of the era ring, then the
// eight chapter markers light up and the AUDIRA plaque on the ring passes the lens.
import type { Key } from "./camera.ts";
import { CH, W } from "./core.tsx";
import { ringEraPos } from "./world.tsx";

export const COVER_POSE = { pos: [0.3, 13, 46] as [number, number, number], tgt: [0, 2, 0] as [number, number, number], fov: 28 };

export const keys00 = (): Key[] => {
  const ib = ringEraPos(284), zb = ringEraPos(159);
  return [
    { t: 0, ...COVER_POSE },
    { t: CH("c00").start + 0.2, ...COVER_POSE },
    { t: W("c00", "bukan", 0), pos: [5, 9, 30], tgt: [0, 2, 0], fov: 30 },
    { t: W("c00", "ulang"), pos: [-6, 5, 18], tgt: [-3, 1, 2], fov: 32 },
    { t: W("c00", "tanpa"), pos: [ib[0] + 3.0, 1.7, ib[2] + 4.2], tgt: [ib[0], 0.45, ib[2]], fov: 34 },
    { t: W("c00", "punya"), pos: [-9, 6, -3], tgt: [-1, 0.5, -7], fov: 34 },
    { t: W("c00", "tanah"), pos: [zb[0] + 1.5, 1.9, zb[2] + 4.0], tgt: [zb[0], 0.5, zb[2]], fov: 34 },
    { t: W("c00", "aswad"), pos: [4, 4, 6], tgt: [-1, 1, 1], fov: 34 },
    { t: W("c00", "tahun", 0), pos: [-2.9, 1.05, 3.5], tgt: [-1.8, 0.6, 1.5], fov: 34 },
    { t: W("c00", "sekarang"), pos: [-3, 4, 12], tgt: [0, 2, 0], fov: 32 },
    { t: W("c00", "seribu"), pos: [0.3, 9, 32], tgt: [0, 2.2, 0], fov: 30 },
    { t: CH("c00").end + 0.6, pos: [1.5, 11, 38], tgt: [0, 2, 0], fov: 30 },
    // intro
    { t: W("c01", "kenapa"), pos: [10, 6, 20], tgt: [0, 2, 0], fov: 32 },
    { t: W("c01", "diinginkan"), pos: [8, 9, 24], tgt: [0, 1.5, 0], fov: 32 },
    { t: W("c01", "delapan"), pos: [2, 24, 26], tgt: [0, 0, 0], fov: 34 },
    { t: W("c01", "kubus"), pos: [-2, 22, 24], tgt: [0, 0, 1], fov: 34 },
    { t: W("c01", "audira"), pos: [-3.4, 1.0, 14.9], tgt: [-4.6, 0.1, 11.9], fov: 32 },
    { t: W("c01", "jelas"), pos: [-2.6, 1.6, 16.4], tgt: [-4.4, 0.3, 11.9], fov: 32 },
  ];
};
