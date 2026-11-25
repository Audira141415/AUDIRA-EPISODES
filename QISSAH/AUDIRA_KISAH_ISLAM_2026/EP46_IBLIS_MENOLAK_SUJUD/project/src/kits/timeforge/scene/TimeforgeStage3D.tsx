import React from "react";

export const TimeforgeStage3D: React.FC<{
  children?: React.ReactNode;
  position?: [number, number, number];
}> = ({ children, position = [0, 0, 0] }) => (
  <group position={position}>
    {/* Pearl studio floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#e9e6e0" roughness={0.88} />
    </mesh>
    {/* Turntable plinth */}
    <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[2.2, 2.4, 0.3, 64]} />
      <meshStandardMaterial color="#ecebe6" roughness={0.7} metalness={0.05} />
    </mesh>
    {/* Studio top lighting */}
    <ambientLight intensity={0.35} color="#f3f1ec" />
    <directionalLight position={[4, 10, 4]} intensity={1.3} color="#fff8f0" castShadow shadow-mapSize={1024} />
    <directionalLight position={[-3, 6, -2]} intensity={0.4} color="#e0ddd6" />
    {children}
  </group>
);
