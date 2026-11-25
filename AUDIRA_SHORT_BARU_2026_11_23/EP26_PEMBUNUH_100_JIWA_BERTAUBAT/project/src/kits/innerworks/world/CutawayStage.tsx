// INNERWORKS Cutaway Stage — a pastel gearbox on a white plinth. The front cover lifts away
// (cutawayProgress 0 → 1) behind a cyan section line; the cover is tinted acrylic, so the gears show from frame 0 and leaves a ghost outline, revealing the gear
// train inside. Bright studio look after references/quality-bar/innerworks.jpg.

import React, { useMemo } from "react";
import * as THREE from "three";
import { INNERWORKS_PALETTE as P } from "../lib/palette";
import { GearTrain } from "../mechanisms/GearTrain";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish";
import { SceneText } from "../../../core/polish/Drei";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

interface CutawayStageProps {
  f: number;
  cutawayProgress: number; // 0 = closed cover, 1 = cover gone, ghost outline only
}

const W = 4.8;
const H = 5.8;
const CY = 0.07;
const WALL = 0.2;

const WrenchBlock: React.FC = () => (
  <mesh position={[0, 0.04, 0]} castShadow>
    <RoundedBoxGeo args={[0.8, 0.08, 0.14]} />
    <meshPhysicalMaterial color={P.hardenedShaft} metalness={0.8} roughness={0.3} />
  </mesh>
);

export const CutawayStage: React.FC<CutawayStageProps> = ({ f, cutawayProgress: c }) => {
  const grain = useSurfaceGrain(5, 0.16, 3);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, 0.14)), []);
  const casing = { color: P.mintCasing, ...POLISH.toyPlastic, roughnessMap: grain };

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshPhysicalMaterial color={P.floorTint} {...POLISH.stone} />
      </mesh>

      {/* Plinth + brand plate */}
      <mesh position={[0, -3.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[5.8, 0.6, 2.4]} radius={0.08} />
        <meshPhysicalMaterial color={P.plinthWhite} {...POLISH.toyPlastic} roughnessMap={grain} />
      </mesh>
      {/* Brand plate moved to right of plinth centre so the bottom-right legend never covers it */}
      <mesh position={[-1.55, -3.2, 1.205]}>
        <planeGeometry args={[0.7, 0.12]} />
        <meshBasicMaterial color={P.orangeAccent} />
      </mesh>
      <SceneText font="sans" fontSize={0.2} letterSpacing={0.12} color={P.inkText} anchorX="center" anchorY="middle" position={[0.6, -3.2, 1.205]}>
        AUDIRA INNERWORKS
      </SceneText>

      {/* Foreground bench edge — adds depth parallax in the close-up phase (visible at ~z 2.3) */}
      <mesh position={[-3.0, -3.0, 2.3]} castShadow>
        <RoundedBoxGeo args={[1.6, 0.18, 0.08]} radius={0.02} />
        <meshPhysicalMaterial color={P.plinthWhite} {...POLISH.toyPlastic} roughnessMap={grain} />
      </mesh>

      {/* Wrench on the plinth for scale */}
      <AssetModel id="wrench-390c5f" size={1.0} ground polish="toyPlastic" position={[2.15, -2.9, 0.75]} rotation={[0, 0.5, 0]} fallback={<WrenchBlock />} />

      {/* Casing: back plate + four walls */}
      <mesh position={[0, CY, -0.6]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W, H, 0.16]} radius={0.05} />
        <meshPhysicalMaterial {...casing} color="#cdeee0" />
      </mesh>
      {[
        { p: [0, CY + H / 2 - WALL / 2, -0.05], s: [W, WALL, 1.2] },
        { p: [0, CY - H / 2 + WALL / 2, -0.05], s: [W, WALL, 1.2] },
        { p: [-W / 2 + WALL / 2, CY, -0.05], s: [WALL, H, 1.2] },
        { p: [W / 2 - WALL / 2, CY, -0.05], s: [WALL, H, 1.2] },
      ].map((w, i) => (
        <mesh key={i} position={w.p as [number, number, number]} castShadow receiveShadow>
          <RoundedBoxGeo args={w.s as [number, number, number]} radius={0.05} />
          <meshPhysicalMaterial {...casing} />
        </mesh>
      ))}

      <GearTrain f={f} />

      {/* Front cover: lifts toward the camera and fades, leaving a ghost outline */}
      <group position={[0, CY + c * 0.5, 0.55 + c * 1.1]} rotation={[-c * 0.22, 0, 0]}>
        {c < 0.999 ? (
          <mesh>
            <RoundedBoxGeo args={[W, H, 0.14]} radius={0.05} />
            {/* tinted acrylic: the gears read through it from frame 0 (the hook shows the mechanism) */}
            <meshPhysicalMaterial {...casing} transparent opacity={0.42 * (1 - c)} depthWrite={false} />
          </mesh>
        ) : null}
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={P.xrayCyan} transparent opacity={0.25 + 0.55 * c} />
        </lineSegments>
      </group>

      {/* Section line sweeping across while the cover opens */}
      {c > 0.001 && c < 0.999 ? (
        <mesh position={[-W / 2 + c * W, CY, 0.62]}>
          <boxGeometry args={[0.04, H + 0.3, 0.04]} />
          <meshBasicMaterial color={P.xrayCyan} />
        </mesh>
      ) : null}
    </group>
  );
};
