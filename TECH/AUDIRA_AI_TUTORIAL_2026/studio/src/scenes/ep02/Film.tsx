// EP02 film: "Edit Foto Cukup Ngetik" (TOYDIORAMA). 3D stage world + toy-plastic tutorial HUD.
// Audio Master Clock: every beat reads VO seconds from timeline.json. No audio here (lead muxes).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import timeline from "./timeline.json";
import { World, cameraAt } from "./World.tsx";
import { Hud } from "./Hud.tsx";

const BG = "#0E141D";
const OUTRO_AT = timeline.sections.outro[1] + 0.2;

export const Ep02Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.05, far: 50 }}>
        <World t={t} />
        <Finish frame={frame} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} focus={cam.dist} aperture={0.004} maxBlur={0.012} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Hud t={t} />
      </div>
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
