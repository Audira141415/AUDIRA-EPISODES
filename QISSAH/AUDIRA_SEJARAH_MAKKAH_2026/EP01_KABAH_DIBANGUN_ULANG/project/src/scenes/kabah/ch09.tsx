// Chapter 8 (c09): the 1996 renovation and the Ka'bah today — a glass study model (not the real
// building opened up): 1996 scaffold, marble floor, three wooden pillars, the double roof with its
// gap, the stair room of Bab At-Taubah in the north corner, ten marble inscriptions, the raised door.
// Then the gold door of today's Ka'bah in close-up.
import React from "react";
import type { Key } from "./camera.ts";
import { Box, C, CH, Glow, KabahModel, Plinth, W, mix, ramp, window01 } from "./core.tsx";
import { At, L } from "./world.tsx";

const S = "ghost" as const;
const KW = 3.6, KD = 3.0, H = 4.5, BASE = 0.13;

export const keys09 = (): Key[] => [
  { t: W("c09", "terjadi"), pos: [-12, 12, 26], tgt: L(S, [0, 2, 0]), fov: 34 },
  { t: W("c09", "november"), pos: L(S, [0, 8, 18]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c09", "fahd"), pos: L(S, [5, 5.4, 12]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c09", "atap", 0), pos: L(S, [3, 7.4, 8.4]), tgt: L(S, [0, 4.2, 0]), fov: 32 },
  { t: W("c09", "prasasti"), pos: L(S, [-1.2, 3.2, 6.4]), tgt: L(S, [0, 2.2, -1]), fov: 32 },
  { t: W("c09", "sepuluh", 0), pos: L(S, [2.2, 3.2, 7.4]), tgt: L(S, [0, 2.2, -0.5]), fov: 32 },
  { t: W("c09", "ukurannya"), pos: L(S, [7, 7.5, 12.5]), tgt: L(S, [0, 2.2, 0]), fov: 32 },
  { t: W("c09", "tinggi"), pos: L(S, [-7.5, 3.8, 9.5]), tgt: L(S, [0, 2.3, 0]), fov: 32 },
  { t: W("c09", "tiang"), pos: L(S, [1.6, 3.0, 5.6]), tgt: L(S, [0, 2.0, 0]), fov: 34 },
  { t: W("c09", "lapis"), pos: L(S, [2.2, 5.6, 4.8]), tgt: L(S, [0, 4.25, 0]), fov: 34 },
  { t: W("c09", "utara"), pos: L(S, [4.4, 3.6, 4.6]), tgt: L(S, [1.4, 2.0, 1.1]), fov: 34 },
  { t: W("c09", "utamanya"), pos: L(S, [-0.6, 1.6, 5.8]), tgt: L(S, [-0.6, 1.0, 1.5]), fov: 34 },
  { t: W("c09", "emas", 0), pos: [0.2, 2.0, 6.8], tgt: [-0.6, 1.1, 1.5], fov: 34 },
  { t: W("c09", "sembilan", 2), pos: [-1.2, 1.7, 5.8], tgt: [-0.6, 1.1, 1.5], fov: 34 },
  { t: W("c09", "dua", 4), pos: [5, 4, 10], tgt: [0, 1, 0], fov: 32 },
  { t: CH("c09").end, pos: [7, 7, 16], tgt: [0, 1.5, 0], fov: 32 },
];

export const Ghost: React.FC<{ t: number }> = ({ t }) => {
  const scaffold = ramp(t, W("c09", "pemugaran"), W("c09", "enam") + 0.3) * (1 - ramp(t, W("c09", "lalu"), W("c09", "ini", 0)));
  const roofLit = window01(t, W("c09", "kayu"), W("c09", "sebuah"), 0.5, 0.8) + window01(t, W("c09", "atapnya"), W("c09", "antaranya") + 0.8, 0.5, 0.8);
  const pillars = window01(t, W("c09", "kayu"), W("c09", "sebuah"), 0.5, 0.8) + window01(t, W("c09", "tiang"), W("c09", "atap", 1) + 0.8, 0.5, 0.8);
  const plaques = window01(t, W("c09", "prasasti"), W("c09", "ka'bah", 0) + 0.6, 0.5, 0.8);
  const gap = ramp(t, W("c09", "atapnya"), W("c09", "celah")) * (1 - ramp(t, W("c09", "sudut"), W("c09", "utara")));
  const stair = window01(t, W("c09", "utara"), W("c09", "atap", 2) + 1, 0.5, 0.8);
  const ruler = window01(t, W("c09", "utamanya"), W("c09", "tanah") + 1, 0.4, 0.6);
  const sizes = window01(t, W("c09", "ukurannya"), W("c09", "meter", 1) + 1, 0.5, 0.8);
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[7.1, 96]} />
        <meshStandardMaterial color={C.marble} roughness={0.7} />
      </mesh>
      <KabahModel dress="glass" hijr hajar="frame" />
      {/* interior */}
      <Box s={[KW - 0.1, 0.04, KD - 0.1]} p={[0, BASE + 0.02, 0]} c="#efe9e0" rough={0.25} radius={0.01} />
      {[-0.95, 0, 0.95].map((x) => (
        <mesh key={x} position={[x, BASE + (H - 0.3) / 2, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, H - 0.3, 24]} />
          <meshPhysicalMaterial color="#8b5a33" roughness={0.6} emissive={C.warmGlow} emissiveIntensity={0.22 * Math.min(1, pillars)} />
        </mesh>
      ))}
      <Box s={[KW - 0.08, 0.1, KD - 0.08]} p={[0, BASE + H - 0.3 + mix(0.05, -0.05, gap), 0]} c="#7a4c2b" rough={0.7} radius={0.01} emissive={C.warmGlow} ei={0.18 * Math.min(1, roofLit)} />
      <Box s={[KW - 0.04, 0.1, KD - 0.04]} p={[0, BASE + H - 0.05 + 0.2 * gap, 0]} c="#7a4c2b" rough={0.7} radius={0.01} emissive={C.warmGlow} ei={0.18 * Math.min(1, roofLit)} />
      {/* Bab At-Taubah stair room, north corner (+x, +z) */}
      <group position={[KW / 2 - 0.45, BASE, KD / 2 - 0.45]}>
        <Box s={[0.75, H - 0.35, 0.75]} p={[0, (H - 0.35) / 2, 0]} c="#e3dccf" rough={0.5} radius={0.02} op={0.55} />
        <Box s={[0.32, 0.8, 0.02]} p={[-0.2, 0.42, 0.38]} c="#d9b45e" metal={0.8} rough={0.3} radius={0.006} emissive={C.warmGlow} ei={0.8 * stair} />
        {Array.from({ length: 9 }, (_, i) => (
          <Box key={i} s={[0.3, 0.04, 0.12]} p={[0.1, 0.25 + i * 0.42, -0.18 + (i % 2) * 0.36]} c="#9b7a52" rough={0.6} radius={0.005} emissive={C.warmGlow} ei={0.6 * stair} />
        ))}
      </group>
      {/* ten marble inscriptions inside the walls */}
      {Array.from({ length: 10 }, (_, i) => {
        const back = i < 4, x = back ? -1.2 + i * 0.8 : i < 7 ? -KW / 2 + 0.06 : KW / 2 - 0.06;
        const z = back ? -KD / 2 + 0.06 : -0.9 + ((i - (i < 7 ? 4 : 7)) * 0.9);
        return <Box key={i} s={back ? [0.5, 0.3, 0.02] : [0.02, 0.3, 0.5]} p={[x, 2.2, z]} c="#f7f3ec" rough={0.3} radius={0.005} emissive={C.warmGlow} ei={0.9 * plaques} />;
      })}
      {/* raised door threshold ruler */}
      <Glow s={[0.03, 0.68, 0.03]} p={[-0.12, BASE + 0.34, KD / 2 + 0.12]} op={ruler} />
      {/* outline sizes */}
      <Glow s={[KW, 0.02, 0.03]} p={[0, 0.03, KD / 2 + 0.5]} op={sizes} />
      <Glow s={[0.03, 0.02, KD]} p={[KW / 2 + 0.5, 0.03, 0]} op={sizes} />
      <Glow s={[0.03, H, 0.03]} p={[-KW / 2 - 0.5, BASE + H / 2, KD / 2]} op={sizes} />
      {/* 1996 scaffold */}
      {scaffold > 0.001 ? (
        <group scale={[1, scaffold, 1]}>
          {[-2.2, 0, 2.2].map((x) =>
            [-2.0, 2.0].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 2.7, z]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 5.4, 8]} />
                <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.3} />
              </mesh>
            )),
          )}
          {[1.4, 2.8, 4.2, 5.2].map((y) =>
            [-2.0, 2.0].map((z) => (
              <mesh key={`${y}${z}`} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 4.5, 8]} />
                <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.32} />
              </mesh>
            )),
          )}
        </group>
      ) : null}
    </At>
  );
};
