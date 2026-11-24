// EP59 scenes A–H. Positions match the camera keys in timeline.ts. t = film seconds, f = 60 fps clock.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { FX_LAYER } from "../core/render/Post.tsx";
import { clamp01, mulberry32 } from "../kits/feltcraft/core/motion";
import { C, mat, pop, Ground, Lake, SnowMounds, Pine, PineRing, Smoke, SaunaCabin, TowelPerson, textTexture, SignBoard, FinnFlag, Kiuas, Parliament, Shape, SPHERE, CONE, ROCK } from "./parts.tsx";
import type { V3 } from "./timeline.ts";

type SP = { t: number; f: number };
const st = (t: number) => Math.floor(t * 12) / 12;

/** Painted wooden game pawn = one resident (stands for "people" in the counts). */
const Pawn: React.FC<{ position: V3; color: string; s: number }> = ({ position, color, s }) =>
  s <= 0.001 ? null : (
    <group position={position} scale={s}>
      <Shape geometry={CONE} color={color} kind="paint" position={[0, 0.11, 0]} scale={[0.09, 0.22, 0.09]} />
      <Shape geometry={SPHERE} color="#E9C9A4" kind="paint" position={[0, 0.27, 0]} scale={0.065} />
    </group>
  );

// ---------------- A: frozen lake, sauna cabins popping on the hills ----------------
const A_CABINS: { p: V3; r: number; size: number }[] = [
  { p: [-2.4, 0, -2.6], r: 0.5, size: 1.4 },
  { p: [2.5, 0, -2.4], r: -0.5, size: 1.4 },
  { p: [0.2, 0, -4.0], r: 0.1, size: 1.5 },
  { p: [-4.2, 0, -1.2], r: 0.9, size: 1.2 },
  { p: [4.3, 0, -1.0], r: -0.9, size: 1.2 },
  { p: [-3.4, 0, -4.6], r: 0.4, size: 1.2 },
  { p: [3.6, 0, -4.4], r: -0.3, size: 1.2 },
  { p: [-1.6, 0, -5.6], r: 0.2, size: 1.1 },
  { p: [1.9, 0, -5.8], r: -0.2, size: 1.1 },
  { p: [-5.4, 0, -3.2], r: 0.8, size: 1.0 },
  { p: [5.5, 0, -3.0], r: -0.8, size: 1.0 },
  { p: [0, 0, -7.2], r: 0, size: 1.1 },
];
export const SceneA: React.FC<SP> = ({ t, f }) => {
  const pawns = useMemo(() => {
    const rnd = mulberry32(59);
    return Array.from({ length: 22 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const r = 3.3 + rnd() * 3.2;
      return { p: [Math.cos(a) * r * 0.9, 0, Math.sin(a) * r * 0.55 - 1.2] as V3, c: ["#D8433A", "#3E9C95", "#F2B53B", "#1F4FA0", "#E37A2E"][i % 5], at: 4.3 + i * 0.09 };
    });
  }, []);
  return (
    <group>
      <Ground color={C.snow} />
      <Lake color={C.lake} r={3} position={[0, 0.012, -0.6]} />
      <SnowMounds seed={11} n={12} r0={3.6} r1={8} />
      <PineRing seed={5} n={18} r0={6.5} r1={10} />
      {A_CABINS.map((c, i) => (
        <SaunaCabin key={i} t={t} position={c.p} rotation={c.r} size={c.size} s={i < 3 ? 1 : pop(t, 0.3 + (i - 3) * 0.3)} seed={i + 1} />
      ))}
      {pawns.map((p, i) => (
        <Pawn key={i} position={p.p} color={p.c} s={pop(t, p.at) * 1.1} />
      ))}
      <TowelPerson f={f} seed={4} pose="walk" position={[-1.1 + clamp01(t / 6.6) * 1.4, 0, 1.7]} heading={Math.PI / 2} scale={0.6} />
      <AssetModel grain="wood" grainTiles={2} id="wooden-teoke-bucket-e65f35" assetType="prop" size={0.42} ground position={[1.3, 0, 3.2]} tint={C.woodHoney} />
    </group>
  );
};

// ---------------- B: every house its own sauna; stitched SAUNA letters ----------------
const LetterTile: React.FC<{ ch: string; position: V3; s: number }> = ({ ch, position, s }) => {
  const tex = textTexture(ch, { w: 256, h: 256, font: "bold 190px Georgia, serif" });
  if (s <= 0.001) return null;
  return (
    <group position={position} scale={s}>
      <mesh castShadow material={mat("#7A4E2C", 1, "wood")}>
        <boxGeometry args={[0.7, 0.7, 0.14]} />
      </mesh>
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.75, -0.02]} material={mat(C.woodDark, 1, "wood")}>
        <cylinderGeometry args={[0.03, 0.035, 0.8, 8]} />
      </mesh>
    </group>
  );
};
export const SceneB: React.FC<SP> = ({ t, f }) => (
  <group>
    <Ground color={C.snow} />
    <SnowMounds seed={21} n={10} r0={4} r1={9} />
    <PineRing seed={8} n={16} r0={7} r1={11} />
    {[-4.5, -1.5, 1.5, 4.5].map((x, i) => (
      <group key={i}>
        <group scale={pop(t, 6.6 + i * 0.3)}>
          <AssetModel grain="wood" id="porch-log-cabin-d2f3ef" assetType="building" size={2.0} ground position={[x - 0.35, 0, -1.2]} tint={["#C98F5E", "#B27A4C", "#C49A6C", "#A86E45"][i]} roughness={0.95} />
        </group>
        <SaunaCabin t={t} position={[x + 0.85, 0, -0.5]} rotation={-0.4} size={0.9} s={pop(t, 7.6 + i * 0.35)} seed={10 + i} />
        {pop(t, 8.3) > 0 ? (
          <>
            <TowelPerson f={f + i * 40} seed={20 + i * 2} pose="stand" position={[x - 0.2, 0, 0.6]} heading={0.3} scale={0.55} />
            <TowelPerson f={f + i * 40} seed={21 + i * 2} pose="wave" position={[x + 0.3, 0, 0.7]} heading={-0.3} scale={0.55} towel="#E8C4A0" />
          </>
        ) : null}
      </group>
    ))}
    {/* carved wooden SAUNA boards on the snowy hill behind */}
    <Shape geometry={SPHERE} color="#EEF1F5" kind="snow" repeat={3} position={[0, -0.2, -4.0]} scale={[3.4, 1.4, 1.2]} />
    {"SAUNA".split("").map((ch, i) => (
      <LetterTile key={i} ch={ch} position={[-1.04 + i * 0.52, 2.0 + (i % 2) * 0.1, -3.6]} s={pop(t, 10.6 + i * 0.3) * 0.7} />
    ))}
  </group>
);

// ---------------- C: sauna everywhere — lake, apartment, office, parliament ----------------
const glowAt = (t: number, at: number) => clamp01((st(t) - at) / 0.3);
export const SceneC: React.FC<SP> = ({ t, f }) => (
  <group>
    <group position={[9, 0, 0]}>
      <Ground color={C.snow} size={30} />
    </group>
    <PineRing seed={31} n={12} r0={7} r1={10} arc={[Math.PI * 1.1, Math.PI * 1.6]} />
    {/* 0: lakeside sauna + jetty */}
    <Lake color={C.lake} r={1.8} position={[-0.6, 0.012, 1.6]} scaleZ={0.55} />
    <SaunaCabin t={t} position={[-0.6, 0, -0.6]} size={1.8} glow={0.3 + glowAt(t, 18.95)} seed={31} />
    <AssetModel grain="wood" grainTiles={3} id="dock-platform-section-b36e7c" assetType="prop" size={1.2} ground position={[0.4, 0, 1.0]} tint={C.woodHoney} />
    {/* 6: apartment with a sauna glowing in the ground floor */}
    <AssetModel id="postwar-apartment-slab-cee5f9" assetType="building" size={3.8} ground position={[6, 0, -1.0]} roughness={0.85} />
    <WarmWindows x={6} z={0.05} cols={4} rows={5} t={t} at={19.6} />
    <SaunaCabin t={t} position={[7.6, 0, 0.6]} size={0.9} rotation={-0.4} glow={glowAt(t, 19.94)} s={0.6 + 0.4 * pop(t, 19.8)} seed={32} />
    {/* 12: office block */}
    <AssetModel id="prewar-apartment-house-1081a6" assetType="building" size={3.8} ground position={[12, 0, -1.0]} roughness={0.85} />
    <SaunaCabin t={t} position={[13.6, 0, 0.6]} size={0.9} rotation={-0.4} glow={glowAt(t, 21.07)} s={0.6 + 0.4 * pop(t, 20.9)} seed={33} />
    {/* 18: parliament */}
    <Parliament position={[18, 0, -0.6]} />
    <SaunaCabin t={t} position={[16.0, 0, 0.9]} size={0.9} rotation={0.4} glow={glowAt(t, 22.34)} s={0.6 + 0.4 * pop(t, 22.2)} seed={34} />
    {[3, 9, 15].map((x, i) => (
      <Pine key={i} position={[x, 0, -1.6]} size={2.0} />
    ))}
    <TowelPerson f={f} seed={40} pose="walk" position={[1.5 + clamp01((t - 16.1) / 7) * 15, 0, 2.0]} heading={Math.PI / 2} scale={0.8} towel="#E8C4A0" />
  </group>
);

// ---------------- D: mine — headframe, shaft dive, tunnel sauna at −1.400 m ----------------
export const SceneD: React.FC<SP> = ({ t }) => {
  const rock = "#7E6E62";
  return (
    <group>
      {/* hole/shaft r 2.2: the dive camera crosses y=0 at r≈1.6, so a 1.6 hole made it clip the snow (qa LONCAT 25.42) */}
      <Ground color={C.snow} hole={2.2} />
      <SnowMounds seed={41} n={8} r0={3.5} r1={8} />
      <PineRing seed={42} n={12} r0={6} r1={10} />
      <AssetModel id="mine-headframe-735cf4" assetType="building" size={4.2} ground position={[0, 0, 0]} roughness={0.7} />
      {/* shaft */}
      <mesh position={[0, -4.5, 0]}>
        <cylinderGeometry args={[2.22, 2.22, 9, 32, 1, true]} />
        <meshStandardMaterial color={rock} roughness={1} side={THREE.BackSide} />
      </mesh>
      {[-1.5, -3.5, -5.5, -7.5].map((y, i) => (
        <group key={i}>
          <mesh position={[2.05, y, 0]}>
            <sphereGeometry args={[0.08, 12, 8]} />
            <meshStandardMaterial color="#FFE2A8" emissive="#FFB25A" emissiveIntensity={2.5} />
          </mesh>
          <pointLight position={[1.7, y, 0]} intensity={1.6} distance={4} decay={1.6} color="#FFC98A" />
        </group>
      ))}
      {/* hoist cable + timber cage riding down with the camera */}
      <mesh position={[-0.7, -3.0, 0.2]} material={mat("#3A3634", 1, "metal")}>
        <cylinderGeometry args={[0.025, 0.025, 12, 6]} />
      </mesh>
      <group position={[-0.7, -0.4 - 13.0 * clamp01((st(t) - 24.6) / 3.4), 0.2]}>
        <mesh castShadow material={mat("#C98F5E", 1)}>
          <boxGeometry args={[0.9, 0.08, 0.9]} />
        </mesh>
        <mesh position={[0, 1.0, 0]} material={mat("#C98F5E", 1)}>
          <boxGeometry args={[0.9, 0.08, 0.9]} />
        </mesh>
        {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.5, z]} material={mat(C.woodDark, 1)}>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
          </mesh>
        ))}
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.07, 12, 8]} />
          <meshStandardMaterial color="#FFE2A8" emissive="#FFB25A" emissiveIntensity={2.5} />
        </mesh>
        <pointLight position={[0, 0.7, 0.3]} intensity={1.8} distance={4} decay={1.6} color="#FFC98A" />
      </group>
      {/* tunnel chamber: rock walls, boulders, timber arches, rails, hanging lamps */}
      <mesh position={[0, -11.5, -1]} material={backMat("#3E3530")}>
        <boxGeometry args={[10, 5, 10]} />
      </mesh>
      <MineBoulders />
      {[2.6, 0.6, -1.4].map((z, i) => (
        <group key={i} position={[0, -14, z]}>
          {[-2.0, 2.0].map((x) => (
            <mesh key={x} position={[x, 1.3, 0]} castShadow material={mat(C.woodDark, 1)}>
              <boxGeometry args={[0.22, 2.6, 0.22]} />
            </mesh>
          ))}
          <mesh position={[0, 2.65, 0]} castShadow material={mat("#7A4E2C", 1)}>
            <boxGeometry args={[4.5, 0.26, 0.28]} />
          </mesh>
          <mesh position={[0.9 - i * 0.9, 2.3, 0.05]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color="#FFE2A8" emissive="#FFB25A" emissiveIntensity={3} />
          </mesh>
          <mesh position={[0.9 - i * 0.9, 2.47, 0.05]} material={mat("#2A2624", 1, "metal")}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
          </mesh>
          <mesh position={[0.9 - i * 0.9, 2.36, 0.05]} material={mat("#3A3634", 1, "metal")}>
            <coneGeometry args={[0.14, 0.1, 12, 1, true]} />
          </mesh>
          <pointLight position={[0.9 - i * 0.9, 2.1, 0.3]} intensity={1.4} distance={3.5} decay={1.6} color="#FFC98A" />
        </group>
      ))}
      {/* rail track running from the camera into the tunnel */}
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x + 0.9, -13.94, 0.2]} castShadow material={mat("#9A948E", 1, "metal")}>
          <boxGeometry args={[0.06, 0.07, 8]} />
        </mesh>
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[0.9, -13.98, -3.6 + i * 0.62]} castShadow material={mat("#4A3020", 1, "wood")}>
          <boxGeometry args={[0.95, 0.06, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, -13.99, -1]} rotation={[-Math.PI / 2, 0, 0]} material={mat("#6A5C52", 6, "stone")} receiveShadow>
        <planeGeometry args={[10, 10]} />
      </mesh>
      {[-2.2, 0, 2.2].map((x, i) => (
        <mesh key={i} position={[x, -11.6, -1]} material={mat(C.woodDark, 1)}>
          <boxGeometry args={[0.2, 0.2, 10]} />
        </mesh>
      ))}
      <group position={[0, -14, 0]}>
        <SaunaCabin t={t} position={[-0.9, 0, -3.9]} size={1.35} glow={1.6} smoke={false} seed={44} />
        <AssetModel id="mine-cart-94bd76" assetType="prop" size={0.85} ground position={[0.9, 0.04, 1.3]} rotation={[0, Math.PI / 2, 0]} tint="#5E5852" metalness={0.65} roughness={0.5} />
        <AssetModel id="mine-cart-94bd76" assetType="prop" size={0.85} ground position={[0.9, 0.04, -0.2]} rotation={[0, Math.PI / 2, 0]} tint="#6A5A4C" metalness={0.6} roughness={0.55} />
      </group>
      <pointLight position={[0, -11.2, 1.0]} intensity={3} distance={9} decay={1.4} color="#FFC98A" />
    </group>
  );
};

const backMat = (color: string, kind: "stone" | "wood" = "stone") => {
  const m = (mat(color, 6, kind) as THREE.MeshStandardMaterial).clone();
  m.side = THREE.BackSide;
  return m;
};

/** Rough boulders lining the tunnel walls and ceiling (reads as rock, not a room). */
const MineBoulders: React.FC = () => {
  const rocks = useMemo(() => {
    const rnd = mulberry32(4411);
    return Array.from({ length: 46 }, () => {
      const side = rnd();
      // back wall behind the cabin, close side walls inside the arches, and the low ceiling
      const pos: V3 =
        side < 0.45
          ? [-3.4 + rnd() * 6.8, -14 + rnd() * 4.6, -5.0 - rnd() * 0.5]
          : side < 0.62
            ? [-2.9 - rnd() * 0.6, -13.8 + rnd() * 3.8, -4.5 + rnd() * 7]
            : side < 0.79
              ? [2.9 + rnd() * 0.6, -13.8 + rnd() * 3.8, -4.5 + rnd() * 7]
              : [-3 + rnd() * 6, -10.0 + rnd() * 0.4, -4.5 + rnd() * 7];
      const r = 0.45 + rnd() * 0.6;
      return { pos, sc: [r * (0.9 + rnd() * 0.5), r * (0.7 + rnd() * 0.4), r] as V3, c: ["#4E443E", "#5A4E46", "#3F3631"][Math.floor(rnd() * 3)] };
    });
  }, []);
  return (
    <group>
      {rocks.map((q, i) => (
        <Shape key={i} geometry={ROCK[i % 3]} color={q.c} kind="stone" position={q.pos} scale={q.sc} />
      ))}
    </group>
  );
};

// ---------------- E: interior — benches, kiuas, löyly steam ----------------
const Ladle: React.FC<{ t: number }> = ({ t }) => {
  // 35.0 → 35.6 lift from the bucket, 35.6 → 36.2 tip over the stones
  const a = clamp01((st(t) - 35.0) / 0.6);
  const b = clamp01((st(t) - 35.6) / 0.5);
  const back = clamp01((st(t) - 37.2) / 0.6);
  const k = a * (1 - back);
  const pos: V3 = [-0.9 + (-1.35 + 0.9) * k, 0.55 + 0.6 * k, 0.2 + (-0.4 - 0.2) * k];
  return (
    <group position={pos} rotation={[0, 0, b * 1.6 * (1 - back)]}>
      <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat(C.woodDark, 1)}>
        <cylinderGeometry args={[0.018, 0.02, 0.44, 8]} />
      </mesh>
      <mesh position={[0, -0.03, 0]} material={mat(C.woodHoney, 1)}>
        <cylinderGeometry args={[0.07, 0.05, 0.08, 14]} />
      </mesh>
    </group>
  );
};
export const SceneE: React.FC<SP> = ({ t, f }) => {
  const temp = clamp01((st(t) - 30.8) / 3.8); // thermometer column 0..1
  const steam = st(t) >= 35.9 && st(t) < 43.5;
  return (
    <group>
      {/* wooden room */}
      <mesh position={[0, 1.8, 0.5]} material={backMat(C.woodHoney, "wood")}>
        <boxGeometry args={[8, 3.6, 9]} />
      </mesh>
      <mesh position={[0, 0.002, 0.5]} rotation={[-Math.PI / 2, 0, 0]} material={mat("#9A6A42", 4)} receiveShadow>
        <planeGeometry args={[8, 9]} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, 0.35 + i * 0.36, -3.97]} material={mat("#7A4E2E", 1, "wood")}>
          <boxGeometry args={[8, 0.025, 0.02]} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`l${i}`} position={[-3.97, 0.35 + i * 0.36, 0.5]} material={mat("#7A4E2E", 1, "wood")}>
          <boxGeometry args={[0.02, 0.025, 9]} />
        </mesh>
      ))}
      {/* two-tier benches */}
      <mesh position={[0.6, 0.2, -0.45]} castShadow receiveShadow material={mat("#C99A68", 2)}>
        <boxGeometry args={[3.2, 0.4, 0.5]} />
      </mesh>
      <mesh position={[0.6, 0.42, -1.15]} castShadow receiveShadow material={mat("#C29060", 2)}>
        <boxGeometry args={[3.2, 0.84, 0.9]} />
      </mesh>
      <AssetModel grain="wood" grainTiles={3} id="plank-bench-c46528" assetType="prop" size={1.6} ground position={[2.6, 0, 0.6]} rotation={[0, -Math.PI / 2, 0]} tint={C.woodHoney} />
      <TowelPerson f={f} seed={51} pose="sit" position={[-0.1, 0.9, -1.0]} scale={0.95} />
      <TowelPerson f={f + 30} seed={52} pose="sit" position={[0.65, 0.9, -1.0]} scale={0.95} towel="#E8C4A0" />
      <TowelPerson f={f + 60} seed={53} pose="sit" position={[1.4, 0.9, -1.0]} scale={0.95} towel="#CFE0EA" />
      <Kiuas t={t} position={[-1.5, 0, -0.5]} />
      <AssetModel grain="wood" grainTiles={2} id="wooden-teoke-bucket-e65f35" assetType="prop" size={0.42} ground position={[-0.9, 0, 0.2]} tint={C.woodHoney} />
      <Ladle t={t} />
      {steam ? <Smoke t={t - 35.9} origin={[-1.5, 0.75, -0.5]} color={C.steam} n={10} rise={2.2} spread={0.9} size={0.22} seed={57} opacity={0.38 * clamp01((st(t) - 35.9) / 0.5) * clamp01((43.5 - st(t)) / 0.5)} /> : null}
      {/* wooden thermometer on the back wall */}
      <group position={[-0.7, 2.0, -3.9]}>
        <mesh material={mat("#E8D2AE", 1, "wood")}>
          <boxGeometry args={[0.26, 1.1, 0.05]} />
        </mesh>
        <mesh position={[0, -0.42 + 0.42 * (0.2 + 0.8 * temp), 0.04]} scale={[1, 0.2 + 0.8 * temp, 1]} material={mat("#D8433A", 1, "paint")}>
          <boxGeometry args={[0.06, 0.84, 0.03]} />
        </mesh>
        <mesh position={[0, -0.5, 0.04]} material={mat("#D8433A", 1, "paint")}>
          <sphereGeometry args={[0.07, 14, 10]} />
        </mesh>
      </group>
      <pointLight position={[1.5, 2.6, 1.5]} intensity={2.2} distance={8} decay={1.5} color="#FFD7A0" />
    </group>
  );
};

// ---------------- F: smoke sauna at dusk; dark interior with the hourglass ----------------
export const SceneF: React.FC<SP> = ({ t }) => {
  const flip = clamp01((st(t) - 57.1) / 0.5);
  return (
    <group>
      <Ground color="#D8CBC0" />
      <SnowMounds seed={61} n={10} r0={3.5} r1={8} color="#E2D6CC" />
      <PineRing seed={62} n={18} r0={5} r1={9} arc={[0, Math.PI * 2]} tint="#2F5040" />
      <SaunaCabin t={t} position={[0, 0, 0]} size={2.2} tint={C.soot} chimney={false} glow={0.5} />
      {/* smoke seeping out of the walls and eaves (no chimney) */}
      <Smoke t={t} origin={[-0.9, 1.2, 0.5]} color="#9A918A" n={6} rise={1.6} spread={0.5} size={0.26} seed={63} />
      <Smoke t={t + 0.7} origin={[0.9, 1.3, -0.4]} color="#8C847E" n={6} rise={1.6} spread={0.5} size={0.26} seed={64} />
      <Smoke t={t + 1.4} origin={[0, 1.5, 0.9]} color="#A59C95" n={5} rise={1.4} spread={0.6} size={0.22} seed={65} />
      {/* interior cut-away at z −10.6 */}
      <mesh position={[0, 1.3, -10.6]} material={backMat("#2E211B", "wood")}>
        <boxGeometry args={[4, 2.6, 4]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.32, -12.57]} material={mat("#1C1410", 1, "wood")}>
          <boxGeometry args={[4, 0.03, 0.03]} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`s${i}`} position={[-1.97, 0.2 + i * 0.32, -10.6]} material={mat("#1C1410", 1, "wood")}>
          <boxGeometry args={[0.03, 0.03, 4]} />
        </mesh>
      ))}
      {/* daylight slit in the back wall + dusty light beam */}
      <mesh position={[-0.55, 2.05, -12.58]}>
        <planeGeometry args={[0.9, 0.08]} />
        <meshBasicMaterial color="#FFE2B0" toneMapped={false} />
      </mesh>
      <LightBeam from={[-0.55, 2.05, -12.5]} to={[0.25, 0.72, -10.4]} width={0.38} />
      <TowelPerson f={t * 60} seed={68} pose="sit" position={[0.62, 0.43, -11.4]} heading={-0.3} scale={0.8} towel="#D9C7AE" />
      <Smoke t={t} origin={[0, 2.3, -11.2]} color="#6E625A" n={7} rise={0.15} spread={3.0} size={0.34} seed={69} opacity={0.35} />
      <AssetModel grain="wood" grainTiles={3} id="plank-bench-c46528" assetType="prop" size={1.5} ground position={[0.75, 0, -11.35]} tint="#6E4426" />
      <AssetModel grain="wood" grainTiles={2} id="wooden-teoke-bucket-e65f35" assetType="prop" size={0.36} ground position={[0.95, 0, -10.2]} tint={C.woodHoney} />
      <mesh position={[0, 0.35, -10.6]} castShadow receiveShadow material={mat("#5E4234", 2)}>
        <boxGeometry args={[1.3, 0.7, 0.6]} />
      </mesh>
      <group position={[0.1, 0.7, -10.5]} rotation={[0, 0, flip * Math.PI]}>
        <group position={[0, flip > 0 ? -0.24 * flip * 2 + 0.24 : 0, 0]}>
          <AssetModel id="an-hourglass-with-sand-ec9f11" size={0.48} ground />
        </group>
      </group>
      <Kiuas t={t} position={[-0.8, 0, -11.0]} ember={1.4} seed={66} />
      <Smoke t={t} origin={[-0.8, 0.8, -11.0]} color="#8A7E76" n={5} rise={1.4} spread={0.4} size={0.2} seed={67} opacity={0.4} />
      <pointLight position={[0.6, 1.6, -9.2]} intensity={2.6} distance={5} decay={1.6} color="#FFB070" />
      <pointLight position={[-0.4, 1.4, -11.6]} intensity={1.8} distance={3} decay={1.6} color="#FF8A4A" />
    </group>
  );
};

// ---------------- G: Berlin 1936 athletes' village ----------------
export const SceneG: React.FC<SP> = ({ t, f }) => (
  <group>
    <Ground color="#6F8E4C" />
    <PineRing seed={71} n={14} r0={7} r1={11} tint="#4F7A45" snowCap={false} />
    <Stadium position={[0, 0, -3.2]} />
    {[-5, -3.6, -2.2, 2.2, 3.6, 5].map((x, i) => (
      <Banner key={i} t={t + i * 0.4} position={[x, 0, -7.2]} color={["#F4F1EA", "#1F4FA0", "#F4F1EA", "#1F4FA0", "#F4F1EA", "#1F4FA0"][i]} />
    ))}
    <AssetModel grain="wood" id="porch-log-cabin-d2f3ef" assetType="building" size={2.2} ground position={[-3.6, 0, -2.6]} rotation={[0, 0.5, 0]} tint="#C9B79A" />
    <AssetModel grain="wood" id="porch-log-cabin-d2f3ef" assetType="building" size={2.2} ground position={[3.6, 0, -2.8]} rotation={[0, -0.5, 0]} tint="#BFAE92" />
    <AssetModel grain="wood" id="porch-log-cabin-d2f3ef" assetType="building" size={2.2} ground position={[0, 0, -5.0]} tint="#C4B293" />
    <SaunaCabin t={t} position={[-0.4, 0, -0.4]} size={2.2} s={pop(t, 58.9)} seed={72} />
    <FinnFlag t={t} position={[2.1, 0, -0.5]} />
    <SignBoard text="AUDIRA SAUNA" position={[1.0, 0.25, 1.6]} rotation={-0.35} w={1.0} />
    <SignBoard text="BERLIN 1936" position={[-2.6, 0, 1.0]} rotation={0.45} w={1.4} />
    {[0, 1, 2, 3].map((i) => (
      <TowelPerson key={i} f={f + i * 25} seed={73 + i} pose={i === 3 ? "wave" : "stand"} position={[-1.9 + i * 0.55, 0, 1.6 - i * 0.25]} heading={Math.PI * 0.85} scale={0.7} towel={["#F7F1E6", "#CFE0EA", "#E8C4A0", "#F7F1E6"][i]} />
    ))}
  </group>
);

// ---------------- H: golden-hour payoff ----------------
export const SceneH: React.FC<SP> = ({ t, f }) => {
  const boatX = -1.9 + clamp01((t - 68.5) / 13) * 2.4;
  return (
    <group>
      <Ground color="#EBD9C8" />
      <Lake color={C.lakeDusk} r={2.6} position={[0, 0.012, 2.8]} scaleZ={0.6} />
      <SnowMounds seed={81} n={10} r0={4} r1={9} color="#F0E0CF" />
      <PineRing seed={82} n={18} r0={5} r1={10} tint="#35553F" />
      <SaunaCabin t={t} position={[0, 0, -0.3]} size={2.4} glow={1.3} seed={83} />
      <AssetModel grain="wood" grainTiles={3} id="dock-platform-section-b36e7c" assetType="prop" size={1.3} ground position={[0.9, 0, 1.4]} tint={C.woodHoney} />
      <AssetModel grain="wood" grainTiles={3} id="wooden-rowboat-916981" assetType="vehicle" size={1.3} ground position={[boatX, 0.02, 3.2]} rotation={[0, Math.PI / 2, 0]} tint="#9A5E36" />
      <SignBoard text="AUDIRA" position={[-0.55, 0, 1.35]} rotation={0.3} w={0.9} />
      <TowelPerson f={f} seed={84} pose="sit" position={[1.0, 0.42, 1.9]} heading={0.2} scale={0.75} />
      <mesh geometry={SPHERE} position={[-3.6, 3.2, -9]} scale={1.1}>
        <meshBasicMaterial color="#FFD08A" toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
};

export const SCENES = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF, G: SceneG, H: SceneH } as const;

// ---------------- polish helpers (r2) ----------------
/** Grid of warm-lit windows on a building front (sauna glow in the apartments). */
const WarmWindows: React.FC<{ x: number; z: number; cols: number; rows: number; t: number; at: number }> = ({ x, z, cols, rows, t, at }) => {
  const on = useMemo(() => {
    const rnd = mulberry32(606);
    return Array.from({ length: cols * rows }, () => rnd());
  }, [cols, rows]);
  const g = glowAt(t, at);
  return (
    <group position={[x, 0, z]}>
      {on.map((r, i) => {
        const c = i % cols;
        const rr = Math.floor(i / cols);
        const lit = r < 0.55 || (rr === 0 && g > 0);
        if (!lit) return null;
        return (
          <mesh key={i} position={[(c - (cols - 1) / 2) * 0.42, 0.45 + rr * 0.62, 0]}>
            <planeGeometry args={[0.2, 0.26]} />
            <meshBasicMaterial color={rr === 0 ? "#FFB25A" : "#FFD9A0"} toneMapped={false} transparent opacity={rr === 0 ? 0.4 + 0.6 * g : 0.75} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Soft additive light shaft between two points (smoke-sauna slit light). */
const LightBeam: React.FC<{ from: V3; to: V3; width: number }> = ({ from, to, width }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh layers={FX_LAYER} position={mid} quaternion={q}>
      <cylinderGeometry args={[width * 0.25, width, len, 16, 1, true]} />
      <meshBasicMaterial color="#FFCF8A" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
};

/** 1936 stadium hint: curved stone colonnade wall, no logos or rings. */
const Stadium: React.FC<{ position: V3 }> = ({ position }) => {
  const R = 7.5;
  const n = 22;
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} material={mat("#B8AE9E", 4, "stone")} castShadow>
        <cylinderGeometry args={[R - 0.3, R - 0.3, 2.4, 48, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
      </mesh>
      <mesh position={[0, 2.5, 0]} material={mat("#A99F90", 4, "stone")}>
        <cylinderGeometry args={[R + 0.15, R + 0.15, 0.25, 48, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const a = Math.PI * 0.64 + (i / (n - 1)) * Math.PI * 0.72;
        return (
          <mesh key={i} position={[Math.sin(a) * R, 1.25, Math.cos(a) * R]} rotation={[0, a, 0]} castShadow material={mat("#CFC6B6", 2, "stone")}>
            <boxGeometry args={[0.22, 2.5, 0.22]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Plain vertical banner on a pole (parade flag row). */
const Banner: React.FC<{ t: number; position: V3; color: string }> = ({ t, position, color }) => {
  const sw = Math.sin((Math.floor(t * 12) / 12) * 2.2) * 0.06;
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow material={mat("#D8D2C8", 1, "metal")}>
        <cylinderGeometry args={[0.03, 0.035, 3.2, 8]} />
      </mesh>
      <mesh position={[0.2, 2.65, 0]} rotation={[0, sw, 0]} castShadow>
        <planeGeometry args={[0.36, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
