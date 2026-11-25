import React from "react";
import { PRECISION_PALETTE as P } from "../lib/palette";

export const PrecisionStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Infinite floor plane */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color={P.cycloramaFloor} roughness={0.9} metalness={0.05} />
    </mesh>
    {/* Dark softbox studio lighting */}
    <ambientLight intensity={0.08} color="#1a1c22" />
    <directionalLight position={[3, 8, 4]} intensity={1.6} color="#f0ece4" castShadow shadow-mapSize={2048} />
    <directionalLight position={[-4, 6, -2]} intensity={0.5} color="#c8d0e0" />
    <pointLight position={[0, 3, 3]} intensity={0.4} color="#e8e4dc" distance={10} />
    {children}
  </group>
);
