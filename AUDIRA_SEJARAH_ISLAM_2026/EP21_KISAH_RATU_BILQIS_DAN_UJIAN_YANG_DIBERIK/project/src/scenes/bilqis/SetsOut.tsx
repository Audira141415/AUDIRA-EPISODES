// EP21 outdoor sets: the city of Saba with its sun temple and the Marib dam (intro), Sulaiman's camp
// with the perched birds and one empty perch (hudhud), the Saba sun temple at dusk (the news), the
// desert road where the gift caravan turns back and the throne streaks away (singgasana), and the
// dawn hill above Sulaiman's palace (payoff). Each set sits at the origin; one is mounted per segment.
// Adab: Sulaiman only small and from behind; no faces; no script of the Name on any world object.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite, type SpriteMap } from "./pixel.tsx";
import { U, Sky, Ground, Scatter, Backer, Spot, textTexture, grain, grainFine } from "./world.tsx";
import { ashlarTex } from "./SetsHall.tsx";
import {
  BILQIS_BACK, BILQIS_DUA, SULAIMAN_BACK, SABA_BACK, PIGEON, CROW, HAWK, HUDHUD, HUDHUD_FLY, CAMEL_GIFT,
} from "./sprites.ts";
import { W, WL, ramp, OUTRO_AT } from "./time.ts";
import { CUTS } from "./camera.ts";

type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const Block: React.FC<{ pos: V3; size: V3; color: string; bump?: number }> = ({ pos, size, color, bump = 0.8 }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.02} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={bump} />
  </mesh>
);

/** Mud-brick house with a parapet and an optional lit window (faces +z, toward the camera). */
const House: React.FC<{ x: number; y?: number; z: number; w: number; h: number; d: number; lit?: boolean; seed: number }> = ({ x, y = 0, z, w, h, d, lit, seed }) => {
  const r = prng(seed);
  const tone = ["#B08A60", "#A67E56", "#BC9668"][Math.floor(r() * 3)];
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={tone} bumpMap={grain} bumpScale={0.7} />
      </mesh>
      <mesh position={[0, h + 0.03, 0]} castShadow>
        <boxGeometry args={[w + 0.03, 0.06, d + 0.03]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#7E5E40" />
      </mesh>
      {/* tower-house window bands (Saba style: white-framed small windows) */}
      {[0.35, 0.65].map((k) => (
        <mesh key={k} position={[0, h * k, d / 2 + 0.002]}>
          <planeGeometry args={[w * 0.5, 0.05]} />
          <meshStandardMaterial color="#EDE3CF" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, d / 2 + 0.003]}>
        <planeGeometry args={[0.16, 0.3]} />
        <meshStandardMaterial color="#1A120C" />
      </mesh>
      {lit && (
        <mesh position={[w * 0.25, h * 0.8, d / 2 + 0.004]}>
          <planeGeometry args={[0.09, 0.09]} />
          <meshBasicMaterial color="#FFB860" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const Palm: React.FC<{ x: number; y?: number; z: number; h: number }> = ({ x, y = 0, z, h }) => (
  <group position={[x, y, z]}>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[0.02 * Math.sin(i), (h / 6) * (i + 0.5), 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, h / 6, 8]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#5A4230" bumpMap={grainFine} bumpScale={0.8} />
      </mesh>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[0, h, 0]} rotation={[0.9, (i / 8) * Math.PI * 2, 0]} castShadow>
        <coneGeometry args={[0.07, 0.75, 3]} />
        <meshStandardMaterial color="#3F6A32" roughness={0.9} flatShading />
      </mesh>
    ))}
  </group>
);

/** Glowing disc on a billboard (sun), unfogged. */
const SunDisc: React.FC<{ pos: V3; size: number; color?: string; opacity?: number }> = ({ pos, size, color = "#FFD9A0", opacity = 1 }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,250,235,1)");
    gr.addColorStop(0.28, "rgba(255,226,170,1)");
    gr.addColorStop(0.36, "rgba(255,190,120,0.55)");
    gr.addColorStop(1, "rgba(255,150,90,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={pos}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex ?? undefined} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

/** Square-pillared Saba sun temple: stepped podium, a row of pillars, a lintel, a gold disc on top. */
const SunTemple: React.FC<{ pos: V3; s?: number }> = ({ pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <Block pos={[0, 0, 0]} size={[2.0, 0.14, 1.2]} color="#C9AE84" bump={0.5} />
    <Block pos={[0, 0.14, -0.05]} size={[1.7, 0.12, 1.0]} color="#D2B88E" bump={0.5} />
    {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
      <Block key={x} pos={[x, 0.26, 0.3]} size={[0.13, 0.95, 0.13]} color="#E0CBA4" bump={0.4} />
    ))}
    <Block pos={[0, 1.21, 0.0]} size={[1.75, 0.14, 0.9]} color="#C4A67A" bump={0.5} />
    <Block pos={[0, 0.26, -0.3]} size={[1.5, 0.95, 0.3]} color="#B8976C" bump={0.6} />
    <mesh position={[0, 1.6, 0.0]} castShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.05, 40]} />
      <meshPhysicalMaterial color="#E0AE3A" metalness={0.9} roughness={0.25} emissive="#8A5A10" emissiveIntensity={0.35} />
    </mesh>
    <Block pos={[0, 1.35, 0.0]} size={[0.06, 0.25, 0.06]} color="#B8976C" bump={0.3} />
  </group>
);

// ---------------------------------------------------------------- SABA (intro, day)
export const SABA = { balcony: [0, 0, 0.7] as V3, balconyH: 0.6, queen: [0, 0.6, 0.62] as V3, gate: { x: 1.2, z: -1.6, boardY: 1.15 }, temple: [-1.3, 0, -3] as V3, damZ: -5 };

export const SabaSet: React.FC<{ t: number; f: number }> = () => {
  const board = useMemo(() => textTexture("AUDIRA", { color: "#F2C35A", bg: "#3A2416", border: "#C99A2E", font: "bold 128px 'MM Anton', Impact, sans-serif" }), []);
  const city = useMemo(() => {
    const r = prng(401);
    return Array.from({ length: 16 }, (_, i) => {
      const x = (r() - 0.5) * 6;
      return { x: Math.abs(x) < 0.45 ? x + Math.sign(x || 1) * 0.6 : x, z: -1.0 - r() * 3.4, w: 0.45 + r() * 0.3, h: 0.7 + r() * 0.9, d: 0.45 + r() * 0.25, seed: 410 + i, lit: false };
    }).filter((h) => !(h.x > 0.55 && h.x < 1.9 && h.z > -2.3));
  }, []);
  const g = SABA.gate;
  return (
    <group>
      <Sky top="#3E6AB0" mid="#9CC0E0" hor="#F2DCB0" />
      <fog attach="fog" args={["#E8D6B4", 7, 26]} />
      <SunDisc pos={[3.5, 7, -20]} size={4} opacity={0.8} />
      <Ground color="#C4A06C" r={40} bump={0.6} />
      {/* the queen's balcony: a palace terrace with a parapet, she looks out over the city */}
      <Block pos={[0, 0, SABA.balcony[2] + 0.35]} size={[1.6, SABA.balconyH, 1.1]} color="#C8A878" bump={0.5} />
      {[-0.75, 0.75].map((x) => <Block key={x} pos={[x, SABA.balconyH, SABA.balcony[2] - 0.15]} size={[0.1, 0.18, 0.1]} color="#B8976C" bump={0.4} />)}
      <Block pos={[0, SABA.balconyH, SABA.balcony[2] - 0.17]} size={[1.5, 0.06, 0.05]} color="#D9A63A" bump={0.2} />
      <PixelSprite map={BILQIS_BACK} px={0.036} position={SABA.queen} />
      <Backer pos={SABA.queen} w={0.36} h={0.56} opacity={0.1} />
      {/* city of tower houses */}
      {city.map((h, i) => <House key={i} {...h} />)}
      {/* sun temple on the left */}
      <SunTemple pos={SABA.temple} s={0.9} />
      {/* gate with the AUDIRA board on the right */}
      <Block pos={[g.x - 0.5, 0, g.z]} size={[0.28, 1.25, 0.34]} color="#A88660" />
      <Block pos={[g.x + 0.5, 0, g.z]} size={[0.28, 1.25, 0.34]} color="#A88660" />
      <Block pos={[g.x, 0.92, g.z]} size={[1.3, 0.18, 0.32]} color="#9A7852" />
      <mesh position={[g.x, g.boardY, g.z + 0.18]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial map={board ?? undefined} roughness={0.6} metalness={0.15} />
      </mesh>
      {/* the Marib dam: long stone wall with the reservoir behind it, sluice gates in front */}
      <Block pos={[0, 0, SABA.damZ]} size={[9, 0.9, 0.5]} color="#A8865C" bump={0.7} />
      {[-2.4, -0.8, 0.8, 2.4].map((x) => <Block key={x} pos={[x, 0, SABA.damZ + 0.3]} size={[0.3, 1.0, 0.2]} color="#957650" bump={0.5} />)}
      <mesh position={[0, 0.82, SABA.damZ - 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 5.5]} />
        <meshPhysicalMaterial color="#4E8AA4" roughness={0.1} metalness={0.2} clearcoat={1} />
      </mesh>
      {[[-3.2, -6.2, 2.4], [3.4, -6.6, 2.8], [0.2, -8.5, 3.4]].map(([x, z, s], i) => (
        <mesh key={i} position={[x, s * 0.5, z]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[s * 0.9, s, 5]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#A0805E" bumpMap={grain} bumpScale={0.4} flatShading />
        </mesh>
      ))}
      {/* the gardens of Saba */}
      {[[-1.9, -0.6], [-2.4, 0.5], [2.2, -0.3], [2.6, 0.8], [-0.9, -4.3], [1.6, -4.4], [-2.8, -3.8]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.1 + (i % 3) * 0.3} />)}
      <Scatter seed={402} n={80} x={[-3.5, 3.5]} z={[-4.6, 2.5]} rock="#8A6A48" shrub="#5E7A34" keep={(x, z) => Math.abs(x) > 0.95 || z < -0.6} />
      {/* small crowd in the street, from behind */}
      {[[-0.5, -1.0], [-0.3, -1.25], [0.35, -1.1], [-0.75, -1.5]].map(([x, z], i) => (
        <PixelSprite key={i} map={SABA_BACK[i % 4]} px={0.028} position={[x, 0, z]} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- CAMP (Sulaiman's birds)
export const CAMP = { perchY: 0.18, perchZ: -0.5, gapX: 0.42, sulaiman: [-1.5, 0, -1.4] as V3 };
const BIRD_XS = [-1.55, -1.33, -1.1, -0.88, -0.66, -0.44, -0.22, 0.0, 0.2, 0.64, 0.86, 1.08];
const BIRD_MAPS: SpriteMap[] = [PIGEON, CROW, HAWK, PIGEON, CROW, PIGEON, HAWK, CROW, PIGEON, HAWK, PIGEON, CROW];
/** The hoopoe returns from far away at the end of the camp segment. */
export function hudhudCamp(t: number): V3 | null {
  const a = WL("l08", "ada") + 0.1;
  const b = CUTS[2] + 0.1;
  if (t < a) return null;
  return lerp3([2.6, 1.5, -5], [1.0, 0.55, -1.0], Math.min(1, (t - a) / (b - a)));
}

export const CampSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const missing = ramp(t, W("tidak") - 0.2, W("tidak") + 0.3);
  const hh = hudhudCamp(t);
  const pulse = 0.6 + 0.4 * Math.sin(f * 0.18);
  return (
    <group>
      <Sky top="#4A78B8" mid="#A8C8E0" hor="#EEDCB6" />
      <fog attach="fog" args={["#E2D2B0", 5, 22]} />
      <Ground color="#C6A274" r={40} bump={0.6} />
      {/* the long perch: a timber rail on posts */}
      <mesh position={[-0.2, CAMP.perchY, CAMP.perchZ]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.018, 0.018, 3.0, 10]} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.timber} bumpMap={grainFine} bumpScale={0.6} />
      </mesh>
      {[-1.65, -0.6, 0.42, 1.2].map((x) => (
        <Block key={x} pos={[x, 0, CAMP.perchZ]} size={[0.04, CAMP.perchY, 0.04]} color="#5A3A22" bump={0.3} />
      ))}
      {BIRD_XS.map((x, i) => (
        <PixelSprite key={i} map={BIRD_MAPS[i]} px={0.026} position={[x, CAMP.perchY + 0.012, CAMP.perchZ]} flip={i % 3 === 1} bob={0.004 * Math.sin(f * 0.11 + i)} />
      ))}
      {/* the empty place of the hoopoe: a pulsing gold ring around the bare perch */}
      {missing > 0.001 && (
        <mesh position={[CAMP.gapX, CAMP.perchY + 0.09, CAMP.perchZ]} scale={0.8 + 0.2 * missing}>
          <torusGeometry args={[0.1, 0.008, 8, 40]} />
          <meshBasicMaterial color="#FFC860" transparent opacity={missing * pulse} toneMapped={false} />
        </mesh>
      )}
      {/* the camp: tents, a cooking tripod */}
      <AssetModel id="canvas-ridge-tent-f0df0d" size={1.1} ground position={[-0.7, 0, -2.4]} rotation={[0, 0.3, 0]} />
      <AssetModel id="canvas-ridge-tent-f0df0d" size={1.0} ground position={[1.1, 0, -2.8]} rotation={[0, -0.4, 0]} />
      <AssetModel id="canvas-ridge-tent-f0df0d" size={1.2} ground position={[2.4, 0, -1.6]} rotation={[0, -0.8, 0]} />
      <AssetModel id="campfire-cook-tripod-d95a1e" size={0.4} ground position={[0.9, 0, -1.1]} />
      {/* Nabi Sulaiman: small, far, from behind, at the head of the line */}
      <PixelSprite map={SULAIMAN_BACK} px={0.028} position={CAMP.sulaiman} />
      {[[-1.75, -1.55], [-1.25, -1.6]].map(([x, z], i) => <PixelSprite key={i} map={SABA_BACK[(i + 1) % 4]} px={0.026} position={[x, 0, z]} />)}
      <Scatter seed={403} n={90} x={[-3.5, 3.5]} z={[-3.5, 2.0]} rock="#8A6A48" shrub="#6E7A3A" keep={(x, z) => Math.abs(z - CAMP.perchZ) > 0.35} />
      {[[-3.0, -3.4], [3.2, -3.8], [-2.3, -5.0]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.3} />)}
      {hh && (
        <group position={hh}>
          <PixelSprite map={Math.floor(f / 6) % 2 ? HUDHUD_FLY : HUDHUD} px={0.03} flip />
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- TEMPLE (dusk, the news)
export const TEMPLE = { queen: [0, 0, -1.6] as V3, hudhud: [0.5, 0.32, -0.2] as V3, sun: [0, 1, -14] as V3 };
export function hudhudTemple(t: number): { p: V3; landed: boolean } {
  const a = CUTS[2] - 0.2;
  const b = WL("l09", "dari") + 0.2;
  const k = ramp(t, a, b);
  return { p: lerp3([1.8, 1.3, 1.2], TEMPLE.hudhud, k), landed: k >= 0.999 };
}

export const TempleSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const h = hudhudTemple(t);
  const crowd = useMemo(() => {
    const r = prng(421);
    return Array.from({ length: 14 }, (_, i) => ({ p: [(r() - 0.5) * 2.4, 0, -2.2 - r() * 1.1] as V3, m: SABA_BACK[i % 4] }));
  }, []);
  const worship = ramp(t, W("menyembah") - 0.3, W("matahari") + 0.3);
  return (
    <group>
      <Sky top="#2A2E5E" mid="#C8644A" hor="#FFB070" />
      <fog attach="fog" args={["#C87A5A", 5, 24]} />
      <SunDisc pos={TEMPLE.sun} size={5.5 + 0.6 * worship} />
      <Ground color="#A87C50" r={40} bump={0.6} />
      {/* the temple forecourt: paved, a low altar with a fire bowl, the temple behind */}
      <mesh position={[0, 0.004, -2.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 3.4]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#C29A6A" bumpMap={grainFine} bumpScale={0.5} />
      </mesh>
      <SunTemple pos={[0, 0, -4.6]} s={1.3} />
      {[-1.6, 1.6].map((x) => <SunTemple key={x} pos={[x * 1.6, 0, -6.4]} s={0.8} />)}
      {crowd.map((c, i) => <PixelSprite key={i} map={c.m} px={0.028} position={c.p} />)}
      {/* the queen at the front of her people, from behind */}
      <PixelSprite map={BILQIS_BACK} px={0.036} position={TEMPLE.queen} />
      <Backer pos={TEMPLE.queen} w={0.36} h={0.56} opacity={0.12} />
      {/* a low stone where the hoopoe lands, watching from the edge */}
      <Block pos={[TEMPLE.hudhud[0], 0, TEMPLE.hudhud[2]]} size={[0.2, TEMPLE.hudhud[1], 0.2]} color="#9A7852" bump={0.6} />
      <group position={[h.p[0], h.p[1] + 0.005, h.p[2]]}>
        <PixelSprite map={h.landed ? HUDHUD : Math.floor(f / 6) % 2 ? HUDHUD_FLY : HUDHUD} px={0.028} flip={!h.landed} />
      </group>
      {[[-2.4, -1.2], [2.5, -1.5], [-2.9, -3.2]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.3 + (i % 2) * 0.3} />)}
      <Scatter seed={422} n={60} x={[-3.5, 3.5]} z={[-1.0, 2.0]} rock="#7A5032" />
      <Spot position={[0, 1.6, -9]} target={[0, 0.3, -1.6]} angle={0.5} penumbra={0.6} intensity={18} distance={14} decay={1.2} color="#FFB070" castShadow shadow-mapSize={[2048, 2048]} />
    </group>
  );
};

// ---------------------------------------------------------------- DESERT (gift refused, the throne)
export const DESERT = { palace: [0, 0, -8] as V3 };
/** Caravan head x: walks toward Sulaiman (+x), turns back at "menolak" and returns (-x). */
export function caravanAt(t: number): { x: number; back: boolean } {
  const a = CUTS[4] - 0.5;
  const m = W("menolak") + 0.25;
  const b = CUTS[5] + 0.3;
  if (t < m) return { x: 0.15 + 0.35 * Math.max(0, Math.min(1, (t - a) / (m - a))), back: false };
  return { x: 0.5 - 2.2 * Math.max(0, Math.min(1, (t - m) / (b - m))), back: true };
}
export function throneStreak(t: number) {
  const a = W("berkedip") - 0.05;
  return { k: ramp(t, a, a + 0.5), flash: Math.max(0, 1 - Math.abs(t - (a + 0.1)) / 0.35) };
}

const Palace: React.FC<{ pos: V3; s?: number; glow?: number }> = ({ pos, s = 1, glow = 0 }) => (
  <group position={pos} scale={s}>
    <Block pos={[0, 0, 0]} size={[3.2, 0.3, 1.6]} color="#E6DCC8" bump={0.3} />
    <Block pos={[0, 0.3, -0.1]} size={[2.4, 0.9, 1.1]} color="#EFE7D8" bump={0.3} />
    {[-1.4, 1.4].map((x) => <Block key={x} pos={[x, 0.3, 0]} size={[0.4, 1.4, 0.4]} color="#E2D6C0" bump={0.3} />)}
    {[-1.4, 1.4].map((x) => (
      <mesh key={x} position={[x, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#D9A63A" metalness={0.85} roughness={0.3} />
      </mesh>
    ))}
    <mesh position={[0, 1.2, -0.1]} castShadow>
      <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#D9A63A" metalness={0.85} roughness={0.3} emissive="#FFB040" emissiveIntensity={glow} />
    </mesh>
    {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => <Block key={x} pos={[x, 0.3, 0.48]} size={[0.1, 0.8, 0.1]} color="#F4EEE2" bump={0.2} />)}
  </group>
);

export const DesertSet: React.FC<{ t: number; f: number }> = ({ t }) => {
  const cv = caravanAt(t);
  const ph = Math.floor(t / 0.24) % 2;
  const st = throneStreak(t);
  const seal = useMemo(() => textTexture("AUDIRA", { color: "#F2C35A", bg: "#4A2A14", border: "#C99A2E", font: "bold 128px 'MM Anton', Impact, sans-serif" }), []);
  const dir = cv.back ? -1 : 1;
  const camels = [0, 1, 2].map((i) => ({ x: cv.x - dir * i * 0.8, z: -0.35 - i * 0.12 }));
  const sled = { x: cv.x - dir * 2.4, z: -0.55 };
  const thr = lerp3([-0.9, 0.45, 0.6], [0, 0.9, -7.6], st.k);
  return (
    <group>
      <Sky top="#4A70AE" mid="#E0B886" hor="#F6D8A4" />
      <fog attach="fog" args={["#E6C49A", 6, 30]} />
      <SunDisc pos={[-3, 5, -26]} size={5} opacity={0.85} />
      <Ground color="#D2A86C" r={50} bump={0.7} />
      <mesh position={[0, 0.004, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 0.9]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#DDB47A" bumpMap={grainFine} bumpScale={0.6} />
      </mesh>
      {[[-3.0, -3.5, 2.2], [1.6, -4.4, 2.8], [4.4, -3.0, 2.0], [-5.0, -6.0, 3.2]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.84, z]} castShadow receiveShadow>
          <sphereGeometry args={[r, 32, 16]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#C8955C" bumpMap={grain} bumpScale={0.4} />
        </mesh>
      ))}
      <Scatter seed={431} n={100} x={[-4, 4]} z={[-2.8, 2.5]} rock="#8A6038" keep={(x, z) => Math.abs(z + 0.4) > 0.5} />
      {/* Sulaiman's palace on the horizon */}
      <Palace pos={DESERT.palace} s={1.1} glow={0.6 * st.flash} />
      {/* the gift caravan: camels + a sled with the AUDIRA-stamped chest and the coin heap */}
      {camels.map((c, i) => (
        <PixelSprite key={i} map={CAMEL_GIFT} px={0.026} position={[c.x, 0, c.z]} flip={cv.back} bob={ph === i % 2 ? 0.006 : 0} />
      ))}
      <group position={[sled.x, 0, sled.z]}>
        <Block pos={[0, 0, 0]} size={[0.6, 0.05, 0.34]} color="#6A4426" bump={0.4} />
        <AssetModel id="chest-dais-d2bc39" size={0.28} ground position={[-0.12, 0.05, 0]} />
        <mesh position={[-0.12, 0.18, 0.13]}>
          <planeGeometry args={[0.16, 0.06]} />
          <meshStandardMaterial map={seal ?? undefined} roughness={0.6} />
        </mesh>
        <AssetModel id="coin-hoard-heap-07b6e4" size={0.2} ground position={[0.16, 0.05, 0]} />
      </group>
      {[0, 1].map((i) => (
        <PixelSprite key={i} map={SABA_BACK[(i + 2) % 4]} px={0.026} position={[sled.x + dir * (0.4 + i * 0.25), 0, sled.z + 0.3]} bob={ph === i ? 0.006 : 0} />
      ))}
      {/* the throne streaks to the palace in the blink of an eye */}
      {st.k > 0.001 && st.k < 0.999 && (
        <group position={thr} scale={1 - 0.75 * st.k}>
          <AssetModel id="looted-gilded-throne-008fc3" size={0.5} ground position={[0, -0.25, 0]} />
          <pointLight color="#FFD890" intensity={8} distance={3} decay={1.2} />
        </group>
      )}
      {st.k > 0.001 && st.k < 0.999 && (
        <mesh position={lerp3([-0.9, 0.45, 0.6], thr, 0.5)}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#FFE0A0" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
      {st.flash > 0.001 && <pointLight position={[0, 1.2, -1]} color="#FFE6B0" intensity={10 * st.flash} distance={10} decay={1.1} />}
    </group>
  );
};

// ---------------------------------------------------------------- HILL (payoff, dawn)
export const HILL = { queen: [0, 0, -0.4] as V3, sulaiman: [0.95, 0, -1.0] as V3 };
export const raised = (t: number) => t >= W("berserah") - 0.1;

export const HillSet: React.FC<{ t: number; f: number }> = ({ t }) => {
  const c8 = CUTS[7];
  const rise = ramp(t, c8, OUTRO_AT);
  const sunY = -0.2 + 2.0 * rise;
  const town = useMemo(() => {
    const r = prng(451);
    return Array.from({ length: 18 }, (_, i) => ({ x: (r() - 0.5) * 10, z: -6.5 - r() * 5, w: 0.5 + r() * 0.5, h: 0.5 + r() * 0.8, d: 0.5 + r() * 0.3, seed: 460 + i, lit: r() > 0.5 }));
  }, []);
  const roof = useMemo(() => ashlarTex(452, "#B89670", "#6A5034", 6), []);
  return (
    <group>
      <Sky top="#30447E" mid="#E0907A" hor="#FFD49A" />
      <fog attach="fog" args={["#E8A684", 7, 34]} />
      <SunDisc pos={[0.2, sunY, -30]} size={8 + 2 * rise} />
      {/* hilltop with a flat paved crest */}
      <mesh position={[0, -0.8, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 5.0, 1.6, 48]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#A6845A" bumpMap={grain} bumpScale={0.6} />
      </mesh>
      <mesh position={[0, 0.006, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.9, 40]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#C8A878" map={roof ?? undefined} />
      </mesh>
      <Scatter seed={453} n={110} x={[-2.4, 2.4]} z={[-2.8, 1.8]} rock="#7E6244" shrub="#6E7A3A" keep={(x, z) => Math.hypot(x, z + 0.5) < 2.5 && Math.hypot(x, z + 0.4) > 0.95} />
      <group position={[0, -1.6, 0]}>
        <Ground color="#9A7A5A" r={60} bump={0.5} />
        <Palace pos={[0, 0, -9]} s={1.8} glow={0.25 * rise} />
        {town.map((h, i) => <House key={i} {...h} />)}
        {[[-4.5, -7.5], [3.8, -8], [-2.0, -11], [4.8, -11.5], [-5.5, -10]].map(([x, z], i) => <Palm key={i} x={x} z={z} h={1.4} />)}
        <mesh position={[0, 0.01, -14]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 2.0]} />
          <meshPhysicalMaterial color="#8AAABA" roughness={0.1} metalness={0.3} clearcoat={1} />
        </mesh>
      </group>
      {/* the queen from behind; hands raised at "berserah"; Sulaiman small and from behind */}
      <PixelSprite map={raised(t) ? BILQIS_DUA : BILQIS_BACK} px={0.036} position={HILL.queen} />
      <Backer pos={HILL.queen} w={0.4} h={0.6} opacity={0.1} />
      <PixelSprite map={SULAIMAN_BACK} px={0.026} position={HILL.sulaiman} />
    </group>
  );
};
