import React, { useMemo } from "react";
import * as THREE from "three";
import { computeMemphisDioramaState } from "../core/motion";
import { MEMPHISDIORAMA_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

const Plastic: React.FC<{ color: string }> = ({ color }) => <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />;

/** Memphis squiggle: a fat tube along a sine path. */
const Squiggle: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; color: string }> = ({ position, rotation, color }) => {
  const geo = useMemo(() => {
    const pts = Array.from({ length: 24 }, (_, i) => new THREE.Vector3(-0.7 + (i / 23) * 1.4, Math.sin(i * 0.8) * 0.12, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.045, 12, false);
  }, []);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow>
      <Plastic color={color} />
    </mesh>
  );
};

/** Sottsass-style totem group: stepped yellow pedestal, coral archway, mint ring, bouncing ball,
 *  plus an armchair and arc lamp (GLB) restyled in the Memphis palette. */
export const SottsassTotem3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeMemphisDioramaState(f);
  return (
    <group>
      {/* Stepped pedestal */}
      <mesh position={[-1.3, 0.3, -0.4]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.1, 0.6, 1.1]} radius={0.05} />
        <Plastic color={C.canaryYellow} />
      </mesh>
      <mesh position={[-1.3, 0.72, -0.4]} castShadow>
        <RoundedBoxGeo args={[0.7, 0.24, 0.7]} radius={0.04} />
        <Plastic color={C.indigoInk} />
      </mesh>
      <mesh position={[-1.3, 1.32, -0.4]} rotation={[0.3, state.totemSpin, 0.2]} castShadow>
        <torusGeometry args={[0.42, 0.11, 24, 64]} />
        <Plastic color={C.mintGreen} />
      </mesh>

      {/* Coral archway */}
      <group position={[0.35, 0.75, -0.9]} rotation={[0, 0, state.archRockZ]}>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 1.5, 32]} />
            <Plastic color={C.coralPink} />
          </mesh>
        ))}
        <mesh position={[0, 0.85, 0]} castShadow>
          <RoundedBoxGeo args={[1.35, 0.32, 0.45]} radius={0.06} />
          <Plastic color={C.indigoInk} />
        </mesh>
        <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.18, 3]} />
          <Plastic color={C.canaryYellow} />
        </mesh>
      </group>

      <mesh position={[0.35, 0.32 + state.sphereBounceY, -0.1]} castShadow>
        <sphereGeometry args={[0.32, 40, 32]} />
        <Plastic color={C.skyBlue} />
      </mesh>

      {/* Armchair + arc lamp, restyled */}
      <AssetModel id="armchair-980c7c" size={1.15} ground polish="toyPlastic" tint={C.coralPink} position={[1.55, 0, 0.55]} rotation={[0, -0.7, 0]} />
      <AssetModel id="arc-floor-lamp-fa0b5f" size={2.1} ground polish="toyPlastic" tint={C.indigoInk} position={[2.05, 0, -0.95]} rotation={[0, -2.2, 0]} />

      <Squiggle position={[-0.6, 0.06, 1.1]} rotation={[-Math.PI / 2, 0, 0.2]} color={C.canaryYellow} />
      <Squiggle position={[-1.3, 1.95, -0.4]} rotation={[0, 0.3, 0]} color={C.coralPink} />
      <mesh position={[-0.2, 0.15, 0.75]} rotation={[0, 0.6 + f * 0.01, 0]} castShadow>
        <coneGeometry args={[0.24, 0.3, 3]} />
        <Plastic color={C.mintGreen} />
      </mesh>
    </group>
  );
};
