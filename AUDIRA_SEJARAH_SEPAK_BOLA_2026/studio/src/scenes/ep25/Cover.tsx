// EP25 cover (HISTORYMAP): "Perang Sepak Bola 1969"
// El Salvador vs Honduras, World Cup qualifier triggered a 4-day war.
// Apollo 11 launched the same week. Historical map aesthetic.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { CartographicTerrain3D } from "../../kits/historymap/scene/CartographicTerrain3D";
import { TacticalPincerArrows3D } from "../../kits/historymap/scene/TacticalPincerArrows3D";
import { HISTORYMAP_PALETTE as P } from "../../kits/historymap/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const CAM_POS: [number, number, number] = [0, 2.15, 5.4];
const CAM_TARGET: [number, number, number] = [0, 0.35, 0];
const CAM_FOV = 36;

const CRIMSON = P.romanCrimson;
const GOLD = P.daciaGold;
const BG = "#121822";

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <color attach="background" args={[BG]} />
    <ambientLight intensity={0.45} color="#FFFFFF" />
    <directionalLight position={[4.5, 7.5, 5.0]} intensity={1.65} color="#FFF8E7" castShadow />
    <directionalLight position={[-4.0, 4.0, -3.5]} intensity={0.75} color="#90CAF9" />
    <CartographicTerrain3D f={f} />
    <TacticalPincerArrows3D f={f} />
    <Finish
      frame={0}
      background={BG}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      ao={false}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Gradient vignette: heavy at top (title zone), fade mid, dark at bottom */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(18,24,34,0.95) 0%, rgba(18,24,34,0.75) 22%, rgba(18,24,34,0.0) 44%, rgba(18,24,34,0.0) 68%, rgba(18,24,34,0.88) 100%)",
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
        <div style={{ background: CRIMSON, color: "#F5F0E8", padding: "7px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div style={{ background: "rgba(12,16,24,0.92)", color: GOLD, padding: "7px 14px" }}>
          #25
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: "#C8C0A8",
          border: `2px solid ${CRIMSON}`,
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
        textShadow: "0 6px 32px rgba(0,0,0,0.85)",
      }}
    >
      <div style={{ fontSize: 112, color: "#EAE5D8", letterSpacing: 1 }}>PERANG</div>
      <div style={{ fontSize: 112, color: CRIMSON, letterSpacing: 1 }}>SEPAK BOLA</div>
      <div style={{ fontSize: 148, color: GOLD, letterSpacing: 1 }}>1969</div>
    </div>

    {/* Fact strip */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 690,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 28,
        color: "#EAE5D8",
        letterSpacing: 3,
        textShadow: "0 2px 12px rgba(0,0,0,0.85)",
      }}
    >
      EL SALVADOR vs HONDURAS
    </div>
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 735,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        color: "#90A0B4",
        letterSpacing: 2,
      }}
    >
      4 HARI PERANG · KUALIFIKASI PD 1970
    </div>
    {/* Apollo 11 note */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 778,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 21,
        color: GOLD,
        letterSpacing: 2,
        opacity: 0.85,
      }}
    >
      ⬡ MINGGU YANG SAMA: APOLLO 11
    </div>

    {/* AUDIRA brand — subtle watermark in map zone */}
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
          color: "rgba(212,175,55,0.2)",
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
