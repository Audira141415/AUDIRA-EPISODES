import React from "react";
import { Composition } from "remotion";
import { Cover } from "./Cover";
import { Film, FILM_SEC } from "./Film";

export const Root: React.FC = () => (
  <>
    <Composition id="Ep10Cover" component={Cover} durationInFrames={120} fps={60} width={1080} height={1920} />
    <Composition id="Ep10Final" component={Film} durationInFrames={Math.round(FILM_SEC * 60)} fps={60} width={1080} height={1920} />
  </>
);
