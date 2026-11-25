// EP13 cover (MOSAICFORGE): "Manchester United — Dari Munich ke Treble".
// A Byzantine mosaic hall; tesserae in Manchester red and deep lapis form a split image:
// shattered fragments on the left (Munich 1958) assembled into a trophy on the right (Treble 1999).

import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { MOSAIC_PALETTE } from "../../kits/mosaicforge/lib/palette";
import { MosaicHall3D } from "../../kits/mosaicforge/scene/MosaicHall3D";
import { TesseraeField3D } from "../../kits/mosaicforge/scene/TesseraeField3D";
import { MosaicCameraRig, MosaicPost } from "../../kits/mosaicforge/lib/post";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const MAN_RED = "#DA291C";
const MAN_GOLD = "#FBE122";
// Cover still: t=0 → camera settled at the opening low-glide position from the rig
const SHOT = {
  pos: [0.5, 0.6, 6.4] as [number, number, number],
  target: [0, 0.0, 3.6] as [number, number, number],
  fov: 52,
  roll: 0,
  exposure: 0.95,
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(10,8,5,0.9) 0%, rgba(10,8,5,0.6) 20%, rgba(10,8,5,0) 40%, rgba(10,8,5,0) 74%, rgba(10,8,5,0.72) 100%)",
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
        <div style={{ background: MAN_RED, color: "#FFFFFF", padding: "8px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div
          style={{
            background: "rgba(8,6,4,0.94)",
            color: MAN_GOLD,
            padding: "8px 14px",
          }}
        >
          #13
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: MOSAIC_PALETTE.bone,
          border: `2px solid ${MAN_RED}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        MAN UTD · AUDIRA
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
        textShadow: "0 6px 24px rgba(0,0,0,0.75)",
      }}
    >
      <div style={{ fontSize: 90, color: MAN_RED, letterSpacing: 1 }}>MANCHESTER</div>
      <div style={{ fontSize: 90, color: MOSAIC_PALETTE.bone, letterSpacing: 1 }}>UNITED</div>
      <div
        style={{
          marginTop: 14,
          display: "inline-block",
          fontFamily: MARKER,
          fontSize: 50,
          color: MOSAIC_PALETTE.umber,
          background: MAN_GOLD,
          padding: "2px 20px 6px",
          transform: "rotate(-1.5deg)",
        }}
      >
        DARI MUNICH KE TREBLE
      </div>
    </div>

    {/* timeline */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 580,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 44,
        letterSpacing: 3,
        color: MOSAIC_PALETTE.bone,
        textShadow: "0 2px 12px rgba(0,0,0,0.65)",
      }}
    >
      1958 → 1999
    </div>

    {/* detail note */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 648,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 26,
        color: MOSAIC_PALETTE.gold,
        background: "rgba(0,0,0,0.5)",
        borderLeft: `4px solid ${MAN_RED}`,
        padding: "10px 16px",
        lineHeight: 1.5,
      }}
    >
      <div>Tragedi Busby Babes</div>
      <div>→ Treble Bersejarah</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <div style={{ width, height, position: "relative", background: MOSAIC_PALETTE.room }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ position: SHOT.pos, fov: SHOT.fov, near: 0.03, far: 80 }}
      >
        <MosaicCameraRig shot={SHOT} near={0.03} far={80} />
        <MosaicHall3D t={0} />
        <TesseraeField3D t={0} />
        <MosaicPost frame={frame} strength={0.22} radius={0.35} threshold={0.95} vignette={0.4} grain={0.022} />
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0 }}>
        <AbsoluteFill>
          <Overlay />
        </AbsoluteFill>
      </div>
    </div>
  );
};
