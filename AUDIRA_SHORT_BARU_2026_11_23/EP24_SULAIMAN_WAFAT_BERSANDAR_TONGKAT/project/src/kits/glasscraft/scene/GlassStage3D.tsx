import React from "react";
import { GLASS_PALETTE as P } from "../lib/palette";

export const GlassStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Obsidian mirror floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={P.glassObsidian} roughness={0.15} metalness={0.8} />
    </mesh>
    {/* Cyan + magenta rim lighting */}
    <ambientLight intensity={0.08} color={P.ambientStudio} />
    <directionalLight position={[4, 8, 3]} intensity={0.9} color="#00ccff" castShadow shadow-mapSize={2048} />
    <directionalLight position={[-4, 6, -3]} intensity={0.6} color="#ff33aa" />
    <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffaa33" distance={10} />
    <fog attach="fog" args={[P.voidDark, 10, 35]} />
    {children}
  </group>
);
