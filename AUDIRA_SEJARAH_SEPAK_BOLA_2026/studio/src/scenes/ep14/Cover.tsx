// EP14 cover (RETROWAVE): "Liverpool Boot Room & Istanbul 2005".
// Neon void with a rising retro sun; synthwave grid races under the camera.
// Istanbul miracle score 3–0 → 3–3 → ✓ blazes in neon magenta below the title.

import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { RETROWAVE_PALETTE } from "../../kits/retrowave/lib/palette";
import { RetroSunAndGrid as ObjectStage } from "../../kits/retrowave/world/ObjectStage";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const LIV_RED = "#C8102E";
const LIV_GOLD = "#F6EB61";

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 2, 4.5);
    cam.lookAt(0, 0, 0);
    cam.fov = 34;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(12,8,26,0.92) 0%, rgba(12,8,26,0.65) 20%, rgba(12,8,26,0) 42%, rgba(12,8,26,0) 70%, rgba(12,8,26,0.8) 100%)",
      }}
    />

    {/* episode badge */}
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
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: LIV_RED, color: "#FFFFFF", padding: "8px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div
          style={{
            background: "rgba(8,6,20,0.94)",
            color: LIV_GOLD,
            padding: "8px 14px",
          }}
        >
          #14
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: RETROWAVE_PALETTE.synthCyan,
          border: `2px solid ${LIV_RED}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        LIVERPOOL · AUDIRA
      </div>
    </div>

    {/* main title */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 282,
        fontFamily: ANTON,
        lineHeight: 0.93,
        textShadow: `0 0 24px ${RETROWAVE_PALETTE.neonMagenta}, 0 6px 24px rgba(0,0,0,0.9)`,
      }}
    >
      <div style={{ fontSize: 120, color: LIV_RED, letterSpacing: 1 }}>LIVERPOOL</div>
      <div style={{ fontSize: 76, color: RETROWAVE_PALETTE.chromeSilver, letterSpacing: 1 }}>
        BOOT ROOM
      </div>
      <div
        style={{
          marginTop: 12,
          display: "inline-block",
          fontFamily: MARKER,
          fontSize: 50,
          color: RETROWAVE_PALETTE.voidDark,
          background: RETROWAVE_PALETTE.neonMagenta,
          padding: "2px 20px 6px",
          transform: "rotate(-1.3deg)",
        }}
      >
        ISTANBUL 2005
      </div>
    </div>

    {/* miracle score */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 596,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 54,
        letterSpacing: 3,
        color: RETROWAVE_PALETTE.neonMagenta,
        textShadow: `0 0 20px ${RETROWAVE_PALETTE.neonMagenta}`,
      }}
    >
      3-0 → 3-3 → ✓
    </div>

    {/* lineage ribbon */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 668,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        color: RETROWAVE_PALETTE.synthCyan,
        background: "rgba(0,0,0,0.55)",
        borderLeft: `4px solid ${RETROWAVE_PALETTE.synthCyan}`,
        padding: "10px 16px",
        lineHeight: 1.5,
        textShadow: `0 0 10px ${RETROWAVE_PALETTE.synthCyan}`,
      }}
    >
      <div>SHANKLY → PAISLEY</div>
      <div>→ FAGAN → EVANS</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: RETROWAVE_PALETTE.voidDark }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ fov: 34, position: [0, 2, 4.5] }}
      >
        <CameraRig />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} />
        <ObjectStage f={f} />
        <Finish
          frame={frame}
          background={RETROWAVE_PALETTE.voidDark}
          profile={COLOR_PROFILES.CYBER_NEON_VOID}
          ao={false}
        />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
