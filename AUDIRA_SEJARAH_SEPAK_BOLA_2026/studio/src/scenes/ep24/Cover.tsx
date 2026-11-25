// EP24 cover (FILMNOIR): "Tragedi Heysel 1985"
// 39 victims (32 Italian), wall collapse, Liverpool vs Juventus European Cup Final.
// Tone: solemn, respectful. No graphic violence. Dark chiaroscuro noir.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { NoirStreet3D } from "../../kits/filmnoir/scene/NoirStreet3D";
import { FILMNOIR_PALETTE as P } from "../../kits/filmnoir/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const CAM_POS: [number, number, number] = [0.4, 1.45, 5.2];
const CAM_TARGET: [number, number, number] = [0.1, 1.35, 0];
const CAM_FOV = 34;

const DEEP_RED = "#7A0A14";
const WARM_GOLD = P.streetLightTungsten;

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <color attach="background" args={[P.voidDark]} />
    <fog attach="fog" args={[P.voidDark, 8, 22]} />
    {/* Very low ambient — preserve chiaroscuro */}
    <ambientLight intensity={0.04} color="#2A3040" />
    {/* Cold moonlight rim from above-behind */}
    <directionalLight position={[-3.5, 6.5, -4.0]} intensity={0.9} color={P.rimLightCool} />
    {/* Memorial candle: soft warm fill from left ground */}
    <pointLight position={[-1.8, 0.4, 2.0]} color="#FF9A40" intensity={0.6} distance={6} decay={2} />
    <NoirStreet3D f={f} />
    <Finish
      frame={0}
      background={P.voidDark}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={0.55}
      envIntensity={0.06}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Vignette gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(6,7,9,0.95) 0%, rgba(6,7,9,0.72) 20%, rgba(6,7,9,0.0) 42%, rgba(6,7,9,0.0) 70%, rgba(6,7,9,0.88) 100%)",
      }}
    />

    {/* Top badge */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 196,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: 8,
          overflow: "hidden",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: DEEP_RED, color: "#F0EDE8", padding: "7px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div style={{ background: "rgba(6,7,9,0.92)", color: WARM_GOLD, padding: "7px 14px" }}>
          #24
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: "#CCC8C0",
          border: `2px solid ${DEEP_RED}`,
          borderRadius: 7,
          padding: "5px 11px",
        }}
      >
        AUDIRA
      </div>
    </div>

    {/* Main title block */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 282,
        fontFamily: ANTON,
        lineHeight: 0.93,
        textShadow: "0 6px 32px rgba(0,0,0,0.9)",
      }}
    >
      <div style={{ fontSize: 128, color: "#EDE9E0", letterSpacing: 1 }}>TRAGEDI</div>
      <div style={{ fontSize: 148, color: DEEP_RED, letterSpacing: 1 }}>HEYSEL</div>
      <div style={{ fontSize: 148, color: "#EDE9E0", letterSpacing: 1 }}>1985</div>
    </div>

    {/* Fact strip */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 710,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 30,
        color: WARM_GOLD,
        letterSpacing: 3,
        textShadow: "0 2px 12px rgba(0,0,0,0.85)",
      }}
    >
      39 JIWA · 29 MEI 1985
    </div>
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 756,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        color: "#A09890",
        letterSpacing: 2,
      }}
    >
      LIVERPOOL v JUVENTUS · BRUSSELS
    </div>

    {/* Bottom AUDIRA brand inside world — text on dark panel */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 400,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: 6,
          color: "rgba(255,255,255,0.22)",
          textTransform: "uppercase",
        }}
      >
        AUDIRA
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = 0; // static cover — always frame 0 state
  return (
    <AbsoluteFill style={{ background: P.voidDark }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={false}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 50 }}
        onCreated={({ camera }) => {
          camera.lookAt(...CAM_TARGET);
        }}
      >
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
