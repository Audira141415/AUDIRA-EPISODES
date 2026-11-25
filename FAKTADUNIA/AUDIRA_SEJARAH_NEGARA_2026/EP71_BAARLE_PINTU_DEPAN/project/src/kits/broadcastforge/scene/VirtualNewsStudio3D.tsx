import React from "react";
import { BROADCASTFORGE_PALETTE } from "../lib/palette";
import { RoundedBoxGeo } from "../../../core/polish/Polish";
import { computeBroadcastForgeState } from "../core/motion";

export const VirtualNewsStudio3D: React.FC<{ f: number }> = ({ f }) => {
  const { deskElevation, liveBadgePulse } = computeBroadcastForgeState(f);

  return (
    <group>
      {/* 1. Main Studio Floor - Obsidian Gloss Base */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial
          color={BROADCASTFORGE_PALETTE.floorGloss}
          roughness={0.16}
          metalness={0.42}
          clearcoat={0.65}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Dual Concentric Floor Light Rings */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshBasicMaterial color={BROADCASTFORGE_PALETTE.cyanAccent} opacity={0.65} transparent />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 3.43, 64]} />
        <meshBasicMaterial color={BROADCASTFORGE_PALETTE.breakingRed} opacity={0.4} transparent />
      </mesh>

      {/* 2. Anchor Podium Riser */}
      <mesh position={[0, 0.05, 0.2]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.1, 48]} />
        <meshStandardMaterial
          color={BROADCASTFORGE_PALETTE.studioVoid}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* 3. Sculpted Curved News Anchor Desk with Dual-Tier Wings */}
      <group position={[0, 0.45 + deskElevation, 0.5]}>
        {/* Main Central Desk Body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[2.4, 0.7, 0.8]} radius={0.15} />
          <meshPhysicalMaterial
            color={BROADCASTFORGE_PALETTE.broadcastNavy}
            roughness={0.22}
            metalness={0.48}
            clearcoat={0.45}
          />
        </mesh>

        {/* Desk Top Smoked Acrylic Counter */}
        <mesh position={[0, 0.36, 0]}>
          <RoundedBoxGeo args={[2.5, 0.04, 0.9]} radius={0.02} />
          <meshPhysicalMaterial
            color="#080C14"
            roughness={0.08}
            metalness={0.25}
            transmission={0.45}
            thickness={0.06}
          />
        </mesh>

        {/* Embedded Interactive Tablet / Teleprompter Screen on Desk Surface */}
        <mesh position={[0, 0.385, 0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.55, 0.01, 0.38]} />
          <meshStandardMaterial
            color="#09182A"
            emissive={BROADCASTFORGE_PALETTE.cyanAccent}
            emissiveIntensity={0.3}
            roughness={0.1}
          />
        </mesh>

        {/* Glowing Cyan LED Edge Strip on the Front Face of the Desk */}
        <mesh position={[0, 0.05, 0.41]}>
          <boxGeometry args={[2.2, 0.04, 0.02]} />
          <meshBasicMaterial color={BROADCASTFORGE_PALETTE.cyanAccent} />
        </mesh>

        {/* Desk Front Emblem / Accent Plate */}
        <mesh position={[0, -0.1, 0.41]}>
          <boxGeometry args={[0.9, 0.25, 0.01]} />
          <meshStandardMaterial
            color={BROADCASTFORGE_PALETTE.breakingRed}
            emissive={BROADCASTFORGE_PALETTE.breakingRed}
            emissiveIntensity={0.25 * liveBadgePulse}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      </group>

      {/* 4. Overhead Studio Lighting Trusses & Spotlights */}
      {[-2.5, 2.5].map((x) => (
        <group key={x} position={[x, 3.2, -1.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 4.0, 16]} />
            <meshStandardMaterial color="#222834" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Studio Spotlight Head */}
          <mesh position={[0, -0.2, 0]} rotation={[0.4, x > 0 ? -0.3 : 0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 0.3, 16]} />
            <meshStandardMaterial color="#111620" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Atmospheric Studio Depth Fog */}
      <fog attach="fog" args={[BROADCASTFORGE_PALETTE.studioVoid, 8, 22]} />
    </group>
  );
};
