// EP08 HD2D cover: the hook arena at the top of Owi's jump smash, with the EP08 headline.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { CoverText } from "../ep08/ArenaShot.tsx";
import { SMASH } from "../ep08/timing.ts";
import { Stage } from "./Film.tsx";

export const Cover: React.FC = () => {
  useFonts();
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#0A0D14", overflow: "hidden" }}>
      <Stage t={SMASH - 0.05} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <CoverText />
      </div>
    </AbsoluteFill>
  );
};
