import React, { useMemo } from "react";
import * as THREE from "three";
import { VINTAGE_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/** Aged brass: real metal, worn roughness, used for every ring and the stand. Needs reflections:
 *  the example passes hdri="warmStudio" to FilmScene. */
const useBrass = (color: string = C.agedGold, roughness = 0.34) =>
  useMemo(() => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, clearcoat: 0.3, clearcoatRoughness: 0.4 }), [color, roughness]);

/** A flat engraved ring band with degree ticks. */
const Band: React.FC<{ r: number; width?: number; ticks?: number; mat: THREE.Material; tickMat?: THREE.Material }> = ({ r, width = 0.07, ticks = 0, mat, tickMat }) => (
  <group>
    <mesh material={mat} castShadow>
      <torusGeometry args={[r, width * 0.5, 10, 128]} />
    </mesh>
    {ticks > 0 && tickMat
      ? Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          const major = i % 6 === 0;
          return (
            <mesh key={i} material={tickMat} position={[Math.cos(a) * r, Math.sin(a) * r, width * 0.5]} rotation={[0, 0, a]}>
              <boxGeometry args={[major ? 0.11 : 0.06, 0.012, 0.01]} />
            </mesh>
          );
        })
      : null}
  </group>
);

/** Armillary sphere: meridian + horizon fixed, ecliptic and colures turning, terracotta earth inside. */
export const AstrolabeMechanism: React.FC<{ f: number; position?: [number, number, number]; scale?: number }> = ({ f, position = [0, 0, 0], scale = 1 }) => {
  const brass = useBrass();
  const darkBrass = useBrass(C.engravingBrown, 0.45);
  const ink = useMemo(() => new THREE.MeshBasicMaterial({ color: C.ironGallInk }), []);
  const rot1 = f * 0.02;
  const rot2 = f * 0.015;
  return (
    <group position={position} scale={scale}>
      {/* Turned stand */}
      <mesh material={darkBrass} position={[0, -1.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.16, 48]} />
      </mesh>
      <mesh material={brass} position={[0, -1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.16, 0.6, 24]} />
      </mesh>
      {/* Fixed meridian (vertical) and horizon rings */}
      <group rotation={[0, 0.35, 0]}>
        <Band r={1.5} width={0.09} ticks={36} mat={brass} tickMat={ink} />
      </group>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Band r={1.58} width={0.12} ticks={72} mat={darkBrass} tickMat={ink} />
      </group>
      {/* Turning celestial cage, tilted to the polar axis */}
      <group rotation={[0, 0, 0.41]}>
        <group rotation={[0, rot1, 0]}>
          <Band r={1.3} mat={brass} />
          <group rotation={[0, Math.PI / 2, 0]}>
            <Band r={1.3} mat={brass} />
          </group>
          <group rotation={[Math.PI / 2 + 0.41, 0, 0]}>
            <Band r={1.24} width={0.14} ticks={24} mat={brass} tickMat={ink} />
          </group>
        </group>
        <group rotation={[rot2, 0, rot2 * 0.7]}>
          <Band r={0.95} width={0.05} mat={darkBrass} />
        </group>
        {/* Polar axis rod */}
        <mesh material={brass}>
          <cylinderGeometry args={[0.02, 0.02, 3.3, 12]} />
        </mesh>
        <mesh rotation={[0, -rot1 * 0.5, 0]} castShadow>
          <sphereGeometry args={[0.5, 48, 32]} />
          <meshPhysicalMaterial {...POLISH.clay} color={C.terracottaWash} />
        </mesh>
      </group>
    </group>
  );
};

/** Celestial chart in the old ink-ground manner: dark plate, gold engraved circles, meridians and stars. */
const StarChart: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const grain = useSurfaceGrain(29, 0.3, 3);
  const stars = useMemo(() => {
    const out: [number, number, number][] = [];
    let s = 91;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    r(); r();
    for (let i = 0; i < 60; i++) out.push([(r() - 0.5) * 2.9, (r() - 0.5) * 3.2, 0.01 + r() * 0.018]);
    return out;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.04]} castShadow>
        <RoundedBoxGeo args={[3.3, 3.6, 0.06]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.stone} color={C.engravingBrown} />
      </mesh>
      <mesh receiveShadow>
        <planeGeometry args={[3.1, 3.4]} />
        <meshPhysicalMaterial {...POLISH.paper} color={C.ironGallInk} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      {[0.6, 1.0, 1.4].map((r) => (
        <mesh key={r} position={[0, 0, 0.006]}>
          <ringGeometry args={[r, r + 0.012, 96]} />
          <meshBasicMaterial color={C.agedGold} transparent opacity={0.7} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <mesh key={k} position={[0, 0, 0.006]} rotation={[0, 0, (k * Math.PI) / 6]}>
          <planeGeometry args={[2.9, 0.008]} />
          <meshBasicMaterial color={C.agedGold} transparent opacity={0.45} />
        </mesh>
      ))}
      {stars.map(([x, y, s], i) => (
        <mesh key={i} position={[x, y, 0.007]}>
          <circleGeometry args={[s, 6]} />
          <meshBasicMaterial color="#e8c77a" />
        </mesh>
      ))}
    </group>
  );
};

/** Scholar's desk: walnut top, armillary hero, hourglass, campaign map, parchment wall. */
export const ScholarDesk: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(19, 0.25, 5);
  return (
    <group>
      {/* Parchment wall with a dark ink star chart hung behind the instrument: the brass reads
          bright against the chart, the chart reads dark against the room */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshPhysicalMaterial {...POLISH.paper} color={C.parchmentSepia} roughnessMap={grain} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      <StarChart position={[0, 1.95, -2.9]} />
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[7, 0.24, 4.6]} radius={0.05} />
        <meshPhysicalMaterial {...POLISH.stone} color="#c79a68" roughness={0.55} clearcoat={0.5} clearcoatRoughness={0.3} roughnessMap={grain} />
      </mesh>
      <AstrolabeMechanism f={f} position={[0, 1.94, -0.4]} scale={0.95} />
      <AssetModel id="an-hourglass-with-sand-ec9f11" size={1.1} ground polish="toyPlastic" position={[1.35, 0, 1.0]} rotation={[0, 0.4, 0]} />
      <AssetModel id="campaign-map-scroll-d4a382" size={1.9} ground polish="paper" position={[-1.5, 0, 1.1]} rotation={[0, 0.35, 0]} />
      {/* Quill */}
      <mesh position={[-0.6, 0.06, 1.5]} rotation={[0, 0.9, Math.PI / 2 - 0.08]} castShadow>
        <coneGeometry args={[0.05, 1.1, 12]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#efe6d2" />
      </mesh>
    </group>
  );
};
