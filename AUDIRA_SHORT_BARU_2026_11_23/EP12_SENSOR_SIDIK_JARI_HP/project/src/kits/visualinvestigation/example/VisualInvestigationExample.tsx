import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ForensicDesk3D } from "../scene/ForensicDesk3D";
import { CourtroomEvidenceBoard3D } from "../scene/CourtroomEvidenceBoard3D";
import { getVisualInvestigationCamera } from "../camera/rig";
import { VisualInvestigationOverlay } from "../camera/Overlay";
import { VISUALINVESTIGATION_PALETTE } from "../lib/palette";

export const VISUALINVESTIGATION_EXAMPLE_SECONDS = 12;

export const VisualInvestigationExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getVisualInvestigationCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={VISUALINVESTIGATION_PALETTE.deskVoid}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="studio"
      envIntensity={0.35}
      ao
      near={0.05}
      far={60}
      overlay={() => <VisualInvestigationOverlay f={f} />}
    >
      {/* Desk lamp key straight overhead-right, cool monitor spill from the left */}
      <KeyLight extent={4} keyPos={[2.5, 7, 2]} keyColor="#fff1d6" keyIntensity={2.4} fill={0.3} rim="#90CAF9" rimIntensity={0.6} />
      <spotLight position={[1.2, 3.2, 0.6]} angle={0.55} penumbra={0.8} intensity={14} distance={8} color="#ffe2b0" />
      <ForensicDesk3D f={f} />
      <CourtroomEvidenceBoard3D f={f} />
    </FilmScene>
  );
};
