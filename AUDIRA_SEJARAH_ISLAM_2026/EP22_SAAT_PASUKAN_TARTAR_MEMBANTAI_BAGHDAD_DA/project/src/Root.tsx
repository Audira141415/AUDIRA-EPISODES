import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { BaghdadFilm } from "./scenes/baghdad/BaghdadFilm.tsx";
import { FILM_SECONDS } from "./scenes/baghdad/timing.ts";

const { preview, final } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="BaghdadPreview" component={BaghdadFilm} durationInFrames={Math.round(FILM_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} defaultProps={{ cover: false }} />
    <Composition id="BaghdadFinal" component={BaghdadFilm} durationInFrames={Math.round(FILM_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} defaultProps={{ cover: false }} />
    <Composition id="BaghdadCover" component={BaghdadFilm} durationInFrames={Math.round(FILM_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} defaultProps={{ cover: true }} />
  </>
);
