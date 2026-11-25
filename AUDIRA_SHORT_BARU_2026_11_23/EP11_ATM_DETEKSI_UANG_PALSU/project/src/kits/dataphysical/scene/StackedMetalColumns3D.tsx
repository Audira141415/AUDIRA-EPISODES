import React from "react";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { computeDataPhysicalState, HERO, SERIES } from "../core/motion";
import { DATAPHYSICAL_PALETTE as C } from "../lib/palette";
import { ALUMINIUM, ANODISED, BRASS } from "../lib/materials";

/** Seven machined columns on the plinth; the hero (orange) breaks through the benchmark at the payoff. */
export const StackedMetalColumns3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeDataPhysicalState(f);
  // machining marks: a fine seeded grain on roughness so the aluminium is not CG-smooth
  const brushed = useSurfaceGrain(73, 0.12, 5);

  return (
    <group rotation={[0, state.turntableYaw, 0]}>
      {SERIES.map((_, i) => {
        const isHero = i === HERO;
        const x = (i - 3) * 0.46;
        const h = Math.max(0.05, state.heights[i]);
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <RoundedBoxGeo args={[0.32, h, 0.62]} radius={0.02} />
              <meshPhysicalMaterial
                color={isHero ? C.focalOrange : C.machinedAluminum}
                {...(isHero ? ANODISED : ALUMINIUM)}
                roughnessMap={brushed}
                emissive={isHero ? C.focalOrange : "#000000"}
                emissiveIntensity={isHero ? 0.08 + state.breakthrough * 0.35 : 0}
              />
            </mesh>
            {/* Brass cap */}
            <mesh position={[0, h + 0.022, 0]} castShadow>
              <RoundedBoxGeo args={[0.34, 0.044, 0.64]} radius={0.012} />
              <meshPhysicalMaterial color={C.brassGold} {...BRASS} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
