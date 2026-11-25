// BRICKCRAFT technical example (8 s): a stop-motion toy room assembled brick by brick.
// Runs on FilmScene with KeyLight and BrickAtmosphere for fog/ambient.
//
// Time runs on a 60 fps film clock, stepped to 15 fps for the stop-motion look.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ToyRoomStage } from "../world/ToyRoomStage";
import { BrickAtmosphere } from "../world/Atmosphere";
import { getBrickCamera } from "../camera/rig";
import { BrickOverlay } from "../camera/Overlay";
import { stepFrame, characterWalk } from "../core/motion";

export const BRICKCRAFT_EXAMPLE_SECONDS = 8;

export const BrickcraftExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Remotion 60 FPS normalized clock
  const f = (frame / fps) * 60;
  const totalF = (durationInFrames / fps) * 60;
  const progress = Math.min(1, Math.max(0, f / totalF));

  // Stepped stop-motion frame (15 FPS stepping = step of 4 frames at 60 FPS)
  const steppedF = stepFrame(f, 4);

  // Stepped character walking
  const walk = characterWalk(steppedF, 0.2);
  const characterX = (steppedF / 60) * 0.8 - 2.5;

  // Snapping bricks progress (starts at 2.0s, completes at 5.5s)
  const snapProgress = Math.max(0, Math.min(1, (f - 120) / 210));

  const cam = getBrickCamera(progress);

  const subtitleText =
    progress < 0.35
      ? "LANGKAH 01: MERAKIT PONDASI & KARAKTER TOY"
      : progress < 0.7
      ? "LANGKAH 02: BRICK SNAP KE STRUKTUR ATAP"
      : "HASIL AKHIR: DIORAMA TOY ROOM STOP-MOTION";

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background="#1e2124"
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="studio"
      exposure={0.9}
      envIntensity={0.6}
      ao
      overlay={() => (
        <BrickOverlay
          title="BRICKCRAFT 3D"
          subtitle={subtitleText}
          stepNumber={Math.floor(progress * 18) + 1}
        />
      )}
    >
      <KeyLight extent={4} keyPos={[-4, 6, 4]} keyIntensity={2.2} fill={0.6} />
      <BrickAtmosphere />
      <ToyRoomStage
        snapProgress={snapProgress}
        characterX={characterX}
        characterZ={1.5}
        leftLegAngle={walk.leftLegAngle}
        rightLegAngle={walk.rightLegAngle}
        leftArmAngle={walk.leftArmAngle}
        rightArmAngle={walk.rightArmAngle}
        bodyBob={walk.bodyBob}
      />
    </FilmScene>
  );
};
