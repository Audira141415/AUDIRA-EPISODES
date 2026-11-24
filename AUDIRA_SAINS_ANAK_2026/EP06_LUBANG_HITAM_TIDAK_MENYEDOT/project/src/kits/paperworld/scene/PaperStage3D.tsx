import React from "react";
import { PALETTE } from "../tokens";

export const PaperStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Paper ground plane */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color={PALETTE.ivory} roughness={0.95} />
    </mesh>
    {/* Warm diffuse sunlight */}
    <ambientLight intensity={0.4} color="#faf4e8" />
    <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fff5e0" castShadow shadow-mapSize={1024} />
    <hemisphereLight args={["#e8f0ff", PALETTE.ivory, 0.3]} />
    {children}
  </group>
);
