import React from "react";
import { TOON_PALETTE as P } from "../lib/palette";

export const ToonStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Arena ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={P.animeDusk} roughness={0.8} />
    </mesh>
    {/* Anime dusk lighting — sky blue + orange accent */}
    <ambientLight intensity={0.15} color={P.animeDusk} />
    <directionalLight position={[4, 10, 4]} intensity={1.4} color={P.animeSky} castShadow shadow-mapSize={2048} />
    <directionalLight position={[-3, 6, -2]} intensity={0.5} color={P.mechaAccent} />
    <pointLight position={[0, 3, 0]} intensity={0.3} color={P.skyCyan} distance={12} />
    <fog attach="fog" args={[P.animeDusk, 12, 40]} />
    {children}
  </group>
);
