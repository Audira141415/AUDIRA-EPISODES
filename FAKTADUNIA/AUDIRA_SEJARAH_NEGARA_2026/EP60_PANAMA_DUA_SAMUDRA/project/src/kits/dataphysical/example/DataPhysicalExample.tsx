import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { WalnutMeasurePlinth3D } from "../scene/WalnutMeasurePlinth3D";
import { StackedMetalColumns3D } from "../scene/StackedMetalColumns3D";
import { getDataPhysicalCamera } from "../camera/rig";
import { DataPhysicalOverlay } from "../camera/Overlay";
import { DATAPHYSICAL_PALETTE as C } from "../lib/palette";

export const DATAPHYSICAL_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * DATAPHYSICAL example (Style #37): a machined data sculpture on a walnut plinth.
 * Hook: aluminium columns rise one by one. Development: the teal acrylic benchmark settles and the
 * orange hero column stops under it. Payoff (~7.4–9.2 s): the hero breaks through the benchmark.
 *
 * Post: FilmScene's Finish chain (studio HDRI for the metal, AO, bloom, APPLE_STUDIO_CLEAN grade,
 * grain 0.003). The kit has no composer of its own.
 */
export const DataPhysicalExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getDataPhysicalCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.studioBackdrop}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      envIntensity={0.8}
      near={0.05}
      far={80}
      overlay={() => <DataPhysicalOverlay f={f} />}
    >
      {/* Soft-box key from front-left, cool rim from behind to separate metal from the dark studio */}
      <KeyLight extent={3} keyPos={[-3, 6, 4.5]} keyColor="#FFF4E2" keyIntensity={2.0} fill={0.35} rim="#9FC9FF" rimIntensity={1.2} />
      {/* Museum spot from above: a pool of light on the sculpture, the floor falls off into the dark room
          (look audit: the subject must be brighter than its surroundings) */}
      <spotLight position={[0.5, 7, 2.5]} angle={0.42} penumbra={0.7} intensity={70} distance={20} decay={1.3} color="#FFF6E8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* Fog in the studio colour hides the floor's far edge (no horizon seam) */}
      <fog attach="fog" args={[C.studioBackdrop, 18, 40]} />
      <WalnutMeasurePlinth3D f={f} />
      <StackedMetalColumns3D f={f} />
    </FilmScene>
  );
};
