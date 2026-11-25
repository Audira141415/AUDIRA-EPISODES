import React from "react";
import { Composition, AbsoluteFill } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP060 from "./scenes/ep060/index.ts";
import * as EP063 from "./scenes/ep063/index.ts";
import * as EP064 from "./scenes/ep064/index.ts";
import * as EP067 from "./scenes/ep067/index.ts";
import * as EP068 from "./scenes/ep068/index.ts";

// AUDIRA EXPLAINED Batch 7: each episode lives in src/scenes/epXXX and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = {
  Ep060: "ae-060-dermaga-di-laut",
  Ep063: "ae-063-atap-stadion-tanpa-tiang",
  Ep064: "ae-064-bandara-lahan-lunak",
  Ep067: "ae-067-terowongan-air",
  Ep068: "ae-068-pipa-bawah-jalan",
};
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
const EPS = [["Ep060", EP060], ["Ep063", EP063], ["Ep064", EP064], ["Ep067", EP067], ["Ep068", EP068]] as const;

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
