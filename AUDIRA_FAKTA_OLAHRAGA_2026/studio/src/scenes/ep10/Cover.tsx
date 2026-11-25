// EP10 cover: hook frame (arena, scoreboard "100", toy Wilt) with the full hook title.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Frame } from "../ep02/hud.tsx";
import { HookHud, HookScene } from "./Film.tsx";

export const CoverA: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = 1.2;
  return (
    <AbsoluteFill style={{ background: "#e9d6ae" }}>
      <HookScene t={t} frame={frame} />
      <Frame width={width} height={height}>
        <HookHud t={t} still />
      </Frame>
    </AbsoluteFill>
  );
};
