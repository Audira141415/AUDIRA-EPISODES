// EP19 cover — PIXELSTORY. The film's opening frame (night desk, the phone running the original pixel bird game)
// with the headline "US$50.000/HARI · DIHAPUS SENDIRI".
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../kits/pixelstory/core/palette.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { CoverFrame } from "./Film.tsx";

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const k = width / SCREEN.w;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <CoverFrame t={0.5 + frame / fps / 30} />
        <Grade />
        <Vignette strength={0.85} cy="47%" />
        <Grain frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
