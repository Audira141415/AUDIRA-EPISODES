// EP04 Kenapa Gunung Meletus — AUDIRA Sains, DISASTERSIM (Remotion + R3F). Multi-scene director on the VO clock.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { cameraAt } from "../../core/camera/moves.ts";
import { Subtitle, type WordTiming } from "../../core/hud/Subtitle.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { SCENES } from "./Scenes";
import { GunungOverlay } from "./GunungOverlay";
import { cutDip, FILM_SECONDS, OUTRO_SECONDS, sceneAt } from "./timeline";
import wordsRaw from "../../../public/audio/vo-words.json";

export const GUNUNG_SECONDS = FILM_SECONDS;
const words = wordsRaw as unknown as WordTiming[];
const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const EpisodeGunung: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const sc = sceneAt(T);
  const def = SCENES[sc.id];
  const t = T - sc.start;
  const shot = cameraAt(def.rig, t * 60, 60, { lens: LENS, alive: true });
  const k = def.key;
  return (
    <AbsoluteFill>
      <FilmScene
        frame={frame}
        shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
        background={def.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        exposure={1}
        envIntensity={0.55}
        ao
        near={0.05}
        far={300}
        fade={cutDip(T)}
        fadeColor="#0B141C"
        overlay={() => <GunungOverlay T={T} />}
      >
        <KeyLight extent={14} keyPos={k.pos} keyColor={k.color} keyIntensity={k.intensity} fill={0.45} rim="#9CC8FF" rimIntensity={0.6} />
        <color attach="background" args={[def.bg]} />
        <fog attach="fog" args={[def.bg, def.fog[0], def.fog[1]]} />
        <ambientLight intensity={k.ambient} color="#DCEAF2" />
        <hemisphereLight args={[k.sky, k.ground, 0.5]} />
        <def.World key={sc.id} T={T} t={t} />
      </FilmScene>
      {T < FILM_SECONDS - OUTRO_SECONDS && (
        <Subtitle words={words} frame={frame} fps={fps} offset={0} maxWords={4} size={54} activeColor="#FFC14E" baseColor="rgba(255,255,255,0.9)" plate="rgba(8,16,22,0.82)" position={1300} />
      )}
      <Voiceover src="audio/vo.wav" offset={0} />
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="sains-anak-EP04-gunung" />
    </AbsoluteFill>
  );
};
