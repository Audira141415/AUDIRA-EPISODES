// Chapter 3 (c04): why the Hijr is outside — on today's Ka'bah. A plan view lays Ibrahim's
// foundation line over the building; the part left outside lights up as the Hijr; brass rulers
// show the ~6 hasta width, the ~1.3 m marble wall and the raised door; ghost outlines show the two
// ground-level doors (east and west) that were wished for.
import React from "react";
import type { Key } from "./camera.ts";
import { C, CH, Glow, GroundOutline, W, type V3, ramp, window01 } from "./core.tsx";

const KW = 3.6, KD = 3.0, BASE = 0.13;
const DOOR_X = -0.62;

export const keys04 = (): Key[] => [
  { t: CH("c03").end + 0.7, pos: [10, 14, 22], tgt: [0, 1.5, 0], fov: 34 },
  { t: W("c04", "kecil"), pos: [8, 12, 14], tgt: [0.5, 0.5, 0], fov: 32 },
  { t: W("c04", "ibrahim"), pos: [4, 17, 6], tgt: [0.6, 0, 0], fov: 32 },
  { t: W("c04", "aisyah"), pos: [9.5, 4.5, 6.5], tgt: [2.4, 0.5, 0], fov: 32 },
  { t: W("c04", "baitullah"), pos: [8.5, 5, 4.5], tgt: [2.4, 0.4, 0], fov: 32 },
  { t: W("c04", "hijr"), pos: [2.2, 17.5, 2.2], tgt: [1.6, 0, 0], fov: 30 },
  { t: W("c04", "enam"), pos: [2.4, 15.5, 2.6], tgt: [2.0, 0, 0], fov: 30 },
  { t: W("c04", "dinding", 1), pos: [6.8, 1.0, 3.6], tgt: [3.6, 0.3, 0.6], fov: 34 },
  { t: W("c04", "puluh"), pos: [6.4, 0.9, 3.2], tgt: [3.6, 0.3, 0.5], fov: 34 },
  { t: W("c04", "pintu"), pos: [0.4, 2.2, 8.4], tgt: [-0.6, 1.1, 1.5], fov: 34 },
  { t: W("c04", "mengejutkan"), pos: [-1.4, 1.6, 6.8], tgt: [-0.6, 1.0, 1.5], fov: 34 },
  { t: W("c04", "menyaring"), pos: [-0.3, 1.2, 6.0], tgt: [-0.6, 0.8, 1.5], fov: 34 },
  { t: W("c04", "membangunnya"), pos: [6, 9, 11], tgt: [0.4, 0.6, 0], fov: 32 },
  { t: W("c04", "timur"), pos: [3.5, 6, 9.5], tgt: [0, 0.6, 0.5], fov: 32 },
  { t: W("c04", "barat"), pos: [7, 8, -2], tgt: [0, 0.6, -0.8], fov: 32 },
  { t: W("c04", "jahiliah"), pos: [6, 11, 16], tgt: [0, 1.5, 0], fov: 32 },
];

/** Brass ruler with end ticks between two points (glowing core so it reads in plan view). */
export const Ruler: React.FC<{ a: V3; b: V3; op: number; c?: string }> = ({ a, b, op, c = C.brass }) => {
  if (op <= 0.001) return null;
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const vertical = Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) + Math.abs(b[2] - a[2]);
  const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[2] - a[2]);
  const s: V3 = vertical ? [0.03, len * op, 0.03] : alongX ? [len * op, 0.03, 0.03] : [0.03, 0.03, len * op];
  return (
    <group>
      <Glow s={s} p={mid} c={c === C.brass ? C.warmGlow : c} op={op} />
      <Glow s={vertical ? [0.2, 0.02, 0.02] : [0.02, 0.2, 0.2]} p={a} c={C.warmGlow} op={op} />
      <Glow s={vertical ? [0.2, 0.02, 0.02] : [0.02, 0.2, 0.2]} p={b} c={C.warmGlow} op={op} />
    </group>
  );
};

export const hijrGlowOf = (t: number) => window01(t, W("c04", "hijr"), W("c04", "barat") + 2, 0.8, 1.5) + window01(t, W("c10", "dinding"), W("c10", "terlihat") + 1.5, 0.8, 1.2);

export const HijrChapter: React.FC<{ t: number }> = ({ t }) => {
  const outline = window01(t, W("c04", "fondasi"), W("c04", "jahiliah") + 1, 0.8, 1.2);
  const width = window01(t, W("c04", "enam"), W("c04", "dinding", 1) + 0.5, 0.6, 0.6);
  const wall = window01(t, W("c04", "dinding", 1), W("c04", "aisyah", 1), 0.6, 0.6);
  const door = window01(t, W("c04", "pintu"), W("c04", "masuk") + 1.2, 0.6, 0.8);
  const east = window01(t, W("c04", "dua"), W("c04", "jahiliah") + 1, 0.6, 1.2);
  const west = window01(t, W("c04", "barat"), W("c04", "jahiliah") + 1, 0.6, 1.2);
  return (
    <group>
      {/* Ibrahim's foundation line over today's building (it includes the Hijr area) */}
      <GroundOutline w={KW + 0.9} d={KD} x={0.45} y={0.02} op={outline} t={0.06} />
      {/* ~6 hasta: from the wall to the foundation line */}
      <Ruler a={[KW / 2 + 0.05, 0.05, -0.9]} b={[KW / 2 + 0.95, 0.05, -0.9]} op={width} />
      {/* ~1.3 m marble wall */}
      <Ruler a={[KW / 2 + 2.55, 0.0, 0.0]} b={[KW / 2 + 2.55, 0.4, 0.0]} op={wall} />
      {/* raised door: ground to threshold */}
      <Ruler a={[DOOR_X + 0.5, BASE, KD / 2 + 0.12]} b={[DOOR_X + 0.5, BASE + 0.68, KD / 2 + 0.12]} op={door} />
      {/* wished-for ground doors, east (+z) and west (-z) */}
      {[
        { z: KD / 2 + 0.07, op: east },
        { z: -KD / 2 - 0.07, op: west },
      ].map((g, i) => (
        <group key={i} position={[DOOR_X, BASE, g.z]}>
          <Glow s={[0.6, 0.03, 0.03]} p={[0, 0.0, 0]} op={g.op} />
          <Glow s={[0.6, 0.03, 0.03]} p={[0, 0.95, 0]} op={g.op} />
          <Glow s={[0.03, 0.95, 0.03]} p={[-0.3, 0.475, 0]} op={g.op} />
          <Glow s={[0.03, 0.95, 0.03]} p={[0.3, 0.475, 0]} op={g.op} />
          <Glow s={[0.56, 0.92, 0.01]} p={[0, 0.475, 0]} op={g.op * 0.22} />
        </group>
      ))}
    </group>
  );
};
void ramp;
