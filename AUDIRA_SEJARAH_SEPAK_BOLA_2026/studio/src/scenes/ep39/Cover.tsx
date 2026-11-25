// EP39 cover (MISTISFORGE): "Benfica, Eusébio & Kutukan Béla Guttmann".
// Mystical kampung night atmosphere — the folklore curse framed as legend, not fact.
// Fog-veiled night with lanterns: the pale presence suggests the shadow of Guttmann's curse.
// Benfica red (#E62B1E) as the accent against the cold moonlit night.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { KampungNight3D } from "../../kits/mistisforge/scene/KampungNight3D";
import { PelitaLanterns3D } from "../../kits/mistisforge/scene/PelitaLanterns3D";
import { FogVeil3D } from "../../kits/mistisforge/scene/FogVeil3D";
import { MISTIS_PALETTE } from "../../kits/mistisforge/lib/palette";
import { computeMistisState } from "../../kits/mistisforge/core/motion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const BENFICA_RED = "#E62B1E";
const W = 1080;
const H = 1920;

// Camera: low, looking through the fog-laden kampung path
const CAM_POS: [number, number, number] = [0.4, 1.4, 8.2];
const CAM_TARGET: [number, number, number] = [-0.3, 0.9, 0];
const CAM_FOV = 50;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(...CAM_TARGET);
    c.fov = CAM_FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Scene: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const s = computeMistisState(f);
  return (
    <>
      <CameraRig />
      <color attach="background" args={[MISTIS_PALETTE.nightSky]} />
      <fogExp2 attach="fog" args={[MISTIS_PALETTE.fogNight, 0.055]} />

      <hemisphereLight args={["#5C7AA6", "#1A1610", 0.9 + s.moonSurge * 0.5]} />
      <directionalLight position={[-3, 9, -14]} intensity={1.6 + s.moonSurge * 1.4} color={MISTIS_PALETTE.moonlight} />
      <directionalLight position={[4, 5, 8]} intensity={0.25} color="#6F86A8" />
      {/* red accented rim: a distant flame-coloured light casting the Benfica curse-hue */}
      <directionalLight position={[2, 3, 10]} intensity={0.6} color={BENFICA_RED} />

      <KampungNight3D f={f} />
      <PelitaLanterns3D f={f} />
      <FogVeil3D f={f} />

      <Finish frame={frame} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} ao={false} exposure={0.95} envIntensity={0.3} />
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* vignette gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(14,24,40,0.88) 0%, rgba(14,24,40,0.70) 20%, rgba(14,24,40,0) 42%, rgba(14,24,40,0) 72%, rgba(14,24,40,0.80) 100%)",
      }}
    />
    {/* episode badge row */}
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
          borderRadius: 10,
          overflow: "hidden",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: BENFICA_RED, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(14,24,40,0.94)", color: MISTIS_PALETTE.lanternAmber, padding: "8px 16px" }}>#39</div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: MISTIS_PALETTE.moonDisc,
          border: `2px solid ${BENFICA_RED}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        BENFICA · AUDIRA
      </div>
    </div>

    {/* main title block */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 290,
        fontFamily: ANTON,
        lineHeight: 0.92,
        textShadow: "0 8px 32px rgba(0,0,0,0.85)",
      }}
    >
      <div style={{ fontSize: 118, color: "#F0F4F8", letterSpacing: 1 }}>KUTUKAN</div>
      <div style={{ fontSize: 118, color: BENFICA_RED, letterSpacing: 1 }}>GUTTMANN</div>
      {/* sub-label as a sticker */}
      <div
        style={{
          marginTop: 18,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 32,
          color: MISTIS_PALETTE.nightSky,
          background: MISTIS_PALETTE.lanternAmber,
          padding: "4px 18px 7px",
          borderRadius: 6,
          letterSpacing: 1,
        }}
      >
        8 Final Eropa... Gagal Semua
      </div>
    </div>

    {/* bottom: Eusébio + legend note */}
    <div
      style={{
        position: "absolute",
        bottom: 420,
        left: 56,
        right: 56,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22,
          color: "rgba(240,244,248,0.70)",
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Eusébio · "A Pantera Negra"
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 18,
          color: MISTIS_PALETTE.lanternAmber,
          letterSpacing: 2,
          fontStyle: "italic",
          opacity: 0.85,
        }}
      >
        Legenda · bukan fakta sejarah
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: MISTIS_PALETTE.nightSky }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.05, far: 80 }}
      >
        <Scene f={f} frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
