import React, { useMemo } from "react";
import * as THREE from "three";
import { THERMAL_PALETTE as C } from "../lib/palette";
import { createHotspotMaterial, ironbow } from "../lib/materials";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { ToyPerson } from "../../../core/polish/Person.tsx";

/** Thermal-shaded plastic: colour and glow both from the ironbow ramp at temperature t (0…1). */
const heatMat = (t: number, glow = 0.55) =>
  new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: ironbow(t * 0.9), emissive: ironbow(t), emissiveIntensity: glow });

/** CPU heat sink seen through a FLIR camera: hot core, fins cooling toward the tips. */
export const HeatSinkThermal: React.FC<{ f: number; position?: [number, number, number]; scale?: number }> = ({ f, position = [0, 0, 0], scale = 1 }) => {
  const pulse = Math.sin(f * 0.05) * 0.5 + 0.5;
  const core = useMemo(() => heatMat(0.8, 0.9), []);
  core.emissive = ironbow(0.72 + pulse * 0.1);
  const hot = useMemo(createHotspotMaterial, []);
  const fins = useMemo(() => [-1.05, -0.75, -0.45, -0.15, 0.15, 0.45, 0.75, 1.05].map((x) => heatMat(0.62 - Math.abs(x) * 0.32, 0.5)), []);
  const base = useMemo(() => heatMat(0.66, 0.6), []);
  return (
    <group position={position} scale={scale} rotation={[0, f * 0.006, 0]}>
      <mesh material={core} position={[0, 0.12, 0]} castShadow>
        <RoundedBoxGeo args={[1.1, 0.24, 1.1]} radius={0.04} />
      </mesh>
      <mesh material={hot} position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12 + pulse * 0.04, 24]} />
      </mesh>
      <mesh material={base} position={[0, 0.32, 0]} castShadow>
        <RoundedBoxGeo args={[2.4, 0.14, 1.4]} radius={0.03} />
      </mesh>
      {fins.map((m, i) => (
        <mesh key={i} material={m} position={[-1.05 + i * 0.3, 0.84, 0]} castShadow>
          <RoundedBoxGeo args={[0.08, 0.9, 1.35]} radius={0.02} />
        </mesh>
      ))}
    </group>
  );
};

/** Rising heat shimmer: translucent ironbow blobs drifting up and cooling as they rise. */
const HeatPlume: React.FC<{ f: number; position: [number, number, number] }> = ({ f, position }) => (
  <group position={position}>
    {Array.from({ length: 10 }, (_, i) => {
      const life = (((f * 0.006 + i / 10) % 1) + 1) % 1;
      const x = Math.sin(i * 2.3 + f * 0.01) * 0.5;
      return (
        <mesh key={i} position={[x * 0.7, life * 1.8, Math.cos(i * 1.7) * 0.3]} scale={0.08 + life * 0.2}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color={ironbow(0.7 - life * 0.5)} transparent opacity={(1 - life) * 0.4} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

const TECH_LOOK = { skin: "#F7D038", top: "#EA5E28", bottom: "#9B1D8C", hair: "#310E68", shoes: "#310E68" } as const;

/** Server room through the thermal camera: two racks, the heat-sink bench, a technician. */
export const ThermalServerRoom: React.FC<{ f: number }> = ({ f }) => {
  const bench = useMemo(() => heatMat(0.18, 0.3), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3a1a66" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3, -3.2]} receiveShadow>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#2b1150" roughness={0.9} />
      </mesh>
      {[-1.7, 1.7].map((x, i) => (
        <AssetModel
          key={x}
          id="small-server-rack-8ae0a4"
          size={2.8}
          ground
          tint={C.deepViolet}
          emissive={i === 0 ? C.flirMagenta : C.flirAmber}
          emissiveIntensity={0.25 + 0.15 * Math.sin(f * 0.04 + i * 2)}
          position={[x, 0, -2.0]}
        />
      ))}
      <mesh position={[0, 0.45, 0.2]} castShadow receiveShadow material={bench}>
        <RoundedBoxGeo args={[3.0, 0.9, 1.6]} radius={0.05} />
      </mesh>
      <HeatSinkThermal f={f} position={[0, 0.9, 0.2]} scale={0.85} />
      <HeatPlume f={f} position={[0, 1.8, 0.2]} />
      <ToyPerson f={f} seed={8} outfit="uniform" pose="point" look={TECH_LOOK} position={[-1.45, 0, 1.25]} heading={0.6} scale={1.7} />
    </group>
  );
};
