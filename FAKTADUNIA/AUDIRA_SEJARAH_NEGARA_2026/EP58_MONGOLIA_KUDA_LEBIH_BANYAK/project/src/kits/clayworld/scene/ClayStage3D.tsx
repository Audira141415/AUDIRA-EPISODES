import React from "react";
import { CLAY_PALETTE as P } from "../lib/palette";

export const ClayStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Olive clay ground slab */}
    <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
      <boxGeometry args={[14, 0.3, 14]} />
      <meshStandardMaterial color={P.olive} roughness={0.92} />
    </mesh>
    {/* Warm claymation lighting */}
    <ambientLight intensity={0.35} color={P.clayCream} />
    <directionalLight position={[5, 10, 5]} intensity={1.3} color="#fff5e6" castShadow shadow-mapSize={1024} />
    <hemisphereLight args={["#e8f0ff", P.olive, 0.25]} />
    {children}
  </group>
);
