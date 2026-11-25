import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { AbsoluteFill } from "remotion";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP041 from "./scenes/ep041/index.ts";
import * as EP046 from "./scenes/ep046/index.ts";
import * as EP048 from "./scenes/ep048/index.ts";
import * as EP050 from "./scenes/ep050/index.ts";
import * as EP051 from "./scenes/ep051/index.ts";

// AUDIRA EXPLAINED Batch 3: each episode lives in src/scenes/epXXX and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = { Ep041: "ae-041-limbah-gedung-tinggi", Ep046: "ae-046-kabel-internet-bawah-laut", Ep048: "ae-048-pabrik-mobil", Ep050: "ae-050-koper-bandara", Ep051: "ae-051-kolam-renang-bersih" };
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
const EPS = [["Ep041", EP041], ["Ep046", EP046], ["Ep048", EP048], ["Ep050", EP050], ["Ep051", EP051]] as const;

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
