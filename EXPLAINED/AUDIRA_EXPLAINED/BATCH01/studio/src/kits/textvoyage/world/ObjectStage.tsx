import React from "react";
import { TEXTVOYAGE_PALETTE } from "../lib/palette";

export const MonolithGateway: React.FC<{ f: number }> = ({ f }) => {
  const zShift = f * 0.04;

  return (
    <group position={[0, 0, zShift]}>
      {/* Left Tower Pillar */}
      <mesh position={[-1.2, 0, -2]}>
        <boxGeometry args={[0.8, 3.8, 0.8]} />
        <meshStandardMaterial color={TEXTVOYAGE_PALETTE.monolithTitanium} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right Tower Pillar */}
      <mesh position={[1.2, 0, -2]}>
        <boxGeometry args={[0.8, 3.8, 0.8]} />
        <meshStandardMaterial color={TEXTVOYAGE_PALETTE.monolithTitanium} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Golden Overpass Lintle */}
      <mesh position={[0, 1.5, -2]}>
        <boxGeometry args={[3.2, 0.5, 0.8]} />
        <meshStandardMaterial color={TEXTVOYAGE_PALETTE.coreAccentGold} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};
