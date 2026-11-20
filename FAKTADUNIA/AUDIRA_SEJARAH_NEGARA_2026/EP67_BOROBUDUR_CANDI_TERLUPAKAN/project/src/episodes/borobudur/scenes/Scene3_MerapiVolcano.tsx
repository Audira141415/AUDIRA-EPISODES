import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/**
 * Scene 3: Letusan Gunung Merapi & Terkubur Hutan Rimba (43s – 58s)
 * VO: Abad Kesepuluh · Merapi Meletus · Hutan Tropis Merayap · Terlupakan 700 Tahun
 */
export const Scene3_MerapiVolcano: React.FC<{ t: number }> = ({ t }) => {
  // Overgrowth & ash burial progress
  const burialProgress = interpolate(t, [44, 57], [0.1, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Falling volcanic ash particle positions
  const ashParticles = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* 1. Volcanic Ash Terrain (Buried Ground) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1A1816" roughness={0.96} metalness={0.05} />
      </mesh>

      {/* 2. Distant Volcanic Silhouette & Lava Glow (Gunung Merapi) */}
      <group position={[0, 0, -18]}>
        {/* Merapi Volcanic Cone */}
        <mesh position={[0, 4.5, 0]}>
          <coneGeometry args={[14, 9, 32]} />
          <meshStandardMaterial color="#141215" roughness={0.95} />
        </mesh>
        {/* Crater Eruption Plume & Glow */}
        <mesh position={[0, 8.8, 0]}>
          <cylinderGeometry args={[2.5, 0.8, 3.5, 16]} />
          <meshStandardMaterial
            color="#FF4500"
            emissive="#FF3300"
            emissiveIntensity={1.8}
            roughness={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* 3. Ancient Buried Temple Ruins Under Creeping Jungle */}
      <group position={[0, -burialProgress * 0.45, 0]}>
        {/* Main stepped terraces submerged under ash */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.8, 6.5]} />
          <meshStandardMaterial color="#2B2724" roughness={0.92} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.6, 4.8]} />
          <meshStandardMaterial color="#282421" roughness={0.92} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 0.5, 24]} />
          <meshStandardMaterial color="#25211E" roughness={0.9} />
        </mesh>
      </group>

      {/* 4. Ruined Gable & Cracked Walls */}
      <AssetModel
        id="ruined-gable-end-834895"
        assetType="building"
        size={3.2}
        position={[-1.8, 0.2, 1.2]}
        rotation={[0, 0.6, 0]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="basalt-boulder-a1929c"
        assetType="prop"
        size={2.6}
        position={[2.4, 0, 1.8]}
        rotation={[0.2, -0.4, 0.1]}
        ground
        castShadow
        receiveShadow
      />

      {/* 5. Dense Creeping Tropical Jungle (Merayap & Menelan Candi) */}
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={5.5 + burialProgress * 0.8}
        position={[-2.8, 0, -2.5]}
        ground
        castShadow
      />
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={6.2 + burialProgress * 0.6}
        position={[3.2, 0, -1.8]}
        ground
        castShadow
      />
      <AssetModel
        id="banana-plant-978d7f"
        assetType="prop"
        size={2.8}
        position={[-1.2, 0.3, 2.2]}
        ground
        castShadow
      />
      <AssetModel
        id="banana-plant-978d7f"
        assetType="prop"
        size={3.2}
        position={[1.5, 0.2, 2.0]}
        ground
        castShadow
      />
      <AssetModel
        id="palm-tree-a307da"
        assetType="prop"
        size={4.2}
        position={[-4.5, 0, 1.5]}
        rotation={[0.1, 0, 0.15]}
        ground
        castShadow
      />

      {/* 6. Falling Volcanic Ash & Embers */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ashParticles, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#FF6633" transparent opacity={0.75} />
      </points>

      {/* 7. Thick Volcanic Smoke / Dark Atmosphere Light */}
      <directionalLight position={[0, 6, -10]} intensity={1.8} color="#FF5500" />
      <ambientLight intensity={0.2} color="#4A2520" />
    </group>
  );
};
