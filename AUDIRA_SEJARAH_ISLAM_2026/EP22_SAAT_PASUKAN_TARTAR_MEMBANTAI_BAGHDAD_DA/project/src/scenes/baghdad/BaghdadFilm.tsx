// EP22 Saat pasukan Mongol menghancurkan Bagdad, 1258 (HISTORYMAP) — one war table, one continuous
// camera. No human figures, no explicit violence: city, banners, tents, a flood, smoke, scrolls,
// a rolled carpet, books. Every event reads CUE (VO words).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { City } from "./City.tsx";
import { CUE } from "./cues.ts";
import { Hud } from "./Hud.tsx";
import { poseAt } from "./rig.ts";
import { DawnRing, Flood, GateBanner, HamadanCamp, MongolLine, Pincers, Smoke, routeGrowAt } from "./Siege.tsx";
import { OUTRO_SECONDS, ss, within } from "./timing.ts";
import { CANDLE_LIGHT, CarpetTray, Dock, Letters, candleIntensity } from "./Trays.tsx";
import { LightRig, Route, Table } from "./World.tsx";

const BG = "#121822";

export const BaghdadFilm: React.FC<{ cover?: boolean }> = ({ cover = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = poseAt(t);
  const atLetter = within(t, 22.5, 36);
  const atCity = t < 25 || within(t, 33.5, 62) || t > 79;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <FilmScene
        frame={frame}
        shot={{ pos: pose.pos, target: pose.target, fov: pose.fov }}
        background={BG}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="warmStudio"
        envIntensity={0.55}
        exposure={1}
        ao={false}
        near={0.05}
        far={80}
        overlay={() => <Hud t={t} pose={pose} cover={cover} />}
      >
        <LightRig pose={pose} t={t} bg={BG} candle={atLetter ? CANDLE_LIGHT : null} candleI={candleIntensity(t)} />
        <Table north={t >= 80} />
        <Route grow={routeGrowAt(t)} glow={0.6 + 0.5 * ss(CUE.timur, CUE.timur + 0.7, t) * (1 - ss(24, 25, t))} />
        {atCity ? (
          <>
            <City t={t} />
            {t < 46 || t > 80 ? <MongolLine t={t} /> : null}
            {within(t, 34, 61) ? (
              <>
                <Pincers t={t} />
                <Flood t={t} />
                <GateBanner t={t} />
              </>
            ) : null}
            <Smoke t={t} />
            {t > 80 ? <DawnRing t={t} /> : null}
          </>
        ) : null}
        {within(t, 18, 34) ? <HamadanCamp t={t} /> : null}
        {atLetter ? <Letters t={t} /> : null}
        {within(t, 58.5, 70.5) ? <CarpetTray t={t} /> : null}
        {within(t, 67, 82) ? <Dock t={t} /> : null}
      </FilmScene>
      {cover ? null : (
        <>
          <Voiceover src="audio/vo.wav" offset={0} />
          <AudiraOutro seconds={OUTRO_SECONDS} code="QISSAH" />
          <Sequence from={7 * fps} layout="none">
            <AudiraSignature seed="baghdad-1258" code="QISSAH" outroSeconds={OUTRO_SECONDS} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};

