// Style 78: PAINTERLY. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { PainterlyExample, PAINTERLY_EXAMPLE_SECONDS } from "./example/PainterlyExample.tsx";

const { preview, final } = PRESETS;

export const PainterlyCompositions: React.FC = () => (
  <>
    <Composition id="PainterlyPreview" component={PainterlyExample} durationInFrames={PAINTERLY_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PainterlyFinal" component={PainterlyExample} durationInFrames={PAINTERLY_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
  </>
);
