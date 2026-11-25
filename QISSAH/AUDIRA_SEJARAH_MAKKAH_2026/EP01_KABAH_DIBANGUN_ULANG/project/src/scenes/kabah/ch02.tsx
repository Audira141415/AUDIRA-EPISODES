// Chapter 1 (c02): the foundations raised by Ibrahim — a dry valley diorama. No figure: stones lift
// along arcs from a pile and settle into the courses, the foundation line glows in the sand, the
// walls rise to about nine hasta with no roof and a door at ground level.
import React, { useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import type { Key } from "./camera.ts";
import { Box, C, CH, GroundOutline, KabahModel, Plinth, TEX, W, type V3, clamp01, mix, ramp } from "./core.tsx";
import { At, L } from "./world.tsx";

const S = "ibrahim" as const;
const H = 1.3; // ~9 hasta on the 1 u ≈ 3.3 m scale
const EXT = 0.9;

export const keys02 = (): Key[] => [
  { t: W("c02", "mulai"), pos: [-14, 18, -6], tgt: L(S, [0, 0, 0]), fov: 34 },
  { t: W("c02", "lembah"), pos: L(S, [2, 9, 22]), tgt: L(S, [0, 0.5, 0]), fov: 32 },
  { t: W("c02", "bakkah", 1), pos: L(S, [-4, 5, 14]), tgt: L(S, [0, 0.5, 0]), fov: 32 },
  { t: W("c02", "fondasi"), pos: L(S, [3, 6, 9.5]), tgt: L(S, [0.45, 0, 0]), fov: 32 },
  { t: W("c02", "rabbana"), pos: L(S, [0.5, 3.6, 9.5]), tgt: L(S, [0.45, 0.2, 0]), fov: 32 },
  { t: W("c02", "mengangkut"), pos: L(S, [-5, 2.8, 7.5]), tgt: L(S, [-1.5, 0.6, 0.5]), fov: 32 },
  { t: W("c02", "tingginya"), pos: L(S, [4, 2.4, 7.5]), tgt: L(S, [0.45, 0.7, 0]), fov: 32 },
  { t: W("c02", "menempel"), pos: L(S, [-0.4, 1.1, 4.6]), tgt: L(S, [-0.6, 0.45, 1.5]), fov: 34 },
  { t: W("c02", "fondasinya"), pos: L(S, [2.4, 1.6, 5]), tgt: L(S, [1.6, 0.3, 1.5]), fov: 34 },
  { t: W("c02", "batu-batunya"), pos: L(S, [3.1, 0.75, 3.4]), tgt: L(S, [2.4, 0.2, 1.55]), fov: 34 },
  { t: W("c02", "unta"), pos: L(S, [3.4, 0.9, 3.6]), tgt: L(S, [2.5, 0.2, 1.5]), fov: 34 },
  { t: W("c02", "kemudian"), pos: L(S, [0, 6, 13]), tgt: L(S, [0.45, 0.3, 0]), fov: 32 },
  { t: CH("c02").end, pos: L(S, [-2, 9, 18]), tgt: L(S, [0.45, 0.5, 0]), fov: 32 },
];

/** Low sandstone hills around the valley (seeded cones, flat shaded). */
const Hills: React.FC = () => {
  const hills = useMemo(() => {
    const rnd = prng(19);
    return Array.from({ length: 16 }, (_, i) => {
      const a = Math.PI * (0.55 + (i / 15) * 0.9) + (rnd() - 0.5) * 0.1; // back half only
      const r = 9 + rnd() * 7;
      return { p: [Math.cos(a) * r, -0.6, -Math.abs(Math.sin(a)) * r * 0.9 - 2] as V3, h: 1.2 + rnd() * 2.2, r: 2.6 + rnd() * 2.8, ry: rnd() * 3, c: ["#b89a72", "#a98a63", "#c2a67f"][i % 3] };
    });
  }, []);
  return (
    <group>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.p[0], h.p[1], h.p[2]]} rotation={[0, h.ry, 0]} scale={[h.r, h.h, h.r * 0.8]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color={h.c} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** "Camel hump" foundation stones along the outline. */
export const HumpStones: React.FC<{ k: number; w: number; d: number; x?: number; seed?: number }> = ({ k, w, d, x = 0, seed = 17 }) => {
  const stones = useMemo(() => {
    const rnd = prng(seed);
    const out: { p: V3; s: V3; r: number }[] = [];
    const per = 2 * (w + d), n = Math.round(per / 0.36);
    for (let i = 0; i < n; i++) {
      let u = (i / n) * per, px: number, pz: number;
      if (u < w) { px = -w / 2 + u; pz = d / 2; } else if ((u -= w) < d) { px = w / 2; pz = d / 2 - u; } else if ((u -= d) < w) { px = w / 2 - u; pz = -d / 2; } else { u -= w; px = -w / 2; pz = -d / 2 + u; }
      out.push({ p: [x + px + (rnd() - 0.5) * 0.05, 0, pz + (rnd() - 0.5) * 0.05], s: [0.17 + rnd() * 0.05, 0.12 + rnd() * 0.05, 0.15 + rnd() * 0.04], r: rnd() * 3 });
    }
    return out;
  }, [w, d, x, seed]);
  return (
    <group>
      {stones.map((st, i) => {
        const kk = clamp01(k * 1.6 - (i / stones.length) * 0.6);
        return (
          <mesh key={i} position={[st.p[0], mix(-0.2, 0.06, kk), st.p[2]]} scale={st.s} rotation={[0, st.r, 0]} castShadow receiveShadow>
            <sphereGeometry args={[1, 20, 14]} />
            <meshPhysicalMaterial color={C.stone} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Stones lifting from the pile and settling on the wall, staggered (no figure carries them). */
const FlyingStones: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const n = 7;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = mix(t0, t1, i / n), b = a + 1.6;
        const k = ramp(t, a, b);
        if (k <= 0 || k >= 1) return null;
        const from: V3 = [-3.6, 0.15, 1.6], to: V3 = [-1.6 + (i % 4) * 0.9, 0.2 + (H * (i + 1)) / (n + 1), 1.5 - Math.floor(i / 4) * 3];
        const p: V3 = [mix(from[0], to[0], k), mix(from[1], to[1], k) + Math.sin(k * Math.PI) * 1.2, mix(from[2], to[2], k)];
        return <Box key={i} s={[0.3, 0.17, 0.24]} p={p} r={[0, k * 2, k * 0.6]} c="#b39b7c" rough={0.88} radius={0.025} />;
      })}
      {/* the pile */}
      {Array.from({ length: 9 }, (_, i) => (
        <Box key={`p${i}`} s={[0.3, 0.17, 0.24]} p={[-3.6 + (i % 3) * 0.32 - 0.3, 0.09 + Math.floor(i / 3) * 0.17, 1.4 + ((i * 7) % 3) * 0.1]} r={[0, i * 0.7, 0]} c={i % 2 ? "#a68e70" : "#bca687"} rough={0.88} radius={0.025} />
      ))}
    </group>
  );
};

export const Ibrahim: React.FC<{ t: number }> = ({ t }) => {
  const sand = TEX.sand();
  const outline = ramp(t, W("c02", "fondasi") - 0.3, W("c02", "fondasi") + 1.2);
  const humps = ramp(t, W("c02", "fondasi"), W("c02", "baitullah") + 1);
  const walls = ramp(t, W("c02", "mengangkut"), W("c02", "hasta") + 0.4);
  const down = ramp(t, W("c02", "dibongkar"), W("c02", "dasarnya") + 0.6);
  const rise = walls * (1 - down * 0.92);
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[7.2, 96]} />
        <meshStandardMaterial map={sand} color="#ffffff" roughness={0.97} />
      </mesh>
      {/* dunes */}
      {[[-4.5, -2.5, 2.2], [4.8, -3, 2.6], [5.2, 2.6, 1.6], [-5.2, 3, 1.4]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.82, z]} scale={[1, 0.28, 1]} receiveShadow castShadow>
          <sphereGeometry args={[r, 32, 16]} />
          <meshStandardMaterial map={sand} color="#f4ead6" roughness={0.97} />
        </mesh>
      ))}
      <Hills />
      <GroundOutline w={3.6 + EXT} d={3.0} x={EXT / 2} op={outline} t={0.05} />
      <HumpStones k={humps} w={3.6 + EXT} d={3.0} x={EXT / 2} />
      {walls > 0.001 ? <KabahModel dress="stone" h={H} ext={EXT} roof={false} door="ground" hijr={false} hajar="none" rise={rise} seed={21} /> : null}
      <FlyingStones t={t} t0={W("c02", "mengangkut") - 0.4} t1={W("c02", "tingginya")} />
      {/* soft morning light pooling on the ground door */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.62, 0.02, 2.0]}>
        <planeGeometry args={[0.7, 1.0]} />
        <meshBasicMaterial color={C.warmGlow} transparent opacity={0.14 * ramp(t, W("c02", "pintunya"), W("c02", "tanah", 0) + 0.5) * (1 - down)} toneMapped={false} depthWrite={false} />
      </mesh>
    </At>
  );
};
void THREE;
