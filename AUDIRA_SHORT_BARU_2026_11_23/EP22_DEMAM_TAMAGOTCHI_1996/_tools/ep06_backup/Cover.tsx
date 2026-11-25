// EP06 cover — PIXELSTORY. The secret room: colour-cycling "CREATED BY WARREN ROBINETT" (our own lettering),
// the 1-pixel gray dot on the floor, AUDIRA on the brass plaque. Same set as the film's first frame (RoomShot).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../kits/pixelstory/core/palette.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { CoverText, RoomShot } from "./Film.tsx";

const FILM_FPS = 60;

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const k = width / SCREEN.w;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <RoomShot t={0.6} ring={1} />
        <CoverText />
        <Grade />
        <Vignette strength={0.6} />
        <Grain frame={Math.floor(f)} />
      </div>
    </AbsoluteFill>
  );
};
