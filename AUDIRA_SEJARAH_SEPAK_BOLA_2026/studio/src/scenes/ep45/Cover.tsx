// EP45 cover — PIXELSTORY. Denmark, Euro 1992: called up 10 days before kick-off, champions after a 2–0 final.
// A night stadium painted once into albedo layers and relit by one dominant floodlight (upper left) plus a
// weaker cool rim from the far tower (upper right). One hero: a generic red-and-white player (no real face,
// no crest) lifting a generic two-handled cup in the centre circle. Brand: AUDIRA on an ad board.
// Set coordinates are art px on the 1080 × 1920 stage (8 screen px per art px → 135 × 240).
// The set and headline live in StadiumShot.tsx so the film opens on exactly this frame.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../kits/pixelstory/core/palette.ts";
import { SCREEN } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { Grade, Grain, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { CoverText, StadiumShot } from "./StadiumShot.tsx";

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
        <StadiumShot />
        <CoverText />
        <Grade />
        <Vignette strength={0.6} />
        <Grain frame={Math.floor(f)} />
      </div>
    </AbsoluteFill>
  );
};
