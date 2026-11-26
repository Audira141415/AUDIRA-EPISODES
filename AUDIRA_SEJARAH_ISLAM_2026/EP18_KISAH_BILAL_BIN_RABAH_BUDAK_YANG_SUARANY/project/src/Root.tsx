import React from "react";
import { Composition, Still } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { Ep18Film, Ep18Cover, EP18_SECONDS } from "./ep18/Film.tsx";

const { preview, final } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep18Preview" component={Ep18Film} durationInFrames={Math.round(EP18_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep18Final" component={Ep18Film} durationInFrames={Math.round(EP18_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    <Still id="Ep18Cover" component={Ep18Cover} width={1080} height={1920} />
  </>
);
