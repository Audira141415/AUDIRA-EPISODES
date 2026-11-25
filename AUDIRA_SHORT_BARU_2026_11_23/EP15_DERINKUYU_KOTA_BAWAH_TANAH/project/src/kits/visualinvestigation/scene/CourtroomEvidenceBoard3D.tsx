import React, { useMemo } from "react";
import * as THREE from "three";
import { computeVisualInvestigationState } from "../core/motion";
import { VISUALINVESTIGATION_PALETTE as C } from "../lib/palette";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";

/** Polaroid-style evidence photo (abstract content, no faces). */
const EvidencePhoto: React.FC<{ position: [number, number, number]; rot: number; tone: string }> = ({ position, rot, tone }) => (
  <group position={position} rotation={[-Math.PI / 2, 0, rot]}>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[0.62, 0.74, 0.012]} radius={0.005} />
      <meshPhysicalMaterial {...POLISH.paper} color="#ece8de" />
    </mesh>
    <mesh position={[0, 0.06, 0.008]}>
      <planeGeometry args={[0.52, 0.5]} />
      <meshStandardMaterial color={tone} roughness={0.6} />
    </mesh>
  </group>
);

/** Red evidence string between pins. */
const RedString: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 32, 0.008, 6, false), [points]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={C.evidenceRed} roughness={0.7} />
    </mesh>
  );
};

/** Procedural lens, used only if the GLB cannot load. */
const LensBlock: React.FC = () => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.3, 0.035, 12, 40]} />
      <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.05, 0.5, 16]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#4a2a1a" />
    </mesh>
  </group>
);

/** Scanned dossier sheet with redaction bars, highlighter wipe, evidence photos, strings and a hovering lens. */
export const CourtroomEvidenceBoard3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeVisualInvestigationState(f);
  const lensT = f / 60;
  const lensX = 0.92 + Math.sin(lensT * 0.55) * 0.45;
  const lensZ = -0.05 + Math.cos(lensT * 0.4) * 0.35;
  return (
    <group>
      <group position={[0.92, -0.2, 0]} rotation={[-Math.PI / 2, 0, -0.08]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.95, 2.45, 0.02]} radius={0.004} />
          <meshPhysicalMaterial {...POLISH.paper} color={C.archivalPaper} />
        </mesh>
        {[0.95, 0.75, 0.48, 0.22, -0.08, -0.35, -0.62, -0.88].map((y, idx) => (
          <mesh key={idx} position={[idx % 3 === 2 ? -0.2 : 0, y, 0.012]}>
            <planeGeometry args={[idx % 3 === 2 ? 1.15 : 1.55, idx === 0 ? 0.12 : 0.07]} />
            <meshBasicMaterial color={C.inkBlack} />
          </mesh>
        ))}
        <mesh position={[-0.78 + state.highlightWidth / 2, 0.22, 0.016]}>
          <planeGeometry args={[state.highlightWidth, 0.16]} />
          <meshStandardMaterial color={C.evidenceRed} emissive={C.evidenceRed} emissiveIntensity={0.35} transparent opacity={0.7} />
        </mesh>
        {/* VERIFIED stamp */}
        <mesh position={[0.5, -1.0, 0.014]} rotation={[0, 0, 0.2]}>
          <ringGeometry args={[0.16, 0.2, 32]} />
          <meshBasicMaterial color={C.verifiedGreen} transparent opacity={Math.min(1, Math.max(0, (f - 300) / 20))} />
        </mesh>
      </group>

      <EvidencePhoto position={[-0.2, -0.235, -1.25]} rot={0.18} tone="#4a5a6b" />
      <EvidencePhoto position={[2.25, -0.235, -1.05]} rot={-0.22} tone="#6b5a4a" />
      <EvidencePhoto position={[2.3, -0.235, 1.1]} rot={0.12} tone="#3e4f43" />
      <RedString points={[[-0.2, -0.2, -1.2], [0.6, -0.15, -0.9], [1.4, -0.17, 0.22]]} />
      <RedString points={[[2.25, -0.2, -1.0], [1.8, -0.16, -0.5], [1.4, -0.17, 0.22]]} />
      <RedString points={[[2.3, -0.2, 1.05], [1.8, -0.16, 0.7], [1.4, -0.17, 0.22]]} />
      {[[-0.2, -1.2], [2.25, -1.0], [2.3, 1.05], [1.4, 0.22]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -0.17, z]} castShadow>
          <sphereGeometry args={[0.045, 16, 12]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.evidenceRed} />
        </mesh>
      ))}

      {/* Magnifying lens drifting over the highlighted clause */}
      <group position={[lensX, 0.32 + Math.sin(lensT * 1.3) * 0.03, lensZ]} rotation={[-Math.PI / 2 + 0.25, 0, 0.6]}>
        <AssetModel id="magnifying-lens-a8959c" size={0.95} polish="toyPlastic" fallback={<LensBlock />} />
      </group>
    </group>
  );
};
