import React from "react";
import { Composition, Still } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Ep09, Ep09Cover, EP09_SECONDS } from "./scenes/ep09/Ep09.tsx";

// EP09 Fosbury Flop 1968 (AUDIRA Sport Facts). Preview 540 × 960 @ 30, final 1080 × 1920 @ 60, cover still.
const { preview, final } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep09Preview" component={Ep09} durationInFrames={EP09_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep09Final" component={Ep09} durationInFrames={EP09_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Still id="Ep09Cover" component={Ep09Cover} width={final.width} height={final.height} />
  </>
);
