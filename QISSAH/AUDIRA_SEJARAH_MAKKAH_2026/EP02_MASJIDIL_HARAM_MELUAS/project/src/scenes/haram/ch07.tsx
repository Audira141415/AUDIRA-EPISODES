// Chapter 6 set pieces: the northern clearance zone, the temporary ring bridge around the mataf
// (dismantled segment by segment in 2016) and the stepped Riwaq Saudi around the old riwaq.
import React, { useMemo } from "react";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Outline, Wash, type Rect, type useMats } from "./parts.tsx";
import { OTT, S3 } from "./layout.ts";
import { BridgeFlow } from "./people.tsx";

export const S3Zone: React.FC<{ vis: number }> = ({ vis }) => (
  <>
    <Wash pos={[(S3.x0 + S3.x1) / 2, 0.05, (S3.z0 + S3.z1) / 2]} size={[S3.x1 - S3.x0, S3.z1 - S3.z0]} color="#ffb347" opacity={0.08 * vis} />
    <Outline {...S3} y={0.04} color="#ffb347" k={2.6 * vis} w={0.06} visible={vis > 0.01} />
  </>
);

const SEG = 28;
export const RingBridge: React.FC<{ vis: number; gone: number; t: number; mats: ReturnType<typeof useMats> }> = ({ vis, gone, t, mats }) => {
  if (vis <= 0.01 || gone >= 0.999) return null;
  const r0 = 1.18, r1 = 1.5, y = 0.3;
  const segs = Array.from({ length: SEG }, (_, i) => i);
  return (
    <group scale={[1, Math.max(0.01, vis), 1]}>
      {segs.map((i) => {
        // dismantle order: alternating around the ring
        const order = ((i * 11) % SEG) / SEG;
        const k = Math.min(1, Math.max(0, (gone - order * 0.85) / 0.15));
        if (k >= 1) return null;
        const a = ((i + 0.5) / SEG) * Math.PI * 2;
        const lift = k * 0.6;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <group position={[(r0 + r1) / 2, y + lift, 0]}>
              <mesh material={mats.plaster} castShadow receiveShadow><boxGeometry args={[r1 - r0, 0.035, ((Math.PI * 2 * (r0 + r1)) / 2 / SEG) * 1.02]} /></mesh>
              <mesh material={mats.plaster} position={[(r1 - r0) / 2, 0.04, 0]}><boxGeometry args={[0.012, 0.05, ((Math.PI * 2 * r1) / SEG) * 0.98]} /></mesh>
            </group>
            {i % 2 === 0 && (
              <mesh material={mats.plaster} position={[(r0 + r1) / 2, (y + lift) / 2, 0]} castShadow><cylinderGeometry args={[0.022, 0.026, y - 0.02, 8]} /></mesh>
            )}
          </group>
        );
      })}
      <BridgeFlow t={t} vis={vis} r0={r0 + 0.04} r1={r1 - 0.04} y={y + 0.03} gone={gone} />
    </group>
  );
};

/** Riwaq Saudi: four stepped tiers wrapping the historic riwaq ("a three-tier cake" around the mataf). */
export const RiwaqSaudi: React.FC<{ rise: number; mats: ReturnType<typeof useMats>; glow: number }> = ({ rise, mats, glow }) => {
  const tiers = useMemo(() => [0, 1, 2, 3].map((i) => ({ o: 0.06 + 0.17 * i, h: 0.15 * (i + 1) })), []);
  if (rise <= 0.002) return null;
  const outer = 0.76;
  const ring = (R: Rect, o0: number, o1: number) => {
    const a = { x0: R.x0 - o1, x1: R.x1 + o1, z0: R.z0 - o1, z1: R.z1 + o1 };
    const b = { x0: R.x0 - o0, x1: R.x1 + o0, z0: R.z0 - o0, z1: R.z1 + o0 };
    return [
      { x: (a.x0 + a.x1) / 2, z: (a.z0 + b.z0) / 2, sx: a.x1 - a.x0, sz: b.z0 - a.z0 },
      { x: (a.x0 + a.x1) / 2, z: (a.z1 + b.z1) / 2, sx: a.x1 - a.x0, sz: a.z1 - b.z1 },
      { x: (a.x0 + b.x0) / 2, z: (b.z0 + b.z1) / 2, sx: b.x0 - a.x0, sz: b.z1 - b.z0 },
      { x: (a.x1 + b.x1) / 2, z: (b.z0 + b.z1) / 2, sx: a.x1 - b.x1, sz: b.z1 - b.z0 },
    ];
  };
  return (
    <group scale={[1, Math.max(0.002, rise), 1]}>
      {tiers.map((tr, i) =>
        ring(OTT, tr.o, outer).map((p, j) => (
          <mesh key={`${i}-${j}`} material={mats.plaster} position={[p.x, tr.h - 0.075, p.z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[p.sx, 0.15 - 0.02, p.sz]} radius={0.01} segments={2} />
          </mesh>
        )),
      )}
      <mesh material={mats.core} position={[0, 0.3, 0]} visible={false}><boxGeometry args={[0.1, 0.1, 0.1]} /></mesh>
      <Outline x0={OTT.x0 - outer} x1={OTT.x1 + outer} z0={OTT.z0 - outer} z1={OTT.z1 + outer} y={0.61} color="#36c8ff" k={1.4 + 3 * glow} />
      <Wash pos={[0, 0.605, OTT.z0 - outer / 2 - 0.12]} size={[OTT.x1 - OTT.x0 + 2 * outer, 0.4]} color="#36c8ff" opacity={0.14} />
    </group>
  );
};
