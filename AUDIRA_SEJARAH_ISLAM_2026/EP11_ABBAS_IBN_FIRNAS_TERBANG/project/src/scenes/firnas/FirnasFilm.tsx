// EP11 Abbas ibn Firnas: Manusia Pertama yang Mencoba Terbang
// SKETCHFORGE style: graphite sketch → 3D lift, paper cream palette, vermilion accent.
// Audio Master Clock: VO dictates all timing via timeline.json.

import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { firnasCamera } from "./camera";
import { SketchbookGround, HookZone, ContextZone, WorkshopZone, CliffZone, TimelineZone, OutroZone } from "./World";
import { FirnasOverlay } from "./Overlay";
import { TOTAL, OUTRO_AT, prog, smooth } from "./time";

export const FIRNAS_TOTAL = TOTAL;
export const FIRNAS_COVER_SECONDS = 3;
const FPS = 60;

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const cam = firnasCamera(f);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  });
  return null;
};

export const FirnasFilm: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const isFilm = durationInFrames / fps >= TOTAL - 0.1;
  const f = (frame / fps) * FPS;
  const t = f / FPS;

  // fade in from paper at start, fade out at outro
  const fadeIn = 1 - smooth(prog(t, 0, 0.6));
  const fadeOut = smooth(prog(t, OUTRO_AT - 0.5, OUTRO_AT));

  return (
    <AbsoluteFill style={{ background: P.desk }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 7, 4], fov: 36, near: 0.05, far: 120 }}
      >
        <CameraRig f={f} />
        <color attach="background" args={[P.desk]} />

        {/* Lighting: warm documentary (motion-memory SKETCHFORGE best params) */}
        <ambientLight intensity={0.65} color="#FFF4E6" />
        <hemisphereLight args={["#FFF6EA", "#3A3A40", 0.45]} />
        <directionalLight
          position={[6, 10, 7]}
          intensity={2.0}
          color="#FFF1DE"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-camera-far={50}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, 4, -5]} intensity={0.8} color="#DDE6FF" />
        {/* Fill lights for each zone */}
        <pointLight position={[0, 3, 2]} intensity={4} distance={8} decay={1.5} color="#FFF1DE" />
        <pointLight position={[8, 3, 2]} intensity={4} distance={8} decay={1.5} color="#FFF1DE" />
        <pointLight position={[13, 4, 3]} intensity={5} distance={10} decay={1.4} color="#FFF1DE" />
        <pointLight position={[19, 3, 2]} intensity={4} distance={8} decay={1.5} color="#FFF1DE" />

        {/* World */}
        <SketchbookGround />
        <HookZone t={t} />
        <ContextZone t={t} />
        <WorkshopZone t={t} />
        <CliffZone t={t} />
        <TimelineZone t={t} />
        <OutroZone t={t} />

        {/* Finish: DOCUMENTARY_WARM, exposure 0.85, envIntensity 0.25 (SKETCHFORGE best params) */}
        <Finish
          frame={frame}
          profile={COLOR_PROFILES.DOCUMENTARY_WARM}
          exposure={0.85}
          envIntensity={0.25}
          hdri="studio"
        />
      </ThreeCanvas>

      {/* 2D overlay: HUD + captions */}
      <FirnasOverlay t={t} width={width} height={height} />

      {/* Voice-over */}
      {withAudio && <Voiceover src="audio/vo.wav" offset={0} />}

      {/* Brand */}
      {isFilm && <AudiraSignature seed="ep11-abbas-ibn-firnas" />}
      {isFilm && <AudiraOutro />}

      {/* Fades */}
      {fadeIn > 0 && <AbsoluteFill style={{ backgroundColor: P.paper, opacity: fadeIn }} />}
      {fadeOut > 0 && <AbsoluteFill style={{ backgroundColor: P.paper, opacity: fadeOut }} />}
    </AbsoluteFill>
  );
};
