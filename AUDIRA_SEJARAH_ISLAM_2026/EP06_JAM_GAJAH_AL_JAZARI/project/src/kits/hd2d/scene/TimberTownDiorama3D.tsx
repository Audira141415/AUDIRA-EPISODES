import React from "react";
import { computeHd2dState } from "../core/motion";
import { HD2D_PALETTE } from "../lib/palette";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../../core/polish/Polish.tsx";

// Seeded micro-grain shared by every component in this file (cached, identical in every render tab).
const grain = surfaceGrain(53, 256, 0.35, 4);

export const TimberTownDiorama3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeHd2dState(f);
  return (
    <group>
      {/* Stepped Diorama Cobblestone Base */}
      <mesh position={[0, -0.3, 0]}>
        <RoundedBoxGeo args={[5.2, 0.6, 3.8]} />
        <meshPhysicalMaterial {...POLISH.stone} color={HD2D_PALETTE.cobbleStone} bumpMap={grain} bumpScale={0.5} />
      </mesh>

      {/* Left Timber Guildhouse */}
      <group position={[-1.55, 0.85, -0.8]}>
        <mesh>
          <RoundedBoxGeo args={[1.5, 1.7, 1.4]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#252B3B" bumpMap={grain} bumpScale={0.5} />
        </mesh>
        {/* Warm Lit Pixel Window */}
        <mesh position={[0.3, 0.1, 0.71]}>
          <planeGeometry args={[0.45, 0.55]} />
          <meshStandardMaterial
            color={HD2D_PALETTE.lanternAmber}
            emissive={HD2D_PALETTE.lanternAmber}
            emissiveIntensity={1.4}
          />
        </mesh>
      </group>

      {/* Right Stone Archway & Tavern */}
      <group position={[1.55, 0.95, -0.7]}>
        <mesh>
          <RoundedBoxGeo args={[1.6, 1.9, 1.5]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#1E2433" bumpMap={grain} bumpScale={0.5} />
        </mesh>
        <mesh position={[-0.35, 0.15, 0.76]}>
          <planeGeometry args={[0.5, 0.55]} />
          <meshStandardMaterial
            color={HD2D_PALETTE.lanternAmber}
            emissive={HD2D_PALETTE.lanternAmber}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Warm 2400K Street Lantern Post */}
      <group position={[-0.65, 0.65, 0.45]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1.3, 12]} />
          <meshStandardMaterial color="#151821" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.55, 0]}>
          <RoundedBoxGeo args={[0.22, 0.28, 0.22]} />
          <meshStandardMaterial
            color={HD2D_PALETTE.lanternAmber}
            emissive={HD2D_PALETTE.lanternAmber}
            emissiveIntensity={state.lanternFlicker}
          />
        </mesh>
        <pointLight
          position={[0.2, 0.55, 0.1]}
          color={HD2D_PALETTE.lanternAmber}
          intensity={state.lanternFlicker * 1.5}
          distance={5}
        />
      </group>
    </group>
  );
};