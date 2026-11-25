import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { TEXTVOYAGE_PALETTE } from "../lib/palette";
import { MonolithGateway as ObjectStage } from "../world/ObjectStage";
import { TextvoyageOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const TEXTVOYAGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

/**
 * TEXTVOYAGE example (Style #28): one steady flight down a corridor of titanium gates toward two
 * giant block-type words. Hook: the gold lintels stream past. Payoff (~6–8 s): the words fill the
 * frame as the last gate passes.
 *
 * Post: FilmScene's Finish chain (bloom on the emissive type, DOCUMENTARY_WARM grade, grain 0.006).
 * The titanium and gold are metallic, so the studio HDRI carries their reflections.
 */
export const TextvoyageExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, TEXTVOYAGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background="#101117"
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="studio"
      exposure={1.1}
      envIntensity={0.85}
      ao={false}
      near={0.05}
      far={80}
      overlay={() => <TextvoyageOverlay f={f} />}
    >
      <fog attach="fog" args={["#101117", 12, 46]} />
      {/* Cool overhead key down the corridor, warm gold glow from behind the words */}
      <KeyLight extent={8} keyPos={[4, 9, 6]} keyColor="#f4f1ea" keyIntensity={2.8} fill={0.55} rim={TEXTVOYAGE_PALETTE.coreAccentGold} rimIntensity={0.8} />
      <pointLight position={[0, 2.8, -14]} color="#C49A28" intensity={22} distance={28} />
      <ObjectStage f={f} />
    </FilmScene>
  );
};
