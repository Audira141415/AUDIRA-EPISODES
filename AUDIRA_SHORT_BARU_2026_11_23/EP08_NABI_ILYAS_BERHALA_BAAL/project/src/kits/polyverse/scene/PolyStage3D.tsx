import React from "react";
import { POLY_PALETTE as P } from "../lib/palette";

export const PolyStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Floating island base */}
    <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[6, 4.5, 1, 6]} />
      <meshStandardMaterial color={P.grassEmerald} roughness={0.85} flatShading />
    </mesh>
    <mesh position={[0, -1.8, 0]} castShadow>
      <coneGeometry args={[4.5, 2.5, 6]} />
      <meshStandardMaterial color={P.rockSlate} roughness={0.9} flatShading />
    </mesh>
    {/* Pastel dawn lighting */}
    <ambientLight intensity={0.2} color="#2a3040" />
    <directionalLight position={[6, 10, 4]} intensity={1.2} color="#ffddaa" castShadow shadow-mapSize={1024} />
    <hemisphereLight args={["#4a6090", P.grassJade, 0.3]} />
    <fog attach="fog" args={[P.skyDawn, 15, 60]} />
    {children}
  </group>
);
