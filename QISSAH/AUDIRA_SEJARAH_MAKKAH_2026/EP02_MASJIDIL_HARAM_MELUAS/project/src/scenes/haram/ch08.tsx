// Chapter 7: the historic riwaq as a museum catalogue. Numbered columns lift out, lie in a row on
// the plaza and go back (the stated plan); the Isra' column is marked and removed. Neutral light.
import React, { useMemo } from "react";
import { columnPositions, ARC_H } from "./arcade.tsx";
import { glowMat, Label3D, type useMats } from "./parts.tsx";
import { BAND, OTT } from "./layout.ts";
import { smooth } from "./tl.ts";

export const CAT_E = Array.from({ length: 12 }, (_, i) => i + 8);
export const ISRA_S = 9;
export const SKIP_E = new Set(CAT_E);
export const SKIP_S = new Set([ISRA_S]);

export const Heritage: React.FC<{ catalogue: number; tags: number; oldest: number; isra: number; labels: number; mats: ReturnType<typeof useMats> }> = ({
  catalogue, tags, oldest, isra, labels, mats,
}) => {
  const amber = useMemo(() => glowMat("#ffb347", 3), []);
  const cyan = useMemo(() => glowMat("#9ff3e6", 2.5), []);
  const east = columnPositions(OTT, BAND, "E");
  const south = columnPositions(OTT, BAND, "S");
  const old = east[3];
  return (
    <group>
      {CAT_E.map((idx, j) => {
        const [x, z] = east[idx];
        const k = smooth(Math.min(1, Math.max(0, catalogue * 1.3 - j * 0.025)));
        const tx = OTT.x1 - BAND - 0.4, tz = -1.55 + j * 0.28;
        const lift = Math.sin(k * Math.PI) * 0.5;
        const px = x + (tx - x) * k, pz = z + (tz - z) * k;
        const py = ARC_H / 2 * (1 - k) + 0.03 * k + lift;
        return (
          <group key={idx}>
            <mesh material={mats.marble} position={[px, py, pz]} rotation={[0, 0, (Math.PI / 2) * k]} castShadow>
              <cylinderGeometry args={[0.017, 0.02, ARC_H, 10]} />
            </mesh>
            {k > 0.6 && <mesh material={cyan} position={[tx, 0.012, tz]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, 0.012]} /></mesh>}
            <Label3D text={String(j + 1).padStart(2, "0")} pos={[px + 0.13 * k, 0.07 + (ARC_H + 0.12) * (1 - k), pz]} w={0.12} opacity={tags * k} billboard />
          </group>
        );
      })}
      {/* oldest column (167 H) */}
      {oldest > 0.01 && <mesh material={amber} position={[old[0], 0.015, old[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={oldest}><ringGeometry args={[0.04, 0.06, 28]} /></mesh>}
      {/* the Isra' column: marked, then lifted away */}
      {(() => {
        const [x, z] = south[ISRA_S];
        if (isra >= 0.999) return null;
        const up = smooth(Math.max(0, isra - 0.35) / 0.65);
        return (
          <group>
            <mesh material={mats.marble} position={[x, ARC_H / 2 + up * 0.9, z]} scale={[1, 1, 1]} castShadow>
              <cylinderGeometry args={[0.017, 0.02, ARC_H, 10]} />
            </mesh>
            {isra > 0.01 && <mesh material={amber} position={[x, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.04, 0.06, 28]} /></mesh>}
            {isra > 0.01 && <mesh material={amber} position={[x, ARC_H + 0.35, z]}><cylinderGeometry args={[0.005, 0.005, 0.6, 6]} /></mesh>}
            {isra > 0.01 && <Label3D text="TIANG AWAL ISRA'" pos={[x, ARC_H + 0.72, z]} w={0.5} billboard />}
          </group>
        );
      })()}
      {/* the riwaq's two names, as museum tags on its roof */}
      <Label3D text="RIWAQ ABBASI" sub="al-Mahdi · 167 H" pos={[0, ARC_H + 0.16, OTT.z0 + BAND / 2]} w={0.75} opacity={labels} billboard />
      <Label3D text="RIWAQ UTSMANI" sub="Selim II – Murad III · ±1576" pos={[OTT.x1 - BAND / 2, ARC_H + 0.16, 0]} w={0.75} opacity={labels} billboard />
    </group>
  );
};
