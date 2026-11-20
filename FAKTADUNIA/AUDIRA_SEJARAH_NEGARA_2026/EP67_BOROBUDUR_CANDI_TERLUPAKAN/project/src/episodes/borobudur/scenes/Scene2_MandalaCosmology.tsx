import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/**
 * Scene 2: Arsitektur Mandala & 504 Arca Buddha (16s – 43s)
 * VO: Sepuluh Tingkat · 2.672 Panel Relief (5.5 km) · 504 Arca Buddha · Kamadhatu/Rupadhatu/Arupadhatu
 */
export const Scene2_MandalaCosmology: React.FC<{ t: number }> = ({ t }) => {
  // Highlight pulses for the 3 cosmic realms
  const realmPulse = (start: number, end: number) =>
    interpolate(t, [start, start + 0.8, end - 0.8, end], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const kamadhatuGlow = realmPulse(20, 26);
  const rupadhatuGlow = realmPulse(26, 36);
  const arupadhatuGlow = realmPulse(36, 43);

  // Concentric square terraces (Kamadhatu & Rupadhatu)
  const squareTerraces = [
    { size: 7.2, h: 0.28, y: 0.14 },
    { size: 6.2, h: 0.26, y: 0.41 },
    { size: 5.2, h: 0.26, y: 0.67 },
    { size: 4.3, h: 0.26, y: 0.93 },
    { size: 3.5, h: 0.26, y: 1.19 },
    { size: 2.8, h: 0.26, y: 1.45 },
  ];

  // Concentric circular terraces (Arupadhatu)
  const circularTerraces = [
    { radius: 1.15, h: 0.22, y: 1.69, stupaCount: 16 },
    { radius: 0.85, h: 0.22, y: 1.91, stupaCount: 12 },
    { radius: 0.55, h: 0.22, y: 2.13, stupaCount: 8 },
  ];

  // Stupas layout on circular terraces
  const stupaPositions = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; rot: number }> = [];
    circularTerraces.forEach((circ) => {
      for (let i = 0; i < circ.stupaCount; i++) {
        const angle = (i / circ.stupaCount) * Math.PI * 2;
        const x = Math.cos(angle) * circ.radius;
        const z = Math.sin(angle) * circ.radius;
        list.push({
          pos: [x, circ.y + 0.12, z],
          rot: angle,
        });
      }
    });
    return list;
  }, []);

  // Buddha statues facing 4 cardinal directions on square terraces
  const buddhaStatues = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; rot: number }> = [];
    // Place Buddhas around terrace 3 and 4
    const radii = [1.9, 1.5];
    radii.forEach((r, idx) => {
      const y = 0.95 + idx * 0.26;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        list.push({
          pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
          rot: angle + Math.PI / 2,
        });
      }
    });
    return list;
  }, []);

  return (
    <group>
      {/* 1. Base Temple Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2B3629" roughness={0.9} />
      </mesh>

      {/* 2. Concentric Square Terraces (6 Teras Persegi Bawah) */}
      {squareTerraces.map((sq, i) => (
        <group key={`sq-${i}`} position={[0, sq.y, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[sq.size, sq.h, sq.size]} />
            <meshStandardMaterial
              color="#3E3A36"
              roughness={0.85}
              metalness={0.1}
            />
          </mesh>
          {/* Carved relief gallery edge */}
          <mesh position={[0, sq.h * 0.45, 0]}>
            <boxGeometry args={[sq.size + 0.04, 0.08, sq.size + 0.04]} />
            <meshStandardMaterial
              color={i === 0 && kamadhatuGlow > 0.1 ? "#60A5FA" : (rupadhatuGlow > 0.1 ? "#D4AF37" : "#4A4540")}
              emissive={i === 0 && kamadhatuGlow > 0.1 ? "#60A5FA" : (rupadhatuGlow > 0.1 ? "#D4AF37" : "#000000")}
              emissiveIntensity={i === 0 ? kamadhatuGlow * 0.4 : rupadhatuGlow * 0.4}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Concentric Circular Terraces (3 Teras Melingkar Atas) */}
      {circularTerraces.map((circ, i) => (
        <mesh
          key={`circ-${i}`}
          position={[0, circ.y, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[circ.radius, circ.radius * 1.05, circ.h, 32]} />
          <meshStandardMaterial
            color="#48423D"
            roughness={0.8}
            metalness={0.15}
            emissive={arupadhatuGlow > 0.1 ? "#80A4ED" : "#000000"}
            emissiveIntensity={arupadhatuGlow * 0.3}
          />
        </mesh>
      ))}

      {/* 4. Bell-Shaped Lattice Stupas on Circular Terraces */}
      {stupaPositions.map((stupa, i) => (
        <group key={`stupa-${i}`} position={stupa.pos} scale={0.36}>
          {/* Stupa Bell Body */}
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.38, 0.44, 16]} />
            <meshStandardMaterial color="#3A3734" roughness={0.78} metalness={0.15} />
          </mesh>
          {/* Stupa Spire (Harmika) */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.06, 0.22, 8]} />
            <meshStandardMaterial color="#4A4540" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* 5. Central Grand Stupa (Stupa Induk di Puncak) */}
      <group position={[0, 2.35, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.52, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial
            color="#4D463F"
            roughness={0.75}
            metalness={0.2}
            emissive="#FFD700"
            emissiveIntensity={arupadhatuGlow * 0.35}
          />
        </mesh>
        {/* Crown Pinnacle Spire */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.12, 0.55, 12]} />
          <meshStandardMaterial color="#5C534B" roughness={0.7} metalness={0.25} />
        </mesh>
      </group>

      {/* 6. Meditating Buddha Statues along square terraces */}
      {buddhaStatues.map((b, i) => (
        <group key={`buddha-${i}`} position={b.pos} rotation={[0, b.rot, 0]} scale={0.22}>
          <AssetModel
            id="cathedral-statue-base"
            assetType="character"
            size={1.1}
            ground
            tint="#3D3A37"
            roughness={0.88}
            castShadow
          />
        </group>
      ))}

      {/* 7. Surrounding Stone Stairs & Access Portals */}
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={2.2}
        position={[0, 0, 3.8]}
        rotation={[0, 0, 0]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={2.2}
        position={[0, 0, -3.8]}
        rotation={[0, Math.PI, 0]}
        ground
        castShadow
        receiveShadow
      />

      {/* 8. Surrounding Lush Trees at Base */}
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={4.8}
        position={[-6.5, 0, -5.2]}
        ground
        castShadow
      />
      <AssetModel
        id="broad-canopy-shade-tree-e7c4a2"
        assetType="prop"
        size={5.2}
        position={[6.8, 0, 5.0]}
        ground
        castShadow
      />
      <AssetModel
        id="banana-plant-978d7f"
        assetType="prop"
        size={2.2}
        position={[-5.0, 0, 4.2]}
        ground
        castShadow
      />
    </group>
  );
};
