// EP01 cover (BRICKCRAFT): hook world + headline overlay. The film's hook opens on this framing.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { BG, COVER_CAMERA, HookWorld } from "./Hook.tsx";

const { fontFamily: LILITA } = loadLilita();
const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["700"], subsets: ["latin"] });

export const CoverOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(20,22,25,0.92) 0%, rgba(20,22,25,0.72) 22%, rgba(20,22,25,0) 36%, rgba(20,22,25,0) 80%, rgba(20,22,25,0.5) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 70, top: 192, fontFamily: GROTESK, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: "#7FE7FF" }}>
      ● BERITA ROBLOX · AUDIRA
    </div>
    <div style={{ position: "absolute", left: 62, right: 50, top: 244, fontFamily: LILITA, color: "#FFFFFF", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.55)" }}>
      <div style={{ fontSize: 196, color: "#FFCA2C", letterSpacing: 1, WebkitTextStroke: "3px #2a1a00" }}>70.000</div>
      <div style={{ fontSize: 118, marginTop: 6 }}>
        GAME{" "}
        <span style={{ background: "#d11a2a", padding: "0 22px 6px", borderRadius: 18, boxShadow: "0 8px 0 #7a0d16" }}>DARI AI</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.5, far: 220 }}
      >
        <HookWorld f={f} />
        <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} hdri="studio" exposure={0.9} envIntensity={0.6} ao />
      </ThreeCanvas>
      <CoverOverlay />
    </AbsoluteFill>
  );
};
