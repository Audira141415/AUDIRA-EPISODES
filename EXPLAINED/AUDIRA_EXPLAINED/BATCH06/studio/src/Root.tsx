import React from "react";
import { Composition, AbsoluteFill } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP065 from "./scenes/ep065/index.ts";
import * as EP066 from "./scenes/ep066/index.ts";
import * as EP069 from "./scenes/ep069/index.ts";
import * as EP071 from "./scenes/ep071/index.ts";
import * as EP073 from "./scenes/ep073/index.ts";

// AUDIRA EXPLAINED Batch 6: each episode lives in src/scenes/epXXX and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = { Ep065: "ae-065-jembatan-angkat", Ep066: "ae-066-menara-atc", Ep069: "ae-069-pengolahan-limbah", Ep071: "ae-071-gedung-tahan-api", Ep073: "ae-073-rumah-3d-print" };
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
const EPS = [["Ep065", EP065], ["Ep066", EP066], ["Ep069", EP069], ["Ep071", EP071], ["Ep073", EP073]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PeopleDemoPreview" component={PeopleDemo} durationInFrames={PEOPLE_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Cover`} component={m.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
        <Composition id={`${name}Preview`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
