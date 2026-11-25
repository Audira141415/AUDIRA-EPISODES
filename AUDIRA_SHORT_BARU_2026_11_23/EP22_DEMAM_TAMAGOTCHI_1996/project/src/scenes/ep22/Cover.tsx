// EP22 cover — PIXELSTORY. Night bedroom: kid on the bed holding the digital egg (LCD ghost + grave),
// tears, AUDIRA sticker on the nightstand drawer. Same set as the film's first frame (BedShot).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../kits/pixelstory/core/palette.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { BedShot, CoverText, REST } from "./Film.tsx";

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
        <BedShot t={1.0} cam={{ ...REST, z: 60 }} tears={1} sticker={1} />
        <CoverText />
        <Grade />
        <Vignette strength={0.6} />
        <Grain frame={Math.floor(f)} />
      </div>
    </AbsoluteFill>
  );
};
