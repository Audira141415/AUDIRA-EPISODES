import React from "react";
import { CYBER_PALETTE as P } from "../lib/palette";

export const CyberStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Perspective cyber grid floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={P.gridFloor} roughness={0.6} metalness={0.3} />
    </mesh>
    {/* OLED void + cyan key light */}
    <ambientLight intensity={0.06} color={P.voidSurface} />
    <directionalLight position={[3, 8, 4]} intensity={0.8} color={P.cyan} castShadow shadow-mapSize={2048} />
    <pointLight position={[-3, 4, -2]} intensity={0.4} color="#ff3366" distance={15} />
    <pointLight position={[0, 2, 0]} intensity={0.3} color={P.cyan} distance={10} />
    <fog attach="fog" args={[P.voidDeep, 12, 45]} />
    {children}
  </group>
);
