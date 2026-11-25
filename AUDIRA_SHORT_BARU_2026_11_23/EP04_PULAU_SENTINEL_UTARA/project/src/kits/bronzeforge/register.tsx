// Style 79: BRONZEFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { BronzeforgeExample, BRONZEFORGE_EXAMPLE_SECONDS } from "./example/BronzeforgeExample.tsx";

const { preview, final } = PRESETS;

export const BronzeforgeCompositions: React.FC = () => (
  <>
    <Composition
      id="BronzeforgePreview"
      component={BronzeforgeExample}
      durationInFrames={BRONZEFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="BronzeforgeFinal"
      component={BronzeforgeExample}
      durationInFrames={BRONZEFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
  </>
);
