// AE-055 topic cover (FILMNOIR): low camera down the ENIAC panel corridor toward a slatted window.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { EniacRoom, NOIR } from "./EniacRoom.tsx";

// Motion memory FILMNOIR: APPLE_STUDIO_CLEAN base, exposure 0.72, envIntensity 0.1, AO on.
// Vignette/grain raised for the 35 mm noir print look; tints stay zero.
const NOIR_GRADE = { ...COLOR_PROFILES.APPLE_STUDIO_CLEAN, vignette: 0.34, grain: 0.03, contrastCurve: 0.28 };

export const coverCamera = (f: number) => {
  const t = f / 60;
  return {
    pos: [0.18 + Math.sin(t * 0.3) * 0.04, 0.62, 5.0 - t * 0.06] as [number, number, number],
    target: [-0.05, 1.95, -6] as [number, number, number],
    fov: 62,
    roll: -0.035,
  };
};

const Cam: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const c = coverCamera(f);
  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.position.set(...c.pos);
    cam.up.set(Math.sin(c.roll), Math.cos(c.roll), 0);
    cam.lookAt(...c.target);
    cam.fov = c.fov;
    cam.near = 0.05;
    cam.far = 60;
    cam.layers.enable(FX_LAYER);
    cam.updateProjectionMatrix();
  }, [camera, c.pos[0], c.pos[1], c.pos[2], c.fov, c.roll]);
  return null;
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: NOIR.void }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.6, 5], fov: 62, near: 0.05, far: 60 }}>
        <Cam f={f} />
        <ambientLight intensity={0.05} color="#8a93a0" />
        <hemisphereLight args={["#9aa4b2", "#1a1410", 0.08]} />
        <EniacRoom f={f} />
        <Finish frame={frame} background={NOIR.void} profile={NOIR_GRADE} exposure={0.72} envIntensity={0.1} ao />
      </ThreeCanvas>
      <CoverTitle />
    </AbsoluteFill>
  );
};

const CoverTitle: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(5,5,6,0.92) 0%, rgba(5,5,6,0.72) 45%, rgba(5,5,6,0) 100%)" }} />
    <div style={{ position: "absolute", left: 72, right: 72, top: 196, color: "#efe9dc" }}>
      <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 30, letterSpacing: 9, color: "#ffc98a", marginBottom: 22 }}>
        AUDIRA EXPLAINED
      </div>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: 118,
          lineHeight: 1.0,
          letterSpacing: 1,
          textShadow: "0 6px 30px rgba(0,0,0,0.9)",
        }}
      >
        KOMPUTER
        <br />
        SEBESAR
        <br />
        <span style={{ color: "#ffd7a3" }}>RUANGAN</span>
      </div>
      <div style={{ width: 120, height: 3, background: "#ffc98a", margin: "30px 0 20px" }} />
      <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 30, letterSpacing: 3, color: "#d9d3c6" }}>
        ± 18.000 TABUNG VAKUM · ENIAC, 1946
      </div>
    </div>
  </AbsoluteFill>
);
