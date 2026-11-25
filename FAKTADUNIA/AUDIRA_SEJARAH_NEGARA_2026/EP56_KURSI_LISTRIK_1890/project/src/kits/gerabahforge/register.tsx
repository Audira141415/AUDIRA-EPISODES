// Style 77: GERABAHFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { GerabahforgeExample, GERABAHFORGE_EXAMPLE_SECONDS } from "./example/GerabahforgeExample.tsx";

const { preview, final } = PRESETS;

export const GerabahforgeCompositions: React.FC = () => (
  <>
    <Composition
      id="GerabahforgePreview"
      component={GerabahforgeExample}
      durationInFrames={GERABAHFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="GerabahforgeFinal"
      component={GerabahforgeExample}
      durationInFrames={GERABAHFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
  </>
);
