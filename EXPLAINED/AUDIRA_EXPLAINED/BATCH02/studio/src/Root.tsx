import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { AbsoluteFill } from "remotion";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP042 from "./scenes/ep042/index.ts";
import * as EP047 from "./scenes/ep047/index.ts";
import * as EP049 from "./scenes/ep049/index.ts";
import * as EP052 from "./scenes/ep052/index.ts";
import * as EP053 from "./scenes/ep053/index.ts";

// AUDIRA EXPLAINED Batch 2: each episode lives in src/scenes/epXXX and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = { Ep042: "ae-042-banjir-kiriman", Ep047: "ae-047-sinyal-hp-gedung", Ep049: "ae-049-kapal-baja", Ep052: "ae-052-jelantah-avtur", Ep053: "ae-053-lampu-merah-adaptif" };
// Film + moving AUDIRA signature as the last layer (anti-reupload, CLAUDE.md Branding Contract).
const signed = (name: string, Film: React.FC) => {
  const C: React.FC = () => (
    <AbsoluteFill>
      <Film />
      <AudiraSignature seed={SLUG[name]} outroSeconds={4.2} />
    </AbsoluteFill>
  );
  return C;
};
const EPS = [["Ep042", EP042], ["Ep047", EP047], ["Ep049", EP049], ["Ep052", EP052], ["Ep053", EP053]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Cover`} component={m.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
        <Composition id={`${name}Preview`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
