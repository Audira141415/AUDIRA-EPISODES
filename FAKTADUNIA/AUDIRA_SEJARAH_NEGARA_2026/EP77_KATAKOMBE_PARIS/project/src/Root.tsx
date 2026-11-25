import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { KatakombeFilm, FILM_SECONDS } from "./episode/KatakombeFilm.tsx";

// EP77 Katakombe Paris: preview (540 × 960 @ 30, draft stills) and final (1080 × 1920 @ 60).
const { preview, final } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="KatakombePreview" component={KatakombeFilm} durationInFrames={Math.round(FILM_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="KatakombeFinal" component={KatakombeFilm} durationInFrames={Math.round(FILM_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
  </>
);
