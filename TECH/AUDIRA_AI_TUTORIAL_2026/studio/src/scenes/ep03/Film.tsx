// EP03 film: 3D VINTAGEFORGE desk world + HUD (1080 units, scaled) + karaoke captions + outro card.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { World } from "./World.tsx";
import { Hud } from "./Hud.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { PARCH } from "./textures.ts";
import TL from "./timeline.json";

export const Ep03Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: PARCH }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ fov: 36, position: [0, 2.3, 6.6] }}>
        <World t={t} frame={frame} preview={width < 1080} />
      </ThreeCanvas>
      {/* old-film vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,22,8,0.35) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Hud t={t} />
      </div>
      <Outro start={TL.sections.outro[1] + 0.2} />
    </AbsoluteFill>
  );
};
