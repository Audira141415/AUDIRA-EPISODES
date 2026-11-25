import React from "react";
import * as THREE from "three";
import { BRUTAL_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/** Thick black outline (inverted hull) around a rounded slab. */
const Outline: React.FC<{ args: [number, number, number]; width?: number }> = ({ args, width = 0.05 }) => (
  <mesh scale={[1 + (2 * width) / args[0], 1 + (2 * width) / args[1], 1 + (2 * width) / args[2]]}>
    <RoundedBoxGeo args={args} radius={0.04} />
    <meshBasicMaterial color={C.inkBlack} side={THREE.BackSide} />
  </mesh>
);

/** Outlined plastic slab with a hard, unblurred black offset shadow. */
export const BrutalSlab: React.FC<{
  args: [number, number, number];
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  shadowOffset?: [number, number, number];
}> = ({ args, color, position, rotation, shadowOffset = [0.14, -0.14, -0.12] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={shadowOffset}>
      <RoundedBoxGeo args={args} radius={0.04} />
      <meshBasicMaterial color={C.inkBlack} />
    </mesh>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={args} radius={0.04} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
    </mesh>
    <Outline args={args} />
  </group>
);

/** Hero card: hard bounce + swing, offset shadow, sticker accent. */
export const BrutalCard3D: React.FC<{
  f: number;
  color?: string;
  sticker?: string;
  position?: [number, number, number];
  scale?: number;
  phase?: number;
}> = ({ f, color = C.neoYellow, sticker = C.hotPink, position = [0, 0, 0], scale = 1, phase = 0 }) => {
  const jump = Math.abs(Math.sin(f * 0.08 + phase)) * 0.4 * scale;
  const rotY = Math.sin(f * 0.04 + phase) * 0.35;
  return (
    <group position={[position[0], position[1] + jump, position[2]]} rotation={[0.2, rotY, 0]} scale={scale}>
      <BrutalSlab args={[2.4, 2.8, 0.2]} color={color} shadowOffset={[0.2, -0.2, -0.15]} />
      <BrutalSlab args={[0.9, 0.5, 0.1]} color={sticker} position={[0.7, 0.9, 0.2]} rotation={[0, 0, -0.2]} shadowOffset={[0.06, -0.06, -0.05]} />
    </group>
  );
};

/** Procedural boombox, used only if the GLB cannot load. */
const BoomboxBlock: React.FC = () => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow>
      <RoundedBoxGeo args={[2, 1, 0.6]} radius={0.08} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#222" />
    </mesh>
    {[-0.55, 0.55].map((x) => (
      <mesh key={x} position={[x, 0.5, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#555" />
      </mesh>
    ))}
  </group>
);

/** Full stage: boombox on an outlined pedestal, bass rings, bouncing cards, flat yellow floor. */
export const BrutalStage: React.FC<{ f: number }> = ({ f }) => {
  const beat = (f % 30) / 30; // 120 BPM on the 60 fps clock
  const kick = Math.pow(1 - beat, 4);
  const squash = 1 - kick * 0.06;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={C.neoYellow} roughness={0.85} />
      </mesh>

      <BrutalSlab args={[2.6, 0.9, 1.7]} color={C.hotPink} position={[0, 0.45, 0]} shadowOffset={[0.22, -0.02, -0.22]} />
      <group position={[0, 0.92, 0]} scale={[1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash)]}>
        <AssetModel id="boombox-d0048f" size={2.3} ground polish="toyPlastic" fallback={<BoomboxBlock />} />
      </group>

      {/* Bass rings: hard black rings punched out on every kick */}
      {[0, 1].map((k) => {
        const age = (beat + k * 0.5) % 1;
        return (
          <mesh key={k} position={[0, 1.6, -0.6]} scale={1 + age * 2.4}>
            <ringGeometry args={[0.9, 1.0, 48]} />
            <meshBasicMaterial color={C.inkBlack} transparent opacity={1 - age} />
          </mesh>
        );
      })}

      <BrutalCard3D f={f} color={C.cyberCyan} sticker={C.neoYellow} position={[-1.9, 2.6, -2.2]} scale={0.7} />
      <BrutalCard3D f={f} color={C.acidGreen} sticker={C.hotPink} position={[2.0, 3.1, -2.6]} scale={0.6} phase={1.3} />
      <BrutalSlab args={[0.7, 0.7, 0.7]} color={C.cyberCyan} position={[-1.8, 0.35, 1.1]} rotation={[0, 0.5 + f * 0.01, 0]} />
      <mesh position={[1.75, 0.38 + Math.abs(Math.sin(f * 0.08 + 0.7)) * 0.5, 1.0]} castShadow>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.hotPink} />
      </mesh>
    </group>
  );
};
