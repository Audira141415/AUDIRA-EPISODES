import React from "react";
import { INNERWORKS_PALETTE as P } from "../lib/palette";
import { POLISH } from "../../../core/polish/Polish";

export const InnerworksStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Dark machine-room floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial color={P.floorTint} {...POLISH.stone} />
    </mesh>
    {/* Cyan inspection + amber fill */}
    <ambientLight intensity={0.1} color={P.blueprintGrid} />
    <directionalLight position={[4, 8, 3]} intensity={1.0} color={P.xrayCyan} castShadow shadow-mapSize={2048} />
    <directionalLight position={[-3, 6, -4]} intensity={0.6} color={P.brassGear} />
    <pointLight position={[0, 2, 0]} intensity={0.3} color={P.xrayCyan} distance={8} />
    {children}
  </group>
);
