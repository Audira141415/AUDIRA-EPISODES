import React from "react";
import { computeVisualInvestigationState } from "../core/motion";
import { VISUALINVESTIGATION_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";

/** Podium block on the courtroom floorplan. */
const Podium: React.FC<{ position: [number, number, number]; args: [number, number, number]; color: string; glow?: number }> = ({ position, args, color, glow = 0 }) => (
  <mesh position={position} castShadow receiveShadow>
    <RoundedBoxGeo args={args} radius={0.03} />
    <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} emissive={color} emissiveIntensity={glow} />
  </mesh>
);

/** Cold charcoal investigation table with a courtroom floorplan model (judge, prosecutor, witness, defense). */
export const ForensicDesk3D: React.FC<{ f: number }> = ({ f }) => {
  const { activePodiumPulse } = computeVisualInvestigationState(f);
  const grain = useSurfaceGrain(23, 0.2, 5);
  return (
    <group>
      {/* Table */}
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshPhysicalMaterial {...POLISH.stone} color={C.panelCharcoal} roughness={0.75} roughnessMap={grain} bumpMap={grain} bumpScale={0.3} />
      </mesh>

      {/* Floorplan slab */}
      <group position={[-1.05, -0.25, 0.25]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[2.1, 0.08, 2.4]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.paper} color="#1B222C" />
        </mesh>
        {/* Blueprint hairlines */}
        {[-0.7, -0.2, 0.3, 0.8].map((z) => (
          <mesh key={z} position={[0, 0.082, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.9, 0.008]} />
            <meshBasicMaterial color={C.hairlineGrey} />
          </mesh>
        ))}
        <Podium position={[0, 0.2, -0.8]} args={[1.1, 0.24, 0.32]} color="#384152" />
        <Podium position={[-0.65, 0.17, 0.25]} args={[0.36, 0.18, 0.5]} color="#2b3240" />
        <Podium position={[0.65, 0.17, 0.25]} args={[0.36, 0.18, 0.5]} color="#2b3240" />
        {/* Active witness podium */}
        <group position={[0, 0.26 * activePodiumPulse, -0.05]} scale={[1, activePodiumPulse, 1]}>
          <Podium position={[0, 0, 0]} args={[0.42, 0.34, 0.42]} color={C.evidenceRed} glow={0.35} />
        </group>
      </group>
    </group>
  );
};
