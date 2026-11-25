// Chapter 5 set pieces: the temporary prayer lot, the marble roof with its rows of worshippers,
// chilled air from the Ajyad station, and the escalator buildings that lift people to the roof.
import React, { useMemo } from "react";
import { glowMat, Wash, type useMats } from "./parts.tsx";
import { AJYAD, FAHD, S1, S1_IN } from "./layout.ts";
import { EscalatorFlow, RoofRows } from "./people.tsx";

export const S1_ROOF_Y = 3 * 0.17;

/** Roof rectangles of the Saudi I ring (for worshipper rows). */
export const S1_ROOFS = [
  { x0: S1.x0 + 0.05, x1: S1_IN.x1 + 0.6, z0: S1_IN.z1 + 0.05, z1: S1.z1 - 0.05 },
  { x0: S1.x0 + 0.05, x1: S1_IN.x0 - 0.05, z0: S1_IN.z0 + 0.05, z1: S1_IN.z1 - 0.05 },
  { x0: S1.x0 + 0.05, x1: S1_IN.x1 + 0.6, z0: S1.z0 + 0.05, z1: S1_IN.z0 - 0.05 },
];

export const PrayerLot: React.FC<{ vis: number }> = ({ vis }) => (
  <Wash pos={[(FAHD.x0 + FAHD.x1) / 2, 0.03, (FAHD.z0 + FAHD.z1) / 2]} size={[FAHD.x1 - FAHD.x0, FAHD.z1 - FAHD.z0]} color="#ffe2a8" opacity={0.3 * vis} />
);

export const RoofWorship: React.FC<{ vis: number; marble: number }> = ({ vis, marble }) => (
  <>
    {S1_ROOFS.map((r, i) => (
      <Wash key={i} pos={[(r.x0 + r.x1) / 2, S1_ROOF_Y + 0.006, (r.z0 + r.z1) / 2]} size={[r.x1 - r.x0, r.z1 - r.z0]} color="#ffffff" opacity={0.18 * marble} />
    ))}
    <RoofRows rects={S1_ROOFS} y={S1_ROOF_Y + 0.02} vis={vis} />
  </>
);

/** Chilled-air line from the Ajyad station to the west wing (dashes travel along it). */
export const Cooling: React.FC<{ vis: number; t: number; mats: ReturnType<typeof useMats> }> = ({ vis, t, mats }) => {
  const m = useMemo(() => glowMat("#7fe9ff", 3), []);
  const path: [number, number][] = [AJYAD, [-5.6, AJYAD[1]], [-5.9, FAHD.z1 + 0.05]];
  const segs: { x: number; z: number; ang: number }[] = [];
  for (let s = 0; s < path.length - 1; s++) {
    const [a, b] = [path[s], path[s + 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.round(len / 0.16);
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n;
      segs.push({ x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, ang: -Math.atan2(b[1] - a[1], b[0] - a[0]) });
    }
  }
  return (
    <group>
      {/* the station building */}
      <mesh material={mats.plaster} position={[AJYAD[0], 0.14, AJYAD[1] + 0.1]} castShadow receiveShadow><boxGeometry args={[0.9, 0.28, 0.6]} /></mesh>
      {vis > 0.01 &&
        segs.map((s, i) => {
          const on = (i / segs.length * 6 - t * 1.4) % 1;
          const k = ((on % 1) + 1) % 1 < 0.45 ? 1 : 0.15;
          return (
            <mesh key={i} material={m} position={[s.x, 0.05, s.z]} rotation={[0, s.ang, 0]} scale={[k * vis, 1, 1]}>
              <boxGeometry args={[0.1, 0.012, 0.035]} />
            </mesh>
          );
        })}
    </group>
  );
};

/** Two escalator buildings beside the west wing, with people riding up to the roof. */
export const Escalators: React.FC<{ rise: number; flow: number; t: number; mats: ReturnType<typeof useMats> }> = ({ rise, flow, t, mats }) => {
  const stripe = useMemo(() => glowMat("#ffd166", 1.6), []);
  if (rise <= 0.002) return null;
  const spots: [number, number][] = [[FAHD.x0 + 0.9, FAHD.z1 + 0.42], [FAHD.x0 + 0.9, FAHD.z0 - 0.42]];
  return (
    <>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} scale={[1, rise, 1]}>
          <mesh material={mats.plaster} position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.6, 0.34]} /></mesh>
          <mesh material={stripe} position={[0, 0.3, i ? -0.172 : 0.172]} rotation={[0, 0, 0.85]}><boxGeometry args={[0.6, 0.02, 0.004]} /></mesh>
        </group>
      ))}
      <EscalatorFlow t={t} vis={flow * rise} from={[FAHD.x0 + 0.65, 0.03, FAHD.z1 + 0.62]} to={[FAHD.x0 + 1.15, 0.62, FAHD.z1 + 0.62]} />
    </>
  );
};
