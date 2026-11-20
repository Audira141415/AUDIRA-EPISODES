// EP67 — Sejarah Borobudur: Candi Terlupakan · FAKTADUNIA · 95 s · 9:16
// Multi-Scene 5-Act Epic Architecture (Rule 00, 07, 09, 17, 19)

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { BorobudurScene } from "./BorobudurScene.tsx";
import { BorobudurOverlay } from "./BorobudurOverlay.tsx";
import { getBorobudurCamera } from "./BorobudurCamera.ts";
import { BSECONDS } from "./BorobudurMotion.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import words from "../../../public/audio/vo-words.json";

export const BOROBUDUR_SECONDS = BSECONDS;

export const BorobudurPreview: React.FC = () => <BorobudurFilm />;
export const BorobudurFinal: React.FC = () => <BorobudurFilm />;

const VO_OFFSET = 0;

function getAtmosphere(t: number) {
  if (t < 16) {
    // Act 1: Morning Kedu Valley
    return {
      bg: "#18231C",
      fogColor: "#223126",
      sunPos: [7, 8, 5] as [number, number, number],
      sunColor: "#FFE3B0",
      sunIntensity: 3.2,
      hemiSky: "#8BAECC",
      hemiGround: "#2E3B27",
    };
  }
  if (t < 43) {
    // Act 2: Sacred Mandala in Midday Sun
    return {
      bg: "#16202E",
      fogColor: "#1E2B3D",
      sunPos: [4, 12, 6] as [number, number, number],
      sunColor: "#FFF2D9",
      sunIntensity: 3.8,
      hemiSky: "#93BDE6",
      hemiGround: "#36322C",
    };
  }
  if (t < 58) {
    // Act 3: Dark Volcanic Eruption & Ash Rain
    return {
      bg: "#141012",
      fogColor: "#211617",
      sunPos: [0, 6, -10] as [number, number, number],
      sunColor: "#FF4500",
      sunIntensity: 2.2,
      hemiSky: "#3D2222",
      hemiGround: "#1A1515",
    };
  }
  if (t < 80) {
    // Act 4: Jungle Canopy & Restoration Sunbeams
    return {
      bg: "#162118",
      fogColor: "#1F2D21",
      sunPos: [6, 9, 4] as [number, number, number],
      sunColor: "#FFE9B8",
      sunIntensity: 3.4,
      hemiSky: "#7CA387",
      hemiGround: "#2B2822",
    };
  }
  // Act 5: Golden Sunrise Over Kedu Valley
  return {
    bg: "#241913",
    fogColor: "#3D281E",
    sunPos: [-8, 3.5, -7] as [number, number, number],
    sunColor: "#FFA23E",
    sunIntensity: 4.2,
    hemiSky: "#E6A86E",
    hemiGround: "#3A2B1E",
  };
}

const BorobudurFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const shot = getBorobudurCamera(t);
  const atmos = getAtmosphere(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={atmos.bg}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="sky"
      envIntensity={0.35}
      near={0.05}
      far={600}
      focus={shot.focus}
      aperture={0}
      maxBlur={0}
      overlay={() => (
        <>
          <BorobudurOverlay t={t} />
          <Subtitle words={words} frame={frame} fps={fps} offset={VO_OFFSET} />
          <AudiraOutro seconds={3} />
          <AudiraSignature seed="borobudur-ep67" handle="@AudiraFaktaDunia" />
        </>
      )}
    >
      <hemisphereLight args={[atmos.hemiSky, atmos.hemiGround, 0.7]} />
      <directionalLight
        position={atmos.sunPos}
        intensity={atmos.sunIntensity}
        color={atmos.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.4} color="#8899B0" />
      <fog attach="fog" args={[atmos.fogColor, 20, 180]} />
      <BorobudurScene t={t} />
    </FilmScene>
  );
};
