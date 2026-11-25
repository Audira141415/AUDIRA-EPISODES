// Cover topik EP32 — BONGKAR RAHASIA RUMAH
// Loads two-story-house-40f6dc.glb with BUILDFORGE lighting & finish.
// Uses delayRender/continueRender so Remotion waits for GLB before capturing the frame.

import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FilmScene } from "./core/scene/FilmScene.tsx";
import { FONT } from "./core/type/fonts.ts";
import { StageLabel } from "./kits/buildforge/labels/StageLabel.tsx";
import { Post } from "./kits/buildforge/render/Post.tsx";

const HOUSE_GLB = "/public/models/building/two-story-house-40f6dc.glb";
const SUN: [number, number, number] = [-0.78, 0.46, -0.32];

const HouseScene: React.FC<{ gltf: GLTF; frame: number }> = ({ gltf, frame }) => {
  const shot = {
    pos: [18, 10, 22] as [number, number, number],
    target: [0, 2, 0] as [number, number, number],
    fov: 28,
  };
  return (
    <>
      <fog attach="fog" args={["#dce8f0", 40, 160]} />
      <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#8bbd5e" roughness={0.9} />
      </mesh>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[SUN[0] * 60, SUN[1] * 60, SUN[2] * 60]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <Post shot={shot} frame={frame} aoRadius={0.4} />
    </>
  );
};

const STAGES = [{ label: "BONGKAR RAHASIA RUMAH", from: 0, to: 999 }];

export const HouseCoverPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const handle = useMemo(() => delayRender("Loading two-story-house GLB"), []);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.loadAsync(HOUSE_GLB)
      .then((loaded) => {
        setGltf(loaded);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  const shot = {
    pos: [18, 10, 22] as [number, number, number],
    target: [0, 2, 0] as [number, number, number],
    fov: 28,
    roll: 0,
  };
  const stages = STAGES.map((s) => ({ ...s, from: s.from * fps, to: s.to * fps }));

  return (
    <FilmScene
      frame={frame}
      shot={shot}
      background="#e8eef0"
      post={false}
      hdri="sky"
      envIntensity={0.55}
      near={0.4}
      far={2500}
      overlay={() => (
        <StageLabel
          stages={stages}
          frame={frame}
          fps={fps}
          font={FONT}
          ink="#22292c"
          soft="#56636a"
          accent="#0e7a67"
        />
      )}
    >
      {gltf && <HouseScene gltf={gltf} frame={frame} />}
    </FilmScene>
  );
};
