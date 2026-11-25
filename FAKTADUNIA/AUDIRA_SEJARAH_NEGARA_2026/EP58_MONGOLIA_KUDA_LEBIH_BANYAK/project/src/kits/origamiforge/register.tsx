// Style 76: ORIGAMIFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { OrigamiforgeExample, ORIGAMIFORGE_EXAMPLE_SECONDS } from "./example/OrigamiforgeExample.tsx";

const { preview, final } = PRESETS;

export const OrigamiforgeCompositions: React.FC = () => (
  <>
    <Composition id="OrigamiforgePreview" component={OrigamiforgeExample} durationInFrames={ORIGAMIFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="OrigamiforgeFinal" component={OrigamiforgeExample} durationInFrames={ORIGAMIFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
  </>
);
