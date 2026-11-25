import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";
import { computeHistoryMapState } from "../core/motion";
import { HISTORYMAP_PALETTE as C } from "../lib/palette";
import { GILT, MAP_PAPER, RELIEF, TABLE } from "../lib/materials";

/** Map sheet: 3.6 wide (x) × 5.6 deep (z), so it fills a 9:16 frame from above. North is −z. */
export const MAP_W = 3.6;
export const MAP_D = 5.6;
/** The Danube runs west → east across the sheet, just south of the middle. */
export const DANUBE = new THREE.CatmullRomCurve3(
  [
    [-1.9, 0.62],
    [-1.1, 0.35],
    [-0.4, 0.62],
    [0.3, 0.42],
    [1.0, 0.7],
    [1.9, 0.5],
  ].map(([x, z]) => new THREE.Vector3(x, 0.012, z)),
);
const Y = 0.006; // paper surface

const flat: [number, number, number] = [-Math.PI / 2, 0, 0];

/** Legion camp stand-in when the tent GLB is missing: a ridge tent from a 3-sided cone. */
const TentFallback: React.FC = () => (
  <mesh position={[0, 0.09, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
    <coneGeometry args={[0.16, 0.18, 4]} />
    <meshPhysicalMaterial color="#C9B48A" {...MAP_PAPER} />
  </mesh>
);

const CAMPS: [number, number][] = [
  [-1.1, 1.5],
  [0.15, 1.9],
  [1.15, 1.45],
];

/** War table, map sheet, Danube, Roman and Dacian territories, Carpathian relief and the legion camps. */
export const CartographicTerrain3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeHistoryMapState(f);
  const paperGrain = useSurfaceGrain(42, 0.14, 3);
  const timberGrain = useSurfaceGrain(7, 0.25, 4);
  const river = useMemo(() => new THREE.TubeGeometry(DANUBE, 80, 0.045, 6, false), []);

  // Roman wash: from the south edge up to the river, growing north with the wipe.
  const south = MAP_D / 2;
  const romanDepth = (south - 0.55) * state.territoryWipe;
  // Payoff: the Roman wash floods north of the river over Dacia.
  const conquest = state.clash;
  const conquestDepth = 2.4 * conquest;

  return (
    <group>
      {/* War table */}
      <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[MAP_W + 1.4, 0.3, MAP_D + 1.4]} radius={0.06} />
        <meshPhysicalMaterial color="#3a2a1d" {...TABLE} roughnessMap={timberGrain} bumpMap={timberGrain} bumpScale={0.5} />
      </mesh>

      {/* Map sheet */}
      <mesh position={[0, 0, 0]} rotation={flat} receiveShadow>
        <planeGeometry args={[MAP_W, MAP_D]} />
        <meshPhysicalMaterial color={C.terrainNeutral} {...MAP_PAPER} roughnessMap={paperGrain} bumpMap={paperGrain} bumpScale={0.3} />
      </mesh>
      {/* Gilt border cord */}
      {[
        [0, -MAP_D / 2, MAP_W, 0.03],
        [0, MAP_D / 2, MAP_W, 0.03],
        [-MAP_W / 2, 0, 0.03, MAP_D],
        [MAP_W / 2, 0, 0.03, MAP_D],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.012, z]}>
          <boxGeometry args={[w, 0.02, d]} />
          <meshPhysicalMaterial color={C.borderGold} {...GILT} />
        </mesh>
      ))}

      {/* Dacia: gold wash north of the river */}
      <mesh position={[0, Y, -0.6]} rotation={flat}>
        <planeGeometry args={[MAP_W - 0.1, 2.0]} />
        <meshPhysicalMaterial color={C.daciaGold} {...MAP_PAPER} transparent opacity={0.28 * (1 - conquest * 0.8)} />
      </mesh>

      {/* Imperium Romanum: crimson wash flooding north */}
      {romanDepth > 0.01 ? (
        <mesh position={[0, Y + 0.002, south - romanDepth / 2]} rotation={flat}>
          <planeGeometry args={[MAP_W - 0.1, romanDepth]} />
          <meshPhysicalMaterial color={C.romanCrimson} {...MAP_PAPER} transparent opacity={0.72} />
        </mesh>
      ) : null}
      {conquestDepth > 0.01 ? (
        <mesh position={[0, Y + 0.003, 0.4 - conquestDepth / 2]} rotation={flat}>
          <planeGeometry args={[MAP_W - 0.1, conquestDepth]} />
          <meshPhysicalMaterial color={C.romanCrimson} {...MAP_PAPER} transparent opacity={0.6} />
        </mesh>
      ) : null}

      {/* Danube */}
      <mesh geometry={river} scale={[1, 0.25, 1]}>
        <meshPhysicalMaterial color={C.riverBlue} roughness={0.25} clearcoat={0.8} metalness={0} emissive={C.riverBlue} emissiveIntensity={0.25} />
      </mesh>

      {/* Carpathian relief arc around the Dacian heartland — dark green-brown for forested mountains */}
      {[
        [-1.3, -0.3, 0.24, "#3B5C3B"],
        [-1.0, -0.85, 0.3, "#2E4A2E"],
        [-0.45, -1.35, 0.34, "#3B5C3B"],
        [0.3, -1.55, 0.3, "#4A5A32"],
        [0.95, -1.25, 0.32, "#2E4A2E"],
        [1.35, -0.75, 0.26, "#3B5C3B"],
        [-0.15, -1.75, 0.22, "#4A5A32"],
      ].map(([x, z, s, col], i) => (
        <mesh key={i} position={[x as number, ((s as number) * 0.7) / 2, z as number]} rotation={[0, i * 0.7, 0]} scale={[1, 1, 0.62]} castShadow receiveShadow>
          <coneGeometry args={[(s as number) * 0.85, (s as number) * 0.7, 7]} />
          <meshPhysicalMaterial color={col as string} {...RELIEF} />
        </mesh>
      ))}

      {/* Labels printed on the sheet */}
      <SceneText font="display" position={[0, Y + 0.004, -0.35]} rotation={flat} fontSize={0.26} color={C.daciaGold} anchorX="center" anchorY="middle" letterSpacing={0.3}>
        DACIA
      </SceneText>
      <SceneText font="display" position={[0, Y + 0.004, 2.45]} rotation={flat} fontSize={0.22} color="#F1D9A0" anchorX="center" anchorY="middle" letterSpacing={0.12} fillOpacity={state.territoryWipe}>
        IMPERIVM ROMANVM
      </SceneText>
      <SceneText font="serifItalic" position={[1.25, Y + 0.004, 0.92]} rotation={flat} fontSize={0.14} color="#8fb4dd" anchorX="center" anchorY="middle">
        Danubius
      </SceneText>
      {/* Cartouche: the AUDIRA mark printed in the map's corner */}
      <SceneText font="sans" position={[-MAP_W / 2 + 0.15, Y + 0.004, -MAP_D / 2 + 0.2]} rotation={flat} fontSize={0.09} color={C.borderGold} anchorX="left" anchorY="middle" letterSpacing={0.2}>
        AUDIRA ATLAS · 101–106 AD
      </SceneText>

      {/* Legion camps drop onto the Roman bank */}
      {CAMPS.map(([x, z], i) => {
        const k = state.camps[i];
        return (
          <group key={i} position={[x, (1 - k) * 0.6, z]} scale={Math.max(0.001, k)}>
            <AssetModel id="soldiers-tent-4bd5b9" assetType="building" size={0.32} ground tint="#C9B48A" fallback={<TentFallback />} />
          </group>
        );
      })}
    </group>
  );
};
