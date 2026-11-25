// EP03 cover (ISOCRAFT): "60 DETIK PENENTU MAPMU" — the 60-second discovery machine.
// Renders the hook world (Hook.tsx) from COVER_CAMERA + comic headline overlay.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Bangers";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette";
import { COVER_CAMERA, HOOK_BG, HookCamera, HookWorld } from "./Hook.tsx";

const { fontFamily: BANGERS } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const ink = (w: number) =>
  [`${w}px ${w}px 0 ${P.inkBlack}`, `-${w}px ${w}px 0 ${P.inkBlack}`, `${w}px -${w}px 0 ${P.inkBlack}`, `-${w}px -${w}px 0 ${P.inkBlack}`, `0 ${w * 2.2}px 0 ${P.inkBlack}`].join(", ");

export const HookHeadline: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* paper fade behind the headline so it reads on the busy diorama */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(245,242,235,0.96) 0%, rgba(245,242,235,0.9) 22%, rgba(245,242,235,0) 34%)" }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 188, fontFamily: BANGERS, textAlign: "left" }}>
      <div style={{ display: "inline-block", fontSize: 40, letterSpacing: 3, color: P.paperWarm, background: P.inkBlack, padding: "4px 18px 2px", transform: "skewX(-8deg)" }}>
        ALGORITMA ROBLOX · EP03
      </div>
      <div style={{ marginTop: 14, lineHeight: 0.9, transform: "skewX(-6deg)" }}>
        <div style={{ fontSize: 186, color: "#E2432C", WebkitTextStroke: `7px ${P.inkBlack}`, paintOrder: "stroke fill", textShadow: ink(5), letterSpacing: 2 }}>
          60 DETIK
        </div>
        <div style={{ fontSize: 110, color: "#FFFFFF", WebkitTextStroke: `6px ${P.inkBlack}`, paintOrder: "stroke fill", textShadow: ink(4), letterSpacing: 2, marginTop: 6 }}>
          PENENTU MAPMU
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep03Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: HOOK_BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 200 }}
      >
        <HookCamera f={f} />
        <HookWorld f={f} />
        <Finish frame={frame} background={HOOK_BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.9} envIntensity={0.25} ao={false} />
      </ThreeCanvas>
      <HookHeadline />
    </AbsoluteFill>
  );
};

export const Cover = Ep03Cover;
