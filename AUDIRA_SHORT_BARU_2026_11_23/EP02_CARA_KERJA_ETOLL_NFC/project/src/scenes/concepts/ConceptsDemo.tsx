// Demo pustaka konsep (core/concepts): satu kartu 1 dtk per konsep, tanpa teks, supaya bisa
// dicek apakah tiap konsep terbaca hanya dari bentuknya (G22).
//   node scripts/stills.mjs out/concepts 0.5s,1.5s,2.5s,...,15.5s ConceptsDemoPreview

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import {
  AirMolecule, Chloroplast, GasBubble, Leaf, LightBeam, RaceCar, ScatterBurst, SportsPerson, Stoma, Tyre, WaterDrop, WaveRibbon,
  type V3,
} from "../../core/concepts/index.ts";
import { M } from "../../core/sport/specs.ts";

type Card = { bg: string; cam: V3; target: V3; fov?: number; floor?: string; render: (f: number) => React.ReactNode };

const CARDS: Card[] = [
  { bg: "#1b2a4a", cam: [0, 0, 8], target: [0, 0, 0], render: (f) => <LightBeam f={f} source from={[-0.15, 1.75, 0]} to={[0.55, -2.5, 0]} width={0.28} /> },
  {
    bg: "#f3efe6", cam: [0, 0, 7], target: [0, 0, 0], render: (f) => (
      <>
        <WaveRibbon f={f} wavelength="short" position={[0, 0.9, 0]} length={2.6} />
        <WaveRibbon f={f} wavelength="long" position={[0, -1.0, 0]} length={2.6} />
      </>
    ),
  },
  {
    bg: "#cfe6ff", cam: [0, 0.2, 5.4], target: [0, 0, 0], render: (f) => (
      <>
        <AirMolecule f={f} gas="N2" position={[0, 1.15, 0]} />
        <AirMolecule f={f} gas="O2" position={[0, -0.15, 0]} seed={2} />
        <AirMolecule f={f} gas="CO2" position={[0, -1.35, 0]} seed={3} scale={0.85} />
      </>
    ),
  },
  { bg: "#0f1c33", cam: [0.4, 0.3, 6.6], target: [0, 0, 0], render: (f) => <ScatterBurst f={f + 60} scale={0.52} /> },
  { bg: "#dceefa", cam: [0, 0.1, 4.2], target: [0, 0, 0], render: (f) => <WaterDrop f={f} scale={1.1} /> },
  { bg: "#eef3df", cam: [0.6, 1.2, 3.6], target: [0, 1.0, 0], render: (f) => <Leaf f={f} stomata={5} rotation={[-0.2, 0.2, -0.15]} /> },
  { bg: "#e4f1d6", cam: [0.5, 0.4, 4.2], target: [0, 0, 0.2], render: (f) => <Stoma f={f} open={0.8} gasFlow /> },
  { bg: "#e8f5e0", cam: [0.3, 1.2, 5.2], target: [0, 0, 0], render: (f) => <Chloroplast f={f} scale={0.62} rotation={[0.1, 0, 0]} /> },
  {
    bg: "#bfe3f0", cam: [0, 0, 5.4], target: [0, 0, 0], render: (f) => (
      <>
        <GasBubble f={f} gas="O2" position={[0.1, 0.9, 0]} />
        <GasBubble f={f} gas="CO2" position={[-0.1, -0.9, 0]} seed={3} />
      </>
    ),
  },
  { bg: "#cfe3c4", floor: "#3f8a4c", cam: [1.1, 0.75, 2.6], target: [0, 0.6, 0], render: (f) => <SportsPerson f={f} sport="tennis" heading={0.5} /> },
  { bg: "#2a3550", floor: "#2f7a5a", cam: [1.0, 0.75, 2.6], target: [0, 0.62, 0], render: (f) => <SportsPerson f={f} sport="badminton" heading={0.4} number={9} /> },
  {
    bg: "#2b2e36", floor: "#4a4d55", cam: [3.4, 2.2, 6.0], target: [-0.2, 0.3, 0.1], fov: 40, render: (f) => (
      <>
        <RaceCar f={f} era="modern" number={44} rotation={[0, -0.35, 0]} position={[-0.5, 0, -0.6]} />
        <SportsPerson f={f} sport="f1crew" position={[0.45, 0, 0.95]} heading={-1.6} />
      </>
    ),
  },
  { bg: "#d9c7a3", floor: "#a88b5e", cam: [1.1, 0.8, 2.6], target: [0, 0.58, 0], render: (f) => <SportsPerson f={f} sport="marathon1904" heading={0.9} number={1904} /> },
  { bg: "#3a2730", floor: "#2f4a8a", cam: [0.9, 0.75, 2.4], target: [0, 0.6, 0], render: (f) => <SportsPerson f={f} sport="boxing" heading={0.25} /> },
  { bg: "#d8cdb5", floor: "#8a7f6a", cam: [2.6, 1.6, 5.6], target: [0, 0.35, 0.2], fov: 40, render: (f) => <RaceCar f={f} era="1950s" number={2} speed={6} rotation={[0, -0.25, 0]} /> },
  {
    bg: "#20242c", floor: "#3a3d45", cam: [1.6, 1.0, 2.6], target: [0, 0.25, 0], render: (f) => (
      <>
        <group scale={M} rotation={[0, 0.4, 0]}>
          <Tyre kind="slick" radius={0.36} width={0.42} position={[0, 0.36, 0]} spin={f / 60} />
        </group>
        <SportsPerson f={f} sport="f1crew" position={[-0.55, 0, -0.1]} heading={0.9} />
      </>
    ),
  },
];

export const CONCEPTS_DEMO_SECONDS = CARDS.length;

const Lights: React.FC<{ target: V3 }> = ({ target }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={tgt} position={target} />
      <hemisphereLight args={["#ffffff", "#5a5048", 0.9]} />
      <directionalLight position={[target[0] + 3, target[1] + 6, target[2] + 4]} target={tgt} intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#cfe0ff" />
    </>
  );
};

export const ConceptsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const idx = Math.min(CARDS.length - 1, Math.floor(f / 60));
  const card = CARDS[idx];
  const local = f - idx * 60;
  // Kamera mengorbit pelan supaya tidak ada frame mati.
  const a = (local / 60 - 0.5) * 0.12;
  const [cx, cy, cz] = card.cam;
  const cam: V3 = [cx * Math.cos(a) + cz * Math.sin(a), cy, -cx * Math.sin(a) + cz * Math.cos(a)];
  return (
    <AbsoluteFill style={{ background: card.bg }}>
      <ThreeCanvas key={idx} width={width} height={height} shadows camera={{ position: card.cam, fov: card.fov ?? 38, near: 0.05, far: 200 }}>
        <PoseCamera position={cam} target={card.target} fov={card.fov ?? 38} />
        <Lights target={card.target} />
        {card.floor && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[6, 48]} />
            <meshStandardMaterial color={card.floor} roughness={0.9} />
          </mesh>
        )}
        {card.render(f)}
        <Finish frame={frame} background={card.bg} hdri="studio" profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} envIntensity={0.5} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
