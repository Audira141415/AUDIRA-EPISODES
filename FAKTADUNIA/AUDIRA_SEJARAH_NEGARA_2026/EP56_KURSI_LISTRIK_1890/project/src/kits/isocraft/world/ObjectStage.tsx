import React, { useMemo } from "react";
import * as THREE from "three";
import { ISOCRAFT_PALETTE as C } from "../lib/palette";
import { createInkOutlineMaterial } from "../lib/materials";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/** Rounded box with an ink outline (inverted hull), the isometric-illustration building block. */
export const InkBox: React.FC<{
  args: [number, number, number];
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  opacity?: number;
  ink?: number;
}> = ({ args, color, position, rotation, opacity = 1, ink = 0.03 }) => {
  const outline = useMemo(() => createInkOutlineMaterial(), []);
  const r = Math.min(...args) * 0.1;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={opacity > 0.6} receiveShadow>
        <RoundedBoxGeo args={args} radius={r} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} transparent={opacity < 1} opacity={opacity} depthWrite={opacity > 0.6} />
      </mesh>
      {opacity > 0.6 ? (
        <mesh material={outline} scale={[1 + (2 * ink) / args[0], 1 + (2 * ink) / args[1], 1 + (2 * ink) / args[2]]}>
          <RoundedBoxGeo args={args} radius={r} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Spur gear: disc + teeth, toy plastic. */
const Gear: React.FC<{ r: number; teeth: number; color: string; angle: number; position: [number, number, number] }> = ({ r, teeth, color, angle, position }) => (
  <group position={position} rotation={[0, angle, 0]}>
    <mesh castShadow>
      <cylinderGeometry args={[r, r, 0.14, 40]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
    </mesh>
    {Array.from({ length: teeth }, (_, i) => {
      const a = (i / teeth) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * (r + 0.05), 0, Math.sin(a) * (r + 0.05)]} rotation={[0, -a, 0]} castShadow>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
        </mesh>
      );
    })}
  </group>
);

/** Dissected countertop mixer: shell fades to see-through, revealing motor coil, shaft and gear train. */
export const IsoAppliance: React.FC<{ f: number; position?: [number, number, number] }> = ({ f, position = [0, 0, 0] }) => {
  const seeThrough = Math.sin(f * 0.03 - 1.2) * 0.5 + 0.5;
  const shellOpacity = THREE.MathUtils.lerp(1.0, 0.1, seeThrough);
  const gearRot = f * 0.05;
  return (
    <group position={position}>
      {/* Base + shell */}
      <InkBox args={[1.9, 0.5, 1.5]} color={C.inkBlack} position={[0, 0.25, 0]} />
      <InkBox args={[1.8, 2.0, 1.4]} color={C.bodyCoral} position={[0, 1.5, 0]} opacity={shellOpacity} />
      {/* Motor: copper coil stack around the shaft */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, 0.75 + i * 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.36, 0.045, 10, 32]} />
          <meshPhysicalMaterial color="#c9773c" metalness={1} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.0, 16]} />
        <meshPhysicalMaterial color={C.metalSteel} metalness={1} roughness={0.25} />
      </mesh>
      <Gear r={0.48} teeth={14} color={C.accentYellow} angle={gearRot} position={[0, 1.55, 0]} />
      <Gear r={0.3} teeth={9} color={C.bodyMint} angle={-gearRot * 1.55 + 0.17} position={[0.58, 1.55, -0.32]} />
      <Gear r={0.36} teeth={11} color={C.shadowBlue} angle={gearRot * 0.8} position={[0, 2.1, 0]} />
      {/* Bowl + blade on top */}
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.42, 0.9, 40, 1, true]} />
        <meshPhysicalMaterial color="#dff2ff" transmission={0.85} roughness={0.08} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 2.66, 0]} rotation={[0, gearRot * 3, 0]}>
        {[0, Math.PI / 2].map((a) => (
          <mesh key={a} rotation={[0.2, a, 0]} castShadow>
            <boxGeometry args={[0.7, 0.02, 0.1]} />
            <meshPhysicalMaterial color={C.metalSteel} metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Isometric kitchen island: counter slab, the dissected mixer, microwave and toaster GLBs. */
export const IsoKitchen: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={C.paperWarm} roughness={0.95} />
    </mesh>
    <InkBox args={[5.2, 0.5, 4.2]} color={C.shadowBlue} position={[0, 0.25, 0]} />
    <InkBox args={[5.4, 0.12, 4.4]} color={C.metalSteel} position={[0, 0.56, 0]} />
    <IsoAppliance f={f} position={[0.2, 0.62, 0.3]} />
    <AssetModel id="microwave-oven-7f60d4" size={1.7} ground polish="toyPlastic" position={[-1.55, 0.62, 1.05]} rotation={[0, 0.5, 0]} />
    <AssetModel id="toaster-0d6c5c" size={1.0} ground polish="toyPlastic" position={[1.7, 0.62, -0.9]} rotation={[0, 0.4, 0]} />
  </group>
);
