import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/**
 * Scene 1: Lembah Kedu & Kelahiran Borobudur (0s – 16s)
 * VO: 2 Juta Blok Batu · Tanpa Semen · Dinasti Sailendra 750 M · Lembah Kedu
 */
export const Scene1_KeduValley: React.FC<{ t: number }> = ({ t }) => {
  // Stacking stone blocks grid (2 Million stones motif)
  const stoneBlocks = useMemo(() => {
    const blocks: Array<{ pos: [number, number, number]; rot: [number, number, number]; delay: number }> = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const x = (col - 3.5) * 0.42;
      const z = (row - 2.5) * 0.42;
      const y = (row % 2 === 0 ? 0.05 : 0.22);
      blocks.push({
        pos: [x, y, z],
        rot: [0, (i % 4) * (Math.PI / 2), 0],
        delay: (i / count) * 8,
      });
    }
    return blocks;
  }, []);

  return (
    <group>
      {/* 1. Valley Ground & Hill Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 60, 32, 32]} />
        <meshStandardMaterial color="#223824" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* 2. Natural Basalt Rocks & Foothills */}
      <AssetModel
        id="basalt-boulder-a1929c"
        assetType="prop"
        size={2.4}
        position={[-3.2, 0, -1.8]}
        rotation={[0, 0.4, 0]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="basalt-column-outcrop-f1339d"
        assetType="prop"
        size={2.8}
        position={[3.4, 0, -2.2]}
        rotation={[0, -0.6, 0]}
        ground
        castShadow
        receiveShadow
      />
      <AssetModel
        id="palm-tree-a307da"
        assetType="prop"
        size={3.8}
        position={[-4.5, 0, 1.2]}
        ground
        castShadow
      />
      <AssetModel
        id="palm-tree-a307da"
        assetType="prop"
        size={3.2}
        position={[4.2, 0, 0.8]}
        ground
        castShadow
      />

      {/* 3. Hero Andesite Terrace Foundation Being Built */}
      <AssetModel
        id="terrace-stone-stair-494ef8"
        assetType="building"
        size={4.2}
        position={[0, 0, -0.5]}
        rotation={[0, 0, 0]}
        ground
        castShadow
        receiveShadow
      />

      {/* 4. Interlocking Andesite Stones Descending Into Place */}
      <group position={[0, 0.2, 0.6]}>
        {stoneBlocks.map((b, i) => {
          const dropStart = b.delay;
          const dropEnd = dropStart + 1.2;
          const progress = interpolate(t, [dropStart, dropEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const currentY = b.pos[1] + (1 - progress) * 3.5;
          const currentOpacity = Math.min(1, progress * 1.5);

          return (
            <mesh
              key={i}
              position={[b.pos[0], currentY, b.pos[2]]}
              rotation={b.rot}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.38, 0.16, 0.38]} />
              <meshStandardMaterial
                color="#3D3B38"
                roughness={0.88}
                metalness={0.12}
                transparent={currentOpacity < 1}
                opacity={currentOpacity}
              />
            </mesh>
          );
        })}
      </group>

      {/* 5. Floating Dust & Chiseling Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 60 * 3 }, (_, i) => {
                  const axis = i % 3;
                  if (axis === 0) return (Math.random() - 0.5) * 8;
                  if (axis === 1) return Math.random() * 2.5 + 0.1;
                  return (Math.random() - 0.5) * 8;
                })
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#D8C8A8" transparent opacity={0.6} />
      </points>
    </group>
  );
};
