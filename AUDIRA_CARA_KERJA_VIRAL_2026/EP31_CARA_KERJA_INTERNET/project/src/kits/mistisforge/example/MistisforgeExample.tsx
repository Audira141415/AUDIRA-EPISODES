import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { KampungNight3D } from "../scene/KampungNight3D";
import { PelitaLanterns3D } from "../scene/PelitaLanterns3D";
import { FogVeil3D } from "../scene/FogVeil3D";
import { getMistisCamera } from "../camera/rig";
import { MistisOverlay } from "../camera/Overlay";
import { MISTIS_PALETTE } from "../lib/palette";
import { computeMistisState } from "../core/motion";

export const MISTISFORGE_EXAMPLE_SECONDS = 12;

export const MistisforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const s = computeMistisState(f);
  const cam = getMistisCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={MISTIS_PALETTE.nightSky}
      profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
      ao={false}
      near={0.05}
      far={80}
      overlay={() => <MistisOverlay f={f} />}
    >
      <color attach="background" args={[MISTIS_PALETTE.nightSky]} />
      <fogExp2 attach="fog" args={[MISTIS_PALETTE.fogNight, 0.055]} />

      {/* cold moonlight from behind the house (rim) + sky/ground bounce */}
      <hemisphereLight args={["#5C7AA6", "#1A1610", 0.9 + s.moonSurge * 0.5]} />
      <directionalLight position={[-3, 9, -14]} intensity={1.6 + s.moonSurge * 1.4} color={MISTIS_PALETTE.moonlight} />
      <directionalLight position={[4, 5, 8]} intensity={0.25} color="#6F86A8" />

      <KampungNight3D f={f} />
      <PelitaLanterns3D f={f} />
      <FogVeil3D f={f} />
    </FilmScene>
  );
};
