import React from "react";
import { C } from "../lib/palette";

export const VoxelStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Diorama plinth */}
    <mesh position={[0, -0.25, 0]} receiveShadow>
      <boxGeometry args={[12, 0.5, 12]} />
      <meshStandardMaterial color={C.stone} roughness={0.85} />
    </mesh>
    {/* Warm ambient + dusk key */}
    <ambientLight intensity={0.25} color={C.tealSoft} />
    <directionalLight position={[6, 10, 4]} intensity={1.4} color={C.lampWarm} castShadow shadow-mapSize={1024} />
    <pointLight position={[-3, 2, 1]} intensity={0.6} color={C.amber} distance={12} />
    <fog attach="fog" args={[C.tealDeep, 10, 40]} />
    {children}
  </group>
);
