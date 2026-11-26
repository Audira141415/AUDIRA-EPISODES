// EP19 Ketika Khalid bin Walid memilih mundur (HISTORYMAP) — one war table, one continuous camera.
// No human figures: banners, horses, camels, tents, swords, a book. Every event reads CUE (VO words).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { Book, CANDLE_LIGHT, candleIntensity } from "./Book.tsx";
import { Hud } from "./Hud.tsx";
import { Caravan, Column, Enemy, Finale, MutahBanners, TurnArrow } from "./Mutah.tsx";
import { Madinah, Syria } from "./Places.tsx";
import { poseAt } from "./rig.ts";
import { Swords } from "./Swords.tsx";
import { OUTRO_SECONDS, lin, ss, within } from "./timing.ts";
import { LightRig, Route, Table } from "./World.tsx";

const BG = "#121822";

export const KhalidFilm: React.FC<{ cover?: boolean }> = ({ cover = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = poseAt(t);
  const atMutah = t < 17.5 || within(t, 41, 56) || t > 77;
  const atBook = within(t, 15.5, 31.5);
  const atSand = within(t, 28.5, 43.5);
  const dust = ss(46, 47.5, t) * (1 - ss(51, 52.4, t));
  const routeGrow = lin(8, 12, t);
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
        <LightRig pose={pose} t={t} bg={BG} candle={atBook ? CANDLE_LIGHT : null} candleI={candleIntensity(t)} />
        <Table north={t >= 52} />
        <Route grow={routeGrow} glow={0.6 + 0.5 * ss(42, 43, t) * (1 - ss(54, 56, t))} />
        <Madinah />
        <Syria t={t} />
        {atMutah ? (
          <>
            {t < 41 || t > 77 ? <MutahBanners t={t} /> : null}
            {within(t, 14, 17.5) || within(t, 41, 56) ? <Enemy t={t} dust={dust} /> : null}
            {within(t, 8, 17.5) ? <Caravan t={t} /> : null}
            <TurnArrow t={t} />
            {t > 77 ? <Finale t={t} /> : null}
          </>
        ) : null}
        {within(t, 41, 62) ? <Column t={t} /> : null}
        {atBook ? <Book t={t} /> : null}
        {atSand ? <Swords t={t} /> : null}
      </FilmScene>
      {cover ? null : (
        <>
          <Voiceover src="audio/vo.wav" offset={0} />
          <AudiraOutro seconds={OUTRO_SECONDS} code="QISSAH" />
          <Sequence from={7 * fps} layout="none">
            <AudiraSignature seed="ep19-khalid-mundur" code="QISSAH" outroSeconds={OUTRO_SECONDS} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
