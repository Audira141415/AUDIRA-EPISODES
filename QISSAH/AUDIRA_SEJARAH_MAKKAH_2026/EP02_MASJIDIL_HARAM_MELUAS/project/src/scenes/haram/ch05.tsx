// Chapter 4 set pieces: the sa'i street as a market, then the two-storey Mas'a (cutaway, open top).
import React, { useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { glowMat, type useMats } from "./parts.tsx";
import { MASA } from "./layout.ts";
import { SaiFlow } from "./people.tsx";

const STALLS = (() => {
  const r = prng(77);
  const out: { z: number; side: number; w: number; tent: boolean; h: number }[] = [];
  for (let z = MASA.z0 + 0.15; z < MASA.z1 - 0.1; z += 0.19) {
    for (const side of [-1, 1]) if (r() > 0.18) out.push({ z: z + (r() - 0.5) * 0.05, side, w: 0.12 + r() * 0.05, tent: r() > 0.45, h: 0.04 + r() * 0.04 });
  }
  return out;
})();

export const Market: React.FC<{ vis: number; t: number; mats: ReturnType<typeof useMats> }> = ({ vis, t, mats }) => {
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f3ede0", roughness: 0.85, side: THREE.DoubleSide }), []);
  if (vis <= 0.01) return null;
  return (
    <group scale={[1, Math.max(0.01, vis), 1]}>
      {STALLS.map((s, i) => (
        <group key={i} position={[MASA.x + s.side * 0.21, 0, s.z]}>
          <mesh material={mats.clay} position={[0, s.h / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.09, s.h, s.w]} /></mesh>
          {/* sacks / crates */}
          <mesh material={mats.stone} position={[-s.side * 0.065, 0.015, 0.02]} castShadow><sphereGeometry args={[0.018, 8, 6]} /></mesh>
          {s.tent && (
            <mesh material={cloth} position={[-s.side * 0.05, s.h + 0.05, 0]} rotation={[0, 0, s.side * 0.5]} castShadow>
              <planeGeometry args={[0.16, s.w * 1.05]} />
            </mesh>
          )}
        </group>
      ))}
      <SaiFlow t={t} x={MASA.x} z0={MASA.z0} z1={MASA.z1} y={0.02} width={0.22} vis={0.55} />
    </group>
  );
};

/** Mas'a corridor: walls and floors, open top so the two-way flow and the divider stay visible. */
export const Masa: React.FC<{ rise: number; wide: number; divider: number; t: number; mats: ReturnType<typeof useMats> }> = ({ rise, wide, divider, t, mats }) => {
  const div = useMemo(() => glowMat("#5fe3f0", 0), []);
  div.emissiveIntensity = 1.2 + 3 * divider;
  if (rise <= 0.002) return null;
  const W = 0.6 + 0.55 * wide;
  const floors = wide > 0.5 ? 4 : 2;
  const fh = 0.2;
  const H = (2 + 2 * wide) * fh * rise;
  const L = MASA.z1 - MASA.z0;
  const cx = MASA.x + (W - 0.6) / 2;
  const cz = (MASA.z0 + MASA.z1) / 2;
  const top = (floors - 1) * fh * (2 + 2 * wide) / floors * rise;
  return (
    <group>
      {/* side walls with storey grooves */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          {Array.from({ length: floors }, (_, i) => (
            <mesh key={i} material={mats.plaster} position={[cx + sd * (W / 2 - 0.02), (H / floors) * (i + 0.5), cz]} castShadow receiveShadow>
              <boxGeometry args={[0.04, H / floors - 0.02, L]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* floors */}
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={`f${i}`} material={i === floors - 1 ? mats.marble : mats.plaster} position={[cx, (H / floors) * i + 0.01, cz]} receiveShadow castShadow>
          <boxGeometry args={[W - 0.06, 0.02, L]} />
        </mesh>
      ))}
      {/* end domes: Safa (south) and Marwah (north) */}
      {[MASA.z1 + 0.12, MASA.z0 - 0.12].map((z, i) => (
        <group key={`d${i}`} position={[cx, 0, z]}>
          <mesh material={mats.plaster} position={[0, H / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, H, 0.3]} /></mesh>
          <mesh material={mats.plaster} position={[0, H, 0]} castShadow><sphereGeometry args={[W * 0.36, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        </group>
      ))}
      {/* centre divider for the two directions */}
      <mesh material={div} position={[cx, top + 0.035, cz]}><boxGeometry args={[0.025, 0.05, L * 0.98]} /></mesh>
      <SaiFlow t={t} x={cx} z0={MASA.z0} z1={MASA.z1} y={top + 0.03} width={W - 0.12} vis={0.5 + 0.5 * wide} />
    </group>
  );
};
