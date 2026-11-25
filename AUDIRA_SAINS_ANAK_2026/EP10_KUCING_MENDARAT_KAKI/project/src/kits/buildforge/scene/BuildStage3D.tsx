import React from "react";
import { POLISH } from "../../../core/polish/Polish.tsx";

export const BuildStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Construction site ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial {...POLISH.stone} color="#cbc8b3" roughness={0.95} />
    </mesh>
    {/* Daylight sky */}
    <ambientLight intensity={0.3} color="#e6eeef" />
    <directionalLight position={[8, 12, 6]} intensity={1.5} color="#fff0d6" castShadow shadow-mapSize={2048} />
    <hemisphereLight args={["#5f9ad6", "#cbc8b3", 0.3]} />
    <fog attach="fog" args={["#e6eeef", 40, 120]} />
    {children}
  </group>
);
