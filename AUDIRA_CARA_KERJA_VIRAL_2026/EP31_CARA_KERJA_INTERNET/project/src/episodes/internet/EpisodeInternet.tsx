import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../../core/hud/Subtitle.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { CIRCUIT_PALETTE } from "../../kits/circuitforge/lib/palette";
import { CircuitAtmosphere } from "../../kits/circuitforge/world/Atmosphere";
import { InternetWorld } from "./InternetWorld";
import { InternetOverlay } from "./InternetOverlay";
import { getInternetCameraPose, FILM_FPS, EPISODE_SECONDS } from "./rig";
import wordsRaw from "../../../public/audio/voiceover.json";

export { EPISODE_SECONDS };

const words = wordsRaw as unknown as WordTiming[];

export const EpisodeInternet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getInternetCameraPose(f);

  return (
    <>
      <FilmScene
        frame={frame}
        shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
        background={CIRCUIT_PALETTE.solderMaskDark}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        hdri="studio"
        ao
        near={0.1}
        far={200}
        overlay={() => <InternetOverlay f={f} />}
      >
        <KeyLight extent={12} keyPos={[-5, 14, 10]} keyIntensity={3.5} fill={0.68} rim="#00ff88" rimIntensity={0.45} />
        <CircuitAtmosphere />
        <InternetWorld f={f} />
      </FilmScene>

      <Subtitle words={words} frame={frame} fps={fps} offset={0} maxWords={6} size={52} activeColor="#ffffff" baseColor="rgba(255,255,255,0.78)" plate="rgba(0,0,0,0.94)" position={1180} />

      <Voiceover src="audio/vo.wav" offset={0} />

      <AudiraSignature seed="cara-kerja-internet-EP31" />
    </>
  );
};
