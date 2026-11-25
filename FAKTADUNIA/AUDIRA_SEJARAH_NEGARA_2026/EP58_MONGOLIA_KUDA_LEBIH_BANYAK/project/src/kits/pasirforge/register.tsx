// Style 81: PASIRFORGE. RemotionRoot renders this component; it registers the kit's compositions.
import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "../../core/film/frame.ts";
import { PasirforgeExample, PASIRFORGE_EXAMPLE_SECONDS } from "./example/PasirforgeExample.tsx";

const { preview, final } = PRESETS;

export const PasirforgeCompositions: React.FC = () => (
  <>
    <Composition id="PasirforgePreview" component={PasirforgeExample} durationInFrames={PASIRFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PasirforgeFinal" component={PasirforgeExample} durationInFrames={PASIRFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
  </>
);
