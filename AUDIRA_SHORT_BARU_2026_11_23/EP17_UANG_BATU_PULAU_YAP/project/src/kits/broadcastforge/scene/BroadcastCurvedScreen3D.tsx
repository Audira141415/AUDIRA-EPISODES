import React from "react";
import { BROADCASTFORGE_PALETTE } from "../lib/palette";
import { computeBroadcastForgeState } from "../core/motion";

export const BroadcastCurvedScreen3D: React.FC<{ f: number }> = ({ f }) => {
  const { screenGlowIntensity, radarWave, marketDeltaPulse } = computeBroadcastForgeState(f);
  const scanOffset = ((f * 0.015) % 1) * 3.2 - 1.6;

  return (
    <group position={[0, 1.85, -2.2]}>
      {/* 1. Curved Video Wall Outer Backing Frame.
          The open cylinder's arc (theta 0.71π…1.29π) faces -z; offsetting it by +r puts the arc's
          centre near this group's origin (frame 4 cm behind the LEDs), so the wall sits behind the desk and its wings curve toward
          the camera. (A [0, π, 0] rotation here flipped the arc to +z, between camera and desk.) */}
      <mesh position={[0, 0, 5.2]}>
        <cylinderGeometry args={[5.22, 5.22, 3.25, 48, 1, true, Math.PI * 0.71, Math.PI * 0.58]} />
        <meshStandardMaterial
          color="#060910"
          roughness={0.5}
          metalness={0.8}
          side={2} // THREE.DoubleSide
        />
      </mesh>

      {/* 2. Emissive Curved LED Display Surface */}
      <mesh position={[0, 0, 5.2]}>
        <cylinderGeometry args={[5.18, 5.18, 3.12, 48, 1, true, Math.PI * 0.72, Math.PI * 0.56]} />
        <meshPhysicalMaterial
          color="#08203d"
          emissive={BROADCASTFORGE_PALETTE.broadcastNavy}
          emissiveIntensity={screenGlowIntensity * 0.8}
          roughness={0.35}
          metalness={0.12}
          side={2}
        />
      </mesh>

      {/* 3. Multi-Panel Screen Content Segments */}
      {/* Central World Map & Geospatial Radar Segment */}
      <group position={[0, 0.1, 0.04]}>
        {/* Map Silhouette Plates */}
        {[-1.6, -0.8, 0, 0.8, 1.6].map((x, idx) => (
          <mesh key={idx} position={[x, 0, 0]}>
            <boxGeometry args={[0.65, 1.4, 0.01]} />
            <meshStandardMaterial
              color="#2a6db0"
              emissive={BROADCASTFORGE_PALETTE.screenBlue}
              emissiveIntensity={2.4 + 0.3 * Math.sin(f * 0.05 + idx)}
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Dynamic Expanding Radar Ping Ring */}
        <mesh position={[0.2, 0.1, 0.02]} scale={[1 + radarWave * 1.5, 1 + radarWave * 1.5, 1]}>
          <ringGeometry args={[0.3, 0.33, 32]} />
          <meshBasicMaterial
            color={BROADCASTFORGE_PALETTE.cyanAccent}
            transparent
            opacity={Math.max(0, 1 - radarWave)}
          />
        </mesh>
      </group>

      {/* Left Segment: Financial & Statistical Data Tower */}
      <group position={[-2.1, 0, 0.12]} rotation={[0, 0.25, 0]}>
        {[0.6, 0.2, -0.2, -0.6].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <boxGeometry args={[0.85, 0.25, 0.01]} />
            <meshStandardMaterial
              color="#081728"
              emissive={idx % 2 === 0 ? BROADCASTFORGE_PALETTE.cyanAccent : BROADCASTFORGE_PALETTE.liveAmber}
              emissiveIntensity={0.3 * marketDeltaPulse}
              roughness={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* Right Segment: Remote Field Feed / Video Correspondent PIP Frame */}
      <group position={[2.1, 0, 0.12]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.95, 1.25, 0.01]} />
          <meshStandardMaterial
            color="#0A1828"
            emissive={BROADCASTFORGE_PALETTE.screenBlue}
            emissiveIntensity={0.35}
            roughness={0.2}
          />
        </mesh>
        {/* PIP Border Highlight */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.98, 1.28, 0.005]} />
          <meshBasicMaterial color={BROADCASTFORGE_PALETTE.cyanAccent} wireframe />
        </mesh>
      </group>

      {/* 4. Active Scanline Sweep across video wall */}
      <mesh position={[0, scanOffset, 0.06]}>
        <boxGeometry args={[4.9, 0.04, 0.01]} />
        <meshBasicMaterial
          color={BROADCASTFORGE_PALETTE.cyanAccent}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 5. Curved Screen Top & Bottom Bezel Glow Strips */}
      <mesh position={[0, 1.58, 0.05]}>
        <boxGeometry args={[5.1, 0.035, 0.02]} />
        <meshBasicMaterial color={BROADCASTFORGE_PALETTE.cyanAccent} />
      </mesh>
      <mesh position={[0, -1.58, 0.05]}>
        <boxGeometry args={[5.1, 0.035, 0.02]} />
        <meshBasicMaterial color={BROADCASTFORGE_PALETTE.breakingRed} />
      </mesh>
    </group>
  );
};
