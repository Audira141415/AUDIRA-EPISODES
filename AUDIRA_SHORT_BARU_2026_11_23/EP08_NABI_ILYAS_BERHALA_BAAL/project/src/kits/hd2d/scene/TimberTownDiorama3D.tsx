import React from "react";
import { computeHd2dState } from "../core/motion";
import { HD2D_PALETTE } from "../lib/palette";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { hd2dTexture } from "../lib/textures";
import { prng } from "../../../core/materials/textures.ts";

// Seeded micro-grain shared by every component in this file (cached, identical in every render tab).
const grain = surfaceGrain(53, 256, 0.35, 4);
// Seeded colour maps (lib/textures.ts): stones, mortar, wood grain; each doubles as its bump map.
const tex = {
  base: hd2dTexture("cobble", [4.4, 2.9]),
  apron: hd2dTexture("cobble", [7, 3.4], 39),
  path: hd2dTexture("cobble", [2.6, 0.8], 36),
  wall: hd2dTexture("ashlar", [1.2, 1.2]),
  wallBig: hd2dTexture("ashlar", [2, 2], 37),
  plank: hd2dTexture("plank", [1, 1]),
  beam: hd2dTexture("plank", [0.3, 2], 38),
  roof: hd2dTexture("shingle", [2, 2]),
};

/** Seeded star positions [x, y, size, brightness] in the sky band above the roofs (z −10). */
const STARS: [number, number, number, number][] = (() => {
  const rnd = prng(3535);
  return Array.from({ length: 90 }, () => [-6 + rnd() * 12, 1.4 + rnd() * 3.2, rnd() > 0.85 ? 0.09 : 0.055, 0.45 + rnd() * 0.55]);
})();

/** Foreground barrel (timber staves, dark iron hoops). */
const Barrel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.54, 20]} />
      <meshPhysicalMaterial {...POLISH.stone} roughness={0.8} color="#8A5E3C" map={tex.beam} bumpMap={tex.beam} bumpScale={0.6} />
    </mesh>
    {[0.1, 0.44].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.205, 0.014, 6, 24]} />
        <meshStandardMaterial color="#1B1D22" roughness={0.45} metalness={0.7} />
      </mesh>
    ))}
  </group>
);

/** Foreground plank crate. */
const Crate: React.FC<{ position: [number, number, number]; size: number; rot?: number }> = ({ position, size, rot = 0 }) => (
  <mesh position={[position[0], position[1] + size / 2, position[2]]} rotation={[0, rot, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={[size, size, size]} />
    <meshPhysicalMaterial {...POLISH.stone} color="#7A5536" map={tex.plank} bumpMap={tex.plank} bumpScale={0.8} />
  </mesh>
);

/** Polyfork medieval two-story house for the back row (local public/models/polyfork first, then CDN). */
export const BACK_HOUSE_ID = "two-story-house-40f6dc";

/** Procedural stand-in for the back-row house when the GLB cannot load. */
const HouseFallback: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[1.5, 1.8, 1.2]} />
      <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.5} />
    </mesh>
    <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[1.15, 0.7, 4]} />
      <meshPhysicalMaterial {...POLISH.stone} color={HD2D_PALETTE.timberBeam} />
    </mesh>
  </group>
);

const Window: React.FC<{ position: [number, number, number]; size: [number, number]; on: number; base: number }> = ({ position, size, on, base }) => (
  <mesh position={position}>
    <planeGeometry args={size} />
    <meshStandardMaterial color={HD2D_PALETTE.lanternAmber} emissive={HD2D_PALETTE.lanternAmber} emissiveIntensity={base * on} />
  </mesh>
);

export const TimberTownDiorama3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeHd2dState(f);
  const [w1, w2, w3] = state.windows;
  return (
    <group>
      {/* Diorama cobblestone square (z −2.8 … +2.0, lit by the lantern pool) */}
      <mesh position={[0, -0.3, -0.4]} receiveShadow>
        <RoundedBoxGeo args={[7.2, 0.6, 4.8]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#4E5A74" map={tex.base} bumpMap={tex.base} bumpScale={0.5} />
      </mesh>
      {/* Dark street apron toward the camera (z 2.0 … 5.6): fills the bottom band of the 9:16 frame
          (the old base left the bottom fifth empty navy) and stays darker than the lantern square, so
          the eye falls on the lit centre like a vignetted miniature */}
      <mesh position={[0, -0.3, 3.8]} receiveShadow>
        <RoundedBoxGeo args={[7.2, 0.6, 3.6]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#34405A" map={tex.apron} bumpMap={tex.apron} bumpScale={0.9} />
      </mesh>
      {/* Cobble path toward the camera (slightly lighter stone) */}
      <mesh position={[-0.2, 0.005, 0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.4, 1.0]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#76809C" map={tex.path} bumpMap={tex.path} bumpScale={0.5} />
      </mesh>

      {/* Foreground (soft in the tilt-shift): a low stone wall left, barrels and crates right */}
      <mesh position={[-1.6, 0.2, 3.4]} rotation={[0, 0.12, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.8, 0.4, 0.34]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#5E6880" map={tex.wall} bumpMap={tex.wall} bumpScale={0.9} />
      </mesh>
      <Barrel position={[1.35, 0, 3.2]} />
      <Barrel position={[1.78, 0, 3.55]} />
      <Crate position={[1.0, 0, 3.75]} size={0.36} rot={0.3} />
      <Crate position={[1.55, 0, 4.15]} size={0.3} rot={-0.2} />
      {/* Moonlit cobble run on the apron: a lighter lane that leads the eye from the frame bottom
          into the lantern square (round 2: the bottom third read as one murky blur) */}
      <mesh position={[-0.2, 0.004, 3.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 3.2]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#5A6684" map={tex.path} bumpMap={tex.path} bumpScale={0.5} />
      </mesh>
      {/* Small warm practical on the crate stack: a candle lantern that rims the blurred FG props
          and gives the bottom band its own soft bokeh highlight */}
      <group position={[1.2, 0.36, 3.95]}>
        <mesh>
          <RoundedBoxGeo args={[0.12, 0.16, 0.12]} />
          <meshStandardMaterial color={HD2D_PALETTE.lanternAmber} emissive={HD2D_PALETTE.lanternAmber} emissiveIntensity={1.6 * state.lanternFlicker} />
        </mesh>
        <pointLight position={[0, 0.12, 0.15]} color="#FFB45C" intensity={state.lanternFlicker * 4} distance={2.4} decay={1.6} />
      </group>
      {/* Cool moon wash on the apron (fills the bottom band without warming the hero's walls) */}
      <pointLight position={[-0.6, 1.4, 4.6]} color="#8FA8E0" intensity={2.2} distance={3.4} decay={1.5} />

      {/* Back row: two Polyfork houses (bevelled stone fallback), lit at the payoff */}
      <AssetModel id={BACK_HOUSE_ID} size={2.5} ground polish="stone" position={[-2.3, 0, -2.2]} rotation={[0, 0.35, 0]} fallback={<group position={[-2.3, 0, -2.2]}><HouseFallback color="#232A3A" /></group>} />
      <AssetModel id={BACK_HOUSE_ID} size={2.2} ground polish="stone" position={[2.4, 0, -2.3]} rotation={[0, -0.5, 0]} fallback={<group position={[2.4, 0, -2.3]}><HouseFallback color="#1E2433" /></group>} />
      <pointLight position={[0, 1.6, -1.6]} color={HD2D_PALETTE.lanternAmber} intensity={w3 * 2.2} distance={4.5} />

      {/* Left timber guildhouse */}
      <group position={[-1.55, 0.85, -0.8]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.5, 1.7, 1.4]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#2B3550" map={tex.wall} bumpMap={tex.wall} bumpScale={0.8} />
        </mesh>
        {/* timber beams */}
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0, 0.71]}>
            <boxGeometry args={[0.1, 1.7, 0.04]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#6A4A30" map={tex.beam} bumpMap={tex.beam} bumpScale={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.55, 0.71]}>
          <boxGeometry args={[1.34, 0.08, 0.04]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#6A4A30" map={tex.beam} bumpMap={tex.beam} bumpScale={0.5} />
        </mesh>
        <Window position={[0.3, 0.1, 0.72]} size={[0.45, 0.55]} on={w1} base={1.4} />
        {/* roof */}
        <mesh position={[0, 1.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.18, 0.6, 4]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#5A4034" map={tex.roof} bumpMap={tex.roof} bumpScale={0.7} />
        </mesh>
      </group>

      {/* Right stone archway & tavern */}
      <group position={[1.55, 0.95, -0.7]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.6, 1.9, 1.5]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#253049" map={tex.wallBig} bumpMap={tex.wallBig} bumpScale={0.8} />
        </mesh>
        <Window position={[-0.35, 0.15, 0.76]} size={[0.5, 0.55]} on={w2} base={1.2} />
        {/* tavern door */}
        <mesh position={[0.35, -0.6, 0.76]}>
          <planeGeometry args={[0.42, 0.7]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#6A4A30" map={tex.plank} bumpMap={tex.plank} bumpScale={0.6} />
        </mesh>
        <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.25, 0.6, 4]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#4A3830" map={tex.roof} bumpMap={tex.roof} bumpScale={0.7} />
        </mesh>
      </group>

      {/* Warm 2400K street lantern post */}
      <group position={[-0.65, 0.65, 0.45]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.05, 1.3, 12]} />
          <meshStandardMaterial color="#151821" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.55, 0]}>
          <RoundedBoxGeo args={[0.22, 0.28, 0.22]} />
          <meshStandardMaterial color={HD2D_PALETTE.lanternAmber} emissive={HD2D_PALETTE.lanternAmber} emissiveIntensity={state.lanternFlicker} />
        </mesh>
        <pointLight position={[0.2, 0.55, 0.1]} color={HD2D_PALETTE.lanternAmber} intensity={state.lanternFlicker * 14} distance={6} decay={1.4} />
      </group>

      {/* Moon (unlit disc far behind the town, outside the fog) */}
      <mesh position={[2.2, 5.2, -12]}>
        <circleGeometry args={[0.7, 48]} />
        <meshBasicMaterial color={HD2D_PALETTE.mistSilver} fog={false} />
      </mesh>
      {/* Pixel starfield behind the roofs (square 16-bit stars, slow 8 fps twinkle on the step clock) */}
      {STARS.map(([x, y, s, b], i) => (
        <mesh key={`star${i}`} position={[x, y, -10]}>
          <planeGeometry args={[s, s]} />
          <meshBasicMaterial color={HD2D_PALETTE.mistSilver} transparent opacity={b * (0.75 + 0.25 * Math.sin(state.spriteStepFrame * 0.7 + i))} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

