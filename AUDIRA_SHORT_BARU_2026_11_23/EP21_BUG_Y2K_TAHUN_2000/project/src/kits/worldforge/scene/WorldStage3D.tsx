import React from "react";
import { POLISH } from "../../../core/polish/Polish.tsx";

export const WorldStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
  sunColor?: string;
  sunPosition?: [number, number, number];
}> = ({ children, position = [0, 0, 0], sunColor = "#fff0d2", sunPosition = [80, 60, 40] }) => (
  <group position={position}>
    {/* Terrain ground plane (replaced by heightfield in production) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial {...POLISH.stone} color="#6b6450" roughness={0.92} />
    </mesh>
    {/* Physical sky lighting */}
    <ambientLight intensity={0.2} color="#cfdbe3" />
    <directionalLight position={sunPosition} intensity={1.6} color={sunColor} castShadow shadow-mapSize={2048} />
    <hemisphereLight args={["#5f8fc6", "#6b6450", 0.35]} />
    <fog attach="fog" args={["#cfdbe3", 30, 150]} />
    {children}
  </group>
);
