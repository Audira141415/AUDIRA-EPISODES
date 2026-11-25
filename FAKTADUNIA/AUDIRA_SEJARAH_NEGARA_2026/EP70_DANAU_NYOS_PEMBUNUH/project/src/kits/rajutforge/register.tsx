// Style 75: RAJUTFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { RajutforgeExample, RAJUTFORGE_EXAMPLE_SECONDS } from "./example/RajutforgeExample.tsx";

const { preview, final } = PRESETS;

export const RajutforgeCompositions: React.FC = () => (
  <>
    <Composition id="RajutforgePreview" component={RajutforgeExample} durationInFrames={RAJUTFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="RajutforgeFinal" component={RajutforgeExample} durationInFrames={RAJUTFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
  </>
);
