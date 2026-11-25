import React from "react";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { BACKROOMS_PALETTE as C } from "../lib/palette";
import { CARPET, NOTICE, PLASTER, PLASTIC, TRIM, WALLPAPER } from "../lib/materials";

const H = 2.7;

/** Stand-in when the office-chair GLB is missing: seat, back, stem and a five-star base. */
const ChairFallback: React.FC = () => (
  <group>
    <mesh position={[0, 0.48, 0]} castShadow>
      <RoundedBoxGeo args={[0.5, 0.08, 0.48]} radius={0.03} />
      <meshPhysicalMaterial color="#2c2c30" {...CARPET} />
    </mesh>
    <mesh position={[0, 0.8, -0.22]} castShadow>
      <RoundedBoxGeo args={[0.46, 0.55, 0.06]} radius={0.03} />
      <meshPhysicalMaterial color="#2c2c30" {...CARPET} />
    </mesh>
    <mesh position={[0, 0.26, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
      <meshPhysicalMaterial color="#777" {...PLASTIC} metalness={0.8} roughness={0.35} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 5) * 0.2, 0.05, Math.sin((i * 2 * Math.PI) / 5) * 0.2]} rotation={[0, (-i * 2 * Math.PI) / 5, 0]} castShadow>
        <RoundedBoxGeo args={[0.4, 0.04, 0.05]} radius={0.01} />
        <meshPhysicalMaterial color="#1a1a1c" {...PLASTIC} />
      </mesh>
    ))}
  </group>
);

/** Damp stain patches on walls: darker, slightly greenish discolouration. */
const STAINS: { pos: [number, number, number]; size: [number, number]; rot?: number }[] = [
  { pos: [-1.68, 0.5, -2.4], size: [0.8, 0.6] },
  { pos: [1.68, 1.1, 0.8], size: [0.6, 0.9] },
  { pos: [-1.68, 0.3, 2.6], size: [1.0, 0.5] },
  { pos: [1.68, 0.7, -4.0], size: [0.7, 0.8] },
  { pos: [-1.68, 1.8, -0.2], size: [0.5, 0.4] },
];
const CARPET_STAINS: { pos: [number, number]; size: [number, number] }[] = [
  { pos: [-0.6, -1.8], size: [1.2, 0.8] },
  { pos: [0.4, 1.4], size: [0.9, 1.0] },
  { pos: [-0.3, -4.2], size: [0.7, 0.6] },
];

/** The yellow corridor: carpet, tiled ceiling, continuous wallpaper walls with fins, the far doorway and an abandoned office chair. */
export const LiminalMaze3D: React.FC<{ f: number }> = () => {
  const wallGrain = useSurfaceGrain(39, 0.16, 6);
  const carpetGrain = useSurfaceGrain(13, 0.3, 10);
  const stainGrain = useSurfaceGrain(51, 0.35, 8);
  const fins = [-3.0, -1.0, 1.0, 3.0];
  const wall = <meshPhysicalMaterial color={C.wallpaperYellow} {...WALLPAPER} roughnessMap={wallGrain} bumpMap={wallGrain} bumpScale={0.6} />;

  return (
    <group>
      {/* Damp ochre carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 18]} />
        <meshPhysicalMaterial color={C.carpetOchre} {...CARPET} roughnessMap={carpetGrain} bumpMap={carpetGrain} bumpScale={1.2} />
      </mesh>

      {/* Acoustic ceiling and its T-bar grid */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 18]} />
        <meshPhysicalMaterial color="#C8C2A8" {...PLASTER} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={`z${i}`} position={[0, H - 0.01, -6 + i * 1.2]}>
          <boxGeometry args={[4, 0.02, 0.03]} />
          <meshPhysicalMaterial color="#A8A28A" {...PLASTER} />
        </mesh>
      ))}
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={`x${x}`} position={[x, H - 0.01, 0]}>
          <boxGeometry args={[0.03, 0.02, 14]} />
          <meshPhysicalMaterial color="#A8A28A" {...PLASTER} />
        </mesh>
      ))}

      {/* Continuous side walls with wallpaper fins that make the corridor repeat */}
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, H / 2, -0.5]} receiveShadow>
          <boxGeometry args={[0.2, H, 12]} />
          {wall}
        </mesh>
      ))}
      {fins.map((z, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[-1.5, H / 2, z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.45, H, 0.5]} radius={0.02} />
            {wall}
          </mesh>
          <mesh position={[1.5, H / 2, z - 0.5]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.45, H, 0.5]} radius={0.02} />
            {wall}
          </mesh>
        </React.Fragment>
      ))}
      {/* Skirting board */}
      {[-1.69, 1.69].map((x) => (
        <mesh key={`sk${x}`} position={[x, 0.06, -0.5]}>
          <boxGeometry args={[0.03, 0.12, 12]} />
          <meshPhysicalMaterial color={C.trimWood} {...TRIM} />
        </mesh>
      ))}

      {/* Damp stains on walls: darker patches that break the mono-yellow */}
      {STAINS.map((s, i) => (
        <mesh key={`ws${i}`} position={s.pos} rotation={[0, s.pos[0] < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={s.size} />
          <meshPhysicalMaterial color="#8A7634" {...WALLPAPER} roughnessMap={stainGrain} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ))}
      {/* Carpet stains: water damage patches */}
      {CARPET_STAINS.map((s, i) => (
        <mesh key={`cs${i}`} position={[s.pos[0], 0.003, s.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={s.size} />
          <meshPhysicalMaterial color="#5C4A22" {...CARPET} roughnessMap={stainGrain} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}

      {/* Far wall with a dark doorway */}
      <mesh position={[-1.15, H / 2, -5.5]} receiveShadow>
        <boxGeometry args={[1.5, H, 0.3]} />
        {wall}
      </mesh>
      <mesh position={[1.15, H / 2, -5.5]} receiveShadow>
        <boxGeometry args={[1.5, H, 0.3]} />
        {wall}
      </mesh>
      <mesh position={[0, 2.35, -5.5]} receiveShadow>
        <boxGeometry args={[0.8, 0.7, 0.3]} />
        {wall}
      </mesh>
      <mesh position={[0, 1.0, -6.3]}>
        <boxGeometry args={[0.8, 2.0, 0.05]} />
        <meshBasicMaterial color="#050504" />
      </mesh>

      {/* A paper notice taped to a fin: the AUDIRA mark inside the world */}
      <group position={[-1.27, 1.5, 0.95]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[0.36, 0.24]} />
          <meshPhysicalMaterial color="#efe9d2" {...NOTICE} />
        </mesh>
        <SceneText font="sans" position={[0, 0.03, 0.002]} fontSize={0.05} color="#3a3324" anchorX="center" anchorY="middle">
          LEVEL 0
        </SceneText>
        <SceneText font="sans" position={[0, -0.05, 0.002]} fontSize={0.035} color="#5a5038" anchorX="center" anchorY="middle">
          AUDIRA
        </SceneText>
      </group>

      {/* An office chair left in the middle of the corridor */}
      <group position={[0.45, 0, -2.2]} rotation={[0, 2.5, 0]}>
        <AssetModel id="office-chair-7c9874" assetType="prop" size={1.05} ground fallback={<ChairFallback />} />
      </group>
    </group>
  );
};
