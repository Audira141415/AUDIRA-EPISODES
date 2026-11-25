// EP02 cover (DATAPHYSICAL): "MAP BARU, CUAN TIMPANG".
// Hook world (Hook.tsx) at the cover pose + Finish + HTML headline overlay.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { BG, COVER_CAMERA, COVER_FOCUS, HookWorld, useEp02Ready } from "./Hook.tsx";
import { DISPLAY, TEXT } from "./fonts.ts";

const ORANGE = "#FF6A26";

export const Headline: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(20,21,24,0.92) 0%, rgba(20,21,24,0.7) 22%, rgba(20,21,24,0) 34%, rgba(20,21,24,0) 80%, rgba(20,21,24,0.5) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 192, fontFamily: TEXT, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: ORANGE }}>
      ● DATA ROBLOX · AGUSTUS 2026
    </div>
    <div
      style={{
        position: "absolute",
        left: 66,
        top: 238,
        fontFamily: DISPLAY,
        color: "#F4F1EA",
        lineHeight: 0.98,
        textShadow: "0 6px 24px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontSize: 142, letterSpacing: 1 }}>MAP BARU,</div>
      <div style={{ fontSize: 142, letterSpacing: 1 }}>
        CUAN <span style={{ color: ORANGE }}>TIMPANG</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep02Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const ready = useEp02Ready();
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready ? (
        <ThreeCanvas
          width={width}
          height={height}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 120 }}
        >
          <HookWorld f={f} camera={COVER_CAMERA} />
          <Finish frame={frame} background={BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} hdri="studio" ao focus={COVER_FOCUS} aperture={0.0009} maxBlur={0.006} />
        </ThreeCanvas>
      ) : null}
      {ready ? <Headline /> : null}
    </AbsoluteFill>
  );
};

export const Cover = Ep02Cover;
