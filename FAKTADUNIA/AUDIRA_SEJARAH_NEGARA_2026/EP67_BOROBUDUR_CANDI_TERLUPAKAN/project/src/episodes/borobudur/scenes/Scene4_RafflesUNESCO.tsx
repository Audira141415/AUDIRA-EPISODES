import React from "react";
import { interpolate } from "remotion";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/**
 * Scene 4: Penemuan Raffles 1814 & Restorasi Akbar UNESCO (58s – 80s)
 * VO: 1814 · Thomas Raffles · Menyingkap Vegetasi · Restorasi UNESCO 1983 · Warisan Dunia 1991
 */
export const Scene4_RafflesUNESCO: React.FC<{ t: number }> = ({ t }) => {
  // Clearing & restoration animation progress
  const clearingProgress = interpolate(t, [58, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const unescoProgress = interpolate(t, [69, 79], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <group>
      {/* 1. Archaeological Ground Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[45, 45]} />
        <meshStandardMaterial color="#2E3328" roughness={0.9} />
      </mesh>

      {/* 2. Rediscovered Stone Monument Rising from the Clearing */}
      <group position={[0, 0, 0]}>
        {/* Tiered stone terrace foundation */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.8, 0.7, 6.8]} />
          <meshStandardMaterial
            color={unescoProgress > 0.5 ? "#48433E" : "#322E2B"}
            roughness={0.82}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.5, 5.2]} />
          <meshStandardMaterial
            color={unescoProgress > 0.5 ? "#46413C" : "#302C29"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Circular stupa platform */}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.5, 32]} />
          <meshStandardMaterial
            color={unescoProgress > 0.5 ? "#4E4842" : "#35312E"}
            roughness={0.78}
          />
        </mesh>
        {/* Central pinnacle */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.6, 0.8, 16]} />
          <meshStandardMaterial color="#554E47" roughness={0.75} />
        </mesh>
      </group>

      {/* 3. Restored Stone Stairs */}
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={3.4}
        position={[0, 0, 3.2]}
        rotation={[0, 0, 0]}
        ground
        castShadow
        receiveShadow
      />

      {/* 4. 1814 Raffles Expedition Camp & Equipment */}
      <AssetModel
        id="soldiers-tent-4bd5b9"
        size={2.6}
        position={[-3.8, 0, 2.2]}
        rotation={[0, 0.5, 0]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="basalt-boulder-a1929c"
        assetType="prop"
        size={1.8}
        position={[-2.8, 0, 0.8]}
        ground
        castShadow
        receiveShadow
      />

      {/* 5. Cut Jungle Canopy Being Cleared Away */}
      <group position={[clearingProgress * -2.5, 0, 0]}>
        <AssetModel
          id="broad-canopy-shade-tree-e7c4a2"
          assetType="prop"
          size={5.2}
          position={[-5.8, 0, -3.2]}
          ground
          castShadow
        />
        <AssetModel
          id="banana-plant-978d7f"
          assetType="prop"
          size={2.4}
          position={[-3.6, 0, -2.0]}
          ground
          castShadow
        />
      </group>
      <group position={[clearingProgress * 2.5, 0, 0]}>
        <AssetModel
          id="broad-canopy-shade-tree-e7c4a2"
          assetType="prop"
          size={5.6}
          position={[5.5, 0, -3.0]}
          ground
          castShadow
        />
        <AssetModel
          id="banana-plant-978d7f"
          assetType="prop"
          size={2.6}
          position={[3.8, 0, 1.2]}
          ground
          castShadow
        />
      </group>

      {/* 6. UNESCO Blueprint / Restoration Measurement Grid (1973–1983) */}
      {unescoProgress > 0.05 && (
        <group position={[0, 0.72, 0]}>
          <gridHelper args={[7, 14, "#48CAE4", "#0077B6"]} />
        </group>
      )}

      {/* 7. Sunbeams / Discovery Light Flare */}
      <directionalLight
        position={[6, 9, 4]}
        intensity={2.8 + unescoProgress * 0.8}
        color="#FFE5B4"
        castShadow
      />
    </group>
  );
};
