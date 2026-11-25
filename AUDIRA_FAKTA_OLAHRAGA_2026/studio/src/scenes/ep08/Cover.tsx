// EP08 cover — PIXELSTORY. Owi/Butet, Rio 2016: mixed-doubles gold sealed 3 minutes before 17 August 2016 ended (WIB).
// Indoor arena painted once into albedo layers, relit by one dominant overhead spot plus a cool rim (upper right).
// Hero: a generic Indonesian player seen from behind at the top of a jump smash (Owi, shorts), partner at the net (no faces, no crests).
// Brand: AUDIRA on an ad board. The set and headline live in ArenaShot.tsx so the film opens on exactly this frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../kits/pixelstory/core/palette.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { ArenaShot, CoverText } from "./ArenaShot.tsx";

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
        <ArenaShot />
        <CoverText />
        <Grade />
        <Vignette strength={0.6} />
        <Grain frame={Math.floor(f)} />
      </div>
    </AbsoluteFill>
  );
};
