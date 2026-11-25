// Chapter 6 (c07): twenty-two years without the Black Stone. Non-graphic: the crowd of points dims,
// the corner becomes an empty dark niche inside its silver frame while the dots keep circling; at the
// Kufah station a parchment map draws the return route, a column of seven holds the hanging sack and
// the letter, coins stand for the refused 50,000 dinar; back at the corner eight small fragments
// gather into the silver frame.
import React, { useMemo } from "react";
import type { Key } from "./camera.ts";
import { prng } from "../../core/materials/textures.ts";
import { Box, C, CH, Plinth, W, type V3, mix, ramp, window01 } from "./core.tsx";
import { CITY, MapTable, Route } from "./ch06.tsx";
import { At, L } from "./world.tsx";

const S = "kufah" as const;
export const CORNER: V3 = [-1.82, 0.6, 1.52];
const MAP: V3 = [-2.4, 0.92, 0.4];

export const keys07 = (): Key[] => [
  { t: W("c07", "abad"), pos: [9, 9, 22], tgt: [0, 1.5, 0], fov: 32 },
  { t: W("c07", "tahun"), pos: [5, 5.5, 14], tgt: [0, 1.5, 0], fov: 32 },
  { t: W("c07", "tarwiyah"), pos: [0.5, 7.5, 12], tgt: [0, 0.5, 0], fov: 32 },
  { t: W("c07", "thahir"), pos: [-4, 5, 11], tgt: [-0.5, 0.8, 0.5], fov: 32 },
  { t: W("c07", "pintu"), pos: [-4.2, 3, 8], tgt: [-1.6, 1.0, 1.5], fov: 32 },
  { t: W("c07", "hajar"), pos: [-2.9, 1.0, 3.4], tgt: CORNER, fov: 34 },
  { t: W("c07", "dibawa"), pos: [-3.3, 1.3, 4.3], tgt: CORNER, fov: 34 },
  { t: W("c07", "jamaah", 2), pos: [-6.2, 4, 10], tgt: [-1, 0.6, 0.5], fov: 32 },
  { t: W("c07", "sudut", 0), pos: [-2.7, 0.95, 3.1], tgt: CORNER, fov: 34 },
  { t: W("c07", "emir"), pos: [8, 12, 26], tgt: [10, 1, 20], fov: 34 },
  { t: W("c07", "menawarkan"), pos: L(S, [1.8, 2.6, 5.4]), tgt: L(S, [1.6, 0.9, 1.4]), fov: 32 },
  { t: W("c07", "ditolak"), pos: L(S, [1.3, 2.2, 4.4]), tgt: L(S, [1.6, 0.85, 1.4]), fov: 34 },
  { t: W("c07", "tahun", 1), pos: L(S, [-2.4, 4.4, 4.9]), tgt: L(S, MAP), fov: 32 },
  { t: W("c07", "muncul"), pos: L(S, [-2.0, 3.7, 4.1]), tgt: L(S, MAP), fov: 32 },
  { t: W("c07", "digantung"), pos: L(S, [5.2, 2.6, 3.6]), tgt: L(S, [3.6, 2.2, -2.6]), fov: 32 },
  { t: W("c07", "kami"), pos: L(S, [4.4, 1.9, 0.9]), tgt: L(S, [3.6, 1.7, -2.4]), fov: 34 },
  { t: W("c07", "menurut"), pos: L(S, [-1.2, 3.8, 5.6]), tgt: L(S, MAP), fov: 32 },
  { t: W("c07", "totalnya"), pos: L(S, [0, 6.5, 13]), tgt: L(S, [0.5, 1.2, -1]), fov: 32 },
  { t: W("c07", "batu", 3), pos: [-3.4, 1.4, 4.4], tgt: CORNER, fov: 34 },
  { t: W("c07", "bingkai"), pos: [-2.6, 0.95, 3.0], tgt: CORNER, fov: 34 },
  { t: W("c07", "al-kurdi"), pos: [-2.55, 0.9, 2.85], tgt: CORNER, fov: 34 },
  { t: W("c07", "seukuran"), pos: [-2.7, 1.0, 3.2], tgt: CORNER, fov: 34 },
  { t: CH("c07").end, pos: [-3.4, 1.4, 4.6], tgt: CORNER, fov: 34 },
];

export const mainOf07 = (t: number) => {
  const empty = t > W("c07", "dicungkil") && t < W("c07", "perak");
  return {
    hajar: (empty ? "empty" : "frame") as "empty" | "frame",
    crowdDim: window01(t, W("c07", "qaramithah"), W("c07", "jamaah", 2) + 1.5, 1.2, 1.5) * 0.65,
    cool: window01(t, W("c07", "qaramithah"), W("c07", "jamaah", 2) + 1.5, 1.2, 1.5) * 0.35,
  };
};

/** Eight small fragments gathering into the silver frame (corner of today's Ka'bah). */
export const Fragments: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("c07", "pecah"), W("c07", "perak") + 0.2);
  const show = t > W("c07", "pecah") - 0.2 && t < W("c07", "perak") + 0.3;
  const pieces = useMemo(() => {
    const rnd = prng(81);
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + rnd() * 0.3;
      return { home: [Math.cos(a) * 0.045 * (i % 2 ? 1 : 0.4), Math.sin(a) * 0.045 * (i % 2 ? 1 : 0.4), 0.01] as V3, far: [Math.cos(a) * 0.32, Math.sin(a) * 0.26 + 0.05, 0.18 + rnd() * 0.12] as V3, s: i === 0 ? 0.034 : 0.02 + rnd() * 0.012 };
    });
  }, []);
  if (!show) return null;
  return (
    <group position={CORNER} rotation={[0, -Math.PI / 4, 0]}>
      {pieces.map((p, i) => (
        <mesh key={i} position={[mix(p.far[0], p.home[0], k), mix(p.far[1], p.home[1], k), mix(p.far[2], p.home[2], k)]} scale={[p.s, p.s * 0.8, p.s * 0.6]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color="#1c1816" roughness={0.3} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Colonnade: React.FC<{ t: number }> = ({ t }) => {
  const sack = ramp(t, W("c07", "digantung") - 0.5, W("c07", "kufah"));
  return (
    <group position={[0, 0, -2.6]}>
      {Array.from({ length: 7 }, (_, i) => {
        const x = -3.6 + i * 1.2;
        const seventh = i === 6;
        return (
          <group key={i} position={[x, 0, 0]}>
            <Box s={[0.42, 0.2, 0.42]} p={[0, 0.1, 0]} c="#d9cbb3" rough={0.7} radius={0.03} />
            <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.17, 2.9, 24]} />
              <meshPhysicalMaterial color={seventh ? "#e6d9c2" : "#d9cbb3"} roughness={0.6} emissive={seventh ? "#ffcf86" : "#000000"} emissiveIntensity={seventh ? 0.12 * sack : 0} />
            </mesh>
            <Box s={[0.44, 0.18, 0.44]} p={[0, 3.18, 0]} c="#d9cbb3" rough={0.7} radius={0.03} />
          </group>
        );
      })}
      <Box s={[8.0, 0.3, 0.6]} p={[0, 3.42, 0]} c="#cdbd9f" rough={0.75} radius={0.04} />
      {/* arches between the columns */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-3.0 + i * 1.2, 2.75, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.45, 0.07, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#cdbd9f" roughness={0.75} />
        </mesh>
      ))}
      {/* the sack hanging on the seventh column, with the letter */}
      {sack > 0.001 ? (
        <group position={[3.6, 0, 0.26]}>
          <mesh position={[0, 2.95 - 0.2 * (1 - sack), 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
            <meshStandardMaterial color="#8a7350" />
          </mesh>
          <mesh position={[0, 2.55 + 0.4 * (1 - sack), 0.06]} scale={[0.22, 0.3, 0.2]} castShadow>
            <sphereGeometry args={[1, 24, 16]} />
            <meshPhysicalMaterial color="#cbb894" roughness={0.95} sheen={0.6} />
          </mesh>
          <Box s={[0.22, 0.3, 0.01]} p={[0, 1.75, 0.18]} c="#f1e7d2" rough={0.9} radius={0.004} />
          <mesh position={[0, 1.86, 0.19]}>
            <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
            <meshStandardMaterial color="#8e2a22" roughness={0.5} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

const Coins: React.FC<{ t: number }> = ({ t }) => {
  const up = ramp(t, W("c07", "menawarkan"), W("c07", "dinar") + 0.3);
  const refused = ramp(t, W("c07", "ditolak"), W("c07", "ditolak") + 0.8);
  return (
    <group position={[1.6, 0, 1.4]}>
      <Box s={[1.4, 0.8, 0.8]} p={[0, 0.4, 0]} c="#6e4a2b" rough={0.55} radius={0.03} />
      {Array.from({ length: 5 }, (_, s) => (
        <group key={s} position={[-0.45 + s * 0.22, 0.81, (s % 2) * 0.12 - 0.06]}>
          {Array.from({ length: Math.round(6 * up) + 1 }, (_, i) => (
            <mesh key={i} position={[0, 0.012 + i * 0.022, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.018, 24]} />
              <meshPhysicalMaterial color="#d8b25a" metalness={1} roughness={0.25 + 0.4 * refused} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export const Kufah: React.FC<{ t: number }> = ({ t }) => {
  const r1 = ramp(t, W("c07", "baru"), W("c07", "muncul"));
  const r2 = ramp(t, W("c07", "kami"), W("c07", "tebusan", 0));
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[7.1, 96]} />
        <meshStandardMaterial color="#e8dccb" roughness={0.7} />
      </mesh>
      <Colonnade t={t} />
      <Coins t={t} />
      <MapTable p={MAP}>
        <Route pts={[[...CITY.ahsa], [47, 29.5], [...CITY.kufah]]} k={r1} c={C.accent} />
        <Route pts={[[...CITY.kufah], [42, 27], [...CITY.makkah]]} k={r2} />
      </MapTable>
    </At>
  );
};
