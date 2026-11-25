import React, { useMemo } from "react";
import { RETROWAVE_PALETTE } from "../lib/palette";
import { createSynthGridMaterial, createSynthSunMaterial } from "../lib/materials";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

/** Grid cells travelled per film frame (one cell per 20 frames, as in the original kit). */
export const GRID_SPEED = 0.05;

/** Procedural wedge coupe, used only if the GLB cannot load. */
const CoupeBlock: React.FC = () => (
  <group>
    <mesh position={[0, 0.32, 0]} castShadow>
      <RoundedBoxGeo args={[1.5, 0.38, 3.2]} radius={0.12} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1a1030" />
    </mesh>
    <mesh position={[0, 0.66, 0.2]} castShadow>
      <RoundedBoxGeo args={[1.2, 0.3, 1.3]} radius={0.1} />
      <meshPhysicalMaterial {...POLISH.glossyEye} color="#2a2a40" />
    </mesh>
  </group>
);

/** Low wireframe mountain ridge on the horizon (unlit, magenta lines). */
const Ridge: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <mesh position={[x, 0, -30]} rotation={[0, flip ? Math.PI : 0, 0]}>
    <coneGeometry args={[7, 4.2, 5, 3]} />
    <meshBasicMaterial color={RETROWAVE_PALETTE.neonMagenta} wireframe transparent opacity={0.55} />
  </mesh>
);

export const RetroSunAndGrid: React.FC<{ f: number; car?: boolean }> = ({ f, car = true }) => {
  const grid = useMemo(createSynthGridMaterial, []);
  const sun = useMemo(createSynthSunMaterial, []);
  const travel = f * GRID_SPEED;
  grid.uniforms.scroll.value = -travel;
  sun.uniforms.drift.value = (f * 0.004) % 1;

  // Palms recycle every 8 units of travel, so the avenue never ends.
  const palmZ = (k: number) => ((travel + k * 8) % 32) - 28;

  return (
    <group>
      {/* 1. Striped synth sun on the horizon */}
      <mesh position={[0, 1.2, -34]} material={sun}>
        <planeGeometry args={[22, 22]} />
      </mesh>
      <Ridge x={-11} />
      <Ridge x={12} flip />

      {/* 2. Infinite neon grid floor */}
      <mesh position={[0, 0, -20]} rotation={[-Math.PI / 2, 0, 0]} material={grid} receiveShadow>
        <planeGeometry args={[80, 60]} />
      </mesh>

      {/* 3. Palm avenue */}
      {[0, 1, 2, 3].map((k) =>
        [-3.6, 3.6].map((x) => (
          <AssetModel
            key={`${k}${x}`}
            id="palm-tree-a307da"
            size={3.4}
            ground
            tint="#1b0f33"
            emissive={RETROWAVE_PALETTE.neonMagenta}
            emissiveIntensity={0.18}
            position={[x, 0, palmZ(k) + (x > 0 ? 4 : 0)]}
            rotation={[0, k * 1.3, 0]}
          />
        )),
      )}

      {/* 4. Hero: wedge coupe cruising the grid */}
      {car ? (
        <group position={[0, 0.02 + Math.sin(f * 0.21) * 0.012, 0]}>
          <AssetModel id="wedge-coupe-80s-9f8b5e" size={2.9} ground polish="toyPlastic" rotation={[0, Math.PI, 0]} fallback={<CoupeBlock />} />
          {/* Tail-light bar */}
          <mesh position={[0, 0.44, 1.46]}>
            <boxGeometry args={[1.1, 0.05, 0.02]} />
            <meshBasicMaterial color={[4, 0.2, 0.8]} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
