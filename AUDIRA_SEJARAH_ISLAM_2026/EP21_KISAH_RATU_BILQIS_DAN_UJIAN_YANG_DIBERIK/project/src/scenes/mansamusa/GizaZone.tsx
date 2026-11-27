// Main development set (x ≈ 7..19): the caravan camp beside the Giza pyramids, the Nile crossing by
// boat, and the Cairo palace where porters bring loads of gold to the sultan's treasury and every
// court official receives gold. All people are faceless pixel sprites (backs / wrapped heads).

import React, { useMemo } from "react";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { MM, Coin, Dome, Minaret, CityGate, LanternString, grain } from "./CairoMarket.tsx";
import { PixelSprite, CAMEL_GOLD, PILGRIM_BACK, PILGRIM_BACK_WHITE, PORTER_BACK, OFFICIAL_BACK, OFFICIAL_BACK_GREEN } from "./pixel.tsx";
import { W, ramp } from "./time.ts";

type V3 = [number, number, number];

export const GIZA = {
  nile: { x0: 12.4, x1: 13.9 },
  palace: [16.3, 0, -2.7] as V3,
  chestAt: [16.3, 0, -1.85] as V3,
  camp: [10.1, 0, -1.6] as V3,
  boatZ: 0.35,
};

const BigPyramid: React.FC<{ x: number; z: number; s: number; rot?: number }> = ({ x, z, s, rot = Math.PI / 4 }) => (
  <group position={[x, 0, z]} rotation={[0, rot, 0]}>
    {/* stepped courses read as pixel layers in HD-2D */}
    {Array.from({ length: 9 }, (_, i) => {
      const k = 1 - i / 9;
      const h = s / 9;
      return (
        <mesh key={i} position={[0, h * (i + 0.5), 0]} castShadow receiveShadow>
          <boxGeometry args={[s * 1.15 * k, h, s * 1.15 * k]} />
          <meshPhysicalMaterial {...POLISH.stone} color={i % 2 ? "#C9955F" : "#BD8A55"} bumpMap={grain} bumpScale={0.6} />
        </mesh>
      );
    })}
  </group>
);

const Tent: React.FC<{ p: V3; s?: number; c: [string, string] }> = ({ p, s = 1, c }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.32, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.42, 0.64, 4]} />
      <meshPhysicalMaterial {...POLISH.fabric} color={c[0]} flatShading />
    </mesh>
    <mesh position={[0, 0.2, 0.18]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.2, 0.36, 4]} />
      <meshBasicMaterial color="#3A1E10" />
    </mesh>
    <mesh position={[0, 0.67, 0]}>
      <boxGeometry args={[0.04, 0.1, 0.04]} />
      <meshStandardMaterial color={c[1]} />
    </mesh>
  </group>
);

const Palm: React.FC<{ p: V3; h?: number; seed?: number }> = ({ p, h = 1.1, seed = 1 }) => (
  <group position={p}>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[Math.sin(i * 0.5 + seed) * 0.03, h * (i + 0.5) / 6, 0]} castShadow>
        <boxGeometry args={[0.07, h / 6 - 0.01, 0.07]} />
        <meshPhysicalMaterial {...POLISH.stone} color={i % 2 ? "#6A4A2E" : "#5A3E26"} />
      </mesh>
    ))}
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + seed;
      return (
        <mesh key={`l${i}`} position={[Math.cos(a) * 0.22, h - 0.02, Math.sin(a) * 0.22]} rotation={[Math.sin(a) * 0.5, -a, -Math.cos(a) * 0.5]} castShadow>
          <boxGeometry args={[0.46, 0.03, 0.1]} />
          <meshPhysicalMaterial {...POLISH.fabric} color={i % 2 ? "#3F6B33" : "#4E7D3C"} />
        </mesh>
      );
    })}
  </group>
);

const Boat: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("menyeberangi") - 0.4, W("kairo", 2) + 0.2);
  const x = GIZA.nile.x0 + 0.15 + (GIZA.nile.x1 - GIZA.nile.x0 - 0.3) * k;
  const rock = Math.sin(t * 2.2) * 0.03;
  return (
    <group position={[x, 0.03 + Math.sin(t * 1.7) * 0.01, GIZA.boatZ]} rotation={[rock, 0, rock * 0.6]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <RoundedBoxGeo args={[0.78, 0.12, 0.28]} radius={0.04} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      <mesh position={[0.05, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.015, 0.95, 8]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#3A2414" />
      </mesh>
      {/* lateen sail */}
      <mesh position={[0.18, 0.62, 0]} rotation={[0, 0, -0.35]} castShadow>
        <coneGeometry args={[0.3, 0.8, 3, 1]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={MM.cream} flatShading />
      </mesh>
      <PixelSprite map={PILGRIM_BACK_WHITE} px={0.022} position={[-0.2, 0.1, 0]} />
      <PixelSprite map={PILGRIM_BACK} px={0.022} position={[0.0, 0.1, 0.03]} />
      <mesh position={[0.26, 0.17, 0]} castShadow>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#B97F17" />
      </mesh>
    </group>
  );
};

/** Porters carry a chest of gold to the palace gate; then coins hop to each court official. */
const GoldToPalace: React.FC<{ t: number }> = ({ t }) => {
  const carry = ramp(t, W("mengirim") - 0.3, W("sultan") + 0.4);
  const from: V3 = [14.7, 0, 1.0];
  const to = GIZA.chestAt;
  const cx = from[0] + (to[0] - from[0]) * carry;
  const cz = from[2] + (to[2] - from[2]) * carry;
  const lift = carry < 0.98 ? 0.3 + Math.abs(Math.sin(t * 7)) * 0.02 : 0.3 * (1 - ramp(t, W("sultan") + 0.4, W("sultan") + 0.9));
  const officials = [
    { x: 15.6, z: -1.55, map: OFFICIAL_BACK },
    { x: 15.95, z: -1.3, map: OFFICIAL_BACK_GREEN },
    { x: 16.65, z: -1.3, map: OFFICIAL_BACK },
    { x: 17.0, z: -1.55, map: OFFICIAL_BACK_GREEN },
    { x: 16.3, z: -2.35, map: OFFICIAL_BACK },
  ];
  const t0 = W("setiap") - 0.1, t1 = W("emas", 4) + 0.1;
  const walk = (s: number) => Math.abs(Math.sin(t * 7 + s)) * 0.02;
  return (
    <group>
      {/* the two porters, either side of the chest */}
      {carry < 0.995 && (
        <>
          <PixelSprite map={PORTER_BACK} px={0.035} position={[cx - 0.32, 0, cz + 0.05]} bob={walk(0)} />
          <PixelSprite map={PORTER_BACK} px={0.035} position={[cx + 0.32, 0, cz - 0.05]} flip bob={walk(1.5)} />
        </>
      )}
      <group position={[cx, lift, cz]}>
        <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.46, 0.28, 0.3]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
        </mesh>
        {[-0.15, 0.15].map((x) => (
          <mesh key={x} position={[x, 0.14, 0]}>
            <boxGeometry args={[0.035, 0.29, 0.31]} />
            <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.35} />
          </mesh>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <Coin key={i} pos={[-0.15 + (i % 3) * 0.15, 0.29 + Math.floor(i / 3) * 0.012, -0.08 + Math.floor(i / 3) * 0.08]} r={0.05} rot={[0.2, i, 0.1]} />
        ))}
        <pointLight position={[0, 0.5, 0.2]} color={MM.lanternHot} intensity={1.2} distance={1.4} decay={2} />
      </group>
      {officials.map((o, i) => {
        const at = t0 + ((t1 - t0) * i) / officials.length;
        const k = ramp(t, at, at + 0.45);
        const got = k >= 0.999;
        const sx = to[0] + (o.x - to[0]) * k;
        const sz = to[2] + (o.z - to[2]) * k;
        const sy = 0.45 + Math.sin(k * Math.PI) * 0.5 + (got ? 0.08 : 0);
        return (
          <group key={i}>
            <PixelSprite map={o.map} px={0.034} position={[o.x, 0, o.z]} bob={got ? Math.abs(Math.sin((t - at) * 6)) * 0.03 * (1 - ramp(t, at + 0.6, at + 1.4)) : 0} />
            {k > 0.001 && <Coin pos={[got ? o.x + 0.12 : sx, got ? 0.28 : sy, got ? o.z + 0.02 : sz]} r={0.04} rot={[Math.PI / 2, 0, t * 3]} />}
          </group>
        );
      })}
    </group>
  );
};

export const GizaZone: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const walk = (s: number) => Math.abs(Math.sin(t * 6 + s)) * 0.02;
  const reeds = useMemo(() => {
    const r = prng(5);
    return Array.from({ length: 40 }, (_, i) => ({ x: (i % 2 ? GIZA.nile.x1 + 0.05 : GIZA.nile.x0 - 0.05) + (r() - 0.5) * 0.12, z: 3 - r() * 10.5, h: 0.12 + r() * 0.18 }));
  }, []);
  const fire = 0.8 + 0.2 * Math.sin(f * 0.21) * Math.sin(f * 0.07 + 1);
  return (
    <group>
      {/* diorama slab for this set */}
      <mesh position={[13, -0.25, -2.6]} receiveShadow>
        <RoundedBoxGeo args={[12.4, 0.5, 11.6]} radius={0.06} />
        <meshPhysicalMaterial {...POLISH.stone} color="#7A5A3A" bumpMap={grain} bumpScale={0.7} />
      </mesh>
      {/* the Nile */}
      <mesh position={[(GIZA.nile.x0 + GIZA.nile.x1) / 2, 0.012, -2.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[GIZA.nile.x1 - GIZA.nile.x0, 11.5]} />
        <meshPhysicalMaterial color="#2C5878" roughness={0.12} metalness={0.2} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {[GIZA.nile.x0, GIZA.nile.x1].map((x) => (
        <mesh key={x} position={[x, 0.02, -2.6]} receiveShadow>
          <boxGeometry args={[0.12, 0.04, 11.5]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#4E6B34" />
        </mesh>
      ))}
      {reeds.map((r, i) => (
        <mesh key={i} position={[r.x, r.h / 2, r.z]}>
          <boxGeometry args={[0.025, r.h, 0.025]} />
          <meshStandardMaterial color={i % 3 ? "#5F8A3E" : "#7FA04A"} />
        </mesh>
      ))}
      <Palm p={[11.9, 0, -0.6]} seed={1} />
      <Palm p={[11.8, 0, -4.2]} h={1.3} seed={2} />
      <Palm p={[14.3, 0, 1.4]} h={1.0} seed={3} />
      <Palm p={[14.2, 0, -5.4]} h={1.25} seed={4} />

      {/* pyramids of Giza behind the camp */}
      <BigPyramid x={8.4} z={-6.9} s={2.8} rot={0.5} />
      <BigPyramid x={10.9} z={-7.9} s={2.2} rot={0.4} />
      <BigPyramid x={6.9} z={-8.7} s={1.3} rot={0.6} />

      {/* the camp */}
      <Tent p={[9.0, 0, -1.7]} c={[MM.cream, MM.red]} />
      <Tent p={[10.3, 0, -2.6]} s={1.15} c={[MM.indigo, MM.gold]} />
      <Tent p={[11.2, 0, -1.4]} s={0.9} c={[MM.red, MM.cream]} />
      <Tent p={[9.5, 0, -0.5]} s={0.85} c={[MM.cream, MM.indigo]} />
      <Tent p={[11.0, 0, -3.4]} s={1.0} c={[MM.cream, MM.red]} />
      <group position={[10.15, 0, -1.25]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 1.26) * 0.1, 0.03, Math.sin(i * 1.26) * 0.1]} rotation={[0, i, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
            <meshStandardMaterial color="#3A2414" />
          </mesh>
        ))}
        <mesh position={[0, 0.1 + 0.02 * fire, 0]}>
          <coneGeometry args={[0.07, 0.2 * fire, 6]} />
          <meshBasicMaterial color="#FFB347" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.35, 0]} color="#FF9A3C" intensity={3.2 * fire} distance={3.2} decay={2} />
      </group>
      <PixelSprite map={CAMEL_GOLD} px={0.034} position={[8.6, 0, -0.6]} bob={walk(1) * 0.3} />
      <PixelSprite map={CAMEL_GOLD} px={0.034} position={[11.6, 0, -2.4]} flip bob={walk(2) * 0.3} />
      <PixelSprite map={PILGRIM_BACK} px={0.034} position={[9.8, 0, -0.9]} />
      <PixelSprite map={PILGRIM_BACK_WHITE} px={0.034} position={[10.5, 0, -0.75]} />
      <PixelSprite map={PILGRIM_BACK_WHITE} px={0.034} position={[10.9, 0, -1.9]} />

      <Boat t={t} />

      {/* Cairo across the river: the palace gate, a dome and a minaret */}
      <group position={GIZA.palace} scale={0.62}>
        <CityGate z={0} />
      </group>
      <Dome x={16.3} z={-4.0} r={0.75} drum={1.2} />
      <Dome x={18.0} z={-4.6} r={0.55} drum={1.0} color="#8E6E4E" />
      <Minaret x={14.9} z={-4.2} h={3.3} s={0.8} />
      <group position={[16.3, 0, 0]}>
        <LanternString z={-1.5} y={1.7} span={2.6} f={f + 70} />
      </group>
      <GoldToPalace t={t} />
    </group>
  );
};
