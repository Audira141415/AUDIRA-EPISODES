// EP43 cover (INKSTORY): "Athletic Bilbao — Filosofi Basque Murni". Ink wash paper background
// with Basque red-white geometry. Athletic Bilbao: 100+ years Basque-only policy, 24 Copa del Rey,
// Lezama academy, documented by The Guardian. Vermilion seal = AUDIRA brand.
// Palette: agedXuanPaper bg, pineSootBlack ink, vermilionCinnabar accent, ancientGold.

import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { INK_PALETTE as P } from "../../kits/inkstory/lib/palette";
import { InkMountainDiorama } from "../../kits/inkstory/world/InkMountainDiorama";
import { InkAtmosphere } from "../../kits/inkstory/world/Atmosphere";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const W = 1080;
const H = 1920;

// Athletic Bilbao vertical red-white striped shield element in 3D
const BasqueShield: React.FC = () => {
  const stripeTex = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const g = c.getContext("2d")!;
    // Red and white vertical stripes (Bilbao jersey)
    const stripes = 10;
    const sw = 256 / stripes;
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 === 0 ? "#BB1A2A" : "#F5F0E6";
      g.fillRect(i * sw, 0, sw, 512);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={[1.6, 0.4, -1.2]} rotation={[0.08, -0.35, 0.05]}>
      {/* shield body */}
      <mesh castShadow>
        <planeGeometry args={[1.1, 1.5]} />
        <meshStandardMaterial map={stripeTex} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* shield border in ink */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.16, 1.56]} />
        <meshBasicMaterial color={P.pineSootBlack} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.1, 1.5]} />
        <meshStandardMaterial map={stripeTex} roughness={0.7} />
      </mesh>
    </group>
  );
};

// Vermilion seal stamp (AUDIRA brand — world element)
const VermilionStamp: React.FC = () => {
  const tex = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = P.vermilionCinnabar;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#F5F0E6";
    g.font = "bold 48px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 128, 100);
    g.font = "bold 30px serif";
    g.fillText("オーディラ", 128, 160);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[-2.1, 1.0, -0.5]} rotation={[0, 0.2, -0.08]}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshBasicMaterial map={tex} transparent opacity={0.9} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <color attach="background" args={[P.agedXuanPaper]} />
    <InkAtmosphere />
    <InkMountainDiorama f={0} />
    <BasqueShield />
    <VermilionStamp />
    <Finish frame={0} background={P.agedXuanPaper} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
  </>
);

// Ink border frame decorative element
const InkFrame: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {/* corner brush strokes */}
    <rect x={48} y={188} width={180} height={5} fill={P.pineSootBlack} opacity={0.8} rx={2} />
    <rect x={48} y={188} width={5} height={160} fill={P.pineSootBlack} opacity={0.8} rx={2} />
    <rect x={W - 48 - 180} y={188} width={180} height={5} fill={P.pineSootBlack} opacity={0.8} rx={2} />
    <rect x={W - 53} y={188} width={5} height={160} fill={P.pineSootBlack} opacity={0.8} rx={2} />
    {/* bottom frame line */}
    <rect x={48} y={H - 420} width={W - 96} height={3} fill={P.pineSootBlack} opacity={0.5} rx={1} />
  </svg>
);

const Overlay: React.FC = () => {
  const serif = "'Georgia', 'Times New Roman', serif";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* paper wash top-bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(245,240,230,0.82) 0%, rgba(245,240,230,0.0) 28%, rgba(245,240,230,0.0) 72%, rgba(245,240,230,0.88) 100%)`,
      }} />
      <InkFrame />
      {/* kicker */}
      <div style={{ position: "absolute", left: 60, top: 196, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "stretch", overflow: "hidden", borderRadius: 2 }}>
          <div style={{ background: P.pineSootBlack, color: P.agedXuanPaper, fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 2, padding: "6px 14px" }}>
            SEJARAH SEPAK BOLA
          </div>
          <div style={{ background: P.vermilionCinnabar, color: "#FFF", fontFamily: MONO, fontWeight: 800, fontSize: 24, padding: "6px 12px" }}>#43</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: P.pineSootBlack, letterSpacing: 3, opacity: 0.7 }}>INKSTORY</div>
      </div>
      {/* title block */}
      <div style={{ position: "absolute", left: 56, top: 288, right: 56 }}>
        {/* red accent bar */}
        <div style={{ width: 72, height: 5, background: P.vermilionCinnabar, marginBottom: 16 }} />
        <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 0.9, letterSpacing: 1, color: P.pineSootBlack, textShadow: "2px 4px 0 rgba(0,0,0,0.12)" }}>
          ATHLETIC
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 0.9, letterSpacing: 1, color: P.vermilionCinnabar, textShadow: `2px 4px 0 ${P.vermilionDark}44` }}>
          BILBAO
        </div>
        {/* subtitle in serif ink style */}
        <div style={{ marginTop: 20, fontFamily: serif, fontSize: 42, fontStyle: "italic", color: P.pineSootBlack, opacity: 0.9 }}>
          Filosofi Basque Murni
        </div>
        {/* horizontal ink dash */}
        <div style={{ width: "100%", height: 2, background: P.dilutedWash, margin: "18px 0" }} />
        {/* fact line */}
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.denseInk, letterSpacing: 1 }}>
          100+ TAHUN · HANYA PEMAIN BASQUE
        </div>
      </div>
      {/* stat chips */}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 430, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[["24×", "COPA DEL REY"], ["100+", "TAHUN FILOSOFI"], ["LEZAMA", "AKADEMI BASQUE"]].map(([v, l]) => (
          <div key={l} style={{
            background: "rgba(245,240,230,0.9)",
            border: `1px solid ${P.pineSootBlack}44`,
            borderLeft: `3px solid ${P.vermilionCinnabar}`,
            padding: "8px 16px",
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: P.pineSootBlack, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 17, color: P.dilutedWash, letterSpacing: 2, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      {/* seal stamp (HTML layer) */}
      <div style={{
        position: "absolute",
        right: 60,
        bottom: 440,
        width: 90,
        height: 90,
        border: `4px solid ${P.vermilionCinnabar}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-8deg)",
        opacity: 0.85,
      }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: P.vermilionCinnabar, lineHeight: 1.1, textAlign: "center" }}>
          AUDIRA<br /><span style={{ fontSize: 13 }}>2026</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Cover: React.FC = () => {
  useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.agedXuanPaper }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ fov: 35, near: 0.1, far: 500, position: [0, 0, 6] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
