import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { GeospatialTerrain3D } from "../scene/GeospatialTerrain3D";
import { OrbitalTargetReticle3D } from "../scene/OrbitalTargetReticle3D";
import { getSatelliteBriefingCamera } from "../camera/rig";
import { SatelliteBriefingOverlay } from "../camera/Overlay";
import { SATELLITEBRIEFING_PALETTE as C } from "../lib/palette";

export const SATELLITEBRIEFING_EXAMPLE_SECONDS = 12;

/**
 * SATELLITEBRIEFING example (Style #38): descent from high orbit to a tactical nadir view of a
 * strait, then a slow scan. Hook: the orbit drop. Development: amber reticles lock on three sites
 * while a vessel crosses the strait. Payoff (~8–11 s): the scan settles on TARGET ALPHA.
 *
 * Post: FilmScene's Finish chain (CYBER_NEON_VOID grade, grain 0.008). Assets: a radar mast and a
 * fishing vessel (AssetModel, desaturated tint, block fallbacks).
 */
export const SatelliteBriefingExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getSatelliteBriefingCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.spaceVoid}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.4}
      near={0.1}
      far={60}
      overlay={() => <SatelliteBriefingOverlay f={f} />}
    >
      {/* Low sun from the east: plateau tops lit, west faces in shade, long shadows on the water */}
      <KeyLight extent={3.5} keyPos={[6, 5, 2.5]} keyColor="#FFF4E0" keyIntensity={2.4} fill={0.22} rim="#90CAF9" rimIntensity={0.9} />
      <GeospatialTerrain3D f={f} />
      <OrbitalTargetReticle3D f={f} />
    </FilmScene>
  );
};
