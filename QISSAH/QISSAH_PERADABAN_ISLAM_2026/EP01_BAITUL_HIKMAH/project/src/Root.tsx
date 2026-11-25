import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { BaitulHikmahShort, SHORT_SECONDS } from "./scenes/baitul-hikmah/Film.tsx";

const { preview, final } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BaitulHikmahPreview"
      component={BaitulHikmahShort}
      durationInFrames={Math.ceil(SHORT_SECONDS * preview.fps)}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="BaitulHikmahFinal"
      component={BaitulHikmahShort}
      durationInFrames={Math.ceil(SHORT_SECONDS * final.fps)}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
  </>
);
