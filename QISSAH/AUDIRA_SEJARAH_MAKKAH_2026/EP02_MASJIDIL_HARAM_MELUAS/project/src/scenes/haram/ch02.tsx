// Chapter 1 set pieces: Umar's low wall + lamps, the Sail Umm Nahsyal flood and his dam.
import React, { useMemo } from "react";
import { glowMat, Outline, Wash, type Rect, type useMats } from "./parts.tsx";
import { FP } from "./layout.ts";

/** Low wall on the current footprint edge (Umar onwards, until the riwaq's own outer wall takes over). */
export const LowWall: React.FC<{ R: Rect; vis: number; lamps: number; mats: ReturnType<typeof useMats> }> = ({ R, vis, lamps, mats }) => {
  const lamp = useMemo(() => glowMat("#ffcf7a", 0), []);
  lamp.emissiveIntensity = 3.4 * lamps;
  if (vis <= 0.01) return null;
  const h = 0.085 * vis, th = 0.035;
  const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2, lx = R.x1 - R.x0, lz = R.z1 - R.z0;
  const per = 2 * (lx + lz);
  const n = Math.round(per / 0.22);
  return (
    <group>
      <mesh material={mats.warm} position={[cx, h / 2, R.z0]} castShadow receiveShadow><boxGeometry args={[lx + th, h, th]} /></mesh>
      <mesh material={mats.warm} position={[cx, h / 2, R.z1]} castShadow receiveShadow><boxGeometry args={[lx + th, h, th]} /></mesh>
      <mesh material={mats.warm} position={[R.x0, h / 2, cz]} castShadow receiveShadow><boxGeometry args={[th, h, lz]} /></mesh>
      <mesh material={mats.warm} position={[R.x1, h / 2, cz]} castShadow receiveShadow><boxGeometry args={[th, h, lz]} /></mesh>
      {lamps > 0.01 &&
        Array.from({ length: n }, (_, i) => {
          let d = (i / n) * per;
          let x = R.x0, z = R.z0;
          if (d < lx) x = R.x0 + d;
          else if ((d -= lx) < lz) { x = R.x1; z = R.z0 + d; }
          else if ((d -= lz) < lx) { x = R.x1 - d; z = R.z1; }
          else { d -= lx; z = R.z1 - d; }
          return (
            <mesh key={i} material={lamp} position={[x, h + 0.018, z]}>
              <sphereGeometry args={[0.012, 6, 5]} />
            </mesh>
          );
        })}
    </group>
  );
};

/** Flood as projected light: a cyan sheet sweeping in from the north; Umar's dam stops it. */
export const Flood: React.FC<{ flood: number; dam: number; mats: ReturnType<typeof useMats>; t: number }> = ({ flood, dam, mats, t }) => {
  const front = -6.5 + 10 * flood;
  const stop = -1.5;
  const f = dam > 0.05 ? Math.min(front, stop + (front - stop) * (1 - dam)) : front;
  const z0 = -7.5;
  const len = Math.max(0.01, f - z0);
  const shimmer = 0.24 + 0.04 * Math.sin(t * 2.1);
  return (
    <group>
      {flood > 0.01 && (
        <>
          <Wash pos={[0, 0.05, z0 + len / 2]} size={[9, len]} color="#43c6ff" opacity={shimmer * Math.min(1, flood * 2)} />
          <Wash pos={[0, 0.055, f - 0.15]} size={[9, 0.3]} color="#bff1ff" opacity={0.35 * Math.min(1, flood * 2)} />
        </>
      )}
      {dam > 0.01 && (
        <mesh material={mats.warm} position={[0, (0.1 * dam) / 2, stop - 0.05]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.1 * dam, 0.06]} />
        </mesh>
      )}
    </group>
  );
};

/** The initial courtyard (±1.500 m²) traced in light. */
export const InitRing: React.FC<{ k: number }> = ({ k }) => <Outline {...FP[0]} y={0.03} color="#ffb347" k={k * 3.2} w={0.04} visible={k > 0.01} />;
