// EP26 cover (VISUALINVESTIGATION): "Skandal Calciopoli 2006"
// Italian football phone-tapping scandal. Juventus relegated to Serie B.
// Fiorentina, Lazio, Milan penalized. Evidence-board aesthetic.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { ForensicDesk3D } from "../../kits/visualinvestigation/scene/ForensicDesk3D";
import { CourtroomEvidenceBoard3D } from "../../kits/visualinvestigation/scene/CourtroomEvidenceBoard3D";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const CAM_POS: [number, number, number] = [0, 2.15, 5.4];
const CAM_TARGET: [number, number, number] = [0, 0.25, 0];
const CAM_FOV = 30;

const EVIDENCE_RED = P.evidenceRed;
const PAPER = P.archivalPaper;
const BG = P.deskVoid;

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <color attach="background" args={[BG]} />
    <ambientLight intensity={0.35} color="#E8ECF0" />
    <directionalLight position={[4.5, 7.5, 5.0]} intensity={1.5} color="#FFF8E7" castShadow />
    <directionalLight position={[-4.0, 4.0, -3.5]} intensity={0.6} color="#90CAF9" />
    {/* Investigation lamp: single overhead spot */}
    <spotLight
      position={[0, 4.5, 2.0]}
      target-position={[0, 0, 0]}
      angle={0.55}
      penumbra={0.4}
      intensity={1.8}
      color="#FFF5DC"
      castShadow
    />
    <ForensicDesk3D f={f} />
    <CourtroomEvidenceBoard3D f={f} />
    <Finish
      frame={0}
      background={BG}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(11,12,14,0.96) 0%, rgba(11,12,14,0.72) 20%, rgba(11,12,14,0.0) 42%, rgba(11,12,14,0.0) 68%, rgba(11,12,14,0.9) 100%)",
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
        <div style={{ background: EVIDENCE_RED, color: "#F5F3EE", padding: "7px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div style={{ background: "rgba(11,12,14,0.92)", color: PAPER, padding: "7px 14px" }}>
          #26
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: "#B0ACA4",
          border: `2px solid ${EVIDENCE_RED}`,
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
      <div style={{ fontSize: 112, color: PAPER, letterSpacing: 1 }}>SKANDAL</div>
      <div style={{ fontSize: 112, color: EVIDENCE_RED, letterSpacing: 1 }}>CALCIOPOLI</div>
      <div style={{ fontSize: 148, color: PAPER, letterSpacing: 1 }}>2006</div>
    </div>

    {/* Evidence tag — classified feel */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 690,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 22,
        color: EVIDENCE_RED,
        letterSpacing: 4,
        border: `1px solid ${EVIDENCE_RED}`,
        padding: "5px 14px",
        display: "inline-block",
      }}
    >
      ◆ REKAMAN TELEPON RAHASIA
    </div>
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 748,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        color: "#A0A8B0",
        letterSpacing: 2,
      }}
    >
      JUVENTUS TERDEGRADASI
    </div>
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 790,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22,
        color: "#707880",
        letterSpacing: 2,
      }}
    >
      FIORENTINA · LAZIO · MILAN — TERPENALTI
    </div>

    {/* AUDIRA brand inside world */}
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
          color: "rgba(255,74,46,0.18)",
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
  const f = 0; // static cover
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={false}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 60 }}
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
