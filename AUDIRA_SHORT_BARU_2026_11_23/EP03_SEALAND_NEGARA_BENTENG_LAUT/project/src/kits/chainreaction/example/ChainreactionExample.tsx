// CHAINREACTION technical example (13 s): a Rube Goldberg chain reaction in a desk-lamp workshop.
// Runs on FilmScene with the kit's own workshop lighting (desk-lamp key, cool rim, warm point)
// and depth of field that follows the camera rig's focus distance.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { Workshop3D } from "../scene/Workshop3D";
import { Machine3D } from "../scene/Machine3D";
import { getChainCamera } from "../camera/rig";
import { ChainreactionOverlay } from "../camera/Overlay";
import { ChainTiming, FLAG_UP, filmTime, machineTime } from "../core/chain";
import { CHAINREACTION_PALETTE as P } from "../lib/palette";
import { win } from "../core/motion";

export const CHAINREACTION_EXAMPLE_SECONDS = 13;
/** Machine starts at 0.9 s and runs 1.15× slower than real time (weightier, still believable). */
const TIMING: ChainTiming = { start: 0.9, scale: 1.15 };

export const ChainreactionExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const m = machineTime(t, TIMING);
  const cam = getChainCamera(t, TIMING);
  const trailBoost = win(t, filmTime(FLAG_UP, TIMING) + 0.3, filmTime(FLAG_UP, TIMING) + 1.6);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.bg}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      exposure={0.95}
      envIntensity={0.45}
      ao
      near={0.03}
      far={40}
      focus={cam.focus}
      aperture={0.0012}
      maxBlur={0.005}
      overlay={() => <ChainreactionOverlay t={t} timing={TIMING} />}
    >
      <hemisphereLight args={["#FFE9CF", "#2A1C12", 0.35]} />
      {/* desk-lamp key from the front right, cool rim from the back left */}
      <directionalLight
        position={[2.4, 4.2, 3.2]}
        intensity={2.1}
        color={P.lamp}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.6}
        shadow-camera-right={2.8}
        shadow-camera-top={3.4}
        shadow-camera-bottom={-0.6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-2.5, 3.2, -1.6]} intensity={0.9} color={P.rim} />
      <pointLight position={[0.2, 3.1, 0.9]} intensity={1.4} distance={4} decay={2} color={P.lamp} />
      <Workshop3D />
      <Machine3D m={m} trailBoost={trailBoost} />
    </FilmScene>
  );
};
