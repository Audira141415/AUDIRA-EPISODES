// EP01 film (SATELLITEBRIEFING): "81 ribu kasus ISPA di Mimika: asapnya kiriman".
// One continuous orbital camera over the approved cover world: dolly onto Mimika, follow the plume
// upwind to Merauke and back on the wind, rise through the haze onto the cumulative-cases board,
// push through the board to the "10 besar" tower, crane back to orbit for the payoff.
// All timing comes from timeline.json (Audio Master Clock). Audio is muxed separately by the lead.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { FOV, OUTRO_AT } from "./clock.ts";
import { Rig, World3D, BG } from "./World3D.tsx";
import { Hud } from "./Hud.tsx";

export const Ep01Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: FOV, near: 0.02, far: 80, position: [0, 10, 8] }}>
        <Rig t={t} />
        <World3D t={t} />
        <Finish frame={frame} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Hud t={t} />
      </div>
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
