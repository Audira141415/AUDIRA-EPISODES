// EP12 cover: the hook beat (rivals down, Bradbury upright) with the full title.
import React from "react";
import { useCurrentFrame } from "remotion";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Picture } from "./Film.tsx";
import { Stamp } from "./hud.tsx";
import { useVideoConfig } from "remotion";

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  return (
    <>
      <Picture t={2.9} frame={frame} scene="A" hud={false} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <Stamp t={9} a={0} text="TERAKHIR" sub="BERDIRI JADI JUARA" top={270} />
      </div>
    </>
  );
};
