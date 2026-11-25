// TERRARIUM technical example — 12 s macro orbit around a living glass-jar terrarium.
// Hook (0–2 s): sunlit jar on a table, refraction through curved glass. Development: midday condensation,
// droplets sliding down, pool ripples, the snail gliding. Payoff (~9.5–11 s): night falls, mushrooms glow,
// fireflies drift, camera reaches the snail at eye level.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { GlassJar3D } from "../scene/GlassJar3D";
import { JarGarden3D } from "../scene/JarGarden3D";
import { Snail3D } from "../scene/Snail3D";
import { getTerraCamera, leafPose } from "../camera/rig";
import { TerraOverlay } from "../camera/Overlay";
import { dayState } from "../core/motion";

export const TERRARIUM_EXAMPLE_SECONDS = 12;

export const TerrariumExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const day = dayState(t);
  const sky = `#${day.sky.getHexString()}`;
  const pose = getTerraCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={sky}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      ao
      near={0.05}
      far={80}
      overlay={() => <TerraOverlay t={t} height={1920} />}
    >
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 9, 26]} />
      <ambientLight intensity={day.amb} color={day.night > 0.5 ? "#9FB4FF" : "#FFF3E2"} />
      <hemisphereLight args={[day.sky, "#3A2A1C", 0.35 + 0.25 * (1 - day.night)]} />
      <directionalLight
        position={day.sunPos}
        intensity={day.sunI}
        color={day.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-4, 3, -4]} intensity={0.6} color="#CFE6FF" />
      <JarGarden3D t={t} />
      <Snail3D t={t} />
      <GlassJar3D t={t} leaf={leafPose(t)} />
    </FilmScene>
  );
};
