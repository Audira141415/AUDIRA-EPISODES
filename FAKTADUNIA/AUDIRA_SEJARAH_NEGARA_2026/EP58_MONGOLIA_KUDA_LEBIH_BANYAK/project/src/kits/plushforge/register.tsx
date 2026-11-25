// Style 80: PLUSHFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { PlushforgeExample, PLUSHFORGE_EXAMPLE_SECONDS } from "./example/PlushforgeExample.tsx";

const { preview, final } = PRESETS;

export const PlushforgeCompositions: React.FC = () => (
  <>
    <Composition id="PlushforgePreview" component={PlushforgeExample} durationInFrames={PLUSHFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PlushforgeFinal" component={PlushforgeExample} durationInFrames={PLUSHFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
  </>
);
