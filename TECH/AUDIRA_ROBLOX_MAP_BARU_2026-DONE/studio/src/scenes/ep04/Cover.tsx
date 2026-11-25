// EP04 cover (ARCADECRT): "THUMBNAIL ANTI TENGGELAM".
// Hook world (Hook.tsx) + HTML headline. Cover = first frame of the film hook.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { loadFont as loadVT } from "@remotion/google-fonts/VT323";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { BG, COVER_CAMERA, HookWorld } from "./Hook.tsx";

const { fontFamily: BUNGEE } = loadBungee("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: VT } = loadVT("normal", { weights: ["400"], subsets: ["latin"] });

export const CoverOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* readability scrim behind the headline, fading into the arcade */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(7,6,15,0.94) 0%, rgba(7,6,15,0.82) 22%, rgba(7,6,15,0) 36%, rgba(7,6,15,0) 80%, rgba(7,6,15,0.6) 100%)",
      }}
    />
    {/* light scanlines over the whole frame: the cover lives on a CRT too */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)",
      }}
    />
    <div style={{ position: "absolute", left: 64, top: 268, fontFamily: VT, fontSize: 44, letterSpacing: 4, color: P.cyan, textShadow: `0 0 12px ${P.cyan}` }}>
      ▶ MAP BARU ROBLOX · TIPS #4
    </div>
    <div style={{ position: "absolute", left: 58, top: 320, fontFamily: BUNGEE, lineHeight: 1.0 }}>
      <div style={{ fontSize: 132, color: P.yellow, letterSpacing: -2, textShadow: `6px 6px 0 ${P.magenta}, 0 0 28px rgba(255,210,63,0.55)` }}>THUMBNAIL</div>
      <div style={{ fontSize: 86, color: P.white, marginTop: 14, letterSpacing: 0, textShadow: `5px 5px 0 #1B4DFF, 0 0 22px rgba(46,242,255,0.5)` }}>ANTI TENGGELAM</div>
    </div>
    {/* fact chip (FACTS.md S11) above the bottom safe zone */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "fit-content",
        top: 1452,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: VT,
        fontSize: 42,
        color: P.white,
        background: "rgba(7,6,15,0.78)",
        border: `3px solid ${P.magenta}`,
        boxShadow: `0 0 18px rgba(255,46,136,0.55)`,
        padding: "8px 22px 6px",
        letterSpacing: 2,
      }}
    >
      <span>2–5 THUMBNAIL DIUJI</span>
      <span style={{ fontFamily: BUNGEE, fontSize: 46, color: P.yellow }}>+8,5%</span>
      <span style={{ color: P.cyan }}>RATA-RATA</span>
    </div>
  </AbsoluteFill>
);

export const Ep04Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 120 }}
      >
        <HookWorld f={f} />
      </ThreeCanvas>
      <CoverOverlay />
    </AbsoluteFill>
  );
};

export const Cover = Ep04Cover;
