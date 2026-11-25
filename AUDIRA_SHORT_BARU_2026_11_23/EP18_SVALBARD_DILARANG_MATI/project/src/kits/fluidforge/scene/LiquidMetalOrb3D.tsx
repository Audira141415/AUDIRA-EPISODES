import React from "react";
import { computeFluidforgeState } from "../core/motion";
import { FLUIDFORGE_PALETTE } from "../lib/palette";

/**
 * Chrome ferrofluid core with eight iridescent satellite droplets. Payoff (8–10.5 s): the droplets
 * spiral inward and merge; the core swells and flashes once.
 */
export const LiquidMetalOrb3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeFluidforgeState(f);
  const droplets = [0, 1, 2, 3, 4, 5, 6, 7];
  const c = state.coalesce;
  const swell = 1 + c * 0.22 + state.shock * 0.06;

  return (
    <group position={[0, state.waveOffset * 0.4, 0]}>
      {/* Central ferrofluid chrome core: mirror metal, reflects the studio HDRI */}
      <mesh castShadow scale={[state.corePulse * swell, swell / state.corePulse, state.corePulse * swell]}>
        <sphereGeometry args={[0.92, 96, 96]} />
        <meshPhysicalMaterial
          color={FLUIDFORGE_PALETTE.chromeCore}
          metalness={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.04}
          iridescence={0.35 + c * 0.4}
          iridescenceIOR={1.6}
          emissive={FLUIDFORGE_PALETTE.cyanIridescent}
          emissiveIntensity={state.shock * 0.35}
        />
      </mesh>

      {/* Coalescing satellite liquid droplets */}
      {droplets.map((i) => {
        const angle = state.orbitAngle + (i * Math.PI * 2) / droplets.length;
        const radius = (1.32 + Math.sin(f * 0.05 + i) * 0.18) * (1 - c * 0.72);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * 2 + i) * 0.45 * (1 - c);
        const color = i % 2 === 0 ? FLUIDFORGE_PALETTE.cyanIridescent : FLUIDFORGE_PALETTE.magentaReflect;
        const r = (0.18 + (i % 3) * 0.04) * (1 - c * 0.85);
        // stretch along the direction of travel as they fall in (liquid, not billiard balls)
        const stretch = 1 + c * (1 - c) * 2.2;
        return (
          <mesh key={i} castShadow position={[x, y, z]} rotation={[0, -angle, 0]} scale={[1, 1 / Math.sqrt(stretch), stretch]}>
            <sphereGeometry args={[Math.max(0.001, r), 48, 48]} />
            <meshPhysicalMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              metalness={0.92}
              roughness={0.08}
              clearcoat={1}
              clearcoatRoughness={0.05}
              iridescence={1}
              iridescenceIOR={1.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};
