// EP05 "Asap Tak Kenal Batas" — full film (HISTORYMAP). 3D map table + HUD layer + AUDIRA outro card.
// Silent composition: VO, music and SFX are muxed by the lead.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { PAL } from "./filmWorld.ts";
import { FilmScene } from "./FilmScene.tsx";
import { FilmHud } from "./FilmHud.tsx";
import { OUTRO_CARD } from "./time.ts";

export const Ep05Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      <Stage3D background={PAL.table} overlay={() => <FilmHud t={t} />}>
        <FilmScene frame={frame} t={t} />
      </Stage3D>
      <Outro start={OUTRO_CARD} />
    </>
  );
};
