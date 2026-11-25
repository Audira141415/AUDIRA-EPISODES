import React from "react";
import { DRAFT_PALETTE as P } from "../lib/palette";

export const DraftStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Blueprint drafting surface */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={P.blueprintNavy} roughness={0.9} />
    </mesh>
    {/* Cool blueprint lighting */}
    <ambientLight intensity={0.12} color={P.blueprintNavy} />
    <directionalLight position={[4, 10, 4]} intensity={1.0} color={P.cadCyan} castShadow shadow-mapSize={1024} />
    <directionalLight position={[-3, 6, -2]} intensity={0.4} color={P.dimensionGold} />
    <fog attach="fog" args={[P.blueprintDark, 15, 50]} />
    {children}
  </group>
);
