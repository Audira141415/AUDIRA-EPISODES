import React, { useMemo } from "react";
import * as THREE from "three";
import { computeHistoryMapState } from "../core/motion";
import { HISTORYMAP_PALETTE as C } from "../lib/palette";
import { GILT } from "../lib/materials";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";

/** Sarmizegetusa, the Dacian capital, in the Carpathian arc. */
export const FORTRESS: [number, number] = [0.15, -0.95];
const Y = 0.05;

const curve = (pts: [number, number][]) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, Y, z)));

/** West and east pincers: from the camps, across the Danube, curving onto the fortress. */
const PINCERS = [
  curve([
    [-1.1, 1.35],
    [-1.35, 0.4],
    [-1.05, -0.35],
    [-0.35, -0.8],
    [FORTRESS[0] - 0.22, FORTRESS[1]],
  ]),
  curve([
    [1.15, 1.3],
    [1.4, 0.3],
    [1.15, -0.4],
    [0.7, -0.85],
    [FORTRESS[0] + 0.22, FORTRESS[1]],
  ]),
];

/** One arrow drawn up to `p` (0…1) along its curve: a flat ribbon tube and a cone head. */
const Arrow: React.FC<{ path: THREE.CatmullRomCurve3; p: number; glow: number }> = ({ path, p, glow }) => {
  const q = Math.round(Math.max(0.02, p) * 100) / 100; // quantise so the geometry is rebuilt at most 100 times
  const tube = useMemo(() => {
    const pts = path.getSpacedPoints(120).slice(0, Math.max(2, Math.round(120 * q) + 1));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.07, 8, false);
  }, [path, q]);
  const tip = path.getPointAt(q);
  const dir = path.getTangentAt(q);
  const yaw = Math.atan2(dir.x, dir.z);
  return (
    <group>
      <mesh geometry={tube} scale={[1, 0.45, 1]} castShadow>
        <meshPhysicalMaterial color={C.arrowRed} emissive={C.arrowRed} emissiveIntensity={0.35 + glow * 0.8} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[tip.x, Y * 0.45, tip.z]} rotation={[Math.PI / 2, 0, -yaw]} scale={[1, 1, 0.45]} castShadow>
        <coneGeometry args={[0.17, 0.34, 3]} />
        <meshPhysicalMaterial color={C.arrowRed} emissive={C.arrowRed} emissiveIntensity={0.45 + glow * 0.8} roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
  );
};

/** The two pincer arrows and the gilt pin on Sarmizegetusa, which flares when they close (payoff). */
export const TacticalPincerArrows3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeHistoryMapState(f);
  // hammered gilt: a seeded grain on the pin's roughness
  const hammered = useSurfaceGrain(17, 0.15, 2);
  const p = state.arrowProgress;
  const flare = state.clash;
  const ring = 0.15 + flare * 0.9;

  return (
    <group>
      {p > 0.005 ? PINCERS.map((path, i) => <Arrow key={i} path={path} p={p} glow={flare} />) : null}

      {/* Fortress pin */}
      <group position={[FORTRESS[0], 0, FORTRESS[1]]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 12]} />
          <meshPhysicalMaterial color={C.borderGold} {...GILT} />
        </mesh>
        <mesh position={[0, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.085, 24, 16]} />
          <meshPhysicalMaterial color={C.borderGold} {...GILT} roughnessMap={hammered} emissive={C.borderGold} emissiveIntensity={0.15 + flare * 1.6} />
        </mesh>
        {/* Shock ring on the sheet when the pincers close */}
        {flare > 0.01 ? (
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
            <ringGeometry args={[ring * 0.9, ring, 64]} />
            <meshBasicMaterial color="#FFE3A0" transparent opacity={(1 - flare) * 0.95} depthWrite={false} toneMapped={false} />
          </mesh>
        ) : null}
        <pointLight position={[0, 0.6, 0]} color="#ffcf7a" intensity={flare * 3} distance={2.5} decay={1.6} />
      </group>
    </group>
  );
};
