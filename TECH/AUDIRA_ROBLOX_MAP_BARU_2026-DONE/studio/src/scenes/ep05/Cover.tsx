// EP05 cover (DEVFORGE): "BIKIN MAP PAKAI PROMPT". The hook world (prompt panel -> cubes ->
// side-scroller platforms, avatar + chasing NPC) with the HTML headline on top.
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";
import { BG, COVER_CAMERA, HookWorld } from "./Hook.tsx";

export const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"], subsets: ["latin"] });
export const DISPLAY = "EP05 Anton";

let anton: Promise<void> | null = null;
export const useDisplayFont = () => {
  const [handle] = useState(() => delayRender("EP05 display font"));
  useEffect(() => {
    (anton ??= new FontFace(DISPLAY, `url(${staticFile("fonts/Anton-Regular.ttf")})`).load().then((ff) => {
      (document.fonts as unknown as { add(face: FontFace): void }).add(ff);
    }))
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

export const Headline: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(8,11,17,0.94) 0%, rgba(8,11,17,0.82) 20%, rgba(8,11,17,0) 31%, rgba(8,11,17,0) 80%, rgba(8,11,17,0.6) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 70, top: 190, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: P.accentNeon }}>
      &gt;_ AUDIRA · ROBLOX MAP BARU
    </div>
    <div style={{ position: "absolute", left: 62, top: 236, fontFamily: `'${DISPLAY}', Impact, sans-serif`, color: "#F5F7FA", lineHeight: 1.0 }}>
      <div style={{ fontSize: 176, letterSpacing: 1, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>BIKIN MAP</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 4 }}>
        <span style={{ fontSize: 118, letterSpacing: 1, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>PAKAI</span>
        <span
          style={{
            fontSize: 118,
            letterSpacing: 1,
            color: P.ambientVoid,
            background: P.accentNeon,
            padding: "0 22px",
            borderRadius: 14,
            boxShadow: `0 0 40px ${P.accentNeon}88`,
          }}
        >
          PROMPT
        </span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  useDisplayFont();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.5, far: 200 }}
      >
        <HookWorld f={f} />
        <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />
      </ThreeCanvas>
      <Headline />
    </AbsoluteFill>
  );
};
