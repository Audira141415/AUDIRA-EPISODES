import React from "react";
import { NANO_PALETTE as P } from "../lib/palette";

export const NanoStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Deep cytoplasm void — no hard floor, subjects float */}
    <ambientLight intensity={0.08} color={P.fluidAmbient} />
    <directionalLight position={[3, 6, 4]} intensity={0.7} color={P.adenineGold} castShadow shadow-mapSize={1024} />
    <pointLight position={[-2, 3, -2]} intensity={0.5} color={P.thymineCyan} distance={12} />
    <pointLight position={[2, -1, 1]} intensity={0.3} color={P.adenineGold} distance={8} />
    <fog attach="fog" args={[P.microscopyVoid, 6, 30]} />
    {children}
  </group>
);
