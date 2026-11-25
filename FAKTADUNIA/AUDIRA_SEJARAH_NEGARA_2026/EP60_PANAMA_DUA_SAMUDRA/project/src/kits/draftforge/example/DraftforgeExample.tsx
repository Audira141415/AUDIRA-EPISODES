// DRAFTFORGE technical example — an 8-second architectural CAD blueprint & exploded view sequence.
// Features animated vector CAD drafting, orthographic-to-isometric camera tilt, 3D dimension callouts,
// turbine rotation, and mechanical exploded assembly alignment.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { DRAFT_PALETTE } from "../lib/palette";
import { DraftingTable } from "../world/DraftingTable";
import { CadModel } from "../world/CadModel";
import { CompassRose } from "../cad/CompassRose";
import { DraftOverlay } from "../camera/Overlay";
import { getDraftCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const DRAFTFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const DraftforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getDraftCameraPose(f, DRAFTFORGE_EXAMPLE_SECONDS * FILM_FPS);

  // CAD lines draw on during frames 0 to 120 (0 - 2s)
  const drawProgress = remap(f, 0, 110, 0, 1);

  // Exploded assembly separates during frames 260 to 380 (approx 4.3s - 6.3s)
  const explodeProgress = ease.draft(remap(f, 260, 380, 0, 1));

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={DRAFT_PALETTE.blueprintDark}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao={false}
      envIntensity={0}
      near={0.1}
      far={500}
      overlay={() => <DraftOverlay f={f} projectTitle="PROJECT: AEROSPACE TURBOJET MK-IV" sheetNo="01 / 04" />}
    >
      {/* Overhead drafting lamp — crisp shadows on the blueprint table */}
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.0} fill={0.5} />
      <ambientLight color={DRAFT_PALETTE.blueprintNavy} intensity={1.5} />
      <DraftingTable size={36} divisions={72} />
      <CompassRose radius={0.8} position={[4.0, -1.95, -4.0]} />
      <CadModel f={f} drawProgress={drawProgress} explodeProgress={explodeProgress} />
    </FilmScene>
  );
};
