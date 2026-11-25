import React from "react";
import { BROADCASTFORGE_PALETTE } from "../lib/palette";
import { computeBroadcastForgeState } from "../core/motion";

export const LowerThirdTicker3D: React.FC<{ f: number; position?: [number, number, number] }> = ({
  f,
  position = [0, 0.95, 0.9],
}) => {
  const { liveBadgePulse } = computeBroadcastForgeState(f);
  const rotY = f * 0.02;

  return (
    <group position={position}>
      {/* 1. Floating 3D News Orb / Globe Icon */}
      <group position={[-1.35, 0, 0]} rotation={[0.2, rotY, 0]}>
        {/* Core sphere with emissive pulse */}
        <mesh>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial
            color={BROADCASTFORGE_PALETTE.breakingRed}
            emissive={BROADCASTFORGE_PALETTE.breakingRed}
            emissiveIntensity={0.5 * liveBadgePulse}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
        {/* Equatorial ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.015, 16, 48]} />
          <meshBasicMaterial color={BROADCASTFORGE_PALETTE.cyanAccent} />
        </mesh>
        {/* Polar orbit ring */}
        <mesh rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[0.22, 0.012, 16, 48]} />
          <meshBasicMaterial color={BROADCASTFORGE_PALETTE.liveAmber} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* 2. Floating 3D Glass Nameplate / Ticker Backing Bar */}
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[2.5, 0.28, 0.04]} />
        <meshPhysicalMaterial
          color="#080D16"
          roughness={0.12}
          metalness={0.35}
          transmission={0.55}
          thickness={0.08}
          clearcoat={0.85}
        />
      </mesh>

      {/* 3. Glowing Accent Trim */}
      <mesh position={[0.1, -0.13, 0.025]}>
        <boxGeometry args={[2.5, 0.02, 0.01]} />
        <meshBasicMaterial color={BROADCASTFORGE_PALETTE.breakingRed} />
      </mesh>
      <mesh position={[0.1, 0.13, 0.025]}>
        <boxGeometry args={[2.5, 0.015, 0.01]} />
        <meshBasicMaterial
          color={BROADCASTFORGE_PALETTE.cyanAccent}
          transparent
          opacity={liveBadgePulse}
        />
      </mesh>
    </group>
  );
};
