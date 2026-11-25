import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import * as EP02 from "./scenes/ep02/index.ts";
import * as EP03 from "./scenes/ep03/index.ts";
import * as EP04 from "./scenes/ep04/index.ts";
import * as EP05 from "./scenes/ep05/index.ts";
import * as EP06 from "./scenes/ep06/index.ts";

// Cerita Hikmah series: each episode lives in src/scenes/epXX and exports Film + TOTAL_SECONDS.
// Preview 540x960 @ 30 for approval, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const EPS = [["Ep02", EP02], ["Ep03", EP03], ["Ep04", EP04], ["Ep05", EP05], ["Ep06", EP06]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Preview`} component={m.Film} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={m.Film} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
