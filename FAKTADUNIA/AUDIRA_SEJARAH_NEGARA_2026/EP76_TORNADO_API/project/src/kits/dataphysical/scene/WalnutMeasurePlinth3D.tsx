import React from "react";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { computeDataPhysicalState } from "../core/motion";
import { DATAPHYSICAL_PALETTE as C } from "../lib/palette";
import { BRASS, WALNUT } from "../lib/materials";

/** Stand-in when the coin-stack GLB is missing: five brass discs. */
const CoinStackFallback: React.FC = () => (
  <group>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[(i % 2) * 0.012, 0.02 + i * 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.036, 40]} />
        <meshPhysicalMaterial color={C.brassGold} {...BRASS} />
      </mesh>
    ))}
  </group>
);

/** Walnut plinth, brass scale rail, teal acrylic benchmark plate, studio floor and a coin-stack scale prop. */
export const WalnutMeasurePlinth3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeDataPhysicalState(f);
  const grain = useSurfaceGrain(37, 0.18, 2);
  return (
    <group>
      {/* Studio floor: catches the key shadow so the sculpture sits on something */}
      <mesh position={[0, -0.445, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshPhysicalMaterial color="#2A2B2F" {...POLISH.stone} />
      </mesh>
      {/* Studio cyclorama behind the plinth: a lit backdrop so the dark walnut and the columns separate */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[60, 14]} />
        <meshPhysicalMaterial color={C.studioBackdrop} {...POLISH.paper} />
      </mesh>

      <group rotation={[0, state.turntableYaw, 0]}>
        {/* Oiled walnut slab */}
        <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[3.8, 0.44, 2.2]} radius={0.05} />
          <meshPhysicalMaterial color={C.walnutBase} {...WALNUT} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} />
        </mesh>

        {/* Brass scale rail on the front bevel, with ticks */}
        <mesh position={[0, -0.05, 1.11]} castShadow>
          <RoundedBoxGeo args={[3.4, 0.08, 0.04]} radius={0.01} />
          <meshPhysicalMaterial color={C.brassGold} {...BRASS} />
        </mesh>
        {Array.from({ length: 15 }, (_, i) => (
          <mesh key={i} position={[-1.68 + i * 0.24, -0.12, 1.112]}>
            <boxGeometry args={[0.012, i % 2 ? 0.05 : 0.09, 0.012]} />
            <meshPhysicalMaterial color={C.brassGold} {...BRASS} />
          </mesh>
        ))}

        {/* Teal acrylic benchmark plate */}
        <mesh position={[0, state.brassMarkerY, 0]}>
          <RoundedBoxGeo args={[3.5, 0.035, 1.85]} radius={0.012} />
          <meshPhysicalMaterial color={C.acrylicTeal} transparent opacity={0.42} roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
        <SceneText font="sans" position={[1.7, state.brassMarkerY + 0.08, 0.93]} fontSize={0.1} anchorX="right" color={C.acrylicTeal} letterSpacing={0.08}>
          BENCHMARK
        </SceneText>

        {/* Engraved brand plate on the plinth front (brand inside the scene, cannot be cropped out) */}
        <SceneText font="sans" position={[-1.7, -0.3, 1.105]} fontSize={0.1} anchorX="left" color={C.brassGold} letterSpacing={0.18}>
          AUDIRA · DATA PHYSICAL
        </SceneText>

        {/* Scale prop: a stack of coins, so the columns read as money */}
        <group position={[1.5, 0, 0.66]}>
          <AssetModel id="gold-coin-stack-a9ef52" assetType="prop" size={0.36} ground fallback={<CoinStackFallback />} />
        </group>
      </group>
    </group>
  );
};
