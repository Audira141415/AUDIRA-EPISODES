import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/**
 * Scene 5: Keagungan Abadi & Fajar Emas (80s – 95s)
 * VO: Borobudur Bukan Candi Biasa · Surat Peradaban Abadi · Ditulis Dalam Batu, Dibaca 12 Abad Kemudian
 */
export const Scene5_EternalDawn: React.FC<{ t: number }> = ({ t }) => {
  const dawnProgress = interpolate(t, [80, 93], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating sacred golden dust motes
  const motes = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 4.5 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* 1. Kedu Valley Morning Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2B3828" roughness={0.88} />
      </mesh>

      {/* 2. Valley Morning Mist Sea Layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial
          color="#FFE8D6"
          roughness={0.9}
          transparent
          opacity={0.35 + dawnProgress * 0.15}
        />
      </mesh>

      {/* 3. Fully Restored Majestic Borobudur Complex */}
      <group position={[0, 0, 0]}>
        {/* Tiered terraces */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 0.7, 7.2]} />
          <meshStandardMaterial color="#443F3A" roughness={0.78} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.6, 0.5, 5.6]} />
          <meshStandardMaterial color="#47423D" roughness={0.78} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.4, 4.2]} />
          <meshStandardMaterial color="#4A4540" roughness={0.76} metalness={0.15} />
        </mesh>

        {/* Circular stupa rings */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.4, 32]} />
          <meshStandardMaterial color="#504A44" roughness={0.74} metalness={0.18} />
        </mesh>
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.1, 1.3, 0.35, 28]} />
          <meshStandardMaterial color="#554E48" roughness={0.72} metalness={0.2} />
        </mesh>

        {/* Crown Stupa Induk Bathed in Golden Dawn */}
        <group position={[0, 2.5, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.62, 32, 28, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial
              color="#5D544C"
              roughness={0.68}
              metalness={0.25}
              emissive="#FFAA33"
              emissiveIntensity={0.25 + dawnProgress * 0.3}
            />
          </mesh>
          {/* Spire */}
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.12, 0.65, 16]} />
            <meshStandardMaterial
              color="#695E54"
              roughness={0.65}
              metalness={0.3}
              emissive="#FFD700"
              emissiveIntensity={0.3 + dawnProgress * 0.4}
            />
          </mesh>
        </group>
      </group>

      {/* 4. Restored Stone Staircases on 4 Sides */}
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={2.8}
        position={[0, 0, 3.8]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={2.8}
        position={[0, 0, -3.8]}
        rotation={[0, Math.PI, 0]}
        ground
        castShadow
        receiveShadow
      />

      {/* 5. Majestic Surrounding Trees & Hill Silhouette */}
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={5.4}
        position={[-6.2, 0, -4.5]}
        ground
        castShadow
      />
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={5.8}
        position={[6.5, 0, -4.2]}
        ground
        castShadow
      />
      <AssetModel
        id="palm-tree-a307da"
        assetType="prop"
        size={4.2}
        position={[5.2, 0, 3.8]}
        ground
        castShadow
      />

      {/* 6. Sacred Floating Dust Motes in Morning Sunbeams */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motes, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#FFE082" transparent opacity={0.7} />
      </points>

      {/* 7. Low Golden Dawn Directional Sun & Atmospheric Rim Light */}
      <directionalLight
        position={[-8, 3.5, -7]}
        intensity={3.8 + dawnProgress * 1.2}
        color="#FFA845"
        castShadow
      />
      <directionalLight position={[6, 5, 6]} intensity={0.6} color="#FFE8C0" />
      <ambientLight intensity={0.35} color="#4A3B2C" />
    </group>
  );
};
