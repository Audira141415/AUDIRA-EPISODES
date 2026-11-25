// RISOFORGE technical example (12 s): risograph-printed pop-up zine.
//
// FilmScene handles canvas, PoseCamera, font loading, and the opaque backdrop.
// The Scene child keeps R3F context for useRisoInks (halftone dot shader) and
// computeRisoState. Kit lights (ambient + shadow-casting directional) stay inline;
// FilmScene adds the studio HDRI for subtle paper reflections.

import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { computeRisoState } from "../core/motion";
import { getRisoCamera } from "../camera/rig";
import { RisoforgeOverlay } from "../camera/Overlay";
import { ZineSpread3D } from "../scene/ZineSpread3D";
import { PopupLayers3D } from "../scene/PopupLayers3D";
import { useRisoInks } from "../scene/inks";
import { RISO_PALETTE } from "../lib/palette";

export const RISOFORGE_EXAMPLE_SECONDS = 12;

/** Sets camera up-vector for the angled zine view; position/fov handled by FilmScene. */
const UpVector: React.FC<{ up: readonly [number, number, number] }> = ({ up }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.up.set(...up).normalize();
    camera.updateMatrixWorld();
  }, [camera, up]);
  return null;
};

const SceneContent: React.FC<{ f: number; dotPx: number; up: readonly [number, number, number] }> = ({ f, dotPx, up }) => {
  const inks = useRisoInks(dotPx);
  const s = computeRisoState(f);
  return (
    <>
      <UpVector up={up} />
      <ambientLight intensity={1.25} color="#FFF6E8" />
      <directionalLight
        position={[3.5, 8, 9]}
        intensity={1.35}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={8}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <ZineSpread3D s={s} inks={inks} />
      <PopupLayers3D s={s} inks={inks} />
    </>
  );
};

export const RisoforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  // halftone + grain scale with output height so preview and final print alike
  const dotPx = Math.max(3, Math.round((9 * height) / 1920));
  const cam = getRisoCamera(f);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background={RISO_PALETTE.wall}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.9}
      envIntensity={0.25}
      near={0.05}
      far={80}
      overlay={() => <RisoforgeOverlay f={f} width={width} height={height} />}
    >
      <SceneContent f={f} dotPx={dotPx} up={cam.up as [number, number, number]} />
    </FilmScene>
  );
};
