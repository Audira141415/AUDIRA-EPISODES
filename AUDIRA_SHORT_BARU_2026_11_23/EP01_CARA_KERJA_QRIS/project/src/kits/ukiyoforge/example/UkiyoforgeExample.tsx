import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PrintLayers3D } from "../scene/PrintLayers3D";
import { GreatCrest3D } from "../scene/GreatCrest3D";
import { getUkiyoCamera } from "../camera/rig";
import { UkiyoOverlay } from "../camera/Overlay";
import { UKIYO_PALETTE as P } from "../lib/palette";

export const UKIYOFORGE_EXAMPLE_SECONDS = 12;

export const UkiyoforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getUkiyoCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background={P.prussianDeep}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.85}
      envIntensity={0.25}
      ao={false}
      near={0.05}
      far={60}
      overlay={() => <UkiyoOverlay f={f} />}
    >
      <color attach="background" args={[P.prussianDeep]} />
      <ambientLight intensity={1.55} color="#FFF6E6" />
      <directionalLight
        position={[-3, 4, 12]}
        intensity={1.1}
        color="#FFF1DA"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      <PrintLayers3D f={f} />
      <GreatCrest3D f={f} />
    </FilmScene>
  );
};
